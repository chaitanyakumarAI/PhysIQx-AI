"use client";

import { TrendingDown, TrendingUp, Zap } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";
import { getRankMovement } from "../lib/derive";
import type { LeaderboardEntry } from "@/types/leaderboard";

export interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  /** If provided, renders a challenge CTA. Absent for the current user's own row. */
  onChallenge?: () => void;
  className?: string;
}

export function LeaderboardRow({ entry, onChallenge, className }: LeaderboardRowProps) {
  const movement = getRankMovement(entry);

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3",
        entry.isCurrentUser && "rounded-field bg-brand/10",
        className,
      )}
    >
      <span className="w-5 shrink-0 text-sm font-semibold text-foreground-secondary">
        {entry.rank}
      </span>
      <Avatar
        name={entry.name}
        src={entry.avatarSrc}
        size="sm"
        variant={entry.isCurrentUser ? "brand" : "default"}
      />
      <div className="min-w-0 flex-1">
        <p className={cn("truncate font-semibold", entry.isCurrentUser && "text-brand")}>
          {entry.name}
          {entry.isCurrentUser && (
            <span className="font-normal text-foreground-secondary"> · you</span>
          )}
        </p>
        <p className="text-sm text-foreground-secondary">
          {entry.xp.toLocaleString()} XP
        </p>
      </div>
      {movement.direction === "same" ? (
        <span aria-label="No change in rank" className="text-sm text-foreground-secondary">
          —
        </span>
      ) : (
        <Badge tone={movement.direction === "up" ? "brand" : "danger"}>
          {movement.direction === "up" ? (
            <TrendingUp size={iconSize.xs} aria-hidden />
          ) : (
            <TrendingDown size={iconSize.xs} aria-hidden />
          )}
          {movement.delta}
        </Badge>
      )}
      {onChallenge && (
        <button
          type="button"
          aria-label={`Challenge ${entry.name}`}
          onClick={onChallenge}
          className="ml-1 grid size-8 shrink-0 place-items-center rounded-full border border-brand/30 text-brand transition-colors hover:bg-brand/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
        >
          <Zap size={iconSize.xs} aria-hidden />
        </button>
      )}
    </div>
  );
}

