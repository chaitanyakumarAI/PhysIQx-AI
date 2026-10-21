"use client";

import { useMemo } from "react";
import { useLedger, useStoresHydrated, useTodayIso } from "@/features/shared/hooks/useAthlete";
import type { CompletedSessionSummary } from "@/types/workoutSession";
import { describeWorkoutCelebration, type WorkoutCelebration } from "../lib/celebration";

/**
 * What the just-finished workout earned, measured against the ledger the
 * athlete is looking at (their own, or the sample data). Null until every
 * store has loaded — a half-hydrated ledger would report the wrong level.
 */
export function useWorkoutCelebration(summary: CompletedSessionSummary | undefined): WorkoutCelebration | null {
  const hydrated = useStoresHydrated();
  const { ledger } = useLedger();
  const today = useTodayIso();
  return useMemo(
    () => (hydrated && summary ? describeWorkoutCelebration(ledger, summary, today) : null),
    [hydrated, ledger, summary, today],
  );
}
