import { findWeakestPillar } from "@/lib/score";
import type { PhysIQScoreSnapshot, PillarScore } from "@/types/score";

/**
 * The current PhysIQ Score snapshot — shown on BOTH Home and Insights, so it
 * is defined once here (src/data is the shared mock-data layer) rather than
 * per feature, per the same reasoning as src/data/mission.ts.
 */
const pillars: PillarScore[] = [
  { id: "training", label: "Training", value: 92 },
  { id: "nutrition", label: "Nutrition", value: 68 },
  { id: "recovery", label: "Recovery", value: 85 },
  { id: "consistency", label: "Consistency", value: 90 },
];

export const mockPhysIQScore: PhysIQScoreSnapshot = {
  score: 87,
  delta: 4,
  pillars,
  weakestPillarId: findWeakestPillar(pillars),
  headline: "Peak week — training and recovery aligned.",
  state: "active",
  scoreVersion: "v1",
};
