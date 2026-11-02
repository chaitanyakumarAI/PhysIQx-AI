import { z } from "zod";
import { profileSnapshotSchema, type ProfileState } from "@/features/profile/lib/profileSnapshot";
import { weighInSchema } from "@/features/profile/lib/weighInSchema";
import { summarize } from "@/features/session/lib/summarize";
import { cardioActivitySchema } from "@/lib/cardio/cardioSchema";
import { localIsoFromTimestamp } from "@/lib/dates";
import { userPlanSchema } from "@/lib/planSchema";
import { HISTORY_LIMIT } from "@/store/sessionStore";
import type { CardioActivity } from "@/types/cardio";
import type { WeighIn } from "@/types/ledger";
import type { UserPlan } from "@/types/plan";
import type { CompletedSessionSummary, WorkoutSession } from "@/types/workoutSession";

/**
 * Restore, the pure half: what `get_ledger_changes` (migration 007) returns,
 * how its rows become local records again, and how they merge into what the
 * device already has. No I/O — the browser wiring is pullClient.ts.
 *
 * Merge rules (docs/SYNC_RESTORE_PLAN.md §3.3):
 * - Anything still waiting in this device's outbox wins: it's newer.
 * - Workouts and cardio are append-only, so a copy already on the device is
 *   kept (it's the original; the server's is rounded). Missing ones are added.
 * - Weigh-ins, plans and the profile can change: the server's copy wins.
 * - Tombstones remove the local copy.
 */

export type LedgerTable = "sessions" | "cardio" | "weigh_ins" | "plans";
export const LEDGER_TABLES: LedgerTable[] = ["sessions", "cardio", "weigh_ins", "plans"];

/** A position in one table's change stream (keyset: updated_at, then id). */
export interface LedgerCursor {
  at: string;
  id: string;
}
export type LedgerCursors = Partial<Record<LedgerTable, LedgerCursor>>;

/** What a pull accepts as its starting point (Postgres timestamps keep microseconds). */
const ledgerCursorSchema = z.object({ at: z.iso.datetime({ offset: true }), id: z.guid() }).strict();
export const ledgerCursorsSchema = z
  .object({
    sessions: ledgerCursorSchema.optional(),
    cardio: ledgerCursorSchema.optional(),
    weigh_ins: ledgerCursorSchema.optional(),
    plans: ledgerCursorSchema.optional(),
  })
  .strict();

interface ChangeRow {
  id: string;
  updated_at: string;
}

export interface SessionRow extends ChangeRow {
  client_ref: string;
  template_id: string | null;
  template_name: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  total_volume_kg: number | null;
  xp_earned: number | null;
  exercises: {
    exercise_id: string;
    exercise_name: string;
    order_index: number;
    sets: { set_number: number; weight_kg: number | null; reps: number | null; rpe: number | null }[];
  }[];
}

export interface CardioRow extends ChangeRow {
  client_ref: string;
  source: string;
  external_id: string | null;
  activity_type: string;
  started_at: string;
  duration_minutes: number;
  distance_km: number | null;
  avg_heart_rate: number | null;
  max_heart_rate: number | null;
  calories_burned: number | null;
  synced_at: string;
  deleted_at: string | null;
}

export interface WeighInRow extends ChangeRow {
  date: string;
  weight_kg: number;
  deleted_at: string | null;
}

export interface PlanRow extends ChangeRow {
  client_ref: string;
  payload: unknown;
  deleted_at: string | null;
}

export interface ServerProfile {
  name: string | null;
  goal: string | null;
  experience_level: string | null;
  active_split: string | null;
  session_frequency: string | null;
  goal_body_shape: string | null;
  training_days_per_week: number | null;
  onboarding_completed_at: string | null;
  sex: string | null;
  birth_year: number | null;
  height_cm: number | null;
  current_build: string | null;
  active_plan_ref: string | null;
  settings: unknown;
  client_updated_at: string | null;
  updated_at: string | null;
}

export interface LedgerPage {
  sessions: SessionRow[];
  cardio: CardioRow[];
  weigh_ins: WeighInRow[];
  plans: PlanRow[];
  has_more: Record<LedgerTable, boolean>;
  profile: ServerProfile | null;
  server_time: string;
}

// --- Rows → local records ----------------------------------------------------

