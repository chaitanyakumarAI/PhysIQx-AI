"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface UpdateProfileSettingsParams {
  name?: string;
  goal?: string;
  experienceLevel?: string;
  activeSplit?: string;
  goalBodyShape?: string;
  trainingDaysPerWeek?: number;
}

export interface UpdateProfileResult {
  success: boolean;
  error?: string;
}

/**
 * Server Action — updates user settings and preferences in the Supabase profiles table.
 */
export async function updateProfileSettings(
  params: UpdateProfileSettingsParams
): Promise<UpdateProfileResult> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Not authenticated. Please log in again." };
  }

  const payload: Record<string, unknown> = {};

  if (params.name !== undefined) payload.name = params.name;
  if (params.goal !== undefined) payload.goal = params.goal;
  if (params.experienceLevel !== undefined) payload.experience_level = params.experienceLevel;
  if (params.activeSplit !== undefined) payload.active_split = params.activeSplit;
  if (params.goalBodyShape !== undefined) payload.goal_body_shape = params.goalBodyShape;
  if (params.trainingDaysPerWeek !== undefined) payload.training_days_per_week = params.trainingDaysPerWeek;

  payload.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", user.id);

  if (error) {
    console.error("[updateProfileSettings] Supabase error:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}
