import { computeWeightedScore, findWeakestPillar } from "@/lib/score";
import { pillarLabels } from "@/types/score";
import type { PhysIQScoreSnapshot, PillarScore } from "@/types/score";

/**
 * The current PhysIQ Score snapshot — shown on BOTH Home and Insights, so it
 * is defined once here (src/data is the shared mock-data layer) rather than
 * per feature, per the same reasoning as src/data/mission.ts. The composite
 * `score` is derived from these pillar values via the same weighted formula
 * `lib/score` will use for real — not hand-authored — so the two can never
 * silently disagree.
 */
const pillars: PillarScore[] = [
  { id: "consistency", label: pillarLabels.consistency, value: 90 },
  { id: "strength", label: pillarLabels.strength, value: 88 },
  { id: "cardio", label: pillarLabels.cardio, value: 75 },
  { id: "bmi", label: pillarLabels.bmi, value: 82 },
  { id: "bodyShape", label: pillarLabels.bodyShape, value: 79 },
  { id: "water", label: pillarLabels.water, value: 58 },
];

export const mockPhysIQScore: PhysIQScoreSnapshot = {
  score: computeWeightedScore(pillars),
  delta: 4,
  pillars,
  weakestPillarId: findWeakestPillar(pillars),
  headline: "Peak week — strength and consistency leading the way.",
  state: "active",
  scoreVersion: "v2",
};
