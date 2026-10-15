import type { Ledger } from "@/types/ledger";
import { addDaysIso, daysBetweenIso, localIsoFromTimestamp, weekMondayIso } from "../dates";
import { buildLiftHistories, detectRecentPRs } from "../prEngine";
import { computeSnapshotSeries } from "../scoreEngine";
import {
  collectActiveDates,
  deriveDayStatuses,
  firstActiveDate,
  MIN_CARDIO_MINUTES_FOR_ACTIVE_DAY,
} from "../streakEngine";
import { standardsFor, TIER_ORDER } from "../strengthStandards";
import type { MetricKey } from "./catalog";

/**
 * Every collection metric as a dated series: its value today, and the
 * points (date, best-so-far value) where it grew — so "when was 50
 * workouts reached?" is a lookup, and every badge has a real earned date.
 * Pure: ledger + today in, series out.
 */
export interface MetricSeries {
  current: number;
  /** Ascending by date; value is the best/cumulative value as of that date. */
  points: { date: string; value: number }[];
}

export type MetricTable = Record<MetricKey, MetricSeries>;

/** First date the series reached `target`, or null. */
export function dateReached(series: MetricSeries, target: number): string | null {
  return series.points.find((point) => point.value >= target)?.date ?? null;
}

const empty = (): MetricSeries => ({ current: 0, points: [] });

/** Cumulative series from dated increments (sorted inside). */
function cumulative(increments: { date: string; amount: number }[]): MetricSeries {
  const sorted = [...increments].sort((a, b) => a.date.localeCompare(b.date));
  let total = 0;
  const points = sorted.map(({ date, amount }) => {
    total += amount;
    return { date, value: total };
  });
  return { current: total, points };
}

/** Running-maximum series from dated observations. */
function runningMax(observations: { date: string; value: number }[]): MetricSeries {
  const sorted = [...observations].sort((a, b) => a.date.localeCompare(b.date));
  let best = 0;
  const points: { date: string; value: number }[] = [];
  for (const { date, value } of sorted) {
    if (value > best) {
      best = value;
      points.push({ date, value });
    }
  }
  return { current: best, points };
}

/** A yes/no milestone: value 1 from `date` on. */
function once(date: string | null): MetricSeries {
  return date ? { current: 1, points: [{ date, value: 1 }] } : empty();
}

interface WeekResult {
  monday: string;
  perfect: boolean;
  /** Day the week reached its target (perfect weeks only). */
  hitOn: string | null;
  /** The week is over (it can no longer change). */
  complete: boolean;
}

function weeklyResults(ledger: Ledger, todayIso: string): WeekResult[] {
  const active = [...collectActiveDates(ledger.sessions, ledger.cardio)]
    .filter((date) => date <= todayIso)
    .sort();
  const first = active[0];
  if (!first) return [];
  const target = Math.max(1, ledger.profile.trainingDaysPerWeek);
  const weeks: WeekResult[] = [];
  for (let monday = weekMondayIso(first); monday <= todayIso; monday = addDaysIso(monday, 7)) {
    const sunday = addDaysIso(monday, 6);
    const days = active.filter((date) => date >= monday && date <= sunday);
    const hitOn = days.length >= target ? days[target - 1]! : null;
    weeks.push({ monday, perfect: hitOn !== null, hitOn, complete: sunday < todayIso });
  }
  return weeks;
}

