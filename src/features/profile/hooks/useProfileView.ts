"use client";

import { useProgression } from "@/features/collection/hooks/useProgression";
import { useAthleteState } from "@/features/shared/hooks/useAthlete";

/**
 * Profile's view of the ledger: lifetime totals, level, and collection —
 * all derived, so Profile can never disagree with Home or History.
 */
export function useProfileView() {
  const athlete = useAthleteState();
  const progression = useProgression();
  const sessions = athlete.ledger.sessions.filter((session) => session.setsCompleted > 0).length;
  return {
    athlete,
    progression,
    stats: { sessions, totalXP: progression.totalXp },
  };
}
