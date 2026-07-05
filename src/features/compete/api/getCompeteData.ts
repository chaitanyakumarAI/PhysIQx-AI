import type { CompeteData } from "../types";
import { mockCompeteData } from "../mocks/competeData";

/**
 * Compete's data service seam — same pattern as the other features'
 * getXData() functions.
 */
export async function getCompeteData(): Promise<CompeteData> {
  return mockCompeteData;
}
