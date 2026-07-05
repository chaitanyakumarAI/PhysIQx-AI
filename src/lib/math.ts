/**
 * Generic numeric helpers — no domain knowledge. Promoted out of a single
 * feature's lib/derive.ts once a second feature needed the same math, same
 * pattern as @/lib/score for findWeakestPillar.
 */

/** Percent of goal, capped at 100. Used for fuel, XP-to-level, and challenge progress. */
export function computePercent(current: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.round(Math.min(current / goal, 1) * 100);
}
