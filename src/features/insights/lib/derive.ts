import type { BodyBalanceAxis, BodyBalancePoint } from "@/types/score";

/**
 * Pure helper used when building the Body Balance fixture, so
 * `weakestAxisId` can never drift from the points it describes — same
 * pattern as @/lib/score's findWeakestPillar, scoped here since only
 * Insights' radar needs it today.
 */
export function findWeakestAxis(points: BodyBalancePoint[]): BodyBalanceAxis {
  return points.reduce((weakest, point) =>
    point.value < weakest.value ? point : weakest,
  ).id;
}
