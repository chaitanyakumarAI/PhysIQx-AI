"use client";

import { useMemo, useState } from "react";
import { filterExercises } from "../lib/derive";
import type { FilterChipOption } from "@/components/ui/FilterChipRow";
import { muscleGroupLabels, type Exercise, type MuscleGroup } from "@/types/exercise";

/** Static — computed once, shared by every consumer (Train screen, playground). */
export const muscleFilterOptions: FilterChipOption[] = (
  Object.entries(muscleGroupLabels) as [MuscleGroup, string][]
).map(([id, label]) => ({ id, label }));

/**
 * The Train screen's exercise-search state: query + single-select muscle
 * filter (re-selecting a chip clears it), and the derived result list.
 * Extracted so the screen and its dev-playground harness share one
 * implementation instead of two independently-maintained copies.
 */
export function useExerciseFilters(exercises: Exercise[]) {
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState<MuscleGroup | null>(null);

  const toggleMuscle = (id: MuscleGroup) => {
    setMuscle((current) => (current === id ? null : id));
  };

  const filteredExercises = useMemo(
    () => filterExercises(exercises, { query, muscleGroup: muscle }),
    [exercises, query, muscle],
  );

  return { query, setQuery, muscle, toggleMuscle, filteredExercises };
}
