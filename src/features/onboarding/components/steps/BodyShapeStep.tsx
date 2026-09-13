import { useState } from "react";
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
  const [viewAngle, setViewAngle] = useState<"front" | "side" | "45deg">("front");
  const [gender, setGender] = useState<"male" | "female">("male");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Your goal physique?</h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          Select your target archetype to calibrate your Body Shape pillar scoring.
        </p>
      </div>

      {/* Live Hologram Preview with Interactive Angles */}
      <div className="mx-auto w-full max-w-[260px] flex flex-col items-center gap-3">
        <HologramBodyScan
          bodyShape={value}
          gender={gender}
          viewAngle={viewAngle}
          showHudBrackets={true}
          showStatureBadge={true}
          aspectRatio="3/4"
        />

        {/* View Angle & Gender Toggles */}
        <div className="flex w-full items-center justify-between gap-2 px-1">
          {/* Angle Switcher */}
          <div className="flex items-center rounded-lg bg-surface/80 p-0.5 border border-border/60">
            {(["front", "side", "45deg"] as const).map((angle) => (
              <button
                key={angle}
                type="button"
                onClick={() => setViewAngle(angle)}
                className={`rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                  viewAngle === angle
                    ? "bg-brand text-black font-bold shadow-sm"
                    : "text-foreground-secondary hover:text-foreground"
                }`}
              >
                {angle === "45deg" ? "45°" : angle}
              </button>
            ))}
          </div>

          {/* Gender Switcher */}
          <div className="flex items-center rounded-lg bg-surface/80 p-0.5 border border-border/60">
            {(["male", "female"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`rounded-md px-2 py-1 text-[11px] font-semibold capitalize transition-colors ${
                  gender === g
                    ? "bg-brand text-black font-bold shadow-sm"
                    : "text-foreground-secondary hover:text-foreground"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
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

