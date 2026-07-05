import type { LeaderboardEntry } from "@/types/leaderboard";

/**
 * Pure derivations for Compete. Rank movement and the XP-gap-to-next-rank
 * are both computed from the raw entry list — never hand-authored alongside
 * it — so they can't silently contradict the ranks/XP they describe.
 */

export type RankMovement = "up" | "down" | "same";

export function getRankMovement(entry: {
  rank: number;
  previousRank: number;
}): { direction: RankMovement; delta: number } {
  const delta = entry.previousRank - entry.rank;
  if (delta > 0) return { direction: "up", delta };
  if (delta < 0) return { direction: "down", delta: Math.abs(delta) };
  return { direction: "same", delta: 0 };
}

/** XP gap between the current user and the entry directly above them. */
export function computeXPGapToNextRank(
  entries: LeaderboardEntry[],
  currentUserId: string,
): { xpGap: number; aheadOfName: string } | null {
  const current = entries.find((entry) => entry.id === currentUserId);
  if (!current || current.rank <= 1) return null;

  const above = entries.find((entry) => entry.rank === current.rank - 1);
  if (!above) return null;

  return { xpGap: above.xp - current.xp, aheadOfName: above.name };
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Relative time text ("12m ago", "1h ago") — computed at render time, never stored. */
export function formatRelativeTime(occurredAt: string, now: Date): string {
  const elapsed = now.getTime() - new Date(occurredAt).getTime();

  if (elapsed < HOUR) return `${Math.max(1, Math.round(elapsed / MINUTE))}m ago`;
  if (elapsed < DAY) return `${Math.round(elapsed / HOUR)}h ago`;
  return `${Math.round(elapsed / DAY)}d ago`;
}
