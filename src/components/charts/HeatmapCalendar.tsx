import { cn } from "@/lib/utils";
import { dayStatusTone, type DayStatus } from "@/types/training";

export interface HeatmapCalendarProps {
  /** Outer array = weeks (oldest first), inner array = 7 days. */
  weeks: DayStatus[][];
  /** Caption for the oldest column, e.g. "12 weeks ago". */
  startLabel?: string;
  className?: string;
}

const legendOrder: DayStatus["status"][] = [
  "unplanned",
  "missed",
  "rest-honored",
  "trained",
];

/**
 * GitHub-style contribution grid — reuses the same DayStatus→color mapping
 * as Home's WeeklyActivityCard, so a "trained" day means the same green
 * everywhere in the app. Each cell is individually labeled for screen readers.
 */
export function HeatmapCalendar({
  weeks,
  startLabel,
  className,
}: HeatmapCalendarProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div
        role="img"
        aria-label="12 week training heatmap"
        className="grid auto-cols-fr grid-flow-col gap-1.5"
      >
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-rows-7 gap-1.5">
            {week.map((day) => (
              <span
                key={day.date}
                role="img"
                aria-label={`${day.date}: ${day.status.replace("-", " ")}`}
                className={cn(
                  "aspect-square w-full rounded-sm",
                  dayStatusTone[day.status],
                )}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-foreground-secondary">
        {startLabel && <span>{startLabel}</span>}
        <div className="ml-auto flex items-center gap-1.5">
          <span>less</span>
          {legendOrder.map((status) => (
            <span
              key={status}
              aria-hidden
              className={cn("size-2.5 rounded-sm", dayStatusTone[status])}
            />
          ))}
          <span>more</span>
        </div>
      </div>
    </div>
  );
}
