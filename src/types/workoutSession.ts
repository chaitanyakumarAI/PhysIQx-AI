/**
 * WorkoutSession / SessionExercise / ExerciseSet — docs/DATA_MODELS.md
 * "WorkoutSession", "SessionExercise / ExerciseSet". The highest-write-volume
 * entity in the whole app and the core offline case: session state must
 * survive a refresh/app-kill while `active`, per that doc's own note.
 *
 * `exerciseName` is denormalized onto SessionExercise (not just an id ref)
 * so the live session screen never needs a catalog lookup mid-workout —
 * one less thing that can go wrong offline.
 */
export type SessionStatus = "active" | "completed" | "abandoned";

export interface ExerciseSet {
  id: string;
  setNumber: number;
  targetReps: number;
  weight: number | null;
  reps: number | null;
  completed: boolean;
}

export interface SessionExercise {
  exerciseId: string;
  exerciseName: string;
  sets: ExerciseSet[];
}

export interface WorkoutSession {
  id: string;
  missionId: string;
  status: SessionStatus;
  startedAt: string;
  completedAt: string | null;
  exercises: SessionExercise[];
  xpReward: number;
}
