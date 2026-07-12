"use client";

import { useState } from "react";
import { ChevronDown, SearchX, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import {
  FilterChipRow,
  type FilterChipOption,
} from "@/components/ui/FilterChipRow";
import { ExerciseListItem } from "@/features/train/components/ExerciseListItem";
import { WorkoutHeroCard } from "@/features/train/components/WorkoutHeroCard";
import {
  muscleFilterOptions,
  useExerciseFilters,
} from "@/features/train/hooks/useExerciseFilters";
import type { MuscleGroup } from "@/types/exercise";
import type { TrainData } from "@/features/train/types";

export function TrainPlaygroundDemo({
  mission,
  programs,
  activeProgramId,
  exercises,
  catalogSize,
}: TrainData) {
  const [programId, setProgramId] = useState(activeProgramId);
  const {
    query,
    setQuery,
    muscle,
    toggleMuscle,
    filteredExercises,
    visibleExercises,
    hiddenCount,
    showMore,
  } = useExerciseFilters(exercises);

  const programOptions: FilterChipOption[] = programs.map((program) => ({
    id: program.id,
    label: program.name,
    icon: program.source === "ai" ? Sparkles : undefined,
  }));

  return (
    <PageContainer withBottomNav={false}>
      <Section title="Train feature — component preview">
        <WorkoutHeroCard mission={mission} />
        <WorkoutHeroCard mission={null} />
      </Section>

      <Section title="Programs">
        <FilterChipRow
          label="Programs"
          options={programOptions}
          selectedId={programId}
          onSelect={setProgramId}
        />
      </Section>

      <Section title="Exercise library">
        <SearchInput
          placeholder={`Search ${catalogSize} exercises`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <FilterChipRow
          label="Muscle groups"
          variant="accent"
          options={muscleFilterOptions}
          selectedId={muscle}
          onSelect={(id) => toggleMuscle(id as MuscleGroup)}
        />
        <div className="flex flex-col gap-3">
          {filteredExercises.length > 0 ? (
            <>
              {visibleExercises.map((exercise) => (
                <ExerciseListItem
                  key={exercise.id}
                  exercise={exercise}
                  href={`/train/exercises/${exercise.id}`}
                />
              ))}
              {hiddenCount > 0 && (
                <Button variant="secondary" size="sm" fullWidth onClick={showMore}>
                  Show more
                  <span className="text-foreground-secondary">
                    {hiddenCount} remaining
                  </span>
                  <ChevronDown aria-hidden className="size-4" />
                </Button>
              )}
            </>
          ) : (
            <EmptyState
              icon={SearchX}
              title="No exercises found"
              description="Try a different search or clear the muscle filter."
            />
          )}
        </div>
      </Section>
    </PageContainer>
  );
}
