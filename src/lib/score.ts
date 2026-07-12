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
 * Relative health-impact weight per pillar (sums to 1). Consistency leads —
 * nothing else improves without it. Cardio and Strength follow, matching the
 * mortality evidence (cardiorespiratory fitness and muscular strength are
 * the two strongest modifiable predictors). Body Shape rounds it out as the
 * body-composition signal.
 */
export const pillarWeights: Record<PillarId, number> = {
  consistency: 0.3,
  strength: 0.25,
  cardio: 0.25,
  bodyShape: 0.2,
};

/**
 * Qualitative band for a composite score — gives the bare number context
 * ("82" alone answers nothing; "82 · Excellent" answers "is that good?").
 * Thresholds are product copy, not science; they live here so every surface
 * that names a band names the same one.
 */
export type ScoreBand =
  | "Elite"
  | "Excellent"
  | "Solid"
  | "Building"
  | "Getting started";

export function scoreBand(score: number): ScoreBand {
  if (score >= 90) return "Elite";
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Solid";
  if (score >= 50) return "Building";
  return "Getting started";
}

/**
 * Pillars ordered by health-impact weight, heaviest first. The UI's
 * primary/secondary visual tiers derive from this — never from a hardcoded
 * pillar list that could drift from pillarWeights.
 */
export function orderPillarsByWeight(pillars: PillarScore[]): PillarScore[] {
  return [...pillars].sort(
    (a, b) => (pillarWeights[b.id] ?? 0) - (pillarWeights[a.id] ?? 0),
  );
}

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
