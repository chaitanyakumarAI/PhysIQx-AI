"use client";

import { useMemo, useState } from "react";
import { ChevronDown, SearchX, Sparkles } from "lucide-react";
import { m } from "framer-motion";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { ScreenHeader } from "@/components/navigation/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { fadeInUp, staggerChildren } from "@/lib/motion";
import { FilterChipRow, type FilterChipOption } from "@/components/ui/FilterChipRow";
import { ExerciseListItem } from "@/features/train/components/ExerciseListItem";
import { MyPlansSection } from "@/features/train/components/MyPlansSection";
import { WorkoutHeroCard } from "@/features/train/components/WorkoutHeroCard";
import {
  muscleFilterOptions,
  useExerciseFilters,
} from "@/features/train/hooks/useExerciseFilters";
import type { TrainData } from "@/features/train/types";
import type { MuscleGroup } from "@/types/exercise";

export type TrainScreenProps = TrainData;

/**
 * Pure composition + local filter state: every visual/state decision (rest
 * day, chip selection styling, empty results) lives in the Train feature
 * components and filterExercises. This file only arranges them, holds the
 * filter UI state, and orchestrates entrance motion.
 */
export function TrainScreen({
  mission,
  programs,
  activeProgramId,
  exercises,
  catalogSize,
}: TrainScreenProps) {
  const router = useRouter();
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

  const programOptions: FilterChipOption[] = useMemo(
    () =>
      programs.map((program) => ({
        id: program.id,
        label: program.name,
        icon: program.source === "ai" ? Sparkles : undefined,
      })),
    [programs],
  );

  return (
    <PageContainer>
      {/* display:contents keeps PageContainer's flex/gap acting directly on
          these items — this node exists only to orchestrate the stagger. */}
      <m.div
        variants={staggerChildren}
        initial="hidden"
        animate="visible"
        className="contents"
      >
        <m.div variants={fadeInUp}>
          <ScreenHeader
            title="Train"
            subtitle="Every rep feeds your PhysIQ Score."
          />
        </m.div>

        <m.div variants={fadeInUp}>
          <WorkoutHeroCard
            mission={mission}
            onStart={
              mission ? () => router.push(`/session/${mission.id}`) : undefined
            }
          />
        </m.div>

        <m.div variants={fadeInUp}>
          <Section title="Programs">
            <FilterChipRow
              label="Programs"
              options={programOptions}
              selectedId={programId}
              onSelect={setProgramId}
            />
          </Section>
        </m.div>

        <m.div variants={fadeInUp}>
          <MyPlansSection />
        </m.div>

        <m.div variants={fadeInUp} className="flex flex-col gap-4">
          <SearchInput
            placeholder={`Search ${catalogSize} exercises`}
            shortcut="⌘K"
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

          {filteredExercises.length > 0 ? (
            <>
              <ul aria-label="Exercises" className="flex flex-col gap-3">
                {visibleExercises.map((exercise) => (
                  <li key={exercise.id}>
                    <ExerciseListItem
                      exercise={exercise}
                      href={`/train/exercises/${exercise.id}`}
                    />
                  </li>
                ))}
              </ul>
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
        </m.div>
      </m.div>
    </PageContainer>
  );
}
