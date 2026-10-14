import { goalLabels, type ProfileGoal } from "@/types/profile";
import { programTypeLabels, type ProgramType } from "@/types/training";
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

export interface IdentityInput {
  goal: ProfileGoal | null;
  split: ProgramType | null;
  trainingDaysPerWeek: number;
}

export function buildIdentityStats({ goal, split, trainingDaysPerWeek }: IdentityInput): StatEntry[] {
  return [
    { label: "Goal", value: goal ? goalLabels[goal] : "—" },
    { label: "Split", value: split ? programTypeLabels[split] : "—" },
    { label: "Days/wk", value: String(trainingDaysPerWeek) },
  ];
}

export function buildProgressStats(
  stats: ProfileStats,
  streak: StreakSummary,
): StatEntry[] {
  return [
    { label: "Sessions", value: stats.sessions.toLocaleString(), href: "/profile/history" },
    { label: "Streak", value: `${streak.currentStreakDays}d`, href: "/profile/achievements" },
    { label: "Total XP", value: stats.totalXP.toLocaleString() },
  ];
}
