import type { ProgramType } from "@/types/training";

/**
 * Profile — docs/DATA_MODELS.md "Profile". View-model shape for the frontend;
 * excludes persistence-only fields (createdAt/updatedAt) per that doc's own
 * "omit the obvious" convention. Cross-feature: Home, Profile, and Onboarding
 * all read this.
 */
export type ProfileGoal = "cut" | "bulk" | "maintain" | "endurance";

export const goalLabels: Record<ProfileGoal, string> = {
  cut: "Cut",
  bulk: "Bulk",
  maintain: "Maintain",
  endurance: "Endurance",
};

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export interface Profile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  goal: ProfileGoal;
  experienceLevel: ExperienceLevel;
  trainingDaysPerWeek: number;
  /** The active split, e.g. "ppl" — Profile's SPLIT stat. */
  activeSplit: ProgramType;
  proteinGoalGrams: number;
  hydrationGoalLiters: number;
  dnaArchetype: string;
  units: "kg" | "lb";
}
