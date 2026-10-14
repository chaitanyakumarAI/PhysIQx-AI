"use client";

import { useMemo } from "react";
import { useAthleteState } from "@/features/shared/hooks/useAthlete";
import { evaluateAchievements } from "@/lib/achievementEngine";
import { computeLevel } from "@/lib/levels";
import { detectRecentPRs } from "@/lib/prEngine";

/**
 * Profile's view of the ledger: lifetime totals, level, and achievements —
 * all derived, so Profile can never disagree with Home or History.
 */
export function useProfileView() {
  const athlete = useAthleteState();
  const { ledger } = athlete;

  const derived = useMemo(() => {
    const sessions = ledger.sessions.filter((session) => session.setsCompleted > 0);
    const achievements = evaluateAchievements({
      history: sessions,
      streakDays: athlete.streak.longestStreakDays,
      cardio: ledger.cardio,
      prCount: detectRecentPRs(sessions, "0000-01-01").length,
    });
    const workoutXp = sessions.reduce((sum, session) => sum + session.xpEarned, 0);
    const totalXP = workoutXp + achievements.totalXpEarned;
    return {
      achievements: achievements.achievements,
      stats: { sessions: sessions.length, totalXP },
      level: computeLevel(totalXP),
    };
  }, [ledger, athlete.streak.longestStreakDays]);

  return { athlete, ...derived };
}
