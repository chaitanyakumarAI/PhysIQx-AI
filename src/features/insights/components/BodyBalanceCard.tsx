import { TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { RadarChart } from "@/components/charts/RadarChart";
import { PillarGrid } from "@/features/shared/components/PillarGrid";
import { iconSize } from "@/constants/icons";
import type { PillarId, PillarScore } from "@/types/score";

export interface BodyBalanceCardProps {
  pillars: PillarScore[];
  weakestPillarId: PillarId;
  className?: string;
}

/**
 * The six-pillar radar, paired with PillarGrid beneath it for precise
 * numbers — shape at a glance, exact values underneath. Renders the exact
 * same `pillars` shown on Home; there is no separate "Body Balance" data,
 * which is what resolves the old radar-vs-score-pillar mapping mismatch
 * (docs/PHYSIQ_SCORE.md's former open question).
 */
export function BodyBalanceCard({ pillars, weakestPillarId, className }: BodyBalanceCardProps) {
  const weakest = pillars.find((pillar) => pillar.id === weakestPillarId);

  return (
    <Card padding="lg" className={className}>
      <RadarChart points={pillars} />
      {weakest && (
        <p className="mt-4 flex items-center gap-2 text-sm">
          <TrendingDown size={iconSize.xs} aria-hidden className="text-warning" />
          <span>
            <span className="font-semibold text-warning">{weakest.label}</span>{" "}
            <span className="text-foreground-secondary">
              is your weakest link this week.
            </span>
          </span>
        </p>
      )}
      <PillarGrid pillars={pillars} weakestPillarId={weakestPillarId} className="mt-5" />
    </Card>
  );
}
