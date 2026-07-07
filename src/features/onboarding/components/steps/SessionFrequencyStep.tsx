import { CalendarClock, Repeat, Sun } from "lucide-react";
import { OptionCard } from "@/components/ui/OptionCard";
import { sessionFrequencyLabels, type SessionFrequency } from "@/types/profile";

export interface SessionFrequencyStepProps {
  value: SessionFrequency | undefined;
  onChange: (value: SessionFrequency) => void;
}

const frequencyDescription: Record<SessionFrequency, string> = {
  once: "One focused session a day",
  twice: "Split days — cardio in one session, strength in another",
  flexible: "Whatever the day allows — the plan adapts",
};

const frequencyIcon = {
  once: Sun,
  twice: Repeat,
  flexible: CalendarClock,
} as const;

const options: SessionFrequency[] = ["once", "twice", "flexible"];

export function SessionFrequencyStep({ value, onChange }: SessionFrequencyStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-2xl font-bold">How often in a day?</h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          Some athletes split cardio and strength into two sessions.
        </p>
      </div>
      <div role="group" aria-label="Session frequency" className="flex flex-col gap-3">
        {options.map((option) => (
          <OptionCard
            key={option}
            label={sessionFrequencyLabels[option]}
            description={frequencyDescription[option]}
            icon={frequencyIcon[option]}
            selected={value === option}
            onSelect={() => onChange(option)}
          />
        ))}
      </div>
    </div>
  );
}
