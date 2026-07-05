/**
 * AI Insight — docs/DATA_MODELS.md "Insight". `body` carries a length
 * contract (≤ 2 sentences) that AIInsightCard is designed around.
 */
export type InsightCategory = "training" | "nutrition" | "recovery" | "score";
export type InsightSeverity = "celebrate" | "suggest" | "warn";
export type InsightState = "fresh" | "seen" | "acted" | "expired";

export interface Insight {
  id: string;
  category: InsightCategory;
  severity: InsightSeverity;
  headline: string;
  /** Contract: at most two sentences. */
  body: string;
  state: InsightState;
  actionLabel?: string;
  actionHref?: string;
}
