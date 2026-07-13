import { Card } from "@/components/ui/Card";
import { Section } from "@/components/layout/Section";
import { cn } from "@/lib/utils";
import {
  dayStatusLabels,
  type DayStatus,
  type DayStatusValue,
} from "@/types/training";

export interface WeeklyActivityCardProps extends React.ComponentProps<"div"> {
  completionPercent: number;
  days: DayStatus[];
}

/**
 * One geometry, many states: every day is the same full-height capsule and
 * only the FILL carries meaning — the old design encoded status in bar
 * height AND shape AND color at once, which read as rendering bugs
 * (a 3px "missed" sliver, a floating today-dot). Today is a ring around
 * its capsule, and the legend beneath makes the colors self-explanatory.
 */
const statusFill: Record<DayStatusValue, string> = {
  trained: "bg-gradient-to-b from-brand to-brand-strong",
  "rest-honored": "bg-foreground/15",
  missed: "bg-danger/25",
  unplanned: "bg-foreground/[0.07]",
};

const legendItems: { status: DayStatusValue; dot: string }[] = [
  { status: "trained", dot: "bg-brand" },
  { status: "rest-honored", dot: "bg-foreground/40" },
  { status: "missed", dot: "bg-danger/60" },
];

/** The "This Week" completion % + uniform day capsules. */
export function WeeklyActivityCard({
  className,
  completionPercent,
  days,
  ...props
}: WeeklyActivityCardProps) {
  return (
    <Card padding="lg" className={className} {...props}>
      <Section
        title="This week"
        action={
          <span className="text-sm font-semibold text-brand">
            {completionPercent}%
          </span>
        }
      >
        <div
          className="flex items-end justify-between gap-2"
          role="group"
          aria-label="Days trained this week"
        >
          {days.map((day) => (
            <div
              key={day.date}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <span
                role="img"
                aria-label={`${day.weekdayLabel}: ${dayStatusLabels[day.status]}${day.isToday ? " (today)" : ""}`}
                className={cn(
                  "h-14 w-full max-w-7 rounded-full",
                  statusFill[day.status],
                  day.isToday &&
                    "ring-2 ring-brand/70 ring-offset-2 ring-offset-surface",
                )}
              />
              <span
                className={cn(
                  "text-xs",
                  day.isToday
                    ? "font-semibold text-brand"
                    : "text-foreground-secondary",
                )}
              >
                {day.weekdayLabel}
              </span>
            </div>
          ))}
        </div>

        <div
          aria-hidden
          className="mt-1 flex items-center justify-center gap-4 text-[11px] text-foreground-secondary"
        >
          {legendItems.map(({ status, dot }) => (
            <span key={status} className="flex items-center gap-1.5">
              <span className={cn("size-1.5 rounded-full", dot)} />
              {dayStatusLabels[status]}
            </span>
          ))}
        </div>
      </Section>
    </Card>
  );
}
