"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Dumbbell,
  Search,
  X,
  ChevronRight,
  Filter,
  SlidersHorizontal,
  Layers,
  Sparkles,
  SearchX,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";
import {
  type Exercise,
  type MuscleGroup,
  type Equipment,
  type ExerciseDifficulty,
  type ExerciseType,
  muscleGroupLabels,
  equipmentLabels,
  exerciseTypeLabels,
} from "@/types/exercise";

export interface ExerciseCatalogContentProps {
  exercises: Exercise[];
}

const difficultyTone: Record<ExerciseDifficulty, { label: string; badge: string }> = {
  beginner: { label: "Beginner", badge: "bg-brand/15 text-brand" },
  intermediate: { label: "Intermediate", badge: "bg-warning/15 text-warning" },
  advanced: { label: "Advanced", badge: "bg-danger/15 text-danger" },
};

const muscleTones: Record<MuscleGroup, string> = {
  chest: "bg-brand",
  back: "bg-info",
  legs: "bg-accent-violet",
  shoulders: "bg-warning",
  arms: "bg-cyan-400",
  core: "bg-rose-400",
};

const muscleList: MuscleGroup[] = ["chest", "back", "legs", "shoulders", "arms", "core"];
const equipmentList: Equipment[] = ["barbell", "dumbbell", "cable", "machine", "bodyweight", "kettlebell"];
const difficultyList: ExerciseDifficulty[] = ["beginner", "intermediate", "advanced"];
const typeList: ExerciseType[] = ["compound", "isolation", "bodyweight"];

type SortOption = "name-asc" | "hit-desc" | "difficulty-asc";

const PAGE_CHUNK = 20;

