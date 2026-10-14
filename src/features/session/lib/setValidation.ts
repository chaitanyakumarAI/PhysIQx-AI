import type { Equipment } from "@/types/exercise";
import type { ExerciseSet } from "@/types/workoutSession";

/**
 * Guards on what a logged set may contain. Inputs stay free-form while the
 * athlete types; these run at the store boundary so the ledger never holds
 * negative loads, absurd rep counts, or "completed" sets with no work in
 * them — every downstream number (volume, e1RM, score, XP) reads the ledger.
 */
export const SET_LIMITS = {
  maxWeightKg: 1000,
  maxReps: 300,
  /** Timed sets log seconds in the reps field. */
  maxSeconds: 3600,
} as const;

export interface SetValues {
  weight: number | null;
  reps: number | null;
}

/** Weight in kg: never negative, capped, rounded to 0.01 kg. */
export function sanitizeWeight(value: number | null | undefined): number | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  const clamped = Math.min(SET_LIMITS.maxWeightKg, Math.max(0, value));
  return Math.round(clamped * 100) / 100;
}

/** Whole reps (or seconds for timed sets): never negative, capped. */
export function sanitizeReps(
  value: number | null | undefined,
  timed = false,
): number | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  const max = timed ? SET_LIMITS.maxSeconds : SET_LIMITS.maxReps;
  return Math.min(max, Math.max(0, Math.round(value)));
}

/** RPE 1–10 in half steps. */
export function sanitizeRpe(value: number | null | undefined): number | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  return Math.round(Math.min(10, Math.max(1, value)) * 2) / 2;
}

export type CompletionResult =
  | { ok: true; values: SetValues }
  | { ok: false; missing: "reps" | "weight" };

/** Equipment whose sets mean nothing without a load. Bodyweight work (and
 *  sessions persisted before equipment was recorded) may omit it. */
export function requiresLoad(equipment: Equipment | undefined): boolean {
  return equipment !== undefined && equipment !== "bodyweight";
}

/**
 * The values a set is completed with. Whatever the athlete typed wins;
 * an empty field takes the ghost value shown in it (tapping ✓ on a ghost
 * row accepts the suggestion, like every serious lifting log). Fails —
 * naming the missing field — when there's no positive rep count, or no
 * load on loaded equipment: that set holds no real work.
 */
export function resolveCompletionValues(
  set: Pick<ExerciseSet, "weight" | "reps" | "durationSeconds">,
  ghost?: Partial<SetValues> | null,
  equipment?: Equipment,
): CompletionResult {
  const timed = Boolean(set.durationSeconds);
  const reps = sanitizeReps(set.reps ?? ghost?.reps ?? null, timed);
  if (reps === null || reps <= 0) return { ok: false, missing: "reps" };
  const weight = sanitizeWeight(set.weight ?? ghost?.weight ?? null);
  if (requiresLoad(equipment) && !timed && (weight === null || weight <= 0)) {
    return { ok: false, missing: "weight" };
  }
  return { ok: true, values: { weight, reps } };
}

/**
 * XP scales with the work actually done: the full reward for every planned
 * set, proportionally less for a cut-short session.
 */
export function computeEarnedXp(
  xpReward: number,
  completedSets: number,
  totalSets: number,
): number {
  if (totalSets <= 0 || completedSets <= 0) return 0;
  return Math.round(xpReward * Math.min(1, completedSets / totalSets));
}
