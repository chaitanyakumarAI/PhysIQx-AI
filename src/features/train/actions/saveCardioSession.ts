"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CardioSession } from "@/store/cardioStore";

export interface SaveCardioResult {
  success: boolean;
  cardioDbId?: string;
  error?: string;
}

/**
 * Server Action — persists a synced cardio session to Supabase cardio_logs table.
 * Idempotency is guaranteed by client_ref (the local session ID).
 */
export async function saveCardioSession(
  session: CardioSession,
): Promise<SaveCardioResult> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Not authenticated. Cardio logged locally only." };
  }

  // Idempotency check: see if client_ref already exists
  const { data: existing } = await supabase
    .from("cardio_logs")
    .select("id")
    .eq("client_ref", session.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return { success: true, cardioDbId: existing.id as string };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("cardio_logs")
    .insert({
      user_id: user.id,
      source: session.source || "apple_health",
      activity_type: session.activity,
      duration_minutes: Math.max(1, Math.round(session.minutes)),
      distance_km: session.distanceKm ?? null,
      avg_heart_rate: session.avgHeartRate ?? null,
      calories_burned: session.caloriesBurned ?? null,
      client_ref: session.id,
      started_at: `${session.date}T12:00:00Z`,
      synced_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("[saveCardioSession] Supabase insert error:", insertError.message);
    return { success: false, error: insertError.message };
  }

  return { success: true, cardioDbId: inserted?.id };
}
