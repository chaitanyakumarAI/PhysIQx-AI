/**
 * Achievement (definition) / UserAchievement (state) — docs/DATA_MODELS.md
 * "Achievement (definition) / UserAchievement (state)". Kept as two separate
 * shapes per that doc's modeling principle (catalog definitions vs. a user's
 * relationship to them) — the Profile screen's view-model joins them (see
 * features/profile/types.ts's ProfileAchievement).
 */
export type AchievementRarity = "common" | "rare" | "epic" | "legendary";

/**
 * Icon category, not a per-achievement icon — several achievements can and
 * do share one (e.g. two legendary tiers both use "crown"). The component
 * maps these to actual Lucide icons; kept as plain strings here so mock
 * data stays serializable (no function references crossing the
 * server/client boundary — see docs/ROUTES.md-adjacent lessons from Home).
 */
export type AchievementIconId =
  | "trophy"
  | "flame"
  | "droplet"
  | "dumbbell"
  | "crown";

export interface Achievement {
  id: string;
  name: string;
  rarity: AchievementRarity;
  iconId: AchievementIconId;
}

export type AchievementState = "locked" | "in-progress" | "unlocked";

export interface UserAchievement {
  achievementId: string;
  state: AchievementState;
  /** 0–1. Meaningful for "locked"/"in-progress"; ignored once unlocked. */
  progress: number;
}
