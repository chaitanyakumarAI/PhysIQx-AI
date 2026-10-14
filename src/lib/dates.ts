/**
 * Local-calendar date helpers. Every ledger date in the app is a LOCAL
 * calendar day ("yyyy-mm-dd"), never a UTC slice of an ISO timestamp —
 * a workout at 00:30 in IST belongs to today, not yesterday.
 */

/** Local calendar day of a Date as "yyyy-mm-dd". */
export function localIso(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Local calendar day of an ISO timestamp (e.g. a `completedAt`). */
export function localIsoFromTimestamp(timestamp: string): string {
  return localIso(new Date(timestamp));
}

/** Midnight (local) of a "yyyy-mm-dd" day. */
export function parseLocalIso(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

/** "yyyy-mm-dd" shifted by whole days (negative = earlier). */
export function addDaysIso(iso: string, days: number): string {
  const date = parseLocalIso(iso);
  date.setDate(date.getDate() + days);
  return localIso(date);
}

/** Whole days from `fromIso` to `toIso` (positive when `toIso` is later). */
export function daysBetweenIso(fromIso: string, toIso: string): number {
  const ms = parseLocalIso(toIso).getTime() - parseLocalIso(fromIso).getTime();
  // Round, not floor: DST shifts make some days 23 or 25 hours long.
  return Math.round(ms / 86_400_000);
}

/** Monday (local) of the week containing `iso`, as "yyyy-mm-dd". */
export function weekMondayIso(iso: string): string {
  const date = parseLocalIso(iso);
  const weekday = date.getDay(); // 0 = Sun
  return addDaysIso(iso, weekday === 0 ? -6 : 1 - weekday);
}

/** 0 = Monday … 6 = Sunday. */
export function weekdayIndex(iso: string): number {
  const weekday = parseLocalIso(iso).getDay();
  return weekday === 0 ? 6 : weekday - 1;
}

/** Today's local calendar day. */
export function todayIso(): string {
  return localIso(new Date());
}
