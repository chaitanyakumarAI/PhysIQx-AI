import type { SpotlightWin } from "@/features/home/components/AchievementSpotlight";
import type { CompletedSessionSummary } from "@/store/sessionStore";
import type { CardioSession } from "@/store/cardioStore";
import type { WeightEntry } from "@/store/profileStore";
import { cardioActivityLabels } from "@/store/cardioStore";
import type { Insight } from "@/types/insight";
import type { DayStatus } from "@/types/training";

/**
 * Live progress derivations — the coach speaks from the ledgers (completed
 * sessions, cardio log, weigh-ins), not from fixtures. Every function falls
 * back to the authored fixture when the user has no real data yet, which
 * also keeps the SSR pass (empty stores) identical to the first client
 * render.
 */

export interface ProgressLedgers {
  history: CompletedSessionSummary[];
  cardio: CardioSession[];
  weights: WeightEntry[];
}

const WEEKLY_CARDIO_TARGET_MIN = 150;

function localIso(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function isoDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return localIso(date);
}

interface WeekView {
  completionPercent: number;
  days: DayStatus[];
}

/**
 * The REAL current week (Mon–Sun) from the session ledger: trained days
 * glow, today is actually today, and everything unproven stays neutral —
 * no schedule exists yet to call a day "missed" or "rest honored", so we
 * don't pretend. Fixture week only before any workout is logged (which
 * also keeps SSR and the first client render identical).
 */
export function deriveWeek(
  fallback: WeekView,
  history: CompletedSessionSummary[],
  trainingDaysPerWeek: number,
): WeekView {
  if (history.length === 0) return fallback;

  const trained = new Set(history.map((session) => session.date));
  const today = new Date();
  const monday = new Date(today);
  const weekday = today.getDay() === 0 ? 7 : today.getDay();
  monday.setDate(today.getDate() - (weekday - 1));
  const todayIso = localIso(today);

  const days: DayStatus[] = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const iso = localIso(date);
    return {
      date: iso,
      weekdayLabel: date.toLocaleDateString("en-US", { weekday: "narrow" }),
      status: trained.has(iso) ? "trained" : "unplanned",
      isToday: iso === todayIso,
    };
  });

  const trainedCount = days.filter((day) => day.status === "trained").length;
  return {
    completionPercent: Math.min(
      100,
      Math.round((trainedCount / Math.max(1, trainingDaysPerWeek)) * 100),
    ),
    days,
  };
}

/**
 * Real streak from the ledger: consecutive trained days ending today or
 * yesterday (today not trained YET shouldn't zero the streak at breakfast).
 * Fixture value only before any workout exists.
 */
