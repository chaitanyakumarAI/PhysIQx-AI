import type { WorkoutSession } from "@/types/workoutSession";
import type { FinishedSessionInput } from "@/features/session/lib/sessionSchema";
import { summarize } from "@/features/session/lib/summarize";

/** The JSON shape `save_workout_session` (migration 006) expects. */
export interface WorkoutPayload {
  client_ref: string;
  template_id: string;
  template_name: string;
  status: "completed" | "abandoned";
  started_at: string;
  completed_at: string;
  total_volume_kg: number;
  xp_earned: number;
  exercises: {
    exercise_id: string;
    exercise_name: string;
    sets: { set_number: number; weight_kg: number; reps: number; rpe: number | null; is_pr: boolean }[];
  }[];
}

/**
 * Builds the database payload from a validated session. Volume and XP are
 * recomputed here with the same `summarize` the client uses, so totals sent
 * by the client are never trusted. Only completed sets with reps are stored;
 * the heaviest of them per exercise is flagged for PR derivation.
 */
export function toWorkoutPayload(session: FinishedSessionInput, fallbackCompletedAt: string): WorkoutPayload {
  const completedAt = session.completedAt ?? fallbackCompletedAt;
  const summary = summarize(session as WorkoutSession, completedAt, session.status);
  return {
    client_ref: session.id,
    template_id: session.missionId,
    template_name: session.title,
    status: session.status,
    started_at: session.startedAt,
    completed_at: completedAt,
    total_volume_kg: summary.totalVolumeKg,
    // The ledger credits work done, abandoned or not; a restore must match it.
    // Only completions become xp_transactions (save_workout_session).
    xp_earned: summary.xpEarned,
    exercises: session.exercises.map((exercise) => {
      const done = exercise.sets.filter((set) => set.completed && (set.reps ?? 0) > 0);
      const heaviest = Math.max(0, ...done.map((set) => set.weight ?? 0));
      return {
        exercise_id: exercise.exerciseId,
        exercise_name: exercise.exerciseName,
        sets: done.map((set) => ({
          set_number: set.setNumber,
          weight_kg: set.weight ?? 0,
          reps: set.reps ?? 0,
          rpe: set.rpe,
          is_pr: heaviest > 0 && (set.weight ?? 0) === heaviest,
        })),
      };
    }),
  };
}
