import { FAMILIES, type FamilyDef } from "@/lib/gamification/catalog";
import type { CollectibleState } from "@/lib/gamification/progression";
import type { MedalState } from "../components/Medal";

/** A tiered family as one tile: what to show and how far along it is. */
export interface FamilyGroup {
  family: FamilyDef;
  tiers: CollectibleState[];
  /** The tier the tile displays: highest earned, else the first. */
  shown: CollectibleState;
  /** The next tier to work toward (null when all four are earned). */
  next: CollectibleState | null;
  earnedCount: number;
}

export function groupFamilies(collectibles: CollectibleState[]): FamilyGroup[] {
  return FAMILIES.map((family) => {
    const tiers = collectibles
      .filter((item) => item.familyId === family.id)
      .sort((a, b) => (a.tierIndex ?? 0) - (b.tierIndex ?? 0));
    const earned = tiers.filter((tier) => tier.status === "earned");
    const next = tiers.find((tier) => tier.status !== "earned") ?? null;
    return {
      family,
      tiers,
      shown: earned.at(-1) ?? tiers[0]!,
      next,
      earnedCount: earned.length,
    };
  });
}

export function medalState(item: CollectibleState): MedalState {
  if (item.status === "earned") return "earned";
  if (item.status === "sealed") return "sealed";
  return item.status === "in-progress" ? "progress" : "locked";
}

export function formatEarned(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
