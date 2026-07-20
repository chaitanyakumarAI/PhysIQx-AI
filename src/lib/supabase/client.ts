import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client — use in Client Components ("use client").
 * Creates a new instance per call; Supabase deduplicates internally via
 * the GoTrue auth manager singleton, so this is safe and idiomatic.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
