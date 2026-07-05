import { TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { iconSize } from "@/constants/icons";
import { computeXPGapToNextRank, getRankMovement } from "../lib/derive";
import type { LeaderboardEntry } from "@/types/leaderboard";

export interface ClimbingCardProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
  className?: string;
}

/** "You're climbing" — XP gap to the next rank up, plus current movement. */
export function ClimbingCard({ entries, currentUserId, className }: ClimbingCardProps) {
  const gap = computeXPGapToNextRank(entries, currentUserId);
  const current = entries.find((entry) => entry.id === currentUserId);

  if (!gap || !current) return null;

  const movement = getRankMovement(current);

  return (
    <Card className={className}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-secondary">
            You&apos;re climbing
          </p>
          <p className="mt-1 text-lg">
            <span className="font-display font-bold">
              {gap.xpGap.toLocaleString()} XP
            </span>{" "}
            <span className="text-foreground-secondary">
              to {gap.aheadOfName}
            </span>
          </p>
        </div>
        {movement.direction === "same" ? (
          <Badge tone="neutral">— this week</Badge>
        ) : (
          <Badge tone={movement.direction === "up" ? "brand" : "danger"}>
            {movement.direction === "up" ? (
              <TrendingUp size={iconSize.xs} aria-hidden />
            ) : (
              <TrendingDown size={iconSize.xs} aria-hidden />
            )}
            {movement.delta} this week
          </Badge>
        )}
      </div>
    </Card>
  );
}
