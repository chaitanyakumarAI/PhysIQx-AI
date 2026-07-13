"use client";

import { m } from "framer-motion";
import { duration, easeOut } from "@/lib/motion";

/**
 * Route transition for the tab shell: a template remounts on every
 * navigation (unlike a layout), giving each screen a soft crossfade. Opacity
 * only, deliberately — the screens orchestrate their own staggered rises
 * (first visit per session only, see useEntranceOnce), and a transform here
 * would double-animate them. `press` duration (120ms): tab switches should
 * feel immediate, not choreographed.
 */
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: duration.press, ease: easeOut }}
    >
      {children}
    </m.div>
  );
}
