import type { CardioActivity } from "@/types/cardio";
import type { DayStatus, DayStatusValue, WeeklySummary } from "@/types/training";
import type { CompletedSessionSummary } from "@/types/workoutSession";
import { addDaysIso, daysBetweenIso, weekMondayIso, weekdayIndex } from "./dates";

/**
 * The activity calendar — ONE derivation behind the week strip, the
 * heatmap, the streak, and the Consistency pillar.
 *
 * Forgiveness with integrity: each week grants `7 − trainingDaysPerWeek`
 * rest days. An untrained past day spends that allowance ("rest honored")
 * and only becomes "missed" once the week's rest is used up. Rest you
 * planned never breaks a streak; disappearing for a fortnight does.
 */

/** Cardio shorter than this is a stroll, not a training day. */
export const MIN_CARDIO_MINUTES_FOR_ACTIVE_DAY = 20;

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;

export interface CalendarInput {
  sessions: CompletedSessionSummary[];
  cardio: CardioActivity[];
  trainingDaysPerWeek: number;
  /** The local "today" — passed in, never read from the clock. */
  todayIso: string;
}

/** Local days with real training: any logged workout or a real cardio bout. */
export function collectActiveDates(
  sessions: CompletedSessionSummary[],
  cardio: CardioActivity[],
): Set<string> {
  const dates = new Set<string>();
  for (const session of sessions) {
    if (session.setsCompleted > 0) dates.add(session.date);
  }
  for (const activity of cardio) {
    if (activity.durationMin >= MIN_CARDIO_MINUTES_FOR_ACTIVE_DAY) dates.add(activity.date);
  }
  return dates;
}

/** The first day the athlete trained, or null before any training. */
export function firstActiveDate(activeDates: Set<string>): string | null {
  let first: string | null = null;
  for (const date of activeDates) if (first === null || date < first) first = date;
  return first;
}

function restAllowance(trainingDaysPerWeek: number): number {
  return Math.max(0, 7 - Math.max(1, Math.min(7, Math.round(trainingDaysPerWeek))));
}

/**
 * Per-day statuses for [fromIso, toIso]. Days before the athlete's first
 * training day, today (still in progress), and future days are "unplanned"
 * — the app can't call them missed.
 */
export function deriveDayStatuses(
  input: CalendarInput,
  fromIso: string,
  toIso: string,
): DayStatus[] {
  const active = collectActiveDates(input.sessions, input.cardio);
  const start = firstActiveDate(active);
  const allowance = restAllowance(input.trainingDaysPerWeek);

  // Allowance is spent chronologically per week, so the walk starts at the
  // Monday of `fromIso`'s week even when the requested range starts mid-week.
  const days: DayStatus[] = [];
  let restUsed = 0;
  let cursor = weekMondayIso(fromIso);
  while (cursor <= toIso) {
    if (weekdayIndex(cursor) === 0) restUsed = 0;
    const isToday = cursor === input.todayIso;
    let status: DayStatusValue;
    if (active.has(cursor)) {
      status = "trained";
    } else if (!start || cursor < start || cursor >= input.todayIso) {
      status = "unplanned";
    } else if (restUsed < allowance) {
      status = "rest-honored";
      restUsed += 1;
    } else {
      status = "missed";
    }
    if (cursor >= fromIso) {
      days.push({
        date: cursor,
        weekdayLabel: WEEKDAY_LABELS[weekdayIndex(cursor)]!,
        status,
        isToday,
      });
    }
    cursor = addDaysIso(cursor, 1);
  }
  return days;
}

export interface StreakResult {
  /** Consecutive trained/rest-honored days ending today (or yesterday,
   *  while today is still open). 0 until the run includes a trained day. */
  currentStreakDays: number;
  longestStreakDays: number;
  trainedToday: boolean;
}

export function computeStreak(input: CalendarInput): StreakResult {
  const active = collectActiveDates(input.sessions, input.cardio);
  const start = firstActiveDate(active);
  if (!start) return { currentStreakDays: 0, longestStreakDays: 0, trainedToday: false };

  const days = deriveDayStatuses(input, start, input.todayIso);
  const counts = (day: DayStatus) => day.status === "trained" || day.status === "rest-honored";

  let longest = 0;
  let run = 0;
  let runHasTraining = false;
  for (const day of days) {
    if (day.isToday && day.status !== "trained") break; // today still open
    if (counts(day)) {
      run += 1;
      runHasTraining ||= day.status === "trained";
      if (runHasTraining) longest = Math.max(longest, run);
    } else {
      run = 0;
      runHasTraining = false;
    }
  }

  let current = 0;
  let currentHasTraining = false;
  for (let index = days.length - 1; index >= 0; index--) {
    const day = days[index]!;
    if (day.isToday && day.status !== "trained") continue;
    if (!counts(day)) break;
    current += 1;
    currentHasTraining ||= day.status === "trained";
  }

  return {
    currentStreakDays: currentHasTraining ? current : 0,
    longestStreakDays: longest,
    trainedToday: active.has(input.todayIso),
  };
}

/** The current Mon–Sun week with its completion vs the weekly target. */
export function deriveCurrentWeek(input: CalendarInput): WeeklySummary {
  const monday = weekMondayIso(input.todayIso);
  const days = deriveDayStatuses(input, monday, addDaysIso(monday, 6));
  const trained = days.filter((day) => day.status === "trained").length;
  return {
    completionPercent: Math.min(
      100,
      Math.round((trained / Math.max(1, input.trainingDaysPerWeek)) * 100),
    ),
    days,
  };
}

/** Trained days in the current Mon–Sun week. */
export function trainedDaysThisWeek(input: CalendarInput): number {
  return deriveCurrentWeek(input).days.filter((day) => day.status === "trained").length;
}

/** `weekCount` full Mon–Sun weeks ending with the current one. */
export function generateHeatmapWeeks(input: CalendarInput, weekCount = 12): DayStatus[][] {
  const lastMonday = weekMondayIso(input.todayIso);
  const firstMonday = addDaysIso(lastMonday, -(weekCount - 1) * 7);
  const days = deriveDayStatuses(input, firstMonday, addDaysIso(lastMonday, 6));
  const weeks: DayStatus[][] = [];
  for (let index = 0; index < weekCount; index++) {
    weeks.push(days.slice(index * 7, index * 7 + 7));
  }
  return weeks;
}

/** Whole days since the last active day (null before any training). */
export function daysSinceLastActive(
  sessions: CompletedSessionSummary[],
  cardio: CardioActivity[],
  todayIso: string,
): number | null {
  let last: string | null = null;
  for (const date of collectActiveDates(sessions, cardio)) {
    if (date <= todayIso && (last === null || date > last)) last = date;
  }
  return last === null ? null : daysBetweenIso(last, todayIso);
}
