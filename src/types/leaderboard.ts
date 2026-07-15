/**
 * LeaderboardEntry — docs/DATA_MODELS.md "LeaderboardEntry". A derived
 * ranking row, never stored truth. `previousRank` carries the raw fact;
 * movement direction/delta is computed from it (see
 * features/compete/lib/derive.ts), never hand-authored alongside rank.
 */
export type LeaderboardScope = "weekly" | "monthly" | "all-time";

export const leaderboardScopeLabels: Record<LeaderboardScope, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  "all-time": "All-time",
};

export interface LeaderboardEntry {
  id: string;
  name: string;
  /** Preset portrait path under public/ — initials fallback when absent. */
  avatarSrc?: string;
  xp: number;
  rank: number;
  previousRank: number;
  isCurrentUser?: boolean;
}
