import type { TrainData } from "../types";
import { mockTrainData } from "../mocks/trainData";

/**
 * Train's data service seam — same pattern as getHomeData(): resolves mock
 * fixtures today, becomes the real fetch later without touching callers.
 */
export async function getTrainData(): Promise<TrainData> {
  return mockTrainData;
}
