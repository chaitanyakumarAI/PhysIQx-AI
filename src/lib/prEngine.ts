import type { PersonalRecord, PersonalRecordTrendPoint } from "@/types/personalRecord";
import type { CompletedSessionSummary } from "@/types/workoutSession";
import { addDaysIso, daysBetweenIso } from "./dates";

/** Epley loses accuracy past ~10 reps, so higher-rep sets count as 10
 *  (docs/MASTER_BRIEF.md: "reps capped at 10"). */
export const E1RM_REP_CAP = 10;

/**
 * Estimated one-rep max (Epley): weight × (1 + min(reps, 10) / 30).
 */
export function calculateEpley1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  if (reps === 1) return Math.round(weightKg * 10) / 10;
  const e1rm = weightKg * (1 + Math.min(reps, E1RM_REP_CAP) / 30);
  return Math.round(e1rm * 10) / 10;
}

export interface LiftPoint {
  date: string;
  weightKg: number;
  reps: number;
  e1rm: number;
}

export interface LiftHistory {
  exerciseId: string;
  exerciseName: string;
  /** One point per training day (that day's best e1RM), oldest first. */
  points: LiftPoint[];
}

/** Every lift's per-day best, from the session ledger's top sets. */
export function buildLiftHistories(sessions: CompletedSessionSummary[]): LiftHistory[] {
  const byExercise = new Map<string, LiftHistory>();
  const ordered = [...sessions].sort((a, b) => a.completedAt.localeCompare(b.completedAt));
  for (const session of ordered) {
    for (const top of session.topSets) {
      const e1rm = calculateEpley1RM(top.weightKg, top.reps);
      if (e1rm <= 0) continue;
      const history = byExercise.get(top.exerciseId) ?? {
        exerciseId: top.exerciseId,
        exerciseName: top.exerciseName,
        points: [],
      };
      const last = history.points.at(-1);
      const point = { date: session.date, weightKg: top.weightKg, reps: top.reps, e1rm };
      if (last && last.date === session.date) {
        if (e1rm > last.e1rm) history.points[history.points.length - 1] = point;
      } else {
        history.points.push(point);
      }
      byExercise.set(top.exerciseId, history);
    }
  }
  return [...byExercise.values()];
}

/** Best e1RM per exercise among points on or after `sinceIso`. */
export function bestE1rmByExercise(
  sessions: CompletedSessionSummary[],
  sinceIso?: string,
): Map<string, number> {
  const best = new Map<string, number>();
  for (const history of buildLiftHistories(sessions)) {
    for (const point of history.points) {
      if (sinceIso && point.date < sinceIso) continue;
      best.set(history.exerciseId, Math.max(best.get(history.exerciseId) ?? 0, point.e1rm));
    }
  }
  return best;
}

const PR_WINDOW_DAYS = 30;

/**
 * Personal records per lift for the Insights chart: the best e1RM to date,
 * its change over the last 30 days, and the step series of every new best.
 * No ledger → no records (the screen shows an honest empty state).
 */
export function derivePersonalRecords(
  sessions: CompletedSessionSummary[],
  todayIso: string,
): PersonalRecord[] {
  const windowStart = addDaysIso(todayIso, -PR_WINDOW_DAYS);
  return buildLiftHistories(sessions)
    .map((history) => {
      let best = 0;
      let bestBeforeWindow = 0;
      const trend: PersonalRecordTrendPoint[] = [];
      for (const point of history.points) {
        if (point.date < windowStart) bestBeforeWindow = Math.max(bestBeforeWindow, point.e1rm);
        if (point.e1rm > best) {
          best = point.e1rm;
          trend.push({ date: point.date, value: point.e1rm });
        }
      }
      const baseline = bestBeforeWindow || history.points[0]!.e1rm;
      return {
        record: {
          id: `pr-${history.exerciseId}`,
          exerciseName: history.exerciseName,
          unit: "kg",
          value: best,
          delta: Math.round((best - baseline) * 10) / 10,
          windowLabel: `Last ${PR_WINDOW_DAYS} days`,
          trend,
        } satisfies PersonalRecord,
        sessions: history.points.length,
      };
    })
    // Most-trained lifts first — the ones the athlete cares about.
    .sort((a, b) => b.sessions - a.sessions || b.record.value - a.record.value)
    .map(({ record }) => record);
}

export interface PREvent {
  exerciseId: string;
  exerciseName: string;
  date: string;
  weightKg: number;
  reps: number;
  e1rm: number;
  previousBest: number;
}

/**
 * New bests set on or after `sinceIso`. The first time a lift is logged
 * is a baseline, not a record — a PR needs something to beat.
 */
export function detectRecentPRs(
  sessions: CompletedSessionSummary[],
  sinceIso: string,
): PREvent[] {
  const events: PREvent[] = [];
  for (const history of buildLiftHistories(sessions)) {
    let best = 0;
    for (const point of history.points) {
      if (best > 0 && point.e1rm > best && point.date >= sinceIso) {
        events.push({
          exerciseId: history.exerciseId,
          exerciseName: history.exerciseName,
          date: point.date,
          weightKg: point.weightKg,
          reps: point.reps,
          e1rm: point.e1rm,
          previousBest: best,
        });
      }
      best = Math.max(best, point.e1rm);
    }
  }
  return events.sort((a, b) => b.date.localeCompare(a.date) || b.e1rm - a.e1rm);
}

export interface StalledLift {
  exerciseId: string;
  exerciseName: string;
  bestE1rm: number;
  /** Whole weeks since the lift last improved. */
  weeksStalled: number;
}

const STALL_RECENT_DAYS = 21;
const STALL_LOOKBACK_DAYS = 56;

/**
 * Lifts trained regularly that haven't beaten their best for 3+ weeks.
 * Needs real evidence: at least two recent sessions of the lift and an
 * older best to compare against — a lift trained once is not "stalled".
 */
export function findStalledLifts(
  sessions: CompletedSessionSummary[],
  todayIso: string,
): StalledLift[] {
  const recentStart = addDaysIso(todayIso, -STALL_RECENT_DAYS);
  const lookbackStart = addDaysIso(todayIso, -STALL_LOOKBACK_DAYS);
  const stalled: StalledLift[] = [];
  for (const history of buildLiftHistories(sessions)) {
    const inWindow = history.points.filter((point) => point.date >= lookbackStart);
    const recent = inWindow.filter((point) => point.date >= recentStart);
    const earlier = inWindow.filter((point) => point.date < recentStart);
    if (recent.length < 2 || earlier.length === 0) continue;
    const bestEarlier = Math.max(...earlier.map((point) => point.e1rm));
    const bestRecent = Math.max(...recent.map((point) => point.e1rm));
    if (bestRecent > bestEarlier) continue;
    // The day the standing best was first set = the last real improvement.
    const bestSetOn = earlier.find((point) => point.e1rm === bestEarlier)!;
    stalled.push({
      exerciseId: history.exerciseId,
      exerciseName: history.exerciseName,
      bestE1rm: bestEarlier,
      weeksStalled: Math.floor(daysBetweenIso(bestSetOn.date, todayIso) / 7),
    });
  }
  return stalled.sort((a, b) => b.weeksStalled - a.weeksStalled);
}
