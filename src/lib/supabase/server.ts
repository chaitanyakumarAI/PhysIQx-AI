import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client — use in Server Components, Route Handlers,
 * and Server Actions. Reads/writes auth tokens via Next.js cookies.
 *
 * Must be called inside a request context (not at module level).
 */
let isSupabaseReachable: boolean | null = null;
let lastReachabilityCheck = 0;
const REACHABILITY_TTL_MS = 300_000;

async function checkSupabaseAvailable(url: string): Promise<boolean> {
  const now = Date.now();
  if (isSupabaseReachable !== null && now - lastReachabilityCheck < REACHABILITY_TTL_MS) {
    return isSupabaseReachable;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 800);
    const res = await fetch(`${url}/auth/v1/health`, {
      method: "GET",
      signal: controller.signal,
    }).catch(() => null);
    clearTimeout(timer);

    isSupabaseReachable = Boolean(res && res.status < 500);
    lastReachabilityCheck = now;
  } catch {
    isSupabaseReachable = false;
    lastReachabilityCheck = now;
  }

  return isSupabaseReachable;
}

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const hasAuthToken = allCookies.some(
    (c) => c.name.startsWith("sb-") && (c.name.includes("auth-token") || c.name.endsWith("-token"))
  );

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const isOnline = supabaseUrl ? await checkSupabaseAvailable(supabaseUrl) : false;

  // Zero-latency fast path: If there are no Supabase auth cookies in the request
  // OR the remote Supabase instance is offline/unreachable, return an instant offline client.
  // This completely prevents @supabase/auth-js from making failing fetch calls and retrying for 26 seconds.
  if (!hasAuthToken || !isOnline) {
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              order: () => Promise.resolve({ data: [], error: null }),
              maybeSingle: () => Promise.resolve({ data: null, error: null }),
            }),
            order: () => Promise.resolve({ data: [], error: null }),
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
          }),
          order: () => Promise.resolve({ data: [], error: null }),
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    } as unknown as ReturnType<typeof createServerClient>;
  }

  return createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
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
    },
  );
}
