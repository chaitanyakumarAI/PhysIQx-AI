import Link from "next/link";
import { ChevronRight, Dumbbell } from "lucide-react";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";
import {
  equipmentLabels,
  muscleGroupLabels,
  type Exercise,
  type MuscleGroup,
} from "@/types/exercise";

export interface ExerciseListItemProps {
  exercise: Exercise;
  /** Detail destination, e.g. /train/exercises/[id] per docs/ROUTES.md. */
  href: string;
  /**
   * When a muscle filter is active, the badge shows THAT group's stimulus
   * share (the number the ranking sorted by); otherwise the primary's.
   */
  highlightMuscle?: MuscleGroup | null;
  className?: string;
}

/** Heat tone for a stimulus share — high hits read brand-green. */
function hitTone(percent: number): string {
  if (percent >= 70) return "bg-brand/15 text-brand";
  if (percent >= 40) return "bg-info/15 text-info";
  return "bg-surface-elevated text-foreground-secondary";
}

/** Catalog row: icon tile, name, primary muscle · equipment, hit %. */
export function ExerciseListItem({
  exercise,
  href,
  highlightMuscle,
  className,
}: ExerciseListItemProps) {
  const primaryMuscle = exercise.muscleGroups[0];
  const badgeMuscle = highlightMuscle ?? primaryMuscle;
  const hit = badgeMuscle ? (exercise.muscleHit[badgeMuscle] ?? 0) : 0;

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
      {badgeMuscle && (
        <span
          role="img"
          aria-label={`Hits ${muscleGroupLabels[badgeMuscle]} ${hit}%`}
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums",
            hitTone(hit),
          )}
        >
          {hit}%
        </span>
      )}
      <ChevronRight
        size={iconSize.sm}
        aria-hidden
        className="shrink-0 text-foreground-secondary"
      />
    </Link>
  );
}
