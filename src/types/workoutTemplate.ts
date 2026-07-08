/**
 * WorkoutTemplate — docs/DATA_MODELS.md "WorkoutTemplate". The planned
 * blueprint a Mission points at ("Push Day A"'s ordered exercise list).
 * Deliberately minimal: only what Session needs to instantiate a workout,
 * not the full planner model (schedule patterns, program assignment).
 */

/** One planned set. An array of these replaces the old targetSets/targetReps
 *  scalars so an exercise can be "8, 8, 6, 4" — any set count, any reps per
 *  set (user-authored plans made the scalar shape untenable). */
export interface TemplateSet {
  targetReps: number;
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