const isTimestamp = (value: string | null | undefined): value is string =>
  typeof value === "string" && !Number.isNaN(Date.parse(value));
const optionalNumber = (value: number | null | undefined) =>
  value === null || value === undefined ? undefined : Number(value);

/**
 * Rebuilds a workout's ledger summary from its stored sets, through the same
 * `summarize` the device used — so top sets, volume, average RPE, duration
 * and the local calendar day come out identical to the original.
 */
export function summaryFromRow(row: SessionRow): CompletedSessionSummary | null {
  if (!row.client_ref || !isTimestamp(row.started_at) || !isTimestamp(row.completed_at)) return null;
  if (row.status !== "completed" && row.status !== "abandoned") return null;
  const completedAt = new Date(row.completed_at).toISOString();
  const session: WorkoutSession = {
    id: row.client_ref,
    missionId: row.template_id ?? "",
    title: row.template_name,
    status: row.status,
    startedAt: row.started_at,
    completedAt,
    xpReward: 0,
    exercises: [...(row.exercises ?? [])]
      .sort((a, b) => a.order_index - b.order_index)
      .map((exercise) => ({
        exerciseId: exercise.exercise_id,
        exerciseName: exercise.exercise_name,
        restSeconds: 0,
        suggest: null,
        sets: [...(exercise.sets ?? [])]
          .sort((a, b) => a.set_number - b.set_number)
          .map((set) => ({
            id: `${row.client_ref}-${exercise.order_index}-${set.set_number}`,
            setNumber: set.set_number,
            targetReps: Number(set.reps) || 0,
            weight: optionalNumber(set.weight_kg) ?? null,
            reps: optionalNumber(set.reps) ?? null,
            rpe: optionalNumber(set.rpe) ?? null,
            completed: true,
          })),
      })),
  };
  // XP isn't derivable from stored sets (it needs the planned set count).
  return {
    ...summarize(session, completedAt, row.status),
    xpEarned: Math.max(0, Math.round(Number(row.xp_earned) || 0)),
  };
}

export function activityFromRow(row: CardioRow): CardioActivity | null {
  if (!isTimestamp(row.started_at) || !isTimestamp(row.synced_at)) return null;
  const parsed = cardioActivitySchema.safeParse({
    id: row.client_ref,
    source: row.source,
    externalId: row.external_id ?? undefined,
    type: row.activity_type,
    startedAt: new Date(row.started_at).toISOString(),
    date: localIsoFromTimestamp(row.started_at),
    durationMin: Number(row.duration_minutes),
    distanceKm: optionalNumber(row.distance_km),
    avgHeartRate: optionalNumber(row.avg_heart_rate),
    maxHeartRate: optionalNumber(row.max_heart_rate),
    calories: optionalNumber(row.calories_burned),
    importedAt: new Date(row.synced_at).toISOString(),
  });
  return parsed.success ? parsed.data : null;
}

export function weighInFromRow(row: WeighInRow): WeighIn | null {
  const parsed = weighInSchema.safeParse({ date: row.date, weightKg: Number(row.weight_kg) });
  return parsed.success ? parsed.data : null;
}

export function planFromRow(row: PlanRow): UserPlan | null {
  const parsed = userPlanSchema.safeParse(row.payload);
  return parsed.success && parsed.data.id === row.client_ref ? parsed.data : null;
}

// --- Merge -------------------------------------------------------------------

export interface LocalLedger {
  history: CompletedSessionSummary[];
  activities: CardioActivity[];
  weighIns: WeighIn[];
  plans: UserPlan[];
}

export interface MergeResult extends LocalLedger {
  /** Records added, replaced or removed. */
  changes: number;
}

