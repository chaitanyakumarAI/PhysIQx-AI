"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CompletedSessionSummary } from "@/store/sessionStore";
import type { WorkoutSession } from "@/types/workoutSession";

export interface SaveSessionResult {
  success: boolean;
  sessionDbId?: string;
  error?: string;
}

/**
 * Server Action — persists a completed (or abandoned) WorkoutSession to Supabase.
 *
 * Write order matches DATA_MODELS.md's ledger principle:
 *   1. sessions row  (parent — Supabase auto-generates UUID)
 *   2. session_exercises rows (one per exercise)
 *   3. exercise_sets rows (all completed sets per exercise)
 *   4. xp_transactions row (XP ledger — completed sessions only)
 *
 * Idempotency: client_ref (TEXT UNIQUE) = the local session id string.
 * On retry we SELECT the existing UUID rather than re-inserting.
 *
 * PersonalRecords are NOT written here — they are derived/recomputable
 * (DATA_MODELS.md: "derived data is disposable"). The is_pr flag stored
 * on each set lets Phase 5 re-derive PRs without a full history scan.
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
    return { success: false, error: "Not authenticated. Session saved locally only." };
  }

  // ------------------------------------------------------------------
  // 1. Insert the session row — let Supabase generate the UUID.
  //    client_ref (the local string id) is the idempotency guard:
  //    if this exact session was already saved, return its existing UUID.
  // ------------------------------------------------------------------
  let sessionDbId: string;

  // Check if already saved (retry path)
  const { data: existing } = await supabase
    .from("sessions")
    .select("id")
    .eq("client_ref", summary.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    sessionDbId = existing.id as string;
  } else {
    const { data: inserted, error: insertError } = await supabase
      .from("sessions")
      .insert({
        user_id: user.id,
        client_ref: summary.id,           // e.g. "session-push-day-a-1725284572000"
        template_id: session.missionId,
        template_name: session.title,
        status: session.status,            // "completed" or "abandoned"
        started_at: session.startedAt,
        completed_at: session.completedAt ?? summary.completedAt,
        total_volume_kg: summary.totalVolumeKg,
        xp_earned: summary.xpEarned,
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      console.error("[saveWorkoutSession] sessions insert error:", insertError?.message);
      return { success: false, error: insertError?.message ?? "Failed to save session." };
    }

    sessionDbId = inserted.id as string;
  }

  // ------------------------------------------------------------------
  // 2. session_exercises + exercise_sets
  //    Insert each exercise (get back its UUID), then batch-insert its sets.
  // ------------------------------------------------------------------
  for (const [orderIndex, exercise] of session.exercises.entries()) {
    // Idempotency check: same session + same order position = same exercise row
    const { data: existingEx } = await supabase
      .from("session_exercises")
      .select("id")
      .eq("session_id", sessionDbId)
      .eq("order_index", orderIndex)
      .maybeSingle();

    let exerciseRowId: string;

    if (existingEx) {
      exerciseRowId = existingEx.id as string;
    } else {
      const { data: insertedEx, error: exError } = await supabase
        .from("session_exercises")
        .insert({
          session_id: sessionDbId,
          exercise_id: exercise.exerciseId,
          exercise_name: exercise.exerciseName,
          order_index: orderIndex,
        })
        .select("id")
        .single();

      if (exError || !insertedEx) {
        console.error("[saveWorkoutSession] session_exercises insert error:", exError?.message);
        continue; // non-fatal — try remaining exercises
      }

      exerciseRowId = insertedEx.id as string;
    }

    // Only insert completed sets
    const completedSets = exercise.sets.filter((s) => s.completed);
    if (completedSets.length === 0) continue;

    // Skip if sets already inserted (retry guard — any set for this exercise exists)
    const { count: existingSetCount } = await supabase
      .from("exercise_sets")
      .select("id", { count: "exact", head: true })
      .eq("session_exercise_id", exerciseRowId);

    if (existingSetCount && existingSetCount > 0) continue;

    // Detect the heaviest set for PR flagging
    const heaviestWeight = Math.max(...completedSets.map((s) => s.weight ?? 0));

    const setRows = completedSets.map((s) => ({
      session_exercise_id: exerciseRowId,
      set_number: s.setNumber,
      weight_kg: s.weight ?? 0,
      reps: s.reps ?? 0,
      rpe: s.rpe ?? null,
      is_completed: true,
      // Heaviest set flagged for Phase 5 PR derivation
      is_pr: (s.weight ?? 0) === heaviestWeight && heaviestWeight > 0,
    }));

    const { error: setsError } = await supabase.from("exercise_sets").insert(setRows);

    if (setsError) {
      console.error("[saveWorkoutSession] exercise_sets insert error:", setsError.message);
      // Non-fatal — session + exercise rows already committed
    }
  }

  // ------------------------------------------------------------------
  // 3. XP transaction ledger (append-only per DATA_MODELS.md)
  //    Only completed sessions earn XP — abandoned sessions do not.
  // ------------------------------------------------------------------
  if (session.status === "completed" && summary.xpEarned > 0) {
    // Idempotency: one XP entry per session
    const { count: xpExists } = await supabase
      .from("xp_transactions")
      .select("id", { count: "exact", head: true })
      .eq("source_ref", sessionDbId)
      .eq("source_type", "workout_complete");

    if (!xpExists || xpExists === 0) {
      const { error: xpError } = await supabase.from("xp_transactions").insert({
        user_id: user.id,
        amount: summary.xpEarned,
        source_type: "workout_complete",
        source_ref: sessionDbId,
      });

      if (xpError) {
        console.error("[saveWorkoutSession] xp_transactions insert error:", xpError.message);
        // Non-fatal
      }
    }
  }

  return { success: true, sessionDbId };
}
