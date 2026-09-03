"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { OnboardingValues } from "../schemas";

export interface SaveOnboardingResult {
  success: boolean;
  error?: string;
}

/**
 * Server Action — persists onboarding selections to the Supabase profiles table.
 *
 * Uses upsert so it's safe to call whether or not a profile row already exists
 * (the trigger from 001_create_profiles.sql creates the row on signup, so
 * update is the normal path — but upsert protects against any race).
 */
export async function saveOnboardingProfile(
  values: OnboardingValues
): Promise<SaveOnboardingResult> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Not authenticated. Please log in again." };
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      goal: values.goal ?? null,
      experience_level: values.experienceLevel ?? null,
      active_split: values.activeSplit ?? null,
      session_frequency: values.sessionFrequency ?? null,
      goal_body_shape: values.goalBodyShape ?? null,
      training_days_per_week: values.trainingDaysPerWeek,
      onboarding_completed_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error("[saveOnboardingProfile] Supabase error:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}
