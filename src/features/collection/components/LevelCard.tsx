import { Card } from "@/components/ui/Card";
import { RANK_GRADES } from "@/lib/gamification/catalog";
import type { LevelStatus } from "@/lib/gamification/levels";
import { cn } from "@/lib/utils";
import { GRADE_STYLE, Medal } from "./Medal";

export interface LevelCardProps {
  level: LevelStatus;
  className?: string;
}

/** Level, rank and XP to the next level — the athlete's progression at a glance. */
export function LevelCard({ level, className }: LevelCardProps) {
  const grade = RANK_GRADES[level.rank.id];
  const rookie = level.rank.id === "rookie";
  const accent = GRADE_STYLE[grade].stops[1];

  return (
    <Card padding="md" className={cn("flex items-center gap-4", className)}>
      <Medal
        grade={grade}
        icon="shield"
        shape="shield"
        state={rookie ? "progress" : "earned"}
        artId={rookie ? undefined : `rank-${level.rank.id}`}
        size={64}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-display text-xl font-bold tabular-nums">Level {level.level}</p>
          <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: rookie ? undefined : accent }}>
            {level.rank.name}
          </p>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.07]"
          role="progressbar"
          aria-label={`Level ${level.level} progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={level.percent}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-strong to-brand"
            style={{ width: `${level.percent}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-foreground-secondary">
          {level.xpToNext > 0
            ? `${level.xpToNext.toLocaleString("en-US")} XP to level ${level.level + 1}`
            : "Max level"}
          {level.nextRank && ` · ${level.nextRank.name} rank at level ${level.nextRank.minLevel}`}
        </p>
      </div>
    </Card>
  );
}
