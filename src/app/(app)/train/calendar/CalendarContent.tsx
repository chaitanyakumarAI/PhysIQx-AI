"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FilterChipRow } from "@/components/ui/FilterChipRow";
import { Mascot } from "@/components/mascots/Mascot";
import { IconButton } from "@/components/ui/IconButton";
import { PageContainer } from "@/components/layout/PageContainer";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";
import { findProgram, type ProgramVariant } from "@/data/programs";
import { useSessionStore } from "@/store/sessionStore";
import type { ProgramType } from "@/types/training";

/**
 * Which weekdays a variant trains on (1 = Mon … 7 = Sun) — evenly spread
 * rest days, matching each program's own scheduling notes.
 */
const WEEKDAY_LAYOUTS: Record<number, number[]> = {
  2: [1, 4],
  3: [1, 3, 5],
  4: [1, 2, 4, 5],
  5: [1, 2, 3, 4, 5],
  6: [1, 2, 3, 4, 5, 6],
};

const WEEKDAY_HEADERS = ["M", "T", "W", "T", "F", "S", "S"];

interface DayCell {
  date: Date;
  iso: string;
  /** Program day name when this weekday trains, else null (rest). */
  workoutName: string | null;
  inMonth: boolean;
  isToday: boolean;
  trained: boolean;
}

function isoOf(date: Date): string {
  // Local-date ISO — toISOString() is UTC and can shift the day, putting
  // the today-ring / trained-glow on the wrong cell east of Greenwich.
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Mon-first weekday index 1–7 from a JS Date. */
function mondayWeekday(date: Date): number {
  return date.getDay() === 0 ? 7 : date.getDay();
}

function buildMonthCells(
  variant: ProgramVariant,
  trainedDates: Set<string>,
  monthAnchor: Date,
): DayCell[] {
  const layout = WEEKDAY_LAYOUTS[variant.daysPerWeek] ?? WEEKDAY_LAYOUTS[3]!;
  const workoutByWeekday = new Map<number, string>(
    layout.map((weekday, index) => [
      weekday,
      variant.days[index % variant.days.length]!.name,
    ]),
  );

  const first = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - (mondayWeekday(first) - 1));
  const todayIso = isoOf(new Date());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const iso = isoOf(date);
    return {
      date,
      iso,
      workoutName: workoutByWeekday.get(mondayWeekday(date)) ?? null,
      inMonth: date.getMonth() === monthAnchor.getMonth(),
      isToday: iso === todayIso,
      trained: trainedDates.has(iso),
    };
  });
}

/**
 * The program calendar — which workout lands on which real day, Duolingo
 * style: this month as a Mon-first grid, planned days carry their workout,
 * days you actually trained (session ledger) glow solid, today wears the
 * ring. Tap any date for its detail. Reached from a program's schedule
 * card; ?program=<type>&variant=<index> selects what to map.
 */
