"use server";

import { z } from "zod";
import { signedInWrite, type SyncWriteResult } from "@/lib/sync/signedInWrite";

/**
 * Server Action — marks a cardio activity deleted (a tombstone, so other
 * devices drop it too). Re-importing the same activity clears it again
 * (saveCardioActivity). Nothing on the server yet: nothing to mark, success.
 */
export async function deleteCardioActivity(activityId: string): Promise<SyncWriteResult> {
  return signedInWrite("activity id", z.string().min(1).max(300), activityId, (supabase, userId, id) =>
    supabase
      .from("cardio_logs")
      .update({ deleted_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("client_ref", id),
  );
}
