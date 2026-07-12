"use client";

import { useMemo, useState } from "react";
import { filterExercises } from "../lib/derive";
import type { FilterChipOption } from "@/components/ui/FilterChipRow";
import { muscleGroupLabels, type Exercise, type MuscleGroup } from "@/types/exercise";

/** Static — computed once, shared by every consumer (Train screen, playground). */
export const muscleFilterOptions: FilterChipOption[] = (
  Object.entries(muscleGroupLabels) as [MuscleGroup, string][]
).map(([id, label]) => ({ id, label }));

/** Results shown per "page" — the top 10, then 10 more per Show-more tap. */
const PAGE_SIZE = 10;

/**
 * The Train screen's exercise-search state: query + single-select muscle
 * filter (re-selecting a chip clears it), and the derived result list.
 * Results are paged: only the top PAGE_SIZE show until the user asks for
 * more, and paging resets whenever the query or muscle filter changes.
 * Extracted so the screen and its dev-playground harness share one
 * implementation instead of two independently-maintained copies.
 */
export function useExerciseFilters(exercises: Exercise[]) {
  const [query, setQueryState] = useState("");
  const [muscle, setMuscle] = useState<MuscleGroup | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const setQuery = (value: string) => {
    setQueryState(value);
    setVisibleCount(PAGE_SIZE);
  };

  const toggleMuscle = (id: MuscleGroup) => {
    setMuscle((current) => (current === id ? null : id));
    setVisibleCount(PAGE_SIZE);
  };

  const filteredExercises = useMemo(
    () => filterExercises(exercises, { query, muscleGroup: muscle }),
    [exercises, query, muscle],
  );

  const visibleExercises = filteredExercises.slice(0, visibleCount);
  const hiddenCount = filteredExercises.length - visibleExercises.length;
  const showMore = () => setVisibleCount((count) => count + PAGE_SIZE);

  return {
    query,
    setQuery,
    muscle,
    toggleMuscle,
    filteredExercises,
    visibleExercises,
    hiddenCount,
    showMore,
  };
}
