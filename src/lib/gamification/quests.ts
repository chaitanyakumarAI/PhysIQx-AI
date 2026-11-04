import { addDaysIso, daysBetweenIso, weekMondayIso } from "@/lib/dates";
import { detectRecentPRs } from "@/lib/prEngine";
import type { Ledger } from "@/types/ledger";
import type { CompletedSessionSummary } from "@/types/workoutSession";

/**
 * Weekly quests (docs/WEEKLY_QUESTS.md): three personal goals a week,
 * derived — never stored — from the ledger, so every device shows the same
 * ones and a restore brings them back. Targets are fixed at the start of
 * the week from the four weeks before it, a little above the athlete's own
 * average. Rule-based; no model.
 */

/** Quests start the week of their release, so past weeks don't pay out at once. */
export const QUESTS_FIRST_MONDAY = "2026-11-02";
export const QUEST_XP = 50;
export const SWEEP_XP = 100;
const QUESTS_PER_WEEK = 3;
const BASELINE_WEEKS = 4;
const STRETCH = 1.1;

export type QuestId =
  | "volume"
  | "sets"
  | "long-session"
  | "record"
  | "cardio"
  | "weigh-ins"
  | "rpe"
  | "starter-workout"
  | "starter-sets"
  | "starter-weigh-in";

export interface Quest {
  id: QuestId;
  title: string;
  target: number;
  progress: number;
  /** "kg", "sets", "min" … for the progress line; null for plain counts. */
  unit: string | null;
  doneOn: string | null;
}

export interface WeekQuests {
  weekStart: string;
  weekEnd: string;
  quests: Quest[];
  /** All three done: the day the last one was. */
  sweptOn: string | null;
}

interface Window {
  sessions: CompletedSessionSummary[];
  weighIns: Ledger["weighIns"];
  from: string;
  to: string;
}

const worked = (session: CompletedSessionSummary) => session.setsCompleted > 0;
const inRange = (date: string, from: string, to: string) => date >= from && date <= to;
const ceilTo = (value: number, step: number) => Math.ceil(value / step) * step;

/** Per-week totals for the baseline weeks that had any of it. */
function weeklyTotals(dates: { date: string; amount: number }[], monday: string): number[] {
  const totals: number[] = [];
  for (let week = 1; week <= BASELINE_WEEKS; week += 1) {
    const from = addDaysIso(monday, -7 * week);
    const to = addDaysIso(from, 6);
    const total = dates.filter((entry) => inRange(entry.date, from, to)).reduce((sum, entry) => sum + entry.amount, 0);
    if (total > 0) totals.push(total);
  }
  return totals;
}

const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

/** The day a running total first reaches `target` this week, or null. */
function reachedOn(entries: { date: string; amount: number }[], target: number): string | null {
  let total = 0;
  for (const entry of [...entries].sort((a, b) => a.date.localeCompare(b.date))) {
    total += entry.amount;
    if (total >= target) return entry.date;
  }
  return null;
}

interface Candidate {
  id: QuestId;
  title: string;
  target: number;
  unit: string | null;
  /** This week's contributions, dated. */
  entries: (week: Window) => { date: string; amount: number }[];
}

function candidates(ledger: Ledger, monday: string): Candidate[] {
  const before = (date: string) => date < monday;
  const sessions = ledger.sessions.filter(worked);
  const pastSessions = sessions.filter((session) => before(session.date));
  const list: Candidate[] = [];

  const volumeWeeks = weeklyTotals(pastSessions.map((s) => ({ date: s.date, amount: s.totalVolumeKg })), monday);
  if (volumeWeeks.length >= 2) {
    const target = ceilTo(average(volumeWeeks) * STRETCH, 500);
    list.push({
      id: "volume",
      title: `Move ${target.toLocaleString("en-US")} kg`,
      target,
      unit: "kg",
      entries: (week) => week.sessions.map((s) => ({ date: s.date, amount: s.totalVolumeKg })),
    });
  }

  const setWeeks = weeklyTotals(pastSessions.map((s) => ({ date: s.date, amount: s.setsCompleted })), monday);
  if (setWeeks.length >= 2) {
    const target = Math.ceil(average(setWeeks) * STRETCH);
    list.push({
      id: "sets",
      title: `Log ${target} sets`,
      target,
      unit: "sets",
      entries: (week) => week.sessions.map((s) => ({ date: s.date, amount: s.setsCompleted })),
    });
    const recent = pastSessions.filter((s) => s.date >= addDaysIso(monday, -7 * BASELINE_WEEKS)).map((s) => s.setsCompleted).sort((a, b) => a - b);
    const median = recent[Math.floor(recent.length / 2)] ?? 0;
    const longTarget = Math.max(8, Math.ceil(median * 1.2));
    list.push({
      id: "long-session",
      title: `One workout with ${longTarget}+ sets`,
      target: 1,
      unit: null,
      entries: (week) => week.sessions.filter((s) => s.setsCompleted >= longTarget).map((s) => ({ date: s.date, amount: 1 })),
    });
  }

  const firstLift = pastSessions[0]?.date;
  if (firstLift && daysBetweenIso(firstLift, monday) >= 7 * BASELINE_WEEKS) {
    list.push({
      id: "record",
      title: "Set a personal record",
      target: 1,
      unit: null,
      entries: (week) =>
        detectRecentPRs(sessions.filter((s) => s.date <= week.to), week.from)
          .filter((record) => inRange(record.date, week.from, week.to))
          .map((record) => ({ date: record.date, amount: 1 })),
    });
  }

  const pastCardio = ledger.cardio.filter((activity) => before(activity.date));
  const cardioWeeks = weeklyTotals(pastCardio.map((a) => ({ date: a.date, amount: a.durationMin })), monday);
  if (cardioWeeks.length > 0) {
    const target = Math.max(60, ceilTo(average(cardioWeeks) * STRETCH, 10));
    list.push({
      id: "cardio",
      title: `${target} minutes of cardio`,
      target,
      unit: "min",
      entries: (week) =>
        ledger.cardio
          .filter((activity) => inRange(activity.date, week.from, week.to))
          .map((activity) => ({ date: activity.date, amount: activity.durationMin })),
    });
  }

  if (ledger.weighIns.some((entry) => before(entry.date))) {
    list.push({
      id: "weigh-ins",
      title: "Weigh in on 2 days",
      target: 2,
      unit: null,
      entries: (week) => week.weighIns.map((entry) => ({ date: entry.date, amount: 1 })),
    });
  }

  const ratedRecently = pastSessions.some((s) => (s.avgRpe ?? 0) > 0 && s.date >= addDaysIso(monday, -7 * BASELINE_WEEKS));
  if (ratedRecently) {
    list.push({
      id: "rpe",
      title: "Log RPE in 2 workouts",
      target: 2,
      unit: null,
      entries: (week) => week.sessions.filter((s) => (s.avgRpe ?? 0) > 0).map((s) => ({ date: s.date, amount: 1 })),
    });
  }
  return list;
}

