import { Feather, Mountain, TrendingUp } from "lucide-react";
import type { ExperienceLevel } from "@/types/profile";
import { OptionCard } from "../OptionCard";

export interface ExperienceStepProps {
  value: ExperienceLevel | undefined;
  onChange: (value: ExperienceLevel) => void;
}

const options: { value: ExperienceLevel; label: string; description: string; icon: typeof Feather }[] = [
  { value: "beginner", label: "Beginner", description: "New to structured training", icon: Feather },
  { value: "intermediate", label: "Intermediate", description: "Training consistently for a while", icon: TrendingUp },
  { value: "advanced", label: "Advanced", description: "Years of dedicated training", icon: Mountain },
];

export function ExperienceStep({ value, onChange }: ExperienceStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-2xl font-bold">What&apos;s your experience?</h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          We&apos;ll calibrate intensity to match.
        </p>
      </div>
      <div role="group" aria-label="Experience level" className="flex flex-col gap-3">
        {options.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            description={option.description}
            icon={option.icon}
            selected={value === option.value}
            onSelect={() => onChange(option.value)}
          />
        ))}
      </div>
    </div>
  );
}
