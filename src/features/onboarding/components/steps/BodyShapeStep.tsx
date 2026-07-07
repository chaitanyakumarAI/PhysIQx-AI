import { Feather, Flame, Dumbbell, Mountain } from "lucide-react";
import { OptionCard } from "@/components/ui/OptionCard";
import { goalBodyShapeLabels, type GoalBodyShape } from "@/types/profile";

export interface BodyShapeStepProps {
  value: GoalBodyShape | undefined;
  onChange: (value: GoalBodyShape) => void;
}

/**
 * Replaceable default content — the user can supply their own shape
 * labels/descriptions; the structure (4 single-select options) stands.
 * Deliberately no body illustrations: without camera/scan data any figure
 * would be a promise the product can't measure against yet.
 */
const shapeDescription: Record<GoalBodyShape, string> = {
  lean: "Low body fat, visible definition, light frame",
  athletic: "Balanced muscle and conditioning — the all-rounder",
  muscular: "Noticeable size with sculpted proportions",
  powerful: "Maximum strength — built for heavy lifts",
};

const shapeIcon = {
  lean: Feather,
  athletic: Flame,
  muscular: Dumbbell,
  powerful: Mountain,
} as const;

const options: GoalBodyShape[] = ["lean", "athletic", "muscular", "powerful"];

export function BodyShapeStep({ value, onChange }: BodyShapeStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-2xl font-bold">Your goal physique?</h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          This shapes how your Body Shape pillar is scored.
        </p>
      </div>
      <div role="group" aria-label="Goal body shape" className="flex flex-col gap-3">
        {options.map((option) => (
          <OptionCard
            key={option}
            label={goalBodyShapeLabels[option]}
            description={shapeDescription[option]}
            icon={shapeIcon[option]}
            selected={value === option}
            onSelect={() => onChange(option)}
          />
        ))}
      </div>
    </div>
  );
}
