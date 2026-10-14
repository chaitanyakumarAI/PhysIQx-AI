import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserPlan } from "@/types/plan";

/**
 * The athlete's workout plans, and which one is active. The active plan's
 * days rotate into Today's Workout (lib/workoutPlan). Same SSR contract as
 * the other stores: skipHydration + explicit rehydration from
 * StoreHydrator. Editing happens in the PlanEditor's local draft; the store
 * only sees whole-plan saves — no partial-edit states to corrupt on refresh.
 */
interface PlansStoreState {
  plans: UserPlan[];
  activePlanId: string | null;
  /** Adds or replaces a plan. The first plan saved becomes active. */
  savePlan: (plan: UserPlan) => void;
  deletePlan: (planId: string) => void;
  setActivePlan: (planId: string) => void;
}

export const usePlansStore = create<PlansStoreState>()(
  persist(
    (set) => ({
      plans: [],
      activePlanId: null,
      savePlan: (plan) =>
        set((state) => {
          const exists = state.plans.some((existing) => existing.id === plan.id);
          return {
            plans: exists
              ? state.plans.map((existing) => (existing.id === plan.id ? plan : existing))
              : [...state.plans, plan],
            activePlanId: state.activePlanId ?? plan.id,
          };
        }),
      deletePlan: (planId) =>
        set((state) => {
          const plans = state.plans.filter((plan) => plan.id !== planId);
          return {
            plans,
            activePlanId:
              state.activePlanId === planId ? (plans[0]?.id ?? null) : state.activePlanId,
          };
        }),
      setActivePlan: (planId) =>
        set((state) =>
          state.plans.some((plan) => plan.id === planId) ? { activePlanId: planId } : state,
        ),
    }),
    {
      name: "physiqx-plans",
      version: 1,
      // v0 → v1: no active plan existed; the first saved plan becomes it.
      migrate: (persisted, version) => {
        const state = persisted as Partial<PlansStoreState>;
        if (version < 1) state.activePlanId = state.plans?.[0]?.id ?? null;
        return state as PlansStoreState;
      },
      skipHydration: true,
    },
  ),
);

/** The active plan, or null. */
export function selectActivePlan(state: Pick<PlansStoreState, "plans" | "activePlanId">) {
  return state.plans.find((plan) => plan.id === state.activePlanId) ?? null;
}
