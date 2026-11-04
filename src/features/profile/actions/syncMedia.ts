"use server";

import { z } from "zod";
import {
  MEDIA_BUCKET,
  mediaRecordSchema,
  mediaStoragePath,
  type MediaRecord,
} from "@/features/profile/lib/mediaRecord";
import { signedInWrite, type SyncWriteResult } from "@/lib/sync/signedInWrite";

/**
 * Server Action — records an image the device has just uploaded to the
 * athlete's folder (`media_items`, migration 008). The storage path is built
 * here from the signed-in id, so a client can't point a row at another
 * athlete's file. Saving again clears a tombstone.
 */
export async function saveMediaRecord(input: MediaRecord): Promise<SyncWriteResult> {
  return signedInWrite("media", mediaRecordSchema, input, (supabase, userId, record) =>
    supabase.from("media_items").upsert(
      {
        user_id: userId,
        client_ref: record.mediaId,
        kind: record.kind,
        storage_path: mediaStoragePath(userId, record.mediaId),
        photo: record.photo ?? null,
        deleted_at: null,
      },
      { onConflict: "user_id,client_ref" },
    ),
  );
}

/**
 * Server Action — removes an image's cloud copy: the row becomes a
 * tombstone (other devices drop the image) and the file is deleted. An
 * image that never reached the cloud has nothing to remove: success.
 */
export async function deleteMediaRecord(mediaId: string): Promise<SyncWriteResult> {
  return signedInWrite("media id", z.string().min(1).max(200), mediaId, async (supabase, userId, id) => {
    const marked = await supabase
      .from("media_items")
      .update({ deleted_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("client_ref", id);
    if (marked.error) return { error: marked.error };
    const removed = await supabase.storage.from(MEDIA_BUCKET).remove([mediaStoragePath(userId, id)]);
    return { error: removed.error ? { message: removed.error.message } : null };
  });
}
