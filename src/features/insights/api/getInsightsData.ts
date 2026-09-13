import type { InsightsData } from "../types";
import { mockInsightsData } from "../mocks/insightsData";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { calculateUserPhysIQScore } from "@/lib/scoreEngine";
import { generateCoachInsights } from "@/lib/coachInsights";
import { generateHeatmapWeeks, computeStreakSummary } from "@/lib/streakEngine";
import { derivePersonalRecords } from "@/lib/prEngine";
import type { CompletedSessionSummary } from "@/store/sessionStore";

/**
 * Insights' data service seam — merges dynamic PhysIQ score calculations,
 * 12-week activity heatmap, personal records, and live coach insights
 * with fallback fixtures.
 */
export async function getInsightsData(): Promise<InsightsData> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return mockInsightsData;
    }

    const liveScore = await calculateUserPhysIQScore();

    // Query user sessions from Supabase to derive real streaks, heatmap, and PRs
    const { data: dbSessions } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: true });

    const history: CompletedSessionSummary[] = (dbSessions ?? []).map((row: any) => ({
      id: row.client_ref || row.id,
      missionId: row.mission_id || "mission-custom",
      title: row.title || "Workout",
      date: (row.completed_at || row.created_at || new Date().toISOString()).slice(0, 10),
      completedAt: row.completed_at || row.created_at || new Date().toISOString(),
      durationSec: row.duration_seconds || 0,
      setsCompleted: row.sets_completed || 0,
      totalVolumeKg: row.total_volume_kg || 0,
      xpEarned: row.xp_earned || 0,
      topSets: [],
      status: row.status,
    }));

    const streakMetrics = computeStreakSummary(history);

    const dynamicInsights = generateCoachInsights({
      history,
      streakDays: streakMetrics.currentStreakDays,
      pillars: liveScore.pillars,
      weakestPillarId: liveScore.weakestPillarId,
      totalScore: liveScore.score,
    });

    const streakWeeks =
      history.length > 0
        ? generateHeatmapWeeks(history, [], 12)
        : mockInsightsData.streakWeeks;

    const personalRecords =
      history.length > 0
        ? derivePersonalRecords(history)
        : mockInsightsData.personalRecords;

    return {
      ...mockInsightsData,
      score: liveScore,
      streakWeeks,
      personalRecords,
      insights:
        dynamicInsights.length > 0 ? dynamicInsights : mockInsightsData.insights,
    };
  } catch (error) {
    console.error("[getInsightsData] Falling back to mock data:", error);
    return mockInsightsData;
  }
}
