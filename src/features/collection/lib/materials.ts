import type { Grade } from "@/lib/gamification/catalog";
import type { RankId } from "@/lib/gamification/levels";

/**
 * Every finish a medal or rank insignia can be struck in. Collection tiers
 * map to the classic metals; ranks add iron, diamond and obsidian so each
 * of the eight insignia reads differently. "unminted" is the dark iron of
 * anything not earned yet — the shape is visible, the shine isn't.
 */
export type MaterialId =
  | "iron"
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "obsidian"
  | "legendary"
  | "unminted";

export interface Material {
  /** Rim metal: highlight → body → shadow. */
  light: string;
  mid: string;
  deep: string;
  /** The emblem's relief — brighter than the rim so it reads at 44 px. */
  emblemLight: string;
  emblemDeep: string;
  /** Enamel face, centre → edge. */
  faceInner: string;
  faceOuter: string;
  /** Aura behind earned pieces (none for unminted). */
  glow: string | null;
  /** Text accent for tier and rank labels. */
  accent: string;
}

export const MATERIALS: Record<MaterialId, Material> = {
  iron: {
    light: "#d3dad6",
    mid: "#747d78",
    deep: "#232825",
    emblemLight: "#eef2f0",
    emblemDeep: "#8e9792",
    faceInner: "#1a1e1c",
    faceOuter: "#0a0c0b",
    glow: "rgba(160,170,165,0.28)",
    accent: "#aab3ae",
  },
  bronze: {
    light: "#ffd4a8",
    mid: "#c8834a",
    deep: "#552b11",
    emblemLight: "#ffe2c4",
    emblemDeep: "#c47a3f",
    faceInner: "#241b13",
    faceOuter: "#0c0907",
    glow: "rgba(200,131,74,0.45)",
    accent: "#d6955f",
  },
  silver: {
    light: "#ffffff",
    mid: "#b8c1ca",
    deep: "#434d57",
    emblemLight: "#ffffff",
    emblemDeep: "#a3aeb8",
    faceInner: "#1b2025",
    faceOuter: "#0a0c0e",
    glow: "rgba(184,193,202,0.38)",
    accent: "#c8d0d8",
  },
  gold: {
    light: "#fff5c9",
    mid: "#e6b43e",
    deep: "#6b4308",
    emblemLight: "#fff8dc",
    emblemDeep: "#dba52c",
    faceInner: "#241c0c",
    faceOuter: "#0c0904",
    glow: "rgba(230,180,62,0.5)",
    accent: "#eabf52",
  },
  platinum: {
    light: "#f4feff",
    mid: "#a8e1ea",
    deep: "#2f6773",
    emblemLight: "#f6ffff",
    emblemDeep: "#94d6e1",
    faceInner: "#112221",
    faceOuter: "#070d0d",
    glow: "rgba(168,225,234,0.5)",
    accent: "#a8e1ea",
  },
  diamond: {
    light: "#f2fbff",
    mid: "#8ed6ff",
    deep: "#1f5683",
    emblemLight: "#ffffff",
    emblemDeep: "#86d3ff",
    faceInner: "#0e1b28",
    faceOuter: "#060b11",
    glow: "rgba(142,214,255,0.55)",
    accent: "#8ed6ff",
  },
  obsidian: {
    light: "#8a978f",
    mid: "#1f2622",
    deep: "#040605",
    emblemLight: "#bbf7d0",
    emblemDeep: "#22c55e",
    faceInner: "#101512",
    faceOuter: "#040605",
    glow: "rgba(34,197,94,0.45)",
    accent: "#4ade80",
  },
  legendary: {
    light: "#e6dbff",
    mid: "#7c5fd6",
    deep: "#1a1038",
    emblemLight: "#f6f2ff",
    emblemDeep: "#a78bfa",
    faceInner: "#1b1332",
    faceOuter: "#07050f",
    glow: "rgba(167,139,250,0.6)",
    accent: "#a78bfa",
  },
  unminted: {
    light: "#4a524d",
    mid: "#2b312d",
    deep: "#121614",
    emblemLight: "#5f6863",
    emblemDeep: "#3b433e",
    faceInner: "#161a18",
    faceOuter: "#0b0d0c",
    glow: null,
    accent: "#71717a",
  },
};

export const GRADE_MATERIAL: Record<Grade, MaterialId> = {
  bronze: "bronze",
  silver: "silver",
  gold: "gold",
  platinum: "platinum",
  legendary: "legendary",
};

export const RANK_MATERIAL: Record<RankId, MaterialId> = {
  rookie: "iron",
  iron: "iron",
  bronze: "bronze",
  silver: "silver",
  gold: "gold",
  platinum: "platinum",
  diamond: "diamond",
  obsidian: "obsidian",
  legend: "legendary",
};

/** Label colour for a collectible: its rank's finish, else its grade's. */
export function accentFor({ grade, rankId }: { grade: Grade; rankId?: RankId }): string {
  return MATERIALS[rankId ? RANK_MATERIAL[rankId] : GRADE_MATERIAL[grade]].accent;
}
