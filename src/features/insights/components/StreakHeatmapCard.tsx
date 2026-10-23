"use client";

import { useMemo, useState } from "react";
import { Dumbbell, Flame, HeartPulse, Moon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { buildActivityCalendar, type CalendarCell } from "@/lib/activityCalendar";
import { cn } from "@/lib/utils";
import { cardioActivityLabels } from "@/types/cardio";
import type { Ledger } from "@/types/ledger";

export interface StreakHeatmapCardProps {
  ledger: Ledger;
  todayIso: string;
  className?: string;
}

const WEEKDAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];

const INTENSITY_CLASS = [
  "",
  "bg-brand/30",
  "bg-brand/55",
  "bg-brand/80",
  "bg-brand shadow-[0_0_10px_-2px_rgba(34,197,94,0.7)]",
] as const;

function cellClass(cell: CalendarCell): string {
  if (cell.status === "trained") return INTENSITY_CLASS[cell.intensity];
  if (cell.isFuture) return "border border-white/[0.05]";
  if (cell.status === "rest-honored") return "bg-white/[0.06]";
  if (cell.status === "missed") return "bg-danger/20";
  return "bg-white/[0.025]";
}

function longDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function monthLabel(week: CalendarCell[], index: number): string {
  const firstOfMonth = week.find((cell) => cell.date.endsWith("-01"));
  if (!firstOfMonth && index !== 0) return "";
  const date = firstOfMonth?.date ?? week[0]!.date;
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { month: "short" });
}

function DayDetail({ cell }: { cell: CalendarCell }) {
  const tonnes = cell.sessions.reduce((sum, session) => sum + session.totalVolumeKg, 0);
  const note =
    cell.isFuture
      ? "Still ahead of you."
      : cell.status === "rest-honored"
        ? "Planned rest — it keeps your streak alive."
        : cell.status === "missed"
          ? "Missed — the week's rest allowance was already used. It's reflected, never punished."
          : cell.status === "unplanned" && !cell.isToday
            ? "Before your training started."
            : cell.isToday && cell.status !== "trained"
              ? "Today's still open."
              : null;

  return (
    <div role="status" className="rounded-2xl bg-white/[0.03] p-3.5">
      <p className="text-sm font-semibold">{longDate(cell.date)}</p>
      {cell.sessions.map((session) => (
        <p key={session.id} className="mt-2 flex items-center gap-2 text-sm">
          <Dumbbell size={14} className="shrink-0 text-brand" aria-hidden />
          <span className="font-medium">{session.title}</span>
          <span className="text-foreground-secondary">
            · {session.totalVolumeKg.toLocaleString("en-US")} kg · {session.setsCompleted} sets
          </span>
        </p>
      ))}
      {cell.cardio.map((activity) => (
        <p key={activity.id} className="mt-2 flex items-center gap-2 text-sm">
          <HeartPulse size={14} className="shrink-0 text-brand" aria-hidden />
          <span className="font-medium">{cardioActivityLabels[activity.type]}</span>
          <span className="text-foreground-secondary">
            · {Math.round(activity.durationMin)} min
            {activity.distanceKm ? ` · ${activity.distanceKm} km` : ""}
          </span>
        </p>
      ))}
      {note && (
        <p className="mt-1.5 flex items-center gap-2 text-sm text-foreground-secondary">
          {cell.status === "rest-honored" && <Moon size={14} className="shrink-0" aria-hidden />}
          {note}
        </p>
      )}
      {cell.sessions.length > 1 && (
        <p className="mt-1.5 text-xs text-foreground-secondary">{tonnes.toLocaleString("en-US")} kg across the day</p>
      )}
    </div>
  );
}

/**
 * Twelve weeks of training as a contribution grid. Green deepens with how
 * big the day was for THIS athlete (relative to their typical session), a
 * soft dot marks planned rest, muted red marks a miss. Tap any day to see
 * exactly what happened.
 */
