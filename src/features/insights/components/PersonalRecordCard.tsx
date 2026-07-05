import { Card } from "@/components/ui/Card";
import { DeltaBadge } from "@/components/ui/DeltaBadge";
import { TrendChart } from "@/components/charts/TrendChart";
import type { PersonalRecord } from "@/types/personalRecord";

export interface PersonalRecordCardProps {
  record: PersonalRecord;
  className?: string;
}

export function PersonalRecordCard({ record, className }: PersonalRecordCardProps) {
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
        values={record.trend.map((point) => point.value)}
        tone="info"
        height={100}
        className="mt-4"
        aria-label={`${record.exerciseName} trend, ${record.value}${record.unit} currently`}
      />
    </Card>
  );
}
