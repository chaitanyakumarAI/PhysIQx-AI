import { computePercent } from "./math";
import type { LevelProgress } from "@/types/gamification";

/**
 * Levels from lifetime XP (XP is the social currency; the score stays
 * personal). Each level costs a little more than the last, so early levels
 * come fast and later ones mean something.
 */
const FIRST_LEVEL_COST = 400;
const COST_GROWTH = 100;

const TITLES: [minLevel: number, title: string][] = [
  [30, "Elite"],
  [20, "Dedicated"],
  [10, "Committed"],
  [5, "Regular"],
  [1, "Rookie"],
];

export function levelCost(level: number): number {
  return FIRST_LEVEL_COST + (level - 1) * COST_GROWTH;
}

export function computeLevel(lifetimeXp: number): LevelProgress {
  let level = 1;
  let remaining = Math.max(0, Math.floor(lifetimeXp));
  while (remaining >= levelCost(level)) {
    remaining -= levelCost(level);
    level += 1;
  }
  const xpToNextLevel = levelCost(level);
  return {
    level,
    title: TITLES.find(([minLevel]) => level >= minLevel)![1],
    currentXP: remaining,
    xpToNextLevel,
    percent: computePercent(remaining, xpToNextLevel),
  };
}