export function StreakHeatmapCard({ ledger, todayIso, className }: StreakHeatmapCardProps) {
  const calendar = useMemo(() => buildActivityCalendar(ledger, todayIso), [ledger, todayIso]);
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const selected =
    calendar.weeks.flat().find((cell) => cell.date === selectedDate) ??
    calendar.weeks.flat().find((cell) => cell.isToday)!;

  const stats = [
    { label: "Streak", value: `${calendar.currentStreak}`, unit: calendar.currentStreak === 1 ? "day" : "days", icon: true },
    { label: "Best", value: `${calendar.longestStreak}`, unit: calendar.longestStreak === 1 ? "day" : "days" },
    { label: "Active days", value: `${calendar.activeDays}`, unit: `/${calendar.totalDays}` },
  ];

  return (
    <Card padding="md" className={cn("flex flex-col gap-4", className)}>
      <dl className="grid grid-cols-3 gap-2">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-white/[0.03] px-3 py-2.5">
            <dt className="text-[11px] text-foreground-secondary">{stat.label}</dt>
            <dd className="mt-0.5 flex items-baseline gap-1">
              {stat.icon && calendar.currentStreak > 0 && (
                <Flame size={14} className="self-center text-brand" aria-hidden />
              )}
              <span className="font-display text-xl font-bold tabular-nums">{stat.value}</span>
              <span className="text-xs text-foreground-secondary">{stat.unit}</span>
            </dd>
          </div>
        ))}
      </dl>

      <div className="flex gap-2">
        <div aria-hidden className="grid w-7 shrink-0 grid-rows-[14px_repeat(7,1fr)] gap-[3px] text-[9px] text-foreground-secondary">
          <span />
          {WEEKDAY_LABELS.map((label, index) => (
            <span key={index} className="flex items-center">
              {label}
            </span>
          ))}
        </div>
        <div
          role="group"
          aria-label={`Training over the last ${calendar.weeks.length} weeks`}
          className="grid flex-1 auto-cols-fr grid-flow-col gap-[3px]"
        >
          {calendar.weeks.map((week, weekIndex) => (
            <div key={week[0]!.date} className="grid grid-rows-[14px_repeat(7,1fr)] gap-[3px]">
              <span aria-hidden className="whitespace-nowrap text-[9px] leading-[14px] text-foreground-secondary">
                {monthLabel(week, weekIndex)}
              </span>
              {week.map((cell) => (
                <button
                  key={cell.date}
                  type="button"
                  aria-label={`${longDate(cell.date)}: ${cell.status === "trained" ? "trained" : cell.status === "rest-honored" ? "planned rest" : cell.status === "missed" ? "missed" : "no training"}`}
                  aria-pressed={cell.date === selected.date}
                  onClick={() => setSelectedDate(cell.date)}
                  className={cn(
                    "relative aspect-square w-full rounded-[5px] transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                    cellClass(cell),
                    cell.isToday && "ring-1 ring-brand/80",
                    cell.date === selected.date && "ring-2 ring-white/80",
                  )}
                >
                  {cell.status === "rest-honored" && !cell.isFuture && (
                    <span aria-hidden className="absolute left-1/2 top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/35" />
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-foreground-secondary">
        <span className="flex items-center gap-1.5">
          Lighter
          {[1, 2, 3, 4].map((level) => (
            <span key={level} aria-hidden className={cn("size-2.5 rounded-[3px]", INTENSITY_CLASS[level as 1 | 2 | 3 | 4])} />
          ))}
          Bigger day
        </span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="relative size-2.5 rounded-[3px] bg-white/[0.06]">
              <span className="absolute left-1/2 top-1/2 size-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40" />
            </span>
            Rest
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="size-2.5 rounded-[3px] bg-danger/20" />
            Missed
          </span>
        </span>
      </div>

      <DayDetail cell={selected} />
    </Card>
  );
}