const STARTERS: Candidate[] = [
  { id: "starter-workout", title: "Finish a workout", target: 1, unit: null, entries: (week) => week.sessions.map((s) => ({ date: s.date, amount: 1 })) },
  { id: "starter-sets", title: "Log 10 sets", target: 10, unit: "sets", entries: (week) => week.sessions.map((s) => ({ date: s.date, amount: s.setsCompleted })) },
  { id: "starter-weigh-in", title: "Weigh in once", target: 1, unit: null, entries: (week) => week.weighIns.map((entry) => ({ date: entry.date, amount: 1 })) },
];

/** Same three on every device: the eligible pool, rotated by week number. */
function pick(pool: Candidate[], monday: string): Candidate[] {
  const weekNumber = Math.floor(daysBetweenIso(QUESTS_FIRST_MONDAY, monday) / 7);
  const chosen: Candidate[] = [];
  if (pool.length > 0) {
    const offset = ((weekNumber % pool.length) + pool.length) % pool.length;
    for (let index = 0; index < Math.min(QUESTS_PER_WEEK, pool.length); index += 1) {
      chosen.push(pool[(offset + index) % pool.length]!);
    }
  }
  for (const starter of STARTERS) {
    if (chosen.length >= QUESTS_PER_WEEK) break;
    chosen.push(starter);
  }
  return chosen;
}

/** The quests of the week containing `dateIso`, with progress up to `todayIso`. */
export function weeklyQuests(ledger: Ledger, dateIso: string, todayIso: string): WeekQuests {
  const weekStart = weekMondayIso(dateIso);
  const weekEnd = addDaysIso(weekStart, 6);
  const upTo = todayIso < weekEnd ? todayIso : weekEnd;
  const week: Window = {
    sessions: ledger.sessions.filter((s) => worked(s) && inRange(s.date, weekStart, upTo)),
    weighIns: ledger.weighIns.filter((entry) => inRange(entry.date, weekStart, upTo)),
    from: weekStart,
    to: upTo,
  };

  const quests = pick(candidates(ledger, weekStart), weekStart).map((candidate): Quest => {
    const entries = candidate.entries(week);
    return {
      id: candidate.id,
      title: candidate.title,
      target: candidate.target,
      progress: Math.min(candidate.target, entries.reduce((sum, entry) => sum + entry.amount, 0)),
      unit: candidate.unit,
      doneOn: reachedOn(entries, candidate.target),
    };
  });
  const done = quests.map((quest) => quest.doneOn);
  const sweptOn = done.every((date): date is string => date !== null) ? [...done].sort().at(-1)! : null;
  return { weekStart, weekEnd, quests, sweptOn };
}

/** Every quest week from launch to today (for XP); none before the launch week. */
export function questHistory(ledger: Ledger, todayIso: string): WeekQuests[] {
  const weeks: WeekQuests[] = [];
  for (let monday = QUESTS_FIRST_MONDAY; monday <= todayIso; monday = addDaysIso(monday, 7)) {
    weeks.push(weeklyQuests(ledger, monday, todayIso));
  }
  return weeks;
}

/** Quest XP as dated events: 50 per quest the day it's done, 100 for a sweep. */
export function questXpEvents(ledger: Ledger, todayIso: string): { date: string; amount: number }[] {
  return questHistory(ledger, todayIso).flatMap((week) => [
    ...week.quests.flatMap((quest) => (quest.doneOn ? [{ date: quest.doneOn, amount: QUEST_XP }] : [])),
    ...(week.sweptOn ? [{ date: week.sweptOn, amount: SWEEP_XP }] : []),
  ]);
}
