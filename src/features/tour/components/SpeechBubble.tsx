"use client";

import type { Ref } from "react";
import { m } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPEAKERS, type TourLine } from "../script";

/** Tail tip inside its 32×20 box, for the left-leaning (Kix) shape. */
const TAIL_TIP_X = 3;
const TAIL_WIDTH = 32;
/** Keep the tail's base on the bubble's straight bottom edge. */
const TAIL_MIN_LEFT = 18;

interface SpeechBubbleProps {
  line: TourLine;
  typed: number;
  done: boolean;
  /** The tour's last line: the button becomes the way out. */
  final: boolean;
  step: number;
  steps: number;
  /** Position and width within the stage. */
  left: number;
  width: number;
  /** Where the tail points (the speaker's face), from the bubble's left edge. */
  tipX: number;
  onNext: () => void;
  nextRef: Ref<HTMLButtonElement>;
  reducedMotion: boolean;
}

/**
 * The comic speech bubble (Clash of Clans' tutorial bubbles, in PhysIQx
 * colours): light paper so a character's voice never reads as app UI, a
 * name tag on the speaker's side, and a tail aimed at their face.
 */
export function SpeechBubble({
  line,
  typed,
  done,
  final,
  step,
  steps,
  left,
  width,
  tipX,
  onNext,
  nextRef,
  reducedMotion,
}: SpeechBubbleProps) {
  const speaker = SPEAKERS[line.speaker];
  const isKix = line.speaker === "kix";
  const tailLeft = Math.min(
    Math.max((isKix ? tipX - TAIL_TIP_X : tipX - (TAIL_WIDTH - TAIL_TIP_X)), TAIL_MIN_LEFT),
    width - TAIL_WIDTH - TAIL_MIN_LEFT,
  );
  const tailTip = isKix ? tailLeft + TAIL_TIP_X : tailLeft + TAIL_WIDTH - TAIL_TIP_X;

  return (
    <m.div
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, transition: { duration: 0.12 } }}
      transition={{ type: "spring", stiffness: 520, damping: 30 }}
      style={{ marginLeft: left, width, transformOrigin: `${tailTip}px calc(100% + 20px)` }}
      className="pointer-events-auto relative drop-shadow-[0_18px_28px_rgb(0_0_0/0.75)]"
    >
      <div className="relative rounded-[24px] bg-[#f1f5ef] px-4 pb-2 pt-5 text-[#0b100d]">
        <span
          className={cn(
            "absolute -top-3.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]",
            isKix ? "left-4 bg-brand text-zinc-950" : "right-4 bg-[#0d0f0e] text-brand ring-1 ring-brand/45",
          )}
        >
          {speaker.name}
          <span className="text-[10px] font-semibold normal-case tracking-normal opacity-75">{speaker.role}</span>
        </span>

        {/* The full line holds the bubble's size so it never grows mid-typing. */}
        <p aria-hidden className="relative font-display text-base font-semibold leading-[1.38]">
          <span className="invisible">{line.text}</span>
          <span className="absolute inset-0">
            {line.text.slice(0, typed)}
            {!done && (
              <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em] animate-pulse bg-brand-strong" />
            )}
          </span>
        </p>

        <div className="mt-1 flex items-center justify-between">
          <div aria-hidden className="flex gap-1">
            {Array.from({ length: steps }, (_, index) => (
              <span
                key={index}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === step ? "w-4 bg-brand-strong" : index < step ? "w-1.5 bg-[#0b100d]/35" : "w-1.5 bg-[#0b100d]/12",
                )}
              />
            ))}
          </div>
          {final ? (
            <button
              ref={nextRef}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onNext();
              }}
              className="my-1 inline-flex min-h-11 items-center gap-1 rounded-full bg-brand px-4 text-sm font-semibold text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-strong focus-visible:ring-offset-2 focus-visible:ring-offset-[#f1f5ef]"
            >
              Let&rsquo;s go
              <ChevronRight size={16} aria-hidden />
            </button>
          ) : (
            <button
              ref={nextRef}
              type="button"
              aria-label={done ? "Next" : "Show the whole line"}
              onClick={(event) => {
                event.stopPropagation();
                onNext();
              }}
              className="-mr-1.5 grid size-11 place-items-center rounded-full bg-[#0b100d]/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-strong"
            >
              <m.svg
                aria-hidden
                width="14"
                height="11"
                viewBox="0 0 14 11"
                animate={done && !reducedMotion ? { y: [0, 4, 0] } : { y: 0 }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                className={cn("text-brand-strong transition-opacity", done ? "opacity-100" : "opacity-30")}
              >
                <path d="M1.5 1.5h11L7 9.5z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </m.svg>
            </button>
          )}
        </div>
      </div>

      <svg
        aria-hidden
        width={TAIL_WIDTH}
        height="20"
        viewBox="0 0 32 20"
        className={cn("absolute top-full -mt-px text-[#f1f5ef]", !isKix && "-scale-x-100")}
        style={{ left: tailLeft }}
      >
        <path d="M6 0H28Q18 8 3 20Q11 9 6 0Z" fill="currentColor" />
      </svg>
    </m.div>
  );
}
