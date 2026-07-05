/**
 * Fuel — docs/DATA_MODELS.md "HydrationEntry / ProteinEntry". Home needs only
 * the current-vs-goal daily aggregate, not the raw ledger.
 */
export type FuelKind = "hydration" | "protein";

export interface FuelProgress {
  kind: FuelKind;
  label: string;
  current: number;
  goal: number;
  unit: string;
  /** Derived — always current/goal, never hand-authored. */
  percent: number;
}
