import { Card } from "@/components/ui/Card";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { DeltaBadge } from "@/components/ui/DeltaBadge";
import { cn } from "@/lib/utils";
import type { ScoreState } from "@/types/score";

export interface PhysIQScoreCardProps {
  score: number;
  delta: number;
  headline: string;
  state: ScoreState;
  className?: string;
}

const stateCopy: Record<ScoreState, string> = {
  calibrating: "Calibrating — gathering your first week of data.",
  active: "",
  stale: "Been a while — pick back up to resume your score.",
};

/**
 * The PhysIQ Score hero: radial gauge, delta, and headline. Reusable as-is
 * on Insights (which adds a trend chart around it) per docs/PHYSIQ_SCORE.md —
 * this component owns only the score/delta/headline contract, not the trend.
 */
export function PhysIQScoreCard({
  score,
  delta,
  headline,
  state,
  className,
}: PhysIQScoreCardProps) {
  const isCalibrating = state === "calibrating";

  return (
    <Card
      variant="accent"
      padding="lg"
      className={cn("relative overflow-hidden", className)}
    >
      {/* Ambient aura behind the gauge — the hero moment gets its own light. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-8 size-56 -translate-x-1/2 rounded-full bg-brand/15 blur-3xl"
      />
      <div className="relative flex flex-col items-center gap-4 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-secondary">
          PhysIQ Score
        </span>
        <CircularProgress
          value={isCalibrating ? 0 : score}
          size={180}
          strokeWidth={12}
          glow={!isCalibrating}
          aria-label={isCalibrating ? "Score calibrating" : `Score ${score} of 100`}
        >
          {isCalibrating ? (
            <span className="text-lg font-semibold text-foreground-secondary">
              Calibrating
            </span>
          ) : (
            <span className="font-display text-6xl font-bold">{score}</span>
          )}
        </CircularProgress>
        {!isCalibrating && delta !== 0 && (
          <DeltaBadge value={delta} suffix=" this week" />
        )}
        <p className="max-w-xs text-sm text-foreground-secondary">
          {isCalibrating ? stateCopy.calibrating : headline}
        </p>
      </div>
    </Card>
  );
}
