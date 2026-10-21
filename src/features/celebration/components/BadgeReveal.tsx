"use client";

import { useState } from "react";
import { m } from "framer-motion";
import { CollectibleBadge } from "@/features/collection/components/CollectibleBadge";
import { accentFor } from "@/features/collection/lib/materials";
import { playBadgeUnlock } from "@/lib/audioEngine";
import { gradeLabels, type Grade } from "@/lib/gamification/catalog";
import type { CollectibleState } from "@/lib/gamification/progression";
import { cn } from "@/lib/utils";
import { Sparkburst } from "./Sparkburst";

/** Seconds between consecutive reveals. */
export const REVEAL_STAGGER = 0.52;
/** Only the first few landings chime — more is noise. */
const CHIMES = 3;
const RARITY: Record<Grade, number> = { bronze: 0, silver: 1, gold: 2, platinum: 3, legendary: 4 };

export interface BadgeRevealProps {
  item: CollectibleState;
  /** Position in the reveal sequence. */
  order: number;
  play: boolean;
  instant: boolean;
  effects: boolean;
  size: number;
  /** The XP line; a grid of several leaves it to the XP summary above. */
  showXp?: boolean;
  className?: string;
}

/**
 * A newly earned badge being struck: it flips in edge-on, lands with a
 * burst of sparks in its own metal's colour, a chime pitched to its rarity,
 * and one sweep of light across the face.
 */
export function BadgeReveal({ item, order, play, instant, effects, size, showXp = true, className }: BadgeRevealProps) {
  const [landed, setLanded] = useState(false);
  const [burst, setBurst] = useState(0);
  const visible = play || instant;
  const accent = accentFor(item);
  const delay = instant ? 0 : order * REVEAL_STAGGER;

  return (
    <div className={cn("flex flex-col items-center gap-2 text-center", className)}>
      <div className="relative [perspective:640px]" style={{ width: size, height: size }}>
        <m.div
          initial={false}
          animate={visible ? { rotateY: 0, scale: 1, opacity: 1 } : { rotateY: -100, scale: 0.55, opacity: 0 }}
          transition={instant ? { duration: 0 } : { type: "spring", stiffness: 170, damping: 15, delay }}
          onAnimationComplete={() => {
            if (!visible || landed) return;
            setLanded(true);
            if (instant) return;
            setBurst((count) => count + 1);
            if (effects && order < CHIMES) playBadgeUnlock(RARITY[item.grade]);
          }}
        >
          <CollectibleBadge item={item} state="earned" shine={landed && !instant ? "once" : undefined} size={size} />
        </m.div>
        {effects && <Sparkburst burst={burst} color={accent} radius={size * 0.85} />}
      </div>
      <m.div
        initial={false}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 6 }}
        transition={{ delay: delay + (instant ? 0 : 0.25) }}
      >
        <p className="text-sm font-semibold leading-tight">{item.name}</p>
        <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: accent }}>
          {item.rankId ? "New rank" : (item.tierLabel ?? gradeLabels[item.grade])}
          {showXp && item.xp > 0 && ` · +${item.xp} XP`}
        </p>
      </m.div>
    </div>
  );
}
