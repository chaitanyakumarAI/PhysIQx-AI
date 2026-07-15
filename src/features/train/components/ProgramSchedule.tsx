"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, CheckCircle2, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FilterChipRow } from "@/components/ui/FilterChipRow";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";
import { mockExercises } from "@/data/exercises";
import {
  findProgram,
  programLevelLabels,
  type ProgramVariant,
} from "@/data/programs";
import { usePlansStore } from "@/store/plansStore";
import type { ProgramType } from "@/types/training";
import { describeSets } from "@/types/workoutTemplate";

export interface ProgramScheduleProps {
  programType: ProgramType;
  className?: string;
}

function exerciseName(id: string): string {
  return mockExercises.find((exercise) => exercise.id === id)?.name ?? "Exercise";
}

function formatRest(seconds: number): string {
  if (seconds < 90) return `${seconds}s rest`;
  const minutes = seconds / 60;
  return `${Number.isInteger(minutes) ? minutes : minutes.toFixed(1)} min rest`;
}

const levelTone: Record<string, string> = {
  beginner: "bg-brand/15 text-brand",
  intermediate: "bg-info/15 text-info",
  advanced: "bg-danger/15 text-danger",
};

/**
 * A selected program chip's weekly schedule: description, variant picker
 * (when a program ships multiple days-per-week layouts), expandable days,
 * and "Adopt as my plan" — which copies the variant into the user's own
 * plans, where every day is startable and fully editable. All set language
 * comes from formatSetTarget/describeSets: targets, never caps.
 */
export function ProgramSchedule({ programType, className }: ProgramScheduleProps) {
  const savePlan = usePlansStore((state) => state.savePlan);
  const program = findProgram(programType);
  const [variantIndex, setVariantIndex] = useState(0);
  const [openDay, setOpenDay] = useState<string | null>(null);
  const [adoptedName, setAdoptedName] = useState<string | null>(null);

  if (programType === "ai") {
    return (
      <Card padding="md" className={className}>
        <p className="text-sm leading-relaxed text-foreground-secondary">
          The Coach program builds Today&apos;s Mission for you automatically —
          nothing to adopt. Pick any preset chip to browse its full weekly
          schedule.
        </p>
      </Card>
    );
  }

  if (!program) return null;

  const variant: ProgramVariant =
    program.variants[Math.min(variantIndex, program.variants.length - 1)]!;

  function handleAdopt() {
    const stamp = Date.now();
    const planName =
      program!.variants.length > 1
        ? `${program!.name} (${variant.daysPerWeek}-day)`
        : program!.name;
    savePlan({
      id: `plan-${program!.type}-${stamp}`,
      name: planName,
      days: variant.days.map((day, index) => ({
        id: `day-${stamp}-${index}`,
        name: day.name,
        exercises: day.exercises,
      })),
    });
    setAdoptedName(planName);
  }

  return (
    <Card padding="md" className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-bold">{program.name}</h3>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.08em]",
              levelTone[program.level],
            )}
          >
            {programLevelLabels[program.level]}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-foreground-secondary">
          {program.description}
        </p>
        <Link
          href={`/train/calendar?program=${program.type}&variant=${variantIndex}`}
          className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-full text-sm font-semibold text-brand transition-colors hover:text-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
        >
          <CalendarDays size={iconSize.xs} aria-hidden />
          See it on a calendar
        </Link>
      </div>

      {program.variants.length > 1 && (
        <FilterChipRow
          label="Days per week"
          options={program.variants.map((option, index) => ({
            id: String(index),
            label: `${option.daysPerWeek} days/week`,
          }))}
          selectedId={String(variantIndex)}
          onSelect={(id) => {
            setVariantIndex(Number(id));
            setOpenDay(null);
            setAdoptedName(null);
          }}
        />
      )}

      <ul aria-label={`${program.name} weekly schedule`} className="flex flex-col gap-2">
        {variant.days.map((day, index) => {
          const dayKey = `${variantIndex}-${index}`;
          const open = openDay === dayKey;
          return (
            <li key={dayKey} className="overflow-hidden rounded-field border border-border/60">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpenDay(open ? null : dayKey)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/60"
              >
                <span className="w-12 shrink-0 text-xs font-semibold uppercase tracking-[0.08em] text-foreground-secondary">
                  Day {index + 1}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-semibold">{day.name}</span>
                  {day.focus && (
                    <span className="truncate text-xs text-foreground-secondary">
                      {day.focus}
                    </span>
                  )}
                </span>
                <ChevronDown
                  size={iconSize.xs}
                  aria-hidden
                  className={cn(
                    "shrink-0 text-foreground-secondary transition-transform",
                    open && "rotate-180",
                  )}
                />
              </button>
              {open && (
                <ul className="divide-y divide-border/40 border-t border-border/60 bg-surface px-3">
                  {day.exercises.map((exercise) => (
                    <li key={exercise.exerciseId} className="flex items-baseline gap-2 py-2">
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {exerciseName(exercise.exerciseId)}
                      </span>
                      <span className="shrink-0 text-xs tabular-nums text-foreground-secondary">
                        {describeSets(exercise.sets)} · {formatRest(exercise.restSeconds)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      {variant.notes && (
        <p className="text-xs leading-relaxed text-foreground-secondary">
          {variant.notes}
        </p>
      )}
      <p className="text-xs text-foreground-secondary">
        Targets are guides, never caps — going to failure is always valid. Once
        adopted, every day is editable in your plan.
      </p>

      {adoptedName ? (
        <p role="status" className="flex items-center gap-2 text-sm font-semibold text-brand">
          <CheckCircle2 size={iconSize.sm} aria-hidden />
          Added to My Plans as “{adoptedName}” — every day is startable above.
        </p>
      ) : (
        <Button fullWidth onClick={handleAdopt}>
          <Plus size={iconSize.sm} aria-hidden />
          Adopt as my plan
        </Button>
      )}
    </Card>
  );
}
