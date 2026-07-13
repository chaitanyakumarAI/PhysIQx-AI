import { Dumbbell } from "lucide-react";
import { programTypeLabels, type ProgramType } from "@/types/training";
import { OptionCard } from "@/components/ui/OptionCard";

export interface SplitStepProps {
  value: ProgramType | undefined;
  onChange: (value: ProgramType) => void;
}

const splitDescription: Record<ProgramType, string> = {
  ai: "Let PhysIQx build and adjust your plan",
  ppl: "Push, Pull, Legs rotation",
  "upper-lower": "Alternate upper and lower body days",
  bro: "One muscle group per session",
  "full-body": "Everything, every session",
};

export function SplitStep({ value, onChange }: SplitStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-2xl font-bold">
          How do you like to train?
        </h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          You can switch programs anytime from Train.
        </p>
      </div>
      <div role="group" aria-label="Training split" className="flex flex-col gap-3">
        {(Object.keys(programTypeLabels) as ProgramType[]).map((split) => (
          <OptionCard
            key={split}
            label={programTypeLabels[split]}
            description={splitDescription[split]}
            icon={Dumbbell}
            selected={value === split}
            onSelect={() => onChange(split)}
          />
        ))}
      </div>
    </div>
  );
}
