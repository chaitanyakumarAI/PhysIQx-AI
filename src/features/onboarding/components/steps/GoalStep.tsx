import { Flame, Scale, Sprout, Zap } from "lucide-react";
import { goalLabels, type ProfileGoal } from "@/types/profile";
import { OptionCard } from "../OptionCard";

export interface GoalStepProps {
  value: ProfileGoal | undefined;
  onChange: (value: ProfileGoal) => void;
}

const goalDescription: Record<ProfileGoal, string> = {
  cut: "Lose fat, keep strength",
  bulk: "Build muscle and size",
  maintain: "Stay consistent, feel good",
  endurance: "Build stamina and cardio",
};

const goalIcon: Record<ProfileGoal, typeof Flame> = {
  cut: Flame,
  bulk: Zap,
  maintain: Scale,
  endurance: Sprout,
};

export function GoalStep({ value, onChange }: GoalStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-2xl font-bold">What&apos;s your goal?</h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          This shapes your missions and nutrition targets.
        </p>
      </div>
      <div role="group" aria-label="Goal" className="flex flex-col gap-3">
        {(Object.keys(goalLabels) as ProfileGoal[]).map((goal) => (
          <OptionCard
            key={goal}
            label={goalLabels[goal]}
            description={goalDescription[goal]}
            icon={goalIcon[goal]}
            selected={value === goal}
            onSelect={() => onChange(goal)}
          />
        ))}
      </div>
    </div>
  );
}
