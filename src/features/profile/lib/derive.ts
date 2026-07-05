import { goalLabels, type Profile } from "@/types/profile";
import { programTypeLabels } from "@/types/training";
import type { StreakSummary } from "@/types/training";
import type { StatEntry } from "@/features/shared/components/StatChipRow";
import type { ProfileAchievement, ProfileStats } from "../types";

/**
 * Pure helpers so every derived number/label on Profile is computed from its
 * source, never hand-authored alongside it. StatEntry is defined once,
 * co-located with the shared StatChipRow component that consumes it.
 */
export type { StatEntry };

export function countUnlockedAchievements(achievements: ProfileAchievement[]): number {
  return achievements.filter((achievement) => achievement.state === "unlocked").length;
}

export function buildIdentityStats(profile: Profile): StatEntry[] {
  return [
    { label: "Goal", value: goalLabels[profile.goal] },
    { label: "Split", value: programTypeLabels[profile.activeSplit] },
    { label: "Days/wk", value: String(profile.trainingDaysPerWeek) },
  ];
}

export function buildProgressStats(
  stats: ProfileStats,
  streak: StreakSummary,
): StatEntry[] {
  return [
    { label: "Sessions", value: stats.sessions.toLocaleString() },
    { label: "Streak", value: `${streak.currentStreakDays}d` },
    { label: "Total XP", value: stats.totalXP.toLocaleString() },
  ];
}
