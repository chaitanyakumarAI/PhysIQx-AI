"use client";

import { useState } from "react";

/** Screens animated this session — module-level so it survives client-side
 *  navigation and resets only on a hard reload. */
const seenScreens = new Set<string>();

/**
 * Entrance choreography should welcome, not toll: a screen's staggered rise
 * plays on its first visit each session, and every return renders instantly
 * (pass the result as the `initial` prop — `false` tells framer-motion to
 * start at the `animate` state with no transition). This is what makes tab
 * switching feel immediate instead of replaying the same 500ms show.
 */
export function useEntranceOnce(screenKey: string): "hidden" | false {
  // Captured via the useState initializer so it's decided exactly once per
  // mount (Strict Mode double-invokes render — reading the Set inline would
  // see this mount's own mark and skip the very first animation).
  const [firstVisit] = useState(() => !seenScreens.has(screenKey));
  seenScreens.add(screenKey);
  return firstVisit ? "hidden" : false;
}
