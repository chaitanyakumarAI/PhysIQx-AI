import { computePercent } from "@/lib/math";
import type { ActivityEvent } from "@/types/activity";
import type { Challenge, ChallengeParticipation } from "@/types/challenge";
import type { LeaderboardEntry, LeaderboardScope } from "@/types/leaderboard";
import type { CompeteData } from "../types";

/**
 * Fixtures for the Compete feature only. `occurredAt` timestamps are computed
 * relative to real time at fixture-build time (not a fixed past calendar
 * date) — a static page still means these labels go stale between rebuilds,
 * but pinning them to a fixed 2026 date would go stale immediately instead
 * of eventually. See the README for the full tradeoff.
 */

const CURRENT_USER_ID = "user-alex";

const challenge: Challenge = {
  id: "challenge-volume-king",
  name: "Volume King",
  description: "Lift 40,000 kg this week",
  target: 40_000,
  unit: "kg",
  participantCount: 2842,
  daysLeft: 4,
  reward: { tierLabel: "Top 10% earns", badgeName: "Legendary badge" },
};

const participation: ChallengeParticipation = {
  challengeId: challenge.id,
  progress: 24_800,
  percent: computePercent(24_800, challenge.target),
};

const weeklyEntries: LeaderboardEntry[] = [
  { id: "user-sarah", name: "Sarah K.", xp: 18_420, rank: 1, previousRank: 1 },
  { id: "user-marcus", name: "Marcus T.", xp: 17_110, rank: 2, previousRank: 3 },
  {
    id: CURRENT_USER_ID,
    name: "Alex",
    xp: 15_980,
    rank: 3,
    previousRank: 5,
    isCurrentUser: true,
  },
  { id: "user-priya", name: "Priya R.", xp: 14_200, rank: 4, previousRank: 3 },
  { id: "user-diego", name: "Diego M.", xp: 13_640, rank: 5, previousRank: 5 },
  { id: "user-yuki", name: "Yuki H.", xp: 12_010, rank: 6, previousRank: 4 },
];

// Simplification: relative order and movement stay constant across scopes,
// only the XP magnitude scales — no product decision yet says rankings
// should reshuffle per scope, so inventing that would be unjustified.
const scopeMultiplier: Record<LeaderboardScope, number> = {
  weekly: 1,
  monthly: 4.3,
  "all-time": 18,
};

function buildScope(scope: LeaderboardScope): LeaderboardEntry[] {
  const multiplier = scopeMultiplier[scope];
  return weeklyEntries.map((entry) => ({
    ...entry,
    xp: Math.round(entry.xp * multiplier),
  }));
}

const scopes: Record<LeaderboardScope, LeaderboardEntry[]> = {
  weekly: buildScope("weekly"),
  monthly: buildScope("monthly"),
  "all-time": buildScope("all-time"),
};

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

const activity: ActivityEvent[] = [
  {
    id: "activity-sarah-consistency",
    actorName: "Sarah K.",
    type: "achievement-unlock",
    description: "unlocked Consistency King",
    occurredAt: minutesAgo(12),
  },
  {
    id: "activity-marcus-pr",
    actorName: "Marcus T.",
    type: "personal-record",
    description: "hit a new PR on Deadlift · 220 kg",
    occurredAt: minutesAgo(60),
  },
  {
    id: "activity-priya-challenge",
    actorName: "Priya R.",
    type: "challenge-join",
    description: "started 30-day hydration challenge",
    occurredAt: minutesAgo(180),
  },
];

export const mockCompeteData: CompeteData = {
  challenge,
  participation,
  currentUserId: CURRENT_USER_ID,
  scopes,
  activity,
};
