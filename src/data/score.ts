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

const score = computeWeightedScore(pillars);
const delta = 4;

export const mockPhysIQScore: PhysIQScoreSnapshot = {
  score,
  delta,
  // Built from score/delta so the endpoints can never contradict the numbers
  // shown beside the sparkline: starts at score − delta, ends at score.
  weekTrend: [
    score - delta,
    score - 3,
    score - 4,
    score - 2,
    score - 1,
    score - 1,
    score,
  ],
  pillars,
  weakestPillarId: findWeakestPillar(pillars),
  // Specific, quantified, evidence-based (user-provided copy direction):
  // the 14% figure matches the "Volume up 14%" insight on Insights — one
  // fact, two surfaces, zero contradictions. Ends with today's action.
  headline: "Pressing volume up 14% in two weeks — maintain hydration today to support recovery.",
  state: "active",
  scoreVersion: "v2",
};
