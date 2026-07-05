import type { Variants } from "framer-motion";

/**
 * Standard animation durations in seconds, mirroring the "Standard
 * Animations" table in docs/UI_Guideliness.md. Framer Motion reads these;
 * CSS transitions use the equivalent built-in duration utilities.
 */
export const duration = {
  press: 0.12,
  fast: 0.2, // page transitions, card entrances
  dialog: 0.25,
  sheet: 0.3,
  progress: 0.6,
  count: 0.8, // XP counting
} as const;

/** House easing: decisive start, soft landing. */
export const easeOut: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Card / block entrance. Pair with initial="hidden" animate="visible". */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.fast, ease: easeOut },
  },
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.fast } },
};

/** Parent wrapper that staggers `fadeInUp`/`fade` children. */
export const staggerChildren: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};
