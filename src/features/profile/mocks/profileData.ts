import { mockProfile } from "@/data/profile";
import { mockPhysIQScore } from "@/data/score";
import { mockLevel } from "@/data/level";
import { mockStreak } from "@/data/streak";
import type { ProfileAchievement } from "../types";
import type { ProfileData } from "../types";

/**
 * Fixtures for the Profile feature only. Profile/score/level/streak are the
 * shared src/data/ fixtures (same as Home) so the two screens can never
 * disagree about who Alex is.
 *
 * totalXP is NOT copied from the design's shipped mock (2,840). That number
 * is smaller than the weekly leaderboard XP for the same user (15,980 —
 * see features/compete/mocks/competeData.ts), which is impossible: a
 * lifetime total can never be less than a single scope-window sum (flagged
 * as a known inconsistency in docs/DATA_MODELS.md's XPTransaction note).
 * 42,650 is chosen only to satisfy that one real constraint (lifetime >=
 * any window sum) — it is not derived from a real XP ledger, since none
 * exists yet in the mock phase.
 */

const stats: ProfileData["stats"] = {
  sessions: 148,
  totalXP: 42_650,
};

// 3 unlocked / 8 total, matching the "COLLECTION 3/8" counter in the design —
// this count is still derived (see countUnlockedAchievements), never
// hand-typed as "3/8" anywhere.
const achievements: ProfileAchievement[] = [
  { id: "first-rep", name: "First Rep", rarity: "common", iconId: "trophy", state: "unlocked", progress: 1 },
  { id: "week-warrior", name: "Week Warrior", rarity: "common", iconId: "flame", state: "unlocked", progress: 1 },
  // Iron Month unlocked instead of Hydration Master: the default showcase
  // trio should lead with training wins now that hydration isn't a pillar.
  { id: "iron-month", name: "Iron Month", rarity: "rare", iconId: "dumbbell", state: "unlocked", progress: 1 },
  { id: "hydration-master", name: "Hydration Master", rarity: "rare", iconId: "droplet", state: "in-progress", progress: 0.7 },
  { id: "pr-hunter", name: "PR Hunter", rarity: "epic", iconId: "trophy", state: "in-progress", progress: 0.4 },
  { id: "gym-warrior", name: "Gym Warrior", rarity: "epic", iconId: "dumbbell", state: "in-progress", progress: 0.55 },
  { id: "consistency-king", name: "Consistency King", rarity: "legendary", iconId: "crown", state: "in-progress", progress: 0.25 },
  { id: "strength-titan", name: "Strength Titan", rarity: "legendary", iconId: "crown", state: "in-progress", progress: 0.15 },
];

const settings: ProfileData["settings"] = [
  { id: "body-stats", label: "Body stats", iconId: "ruler", href: "/profile/body" },
  { id: "avatar", label: "Avatar", iconId: "user", href: "/profile/settings/avatar" },
  { id: "notifications", label: "Notifications", value: "On", iconId: "bell", href: "/profile/settings/notifications" },
  { id: "appearance", label: "Appearance", value: "Dark", iconId: "moon", href: "/profile/settings/appearance" },
  { id: "privacy", label: "Privacy", iconId: "shield", href: "/profile/settings/privacy" },
  { id: "export-data", label: "Export data", iconId: "download", href: "/profile/settings/export" },
  // Routes to Home with the guided-walkthrough trigger — the tour teaches
  // on the live interface, there is no slides page anymore.
  { id: "tour", label: "Replay app tour", iconId: "play", href: "/home?tour=1" },
];

export const mockProfileData: ProfileData = {
  profile: mockProfile,
  score: mockPhysIQScore,
  level: mockLevel,
  streak: mockStreak,
  stats,
  achievements,
  settings,
};
