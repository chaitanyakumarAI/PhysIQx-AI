"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, m, useAnimate } from "framer-motion";
import { playLevelUp } from "@/lib/audioEngine";
import type { LevelStatus } from "@/lib/gamification/levels";
import { Sparkburst } from "./Sparkburst";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export interface LevelMeterProps {
  before: LevelStatus;
  after: LevelStatus;
  play: boolean;
  instant: boolean;
  /** Sparks and sound (Preferences → Celebration Fanfare). */
  effects: boolean;
}

/**
 * The XP bar filling from where the athlete was to where they are. A
 * level-up fills it to the brim, pops the new level number with a burst
 * and a chime, then refills from empty to the new progress.
 */
export function LevelMeter({ before, after, play, instant, effects }: LevelMeterProps) {
  const [bar, animateBar] = useAnimate<HTMLDivElement>();
  const levelled = after.level > before.level;
  const [shownLevel, setShownLevel] = useState(instant ? after.level : before.level);
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    if (!instant) return;
    setShownLevel(after.level);
    void animateBar(bar.current, { width: `${after.percent}%` }, { duration: 0 });
  }, [instant, after, animateBar, bar]);

  useEffect(() => {
    if (!play || instant) return;
    let cancelled = false;
    void (async () => {
      if (levelled) {
        await animateBar(bar.current, { width: "100%" }, { duration: 0.65, ease: "easeIn" });
        if (cancelled) return;
        setShownLevel(after.level);
        setBurst((count) => count + 1);
        if (effects) playLevelUp();
        await animateBar(bar.current, { width: "0%" }, { duration: 0 });
        if (cancelled) return;
        await animateBar(bar.current, { width: `${after.percent}%` }, { duration: 0.75, ease: EASE_OUT });
      } else {
        await animateBar(bar.current, { width: `${after.percent}%` }, { duration: 0.9, ease: EASE_OUT });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [play, instant, levelled, after, effects, animateBar, bar]);

  const reached = levelled && shownLevel === after.level;

  return (
    <div className="rounded-card border border-white/[0.06] bg-white/[0.03] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative">
          <AnimatePresence mode="popLayout" initial={false}>
            <m.p
              key={shownLevel}
              className="font-display text-xl font-bold tabular-nums"
              initial={{ y: 16, opacity: 0, scale: 0.7 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 20 }}
            >
              Level {shownLevel}
            </m.p>
          </AnimatePresence>
          {effects && <Sparkburst burst={burst} color="#22c55e" radius={64} count={18} />}
        </div>
        {reached ? (
          <m.span
            initial={instant ? false : { opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 16 }}
            className="rounded-full bg-brand px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-950"
          >
            Level up!
          </m.span>
        ) : (
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground-secondary">
            {after.rank.name}
          </span>
        )}
      </div>
      <div
        className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/[0.07]"
        role="progressbar"
        aria-label={`Level ${after.level} progress`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={after.percent}
      >
        <div
          ref={bar}
          className="h-full rounded-full bg-gradient-to-r from-brand-strong to-brand shadow-[0_0_12px_rgb(34_197_94/0.6)]"
          style={{ width: `${instant ? after.percent : before.percent}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-foreground-secondary">
        {after.xpToNext > 0
          ? `${after.xpToNext.toLocaleString("en-US")} XP to level ${after.level + 1}`
          : "Max level"}
        {after.nextRank && ` · ${after.nextRank.name} rank at level ${after.nextRank.minLevel}`}
      </p>
    </div>
  );
}
