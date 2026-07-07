"use client";

import { m } from "framer-motion";
import { duration, easeOut } from "@/lib/motion";

/**
 * Route transition for the tab shell: a template remounts on every
 * navigation (unlike a layout), giving each screen a soft entrance. Opacity
 * only, deliberately — the screens orchestrate their own staggered rises,
 * and a transform here would double-animate them. Costs ~zero bundle
 * (framer-motion already ships) and opacity fades are vestibular-safe.
 */
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: duration.fast, ease: easeOut }}
    >
      {children}
    </m.div>
  );
}
