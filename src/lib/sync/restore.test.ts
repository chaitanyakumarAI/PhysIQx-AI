import { describe, expect, it } from "vitest";
import { finishedSessionSchema } from "@/features/session/lib/sessionSchema";
import { summarize } from "@/features/session/lib/summarize";
import { toWorkoutPayload } from "@/features/session/lib/workoutPayload";
import { DEFAULT_USER_PREFERENCES, useProfileStore } from "@/store/profileStore";
import { makeCardio } from "@/test/fixtures";
import type { UserPlan } from "@/types/plan";
import type { WorkoutSession } from "@/types/workoutSession";
import {
  ledgerCursorsSchema,
  mergeLedger,
  nextCursors,
  profilePatch,
  summaryFromRow,
  type CardioRow,
  type LedgerPage,
  type LocalLedger,
  type PlanRow,
  type ServerProfile,
  type SessionRow,
  type WeighInRow,
} from "./restore";

/** Postgres renders timestamps in JSON like this — microseconds, +00:00. */
const pg = (iso: string) => iso.replace("Z", "000+00:00");
const AT = pg("2026-10-23T12:00:00.000Z");
const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

const set = (setNumber: number, weight: number | null, reps: number | null, rpe: number | null = null, completed = true) => ({
  id: `s${setNumber}`, setNumber, targetReps: 10, weight, reps, rpe, completed,
});

const session: WorkoutSession = {
  id: "session-push-1",
  missionId: "mission-push",
  title: "Push Day",
  status: "completed",
  startedAt: "2026-10-22T18:00:00.000Z",
  completedAt: "2026-10-22T18:52:30.000Z",
  xpReward: 300,
  exercises: [
    { exerciseId: "bench", exerciseName: "Bench Press", restSeconds: 90, suggest: null, sets: [set(1, 60, 10, 7), set(2, 80, 5, 9), set(3, 80, 6), set(4, 90, 0), set(5, 100, 1, null, false)] },
    { exerciseId: "dips", exerciseName: "Dips", restSeconds: 60, suggest: null, sets: [set(1, 0, 12)] },
  ],
};

/** What get_ledger_changes returns for a workout saved through 006. */
function sessionRow(source: WorkoutSession, n = 1): SessionRow {
  const payload = toWorkoutPayload(finishedSessionSchema.parse(source), source.completedAt!);
  return {
    id: uuid(n),
    client_ref: payload.client_ref,
    template_id: payload.template_id,
    template_name: payload.template_name,
    status: payload.status,
    started_at: pg(payload.started_at),
    completed_at: pg(payload.completed_at),
    total_volume_kg: payload.total_volume_kg,
    xp_earned: payload.xp_earned,
    updated_at: AT,
    exercises: payload.exercises.map((exercise, index) => ({
      exercise_id: exercise.exercise_id,
      exercise_name: exercise.exercise_name,
      order_index: index,
      sets: exercise.sets.map(({ set_number, weight_kg, reps, rpe }) => ({ set_number, weight_kg, reps, rpe })),
    })),
  };
}

const cardioRow = (clientRef: string, overrides: Partial<CardioRow> = {}): CardioRow => ({
  id: uuid(100),
  client_ref: clientRef,
  source: "gpx",
  external_id: clientRef.split(":")[1] ?? null,
  activity_type: "run",
  started_at: pg("2026-10-21T06:30:00.000Z"),
  duration_minutes: 32,
  distance_km: 6.2,
  avg_heart_rate: 151,
  max_heart_rate: null,
  calories_burned: null,
  synced_at: AT,
  deleted_at: null,
  updated_at: AT,
  ...overrides,
});

const weighInRow = (date: string, weightKg: number, deleted = false): WeighInRow => ({
  id: uuid(200), date, weight_kg: weightKg, deleted_at: deleted ? AT : null, updated_at: AT,
});

const plan = (id: string, name = id): UserPlan => ({ id, name, days: [] });
const planRow = (value: UserPlan, deleted = false): PlanRow => ({
  id: uuid(300), client_ref: value.id, payload: value, deleted_at: deleted ? AT : null, updated_at: AT,
});

const page = (overrides: Partial<LedgerPage> = {}): LedgerPage => ({
  sessions: [],
  cardio: [],
  weigh_ins: [],
  plans: [],
  has_more: { sessions: false, cardio: false, weigh_ins: false, plans: false },
  profile: null,
  server_time: pg("2026-10-23T12:05:00.000Z"),
  ...overrides,
});

