import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on every request by reading and
 * writing the session cookie. This must run in middleware so that
 * Server Components always see a fresh session.
 *
 * Returns { supabase, response } — the response carries any updated
 * Set-Cookie headers that the caller must forward to the client.
 */
let isSupabaseReachable: boolean | null = null;
let lastReachabilityCheck = 0;
const REACHABILITY_TTL_MS = 300_000; // 5 minutes cache

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

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { user: null, supabaseResponse };
  }

  // Fast path 1: Check if any Supabase auth cookies exist.
  // If the user has no session cookies (guest or local offline mode),
  // skip external network calls completely so navigation is instant (0ms).
  const allCookies = request.cookies.getAll();
  const hasAuthToken = allCookies.some(
    (c) => c.name.startsWith("sb-") && (c.name.includes("auth-token") || c.name.endsWith("-token"))
  );

  if (!hasAuthToken) {
    return { user: null, supabaseResponse };
  }

  // Fast path 2: If cookies exist, verify remote host is reachable before attempting auth call.
  const isOnline = await checkSupabaseAvailable(supabaseUrl);
  if (!isOnline) {
    return { user: null, supabaseResponse };
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Mirror cookies onto the request (for downstream Server
          // Components) and onto the response (for the browser).
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Guard against unreachable/offline Supabase hosts with a strict timeout
  // so remote network latency never hangs user page navigation.
  try {
    const userPromise = supabase.auth.getUser();
    const timeoutPromise = new Promise<{ data: { user: null } }>((resolve) =>
      setTimeout(() => resolve({ data: { user: null } }), 1500)
    );
    const result = await Promise.race([userPromise, timeoutPromise]);
    return { user: result.data.user, supabaseResponse };
  } catch {
    return { user: null, supabaseResponse };
  }
}
