import { useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";
import { playSetComplete } from "@/lib/audioEngine";
import type { CompletionResult, SetValues } from "@/features/session/lib/setValidation";
import type { ExerciseSet } from "@/types/workoutSession";

export interface SetRowProps {
  set: ExerciseSet;
  unit: string;
  /** Ghost values shown in empty fields (overload suggestion, the previous
   *  set's load, or the rep target). Tapping ✓ on an empty row accepts them. */
  ghost: SetValues;
  onChangeWeight: (weight: number | null) => void;
  onChangeReps: (reps: number | null) => void;
  onChangeRPE?: (rpe: number | null) => void;
  /** Fails, naming the missing field, when the set holds no real work yet. */
  onToggleCompleted: () => CompletionResult;
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
  ghost,
  onChangeWeight,
  onChangeReps,
  onChangeRPE,
  onToggleCompleted,
  onRemove,
}: SetRowProps) {
  const weightInputRef = useRef<HTMLInputElement>(null);
  const repsInputRef = useRef<HTMLInputElement>(null);
  const [missing, setMissing] = useState<"reps" | "weight" | null>(null);
  const repsGhost = set.toFailure && ghost.reps === null ? "max" : ghost.reps;
  const repsPlaceholder =
    repsGhost === null ? "reps" : set.durationSeconds ? `${repsGhost}s` : String(repsGhost);

  const inputClass =
    "w-full rounded-field border bg-surface px-2 sm:px-3 py-2 text-center text-sm sm:text-base tabular-nums placeholder:text-foreground/25 focus-visible:outline-none focus-visible:border-brand/50 focus-visible:ring-2 focus-visible:ring-brand/40";

  function handleToggle() {
    const wasCompleted = set.completed;
    const result = onToggleCompleted();
    if (!result.ok) {
      // Nothing to accept yet — send the athlete to the field that's missing.
      setMissing(result.missing);
      (result.missing === "weight" ? weightInputRef : repsInputRef).current?.focus();
      return;
    }
    setMissing(null);
    if (!wasCompleted) playSetComplete();
  }

  return (
    <div className="flex flex-col gap-1">
      <div
        className={cn(
          "flex items-center gap-2 sm:gap-3 rounded-field border p-2 sm:p-3",
          set.completed ? "border-brand/30 bg-brand/5" : "border-border/60",
          missing && "border-warning/60",
        )}
      >
        <span className="w-5 sm:w-6 shrink-0 text-xs sm:text-sm font-semibold text-foreground-secondary text-center">
          {set.setNumber}
        </span>

        <label className="flex-1 min-w-0">
          <span className="sr-only">Weight in {unit}</span>
          <input
            ref={weightInputRef}
            type="number"
            inputMode="decimal"
            min={0}
            placeholder={ghost.weight !== null ? `${ghost.weight}` : unit}
            value={set.weight ?? ""}
            onChange={(event) => {
              if (missing === "weight") setMissing(null);
              onChangeWeight(parseNumberInput(event.target.value));
            }}
            aria-invalid={missing === "weight" || undefined}
            className={cn(inputClass, missing === "weight" ? "border-warning" : "border-border")}
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
            ref={repsInputRef}
            type="number"
            inputMode="numeric"
            min={0}
            // Targets, never caps: "max" invites emptying the tank; timed
            // sets log seconds in the same field. Placeholders are ghosts
            // (25% opacity) — hints awaiting input, not filled values.
            placeholder={repsPlaceholder}
            value={set.reps ?? ""}
            onChange={(event) => {
              if (missing === "reps") setMissing(null);
              onChangeReps(parseNumberInput(event.target.value));
            }}
            aria-invalid={missing === "reps" || undefined}
            className={cn(inputClass, missing === "reps" ? "border-warning" : "border-border")}
          />
        </label>

        {onChangeRPE && (
          <label className="w-12 sm:w-14 shrink-0">
            <span className="sr-only">RPE Rate of Perceived Exertion 1 to 10</span>
            <input
              type="number"
              inputMode="decimal"
              min={1}
              max={10}
              step={0.5}
              placeholder="@RPE"
              value={set.rpe ?? ""}
              onChange={(event) => onChangeRPE(parseNumberInput(event.target.value))}
              className="w-full rounded-field border border-border bg-surface px-1 sm:px-2 py-2 text-center text-xs sm:text-sm tabular-nums placeholder:text-foreground/25 focus-visible:outline-none focus-visible:border-brand/50 focus-visible:ring-2 focus-visible:ring-brand/40"
            />
          </label>
        )}

        <button
          type="button"
          aria-pressed={set.completed}
          aria-label={
            set.completed ? `Set ${set.setNumber} completed` : `Mark set ${set.setNumber} complete`
          }
          onClick={handleToggle}
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
      {missing && (
        <p role="status" className="px-2 text-xs text-warning">
          {missing === "weight"
            ? "Log the weight you lifted to complete this set."
            : "Log the reps you got to complete this set."}
        </p>
      )}
    </div>
  );
}
