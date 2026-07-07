import { z } from "zod";

/**
 * Selection steps (goal/experience/split) are optional here — there's
 * nothing to "fail" once one is picked, so each step gates its own
 * Continue button on presence (`!!watch(field)`), not a Zod error message.
 * Zod's range validation earns its keep on the two numeric steps instead,
 * where out-of-range values are meaningful.
 */
export const onboardingSchema = z.object({
  goal: z.enum(["cut", "bulk", "maintain", "endurance"]).optional(),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  activeSplit: z.enum(["ai", "ppl", "upper-lower", "bro", "full-body"]).optional(),
  sessionFrequency: z.enum(["once", "twice", "flexible"]).optional(),
  goalBodyShape: z.enum(["lean", "athletic", "muscular", "powerful"]).optional(),
  trainingDaysPerWeek: z.number().min(3).max(6),
  hydrationGoalLiters: z.number().min(1.5).max(5),
});

export type OnboardingValues = z.infer<typeof onboardingSchema>;

export const defaultOnboardingValues: OnboardingValues = {
  trainingDaysPerWeek: 4,
  hydrationGoalLiters: 2.5,
};
