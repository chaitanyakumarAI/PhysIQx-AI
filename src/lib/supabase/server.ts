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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const isOnline = supabaseUrl ? await checkSupabaseAvailable(supabaseUrl) : false;

  return createServerClient(
    supabaseUrl || "https://placeholder.supabase.co",
    supabaseKey || "placeholder-key",
    {
      global: {
        fetch: async (url, options) => {
          if (!isOnline) {
            // Fast failure for offline / unconfigured Supabase instances
            return new Response(JSON.stringify({ error: "Supabase host unreachable" }), {
              status: 503,
              headers: { "Content-Type": "application/json" },
            });
          }
          return fetch(url, options);
        },
      },
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
