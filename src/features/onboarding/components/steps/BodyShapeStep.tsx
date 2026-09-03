import { Feather, Flame, Dumbbell, Mountain } from "lucide-react";
import { OptionCard } from "@/components/ui/OptionCard";
import { HologramBodyScan } from "@/components/ui/HologramBodyScan";
import { goalBodyShapeLabels, type GoalBodyShape } from "@/types/profile";

export interface BodyShapeStepProps {
  value: GoalBodyShape | undefined;
  onChange: (value: GoalBodyShape) => void;
}

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

export function BodyShapeStep({ value = "athletic", onChange }: BodyShapeStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Your goal physique?</h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          Select your target archetype to calibrate your Body Shape pillar scoring.
        </p>
      </div>

      {/* Live Hologram Preview */}
      <div className="mx-auto w-full max-w-[240px]">
        <HologramBodyScan
          bodyShape={value}
          gender="male"
          viewAngle="front"
          showHudBrackets={true}
          showStatureBadge={true}
          aspectRatio="3/4"
        />
      </div>

      {/* Selection Cards */}
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

