import type { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/** What every outbox Server Action answers (see lib/sync/outbox). */
export interface SyncWriteResult {
  success: boolean;
  error?: string;
  /** "unauthenticated" = guest: keep the copy local, it's not a failure. */
  reason?: "unauthenticated" | "invalid" | "error";
}

type ServerClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;

/**
 * The shared body of the outbox's Server Actions: require a signed-in user,
 * validate what localStorage sent (Server Actions are public endpoints),
 * then write. Server-only — import it from "use server" files.
 */
export async function signedInWrite<S extends z.ZodType>(
  label: string,
  schema: S,
  input: unknown,
  write: (
    supabase: ServerClient,
    userId: string,
    value: z.output<S>,
  ) => PromiseLike<{ error: { message: string } | null }>,
): Promise<SyncWriteResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { success: false, reason: "unauthenticated", error: "Not signed in." };
  }

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      success: false,
      reason: "invalid",
      error: `Invalid ${label}: ${issue?.path.join(".") ?? "input"} ${issue?.message ?? ""}`.trim(),
    };
  }

  const { error } = await write(supabase, user.id, parsed.data);
  if (error) {
    console.error(`[sync] ${label} write failed:`, error.message);
    return { success: false, reason: "error", error: error.message };
  }
  return { success: true };
}
