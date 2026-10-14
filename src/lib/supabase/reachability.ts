/**
 * Cached Supabase reachability probe, shared by middleware and server
 * clients so a dead network never stalls navigation (the app is
 * offline-first). Success is cached for minutes; failure only briefly — one
 * dropped probe must not demote a signed-in user to guest for long.
 */
const POSITIVE_TTL_MS = 5 * 60_000;
const NEGATIVE_TTL_MS = 15_000;
const PROBE_TIMEOUT_MS = 2500;

let lastResult: boolean | null = null;
let lastCheckedAt = 0;

export async function isSupabaseReachable(url: string): Promise<boolean> {
  const now = Date.now();
  const ttl = lastResult ? POSITIVE_TTL_MS : NEGATIVE_TTL_MS;
  if (lastResult !== null && now - lastCheckedAt < ttl) return lastResult;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const response = await fetch(`${url}/auth/v1/health`, {
      method: "GET",
      signal: controller.signal,
    });
    lastResult = response.status < 500;
  } catch {
    lastResult = false;
  } finally {
    clearTimeout(timer);
    lastCheckedAt = now;
  }
  return lastResult;
}

/** True when the request carries a Supabase auth cookie. */
export function hasSupabaseAuthCookie(cookies: { name: string }[]): boolean {
  return cookies.some(
    (cookie) =>
      cookie.name.startsWith("sb-") &&
      (cookie.name.includes("auth-token") || cookie.name.endsWith("-token")),
  );
}
