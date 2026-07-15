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
  /** A target, never a cap — logging more reps is always valid. */
  targetReps: number;
  /** AMRAP set: the UI shows "To failure" instead of the rep target. */
  toFailure?: boolean;
  /** Timed set (holds/carries/intervals): the UI shows seconds. */
  durationSeconds?: number;
  weight: number | null;
  reps: number | null;
  completed: boolean;
}

export interface SessionExercise {
  exerciseId: string;
  exerciseName: string;
  /** Denormalized from the template, same reasoning as exerciseName —
   *  the rest timer must not need a template lookup mid-workout. */
  restSeconds: number;
  sets: ExerciseSet[];
}

export interface WorkoutSession {
  id: string;
  missionId: string;
  /** Denormalized display title ("Push Day A" / a custom plan day's name) —
   *  sessions started from user plans have no Mission entity to look up. */
  title: string;
  status: SessionStatus;
  startedAt: string;
  completedAt: string | null;
  exercises: SessionExercise[];
  xpReward: number;
}
