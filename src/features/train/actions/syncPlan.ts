"use server";

import { z } from "zod";
import { userPlanSchema } from "@/lib/planSchema";
import { signedInWrite, type SyncWriteResult } from "@/lib/sync/signedInWrite";
import type { UserPlan } from "@/types/plan";

/**
 * Server Action — upserts one plan into `plans`, keyed by its local id.
 * Saving again (or re-creating a deleted id) clears the tombstone.
 */
export async function saveUserPlan(input: UserPlan): Promise<SyncWriteResult> {
  return signedInWrite("plan", userPlanSchema, input, (supabase, userId, plan) =>
    supabase
      .from("plans")
      .upsert(
        { user_id: userId, client_ref: plan.id, payload: plan, deleted_at: null },
        { onConflict: "user_id,client_ref" },
      ),
  );
}

/**
 * Server Action — marks a plan deleted (a tombstone, so other devices drop it
 * too). A plan that never reached the server has nothing to mark: success.
 */
export async function deleteUserPlan(planId: string): Promise<SyncWriteResult> {
  return signedInWrite("plan id", z.string().min(1).max(200), planId, (supabase, userId, id) =>
    supabase
      .from("plans")
      .update({ deleted_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("client_ref", id),
  );
}
