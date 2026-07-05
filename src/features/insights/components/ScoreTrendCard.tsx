import { m } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { DeltaBadge } from "@/components/ui/DeltaBadge";
import { TrendChart } from "@/components/charts/TrendChart";
import { duration } from "@/lib/motion";
import { RangeSelector } from "./RangeSelector";
import type { ScoreTrendPoint, ScoreTrendRange } from "@/types/score";

export interface ScoreTrendCardProps {
  score: number;
  delta: number;
  headline: string;
  range: ScoreTrendRange;
  onRangeChange: (range: ScoreTrendRange) => void;
  points: ScoreTrendPoint[];
  className?: string;
}

/**
 * Insights' score card: numeral + trend chart + range selector. Deliberately
 * separate from Home's PhysIQScoreCard (radial gauge) — same PhysIQ Score
 * data, different anatomy per surface, matching the WorkoutHeroCard /
 * DailyMissionCard precedent from Train.
 */
export function ScoreTrendCard({
  score,
  delta,
  headline,
  range,
  onRangeChange,
  points,
  className,
}: ScoreTrendCardProps) {
  return (
    <Card padding="lg" className={className}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-secondary">
            PhysIQ Score
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-display text-5xl font-bold">{score}</span>
            {delta !== 0 && <DeltaBadge value={delta} />}
          </div>
          <p className="mt-2 max-w-[16rem] text-sm text-foreground-secondary">
            {headline}
          </p>
        </div>
        <RangeSelector value={range} onChange={onRangeChange} />
      </div>

      {/* Different ranges have different point counts, so the path can't be
          morphed between them — key-based cross-fade instead, per the
          "always animate charts" rule in docs/UI_Guideliness.md. */}
      <m.div
        key={range}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: duration.progress }}
      >
        <TrendChart
          values={points.map((point) => point.score)}
          tone="brand"
          height={120}
          className="mt-6"
          aria-label={`Score trend, ${points.at(-1)?.score ?? score} currently`}
        />
      </m.div>
    </Card>
  );
}
