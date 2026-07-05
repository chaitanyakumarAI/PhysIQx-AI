import { Card } from "@/components/ui/Card";
import { Section } from "@/components/layout/Section";
import { cn } from "@/lib/utils";
import { dayStatusTone, type DayStatus, type DayStatusValue } from "@/types/training";

export interface WeeklyActivityCardProps extends React.ComponentProps<"div"> {
  completionPercent: number;
  days: DayStatus[];
}

const statusBarHeight: Record<DayStatusValue, string> = {
  trained: "h-16",
  "rest-honored": "h-8",
  missed: "h-3",
  unplanned: "h-2",
};

/** The "This Week" completion % + daily bar chart. */
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
              <div className="relative flex h-16 w-full items-end justify-center">
                {day.isToday && (
                  <span
                    aria-hidden
                    className="absolute -top-3 size-1.5 rounded-full bg-brand"
                  />
                )}
                <span
                  role="img"
                  aria-label={`${day.weekdayLabel}: ${day.status.replace("-", " ")}`}
                  className={cn(
                    "w-full max-w-8 rounded-full",
                    statusBarHeight[day.status],
                    dayStatusTone[day.status],
                  )}
                />
              </div>
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
      </Section>
    </Card>
  );
}
