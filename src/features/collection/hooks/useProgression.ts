"use client";

import { useMemo } from "react";
import { useLedger, useStoresHydrated, useTodayIso } from "@/features/shared/hooks/useAthlete";
import { computeProgression, type ProgressionState } from "@/lib/gamification/progression";

/** XP, level, and the collection, derived from the (local or demo) ledger. */
export function useProgression(): ProgressionState & { hydrated: boolean; demo: boolean } {
  const hydrated = useStoresHydrated();
  const { ledger, demo } = useLedger();
  const today = useTodayIso();
  const state = useMemo(() => computeProgression(ledger, today), [ledger, today]);
  return { ...state, hydrated, demo };
}
