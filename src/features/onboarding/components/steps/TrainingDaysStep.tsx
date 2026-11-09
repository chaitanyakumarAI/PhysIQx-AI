import { GoalStepper } from "../GoalStepper";

export interface TrainingDaysStepProps {
  trainingDaysPerWeek: number;
  onChange: (trainingDaysPerWeek: number) => void;
}

/** Bounds match onboardingSchema's trainingDaysPerWeek. */
const MIN_DAYS = 3;
const MAX_DAYS = 6;

/**
 * Asks for the number people actually plan around — training days — and
 * shows the rest days that leaves as the secondary line. Reuses GoalStepper:
 * a bounded 3–6 range fits the numeral stepper better than option cards.
 */
export function TrainingDaysStep({ trainingDaysPerWeek, onChange }: TrainingDaysStepProps) {
  const restDays = 7 - trainingDaysPerWeek;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-2xl font-bold">
          How many days a week will you train?
        </h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          Pick what you can keep up. Rest days count toward your score too.
        </p>
      </div>
      <GoalStepper
        value={trainingDaysPerWeek}
        onChange={onChange}
        min={MIN_DAYS}
        max={MAX_DAYS}
        step={1}
        unit=""
        label={`+ ${restDays} rest ${restDays === 1 ? "day" : "days"} for recovery`}
      />
    </div>
  );
}
