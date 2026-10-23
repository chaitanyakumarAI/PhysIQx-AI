"use server";

import {
  profileSnapshotSchema,
  toProfileRow,
  type ProfileSnapshot,
} from "@/features/profile/lib/profileSnapshot";
import { signedInWrite, type SyncWriteResult } from "@/lib/sync/signedInWrite";

/**
 * Server Action — writes the athlete's profile snapshot to `profiles`, unless
 * the server already holds a newer one (another device changed it later).
 */
export async function saveProfileSnapshot(input: ProfileSnapshot): Promise<SyncWriteResult> {
  return signedInWrite("profile", profileSnapshotSchema, input, async (supabase, userId, snapshot) => {
    const row = toProfileRow(snapshot);
    const { data, error } = await supabase
      .from("profiles")
      .update(row)
      .eq("id", userId)
      .or(`client_updated_at.is.null,client_updated_at.lt."${row.client_updated_at}"`)
      .select("id");
    if (error || (data && data.length > 0)) return { error };
    // Nothing updated: either a newer copy is there (leave it) or the signup
    // trigger never created the row (create it). DO NOTHING covers both.
    return supabase
      .from("profiles")
      .upsert({ id: userId, ...row }, { onConflict: "id", ignoreDuplicates: true });
  });
}
