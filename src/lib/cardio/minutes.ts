import type { CardioActivity, CardioActivityType } from "@/types/cardio";
import { addDaysIso } from "@/lib/dates";

/**
 * Cardio minutes the way the WHO counts them: 150 moderate minutes a week,
 * with vigorous minutes counting double. Shared by the Cardio pillar and
 * the Cardio screen so the two can never disagree.
 */
export const WHO_WEEKLY_CARDIO_MIN = 150;

const VIGOROUS_TYPES = new Set<CardioActivityType>(["run", "hiit", "row", "swim"]);

export function isVigorous(activity: CardioActivity, age: number | null): boolean {
  if (VIGOROUS_TYPES.has(activity.type)) return true;
  // ≥ 77% of estimated max heart rate counts as vigorous (ACSM).
  return Boolean(activity.avgHeartRate && age && activity.avgHeartRate >= 0.77 * (220 - age));
}

/** Moderate-equivalent minutes in [fromIso, toIso]. */
export function equivalentMinutes(
  activities: CardioActivity[],
  fromIso: string,
  toIso: string,
  age: number | null,
): number {
  return activities
    .filter((activity) => activity.date >= fromIso && activity.date <= toIso)
    .reduce((sum, activity) => sum + activity.durationMin * (isVigorous(activity, age) ? 2 : 1), 0);
}

/** Moderate-equivalent minutes over the last 7 days, today included. */
export function weeklyEquivalentMinutes(
  activities: CardioActivity[],
  todayIso: string,
  age: number | null,
): number {
  return Math.round(equivalentMinutes(activities, addDaysIso(todayIso, -6), todayIso, age));
}
