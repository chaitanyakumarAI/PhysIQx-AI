import type { CardioActivity, CardioActivityType, CardioSource } from "@/types/cardio";
import { localIsoFromTimestamp } from "@/lib/dates";

/**
 * Cardio ingestion — every source (file import, platform sync) funnels its
 * activities through here, so the ledger stays clean no matter how many
 * places the same run arrives from:
 *
 * 1. Normalize + validate (no zero-minute, day-long, or future activities).
 * 2. Same source, same external id → update in place (re-syncs are safe).
 * 3. Different sources, same workout (starts within 10 min, durations
 *    within 20%) → one activity; the richer source wins and missing fields
 *    (heart rate, calories) are merged from the other.
 */

const MAX_DURATION_MIN = 24 * 60;
const SAME_WORKOUT_START_MS = 10 * 60_000;
const SAME_WORKOUT_DURATION_RATIO = 0.2;
/** Allowance for device clocks running slightly ahead. */
const FUTURE_SKEW_MS = 60 * 60_000;

/** Higher = more trusted / richer data for the same workout. */
const SOURCE_PRIORITY: Record<CardioSource, number> = {
  apple_health: 5,
  health_connect: 5,
  garmin: 5,
  strava: 4,
  tcx: 3,
  gpx: 2,
  manual: 1,
};

export interface IncomingActivity {
  source: CardioSource;
  externalId?: string;
  type: CardioActivityType;
  startedAt: string;
  durationMin: number;
  distanceKm?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  calories?: number;
}

export interface IngestResult {
  activities: CardioActivity[];
  /** Activities added or updated — what needs uploading. */
  changed: CardioActivity[];
  added: number;
  updated: number;
  /** Already present (same workout from this or another source). */
  duplicates: number;
  /** Failed validation (zero/absurd duration, bad or future date). */
  rejected: number;
}

const round1 = (value: number) => Math.round(value * 10) / 10;

function positive(value: number | undefined): number | undefined {
  return value !== undefined && Number.isFinite(value) && value > 0 ? value : undefined;
}

export function normalizeActivity(
  input: IncomingActivity,
  nowIso: string,
): CardioActivity | null {
  const started = Date.parse(input.startedAt);
  if (!Number.isFinite(started)) return null;
  if (started > Date.parse(nowIso) + FUTURE_SKEW_MS) return null;
  if (!Number.isFinite(input.durationMin)) return null;
  const durationMin = Math.round(input.durationMin * 10) / 10;
  if (durationMin < 1 || durationMin > MAX_DURATION_MIN) return null;

  const startedAt = new Date(started).toISOString();
  const externalId = input.externalId ?? startedAt;
  const distanceKm = positive(input.distanceKm);
  return {
    id: `${input.source}:${externalId}`,
    source: input.source,
    externalId,
    type: input.type,
    startedAt,
    date: localIsoFromTimestamp(startedAt),
    durationMin,
    distanceKm: distanceKm === undefined ? undefined : round1(distanceKm),
    avgHeartRate: positive(input.avgHeartRate) && Math.round(input.avgHeartRate!),
    maxHeartRate: positive(input.maxHeartRate) && Math.round(input.maxHeartRate!),
    calories: positive(input.calories) && Math.round(input.calories!),
    importedAt: nowIso,
  };
}

function sameWorkout(a: CardioActivity, b: CardioActivity): boolean {
  const startGap = Math.abs(Date.parse(a.startedAt) - Date.parse(b.startedAt));
  if (startGap > SAME_WORKOUT_START_MS) return false;
  const longer = Math.max(a.durationMin, b.durationMin);
  const durationGap = Math.abs(a.durationMin - b.durationMin) / longer;
  if (durationGap > SAME_WORKOUT_DURATION_RATIO) return false;
  return a.type === b.type || a.type === "other" || b.type === "other";
}

/** `winner`'s record, with any fields only `other` knows filled in. */
function merge(winner: CardioActivity, other: CardioActivity): CardioActivity {
  return {
    ...winner,
    distanceKm: winner.distanceKm ?? other.distanceKm,
    avgHeartRate: winner.avgHeartRate ?? other.avgHeartRate,
    maxHeartRate: winner.maxHeartRate ?? other.maxHeartRate,
    calories: winner.calories ?? other.calories,
    type: winner.type === "other" ? other.type : winner.type,
  };
}

/** Folds `incoming` into `existing`; returns the new list (newest first). */
export function ingestActivities(
  existing: CardioActivity[],
  incoming: IncomingActivity[],
  nowIso: string,
): IngestResult {
  const activities = [...existing];
  const changedIds = new Set<string>();
  let added = 0;
  let updated = 0;
  let duplicates = 0;
  let rejected = 0;

  for (const raw of incoming) {
    const activity = normalizeActivity(raw, nowIso);
    if (!activity) {
      rejected += 1;
      continue;
    }

    const sameId = activities.findIndex((entry) => entry.id === activity.id);
    if (sameId >= 0) {
      const previous = activities[sameId]!;
      const next = { ...merge(activity, previous), importedAt: previous.importedAt };
      if (JSON.stringify(next) === JSON.stringify(previous)) {
        duplicates += 1;
      } else {
        activities[sameId] = next;
        changedIds.add(next.id);
        updated += 1;
      }
      continue;
    }

    const overlap = activities.findIndex((entry) => sameWorkout(entry, activity));
    if (overlap >= 0) {
      const previous = activities[overlap]!;
      if (SOURCE_PRIORITY[activity.source] > SOURCE_PRIORITY[previous.source]) {
        activities[overlap] = merge(activity, previous);
        changedIds.add(activity.id);
        updated += 1;
      } else {
        const enriched = merge(previous, activity);
        if (JSON.stringify(enriched) !== JSON.stringify(previous)) {
          activities[overlap] = enriched;
          changedIds.add(enriched.id);
          updated += 1;
        } else {
          duplicates += 1;
        }
      }
      continue;
    }

    activities.push(activity);
    changedIds.add(activity.id);
    added += 1;
  }

  activities.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const changed = activities.filter((activity) => changedIds.has(activity.id));
  return { activities, changed, added, updated, duplicates, rejected };
}
