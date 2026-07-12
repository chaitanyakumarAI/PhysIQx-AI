import { StatTile } from "@/components/ui/StatTile";
import { orderPillarsByWeight } from "@/lib/score";
import { cn } from "@/lib/utils";
import { pillarIcon, pillarTone } from "@/features/shared/lib/pillarMeta";
import type { PillarId, PillarScore } from "@/types/score";

export interface PillarGridProps {
  pillars: PillarScore[];
  weakestPillarId?: PillarId;
  className?: string;
}

/**
 * The four-pillar breakdown as a 2×2 grid, ordered by scoring weight
 * (heaviest first, via orderPillarsByWeight — never a hardcoded list that
 * could drift from pillarWeights). Used on Home and inside Insights'
 * BodyBalanceCard — same component, so the two screens can never show
 * conflicting breakdowns of the same score.
 */
export function PillarGrid({ pillars, weakestPillarId, className }: PillarGridProps) {
  const ordered = orderPillarsByWeight(pillars);

  return (
    <div
      role="group"
      aria-label="Health pillar breakdown"
      className={cn("grid grid-cols-2 gap-3", className)}
    >
      {ordered.map((pillar) => (
        <StatTile
          key={pillar.id}
          icon={pillarIcon[pillar.id]}
          value={`${pillar.value}%`}
          label={pillar.label}
          tone={pillar.id === weakestPillarId ? "warning" : pillarTone[pillar.id]}
        />
      ))}
    </div>
  );
}
