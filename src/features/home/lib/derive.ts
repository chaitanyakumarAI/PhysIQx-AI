import type { DayStatus } from "@/types/training";

/**
 * Pure helpers used when building fixtures, so derived fields can never drift
 * from the data they describe. These mirror the derivation rules
 * docs/DATA_MODELS.md assigns to the future `lib/gamification` / `lib/score`
 * modules — they are not those modules, just the fixture-consistency seam.
 *
 * Generic math (computePercent) lives in @/lib/math; score math
 * (findWeakestPillar) lives in @/lib/score — both promoted once a second
 * feature needed them. Week-completion math stays here: Home-only so far.
 */

export function computeCompletionPercent(days: DayStatus[]): number {
  const elapsed = days.filter(
    (day) => day.status !== "unplanned",
  );
  if (elapsed.length === 0) return 0;
  const credited = elapsed.filter(
    (day) => day.status === "trained" || day.status === "rest-honored",
  );
  return Math.round((credited.length / elapsed.length) * 100);
}
