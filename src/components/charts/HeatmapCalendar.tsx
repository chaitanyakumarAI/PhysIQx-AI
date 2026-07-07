import { cn } from "@/lib/utils";
import { dayStatusLabels, dayStatusTone, type DayStatus } from "@/types/training";

export interface HeatmapCalendarProps {
  /** Outer array = weeks (oldest first), inner array = 7 days. */
  weeks: DayStatus[][];
  /** Caption for the oldest column, e.g. "12 weeks ago". */
  startLabel?: string;
  /** Makes cells tappable (GitHub-contributions style). */
  onSelectDay?: (day: DayStatus) => void;
  /** The currently inspected day's date, highlighted with a ring. */
  selectedDate?: string | null;
  className?: string;
}

const legendOrder: DayStatus["status"][] = [
  "trained",
  "rest-honored",
  "missed",
  "unplanned",
];

/**
 * GitHub-style contribution grid — reuses the same DayStatus→color mapping
 * as Home's WeeklyActivityCard, so a "trained" day means the same green
 * everywhere in the app. The legend names every color explicitly (a color
 * means nothing until it's labeled). When `onSelectDay` is provided, cells
 * are real buttons; they're intentionally smaller than the 44px touch bar —
 * an inherent property of a 12-week grid — so the tap target is supplemental
 * (each cell also carries a full aria-label, and the detail panel repeats
 * everything a tap reveals).
 */
export function HeatmapCalendar({
  weeks,
  startLabel,
  onSelectDay,
  selectedDate,
  className,
}: HeatmapCalendarProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div
        role={onSelectDay ? "group" : "img"}
        aria-label="12 week training heatmap"
        className="grid auto-cols-fr grid-flow-col gap-1.5"
      >
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-rows-7 gap-1.5">
            {week.map((day) => {
              const label = `${day.date}: ${dayStatusLabels[day.status]}`;
              const toneClass = cn(
                "aspect-square w-full rounded-sm",
                dayStatusTone[day.status],
                day.date === selectedDate &&
                  "ring-2 ring-brand ring-offset-1 ring-offset-surface",
              );

              return onSelectDay ? (
                <button
                  key={day.date}
                  type="button"
                  aria-label={label}
                  aria-pressed={day.date === selectedDate}
                  onClick={() => onSelectDay(day)}
                  className={cn(
                    toneClass,
                    "transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand hover:scale-110",
                  )}
                />
              ) : (
                <span key={day.date} role="img" aria-label={label} className={toneClass} />
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-foreground-secondary">
        {startLabel && <span>{startLabel}</span>}
        <ul className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-1">
          {legendOrder.map((status) => (
            <li key={status} className="flex items-center gap-1.5">
              <span
                aria-hidden
                className={cn("size-2.5 rounded-sm", dayStatusTone[status])}
              />
              {dayStatusLabels[status]}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
