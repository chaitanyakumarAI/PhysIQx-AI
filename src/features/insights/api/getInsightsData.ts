import type { InsightsData } from "../types";
import { mockInsightsData } from "../mocks/insightsData";

/**
 * Insights' data service seam — same pattern as getHomeData()/getTrainData().
 */
export async function getInsightsData(): Promise<InsightsData> {
  return mockInsightsData;
}
