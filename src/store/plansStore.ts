import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserPlan } from "@/types/plan";

/**
 * User-authored workout plans — the first persisted user *content* (the
 * session store persists in-flight state; this persists things the user
 * built). Same SSR contract as the other stores: skipHydration + explicit
 * rehydration from StoreHydrator. Editing happens in the PlanEditor's local
 * draft; the store only sees whole-plan saves — no partial-edit states to
 * corrupt on refresh.
 */
interface PlansStoreState {
  plans: UserPlan[];
  savePlan: (plan: UserPlan) => void;
  deletePlan: (planId: string) => void;
}

export const usePlansStore = create<PlansStoreState>()(
  persist(
    (set) => ({
      plans: [],
      savePlan: (plan) =>
        set((state) => {
          const exists = state.plans.some((existing) => existing.id === plan.id);
          return {
            plans: exists
              ? state.plans.map((existing) => (existing.id === plan.id ? plan : existing))
              : [...state.plans, plan],
          };
        }),
      deletePlan: (planId) =>
        set((state) => ({
          plans: state.plans.filter((plan) => plan.id !== planId),
        })),
    }),
    {
      name: "physiqx-plans",
      skipHydration: true,
    },
  ),
);
