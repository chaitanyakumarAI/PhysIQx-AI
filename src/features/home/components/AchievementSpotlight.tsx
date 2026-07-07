import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { DeltaBadge } from "@/components/ui/DeltaBadge";
import { iconSize } from "@/constants/icons";
import type { PersonalRecordBase } from "@/data/personalRecords";

export interface AchievementSpotlightProps {
  record: PersonalRecordBase;
  className?: string;
}

/**
 * Today's biggest win as a small notification-style card — people love
 * progress, so the freshest PR gets surfaced on Home instead of hiding in
 * Insights. The trophy wears the violet accent (a sanctioned special
 * moment). Reused by the M7 celebration system for streak milestones.
 */
export function AchievementSpotlight({ record, className }: AchievementSpotlightProps) {
  return (
    <Card padding="sm" className={className}>
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="grid size-11 shrink-0 place-items-center rounded-full bg-legendary/15 text-legendary"
        >
          <Trophy size={iconSize.md} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-secondary">
            New PR
          </p>
          <p className="font-semibold">{record.exerciseName}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-display text-2xl font-bold tabular-nums">
            {record.value}
            <span className="ml-1 text-sm font-semibold text-foreground-secondary">
              {record.unit}
            </span>
          </span>
          <DeltaBadge value={record.delta} suffix={` ${record.unit}`} />
        </div>
      </div>
    </Card>
  );
}
