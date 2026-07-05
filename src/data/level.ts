import { computePercent } from "@/lib/math";
import type { LevelProgress } from "@/types/gamification";

/** Shown on Home and Profile — defined once, same reasoning as src/data/mission.ts. */
export const mockLevel: LevelProgress = {
  level: 14,
  title: "Hybrid Athlete",
  currentXP: 540,
  xpToNextLevel: 660,
  percent: computePercent(540, 660),
};
