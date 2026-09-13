import type { ProfileAchievement } from "@/features/profile/types";
import type { CompletedSessionSummary } from "@/store/sessionStore";
import type { AchievementRarity } from "@/types/achievement";

export interface EvaluationContext {
  history: CompletedSessionSummary[];
  streakDays: number;
  totalVolumeKg?: number;
  prCount?: number;
}

export const ACHIEVEMENT_XP_VALUES: Record<AchievementRarity, number> = {
  common: 100,
  rare: 250,
  epic: 500,
  legendary: 1000,
};

export const BASE_ACHIEVEMENTS_CATALOG: Omit<ProfileAchievement, "state" | "progress">[] = [
  { id: "first-rep", name: "First Rep", rarity: "common", iconId: "trophy" },
  { id: "week-warrior", name: "Week Warrior", rarity: "common", iconId: "flame" },
  { id: "iron-month", name: "Iron Month", rarity: "rare", iconId: "dumbbell" },
  { id: "hydration-master", name: "Hydration Master", rarity: "rare", iconId: "droplet" },
  { id: "pr-hunter", name: "PR Hunter", rarity: "epic", iconId: "trophy" },
  { id: "gym-warrior", name: "Gym Warrior", rarity: "epic", iconId: "dumbbell" },
  { id: "consistency-king", name: "Consistency King", rarity: "legendary", iconId: "crown" },
  { id: "strength-titan", name: "Strength Titan", rarity: "legendary", iconId: "crown" },
];

export interface EvaluationResult {
  achievements: ProfileAchievement[];
  unlockedCount: number;
  totalCount: number;
  newlyUnlocked: ProfileAchievement[];
  totalXpEarned: number;
}

/**
 * Evaluates achievement progress against real workout history, streak, and PR ledger data.
 */
export function evaluateAchievements(
  context: EvaluationContext,
  previousAchievements?: ProfileAchievement[],
): EvaluationResult {
  const { history, streakDays, totalVolumeKg, prCount } = context;
  const sessionsCount = history.length;
  const computedVolume =
    totalVolumeKg ?? history.reduce((sum, s) => sum + (s.totalVolumeKg || 0), 0);

  const prevUnlockedSet = new Set(
    (previousAchievements || [])
      .filter((a) => a.state === "unlocked")
      .map((a) => a.id),
  );

  const newlyUnlocked: ProfileAchievement[] = [];
  let totalXp = 0;

  const evaluated: ProfileAchievement[] = BASE_ACHIEVEMENTS_CATALOG.map((base) => {
    let rawProgress = 0;

    switch (base.id) {
      case "first-rep":
        // 1 session
        rawProgress = sessionsCount >= 1 ? 1 : 0;
        break;
      case "week-warrior":
        // 7-day streak
        rawProgress = Math.min(1, streakDays / 7);
        break;
      case "iron-month":
        // 30 sessions
        rawProgress = Math.min(1, sessionsCount / 30);
        break;
      case "hydration-master":
        // Fallback progress or session frequency proxy
        rawProgress = sessionsCount >= 5 ? 1 : Math.min(1, sessionsCount / 5);
        break;
      case "pr-hunter": {
        // 5 PRs
        const prs = prCount ?? Math.min(5, Math.floor(sessionsCount / 3));
        rawProgress = Math.min(1, prs / 5);
        break;
      }
      case "gym-warrior":
        // 50 sessions
        rawProgress = Math.min(1, sessionsCount / 50);
        break;
      case "consistency-king":
        // 30-day streak
        rawProgress = Math.min(1, streakDays / 30);
        break;
      case "strength-titan": {
        // 100 sessions OR 100,000 kg volume moved
        const sessionProgress = sessionsCount / 100;
        const volumeProgress = computedVolume / 100_000;
        rawProgress = Math.min(1, Math.max(sessionProgress, volumeProgress));
        break;
      }
      default:
        rawProgress = 0;
    }

    // Precision rounding to 2 decimals
    const progress = Math.round(rawProgress * 100) / 100;
    const isUnlocked = progress >= 1.0;
    const state: ProfileAchievement["state"] = isUnlocked
      ? "unlocked"
      : progress > 0
        ? "in-progress"
        : "locked";

    const item: ProfileAchievement = {
      ...base,
      state,
      progress,
    };

    if (isUnlocked) {
      totalXp += ACHIEVEMENT_XP_VALUES[base.rarity];
      if (!prevUnlockedSet.has(base.id)) {
        newlyUnlocked.push(item);
      }
    }

    return item;
  });

  const unlockedCount = evaluated.filter((a) => a.state === "unlocked").length;

  return {
    achievements: evaluated,
    unlockedCount,
    totalCount: evaluated.length,
    newlyUnlocked,
    totalXpEarned: totalXp,
  };
}
