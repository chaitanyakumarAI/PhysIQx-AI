import type { CompletedSessionSummary } from "@/types/workoutSession";
import { addDaysIso, daysBetweenIso } from "./dates";

/**
 * Training Load — what the log can honestly say about recent stress:
 * this week's lifting volume against the athlete's own 4-week average,
 * hard sessions, and days without rest. No physiology claims (HRV, CNS,
 * "neuromuscular excitability") — those need sensors this app doesn't read.
 * The ratio stays hidden until four weeks of history make it meaningful.
 */

export type LoadStatus = "baseline" | "fresh" | "balanced" | "building" | "high";

export const loadStatusLabels: Record<LoadStatus, string> = {
  baseline: "Building baseline",
  fresh: "Fresh",
  balanced: "Balanced",
  building: "Building",
  high: "High load",
};

export interface TrainingLoad {
  status: LoadStatus;
  headline: string;
  advice: string;
  /** Lifting volume over the last 7 days (today included). */
  weekVolumeKg: number;
  /** Average weekly volume over the 4 weeks before this one; null until known. */
  baselineWeeklyVolumeKg: number | null;
  /** weekVolume ÷ baseline; null until 28 days of history exist. */
  loadRatio: number | null;
  /** Days of history so far, capped at the 28 the baseline needs. */
  baselineDays: number;
  sessionsLast7Days: number;
  /** Sessions in the last 7 days averaging RPE ≥ 9 (only when RPE is logged). */
  hardSessionsLast7Days: number;
  /** Consecutive training days ending today (or yesterday if today is open). */
  consecutiveTrainingDays: number;
}

export const BASELINE_DAYS = 28;
const HARD_SESSION_RPE = 9;
const MANY_DAYS_IN_A_ROW = 6;
const ESCALATION: Record<LoadStatus, LoadStatus> = {
  baseline: "baseline",
  fresh: "balanced",
  balanced: "building",
  building: "high",
  high: "high",
};

function volumeBetween(sessions: CompletedSessionSummary[], from: string, to: string): number {
  return sessions
    .filter((session) => session.date >= from && session.date <= to)
    .reduce((sum, session) => sum + Math.max(0, session.totalVolumeKg), 0);
}

function consecutiveDays(dates: Set<string>, todayIso: string): number {
  let cursor = dates.has(todayIso) ? todayIso : addDaysIso(todayIso, -1);
  let count = 0;
  while (dates.has(cursor)) {
    count += 1;
    cursor = addDaysIso(cursor, -1);
  }
  return count;
}

export function computeTrainingLoad(
  allSessions: CompletedSessionSummary[],
  todayIso: string,
): TrainingLoad {
  const sessions = allSessions.filter(
    (session) => session.setsCompleted > 0 && session.date <= todayIso,
  );
  const weekStart = addDaysIso(todayIso, -6);
  const recent = sessions.filter((session) => session.date >= weekStart);
  const weekVolumeKg = Math.round(volumeBetween(sessions, weekStart, todayIso));
  const firstDate = sessions.reduce<string | null>(
    (first, session) => (first === null || session.date < first ? session.date : first),
    null,
  );
  const historyDays = firstDate ? daysBetweenIso(firstDate, todayIso) + 1 : 0;
  const baselineReady = historyDays >= BASELINE_DAYS;

  // The four full weeks before the current 7-day window.
  const baselineVolume = volumeBetween(
    sessions,
    addDaysIso(weekStart, -BASELINE_DAYS),
    addDaysIso(weekStart, -1),
  );
  const baselineWeeklyVolumeKg = baselineReady ? Math.round(baselineVolume / 4) : null;
  const loadRatio =
    baselineWeeklyVolumeKg && baselineWeeklyVolumeKg > 0
      ? Math.round((weekVolumeKg / baselineWeeklyVolumeKg) * 100) / 100
      : null;

  const hardSessionsLast7Days = recent.filter(
    (session) => (session.avgRpe ?? 0) >= HARD_SESSION_RPE,
  ).length;
  const consecutiveTrainingDays = consecutiveDays(
    new Set(sessions.map((session) => session.date)),
    todayIso,
  );

  let status: LoadStatus;
  if (loadRatio === null) status = "baseline";
  else if (loadRatio > 1.5) status = "high";
  else if (loadRatio > 1.2) status = "building";
  else if (loadRatio >= 0.8) status = "balanced";
  else status = "fresh";
  if (status !== "baseline" && hardSessionsLast7Days >= 3) status = ESCALATION[status];

  const ratioText = loadRatio !== null ? `${loadRatio.toFixed(1)}×` : "";
  const copy: Record<LoadStatus, [string, string]> = {
    baseline: [
      `Building your baseline — ${Math.min(historyDays, BASELINE_DAYS)} of ${BASELINE_DAYS} days logged.`,
      "Load comparisons unlock after four weeks of training.",
    ],
    fresh: [
      `Lighter than usual — ${ratioText} your 4-week average.`,
      "You're well rested: a good day to push a top set.",
    ],
    balanced: [
      `Load is in line with your 4-week average (${ratioText}).`,
      "The right zone for steady progressive overload.",
    ],
    building: [
      `Load is climbing — ${ratioText} your 4-week average.`,
      "Good stimulus. Plan a lighter day in the next few.",
    ],
    high: [
      `Load spike — ${ratioText} your 4-week average.`,
      "Keep today light or rest; adaptation happens in recovery.",
    ],
  };
  const [headline, standardAdvice] = copy[status];
  const advice =
    consecutiveTrainingDays >= MANY_DAYS_IN_A_ROW
      ? `${consecutiveTrainingDays} days in a row — schedule a rest day soon.`
      : standardAdvice;

  return {
    status,
    headline,
    advice,
    weekVolumeKg,
    baselineWeeklyVolumeKg,
    loadRatio,
    baselineDays: Math.min(historyDays, BASELINE_DAYS),
    sessionsLast7Days: recent.length,
    hardSessionsLast7Days,
    consecutiveTrainingDays,
  };
}
