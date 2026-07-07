/**
 * Fuel — docs/DATA_MODELS.md "HydrationEntry". Home needs only the
 * current-vs-goal daily aggregate, not the raw ledger. Protein was removed
 * as a product decision: without a food tracker there is no honest way to
 * know protein intake, and a tracker that asks users to self-report a
 * number they don't know erodes trust in every other number.
 */
export type FuelKind = "hydration";

export interface FuelProgress {
  kind: FuelKind;
  label: string;
  current: number;
  goal: number;
  unit: string;
  /** Derived — always current/goal, never hand-authored. */
  percent: number;
}
