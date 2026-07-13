import type { SpotlightWin } from "@/features/home/components/AchievementSpotlight";
import type { CompletedSessionSummary } from "@/store/sessionStore";
import type { CardioSession } from "@/store/cardioStore";
import type { WeightEntry } from "@/store/profileStore";
import { cardioActivityLabels } from "@/store/cardioStore";
import type { Insight } from "@/types/insight";

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

function isoDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
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
