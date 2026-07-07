"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { HeatmapCalendar } from "@/components/charts/HeatmapCalendar";
import { cn } from "@/lib/utils";
import { dayStatusLabels, dayStatusTone, type DayStatus } from "@/types/training";

export interface StreakHeatmapCardProps {
  weeks: DayStatus[][];
  className?: string;
}

const dayDetailCopy: Record<DayStatus["status"], string> = {
  trained: "Workout completed — this day fed your streak.",
  "rest-honored": "Planned rest, honored. Recovery counts as showing up.",
  missed: "Missed — it happens. Reflected, never punished.",
  unplanned: "Nothing scheduled this day.",
};

function formatDetailDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * The 12-week heatmap with GitHub-contributions-style inspection: tap any
 * cell and a detail line below the grid names the date, the status, and
 * what it meant — a color is only information once it's explained.
 */
export function StreakHeatmapCard({ weeks, className }: StreakHeatmapCardProps) {
  const [selectedDay, setSelectedDay] = useState<DayStatus | null>(null);

  return (
    <Card padding="lg" className={className}>
      <HeatmapCalendar
        weeks={weeks}
        startLabel={`${weeks.length} weeks ago`}
        onSelectDay={setSelectedDay}
        selectedDate={selectedDay?.date ?? null}
      />
      {selectedDay ? (
        <p
          role="status"
          className="mt-4 flex items-center gap-2 rounded-field bg-surface-elevated px-3 py-2 text-sm"
        >
          <span
            aria-hidden
            className={cn("size-2.5 shrink-0 rounded-sm", dayStatusTone[selectedDay.status])}
          />
          <span className="font-semibold">{formatDetailDate(selectedDay.date)}</span>
          <span className="text-foreground-secondary">
            {dayStatusLabels[selectedDay.status]} · {dayDetailCopy[selectedDay.status]}
          </span>
        </p>
      ) : (
        <p className="mt-4 text-xs text-foreground-secondary">
          Tap any day to see what happened.
        </p>
      )}
    </Card>
  );
}
