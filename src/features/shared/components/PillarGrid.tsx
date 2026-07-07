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

/** Pillars carrying this many of the heaviest weights render as the primary tier. */
const PRIMARY_TIER_COUNT = 3;

/**
 * The six-pillar breakdown as a two-tier bento grid: the three heaviest-
 * weighted pillars render as full tiles, the rest as a compact row beneath —
 * the visual hierarchy mirrors the scoring weights instead of pretending all
 * six matter equally. Tiers derive from `pillarWeights` (via
 * orderPillarsByWeight), never from a hardcoded list that could drift.
 * Used on Home and inside Insights' BodyBalanceCard — same component, so the
 * two screens can never show conflicting breakdowns of the same score.
 */
export function PillarGrid({ pillars, weakestPillarId, className }: PillarGridProps) {
  const ordered = orderPillarsByWeight(pillars);
  const primary = ordered.slice(0, PRIMARY_TIER_COUNT);
  const secondary = ordered.slice(PRIMARY_TIER_COUNT);

  const renderTile = (pillar: PillarScore, compact: boolean) => (
    <StatTile
      key={pillar.id}
      icon={pillarIcon[pillar.id]}
      value={`${pillar.value}%`}
      label={pillar.label}
      compact={compact}
      tone={pillar.id === weakestPillarId ? "warning" : pillarTone[pillar.id]}
    />
  );

  return (
    <div
      role="group"
      aria-label="Health pillar breakdown"
      className={cn("flex flex-col gap-3", className)}
    >
      <div className="grid grid-cols-3 gap-3">
        {primary.map((pillar) => renderTile(pillar, false))}
      </div>
      {secondary.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {secondary.map((pillar) => renderTile(pillar, true))}
        </div>
      )}
    </div>
  );
}
