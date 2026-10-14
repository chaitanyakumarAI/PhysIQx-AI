"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useShallow } from "zustand/react/shallow";
import { mockExercises } from "@/data/exercises";
import { deriveAthleteState, type AthleteState } from "@/lib/athleteState";
import type { ActiveSessionInfo } from "@/lib/coachEngine";
import { todayIso as readTodayIso } from "@/lib/dates";
import { buildDemoData } from "@/lib/demo/demoLedger";
import { computeScoreTrend } from "@/lib/scoreEngine";
import { useCardioStore } from "@/store/cardioStore";
import { selectActivePlan, usePlansStore } from "@/store/plansStore";
import { useProfileStore } from "@/store/profileStore";
import { useSessionStore } from "@/store/sessionStore";
import { DEFAULT_TRAINING_DAYS_PER_WEEK, type Ledger } from "@/types/ledger";
import type { UserPlan } from "@/types/plan";
import type { ScoreTrendPoint } from "@/types/score";

/**
 * The client-side seam every screen reads: the local-first ledger (or the
 * demo ledger) and the athlete state derived from it. Replaces the old
 * server get*Data fixtures — there is one truth, and it lives on device.
 */

const PERSISTED_STORES = [useSessionStore, useProfileStore, usePlansStore, useCardioStore];

function subscribeToHydration(onChange: () => void) {
  const unsubscribers = PERSISTED_STORES.map((store) => store.persist.onFinishHydration(onChange));
  return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
}

const allStoresHydrated = () => PERSISTED_STORES.every((store) => store.persist.hasHydrated());

/**
 * False on the server and until every persisted store has loaded from
 * localStorage. Screens render a skeleton until then — never fixture data
 * that would flash and change.
 */
export function useStoresHydrated(): boolean {
  return useSyncExternalStore(subscribeToHydration, allStoresHydrated, () => false);
}

/** The local calendar day, rolling over at midnight while the app is open. */
export function useTodayIso(): string {
  const [today, setToday] = useState(readTodayIso);
  useEffect(() => {
    const timer = setInterval(() => {
      const now = readTodayIso();
      setToday((previous) => (previous === now ? previous : now));
    }, 60_000);
    return () => clearInterval(timer);
  }, []);
  return today;
}

export interface LedgerView {
  ledger: Ledger;
  activePlan: UserPlan | null;
  /** True when showing generated demo data instead of the athlete's own. */
  demo: boolean;
}

export function useLedger(): LedgerView {
  const sessions = useSessionStore((state) => state.history);
  const cardio = useCardioStore((state) => state.activities);
  const activePlan = usePlansStore(selectActivePlan);
  const today = useTodayIso();
  const profile = useProfileStore(
    useShallow((state) => ({
      displayName: state.displayName,
      sex: state.sex,
      birthYear: state.birthYear,
      currentBuild: state.currentBuild,
      heightCm: state.heightCm,
      weighIns: state.weightEntries,
      onboarding: state.onboardingProfile,
      demoMode: state.demoMode,
    })),
  );

  return useMemo(() => {
    if (profile.demoMode) {
      const demo = buildDemoData(today);
      return { ledger: demo.ledger, activePlan: demo.plan, demo: true };
    }
    const onboarding = profile.onboarding;
    return {
      demo: false,
      activePlan,
      ledger: {
        sessions,
        cardio,
        weighIns: profile.weighIns,
        profile: {
          displayName: profile.displayName,
          sex: profile.sex,
          birthYear: profile.birthYear,
          heightCm: profile.heightCm,
          currentBuild: profile.currentBuild,
          goal: onboarding?.goal ?? null,
          experienceLevel: onboarding?.experienceLevel ?? null,
          goalBodyShape: onboarding?.goalBodyShape ?? null,
          trainingDaysPerWeek: onboarding?.trainingDaysPerWeek ?? DEFAULT_TRAINING_DAYS_PER_WEEK,
        },
      },
    };
  }, [sessions, cardio, activePlan, profile, today]);
}

/** The in-progress workout, if any, as the coach and banners need it. */
export function useActiveSessionInfo(): ActiveSessionInfo | null {
  const session = useSessionStore((state) => state.session);
  return useMemo(() => {
    if (!session || session.status !== "active") return null;
    const sets = session.exercises.flatMap((exercise) => exercise.sets);
    return {
      missionId: session.missionId,
      title: session.title,
      completedSets: sets.filter((set) => set.completed).length,
      totalSets: sets.length,
    };
  }, [session]);
}

export interface AthleteView extends AthleteState, LedgerView {
  /** False until local data has loaded — render a skeleton until then. */
  hydrated: boolean;
}

export function useAthleteState(): AthleteView {
  const hydrated = useStoresHydrated();
  const view = useLedger();
  const activeSession = useActiveSessionInfo();
  const today = useTodayIso();
  const state = useMemo(
    () =>
      deriveAthleteState({
        ledger: view.ledger,
        todayIso: today,
        activePlan: view.activePlan,
        activeSession: view.demo ? null : activeSession,
        catalog: mockExercises,
      }),
    [view, today, activeSession],
  );
  return { ...state, ...view, hydrated };
}

/** Finalized daily scores for the trend chart. */
export function useScoreTrend(days: number): ScoreTrendPoint[] {
  const { ledger } = useLedger();
  const today = useTodayIso();
  return useMemo(() => computeScoreTrend(ledger, today, days), [ledger, today, days]);
}
