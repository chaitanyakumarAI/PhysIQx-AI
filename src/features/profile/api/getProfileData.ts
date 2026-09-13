import type { ProfileData } from "../types";
import { mockProfileData } from "../mocks/profileData";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { calculateUserPhysIQScore } from "@/lib/scoreEngine";
import type { ExperienceLevel, ProfileGoal } from "@/types/profile";

/**
 * Profile's data service seam — merges authenticated Supabase user profile
 * fields into the profile view-model.
 */
export async function getProfileData(): Promise<ProfileData> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return mockProfileData;
    }

    // Fetch live profile from Supabase
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    // Fetch user's session count & total volume from sessions table
    const { count: sessionCount } = await supabase
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "completed");

    // Fetch dynamic live score
    const liveScore = await calculateUserPhysIQScore();

    return {
      ...mockProfileData,
      profile: {
        ...mockProfileData.profile,
        displayName: profile?.name || user.email?.split("@")[0] || mockProfileData.profile.displayName,
        goal: (profile?.goal as ProfileGoal) || mockProfileData.profile.goal,
        experienceLevel: (profile?.experience_level as ExperienceLevel) || mockProfileData.profile.experienceLevel,
        trainingDaysPerWeek: profile?.training_days_per_week ?? mockProfileData.profile.trainingDaysPerWeek,
      },
      score: liveScore,
      stats: {
        ...mockProfileData.stats,
        sessions: sessionCount ?? mockProfileData.stats.sessions,
      },
    };
  } catch (error) {
    console.error("[getProfileData] Falling back to mock data:", error);
    return mockProfileData;
  }
}
