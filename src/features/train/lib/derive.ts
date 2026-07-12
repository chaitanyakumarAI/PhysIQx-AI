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

/**
 * Lower = more relevant: an exercise's `muscleGroups` array is ordered by
 * involvement (see the Exercise type contract), so the position of the
 * selected group IS its relevance. Deadlift (back-primary) ranks top of the
 * Back filter but below leg-primary lifts in the Legs filter — exercises
 * that only minorly hit a group sink, never lead.
 */
function involvementRank(exercise: Exercise, muscleGroup: MuscleGroup): number {
  return exercise.muscleGroups.indexOf(muscleGroup);
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
    // Stable sort: primary-muscle lifts first, then secondary, then minor —
    // catalog order (compounds before isolations) breaks ties within a tier.
    matches.sort(
      (a, b) => involvementRank(a, muscleGroup) - involvementRank(b, muscleGroup),
    );
  }

  return matches;
}
