import { Check } from "lucide-react";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";
import type { ExerciseSet } from "@/types/workoutSession";

export interface SetRowProps {
  set: ExerciseSet;
  unit: string;
  onChangeWeight: (weight: number | null) => void;
  onChangeReps: (reps: number | null) => void;
  onToggleCompleted: () => void;
}

function parseNumberInput(raw: string): number | null {
  if (raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

/**
 * Deliberately not built on the ui/Input primitive — these are compact,
 * label-less inline fields inside a dense row (matching how
 * ExerciseListItem/LeaderboardRow also don't reuse Input for their own
 * compact row layouts), not a labeled form field.
 */
export function SetRow({
  set,
  unit,
  onChangeWeight,
  onChangeReps,
  onToggleCompleted,
}: SetRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-field border p-3",
        set.completed ? "border-brand/30 bg-brand/5" : "border-border/60",
      )}
    >
      <span className="w-6 shrink-0 text-sm font-semibold text-foreground-secondary">
        {set.setNumber}
      </span>

      <label className="flex-1">
        <span className="sr-only">Weight in {unit}</span>
        <input
          type="number"
          inputMode="decimal"
          placeholder={unit}
          value={set.weight ?? ""}
          onChange={(event) => onChangeWeight(parseNumberInput(event.target.value))}
          className="w-full rounded-field border border-border bg-surface px-3 py-2 text-center text-base tabular-nums focus-visible:outline-none focus-visible:border-brand/50 focus-visible:ring-2 focus-visible:ring-brand/40"
        />
      </label>

      <span aria-hidden className="text-foreground-secondary">
        ×
      </span>

      <label className="flex-1">
        <span className="sr-only">Reps, target {set.targetReps}</span>
        <input
          type="number"
          inputMode="numeric"
          placeholder={String(set.targetReps)}
          value={set.reps ?? ""}
          onChange={(event) => onChangeReps(parseNumberInput(event.target.value))}
          className="w-full rounded-field border border-border bg-surface px-3 py-2 text-center text-base tabular-nums focus-visible:outline-none focus-visible:border-brand/50 focus-visible:ring-2 focus-visible:ring-brand/40"
        />
      </label>

      <button
        type="button"
        aria-pressed={set.completed}
        aria-label={
          set.completed
            ? `Set ${set.setNumber} completed`
            : `Mark set ${set.setNumber} complete`
        }
        onClick={onToggleCompleted}
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60",
          set.completed
            ? "border-brand bg-brand text-zinc-950"
            : "border-border text-foreground-secondary hover:bg-surface-elevated",
        )}
      >
        <Check size={iconSize.sm} aria-hidden />
      </button>
    </div>
  );
}
