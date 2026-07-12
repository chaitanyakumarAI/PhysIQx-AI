import { GoalStepper } from "../GoalStepper";

export interface WaterGoalStepProps {
  value: number;
  onChange: (value: number) => void;
}

export function WaterGoalStep({ value, onChange }: WaterGoalStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-2xl font-bold">Daily water goal</h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          Hydration protects strength and recovery — we&apos;ll track it daily.
        </p>
      </div>
      <GoalStepper
        value={value}
        onChange={onChange}
        min={1.5}
        max={5}
        step={0.5}
        unit="L"
        label="of water a day"
      />
    </div>
  );
}
