import type { WeightEntry } from "@/store/profileStore";

/**
 * Body-stats derivations for /profile/body. BMI here is an *insight*, not a
 * score input — the PhysIQ Score's body-composition signal is the
 * user-selected Body Shape pillar (see docs/PHYSIQ_SCORE.md v3).
 */

/** Seed height until the user sets their own (fixture Alex). */
export const SEED_HEIGHT_CM = 178;

/**
 * Ten weeks of seed weight history (fixture Alex, on a cut) so the trend
 * chart and BMI are meaningful before the user's own log accumulates.
 * Deterministic offsets — no Math.random — dated weekly back from today.
 */
const SEED_WEIGHTS_KG = [79.6, 79.2, 79.3, 78.8, 78.4, 78.6, 78.1, 77.9, 78.0, 77.6];

export function seedWeightEntries(today = new Date()): WeightEntry[] {
  return SEED_WEIGHTS_KG.map((weightKg, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (SEED_WEIGHTS_KG.length - 1 - index) * 7);
    return { date: date.toISOString().slice(0, 10), weightKg };
  });
}

/**
 * Seed history + the user's own log, one entry per date (user wins),
 * oldest first. Merging keeps the chart alive from the first real entry
 * instead of collapsing to a single point.
 */
export function mergeWeightEntries(
  seed: WeightEntry[],
  logged: WeightEntry[],
): WeightEntry[] {
  const loggedDates = new Set(logged.map((entry) => entry.date));
  return [...seed.filter((entry) => !loggedDates.has(entry.date)), ...logged].sort(
    (a, b) => a.date.localeCompare(b.date),
  );
}

export function computeBmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export type BmiCategory = "Underweight" | "Healthy" | "Overweight" | "Obese";

/** WHO adult ranges. */
export function bmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Healthy";
  if (bmi < 30) return "Overweight";
  return "Obese";
}
