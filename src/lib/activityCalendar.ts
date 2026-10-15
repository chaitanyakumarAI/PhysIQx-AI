import type { CardioActivity } from "@/types/cardio";
import type { Ledger } from "@/types/ledger";
import type { DayStatusValue } from "@/types/training";
import type { CompletedSessionSummary } from "@/types/workoutSession";
import { addDaysIso, weekMondayIso } from "./dates";
import { computeStreak, deriveDayStatuses } from "./streakEngine";

/**
 * The consistency heatmap's data: one cell per day with its status, how
 * hard that day was relative to the athlete's own typical training day,
 * and what actually happened — so a tapped square can say "Upper Body,
 * 8.2 t" instead of just "trained".
 */
export interface CalendarCell {
  date: string;
  status: DayStatusValue;
  /** 0 = no training; 1–4 = light → heavy for this athlete. */
  intensity: 0 | 1 | 2 | 3 | 4;
  isToday: boolean;
  isFuture: boolean;
  sessions: CompletedSessionSummary[];
  cardio: CardioActivity[];
}

export interface ActivityCalendar {
  /** Oldest week first; each week Mon → Sun. */
  weeks: CalendarCell[][];
  currentStreak: number;
  longestStreak: number;
  activeDays: number;
  totalDays: number;
}

/** A day's training "size": tonnes lifted + half-hours of cardio. */
function dayLoad(sessions: CompletedSessionSummary[], cardio: CardioActivity[]): number {
  const tonnes = sessions.reduce((sum, session) => sum + Math.max(0, session.totalVolumeKg), 0) / 1000;
  const cardioUnits = cardio.reduce((sum, activity) => sum + activity.durationMin, 0) / 30;
  // A logged session with no load (bodyweight) still counts as real work.
  return tonnes + cardioUnits + (sessions.length > 0 ? 1 : 0);
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
}

export function buildActivityCalendar(
  ledger: Ledger,
  todayIso: string,
  weekCount = 12,
): ActivityCalendar {
  const lastMonday = weekMondayIso(todayIso);
  const firstMonday = addDaysIso(lastMonday, -(weekCount - 1) * 7);
  const lastSunday = addDaysIso(lastMonday, 6);
  const calendarInput = {
    sessions: ledger.sessions,
    cardio: ledger.cardio,
    trainingDaysPerWeek: ledger.profile.trainingDaysPerWeek,
    todayIso,
  };
  const statuses = deriveDayStatuses(calendarInput, firstMonday, lastSunday);

  const sessionsByDay = new Map<string, CompletedSessionSummary[]>();
  for (const session of ledger.sessions) {
    if (session.setsCompleted <= 0) continue;
    sessionsByDay.set(session.date, [...(sessionsByDay.get(session.date) ?? []), session]);
  }
  const cardioByDay = new Map<string, CardioActivity[]>();
  for (const activity of ledger.cardio) {
    cardioByDay.set(activity.date, [...(cardioByDay.get(activity.date) ?? []), activity]);
  }

  const loads = statuses
    .filter((day) => day.status === "trained")
    .map((day) => dayLoad(sessionsByDay.get(day.date) ?? [], cardioByDay.get(day.date) ?? []));
  const typical = median(loads) || 1;

  const cells: CalendarCell[] = statuses.map((day) => {
    const sessions = sessionsByDay.get(day.date) ?? [];
    const cardio = cardioByDay.get(day.date) ?? [];
    let intensity: CalendarCell["intensity"] = 0;
    if (day.status === "trained") {
      const ratio = dayLoad(sessions, cardio) / typical;
      intensity = ratio < 0.6 ? 1 : ratio < 1 ? 2 : ratio < 1.4 ? 3 : 4;
    }
    return {
      date: day.date,
      status: day.status,
      intensity,
      isToday: day.date === todayIso,
      isFuture: day.date > todayIso,
      sessions,
      cardio,
    };
  });

  const weeks: CalendarCell[][] = [];
  for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7));
  const streak = computeStreak(calendarInput);
  const pastCells = cells.filter((cell) => !cell.isFuture);

  return {
    weeks,
    currentStreak: streak.currentStreakDays,
    longestStreak: streak.longestStreakDays,
    activeDays: pastCells.filter((cell) => cell.status === "trained").length,
    totalDays: pastCells.length,
  };
}
