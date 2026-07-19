import { Check, X } from "lucide-react";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";
import type { ExerciseSet } from "@/types/workoutSession";

export interface SetRowProps {
  set: ExerciseSet;
  unit: string;
  onChangeWeight: (weight: number | null) => void;
  onChangeReps: (reps: number | null) => void;
  onChangeRPE?: (rpe: number | null) => void;
  onToggleCompleted: () => void;
  /** Present only where removal is allowed (last, uncompleted set). */
  onRemove?: () => void;
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
  onChangeRPE,
  onToggleCompleted,
  onRemove,
}: SetRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 sm:gap-3 rounded-field border p-2 sm:p-3",
        set.completed ? "border-brand/30 bg-brand/5" : "border-border/60",
      )}
    >
      <span className="w-5 sm:w-6 shrink-0 text-xs sm:text-sm font-semibold text-foreground-secondary text-center">
        {set.setNumber}
      </span>

      <label className="flex-1 min-w-0">
        <span className="sr-only">Weight in {unit}</span>
        <input
          type="number"
          inputMode="decimal"
          placeholder={unit}
          value={set.weight ?? ""}
          onChange={(event) => onChangeWeight(parseNumberInput(event.target.value))}
          className="w-full rounded-field border border-border bg-surface px-2 sm:px-3 py-2 text-center text-sm sm:text-base tabular-nums placeholder:text-foreground/25 focus-visible:outline-none focus-visible:border-brand/50 focus-visible:ring-2 focus-visible:ring-brand/40"
        />
      </label>

      <span aria-hidden className="text-foreground-secondary text-xs sm:text-base">
        ×
      </span>

      <label className="flex-1 min-w-0">
        <span className="sr-only">
          {set.toFailure
            ? "Reps — this set goes to failure, log what you got"
            : set.durationSeconds
              ? `Seconds, target ${set.durationSeconds}`
              : `Reps, target ${set.targetReps} — a target, not a cap`}
        </span>
        <input
          type="number"
          inputMode="numeric"
          // Targets, never caps: "max" invites emptying the tank; timed
          // sets log seconds in the same field.
          placeholder={
            set.toFailure
              ? "max"
              : set.durationSeconds
                ? `${set.durationSeconds}s`
                : String(set.targetReps)
          }
          value={set.reps ?? ""}
          onChange={(event) => onChangeReps(parseNumberInput(event.target.value))}
          // placeholder:text-foreground/25 — the target must read as a ghost
          // hint awaiting input, not an already-filled value (user finding).
          className="w-full rounded-field border border-border bg-surface px-2 sm:px-3 py-2 text-center text-sm sm:text-base tabular-nums placeholder:text-foreground/25 focus-visible:outline-none focus-visible:border-brand/50 focus-visible:ring-2 focus-visible:ring-brand/40"
        />
      </label>

      {onChangeRPE && (
        <label className="w-12 sm:w-14 shrink-0">
          <span className="sr-only">RPE Rate of Perceived Exertion 1 to 10</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={10}
            placeholder="@RPE"
            value={set.rpe ?? ""}
            onChange={(event) => {
              const val = parseNumberInput(event.target.value);
              const clamped = val !== null ? Math.max(1, Math.min(10, val)) : null;
              onChangeRPE(clamped);
            }}
            className="w-full rounded-field border border-border bg-surface px-1 sm:px-2 py-2 text-center text-xs sm:text-sm tabular-nums placeholder:text-foreground/25 focus-visible:outline-none focus-visible:border-brand/50 focus-visible:ring-2 focus-visible:ring-brand/40"
          />
        </label>
      )}

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
          // size-11 (44px): docs/UI_Guideliness.md's minimum touch target —
          // this is the actual tap area, not just the visual circle.
          "grid size-11 shrink-0 place-items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60",
          set.completed
            ? "border-brand bg-brand text-zinc-950"
            : "border-border text-foreground-secondary hover:bg-surface-elevated",
        )}
      >
        <Check size={iconSize.sm} aria-hidden />
      </button>

      {onRemove && (
        <button
          type="button"
          aria-label={`Remove set ${set.setNumber}`}
          onClick={onRemove}
          className="grid size-11 shrink-0 place-items-center rounded-full text-foreground-secondary transition-colors hover:bg-surface-elevated hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
        >
          <X size={iconSize.sm} aria-hidden />
        </button>
      )}
    </div>
  );
}
