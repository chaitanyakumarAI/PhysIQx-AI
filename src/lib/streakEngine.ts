import type { DayStatus, DayStatusValue, StreakSummary } from "@/types/training";
import type { CompletedSessionSummary } from "@/store/sessionStore";
import type { CardioSession } from "@/store/cardioStore";

export interface DayStatusDerivationParams {
  history: CompletedSessionSummary[];
  cardio?: CardioSession[];
  trainingDaysPerWeek?: number;
  startDate?: string;
  endDate?: string;
}

export interface ComputedStreakMetrics extends StreakSummary {
  completionPercent: number;
  activeStreak: boolean;
}

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;

export function localIso(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Returns Monday of the week containing the given date.
 */
export function getWeekMonday(date: Date): Date {
  const monday = new Date(date);
  const day = monday.getDay();
  // day: 0=Sun, 1=Mon, ..., 6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Derives the canonical per-day status series from session and cardio ledgers.
 * Guarantees single source of truth across the 12-week heatmap, weekly activity bars,
 * and streak calculations.
 */
export function deriveDayStatusSeries(params: DayStatusDerivationParams): DayStatus[] {
  const {
    history,
    cardio = [],
    trainingDaysPerWeek = 4,
    startDate,
    endDate,
  } = params;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = localIso(today);

  // Set of dates where strength workout was completed
  const workoutDates = new Set(
    history
      .filter((s) => s.status !== "abandoned")
      .map((s) => s.date)
  );

  // Set of dates where cardio was completed
  const cardioDates = new Set(cardio.map((c) => c.date));

  const start = startDate ? new Date(`${startDate}T00:00:00`) : getWeekMonday(today);
  const end = endDate ? new Date(`${endDate}T00:00:00`) : new Date(today);

  const days: DayStatus[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    const cursorIso = localIso(cursor);
    const dayOfWeek = cursor.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const weekdayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0=Mon, ..., 6=Sun
    const isToday = cursorIso === todayIso;
    const isFuture = cursor > today;

    const hasTrained = workoutDates.has(cursorIso) || cardioDates.has(cursorIso);

    let status: DayStatusValue;

    if (isFuture) {
      status = "unplanned";
    } else if (hasTrained) {
      status = "trained";
    } else if (isToday) {
      // Today is still ongoing — never mark as missed before midnight
      status = "unplanned";
    } else {
      // Past day with no training:
      // Forgiveness rule: Weekend days or days within scheduled rest allowance count as rest-honored
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      if (isWeekend || trainingDaysPerWeek <= 4) {
        status = "rest-honored";
      } else {
        status = "missed";
      }
    }

    days.push({
      date: cursorIso,
      weekdayLabel: WEEKDAY_LABELS[weekdayIndex]!,
      status,
      isToday,
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

/**
 * Computes streak metrics (current streak, longest streak, completion percentage)
 * with the forgiveness principle: rest days honor recovery and do not break streaks.
 */
export function computeStreakSummary(
  history: CompletedSessionSummary[],
  cardio: CardioSession[] = [],
  trainingDaysPerWeek: number = 4,
): ComputedStreakMetrics {
  if (history.length === 0 && cardio.length === 0) {
    return {
      currentStreakDays: 0,
      longestStreakDays: 0,
      completionPercent: 0,
      activeStreak: false,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Derive status series for the last 180 days to compute streaks
  const pastDate = new Date(today);
  pastDate.setDate(pastDate.getDate() - 180);

  const series = deriveDayStatusSeries({
    history,
    cardio,
    trainingDaysPerWeek,
    startDate: localIso(pastDate),
    endDate: localIso(today),
  });

  const seriesMap = new Map<string, DayStatusValue>(
    series.map((d) => [d.date, d.status])
  );

  let currentStreak = 0;
  const cursor = new Date(today);

  // If today isn't trained yet, start checking from yesterday without breaking streak
  const todayStatus = seriesMap.get(localIso(cursor));
  if (todayStatus !== "trained") {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const iso = localIso(cursor);
    const status = seriesMap.get(iso);

    if (!status || status === "missed") {
      break;
    }

    // "trained" and "rest-honored" continue the streak
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Calculate longest streak across entire series
  let longestStreak = currentStreak;
  let runningStreak = 0;

  for (const day of series) {
    if (day.status === "trained" || day.status === "rest-honored") {
      runningStreak += 1;
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak;
      }
    } else if (day.status === "missed") {
      runningStreak = 0;
    }
  }

  // Calculate this week's completion percent
  const monday = getWeekMonday(today);
  const thisWeekDays = series.filter(
    (d) => d.date >= localIso(monday) && d.date <= localIso(today)
  );
  const trainedThisWeek = thisWeekDays.filter((d) => d.status === "trained").length;
  const completionPercent = Math.min(
    100,
    Math.round((trainedThisWeek / Math.max(1, trainingDaysPerWeek)) * 100)
  );

  return {
    currentStreakDays: currentStreak,
    longestStreakDays: Math.max(longestStreak, currentStreak),
    completionPercent,
    activeStreak: currentStreak > 0,
  };
}

/**
 * Generates the 12-week heatmap grid (DayStatus[][]) directly from user ledgers.
 * Conforms to HeatmapCalendar and StreakHeatmapCard contracts.
 */
export function generateHeatmapWeeks(
  history: CompletedSessionSummary[],
  cardio: CardioSession[] = [],
  weekCount: number = 12,
  trainingDaysPerWeek: number = 4,
): DayStatus[][] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentMonday = getWeekMonday(today);
  const startMonday = new Date(currentMonday);
  startMonday.setDate(currentMonday.getDate() - (weekCount - 1) * 7);

  const sundayOfCurrentWeek = new Date(currentMonday);
  sundayOfCurrentWeek.setDate(currentMonday.getDate() + 6);

  const series = deriveDayStatusSeries({
    history,
    cardio,
    trainingDaysPerWeek,
    startDate: localIso(startMonday),
    endDate: localIso(sundayOfCurrentWeek),
  });

  const weeks: DayStatus[][] = [];
  for (let i = 0; i < weekCount; i++) {
    const weekDays = series.slice(i * 7, (i + 1) * 7);
    if (weekDays.length === 7) {
      weeks.push(weekDays);
    }
  }

  return weeks;
}
