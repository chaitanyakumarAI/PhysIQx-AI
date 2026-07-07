import type { Achievement, AchievementState } from "@/types/achievement";
import type { LevelProgress } from "@/types/gamification";
import type { Profile } from "@/types/profile";
import type { PhysIQScoreSnapshot } from "@/types/score";
import type { StreakSummary } from "@/types/training";

/**
 * Flattened Achievement + UserAchievement for direct component consumption.
 * The real normalized split (catalog vs. per-user state) lives in
 * docs/DATA_MODELS.md — joining them here is a frontend view-model
 * convenience, not a claim about the persistence schema.
 */
export interface ProfileAchievement extends Achievement {
  state: AchievementState;
  progress: number;
}

export interface ProfileStats {
  sessions: number;
  /** Lifetime total — must be >= any leaderboard scope-window XP for the
   *  same user (see mocks/profileData.ts for the reasoning). */
  totalXP: number;
}

export type SettingsIconId = "bell" | "moon" | "shield" | "download" | "user" | "play";

export interface SettingsItem {
  id: string;
  label: string;
  value?: string;
  iconId: SettingsIconId;
  href: string;
}

/** Aggregate returned by getProfileData() — the Profile screen's data contract. */
export interface ProfileData {
  profile: Profile;
  score: PhysIQScoreSnapshot;
  level: LevelProgress;
  streak: StreakSummary;
  stats: ProfileStats;
  achievements: ProfileAchievement[];
  settings: SettingsItem[];
}
