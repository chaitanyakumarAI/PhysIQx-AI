/**
 * WorkoutTemplate — docs/DATA_MODELS.md "WorkoutTemplate". The planned
 * blueprint a Mission points at ("Push Day A"'s ordered exercise list).
 * Deliberately minimal: only what Session needs to instantiate a workout,
 * not the full planner model (schedule patterns, program assignment).
 */
export interface WorkoutTemplateExercise {
  exerciseId: string;
  targetSets: number;
  targetReps: number;
  restSeconds: number;
}

export interface WorkoutTemplate {
  id: string;
  missionId: string;
  exercises: WorkoutTemplateExercise[];
}
