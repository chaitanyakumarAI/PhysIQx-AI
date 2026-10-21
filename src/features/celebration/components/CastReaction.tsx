"use client";

import { useEffect } from "react";
import Image from "next/image";
import { m, useAnimationControls, useReducedMotion } from "framer-motion";
import { reactionFor } from "@/features/tour/castMotion";
import { useTypewriter } from "@/features/tour/hooks/useTypewriter";
import { SPEAKERS, stageImageFor, type TourLine } from "@/features/tour/script";
import { cn } from "@/lib/utils";

export interface CastReactionProps {
  line: TourLine;
  play: boolean;
  instant: boolean;
}

/**
 * Kix (or Nyra, for something rare) reacting to the workout: their stage
 * cut beside a speech bubble, the same paper bubble as the app tour. Kix
 * hops in; Nyra emerges from the dark (docs/MASCOTS.md).
 */
export function CastReaction({ line, play, instant }: CastReactionProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const visible = play || instant;
  const still = instant || reducedMotion;
  const reaction = useAnimationControls();
  const { typed, done } = useTypewriter(line.text, line.text, visible, still);
  const isKix = line.speaker === "kix";
  const speaker = SPEAKERS[line.speaker];

  useEffect(() => {
    if (visible && !still) void reaction.start(reactionFor(line));
  }, [visible, still, reaction, line]);

  const hidden = isKix ? { opacity: 0, x: -36, y: 18 } : { opacity: 0, filter: "brightness(0)" };
  const shown = isKix ? { opacity: 1, x: 0, y: 0 } : { opacity: 1, filter: "brightness(1)" };

  return (
    <div className="flex items-end gap-2" aria-hidden>
      <m.div
        className="relative h-[124px] w-[93px] shrink-0"
        initial={false}
        animate={visible ? shown : hidden}
        transition={still ? { duration: 0 } : isKix ? { type: "spring", stiffness: 300, damping: 15 } : { duration: 0.9 }}
      >
        <m.div className="relative size-full origin-bottom" animate={reaction}>
          <div className="cast-fade-emerge absolute inset-0">
            <Image
              src={stageImageFor(line)}
              alt=""
              fill
              unoptimized
              draggable={false}
              className="select-none object-cover object-bottom"
            />
          </div>
        </m.div>
      </m.div>

      <m.div
        className="relative mb-5 min-w-0 flex-1 rounded-[20px] bg-[#f1f5ef] px-3.5 pb-3 pt-4 text-[#0b100d] drop-shadow-[0_14px_22px_rgb(0_0_0/0.6)]"
        initial={false}
        animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
        transition={still ? { duration: 0 } : { type: "spring", stiffness: 480, damping: 28, delay: 0.25 }}
        style={{ transformOrigin: "0% 80%" }}
      >
        <span
          className={cn(
            "absolute -top-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em]",
            isKix ? "bg-brand text-zinc-950" : "bg-[#0d0f0e] text-brand ring-1 ring-brand/45",
          )}
        >
          {speaker.name}
        </span>
        {/* The full line holds the size, so the bubble never grows while typing. */}
        <p className="relative font-display text-[15px] font-semibold leading-snug">
          <span className="invisible">{line.text}</span>
          <span className="absolute inset-0">
            {line.text.slice(0, typed)}
            {!done && <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em] bg-brand-strong" />}
          </span>
        </p>
        <svg
          aria-hidden
          width="14"
          height="18"
          viewBox="0 0 14 18"
          className="absolute -left-[11px] bottom-5 text-[#f1f5ef]"
        >
          <path d="M14 0C9 6 4 11 0 13C5 13.5 10 15 14 18Z" fill="currentColor" />
        </svg>
      </m.div>
    </div>
  );
}
