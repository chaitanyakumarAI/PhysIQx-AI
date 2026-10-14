import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseAuthCookie, isSupabaseReachable } from "./reachability";

/**
 * Refreshes the Supabase auth session on every request by reading and
 * writing the session cookie. This must run in middleware so that
 * Server Components always see a fresh session.
 *
 * Returns { user, supabaseResponse } — the response carries any updated
 * Set-Cookie headers that the caller must forward to the client.
 */
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
  if (!hasSupabaseAuthCookie(request.cookies.getAll())) {
    return { user: null, supabaseResponse };
  }

  // Fast path 2: If cookies exist, verify remote host is reachable before attempting auth call.
  const isOnline = await isSupabaseReachable(supabaseUrl);
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
