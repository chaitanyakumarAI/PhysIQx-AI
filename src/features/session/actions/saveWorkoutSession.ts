"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { finishedSessionSchema } from "@/features/session/lib/sessionSchema";
import { toWorkoutPayload } from "@/features/session/lib/workoutPayload";
import type { CompletedSessionSummary, WorkoutSession } from "@/types/workoutSession";

export interface SaveSessionResult {
  success: boolean;
  sessionDbId?: string;
  error?: string;
  /** "unauthenticated" = guest: keep the copy local, it's not a failure. */
  reason?: "unauthenticated" | "invalid" | "error";
}

/**
 * Server Action — persists a finished (completed or abandoned) workout.
 *
 * 1. Validates the session against `finishedSessionSchema` (the outbox sends
 *    whatever is in localStorage, so it is untrusted input).
 * 2. Recomputes volume and XP server-side (`toWorkoutPayload`); the client's
 *    summary totals are ignored.
 * 3. Writes session, exercises, sets and XP in one transaction through the
 *    `save_workout_session` function (supabase/migrations/006). Any failure
 *    fails the whole save, so the outbox retries instead of reporting a
 *    half-written workout as synced. Retries are idempotent per client_ref.
 */
export async function saveWorkoutSession(
  session: WorkoutSession,
  summary: CompletedSessionSummary,
): Promise<SaveSessionResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { success: false, reason: "unauthenticated", error: "Not authenticated. Session saved locally only." };
  }

  const parsed = finishedSessionSchema.safeParse(session);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { success: false, reason: "invalid", error: `Invalid workout: ${issue?.path.join(".") ?? "input"} ${issue?.message ?? ""}`.trim() };
  }

  const fallbackCompletedAt = Number.isNaN(Date.parse(summary?.completedAt ?? "")) ? new Date().toISOString() : summary.completedAt;
  const payload = toWorkoutPayload(parsed.data, fallbackCompletedAt);
  const { data, error } = await supabase.rpc("save_workout_session", { p: payload });
  if (error || typeof data !== "string") {
    console.error("[saveWorkoutSession] save_workout_session failed:", error?.message);
    return { success: false, reason: "error", error: error?.message ?? "Failed to save workout." };
  }
  return { success: true, sessionDbId: data };
}
