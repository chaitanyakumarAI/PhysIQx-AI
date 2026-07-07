import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { DeltaBadge } from "@/components/ui/DeltaBadge";
import { TrendChart } from "@/components/charts/TrendChart";
import { iconSize } from "@/constants/icons";
import { scoreBand } from "@/lib/score";
import { cn } from "@/lib/utils";
import type { ScoreState } from "@/types/score";

export interface PhysIQScoreCardProps {
  score: number;
  delta: number;
  headline: string;
  state: ScoreState;
  /** Last 7 daily composites, oldest first — the at-a-glance sparkline. */
  weekTrend?: number[];
  /** Where "See breakdown" points (the score-explanation surface). */
  breakdownHref?: string;
  className?: string;
}

const stateCopy: Record<ScoreState, string> = {
  calibrating: "Calibrating — gathering your first week of data.",
  active: "",
  stale: "Been a while — pick back up to resume your score.",
};

/**
 * The PhysIQ Score hero. A bare number answers nothing, so it answers all
 * three product questions itself: the band says whether 82 is good, the
 * delta says which direction vs. last week, the sparkline shows the shape
 * of the week, and "See breakdown" opens the full explanation.
 *
 * Deliberately NOT a Card: no border, no boxy edge — a radial brand
 * gradient that dissolves into the page background, so the score reads as
 * a moment in the screen's light rather than another rectangle in the
 * stack (fixes the "square that doesn't mix with the background" review).
 */
export function PhysIQScoreCard({
  score,
  delta,
  headline,
  state,
  weekTrend,
  breakdownHref,
  className,
}: PhysIQScoreCardProps) {
  const isCalibrating = state === "calibrating";

  return (
    <section
      aria-label="PhysIQ Score"
      className={cn(
        "relative px-6 py-8 [background:radial-gradient(ellipse_75%_85%_at_50%_40%,rgb(34_197_94/0.12),transparent_75%)]",
        className,
      )}
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
            <span className="flex flex-col items-center">
              <span className="font-display text-6xl font-bold">{score}</span>
              <span className="text-sm font-semibold text-brand">
                {scoreBand(score)}
              </span>
            </span>
          )}
        </CircularProgress>
        {!isCalibrating && delta !== 0 && (
          <DeltaBadge value={delta} suffix=" vs last week" />
        )}
        {!isCalibrating && weekTrend && weekTrend.length >= 2 && (
          <TrendChart
            values={weekTrend}
            height={36}
            className="max-w-40"
            aria-label={`Score over the last 7 days, from ${weekTrend[0]} to ${score}`}
          />
        )}
        <p className="max-w-xs text-sm text-foreground-secondary">
          {isCalibrating ? stateCopy.calibrating : headline}
        </p>
        {!isCalibrating && breakdownHref && (
          <Link
            href={breakdownHref}
            className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-semibold text-brand transition-colors hover:text-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
          >
            See breakdown
            <ChevronRight size={iconSize.xs} aria-hidden />
          </Link>
        )}
      </div>
    </section>
  );
}
