import { enforceTwoSentences, type Insight } from "@/types/insight";
import type { CompletedSessionSummary } from "@/store/sessionStore";
import type { PillarId, PillarScore } from "@/types/score";
import type { WeightEntry } from "@/store/profileStore";
import type { CardioSession } from "@/store/cardioStore";

export interface CoachInsightsContext {
  history: CompletedSessionSummary[];
  streakDays: number;
  pillars?: PillarScore[];
  weakestPillarId?: PillarId;
  totalScore?: number;
  weights?: WeightEntry[];
  cardio?: CardioSession[];
}

/**
 * Generates deterministic, actionable AI Coach insights derived directly from
 * completed workouts, pillar scores, streak momentum, and training ledgers.
 * Every insight body is strictly enforced to <= 2 sentences.
 */
export function generateCoachInsights(context: CoachInsightsContext): Insight[] {
  const { history, streakDays, weakestPillarId } = context;
  const insights: Insight[] = [];

  // 1. Initial / Baseline Experience
  if (!history || history.length < 2) {
    insights.push({
      id: "insight-baseline",
      category: "training",
      severity: "suggest",
      headline: "Building your baseline",
      body: enforceTwoSentences(
        "Log 3 workouts this week to calibrate your PhysIQ score and unlock personalized progressive overload suggestions. Every completed set builds your baseline.",
      ),
      state: "fresh",
      actionLabel: "Start workout",
      actionHref: "/train",
    });

    insights.push({
      id: "insight-recovery-starter",
      category: "recovery",
      severity: "suggest",
      headline: "Prioritize recovery",
      body: enforceTwoSentences(
        "Quality sleep drives muscle protein synthesis and nervous system replenishment. Aim for 7 to 9 hours of uninterrupted rest tonight.",
      ),
      state: "fresh",
    });

    return insights;
  }

  // 2. Training & Volume Trajectory
  const recent = history.slice(-3);
  const latestSession = recent[recent.length - 1];
  const previousSession = recent.length >= 2 ? recent[recent.length - 2] : null;

  if (latestSession && previousSession && previousSession.totalVolumeKg > 0) {
    const volumeDelta = latestSession.totalVolumeKg - previousSession.totalVolumeKg;
    const deltaPercent = Math.round((volumeDelta / previousSession.totalVolumeKg) * 100);

    if (deltaPercent >= 5) {
      insights.push({
        id: "insight-volume-surge",
        category: "training",
        severity: "celebrate",
        headline: "Volume surging",
        body: enforceTwoSentences(
          `Your workout volume increased by ${deltaPercent}% compared to last session. Progressive overload is taking hold across your primary lifts.`,
        ),
        state: "fresh",
        actionLabel: "View history",
        actionHref: "/train/calendar",
      });
    } else if (deltaPercent <= -15) {
      insights.push({
        id: "insight-deload-check",
        category: "recovery",
        severity: "suggest",
        headline: "Fatigue or deload",
        body: enforceTwoSentences(
          "Volume dipped in your last session. If fatigue is accumulating, take a recovery day before pushing intensity again.",
        ),
        state: "fresh",
      });
    } else {
      insights.push({
        id: "insight-volume-steady",
        category: "training",
        severity: "suggest",
        headline: "Volume steady",
        body: enforceTwoSentences(
          "Solid workload consistency across your sessions. Focus on clean rep execution and RPE management on your next session.",
        ),
        state: "fresh",
        actionLabel: "Plan workout",
        actionHref: "/train",
      });
    }
  }

  // 3. Pillar-Specific Focus
  if (weakestPillarId === "cardio") {
    insights.push({
      id: "insight-cardio-focus",
      category: "training",
      severity: "suggest",
      headline: "Cardio gap",
      body: enforceTwoSentences(
        "Cardio is currently your lowest pillar score. A 20-minute low-intensity walk or cycle session will elevate your overall PhysIQ score.",
      ),
      state: "fresh",
      actionLabel: "Log cardio",
      actionHref: "/train/cardio",
    });
  } else if (weakestPillarId === "consistency") {
    insights.push({
      id: "insight-consistency-focus",
      category: "score",
      severity: "warn",
      headline: "Consistency gap",
      body: enforceTwoSentences(
        "Consistency is currently your lowest pillar score. Locking in your scheduled training days is the fastest way to drive your overall PhysIQ score upward.",
      ),
      state: "fresh",
      actionLabel: "View plan",
      actionHref: "/train",
    });
  } else if (weakestPillarId === "bodyShape") {
    insights.push({
      id: "insight-body-focus",
      category: "score",
      severity: "suggest",
      headline: "Body recomposition",
      body: enforceTwoSentences(
        "Consistent resistance training paired with adequate protein intake drives progressive recomposition toward your target archetype.",
      ),
      state: "fresh",
      actionLabel: "Body stats",
      actionHref: "/profile/body",
    });
  } else {
    insights.push({
      id: "insight-strength-focus",
      category: "training",
      severity: "suggest",
      headline: "Push strength",
      body: enforceTwoSentences(
        "Strength is your highest-leverage growth pillar right now. Focus on progressive overload on your heavy compound sets.",
      ),
      state: "fresh",
      actionLabel: "View workouts",
      actionHref: "/train",
    });
  }

  // 4. Streak & Momentum
  if (streakDays >= 7) {
    insights.push({
      id: "insight-streak-celebrate",
      category: "score",
      severity: "celebrate",
      headline: "Unstoppable momentum",
      body: enforceTwoSentences(
        `You have held an active ${streakDays}-day streak. Consistency is the single biggest predictor of long-term physique transformation.`,
      ),
      state: "fresh",
    });
  } else if (streakDays > 0) {
    insights.push({
      id: "insight-streak-keep",
      category: "score",
      severity: "suggest",
      headline: "Protect your streak",
      body: enforceTwoSentences(
        `You are on a ${streakDays}-day streak. Log a quick session or mobility drill today to keep the flame alive.`,
      ),
      state: "fresh",
    });
  } else {
    insights.push({
      id: "insight-streak-reignite",
      category: "score",
      severity: "suggest",
      headline: "Ready to reignite",
      body: enforceTwoSentences(
        "A new streak starts with a single rep. Complete today's daily mission to get back on the board.",
      ),
      state: "fresh",
      actionLabel: "View mission",
      actionHref: "/home",
    });
  }

  return insights;
}
