import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { DeltaBadge } from "@/components/ui/DeltaBadge";
import { iconSize } from "@/constants/icons";
import type { PersonalRecordBase } from "@/data/personalRecords";

/**
 * One celebratable win. PRs carry their numbers; milestones carry their
 * story (see features/shared/lib/milestones.ts). The mock picks whichever
 * is freshest — the priority rule when both exist: a new PR beats a
 * milestone, because specific numbers beat generic praise.
 */
export type SpotlightWin =
  | { kind: "pr"; record: PersonalRecordBase }
  | { kind: "milestone"; title: string; detail: string };

export interface AchievementSpotlightProps {
  win: SpotlightWin;
  className?: string;
}

/**
 * Today's biggest win as a small notification-style card — people love
 * progress, so the freshest win gets surfaced on Home instead of hiding in
 * Insights. The trophy wears the violet accent (the sanctioned flat-tint
 * use). Also the celebration surface for streak-psychology milestones.
 */
export function AchievementSpotlight({ win, className }: AchievementSpotlightProps) {
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
            {win.kind === "pr" ? "New PR" : "Milestone"}
          </p>
          <p className="font-semibold">
            {win.kind === "pr" ? win.record.exerciseName : win.title}
          </p>
        </div>
        {win.kind === "pr" ? (
          <div className="flex shrink-0 items-center gap-2">
            <span className="font-display text-2xl font-bold tabular-nums">
              {win.record.value}
              <span className="ml-1 text-sm font-semibold text-foreground-secondary">
                {win.record.unit}
              </span>
            </span>
            <DeltaBadge value={win.record.delta} suffix={` ${win.record.unit}`} />
          </div>
        ) : (
          <p className="max-w-[10rem] shrink-0 text-right text-sm text-foreground-secondary">
            {win.detail}
          </p>
        )}
      </div>
    </Card>
  );
}
