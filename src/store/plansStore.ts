import { create } from "zustand";
import { persist } from "zustand/middleware";
import { emitSyncEvent } from "@/lib/sync/syncEvents";
import type { UserPlan } from "@/types/plan";

/**
 * The athlete's workout plans, and which one is active. The active plan's
 * days rotate into Today's Workout (lib/workoutPlan). Same SSR contract as
 * the other stores: skipHydration + explicit rehydration from
 * StoreHydrator. Editing happens in the PlanEditor's local draft; the store
 * only sees whole-plan saves — no partial-edit states to corrupt on refresh.
 * Every change is announced to the sync client (lib/sync/syncEvents).
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
    (set, get) => {
      /** The active plan is part of the synced profile. */
      const syncActivePlan = (before: string | null) => {
        if (get().activePlanId !== before) emitSyncEvent({ type: "profileChanged" });
      };
      return {
        plans: [],
        activePlanId: null,
        savePlan: (plan) => {
          const before = get().activePlanId;
          set((state) => {
            const exists = state.plans.some((existing) => existing.id === plan.id);
            return {
              plans: exists
                ? state.plans.map((existing) => (existing.id === plan.id ? plan : existing))
                : [...state.plans, plan],
              activePlanId: state.activePlanId ?? plan.id,
            };
          });
          emitSyncEvent({ type: "planSaved", plan });
          syncActivePlan(before);
        },
        deletePlan: (planId) => {
          const before = get().activePlanId;
          if (!get().plans.some((plan) => plan.id === planId)) return;
          set((state) => {
            const plans = state.plans.filter((plan) => plan.id !== planId);
            return {
              plans,
              activePlanId:
                state.activePlanId === planId ? (plans[0]?.id ?? null) : state.activePlanId,
            };
          });
          emitSyncEvent({ type: "planDeleted", planId });
          syncActivePlan(before);
        },
        setActivePlan: (planId) => {
          const before = get().activePlanId;
          set((state) =>
            state.plans.some((plan) => plan.id === planId) ? { activePlanId: planId } : state,
          );
          syncActivePlan(before);
        },
      };
    },
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