export function ExerciseCatalogContent({ exercises }: ExerciseCatalogContentProps) {
  const [query, setQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | "all">("all");
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | "all">("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<ExerciseDifficulty | "all">("all");
  const [selectedType, setSelectedType] = useState<ExerciseType | "all">("all");
  const [sortOrder, setSortOrder] = useState<SortOption>("hit-desc");
  const [visibleLimit, setVisibleLimit] = useState(PAGE_CHUNK);

  // Filter exercises
  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      // Query filter
      if (query.trim()) {
        const q = query.toLowerCase().trim();
        const matchesName = ex.name.toLowerCase().includes(q);
        const matchesMuscle = ex.muscleGroups.some((m) =>
          muscleGroupLabels[m].toLowerCase().includes(q)
        );
        const matchesEquip = equipmentLabels[ex.equipment]?.toLowerCase().includes(q);
        if (!matchesName && !matchesMuscle && !matchesEquip) return false;
      }

      // Muscle group filter
      if (selectedMuscle !== "all") {
        if (!ex.muscleGroups.includes(selectedMuscle)) return false;
      }

      // Equipment filter
      if (selectedEquipment !== "all") {
        if (ex.equipment !== selectedEquipment) return false;
      }

      // Difficulty filter
      if (selectedDifficulty !== "all") {
        if (ex.difficulty !== selectedDifficulty) return false;
      }

      // Type filter
      if (selectedType !== "all") {
        if (ex.type !== selectedType) return false;
      }

      return true;
    });
  }, [exercises, query, selectedMuscle, selectedEquipment, selectedDifficulty, selectedType]);

  // Sort exercises
  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sortOrder === "name-asc") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === "hit-desc") {
      list.sort((a, b) => {
        const primaryA = selectedMuscle !== "all" ? selectedMuscle : a.muscleGroups[0];
        const primaryB = selectedMuscle !== "all" ? selectedMuscle : b.muscleGroups[0];
        const hitA = primaryA ? (a.muscleHit[primaryA] ?? 0) : 0;
        const hitB = primaryB ? (b.muscleHit[primaryB] ?? 0) : 0;
        return hitB - hitA;
      });
    } else if (sortOrder === "difficulty-asc") {
      const order: Record<ExerciseDifficulty, number> = {
        beginner: 1,
        intermediate: 2,
        advanced: 3,
      };
      list.sort((a, b) => order[a.difficulty] - order[b.difficulty]);
    }
    return list;
  }, [filtered, sortOrder, selectedMuscle]);

  const visibleList = sorted.slice(0, visibleLimit);
  const hasMore = sorted.length > visibleLimit;

  const hasActiveFilters =
    query.trim() !== "" ||
    selectedMuscle !== "all" ||
    selectedEquipment !== "all" ||
    selectedDifficulty !== "all" ||
    selectedType !== "all";

  function clearAllFilters() {
    setQuery("");
    setSelectedMuscle("all");
    setSelectedEquipment("all");
    setSelectedDifficulty("all");
    setSelectedType("all");
    setVisibleLimit(PAGE_CHUNK);
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex flex-col gap-3 pt-6">
        <div className="flex items-center gap-3">
          <Link
            href="/train"
            aria-label="Back to Train"
            className="grid size-11 place-items-center rounded-full text-foreground-secondary transition-colors hover:bg-surface-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
          >
            <ArrowLeft size={iconSize.sm} aria-hidden />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold">Exercise Library</h1>
            <p className="text-xs text-foreground-secondary">
              {exercises.length} movements · EMG stimulus mapped
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mt-2">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-secondary"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisibleLimit(PAGE_CHUNK);
            }}
            placeholder="Search exercises by name, muscle, or equipment..."
            className="h-12 w-full rounded-card border border-border/60 bg-surface pl-10 pr-10 text-sm placeholder:text-foreground-secondary/70 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-secondary hover:text-foreground"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Muscle Group Filter Chips */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary">
          Target Muscle Group
        </span>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => {
              setSelectedMuscle("all");
              setVisibleLimit(PAGE_CHUNK);
            }}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
              selectedMuscle === "all"
                ? "bg-brand text-background"
                : "bg-surface-elevated text-foreground-secondary hover:text-foreground"
            )}
          >
            All Muscles ({exercises.length})
          </button>
          {muscleList.map((m) => {
            const count = exercises.filter((ex) => ex.muscleGroups.includes(m)).length;
            const isSelected = selectedMuscle === m;
            return (
              <button
                key={m}
                onClick={() => {
                  setSelectedMuscle(isSelected ? "all" : m);
                  setVisibleLimit(PAGE_CHUNK);
                }}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  isSelected
                    ? "bg-brand text-background"
                    : "bg-surface-elevated text-foreground-secondary hover:text-foreground"
                )}
              >
                {muscleGroupLabels[m]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Filter Chips: Equipment, Difficulty, Sort */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        {/* Equipment Filter */}
        <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-surface px-2.5 py-1">
          <Dumbbell size={14} className="text-foreground-secondary" />
          <select
            value={selectedEquipment}
            onChange={(e) => {
              setSelectedEquipment(e.target.value as Equipment | "all");
              setVisibleLimit(PAGE_CHUNK);
            }}
            className="bg-transparent text-xs font-medium text-foreground focus:outline-none"
            aria-label="Filter by equipment"
          >
            <option value="all" className="bg-surface text-foreground">All Equipment</option>
            {equipmentList.map((eq) => (
              <option key={eq} value={eq} className="bg-surface text-foreground">
                {equipmentLabels[eq]}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-surface px-2.5 py-1">
          <Layers size={14} className="text-foreground-secondary" />
          <select
            value={selectedDifficulty}
            onChange={(e) => {
              setSelectedDifficulty(e.target.value as ExerciseDifficulty | "all");
              setVisibleLimit(PAGE_CHUNK);
            }}
            className="bg-transparent text-xs font-medium text-foreground focus:outline-none"
            aria-label="Filter by difficulty"
          >
            <option value="all" className="bg-surface text-foreground">All Levels</option>
            {difficultyList.map((diff) => (
              <option key={diff} value={diff} className="bg-surface text-foreground">
                {difficultyMetaLabel(diff)}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Filter */}
        <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-surface px-2.5 py-1">
          <SlidersHorizontal size={14} className="text-foreground-secondary" />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOption)}
            className="bg-transparent text-xs font-medium text-foreground focus:outline-none"
            aria-label="Sort exercises by"
          >
            <option value="hit-desc" className="bg-surface text-foreground">Highest Muscle Hit</option>
            <option value="name-asc" className="bg-surface text-foreground">Name (A–Z)</option>
            <option value="difficulty-asc" className="bg-surface text-foreground">Beginner First</option>
          </select>
        </div>

        {/* Clear Filters button */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 rounded-full bg-surface-elevated px-2.5 py-1 text-xs text-brand hover:underline"
          >
            <X size={12} />
            Reset filters
          </button>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between pt-1">
        <p className="text-xs font-medium text-foreground-secondary">
          Showing <span className="font-semibold text-foreground">{sorted.length}</span> of {exercises.length} exercises
        </p>
      </div>

      {/* Exercise Cards List */}
      {visibleList.length > 0 ? (
        <div className="flex flex-col gap-3 pb-8">
          {visibleList.map((exercise) => {
            const primaryMuscle = exercise.muscleGroups[0];
            const badgeMuscle = selectedMuscle !== "all" ? selectedMuscle : primaryMuscle;
            const hitPercent = badgeMuscle ? (exercise.muscleHit[badgeMuscle] ?? 0) : 0;
            const difficulty = difficultyTone[exercise.difficulty];

            return (
              <Link
                key={exercise.id}
                href={`/train/exercises/${exercise.id}`}
                className="group relative flex flex-col gap-3 rounded-card border border-border/60 bg-surface p-4 transition-all hover:border-brand/50 hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-semibold text-foreground group-hover:text-brand">
                        {exercise.name}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-foreground-secondary">
                      <span className="font-medium text-foreground">
                        {primaryMuscle ? muscleGroupLabels[primaryMuscle] : "General"}
                      </span>
                      <span>•</span>
                      <span>{equipmentLabels[exercise.equipment]}</span>
                      <span>•</span>
                      <span>{exerciseTypeLabels[exercise.type]}</span>
                    </div>
                  </div>

                  {/* Muscle Stimulus Hit Badge */}
                  <div className="flex shrink-0 flex-col items-end">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums",
                        hitPercent >= 70
                          ? "bg-brand/20 text-brand"
                          : hitPercent >= 40
                          ? "bg-info/20 text-info"
                          : "bg-surface-elevated text-foreground-secondary"
                      )}
                    >
                      {hitPercent}% {badgeMuscle ? muscleGroupLabels[badgeMuscle] : "hit"}
                    </span>
                    <span
                      className={cn(
                        "mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                        difficulty.badge
                      )}
                    >
                      {difficulty.label}
                    </span>
                  </div>
                </div>

                {/* EMG Stimulus Distribution Breakdown Mini-Bar */}
                <div className="flex flex-col gap-1">
                  <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated">
                    {exercise.muscleGroups.map((mg) => {
                      const share = exercise.muscleHit[mg] ?? 0;
                      if (share <= 0) return null;
                      return (
                        <div
                          key={mg}
                          style={{ width: `${share}%` }}
                          className={cn("h-full transition-all", muscleTones[mg])}
                          title={`${muscleGroupLabels[mg]}: ${share}%`}
                        />
                      );
                    })}
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Load More Button */}
          {hasMore && (
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => setVisibleLimit((v) => v + PAGE_CHUNK)}
              className="mt-2"
            >
              Load more movements ({sorted.length - visibleLimit} remaining)
            </Button>
          )}
        </div>
      ) : (
        <Card padding="lg" className="flex flex-col items-center gap-3 text-center my-8">
          <SearchX className="size-10 text-foreground-secondary/60" />
          <div>
            <p className="font-semibold">No exercises match your criteria</p>
            <p className="text-xs text-foreground-secondary mt-1">
              Try adjusting your query or resetting equipment and difficulty filters.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={clearAllFilters}>
            Reset filters
          </Button>
        </Card>
      )}
    </PageContainer>
  );
}

function difficultyMetaLabel(diff: ExerciseDifficulty): string {
  switch (diff) {
    case "beginner":
      return "Beginner";
    case "intermediate":
      return "Intermediate";
    case "advanced":
      return "Advanced";
  }
}
