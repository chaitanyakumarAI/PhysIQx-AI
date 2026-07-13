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
  const muscleGroup = filters.muscleGroup ?? null;

  const matches = exercises.filter((exercise) => {
    const matchesQuery =
      query === "" || exercise.name.toLowerCase().includes(query);
    const matchesMuscle =
      !muscleGroup || exercise.muscleGroups.includes(muscleGroup);
    return matchesQuery && matchesMuscle;
  });

  if (muscleGroup) {
    // Ranked by the authored stimulus share (muscleHit): the harder a lift
    // hits the selected group, the higher it lists — Deadlift (back 45)
    // tops Back but sits under leg-primary lifts in Legs. Stable sort, so
    // catalog order (compounds before isolations) breaks percentage ties.
    matches.sort(
      (a, b) => (b.muscleHit[muscleGroup] ?? 0) - (a.muscleHit[muscleGroup] ?? 0),
    );
  }

  return matches;
}
