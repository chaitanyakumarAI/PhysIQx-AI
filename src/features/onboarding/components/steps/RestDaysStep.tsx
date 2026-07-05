import { GoalStepper } from "../GoalStepper";

export interface RestDaysStepProps {
  /** Training days per week — the field Profile actually models. */
  trainingDaysPerWeek: number;
  onChange: (trainingDaysPerWeek: number) => void;
}

/**
 * Copy frames this as "rest days" (matching docs/ROUTES.md's step naming),
 * but the value stored is trainingDaysPerWeek (7 - restDays) — Profile has
 * no field for which specific weekdays are rest days, only a count, so that
 * count is what this step actually produces. Reuses GoalStepper rather than
 * OptionCard: a bounded 1–4 range fits the numeral-stepper pattern better
 * than forcing single-number cards into OptionCard's row layout.
 */
export function RestDaysStep({ trainingDaysPerWeek, onChange }: RestDaysStepProps) {
  const restDays = 7 - trainingDaysPerWeek;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-2xl font-bold">
          How many rest days a week?
        </h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          Recovery counts toward your score too.
        </p>
      </div>
      <GoalStepper
        value={restDays}
        onChange={(next) => onChange(7 - next)}
        min={1}
        max={4}
        step={1}
        unit=""
        label={`= ${trainingDaysPerWeek} training days a week`}
      />
    </div>
  );
}
