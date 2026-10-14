import { z } from "zod";

const thisYear = new Date().getFullYear();

/** Plausible ranges for the "About you" step. */
export const ABOUT_YOU_LIMITS = {
  nameMax: 30,
  birthYear: { min: thisYear - 100, max: thisYear - 13 },
  heightCm: { min: 120, max: 230 },
  weightKg: { min: 30, max: 300 },
} as const;

/**
 * Selection steps (goal/experience/split) are optional here — there's
 * nothing to "fail" once one is picked, so each step gates its own
 * Continue button on presence (`!!watch(field)`), not a Zod error message.
 * Zod's range validation earns its keep on the numeric fields instead,
 * where out-of-range values are meaningful.
 */
export const onboardingSchema = z.object({
  displayName: z.string().trim().min(1).max(ABOUT_YOU_LIMITS.nameMax).optional(),
  sex: z.enum(["male", "female"]).optional(),
  birthYear: z
    .number()
    .int()
    .min(ABOUT_YOU_LIMITS.birthYear.min)
    .max(ABOUT_YOU_LIMITS.birthYear.max)
    .optional(),
  heightCm: z.number().min(ABOUT_YOU_LIMITS.heightCm.min).max(ABOUT_YOU_LIMITS.heightCm.max).optional(),
  weightKg: z.number().min(ABOUT_YOU_LIMITS.weightKg.min).max(ABOUT_YOU_LIMITS.weightKg.max).optional(),
  currentBuild: z
    .enum(["apple", "endomorph", "skinnyfat", "lean", "athletic", "muscular", "powerful"])
    .optional(),
  goal: z.enum(["cut", "bulk", "maintain", "endurance"]).optional(),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  activeSplit: z
    .enum([
      "ai",
      "ppl",
      "upper-lower",
      "bro",
      "full-body",
      "body-part",
      "fat-loss",
      "arnold",
    ])
    .optional(),
  sessionFrequency: z.enum(["once", "twice", "flexible"]).optional(),
  goalBodyShape: z.enum(["lean", "athletic", "muscular", "powerful"]).optional(),
  trainingDaysPerWeek: z.number().min(3).max(6),
});

export type OnboardingValues = z.infer<typeof onboardingSchema>;

export const defaultOnboardingValues: OnboardingValues = {
  trainingDaysPerWeek: 4,
};

/** True when the "About you" answers are complete and in range. */
export function isAboutYouValid(values: OnboardingValues): boolean {
  return onboardingSchema
    .pick({ displayName: true, sex: true, birthYear: true, heightCm: true, weightKg: true })
    .required()
    .safeParse(values).success;
}
