import type { Challenge, ChallengeParticipation } from "@/types/challenge";
import type { LeaderboardEntry, LeaderboardScope } from "@/types/leaderboard";
import type { ActivityEvent } from "@/types/activity";

/** Aggregate returned by getCompeteData() — the Compete screen's data contract. */
export interface CompeteData {
  challenge: Challenge;
  participation: ChallengeParticipation;
  currentUserId: string;
  /** One entry list per scope tab — all resolved eagerly, cheap at this size. */
  scopes: Record<LeaderboardScope, LeaderboardEntry[]>;
  activity: ActivityEvent[];
}
