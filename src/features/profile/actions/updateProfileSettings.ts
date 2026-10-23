"use server";

import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ABOUT_YOU_LIMITS, onboardingSchema } from "@/features/onboarding/schemas";

/** Same rules as onboarding, every field optional (a settings screen sends one). */
const settingsSchema = onboardingSchema
  .pick({ goal: true, experienceLevel: true, activeSplit: true, goalBodyShape: true })
  .extend({
    name: z.string().trim().min(1).max(ABOUT_YOU_LIMITS.nameMax).optional(),
    trainingDaysPerWeek: z.number().int().min(3).max(6).optional(),
  })
  .strict();

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
  input: UpdateProfileSettingsParams
): Promise<UpdateProfileResult> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Not authenticated. Please log in again." };
  }

  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "That setting isn't valid. Please try again." };
  }
  const params = parsed.data;

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
