import type { HomeData } from "../types";
import { mockHomeData } from "../mocks/homeData";

/**
 * Home's data service seam. Today it resolves the mock fixture; when the
 * backend exists this becomes the real fetch — callers and the HomeData
 * shape do not change. Kept async now (rather than a plain import) so
 * consuming code already awaits it and Phase 2's swap is a body-only change.
 */
export async function getHomeData(): Promise<HomeData> {
  return mockHomeData;
}
