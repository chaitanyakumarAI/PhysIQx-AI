import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { hasSupabaseAuthCookie, isSupabaseReachable } from "./reachability";

type ServerSupabaseClient = ReturnType<typeof createServerClient>;

/**
 * A no-network stand-in used for guests and when Supabase is unreachable:
 * it answers "no user, no rows" instantly so offline navigation never waits.
 */
function offlineClient(): ServerSupabaseClient {
  const empty = Promise.resolve({ data: [], error: null });
  const none = Promise.resolve({ data: null, error: null });
  const query = {
    eq: () => query,
    order: () => empty,
    maybeSingle: () => none,
  };
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signOut: async () => ({ error: null }),
    },
    from: () => ({ select: () => query }),
  } as unknown as ServerSupabaseClient;
}

/**
 * Server-side Supabase client — use in Server Components, Route Handlers,
 * and Server Actions. Reads/writes auth tokens via Next.js cookies.
 *
 * Must be called inside a request context (not at module level).
 */
export async function createServerSupabaseClient(): Promise<ServerSupabaseClient> {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Zero-latency fast path: guests (no auth cookie) never touch the network.
  if (!hasSupabaseAuthCookie(cookieStore.getAll()) || !supabaseUrl || !supabaseKey) {
    return offlineClient();
  }
  if (!(await isSupabaseReachable(supabaseUrl))) {
    return offlineClient();
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // The `setAll` method is called from a Server Component where
          // cookies can't be set. This is fine — the middleware will
          // handle refreshing the session cookie on the next request.
        }
      },
    },
  });
}
