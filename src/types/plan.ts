import type { WorkoutTemplateExercise } from "./workoutTemplate";

/**
 * User-authored workout plans — pulled forward from DATA_MODELS.md's
 * "Future: user-created" note as an explicit product decision (July 2026):
 * presets exist, but most athletes run their own split. A plan is days of
 * template exercises; starting a day instantiates it as a session exactly
 * like a preset mission's template.
 */
export interface PlanDay {
  id: string;
  name: string;
  exercises: WorkoutTemplateExercise[];
}

export interface UserPlan {
  id: string;
  name: string;
  days: PlanDay[];
}