/** `pending`: the outbox keys still waiting on this device (outboxKey). */
export function mergeLedger(local: LocalLedger, page: LedgerPage, pending: ReadonlySet<string>): MergeResult {
  let changes = 0;

  // Workouts: append-only — add what's missing.
  const knownWorkouts = new Set(local.history.map((entry) => entry.id));
  const restored: CompletedSessionSummary[] = [];
  for (const row of page.sessions) {
    if (knownWorkouts.has(row.client_ref)) continue;
    const summary = summaryFromRow(row);
    if (!summary) continue;
    knownWorkouts.add(summary.id);
    restored.push(summary);
  }
  changes += restored.length;
  const history = restored.length
    ? [...local.history, ...restored]
        .sort((a, b) => Date.parse(a.completedAt) - Date.parse(b.completedAt))
        .slice(-HISTORY_LIMIT)
    : local.history;

  // Cardio: append-only, but deletes travel.
  const activitiesById = new Map(local.activities.map((activity) => [activity.id, activity]));
  let cardioChanged = false;
  for (const row of page.cardio) {
    if (pending.has(`cardio:${row.client_ref}`)) continue;
    if (row.deleted_at) {
      if (activitiesById.delete(row.client_ref)) {
        cardioChanged = true;
        changes += 1;
      }
      continue;
    }
    if (activitiesById.has(row.client_ref)) continue;
    const activity = activityFromRow(row);
    if (!activity) continue;
    activitiesById.set(activity.id, activity);
    cardioChanged = true;
    changes += 1;
  }
  const activities = cardioChanged
    ? [...activitiesById.values()].sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    : local.activities;

  // Weigh-ins: one per day; the server's copy wins.
  const weighInsByDate = new Map(local.weighIns.map((weighIn) => [weighIn.date, weighIn]));
  let weighInsChanged = false;
  for (const row of page.weigh_ins) {
    if (pending.has(`weighIn:${row.date}`)) continue;
    if (row.deleted_at) {
      if (weighInsByDate.delete(row.date)) {
        weighInsChanged = true;
        changes += 1;
      }
      continue;
    }
    const weighIn = weighInFromRow(row);
    if (!weighIn || weighInsByDate.get(weighIn.date)?.weightKg === weighIn.weightKg) continue;
    weighInsByDate.set(weighIn.date, weighIn);
    weighInsChanged = true;
    changes += 1;
  }
  const weighIns = weighInsChanged
    ? [...weighInsByDate.values()].sort((a, b) => a.date.localeCompare(b.date))
    : local.weighIns;

  // Plans: the server's copy wins.
  let plans = local.plans;
  for (const row of page.plans) {
    if (pending.has(`plan:${row.client_ref}`)) continue;
    const index = plans.findIndex((plan) => plan.id === row.client_ref);
    if (row.deleted_at) {
      if (index >= 0) {
        plans = plans.filter((plan) => plan.id !== row.client_ref);
        changes += 1;
      }
      continue;
    }
    const plan = planFromRow(row);
    if (!plan || (index >= 0 && JSON.stringify(plans[index]) === JSON.stringify(plan))) continue;
    plans = index >= 0 ? plans.map((existing, at) => (at === index ? plan : existing)) : [...plans, plan];
    changes += 1;
  }

  return { history, activities, weighIns, plans, changes };
}

// --- Profile -----------------------------------------------------------------

export type RestoredProfileFields = Pick<
  ProfileState,
  | "displayName"
  | "sex"
  | "birthYear"
  | "heightCm"
  | "currentBuild"
  | "onboardingProfile"
  | "preferences"
  | "notificationPreferences"
  | "privacyPreferences"
  | "showcaseAchievementIds"
  | "avatarPresetId"
  | "avatarDataUrl"
>;

export interface ProfilePatch {
  profile: Partial<RestoredProfileFields>;
  /** Set when the active plan should change. */
  activePlanId?: string;
}

const snapshotShape = profileSnapshotSchema.shape;
const onboardingShape = snapshotShape.onboarding.unwrap().shape;

/** The value if it's valid for `schema`, else null (never trust a column blindly). */
function valid<S extends z.ZodType>(schema: S, value: unknown): z.output<S> | null {
  if (value === null || value === undefined) return null;
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * What the server's profile changes on this device. With nothing pending,
 * the server's copy wins wherever it knows a value. With a change of this
 * device's still waiting to upload, that change wins — the server only fills
 * in what this device doesn't know yet (a guest who signs in on a new phone
 * still gets their name and body details back).
 */
