import type { CompeteData } from "../types";
import { mockCompeteData } from "../mocks/competeData";
import { rankWithUser } from "../lib/derive";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { computePercent } from "@/lib/math";

const DAY_MS = 86_400_000;

/**
 * Compete's data service seam. Signed in, the athlete's own leaderboard row
 * carries their real XP (weekly = last 7 days, monthly = last 30, all-time =
 * everything in xp_transactions) and the weekly challenge tracks the volume
 * they actually lifted this week. The rest of the circle is the bundled
 * fixture crew until a social graph exists; guests see the fixture as-is.
 */
export async function getCompeteData(): Promise<CompeteData> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return mockCompeteData;
    }

    const [{ data: profile }, { data: sessions }, { data: xpRows }] = await Promise.all([
      supabase.from("profiles").select("name").eq("id", user.id).maybeSingle(),
      supabase
        .from("sessions")
        .select("total_volume_kg, completed_at")
        .eq("user_id", user.id)
        .eq("status", "completed"),
      supabase.from("xp_transactions").select("amount, created_at").eq("user_id", user.id),
    ]);

    const userName = profile?.name || user.email?.split("@")[0] || "You";
    const now = Date.now();

    /** XP earned in the trailing window; null means all-time. */
    const xpSince = (days: number | null) =>
      (xpRows ?? []).reduce((acc: number, row: { amount: unknown; created_at: unknown }) => {
        const inWindow =
          days === null || new Date(String(row.created_at)).getTime() >= now - days * DAY_MS;
        return inWindow ? acc + (Number(row.amount) || 0) : acc;
      }, 0);

    // Volume King is a weekly challenge — count only this week's lifting.
    const weeklyVolume = (sessions ?? []).reduce(
      (acc: number, s: { total_volume_kg: unknown; completed_at: unknown }) =>
        new Date(String(s.completed_at)).getTime() >= now - 7 * DAY_MS
          ? acc + (Number(s.total_volume_kg) || 0)
          : acc,
      0,
    );

    const me = { id: user.id, name: userName };
    const challengeTarget = mockCompeteData.challenge.target;
    const progress = Math.min(challengeTarget, Math.round(weeklyVolume));

    return {
      ...mockCompeteData,
      currentUserId: user.id,
      participation: {
        challengeId: mockCompeteData.challenge.id,
        progress,
        percent: computePercent(progress, challengeTarget),
      },
      scopes: {
        weekly: rankWithUser(mockCompeteData.scopes.weekly, { ...me, xp: xpSince(7) }),
        monthly: rankWithUser(mockCompeteData.scopes.monthly, { ...me, xp: xpSince(30) }),
        "all-time": rankWithUser(mockCompeteData.scopes["all-time"], { ...me, xp: xpSince(null) }),
      },
    };
  } catch (error) {
    console.error("[getCompeteData] Falling back to mock data:", error);
    return mockCompeteData;
  }
}
