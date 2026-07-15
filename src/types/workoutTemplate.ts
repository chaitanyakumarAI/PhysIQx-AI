/**
 * WorkoutTemplate — docs/DATA_MODELS.md "WorkoutTemplate". The planned
 * blueprint a Mission points at ("Push Day A"'s ordered exercise list).
 * Deliberately minimal: only what Session needs to instantiate a workout,
 * not the full planner model (schedule patterns, program assignment).
 */

/** One planned set. An array of these replaces the old targetSets/targetReps
 *  scalars so an exercise can be "8, 8, 6, 4" — any set count, any reps per
 *  set (user-authored plans made the scalar shape untenable).
 *
 *  Reps philosophy: targetReps is a TARGET, never a cap — logging more is
 *  always valid. `toFailure` marks AMRAP sets (targetReps then serves as
 *  the input placeholder); `durationSeconds` marks timed work (holds,
 *  carries, intervals) where targetReps mirrors the seconds. */
export interface TemplateSet {
  targetReps: number;
  toFailure?: boolean;
  durationSeconds?: number;
}

/** "×10 target" | "To failure" | "40 sec" — the one way sets are spoken of. */
export function formatSetTarget(set: {
  targetReps: number;
  toFailure?: boolean;
  durationSeconds?: number;
}): string {
  if (set.toFailure) return "To failure";
  if (set.durationSeconds) return `${set.durationSeconds} sec`;
  return `×${set.targetReps} target`;
}

/** Whole-prescription summary: "4 × 10 target", "10/8/6/6 target", "3 × to failure", "4 × 60 sec". */
export function describeSets(sets: TemplateSet[]): string {
  const first = sets[0];
  if (!first) return "";
  if (first.toFailure) return `${sets.length} × to failure`;
  if (first.durationSeconds) return `${sets.length} × ${first.durationSeconds} sec`;
  const reps = sets.map((s) => s.targetReps);
  const uniform = reps.every((r) => r === reps[0]);
  return uniform
    ? `${sets.length} × ${reps[0]} target`
    : `${reps.join("/")} target`;
}

export interface WorkoutTemplateExercise {
  exerciseId: string;
  /** One entry per planned set, in order. */
  sets: TemplateSet[];
  restSeconds: number;
}

export interface WorkoutTemplate {
  id: string;
  missionId: string;
  exercises: WorkoutTemplateExercise[];
}

/** Uniform sets ("4×8") without hand-writing repeated literals. */
export function setsOf(count: number, targetReps: number): TemplateSet[] {
  return Array.from({ length: count }, () => ({ targetReps }));
}
