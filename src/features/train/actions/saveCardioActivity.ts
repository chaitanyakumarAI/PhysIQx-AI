"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CardioActivity } from "@/types/cardio";

export interface SaveCardioResult {
  success: boolean;
  cardioDbId?: string;
  error?: string;
  /** "unauthenticated" = guest: keep the copy local, it's not a failure. */
  reason?: "unauthenticated" | "error";
}

/**
 * Server Action — upserts one cardio activity into `cardio_logs`.
 * Idempotent on (user_id, client_ref): the activity's stable id, so a
 * re-import or re-sync updates the same row instead of duplicating it.
 */
export async function saveCardioActivity(activity: CardioActivity): Promise<SaveCardioResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { success: false, reason: "unauthenticated", error: "Not signed in." };
  }

  const row = {
    user_id: user.id,
    client_ref: activity.id,
    source: activity.source,
    external_id: activity.externalId ?? null,
    activity_type: activity.type,
    started_at: activity.startedAt,
    duration_minutes: Math.max(1, Math.round(activity.durationMin)),
    distance_km: activity.distanceKm ?? null,
    avg_heart_rate: activity.avgHeartRate ?? null,
    max_heart_rate: activity.maxHeartRate ?? null,
    calories_burned: activity.calories ?? null,
    synced_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("cardio_logs")
    .upsert(row, { onConflict: "user_id,client_ref" })
    .select("id")
    .single();

  if (error) {
    console.error("[saveCardioActivity] upsert failed:", error.message);
    return { success: false, reason: "error", error: error.message };
  }
  return { success: true, cardioDbId: data?.id as string | undefined };
}
