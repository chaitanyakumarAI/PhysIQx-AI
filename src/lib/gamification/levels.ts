/**
 * Levels and ranks (docs/GAMIFICATION_STUDY.md §3.2–3.3).
 *
 * Total XP to reach level L = 500 × (L − 1)^1.5 — polynomial, so every
 * level costs more than the one before: early levels arrive in days (the
 * first week is when habits are most fragile), later ones take months.
 */
export const MAX_LEVEL = 100;
const CURVE_SCALE = 500;
const CURVE_POWER = 1.5;

/** Total XP needed to reach `level` (level 1 = 0 XP). */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round((CURVE_SCALE * (Math.min(level, MAX_LEVEL) - 1) ** CURVE_POWER) / 10) * 10;
}

export function levelForXp(totalXp: number): number {
  let level = 1;
  while (level < MAX_LEVEL && totalXp >= xpForLevel(level + 1)) level += 1;
  return level;
}

export type RankId =
  | "rookie"
  | "iron"
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "obsidian"
  | "legend";

export interface Rank {
  id: RankId;
  name: string;
  minLevel: number;
}

/** Ordered lowest → highest. Each rank is a material, worn on the profile. */
export const RANKS: Rank[] = [
  { id: "rookie", name: "Rookie", minLevel: 1 },
  { id: "iron", name: "Iron", minLevel: 5 },
  { id: "bronze", name: "Bronze", minLevel: 10 },
  { id: "silver", name: "Silver", minLevel: 20 },
  { id: "gold", name: "Gold", minLevel: 30 },
  { id: "platinum", name: "Platinum", minLevel: 40 },
  { id: "diamond", name: "Diamond", minLevel: 50 },
  { id: "obsidian", name: "Obsidian", minLevel: 75 },
  { id: "legend", name: "Legend", minLevel: 100 },
];

export function rankForLevel(level: number): Rank {
  return [...RANKS].reverse().find((rank) => level >= rank.minLevel)!;
}

export interface LevelStatus {
  level: number;
  rank: Rank;
  nextRank: Rank | null;
  totalXp: number;
  /** XP earned inside the current level. */
  xpIntoLevel: number;
  /** XP the current level spans (0 at max level). */
  xpForThisLevel: number;
  /** 0–100 progress through the current level. */
  percent: number;
  /** XP still needed for the next level (0 at max level). */
  xpToNext: number;
}

export function levelStatus(totalXp: number): LevelStatus {
  const level = levelForXp(totalXp);
  const floor = xpForLevel(level);
  const ceiling = level >= MAX_LEVEL ? floor : xpForLevel(level + 1);
  const span = ceiling - floor;
  const rank = rankForLevel(level);
  const nextRank = RANKS.find((candidate) => candidate.minLevel > level) ?? null;
  return {
    level,
    rank,
    nextRank,
    totalXp,
    xpIntoLevel: totalXp - floor,
    xpForThisLevel: span,
    percent: span > 0 ? Math.min(100, Math.round(((totalXp - floor) / span) * 100)) : 100,
    xpToNext: Math.max(0, ceiling - totalXp),
  };
}
