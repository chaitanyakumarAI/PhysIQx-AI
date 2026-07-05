import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";
import type { LevelProgress } from "@/types/gamification";

export interface XPProgressProps extends React.ComponentProps<"div"> {
  level: LevelProgress;
}

export function XPProgress({ className, level, ...props }: XPProgressProps) {
  return (
    <Card className={cn("flex flex-col gap-3", className)} {...props}>
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-secondary">
            Level {level.level}
          </p>
          <p className="font-display text-xl font-bold">{level.title}</p>
        </div>
        <p className="text-right text-sm text-foreground-secondary">
          Next level
          <br />
          <span className="font-semibold text-foreground">
            {level.xpToNextLevel} XP
          </span>
        </p>
      </div>
      <ProgressBar
        value={level.percent}
        aria-label={`Level progress ${level.percent}%`}
      />
    </Card>
  );
}
