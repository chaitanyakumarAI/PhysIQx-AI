"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ledgerCursorsSchema, type LedgerCursors, type LedgerPage } from "./restore";

export type PullResult =
  | { status: "ok"; userId: string; page: LedgerPage }
  /** Guest, or Supabase unreachable: nothing to restore right now. */
  | { status: "unauthenticated" }
  | { status: "error"; error: string };

const MAX_PAGE_SIZE = 500;

/**
 * Server Action — one page of everything that changed for the signed-in
 * athlete since `cursors` (`get_ledger_changes`, migration 007). RLS decides
 * what comes back; the athlete's id is returned so the device can tell whose
 * data it is.
 */
export async function pullLedgerChanges(cursors: LedgerCursors, limit: number): Promise<PullResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { status: "unauthenticated" };

  const parsed = ledgerCursorsSchema.safeParse(cursors);
  if (!parsed.success) return { status: "error", error: "Invalid sync cursor." };
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.round(Number(limit) || 0)));

  const { data, error } = await supabase.rpc("get_ledger_changes", {
    p_cursors: parsed.data,
    p_limit: pageSize,
  });
  if (error) {
    console.error("[pullLedgerChanges] rpc failed:", error.message);
    return { status: "error", error: error.message };
  }
  return { status: "ok", userId: user.id, page: data as LedgerPage };
}
