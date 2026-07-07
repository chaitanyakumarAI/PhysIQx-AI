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

export interface RecoveryStatus {
  label: string;
  tone: "brand" | "info";
}

/**
 * The status-strip recovery chip, derived from yesterday's DayStatus —
 * honest about its inputs (plan adherence, not biometrics; wearables would
 * upgrade this later). Falls back to "Ready to train" when yesterday is
 * unknowable (first day of a week view).
 */
export function deriveRecoveryStatus(days: DayStatus[]): RecoveryStatus {
  const todayIndex = days.findIndex((day) => day.isToday);
  const yesterday = todayIndex > 0 ? days[todayIndex - 1] : undefined;

  if (yesterday?.status === "rest-honored") {
    return { label: "Fully recovered", tone: "brand" };
  }
  if (yesterday?.status === "missed") {
    return { label: "Fresh start today", tone: "info" };
  }
  return { label: "Ready to train", tone: "brand" };
}

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
