import type { Profile } from "@/types/profile";

/**
 * Alex's profile — shown on Home and Profile, so it is defined once here
 * rather than per feature, per the same reasoning as src/data/mission.ts.
 */
export const mockProfile: Profile = {
  id: "user-alex",
  displayName: "Alex",
  goal: "cut",
  experienceLevel: "advanced",
  trainingDaysPerWeek: 5,
  activeSplit: "ppl",
  hydrationGoalLiters: 3,
  dnaArchetype: "Endurance-forward hybrid athlete",
  units: "kg",
};
