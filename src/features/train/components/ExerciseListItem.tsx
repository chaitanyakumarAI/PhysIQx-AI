import Link from "next/link";
import { ChevronRight, Dumbbell } from "lucide-react";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";
import {
  equipmentLabels,
  muscleGroupLabels,
  type Exercise,
  type ExerciseDifficulty,
} from "@/types/exercise";

export interface ExerciseListItemProps {
  exercise: Exercise;
  /** Detail destination, e.g. /train/exercises/[id] per docs/ROUTES.md. */
  href: string;
  className?: string;
}

const difficultyBadge: Record<
  ExerciseDifficulty,
  { short: string; label: string; tone: string }
> = {
  beginner: { short: "B", label: "Beginner", tone: "bg-brand/15 text-brand" },
  intermediate: {
    short: "I",
    label: "Intermediate",
    tone: "bg-warning/15 text-warning",
  },
  advanced: { short: "A", label: "Advanced", tone: "bg-danger/15 text-danger" },
};

/** Catalog row: icon tile, name, primary muscle · equipment, difficulty. */
export function ExerciseListItem({
  exercise,
  href,
  className,
}: ExerciseListItemProps) {
  const difficulty = difficultyBadge[exercise.difficulty];
  const primaryMuscle = exercise.muscleGroups[0];

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-card border border-border/60 bg-surface p-3 pr-4 transition-colors hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60",
        className,
      )}
    >
      <span
        aria-hidden
        className="grid size-12 shrink-0 place-items-center rounded-field bg-surface-elevated text-foreground-secondary"
      >
        <Dumbbell size={iconSize.sm} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-semibold">{exercise.name}</span>
        <span className="truncate text-sm text-foreground-secondary">
          {primaryMuscle ? muscleGroupLabels[primaryMuscle] : "—"} ·{" "}
          {equipmentLabels[exercise.equipment]}
        </span>
      </span>
      <span
        role="img"
        aria-label={`${difficulty.label} difficulty`}
        className={cn(
          "grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold",
          difficulty.tone,
        )}
      >
        {difficulty.short}
      </span>
      <ChevronRight
        size={iconSize.sm}
        aria-hidden
        className="shrink-0 text-foreground-secondary"
      />
    </Link>
  );
}
