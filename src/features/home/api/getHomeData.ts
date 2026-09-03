import type { HomeData } from "../types";
import { mockHomeData } from "../mocks/homeData";
import { calculateUserPhysIQScore } from "@/lib/scoreEngine";

/**
 * Home's data service seam. Dynamically computes the PhysIQ score from Supabase
 * when available, falling back seamlessly to calibration defaults.
 */
export async function getHomeData(): Promise<HomeData> {
  try {
    const liveScore = await calculateUserPhysIQScore();
    return {
      ...mockHomeData,
      score: liveScore,
    };
  } catch {
    return mockHomeData;
  }
}
