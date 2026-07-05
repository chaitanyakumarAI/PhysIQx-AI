import { Minus, Plus } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { iconSize } from "@/constants/icons";

export interface GoalStepperProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
  /** e.g. "of protein a day" */
  label: string;
}

/**
 * Large-numeral stepper for the two continuous goals (protein, water).
 * Deliberately not a native range input — cross-browser range-slider
 * styling is a well-known source of inconsistent, hard-to-polish results,
 * and a stepper with a confident hero numeral channels the same "big
 * numbers" technique the reference designs use, in a form this design
 * system can render consistently everywhere.
 */
export function GoalStepper({
  value,
  onChange,
  min,
  max,
  step,
  unit,
  label,
}: GoalStepperProps) {
  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  return (
    <div className="flex flex-col items-center gap-4 rounded-card border border-border/60 bg-surface p-6">
      <div className="flex items-center gap-6">
        <IconButton
          label={`Decrease by ${step}${unit}`}
          variant="surface"
          onClick={() => onChange(clamp(value - step))}
          disabled={value <= min}
        >
          <Minus size={iconSize.sm} aria-hidden />
        </IconButton>

        <div className="text-center">
          <p className="font-display text-6xl font-bold tabular-nums">
            {value}
            <span className="text-2xl text-foreground-secondary">{unit}</span>
          </p>
          <p className="mt-1 text-sm text-foreground-secondary">{label}</p>
        </div>

        <IconButton
          label={`Increase by ${step}${unit}`}
          variant="surface"
          onClick={() => onChange(clamp(value + step))}
          disabled={value >= max}
        >
          <Plus size={iconSize.sm} aria-hidden />
        </IconButton>
      </div>

      <ProgressBar
        value={value - min}
        max={max - min}
        className="w-full"
        aria-label={`${value}${unit}, range ${min} to ${max}${unit}`}
      />
    </div>
  );
}
