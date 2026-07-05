import { Card } from "@/components/ui/Card";
import { HeatmapCalendar } from "@/components/charts/HeatmapCalendar";
import type { DayStatus } from "@/types/training";

export interface StreakHeatmapCardProps {
  weeks: DayStatus[][];
  className?: string;
}

export function StreakHeatmapCard({ weeks, className }: StreakHeatmapCardProps) {
  return (
    <Card padding="lg" className={className}>
      <HeatmapCalendar weeks={weeks} startLabel={`${weeks.length} weeks ago`} />
    </Card>
  );
}
