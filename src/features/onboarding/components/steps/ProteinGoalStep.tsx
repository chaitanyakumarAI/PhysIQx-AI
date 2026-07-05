import { GoalStepper } from "../GoalStepper";

export interface ProteinGoalStepProps {
  value: number;
  onChange: (value: number) => void;
}

export function ProteinGoalStep({ value, onChange }: ProteinGoalStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-2xl font-bold">Daily protein goal</h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          A rough target — you can adjust it anytime.
        </p>
      </div>
      <GoalStepper
        value={value}
        onChange={onChange}
        min={80}
        max={250}
        step={10}
        unit="g"
        label="of protein a day"
      />
    </div>
  );
}
