/**
 * Pure time-of-day greeting. Takes the hour explicitly rather than reading
 * `new Date()` internally, so it stays a pure function and callers control
 * when "now" is evaluated (avoids SSR/CSR hydration mismatches).
 */
export function getGreeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
