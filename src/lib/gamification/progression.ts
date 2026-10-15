import type { Ledger } from "@/types/ledger";
import { daysBetweenIso } from "../dates";
import { detectRecentPRs } from "../prEngine";
import { MIN_CARDIO_MINUTES_FOR_ACTIVE_DAY } from "../streakEngine";
import { COLLECTIBLES, familyById, type CollectibleDef, type MetricKey } from "./catalog";
import { levelForXp, levelStatus, type LevelStatus } from "./levels";
import { computeMetrics, dateReached, type MetricTable } from "./metrics";

/**
 * XP, levels, and the collection — derived from the ledger by replaying
 * it day by day (docs/GAMIFICATION_STUDY.md §3). The replay is what makes
 * level-gated badges honest: a Platinum earned at level 25 is dated the
 * day the athlete actually reached level 25, and the XP it pays counts
 * from that day on. Pure and deterministic.
 */

export const XP_RULES = {
  setupBonus: 150,
  personalRecord: 50,
  maxRecordsPerWorkout: 3,
  cardioPerMinute: 2,
  maxCardioPerActivity: 120,
  weighIn: 15,
  weighInEveryDays: 7,
  perfectWeek: 150,
} as const;

export type XpSource =
  | "workouts"
  | "records"
  | "cardio"
  | "weighIns"
  | "perfectWeeks"
  | "setup"
  | "collection";

export const xpSourceLabels: Record<XpSource, string> = {
  workouts: "Workouts",
  records: "Personal records",
  cardio: "Cardio",
  weighIns: "Weigh-ins",
  perfectWeeks: "Perfect weeks",
  setup: "Setup bonus",
  collection: "Collection",
};

interface XpEvent {
  date: string;
  source: XpSource;
  amount: number;
}

export type CollectibleStatus = "earned" | "sealed" | "in-progress" | "locked";

export interface CollectibleState extends CollectibleDef {
  status: CollectibleStatus;
  earnedOn: string | null;
  /** 0–1 toward the target (1 for earned and sealed). */
  progress: number;
  /** Plain-language "what's left" — null once earned. */
  hint: string | null;
}

export interface ProgressionState {
  totalXp: number;
  level: LevelStatus;
  xpBySource: Record<XpSource, number>;
  collectibles: CollectibleState[];
  earnedCount: number;
  /** Newest first. */
  recentlyEarned: CollectibleState[];
  /** The day each level was reached (level 1 omitted). */
  levelDates: { level: number; date: string }[];
}

function activityXp(ledger: Ledger, metrics: MetricTable, todayIso: string): XpEvent[] {
  const events: XpEvent[] = [];
  const sessions = ledger.sessions.filter(
    (session) => session.setsCompleted > 0 && session.date <= todayIso,
  );

  for (const session of sessions) {
    events.push({ date: session.date, source: "workouts", amount: Math.max(0, session.xpEarned) });
  }

  // Records pay per workout day, capped — a first-ever log isn't a record.
  const recordsByDay = new Map<string, number>();
  for (const record of detectRecentPRs(sessions, "0000-01-01")) {
    recordsByDay.set(record.date, (recordsByDay.get(record.date) ?? 0) + 1);
  }
  for (const [date, count] of recordsByDay) {
    events.push({
      date,
      source: "records",
      amount: Math.min(count, XP_RULES.maxRecordsPerWorkout) * XP_RULES.personalRecord,
    });
  }

  for (const activity of ledger.cardio) {
    if (activity.date > todayIso || activity.durationMin < MIN_CARDIO_MINUTES_FOR_ACTIVE_DAY) continue;
    events.push({
      date: activity.date,
      source: "cardio",
      amount: Math.min(
        XP_RULES.maxCardioPerActivity,
        Math.round(activity.durationMin * XP_RULES.cardioPerMinute),
      ),
    });
  }

  let lastPaidWeighIn: string | null = null;
  for (const entry of [...ledger.weighIns].sort((a, b) => a.date.localeCompare(b.date))) {
    if (entry.date > todayIso) continue;
    if (lastPaidWeighIn && daysBetweenIso(lastPaidWeighIn, entry.date) < XP_RULES.weighInEveryDays) continue;
    events.push({ date: entry.date, source: "weighIns", amount: XP_RULES.weighIn });
    lastPaidWeighIn = entry.date;
  }

  for (const point of metrics.perfectWeeks.points) {
    events.push({ date: point.date, source: "perfectWeeks", amount: XP_RULES.perfectWeek });
  }

  const setupDay =
    ledger.profile.onboardedOn ?? (ledger.profile.goal ? (sessions[0]?.date ?? todayIso) : null);
  if (setupDay && setupDay <= todayIso) {
    events.push({ date: setupDay, source: "setup", amount: XP_RULES.setupBonus });
  }
  return events;
}

/** The date a collectible's requirement was met (ignoring level gates). */
function requirementDate(def: CollectibleDef, metrics: MetricTable): string | null {
  if (!def.metric || def.target === undefined) return null;
  return dateReached(metrics[def.metric], def.target);
}

