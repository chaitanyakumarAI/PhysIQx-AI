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

/** How workouts are scheduled within a day (once / cardio+strength split / flexible). */
export type SessionFrequency = "once" | "twice" | "flexible";

export const sessionFrequencyLabels: Record<SessionFrequency, string> = {
  once: "Once a day",
  twice: "Twice a day",
  flexible: "Flexible",
};

/**
 * The physique the user is training toward — replaceable default content
 * authored for the onboarding body-shape question; a future phase may pair
 * these with visuals (camera/scan integration is explicitly out of scope).
 */
export type GoalBodyShape = "lean" | "athletic" | "muscular" | "powerful";

export const goalBodyShapeLabels: Record<GoalBodyShape, string> = {
  lean: "Lean & defined",
  athletic: "Athletic & balanced",
  muscular: "Muscular & built",
  powerful: "Powerful & strong",
};

export interface Profile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  goal: ProfileGoal;
  experienceLevel: ExperienceLevel;
  trainingDaysPerWeek: number;
  /** The active split, e.g. "ppl" — Profile's SPLIT stat. */
  activeSplit: ProgramType;
  sessionFrequency: SessionFrequency;
  goalBodyShape: GoalBodyShape;
  hydrationGoalLiters: number;
  dnaArchetype: string;
  units: "kg" | "lb";
}
