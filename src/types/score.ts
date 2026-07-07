/**
 * PhysIQ Score — docs/PHYSIQ_SCORE.md "The contract". This models the
 * finalized-snapshot output contract, minus the `trend` series (Insights-only,
 * not needed by Home). The composite `score` and each pillar `value` are
 * authored as already-computed — in the real system they're produced by
 * `lib/score`, never derived in the UI layer.
 *
 * Pillar set v2 (revised from the original Training/Nutrition/Recovery/
 * Consistency): Nutrition and Recovery were weak signals without daily food
 * logging or wearables, and Training/Consistency measured almost the same
 * thing. Replaced with six pillars chosen for what's actually trackable
 * without either burden, weighted by health impact (see `pillarWeights` in
 * `@/lib/score`) rather than treated as equal. This is also the single
 * pillar set the Body Balance radar renders (see BodyBalanceCard) — there is
 * no longer a separate, differently-shaped axis list to reconcile.
 */
export type PillarId =
  | "consistency"
  | "strength"
  | "cardio"
  | "bmi"
  | "bodyShape"
  | "water";

export const pillarLabels: Record<PillarId, string> = {
  consistency: "Consistency",
  strength: "Strength",
  cardio: "Cardio",
  bmi: "BMI",
  bodyShape: "Body Shape",
  water: "Water",
};

export interface PillarScore {
  id: PillarId;
  label: string;
  /** 0–100 */
  value: number;
}

export type ScoreState = "calibrating" | "active" | "stale";

export interface PhysIQScoreSnapshot {
  /** 0–100 composite */
  score: number;
  /** Signed change vs. the finalized snapshot 7 days prior. */
  delta: number;
  pillars: PillarScore[];
  weakestPillarId: PillarId;
  /** One sentence explaining the current state — always present, never blank. */
  headline: string;
  state: ScoreState;
  scoreVersion: string;
}

/** The trend range selector on Insights (7D / 30D / 90D / 1Y). */
export type ScoreTrendRange = "7d" | "30d" | "90d" | "1y";

export const scoreTrendRangeLabels: Record<ScoreTrendRange, string> = {
  "7d": "7D",
  "30d": "30D",
  "90d": "90D",
  "1y": "1Y",
};

export interface ScoreTrendPoint {
  date: string;
  score: number;
}
