"use client";

import { LazyMotion, MotionConfig, domMax } from "framer-motion";

/**
 * App-wide animation setup: LazyMotion keeps the motion bundle lean (use the
 * `m.` components, not `motion.`), and MotionConfig honors the user's
 * prefers-reduced-motion setting globally. domMax (not domAnimation) because
 * shared-layout animations (the bottom-nav active pill's layoutId) need it.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
