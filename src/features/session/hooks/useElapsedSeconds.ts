"use client";

import { useEffect, useState } from "react";

/**
 * Ticks once per second while `active` is true, computed from a real
 * `startedAt` timestamp (not just incremented in memory) — so the display
 * is correct immediately after a resume/refresh, not reset to zero.
 */
export function useElapsedSeconds(startedAt: string | null, active: boolean): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active || !startedAt) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [active, startedAt]);

  if (!startedAt) return 0;
  return Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / 1000));
}