export function profilePatch(
  local: RestoredProfileFields,
  localActivePlanId: string | null,
  planIds: ReadonlySet<string>,
  server: ServerProfile | null,
  pendingLocalChange: boolean,
): ProfilePatch {
  const patch: ProfilePatch = { profile: {} };
  if (!server) return patch;
  const take = <K extends keyof RestoredProfileFields>(key: K, value: RestoredProfileFields[K] | null) => {
    if (value === null || same(value, local[key])) return;
    if (pendingLocalChange && local[key] !== null) return;
    patch.profile[key] = value;
  };

  take("displayName", valid(snapshotShape.displayName, server.name));
  take("sex", valid(snapshotShape.sex, server.sex));
  take("birthYear", valid(snapshotShape.birthYear, server.birth_year));
  take("heightCm", valid(snapshotShape.heightCm, optionalNumber(server.height_cm)));
  take("currentBuild", valid(snapshotShape.currentBuild, server.current_build));

  const answers = Object.fromEntries(
    Object.entries({
      goal: valid(onboardingShape.goal, server.goal),
      experienceLevel: valid(onboardingShape.experienceLevel, server.experience_level),
      activeSplit: valid(onboardingShape.activeSplit, server.active_split),
      sessionFrequency: valid(onboardingShape.sessionFrequency, server.session_frequency),
      goalBodyShape: valid(onboardingShape.goalBodyShape, server.goal_body_shape),
      trainingDaysPerWeek: valid(onboardingShape.trainingDaysPerWeek, server.training_days_per_week),
      completedAt: isTimestamp(server.onboarding_completed_at)
        ? new Date(server.onboarding_completed_at).toISOString()
        : null,
    }).filter(([, value]) => value !== null),
  ) as NonNullable<RestoredProfileFields["onboardingProfile"]>;
  if (Object.keys(answers).length > 0) {
    // Pending: only answers this device doesn't have yet.
    const onboarding = pendingLocalChange
      ? { ...answers, ...local.onboardingProfile }
      : { ...local.onboardingProfile, ...answers };
    if (!same(onboarding, local.onboardingProfile)) patch.profile.onboardingProfile = onboarding;
  }

  const settings = valid(snapshotShape.settings, server.settings);
  if (settings && !pendingLocalChange) {
    if (!same(settings.preferences, local.preferences)) patch.profile.preferences = settings.preferences;
    if (!same(settings.notificationPreferences, local.notificationPreferences)) {
      patch.profile.notificationPreferences = settings.notificationPreferences;
    }
    if (settings.privacyPreferences && !same(settings.privacyPreferences, local.privacyPreferences)) {
      patch.profile.privacyPreferences = settings.privacyPreferences;
    }
    if (!same(settings.showcaseAchievementIds, local.showcaseAchievementIds)) {
      patch.profile.showcaseAchievementIds = settings.showcaseAchievementIds;
    }
    // An uploaded photo isn't synced yet; a preset must not replace it.
    if (!local.avatarDataUrl && settings.avatarPresetId !== local.avatarPresetId) {
      patch.profile.avatarPresetId = settings.avatarPresetId;
    }
  }

  const activePlan = valid(snapshotShape.activePlanId, server.active_plan_ref);
  if (activePlan && planIds.has(activePlan) && activePlan !== localActivePlanId) {
    if (!pendingLocalChange || localActivePlanId === null) patch.activePlanId = activePlan;
  }
  return patch;
}

// --- Cursor ------------------------------------------------------------------

/** How far behind the server clock a finished pull parks its cursor. */
const OVERLAP_MS = 60_000;
const ZERO_ID = "00000000-0000-0000-0000-000000000000";

/**
 * Where the next pull starts. Mid-stream (more pages waiting) it's exactly
 * after the last row. Once caught up, it parks a minute behind the server
 * clock: a transaction that committed late with an earlier updated_at is
 * picked up next time, and re-reading a minute of rows is harmless (merges
 * are idempotent).
 */
export function nextCursors(previous: LedgerCursors, page: LedgerPage): LedgerCursors {
  const next: LedgerCursors = { ...previous };
  const horizon = Date.parse(page.server_time) - OVERLAP_MS;
  for (const table of LEDGER_TABLES) {
    const last = page[table].at(-1);
    if (!last) continue;
    const caughtUp = !page.has_more[table];
    next[table] =
      caughtUp && Number.isFinite(horizon) && Date.parse(last.updated_at) > horizon
        ? { at: new Date(horizon).toISOString(), id: ZERO_ID }
        : { at: last.updated_at, id: last.id };
  }
  return next;
}

export function hasMorePages(page: LedgerPage): boolean {
  return LEDGER_TABLES.some((table) => page.has_more[table]);
}
