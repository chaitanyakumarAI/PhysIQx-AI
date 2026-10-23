import { z } from "zod";
import { MAX_SESSION_XP } from "@/features/session/lib/setValidation";

/**
 * What the server accepts from the outbox when a workout syncs. Bounds are
 * generous for real training and tight enough that a tampered request can't
 * write absurd volume or XP. Mirrors WorkoutSession (@/types/workoutSession).
 */
const id = z.string().min(1).max(200);
const nullableNumber = (max: number) => z.number().finite().min(0).max(max).nullable();

export const exerciseSetSchema = z.object({
  id,
  setNumber: z.number().int().min(1).max(100),
  targetReps: z.number().int().min(0).max(1000),
  toFailure: z.boolean().optional(),
  durationSeconds: z.number().int().min(0).max(24 * 60 * 60).optional(),
  weight: nullableNumber(1000),
  reps: z.number().int().min(0).max(1000).nullable(),
  rpe: z.number().min(1).max(10).nullable(),
  completed: z.boolean(),
});

export const sessionExerciseSchema = z.object({
  exerciseId: id,
  exerciseName: z.string().min(1).max(200),
  restSeconds: z.number().int().min(0).max(3600),
  equipment: z.string().max(50).optional(),
  sets: z.array(exerciseSetSchema).max(50),
  suggest: z.object({ weightKg: z.number(), reps: z.number() }).nullable(),
});

export const finishedSessionSchema = z.object({
  id,
  missionId: id,
  title: z.string().min(1).max(200),
  status: z.enum(["completed", "abandoned"]),
  startedAt: z.iso.datetime(),
  completedAt: z.iso.datetime().nullable(),
  exercises: z.array(sessionExerciseSchema).max(60),
  xpReward: z.number().int().min(0).max(MAX_SESSION_XP),
});

export type FinishedSessionInput = z.infer<typeof finishedSessionSchema>;
