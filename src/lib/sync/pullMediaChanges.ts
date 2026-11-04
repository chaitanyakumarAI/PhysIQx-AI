"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ledgerCursorSchema, type LedgerCursor } from "./restore";
import type { MediaPage } from "./restoreMedia";

export type MediaPullResult =
  | { status: "ok"; userId: string; page: MediaPage }
  | { status: "unauthenticated" }
  | { status: "error"; error: string };

/**
 * Server Action — one page of media changes for the signed-in athlete
 * since `cursor` (`get_media_changes`, migration 008). RLS decides what
 * comes back.
 */
export async function pullMediaChanges(cursor: LedgerCursor | null, limit: number): Promise<MediaPullResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { status: "unauthenticated" };

  const parsed = cursor ? ledgerCursorSchema.safeParse(cursor) : null;
  if (parsed && !parsed.success) return { status: "error", error: "Invalid media cursor." };
  const { data, error } = await supabase.rpc("get_media_changes", {
    p_cursor: parsed?.data ?? {},
    p_limit: Math.min(500, Math.max(1, Math.round(Number(limit) || 0))),
  });
  if (error) {
    console.error("[pullMediaChanges] rpc failed:", error.message);
    return { status: "error", error: error.message };
  }
  return { status: "ok", userId: user.id, page: data as MediaPage };
}