const empty: LocalLedger = { history: [], activities: [], weighIns: [], plans: [] };
const none = new Set<string>();

describe("summaryFromRow", () => {
  it("rebuilds exactly the summary the device made", () => {
    const original = summarize(session, session.completedAt!, "completed");
    expect(summaryFromRow(sessionRow(session))).toEqual(original);
  });

  it("keeps an abandoned workout's status and XP", () => {
    const abandoned = { ...session, status: "abandoned" as const };
    expect(summaryFromRow(sessionRow(abandoned))).toEqual(summarize(abandoned, session.completedAt!, "abandoned"));
  });

  it("skips rows that aren't finished workouts", () => {
    expect(summaryFromRow({ ...sessionRow(session), status: "active" })).toBeNull();
    expect(summaryFromRow({ ...sessionRow(session), completed_at: null })).toBeNull();
  });
});

describe("mergeLedger", () => {
  it("adds missing workouts in date order and keeps the device's own copy", () => {
    const earlier = { ...session, id: "session-legs-0", startedAt: "2026-10-20T18:00:00.000Z", completedAt: "2026-10-20T19:00:00.000Z" };
    const local = { ...empty, history: [summarize(session, session.completedAt!, "completed")] };
    const merged = mergeLedger(local, page({ sessions: [sessionRow(session, 1), sessionRow(earlier, 2)] }), none);
    expect(merged.history.map((entry) => entry.id)).toEqual(["session-legs-0", "session-push-1"]);
    expect(merged.history[1]).toBe(local.history[0]);
    expect(merged.changes).toBe(1);
  });

  it("restores cardio, applies deletes, and lets pending changes win", () => {
    const kept = makeCardio("2026-10-20", 41.5, "cycle", { id: "gpx:kept" });
    const gone = makeCardio("2026-10-19", 20, "walk", { id: "gpx:gone" });
    const reimported = makeCardio("2026-10-18", 25, "run", { id: "gpx:again" });
    const local = { ...empty, activities: [kept, gone, reimported] };
    const merged = mergeLedger(
      local,
      page({
        cardio: [
          cardioRow("gpx:kept", { duration_minutes: 42 }),
          cardioRow("gpx:gone", { deleted_at: AT }),
          cardioRow("gpx:again", { deleted_at: AT }),
          cardioRow("gpx:new"),
        ],
      }),
      new Set(["cardio:gpx:again"]),
    );
    expect(merged.activities.map((activity) => activity.id).sort()).toEqual(["gpx:again", "gpx:kept", "gpx:new"]);
    expect(merged.activities.find((activity) => activity.id === "gpx:kept")).toBe(kept); // original, not the rounded copy
    expect(merged.activities.find((activity) => activity.id === "gpx:new")).toMatchObject({
      type: "run",
      startedAt: "2026-10-21T06:30:00.000Z",
      durationMin: 32,
      distanceKm: 6.2,
      avgHeartRate: 151,
    });
    expect(merged.changes).toBe(2);
  });

  it("takes the server's weigh-ins unless this device's is still uploading", () => {
    const local = {
      ...empty,
      weighIns: [
        { date: "2026-10-20", weightKg: 82 },
        { date: "2026-10-21", weightKg: 81.6 },
        { date: "2026-10-22", weightKg: 81.4 },
      ],
    };
    const merged = mergeLedger(
      local,
      page({
        weigh_ins: [
          weighInRow("2026-10-20", 82.2),
          weighInRow("2026-10-21", 99),
          weighInRow("2026-10-22", 0, true),
          weighInRow("2026-10-19", 82.5),
        ],
      }),
      new Set(["weighIn:2026-10-21"]),
    );
    expect(merged.weighIns).toEqual([
      { date: "2026-10-19", weightKg: 82.5 },
      { date: "2026-10-20", weightKg: 82.2 },
      { date: "2026-10-21", weightKg: 81.6 },
    ]);
  });

  it("replaces, adds and deletes plans", () => {
    const local = { ...empty, plans: [plan("a"), plan("b"), plan("c")] };
    const merged = mergeLedger(
      local,
      page({ plans: [planRow(plan("a", "Renamed")), planRow(plan("b"), true), planRow(plan("d")), planRow(plan("c", "Other device"))] }),
      new Set(["plan:c"]),
    );
    expect(merged.plans.map((entry) => entry.name)).toEqual(["Renamed", "c", "d"]);
  });

  it("changes nothing when the server has nothing new", () => {
    const local = { ...empty, history: [summarize(session, session.completedAt!, "completed")] };
    const merged = mergeLedger(local, page({ sessions: [sessionRow(session)] }), none);
    expect(merged.changes).toBe(0);
    expect(merged.history).toBe(local.history);
  });
});

