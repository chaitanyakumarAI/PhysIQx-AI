import { StatTile } from "@/components/ui/StatTile";
import { cn } from "@/lib/utils";
import { pillarIcon, pillarTone } from "@/features/shared/lib/pillarMeta";
import type { PillarId, PillarScore } from "@/types/score";

export interface PillarGridProps {
  pillars: PillarScore[];
  weakestPillarId?: PillarId;
  className?: string;
}

/**
 * The six-pillar breakdown as a bento grid of icon tiles. Used on Home
 * (standalone, under the score) and Insights (inside BodyBalanceCard,
 * beneath the radar) — same pillars, same component, so the two screens
 * can never show conflicting breakdowns of the same score.
 */
export function PillarGrid({ pillars, weakestPillarId, className }: PillarGridProps) {
  return (
    <div
      role="group"
      aria-label="Health pillar breakdown"
      className={cn("grid grid-cols-3 gap-3", className)}
    >
      {pillars.map((pillar) => (
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
