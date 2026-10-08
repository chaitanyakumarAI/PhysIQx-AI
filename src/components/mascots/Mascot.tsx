"use client";

import { cn } from "@/lib/utils";
import { useProfileStore, DEFAULT_USER_PREFERENCES } from "@/store/profileStore";

/**
 * The mascot expression crops cut from the locked canon grids
 * (docs/MASCOTS.md). Kix appears at moments of effort and celebration,
 * Nyra at moments of standards and rest — never during input, never both
 * on one screen (the anti-Clippy law).
 */
export type MascotPose =
  | "kix-default"
  | "kix-focus"
  | "kix-joy"
  | "kix-sheepish"
  | "kix-worried"
  | "kix-proud"
  | "kix-determined"
  | "kix-asleep"
  | "nyra-stare"
  | "nyra-narrowed"
  | "nyra-closed"
  | "nyra-nod"
  | "nyra-tilt";

/** Natural height/width ratio of the source crops, per character. */
const ASPECT: Record<"kix" | "nyra", number> = {
  kix: 748 / 684,
  nyra: 780 / 543,
};

export interface MascotProps {
  pose: MascotPose;
  /** Display width in px (assets are 480px wide — keep size ≤ 240 for 2x). */
  size?: number;
  /** "circle" crops to a face medallion; "portrait" keeps the full bust. */
  shape?: "circle" | "portrait";
  className?: string;
  /** Mascots are decorative by default; pass alt text only when the image
   *  carries meaning the surrounding text doesn't. */
  alt?: string;
}

export function Mascot({
  pose: _pose,
  size: _size = 96,
  shape: _shape = "portrait",
  className: _className,
  alt: _alt = "",
}: MascotProps) {
  // Mascots globally disabled per user directive: "dont use mascots anywhere for now"
  return null;
}
