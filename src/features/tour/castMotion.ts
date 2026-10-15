import type { TargetAndTransition, Transition } from "framer-motion";
import type { CastPose, KixExpression, NyraExpression, Speaker } from "./script";

/**
 * How Kix and Nyra move on the tour stage. The motion is the
 * characterisation (MASCOTS.md): Kix is all bounce and big reactions;
 * Nyra barely moves — stillness is her pose, so her slow nod lands.
 */

export type CastRole = "speaking" | "listening" | "waiting";

/** The speaker steps forward into the light; the listener steps back. */
export const ROLE: Record<CastRole, TargetAndTransition> = {
  speaking: { scale: 1, y: 0, filter: "brightness(1) saturate(1)" },
  listening: { scale: 0.93, y: 10, filter: "brightness(0.5) saturate(0.7)" },
  waiting: { scale: 0.97, y: 4, filter: "brightness(0.8) saturate(0.9)" },
};

export const ROLE_TRANSITION: Transition = {
  default: { type: "spring", stiffness: 260, damping: 26 },
  filter: { duration: 0.35, ease: "easeOut" },
};

/** Off-stage, before the entrance plays. */
export const OFFSTAGE: Record<Speaker, TargetAndTransition> = {
  kix: { x: "-115%", y: 40, rotate: -10, opacity: 0 },
  nyra: { x: 40, opacity: 0, filter: "brightness(0)" },
};

/** Kix hops in from the left and lands with a bounce; Nyra emerges from the dark. */
export const ENTER: Record<Speaker, TargetAndTransition> = {
  kix: {
    x: ["-115%", "-35%", "0%", "0%", "0%"],
    y: [40, -46, 0, -8, 0],
    rotate: [-10, -4, 0, 0, 0],
    opacity: [0, 1, 1, 1, 1],
    transition: { duration: 0.85, times: [0, 0.42, 0.7, 0.85, 1], ease: "easeOut" },
  },
  nyra: {
    x: 0,
    opacity: 1,
    filter: "brightness(1)",
    transition: { duration: 1.1, delay: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

export const EXIT: Record<Speaker, TargetAndTransition> = {
  kix: {
    x: "-120%",
    y: [0, -36, 24],
    opacity: [1, 1, 0],
    transition: { duration: 0.5, ease: "easeIn" },
  },
  nyra: { opacity: 0, filter: "brightness(0)", transition: { duration: 0.45, ease: "easeIn" } },
};

export const ENTER_REDUCED: TargetAndTransition = { x: 0, y: 0, rotate: 0, opacity: 1, filter: "brightness(1)", transition: { duration: 0.3 } };
export const EXIT_REDUCED: TargetAndTransition = { opacity: 0, transition: { duration: 0.2 } };

/** Always-on life: Kix bounces on his toes like a boxer; Nyra breathes. */
export const IDLE: Record<Speaker, TargetAndTransition> = {
  kix: { y: [0, -4, 0], scale: 1, transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" } },
  nyra: { y: 0, scale: [1, 1.012, 1], transition: { duration: 5, repeat: Infinity, ease: "easeInOut" } },
};

/** While his line types out, Kix bobs as he talks. Nyra holds still. */
export const TALKING: Record<Speaker, TargetAndTransition> = {
  kix: { y: [0, -5, 0], scale: 1, transition: { duration: 0.42, repeat: Infinity, ease: "easeInOut" } },
  nyra: IDLE.nyra,
};

/** A beat of body language at the start of each line. */
const REACTIONS: {
  kix: Record<KixExpression, TargetAndTransition>;
  nyra: Record<NyraExpression, TargetAndTransition>;
} = {
  kix: {
    default: { y: [0, -10, 0], transition: { duration: 0.4, ease: "easeOut" } },
    joy: { y: [0, -24, 0, -8, 0], transition: { duration: 0.75, ease: "easeOut" } },
    proud: { scale: [1, 1.06, 1], rotate: [0, -2, 0], transition: { duration: 0.6 } },
    determined: { scale: [1, 1.05, 1], y: [0, -6, 0], transition: { duration: 0.5 } },
    focus: { scale: [1, 1.04, 1], transition: { duration: 0.45 } },
    sheepish: { rotate: [0, -4, 3, -2, 0], transition: { duration: 0.75 } },
    worried: { x: [0, -5, 5, -3, 0], transition: { duration: 0.5 } },
  },
  nyra: {
    stare: {},
    closed: {},
    narrowed: { scale: [1, 1.03, 1], transition: { duration: 1.2, ease: "easeInOut" } },
    tilt: { rotate: [0, 2, 0], transition: { duration: 1, ease: "easeInOut" } },
    nod: { y: [0, 12, 12, 0], transition: { duration: 1.6, times: [0, 0.35, 0.65, 1], ease: "easeInOut" } },
  },
};

export function reactionFor(pose: CastPose): TargetAndTransition {
  return pose.speaker === "kix" ? REACTIONS.kix[pose.expression] : REACTIONS.nyra[pose.expression];
}
