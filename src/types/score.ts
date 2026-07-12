/**
 * PhysIQ Score — docs/PHYSIQ_SCORE.md "The contract". This models the
 * finalized-snapshot output contract, minus the `trend` series (Insights-only,
 * not needed by Home). The composite `score` and each pillar `value` are
 * authored as already-computed — in the real system they're produced by
 * `lib/score`, never derived in the UI layer.
 *
 * Pillar set v3: four pillars, weighted by health impact (see
 * `pillarWeights` in `@/lib/score`) rather than treated as equal. v2's BMI
 * and Hydration pillars were removed — BMI double-counted body composition
 * with Body Shape (and punishes muscular users), and hydration is a daily
 * habit (still tracked on Home), not a fitness outcome. This is also the
 * single pillar set the Body Balance radar renders (see BodyBalanceCard) —
 * there is no separate, differently-shaped axis list to reconcile.
 */
export type PillarId = "consistency" | "strength" | "cardio" | "bodyShape";

export const pillarLabels: Record<PillarId, string> = {
  consistency: "Consistency",
  strength: "Strength",
  cardio: "Cardio",
  bodyShape: "Body Shape",
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
  /**
   * The last 7 finalized daily composites, oldest first, ending at `score`.
   * Powers the at-a-glance sparkline on Home; the full queryable trend
   * (30d/90d/1y) remains Insights-only per the contract.
   */
  weekTrend: number[];
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
