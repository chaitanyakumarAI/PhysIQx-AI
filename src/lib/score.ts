import type { PillarId, PillarScore } from "@/types/score";

/**
 * Cross-feature score math — used wherever a PhysIQ Score fixture or view
 * needs to be built (Home, Insights). Promoted out of a single feature's
 * lib/derive.ts the moment a second feature needed it; this is the seam the
 * real scoring engine (docs/PHYSIQ_SCORE.md's "lib/score") will eventually
 * replace.
 */
export function findWeakestPillar(pillars: PillarScore[]): PillarId {
  return pillars.reduce((weakest, pillar) =>
    pillar.value < weakest.value ? pillar : weakest,
  ).id;
}
