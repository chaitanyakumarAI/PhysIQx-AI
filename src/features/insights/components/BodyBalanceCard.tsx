import { TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PillarGrid } from "@/features/shared/components/PillarGrid";
import { iconSize } from "@/constants/icons";
import type { PillarId, PillarScore } from "@/types/score";

export interface BodyBalanceCardProps {
  pillars: PillarScore[];
  weakestPillarId: PillarId;
  className?: string;
}

/**
 * The pillar breakdown: exact numbers (PillarGrid) + the weakest-link
 * caption. The 4-axis radar that used to sit above was cut — with only
 * four axes it restated these same numbers as geometry while carrying
 * less information (visual-audit finding). Renders the exact same
 * `pillars` shown on Home; there is no separate "Body Balance" data.
 */
export function BodyBalanceCard({ pillars, weakestPillarId, className }: BodyBalanceCardProps) {
  const weakest = pillars.find((pillar) => pillar.id === weakestPillarId);

  return (
    <Card padding="lg" className={className}>
      <PillarGrid pillars={pillars} weakestPillarId={weakestPillarId} />
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
    </Card>
  );
}
