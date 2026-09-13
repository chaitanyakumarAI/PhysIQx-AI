import type { InsightsData } from "../types";
import { mockInsightsData } from "../mocks/insightsData";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { calculateUserPhysIQScore } from "@/lib/scoreEngine";
import { generateCoachInsights } from "@/lib/coachInsights";

/**
 * Insights' data service seam — merges dynamic PhysIQ score calculations and
 * live coach insights with fallback fixtures.
 */
export async function getInsightsData(): Promise<InsightsData> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return mockInsightsData;
    }

    const liveScore = await calculateUserPhysIQScore();

    const dynamicInsights = generateCoachInsights({
      history: [],
      streakDays: 0,
      pillars: liveScore.pillars,
      weakestPillarId: liveScore.weakestPillarId,
      totalScore: liveScore.score,
    });

    return {
      ...mockInsightsData,
      score: liveScore,
      insights: dynamicInsights.length > 0 ? dynamicInsights : mockInsightsData.insights,
    };
  } catch (error) {
    console.error("[getInsightsData] Falling back to mock data:", error);
    return mockInsightsData;
  }
}
