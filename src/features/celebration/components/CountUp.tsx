"use client";

import { useEffect } from "react";
import { animate, m, useMotionValue, useTransform } from "framer-motion";

export interface CountUpProps {
  value: number;
  /** Starts the count. */
  play: boolean;
  /** Jump straight to the value (skipped, or reduced motion). */
  instant?: boolean;
  /** Seconds. */
  duration?: number;
}

/** A number that rolls up to `value` — rendered from a motion value, so it doesn't re-render React per frame. */
export function CountUp({ value, play, instant = false, duration = 1 }: CountUpProps) {
  const count = useMotionValue(0);
  const text = useTransform(count, (latest) => Math.round(latest).toLocaleString("en-US"));

  useEffect(() => {
    if (instant || !play) return;
    const controls = animate(count, value, { duration, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [count, value, play, instant, duration]);

  // A motion-value child only shows changes made after it subscribed, so a
  // value set on mount could be missed: when there's nothing to animate,
  // render the plain number.
  if (instant) return <span>{value.toLocaleString("en-US")}</span>;
  return <m.span>{text}</m.span>;
}