describe("profilePatch", () => {
  const local = useProfileStore.getState();
  const server: ServerProfile = {
    name: "Sam",
    goal: "bulk",
    experience_level: "intermediate",
    active_split: "ppl",
    session_frequency: null,
    goal_body_shape: null,
    training_days_per_week: 4,
    onboarding_completed_at: pg("2026-09-01T10:00:00.000Z"),
    sex: "female",
    birth_year: 1996,
    height_cm: 168,
    current_build: "not-a-build",
    active_plan_ref: "plan-1",
    settings: {
      preferences: { ...DEFAULT_USER_PREFERENCES, trackRpe: true },
      notificationPreferences: { "streak-risk": false },
      showcaseAchievementIds: ["first-workout"],
      avatarPresetId: "gen-z-girl",
    },
    client_updated_at: AT,
    updated_at: AT,
  };

  it("brings a new device up to date, ignoring invalid values", () => {
    const patch = profilePatch(local, null, new Set(["plan-1"]), server, false);
    expect(patch.profile).toEqual({
      displayName: "Sam",
      sex: "female",
      birthYear: 1996,
      heightCm: 168,
      onboardingProfile: {
        goal: "bulk",
        experienceLevel: "intermediate",
        activeSplit: "ppl",
        trainingDaysPerWeek: 4,
        completedAt: "2026-09-01T10:00:00.000Z",
      },
      preferences: { ...DEFAULT_USER_PREFERENCES, trackRpe: true },
      notificationPreferences: { "streak-risk": false },
      showcaseAchievementIds: ["first-workout"],
      avatarPresetId: "gen-z-girl",
    });
    expect(patch.activePlanId).toBe("plan-1");
  });

  it("with a change still uploading, only fills in what this device doesn't know", () => {
    const edited = { ...local, displayName: "Sammy", onboardingProfile: { goal: "cut" as const } };
    const patch = profilePatch(edited, "plan-2", new Set(["plan-1", "plan-2"]), server, true);
    expect(patch.profile).toMatchObject({ sex: "female", birthYear: 1996, heightCm: 168 });
    expect(patch.profile).not.toHaveProperty("displayName");
    expect(patch.profile).not.toHaveProperty("preferences");
    expect(patch.profile.onboardingProfile).toMatchObject({ goal: "cut", experienceLevel: "intermediate" });
    expect(patch.activePlanId).toBeUndefined();
  });

  it("never swaps an uploaded photo for a preset, or activates a missing plan", () => {
    const withPhoto = { ...local, avatarDataUrl: "data:image/png;base64,AAAA" };
    const patch = profilePatch(withPhoto, null, new Set(), server, false);
    expect(patch.profile).not.toHaveProperty("avatarPresetId");
    expect(patch.activePlanId).toBeUndefined();
  });
});

describe("nextCursors", () => {
  it("continues exactly after the last row mid-stream", () => {
    const rows = [sessionRow(session, 7)];
    const next = nextCursors({}, page({ sessions: rows, has_more: { sessions: true, cardio: false, weigh_ins: false, plans: false } }));
    expect(next.sessions).toEqual({ at: AT, id: uuid(7) });
  });

  it("parks a minute behind the server clock once caught up, and keeps quiet tables where they were", () => {
    const previous = { cardio: { at: pg("2026-10-01T00:00:00.000Z"), id: uuid(1) } };
    const next = nextCursors(previous, page({ sessions: [{ ...sessionRow(session), updated_at: pg("2026-10-23T12:04:30.000Z") }] }));
    expect(next.sessions).toEqual({ at: "2026-10-23T12:04:00.000Z", id: "00000000-0000-0000-0000-000000000000" });
    expect(next.cardio).toEqual(previous.cardio);
    expect(ledgerCursorsSchema.safeParse(next).success).toBe(true);
  });
});