export function computeMetrics(ledger: Ledger, todayIso: string): MetricTable {
  const sessions = ledger.sessions
    .filter((session) => session.setsCompleted > 0 && session.date <= todayIso)
    .sort((a, b) => a.completedAt.localeCompare(b.completedAt));
  const cardio = ledger.cardio
    .filter((activity) => activity.date <= todayIso)
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  const weighIns = ledger.weighIns
    .filter((entry) => entry.date <= todayIso)
    .sort((a, b) => a.date.localeCompare(b.date));

  // --- Weeks: perfect weeks, consecutive runs, perfect months -------------
  const weeks = weeklyResults(ledger, todayIso);
  const perfectWeekDates = weeks.flatMap((week) => (week.hitOn ? [week.hitOn] : []));
  let run = 0;
  const runPoints: { date: string; value: number }[] = [];
  for (const week of weeks) {
    if (week.perfect) {
      run += 1;
      runPoints.push({ date: week.hitOn!, value: run });
    } else if (week.complete) {
      run = 0;
    }
  }
  const monthGroups = new Map<string, WeekResult[]>();
  for (const week of weeks) {
    const month = week.monday.slice(0, 7);
    monthGroups.set(month, [...(monthGroups.get(month) ?? []), week]);
  }
  const perfectMonthDate =
    [...monthGroups.values()]
      .filter((group) => group.length >= 4 && group.every((week) => week.complete && week.perfect))
      .map((group) => group.at(-1)!.hitOn!)
      .sort()[0] ?? null;

  // --- Streak: best run of trained/rest-honored days so far ----------------
  const activeDates = collectActiveDates(sessions, cardio);
  const firstActive = firstActiveDate(activeDates);
  const streakPoints: { date: string; value: number }[] = [];
  let best = 0;
  if (firstActive) {
    const days = deriveDayStatuses(
      {
        sessions,
        cardio,
        trainingDaysPerWeek: ledger.profile.trainingDaysPerWeek,
        todayIso,
      },
      firstActive,
      todayIso,
    );
    let current = 0;
    let hasTraining = false;
    for (const day of days) {
      if (day.status === "trained" || day.status === "rest-honored") {
        current += 1;
        hasTraining ||= day.status === "trained";
        if (hasTraining && current > best) {
          best = current;
          streakPoints.push({ date: day.date, value: best });
        }
      } else if (day.status === "missed") {
        current = 0;
        hasTraining = false;
      }
    }
  }

  // --- Strength tier vs bodyweight as of each lift --------------------------
  const benchmarks = standardsFor(ledger.profile.sex);
  const tierObservations: { date: string; value: number }[] = [];
  for (const history of buildLiftHistories(sessions)) {
    const benchmark = benchmarks.find((candidate) => candidate.exerciseId === history.exerciseId);
    if (!benchmark) continue;
    for (const point of history.points) {
      const bodyweight = [...weighIns].reverse().find((entry) => entry.date <= point.date)?.weightKg;
      if (!bodyweight) continue;
      const ratio = point.e1rm / bodyweight;
      const reached = TIER_ORDER.filter((tier) => ratio >= benchmark.tiers[tier]).length - 1;
      if (reached > 0) tierObservations.push({ date: point.date, value: reached });
    }
  }

  // --- Score: best finalized score and the first "full house" day ----------
  const scoreObservations: { date: string; value: number }[] = [];
  let fullHouseDate: string | null = null;
  if (firstActive) {
    const yesterday = addDaysIso(todayIso, -1);
    for (const snapshot of computeSnapshotSeries(ledger, firstActive, yesterday)) {
      if (snapshot.state !== "active" || snapshot.score === null) continue;
      scoreObservations.push({ date: snapshot.date, value: snapshot.score });
      const allTracked = snapshot.pillars.length === 4 && snapshot.pillars.every((pillar) => pillar.status !== "untracked");
      if (!fullHouseDate && allTracked && snapshot.pillars.every((pillar) => pillar.value >= 70)) {
        fullHouseDate = snapshot.date;
      }
    }
  }

  // --- Exercise variety and the biggest single session ---------------------
  const seen = new Set<string>();
  const varietyPoints: { date: string; value: number }[] = [];
  for (const session of sessions) {
    const before = seen.size;
    for (const top of session.topSets) seen.add(top.exerciseId);
    if (seen.size > before) varietyPoints.push({ date: session.date, value: seen.size });
  }

  // --- Lifting + real cardio on the same day --------------------------------
  const sessionDates = new Set(sessions.map((session) => session.date));
  const doubleDays = new Set(
    cardio
      .filter((activity) => activity.durationMin >= MIN_CARDIO_MINUTES_FOR_ACTIVE_DAY)
      .map((activity) => activity.date)
      .filter((date) => sessionDates.has(date)),
  );

  // --- One-off milestones ---------------------------------------------------
  const workoutDates = sessions.map((session) => session.date);
  let comebackDate: string | null = null;
  const sortedActive = [...activeDates].sort();
  for (let index = 1; index < sortedActive.length && !comebackDate; index++) {
    const date = sortedActive[index]!;
    if (daysBetweenIso(sortedActive[index - 1]!, date) >= 14 && sessionDates.has(date)) {
      comebackDate = date;
    }
  }
  let ironYearDate: string | null = null;
  for (let end = 99, start = 0; end < workoutDates.length && !ironYearDate; end++) {
    while (daysBetweenIso(workoutDates[start]!, workoutDates[end]!) > 364) start += 1;
    if (end - start + 1 >= 100) ironYearDate = workoutDates[end]!;
  }
  const firstWorkout = workoutDates[0] ?? null;
  const anniversaryDate = firstWorkout
    ? (workoutDates.find((date) => date >= addDaysIso(firstWorkout, 365)) ?? null)
    : null;
  const calibratedDate =
    firstActive && addDaysIso(firstActive, 6) <= todayIso ? addDaysIso(firstActive, 6) : null;
  const firstImport = cardio.length
    ? cardio.map((activity) => localIsoFromTimestamp(activity.importedAt)).sort()[0]!
    : null;

  return {
    workouts: cumulative(sessions.map((session) => ({ date: session.date, amount: 1 }))),
    tonnageKg: cumulative(
      sessions.map((session) => ({ date: session.date, amount: Math.max(0, session.totalVolumeKg) })),
    ),
    personalRecords: cumulative(
      detectRecentPRs(sessions, "0000-01-01").map((record) => ({ date: record.date, amount: 1 })),
    ),
    perfectWeeks: cumulative(perfectWeekDates.map((date) => ({ date, amount: 1 }))),
    longestStreak: { current: best, points: streakPoints },
    cardioMinutes: cumulative(cardio.map((activity) => ({ date: activity.date, amount: activity.durationMin }))),
    cardioKm: cumulative(cardio.map((activity) => ({ date: activity.date, amount: activity.distanceKm ?? 0 }))),
    weighIns: cumulative(weighIns.map((entry) => ({ date: entry.date, amount: 1 }))),
    strengthTier: runningMax(tierObservations),
    bestScore: runningMax(scoreObservations),
    distinctExercises: { current: seen.size, points: varietyPoints },
    bestSessionSets: runningMax(sessions.map((session) => ({ date: session.date, value: session.setsCompleted }))),
    doubleDutyDays: cumulative([...doubleDays].map((date) => ({ date, amount: 1 }))),
    firstWorkout: once(firstWorkout),
    calibrated: once(calibratedDate),
    bodyMap: once(ledger.profile.currentBuild && weighIns[0] ? weighIns[0].date : null),
    firstImport: once(firstImport && firstImport <= todayIso ? firstImport : null),
    comeback: once(comebackDate),
    fullHouse: once(fullHouseDate),
    perfectMonth: once(perfectMonthDate),
    ironYear: once(ironYearDate),
    anniversary: once(anniversaryDate),
    consecutivePerfectWeeks: { current: run, points: runPoints },
  };
}
