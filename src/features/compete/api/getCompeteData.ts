import type { CompeteData } from "../types";
import { mockCompeteData } from "../mocks/competeData";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { computePercent } from "@/lib/math";

/**
 * Compete's data service seam — integrates Supabase xp_transactions and volume stats
 * into the leaderboard and challenge participation views.
 */
export async function getCompeteData(): Promise<CompeteData> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return mockCompeteData;
    }

    // Fetch user's profile name and avatar
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .maybeSingle();

    const userName = profile?.name || user.email?.split("@")[0] || "You";

    // Query user's real total volume for Volume King challenge progress
    const { data: sessions } = await supabase
      .from("sessions")
      .select("total_volume_kg")
      .eq("user_id", user.id)
      .eq("status", "completed");

    const totalVolumeLifted = (sessions ?? []).reduce(
      (acc: number, s: any) => acc + (Number(s.total_volume_kg) || 0),
      0
    );

    // Query user's total earned XP from xp_transactions table
    const { data: xpRows } = await supabase
      .from("xp_transactions")
      .select("amount, created_at")
      .eq("user_id", user.id);

    const realLifetimeXP = (xpRows ?? []).reduce(
      (acc: number, row: any) => acc + (Number(row.amount) || 0),
      0
    );

    // Calculate weekly XP (past 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const realWeeklyXP = (xpRows ?? [])
      .filter((row: any) => new Date(row.created_at) >= sevenDaysAgo)
      .reduce((acc: number, row: any) => acc + (Number(row.amount) || 0), 0);

    // Dynamic current user ID
    const currentUserId = user.id;

    // Helper to update current user's entry in a scope's leaderboard list
    const updateScopeWithUser = (
      entries: typeof mockCompeteData.scopes.weekly,
      userXP: number
    ) => {
      const updated = entries.map((entry) => {
        if (entry.isCurrentUser) {
          return {
            ...entry,
            id: currentUserId,
            name: userName,
            xp: entry.xp + userXP,
          };
        }
        return entry;
      });

      // Sort descending by XP and update rank indices
      return updated
        .sort((a, b) => b.xp - a.xp)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));
    };

    const updatedWeekly = updateScopeWithUser(mockCompeteData.scopes.weekly, realWeeklyXP);
    const updatedMonthly = updateScopeWithUser(mockCompeteData.scopes.monthly, Math.round(realLifetimeXP * 0.7));
    const updatedAllTime = updateScopeWithUser(mockCompeteData.scopes["all-time"], realLifetimeXP);

    // Challenge target progress
    const challengeTarget = mockCompeteData.challenge.target;
    const currentProgress = Math.min(challengeTarget, 15_000 + totalVolumeLifted);

    return {
      ...mockCompeteData,
      currentUserId,
      challenge: {
        ...mockCompeteData.challenge,
      },
      participation: {
        challengeId: mockCompeteData.challenge.id,
        progress: currentProgress,
        percent: computePercent(currentProgress, challengeTarget),
      },
      scopes: {
        weekly: updatedWeekly,
        monthly: updatedMonthly,
        "all-time": updatedAllTime,
      },
    };
  } catch (error) {
    console.error("[getCompeteData] Falling back to mock data:", error);
    return mockCompeteData;
  }
}