const UNITS: Partial<Record<MetricKey, [string, string]>> = {
  workouts: ["workout", "workouts"],
  personalRecords: ["record", "records"],
  perfectWeeks: ["perfect week", "perfect weeks"],
  cardioMinutes: ["minute", "minutes"],
  weighIns: ["weigh-in", "weigh-ins"],
  distinctExercises: ["exercise", "exercises"],
  doubleDutyDays: ["day", "days"],
};

function hintFor(def: CollectibleDef, metrics: MetricTable, level: number): string | null {
  if (def.rankLevel !== undefined) return `${Math.max(0, def.rankLevel - level)} levels to go`;
  if (!def.metric || def.target === undefined) return null;
  const current = metrics[def.metric].current;
  const remaining = Math.max(0, def.target - current);
  const family = def.familyId ? familyById(def.familyId) : undefined;
  switch (def.metric) {
    case "tonnageKg":
      return `${Math.ceil(remaining / 1000).toLocaleString("en-US")} t to go`;
    case "cardioKm":
      return `${Math.ceil(remaining).toLocaleString("en-US")} km to go`;
    case "longestStreak":
      return `Best so far: ${current} ${current === 1 ? "day" : "days"}`;
    case "bestScore":
      return current > 0 ? `Best so far: ${current}` : "Unlocks after your first week";
    case "strengthTier":
      return `Best so far: ${family?.format?.(current) ?? current}`;
    case "bestSessionSets":
      return `Best so far: ${current} sets`;
    case "consecutivePerfectWeeks":
      return `${current} in a row so far`;
    default: {
      const unit = UNITS[def.metric];
      if (!unit) return null;
      return `${remaining.toLocaleString("en-US")} more ${remaining === 1 ? unit[0] : unit[1]}`;
    }
  }
}

export function computeProgression(ledger: Ledger, todayIso: string): ProgressionState {
  const metrics = computeMetrics(ledger, todayIso);
  const events = activityXp(ledger, metrics, todayIso);
  const metDates = new Map(COLLECTIBLES.map((def) => [def.id, requirementDate(def, metrics)]));

  // Replay day by day: activity XP first, then everything that day unlocks
  // (which can raise the level, which can unseal more).
  const days = [
    ...new Set([
      ...events.map((event) => event.date),
      ...[...metDates.values()].filter((date): date is string => date !== null),
    ]),
  ].sort();
  const earnedOn = new Map<string, string>();
  const xpBySource: Record<XpSource, number> = {
    workouts: 0,
    records: 0,
    cardio: 0,
    weighIns: 0,
    perfectWeeks: 0,
    setup: 0,
    collection: 0,
  };
  const levelDates: { level: number; date: string }[] = [];
  let totalXp = 0;
  let level = 1;

  const noteLevel = (date: string) => {
    const next = levelForXp(totalXp);
    for (let reached = level + 1; reached <= next; reached++) levelDates.push({ level: reached, date });
    level = next;
  };

  for (const day of days) {
    for (const event of events) {
      if (event.date !== day) continue;
      totalXp += event.amount;
      xpBySource[event.source] += event.amount;
    }
    noteLevel(day);
    let unlocked = true;
    while (unlocked) {
      unlocked = false;
      for (const def of COLLECTIBLES) {
        if (earnedOn.has(def.id) || level < def.minLevel) continue;
        const met = def.rankLevel !== undefined ? level >= def.rankLevel : (metDates.get(def.id) ?? "9999") <= day;
        if (!met) continue;
        earnedOn.set(def.id, day);
        totalXp += def.xp;
        xpBySource.collection += def.xp;
        noteLevel(day);
        unlocked = true;
      }
    }
  }

  const collectibles: CollectibleState[] = COLLECTIBLES.map((def) => {
    const earned = earnedOn.get(def.id) ?? null;
    if (earned) return { ...def, status: "earned", earnedOn: earned, progress: 1, hint: null };
    const requirementMet =
      def.rankLevel !== undefined ? level >= def.rankLevel : metDates.get(def.id) !== null;
    if (requirementMet) {
      return { ...def, status: "sealed", earnedOn: null, progress: 1, hint: `Unlocks at level ${def.minLevel}` };
    }
    const progress =
      def.rankLevel !== undefined
        ? Math.min(1, level / def.rankLevel)
        : def.metric && def.target
          ? Math.min(1, metrics[def.metric].current / def.target)
          : 0;
    return {
      ...def,
      status: progress > 0 ? "in-progress" : "locked",
      earnedOn: null,
      progress,
      hint: hintFor(def, metrics, level),
    };
  });

  const recentlyEarned = collectibles
    .filter((item) => item.status === "earned")
    .sort((a, b) => b.earnedOn!.localeCompare(a.earnedOn!) || b.xp - a.xp);

  return {
    totalXp,
    level: levelStatus(totalXp),
    xpBySource,
    collectibles,
    earnedCount: recentlyEarned.length,
    recentlyEarned,
    levelDates,
  };
}

/** Collectibles earned within the last `days` days (for celebrations). */
export function earnedSince(state: ProgressionState, sinceIso: string): CollectibleState[] {
  return state.recentlyEarned.filter((item) => item.earnedOn! >= sinceIso);
}

