"use client";

import { MEDIA_BUCKET, mediaStoragePath } from "@/features/profile/lib/mediaRecord";
import { createClient } from "@/lib/supabase/client";
import { getMedia, putMedia } from "./mediaStore";

/**
 * Moves image bytes between this device's media store and the athlete's
 * private folder. The browser talks to Storage directly — the files are
 * too big for a Server Action, and the bucket's policies limit every
 * athlete to their own folder.
 */

/** "missing": the image is gone from this device (deleted since it was queued). */
export async function uploadMedia(mediaId: string, userId: string): Promise<"uploaded" | "missing"> {
  const blob = await getMedia(mediaId);
  if (!blob) return "missing";
  const { error } = await createClient()
    .storage.from(MEDIA_BUCKET)
    .upload(mediaStoragePath(userId, mediaId), blob, { upsert: true, contentType: blob.type || "image/jpeg" });
  if (error) throw new Error(error.message);
  return "uploaded";
}

/** Downloads an image from the athlete's folder into this device's media store. */
export async function downloadMedia(mediaId: string, storagePath: string): Promise<void> {
  const { data, error } = await createClient().storage.from(MEDIA_BUCKET).download(storagePath);
  if (error || !data) throw new Error(error?.message ?? "download failed");
  await putMedia(mediaId, data);
}
