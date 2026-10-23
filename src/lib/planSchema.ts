import { z } from "zod";

/**
 * What the server accepts when a plan syncs. Mirrors UserPlan (@/types/plan).
 * Sanity bounds only — looser than the editor, so nothing a screen can save
 * is ever refused (the outbox would retry it forever).
 */
const templateSetSchema = z
  .object({
    targetReps: z.number().int().min(0).max(10_000),
    toFailure: z.boolean().optional(),
    durationSeconds: z.number().int().min(0).max(24 * 60 * 60).optional(),
  })
  .strict();

const planExerciseSchema = z
  .object({
    exerciseId: z.string().min(1).max(200),
    sets: z.array(templateSetSchema).max(50),
    restSeconds: z.number().int().min(0).max(60 * 60),
  })
  .strict();

const planDaySchema = z
  .object({
    id: z.string().min(1).max(200),
    name: z.string().max(200),
    exercises: z.array(planExerciseSchema).max(60),
  })
  .strict();

export const userPlanSchema = z
  .object({
    id: z.string().min(1).max(200),
    name: z.string().max(200),
    days: z.array(planDaySchema).max(31),
  })
  .strict();