export function CalendarContent() {
  const searchParams = useSearchParams();
  const history = useSessionStore((state) => state.history);

  const programType = (searchParams.get("program") ?? "ppl") as ProgramType;
  const program = findProgram(programType);
  const [variantIndex, setVariantIndex] = useState(() => {
    const requested = Number(searchParams.get("variant") ?? 0);
    return Number.isFinite(requested) ? requested : 0;
  });
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);

  const variant =
    program?.variants[Math.min(variantIndex, (program?.variants.length ?? 1) - 1)];

  const trainedDates = useMemo(
    () => new Set(history.map((session) => session.date)),
    [history],
  );
  const monthAnchor = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  }, [monthOffset]);
  const cells = useMemo(
    () => (variant ? buildMonthCells(variant, trainedDates, monthAnchor) : []),
    [variant, trainedDates, monthAnchor],
  );

  const monthLabel = monthAnchor.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const selected = cells.find((cell) => cell.iso === selectedIso) ?? null;

  return (
    <PageContainer>
      <div className="flex items-center gap-3 pt-6">
        <Link
          href="/train"
          aria-label="Back to Train"
          className="grid size-11 place-items-center rounded-full text-foreground-secondary transition-colors hover:bg-surface-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
        >
          <ArrowLeft size={iconSize.sm} aria-hidden />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold">
            {program ? program.name : "Program"} calendar
          </h1>
          <p className="text-sm text-foreground-secondary">
            Planned days vs. real training
          </p>
        </div>
      </div>

      {!program || !variant ? (
        <Card padding="md">
          <p className="text-sm text-foreground-secondary">
            Pick a program on Train to see its calendar.
          </p>
        </Card>
      ) : (
        <>
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
                setSelectedIso(null);
              }}
            />
          )}

          <Card padding="md" className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <IconButton
                label="Previous month"
                variant="ghost"
                onClick={() => {
                  setMonthOffset((offset) => offset - 1);
                  setSelectedIso(null);
                }}
              >
                <ChevronLeft size={iconSize.sm} aria-hidden />
              </IconButton>
              <span className="text-sm font-semibold">{monthLabel}</span>
              <IconButton
                label="Next month"
                variant="ghost"
                onClick={() => {
                  setMonthOffset((offset) => offset + 1);
                  setSelectedIso(null);
                }}
              >
                <ChevronRight size={iconSize.sm} aria-hidden />
              </IconButton>
            </div>
            <div aria-hidden className="grid grid-cols-7 gap-1 text-center">
              {WEEKDAY_HEADERS.map((label, index) => (
                <span
                  key={index}
                  className="text-xs font-semibold uppercase text-foreground-secondary"
                >
                  {label}
                </span>
              ))}
            </div>
            <div role="grid" aria-label="Program month calendar" className="grid grid-cols-7 gap-1">
              {cells.map((cell) => (
                <button
                  key={cell.iso}
                  type="button"
                  aria-label={`${cell.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}: ${
                    cell.trained ? "trained" : (cell.workoutName ?? "rest day")
                  }`}
                  onClick={() => setSelectedIso(cell.iso)}
                  className={cn(
                    "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-field text-sm tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60",
                    !cell.inMonth && "opacity-30",
                    cell.trained
                      ? "bg-brand/20 font-semibold text-brand"
                      : cell.workoutName
                        ? "bg-surface-elevated"
                        : "text-foreground-secondary",
                    cell.isToday && "ring-2 ring-brand/70",
                    selectedIso === cell.iso && "ring-2 ring-foreground/40",
                  )}
                >
                  {cell.date.getDate()}
                  <span
                    aria-hidden
                    className={cn(
                      "size-1 rounded-full",
                      cell.trained
                        ? "bg-brand"
                        : cell.workoutName
                          ? "bg-foreground/30"
                          : "bg-transparent",
                    )}
                  />
                </button>
              ))}
            </div>
            <div
              aria-hidden
              className="flex items-center justify-center gap-4 text-[11px] text-foreground-secondary"
            >
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-brand" /> Trained
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-foreground/30" /> Planned
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full border border-foreground/30" /> Rest
              </span>
            </div>
          </Card>

          <Card padding="md">
            {selected ? (
              <div className="flex items-center gap-3">
                {selected.trained && (
                  <CheckCircle2 size={iconSize.md} aria-hidden className="shrink-0 text-brand" />
                )}
                {/* Rest days are Nyra's surface (docs/MASCOTS.md): she
                    enforces recovery — quiet presence, no message. */}
                {!selected.trained && !selected.workoutName && (
                  <Mascot pose="nyra-stare" size={44} shape="circle" className="shrink-0" />
                )}
                <div>
                  <p className="text-sm font-semibold">
                    {selected.date.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-foreground-secondary">
                    {selected.trained
                      ? "Trained — it counts toward your streak."
                      : selected.workoutName
                        ? `${selected.workoutName} · planned`
                        : "Rest day — recovery is part of the program."}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground-secondary">
                Tap any date to see what the program has planned for it.
              </p>
            )}
          </Card>
        </>
      )}
    </PageContainer>
  );
}
