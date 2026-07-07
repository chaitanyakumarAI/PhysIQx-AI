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

/**
 * Relative health-impact weight per pillar (sums to 1). Consistency and the
 * two performance pillars (Strength, Cardio) carry the most weight —
 * evidence-backed, durable signals. Water carries the least: real, but the
 * lowest-effort metric to hit, so it shouldn't dominate the composite.
 */
export const pillarWeights: Record<PillarId, number> = {
  consistency: 0.25,
  strength: 0.2,
  cardio: 0.2,
  bmi: 0.15,
  bodyShape: 0.12,
  water: 0.08,
};

/**
 * Weighted composite (0–100). Normalizes by the total weight actually
 * present, so a partial pillar list (e.g. during calibration) still produces
 * a valid score rather than silently under-counting.
 */
export function computeWeightedScore(pillars: PillarScore[]): number {
  const totalWeight = pillars.reduce(
    (sum, pillar) => sum + (pillarWeights[pillar.id] ?? 0),
    0,
  );
  if (totalWeight === 0) return 0;
  const weightedSum = pillars.reduce(
    (sum, pillar) => sum + pillar.value * (pillarWeights[pillar.id] ?? 0),
    0,
  );
  return Math.round(weightedSum / totalWeight);
}
