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

/**
 * Enforces the Insight body contract (≤ 2 sentences). Real LLMs regularly generate
 * 4–5 sentence paragraphs when unconstrained; this guarantees the card layout
 * never breaks regardless of output length.
 */
export function enforceTwoSentences(text: string): string {
  if (!text) return "";
  const trimmed = text.trim();
  const sentences = trimmed.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g);
  if (!sentences || sentences.length <= 2) {
    return trimmed;
  }
  return sentences.slice(0, 2).join("").trim();
}