export function deriveStreakDays(
  fallback: number,
  history: CompletedSessionSummary[],
): number {
  if (history.length === 0) return fallback;
  const trained = new Set(history.map((session) => session.date));
  let streak = 0;
  const cursor = new Date();
  if (!trained.has(localIso(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (trained.has(localIso(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** The freshest real win, or the authored fixture when nothing is logged. */
export function deriveSpotlight(
  fallback: SpotlightWin,
  { history, cardio, weights }: ProgressLedgers,
): SpotlightWin {
  const candidates: { date: string; win: SpotlightWin }[] = [];

  const lastSession = history.at(-1);
  if (lastSession) {
    candidates.push({
      date: lastSession.date,
      win: {
        kind: "milestone",
        title: history.length === 1 ? "First workout logged" : lastSession.title,
        detail:
          lastSession.totalVolumeKg > 0
            ? `${lastSession.totalVolumeKg.toLocaleString()} kg moved · +${lastSession.xpEarned} XP`
            : `+${lastSession.xpEarned} XP earned`,
      },
    });
  }

  const lastCardio = cardio.at(-1);
  if (lastCardio) {
    candidates.push({
      date: lastCardio.date,
      win: {
        kind: "milestone",
        title: `${cardioActivityLabels[lastCardio.activity]} · ${lastCardio.minutes} min`,
        detail: "Cardio pillar fed",
      },
    });
  }

  const lastWeight = weights.at(-1);
  if (lastWeight) {
    candidates.push({
      date: lastWeight.date,
      win: {
        kind: "milestone",
        title: "Weigh-in logged",
        detail: `${lastWeight.weightKg} kg on record`,
      },
    });
  }

  if (candidates.length === 0) return fallback;
  // Newest first; insertion order above (session > cardio > weight) breaks
  // same-day ties — a finished workout beats a logged glass of anything.
  candidates.sort((a, b) => b.date.localeCompare(a.date));
  return candidates[0]!.win;
}

/**
 * Up to `limit` coach insights derived from real progress, most useful
 * first. Falls back to the authored fixtures only when NOTHING has been
 * logged yet.
 */
export function deriveInsights(
  fallbacks: Insight[],
  { history, cardio, weights }: ProgressLedgers,
  limit = 2,
): Insight[] {
  const weekAgo = isoDaysAgo(6);
  const candidates: Insight[] = [];

  // Cardio vs the weekly target — the pillar the user can move fastest.
  const weekCardioMin = cardio
    .filter((session) => session.date >= weekAgo)
    .reduce((sum, session) => sum + session.minutes, 0);
  if (weekCardioMin >= WEEKLY_CARDIO_TARGET_MIN) {
    candidates.push({
      id: "live-cardio-hit",
      category: "training",
      severity: "celebrate",
      headline: "Cardio target hit",
      body: `${weekCardioMin} of ${WEEKLY_CARDIO_TARGET_MIN} weekly minutes done. That's the full 25% of your score, earned.`,
      state: "fresh",
    });
  } else if (weekCardioMin > 0) {
    candidates.push({
      id: "live-cardio-progress",
      category: "training",
      severity: "suggest",
      headline: "Cardio in progress",
      body: `${weekCardioMin} of ${WEEKLY_CARDIO_TARGET_MIN} weekly minutes logged — ${WEEKLY_CARDIO_TARGET_MIN - weekCardioMin} to go. An easy walk counts.`,
      state: "fresh",
    });
  }

  // Weight trend from the user's own log (needs two real entries).
  if (weights.length >= 2) {
    const last = weights.at(-1)!;
    const previous = weights.at(-2)!;
    const delta = Math.round((last.weightKg - previous.weightKg) * 10) / 10;
    if (delta !== 0) {
      candidates.push({
        id: "live-weight-trend",
        category: "score",
        severity: delta < 0 ? "celebrate" : "suggest",
        headline: delta < 0 ? "Weight trending down" : "Weight ticked up",
        body:
          delta < 0
            ? `${Math.abs(delta)} kg down since your last weigh-in — the cut is moving.`
            : `+${delta} kg since your last weigh-in. One data point, not a verdict — keep logging weekly.`,
        state: "fresh",
      });
    }
  }

  // Training volume this week from the session ledger.
  const weekSessions = history.filter((session) => session.date >= weekAgo);
  if (weekSessions.length > 0) {
    const weekVolume = weekSessions.reduce(
      (sum, session) => sum + session.totalVolumeKg,
      0,
    );
    candidates.push({
      id: "live-sessions-week",
      category: "training",
      severity: weekSessions.length >= 3 ? "celebrate" : "suggest",
      headline:
        weekSessions.length >= 3 ? "Consistency compounding" : "Building the week",
      body:
        weekSessions.length >= 3
          ? `${weekSessions.length} workouts and ${weekVolume.toLocaleString()} kg moved this week — your biggest pillar is earning it.`
          : `${weekSessions.length} ${weekSessions.length === 1 ? "workout" : "workouts"} down this week. The next one is the consistency pillar's favorite.`,
      state: "fresh",
    });
  }

  if (candidates.length === 0) return fallbacks.slice(0, limit);
  return candidates.slice(0, limit);
}
