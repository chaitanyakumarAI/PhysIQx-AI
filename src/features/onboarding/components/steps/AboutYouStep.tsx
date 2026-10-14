import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { Sex } from "@/types/ledger";
import { ABOUT_YOU_LIMITS } from "../../schemas";

export interface AboutYouValues {
  displayName?: string;
  sex?: Sex;
  birthYear?: number;
  heightCm?: number;
  weightKg?: number;
}

export interface AboutYouStepProps {
  values: AboutYouValues;
  onChange: (patch: Partial<AboutYouValues>) => void;
}

const sexOptions: { value: Sex; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
];

function toNumber(raw: string): number | undefined {
  if (raw.trim() === "") return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

/**
 * The minimum the engines need to be honest: strength standards depend on
 * sex and bodyweight, the Body Shape pillar on height and age. Nothing
 * else is asked, and none of it leaves the device unless you sign in.
 */
export function AboutYouStep({ values, onChange }: AboutYouStepProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-2xl font-bold">About you</h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          Strength standards and your score are scaled to your body.
        </p>
      </div>

      <Input
        label="First name"
        autoComplete="given-name"
        maxLength={ABOUT_YOU_LIMITS.nameMax}
        value={values.displayName ?? ""}
        onChange={(event) => onChange({ displayName: event.target.value })}
      />

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Sex</span>
        <div role="radiogroup" aria-label="Sex" className="grid grid-cols-2 gap-2">
          {sexOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={values.sex === option.value}
              onClick={() => onChange({ sex: option.value })}
              className={cn(
                "h-12 rounded-field border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60",
                values.sex === option.value
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border bg-surface text-foreground-secondary hover:bg-surface-elevated",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-foreground-muted">Used only to pick the right strength tables.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Input
          label="Born"
          inputMode="numeric"
          placeholder="1995"
          value={values.birthYear ?? ""}
          onChange={(event) => onChange({ birthYear: toNumber(event.target.value) })}
        />
        <Input
          label="Height (cm)"
          inputMode="numeric"
          placeholder="175"
          value={values.heightCm ?? ""}
          onChange={(event) => onChange({ heightCm: toNumber(event.target.value) })}
        />
        <Input
          label="Weight (kg)"
          inputMode="decimal"
          placeholder="75"
          value={values.weightKg ?? ""}
          onChange={(event) => onChange({ weightKg: toNumber(event.target.value) })}
        />
      </div>
    </div>
  );
}
