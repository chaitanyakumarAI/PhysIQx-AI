/**
 * PhysIQ Score — docs/PHYSIQ_SCORE.md "The contract". This models the
 * finalized-snapshot output contract, minus the `trend` series (Insights-only,
 * not needed by Home). The composite `score` and each pillar `value` are
 * authored as already-computed — in the real system they're produced by
 * `lib/score`, never derived in the UI layer.
 */
export type PillarId = "training" | "nutrition" | "recovery" | "consistency";

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

/**
 * Body Balance — the six-axis radar on Insights. Per docs/PHYSIQ_SCORE.md
 * this is a DISPLAY-ONLY decomposition, never a second scoring system — it
 * renders from the same underlying signals as the four score pillars, not a
 * stored composite of its own.
 *
 * Open question (flagged in PHYSIQ_SCORE.md, unresolved): the mapping
 * between the four score pillars (Training/Nutrition/Recovery/Consistency)
 * and these six axes (two of which — Strength, Cardio — aren't tracked
 * anywhere else yet) needs product confirmation before a real derivation is
 * written. Mock data here is authored directly, not derived from the pillars.
 */
export type BodyBalanceAxis =
  | "strength"
  | "nutrition"
  | "hydration"
  | "recovery"
  | "cardio"
  | "consistency";

export interface BodyBalancePoint {
  id: BodyBalanceAxis;
  label: string;
  /** 0–100 */
  value: number;
}

export interface BodyBalance {
  points: BodyBalancePoint[];
  weakestAxisId: BodyBalanceAxis;
}
