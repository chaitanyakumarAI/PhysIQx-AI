import { Card } from "@/components/ui/Card";
import { DeltaBadge } from "@/components/ui/DeltaBadge";
import { TrendChart } from "@/components/charts/TrendChart";
import type { PersonalRecord } from "@/types/personalRecord";

export interface PersonalRecordCardProps {
  record: PersonalRecord;
  className?: string;
}

export function PersonalRecordCard({ record, className }: PersonalRecordCardProps) {
  if (!record || record.trend.length === 0) {
    return (
      <Card padding="lg" className={className}>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <p className="text-sm font-semibold">No PR data logged yet</p>
          <p className="mt-1 text-xs text-foreground-secondary">
            Complete a session for this lift to establish your progression trend.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg" className={className}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold">{record.exerciseName}</h3>
          <p className="text-sm text-foreground-secondary">
            {record.windowLabel} · {record.unit}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-bold">{record.value}</p>
          {record.delta !== 0 && (
            <DeltaBadge value={record.delta} suffix={record.unit} className="mt-1" />
          )}
        </div>
      </div>

      <TrendChart
        points={record.trend}
        tone="info"
        height={100}
        interactive
        detail
        className="mt-4"
        aria-label={`${record.exerciseName} trend, ${record.value}${record.unit} currently. Drag across the chart to inspect each day.`}
      />
    </Card>
  );
}
