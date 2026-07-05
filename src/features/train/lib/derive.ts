import type { Exercise, MuscleGroup } from "@/types/exercise";

/**
 * Pure catalog filtering — the Train screen's search box and muscle-group
 * chips both narrow the same list, so the rule lives here once, outside the
 * UI. Deliberately the only helper in this file: nothing else on the screen
 * derives anything yet.
 */

export interface ExerciseFilters {
  query?: string;
  muscleGroup?: MuscleGroup | null;
}

export function filterExercises(
  exercises: Exercise[],
  filters: ExerciseFilters,
): Exercise[] {
  const query = filters.query?.trim().toLowerCase() ?? "";

  return exercises.filter((exercise) => {
    const matchesQuery =
      query === "" || exercise.name.toLowerCase().includes(query);
    const matchesMuscle =
      !filters.muscleGroup ||
      exercise.muscleGroups.includes(filters.muscleGroup);
    return matchesQuery && matchesMuscle;
  });
}
