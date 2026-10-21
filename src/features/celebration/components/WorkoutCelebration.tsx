"use client";

import { useEffect, useMemo, useState } from "react";
import { m, useReducedMotion } from "framer-motion";
import { Share2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { WorkoutShareModal } from "@/features/session/components/WorkoutShareModal";
import { StatChipRow, type StatEntry } from "@/features/shared/components/StatChipRow";
import { SPEAKERS } from "@/features/tour/script";
import { playCelebrationFanfare } from "@/lib/audioEngine";
import { xpSourceLabels } from "@/lib/gamification/progression";
import { useProfileStore } from "@/store/profileStore";
import { celebrationLine, type WorkoutCelebration as Celebration } from "../lib/celebration";
import { BadgeReveal, REVEAL_STAGGER } from "./BadgeReveal";
import { CastReaction } from "./CastReaction";
import { CountUp } from "./CountUp";
import { LevelMeter } from "./LevelMeter";

/** The running order. Each stage starts once the one before has landed. */
const STAGE = { xp: 1, level: 2, badges: 3, records: 4, cast: 5 } as const;

const round1 = (value: number) => Math.round(value * 10) / 10;

export interface WorkoutCelebrationProps {
  celebration: Celebration;
  title: string;
  /** The session id — varies the quiet-day line. */
  seed: string;
  stats: StatEntry[];
  share: { durationSeconds: number; volumeKg: number };
  onDone: () => void;
}

/**
 * The workout-complete moment: XP rolls up, the level bar fills (popping a
 * level-up), new badges are struck one by one, new records are listed, and
 * Kix or Nyra has the last word. Tap anywhere (or Skip) to see it all at
 * once; reduced motion shows it all at once from the start. Done is always
 * reachable.
 */
export function WorkoutCelebration({ celebration, title, seed, stats, share, onDone }: WorkoutCelebrationProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const effects = useProfileStore((state) => state.preferences?.celebrationEffects ?? true);
  const showCast = useProfileStore((state) => state.preferences?.showMascots ?? true);
  const [stage, setStage] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const instant = skipped || reducedMotion;
  const { xpGained, xpSources, levelBefore, levelAfter, newBadges, records } = celebration;
  const levelled = levelAfter.level > levelBefore.level;
  const line = useMemo(() => celebrationLine(celebration, seed), [celebration, seed]);

  const schedule = useMemo(() => {
    const steps: [number, number][] = [];
    let at = 250;
    steps.push([STAGE.xp, at]);
    at += 1000;
    steps.push([STAGE.level, at]);
    at += levelled ? 1700 : 1000;
    if (newBadges.length > 0) {
      steps.push([STAGE.badges, at]);
      at += newBadges.length * REVEAL_STAGGER * 1000 + 500;
    }
    if (records.length > 0) {
      steps.push([STAGE.records, at]);
      at += 400 + records.length * 120;
    }
    steps.push([STAGE.cast, at]);
    return steps;
  }, [levelled, newBadges.length, records.length]);

  useEffect(() => {
    if (instant) return;
    const timers = schedule.map(([next, at]) =>
      window.setTimeout(() => setStage((current) => Math.max(current, next)), at),
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [schedule, instant]);

  // Respects Preferences → Celebration Fanfare on its own.
  useEffect(() => playCelebrationFanfare(), []);

  const reached = (value: number) => instant || stage >= value;
  const finished = reached(STAGE.cast);
  const fadeIn = (value: number, delay = 0) => ({
    initial: false as const,
    animate: reached(value) ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 },
    transition: { duration: instant ? 0 : 0.35, delay: instant ? 0 : delay },
  });

  const announcement = [
    `Workout complete. Plus ${xpGained} XP.`,
    levelled && `Level ${levelAfter.level} reached.`,
    newBadges.length > 0 && `New badges: ${newBadges.map((badge) => badge.name).join(", ")}.`,
    records.length > 0 && `New records: ${records.map((record) => record.exerciseName).join(", ")}.`,
    showCast && `${SPEAKERS[line.speaker].name}: ${line.text}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="relative flex flex-1 flex-col" onClick={() => !finished && setSkipped(true)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-16 h-80 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgb(34_197_94/0.22),transparent_70%)]"
      />
      <p className="sr-only" role="status">
        {announcement}
      </p>

      {!finished && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setSkipped(true);
          }}
          className="absolute right-0 top-2 z-10 min-h-11 rounded-full px-3 text-sm font-semibold text-foreground-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
        >
          Skip
        </button>
      )}

      <header className="relative pt-8 text-center">
        <m.p
          initial={instant ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground-secondary"
        >
          Workout complete
        </m.p>
        <m.h1
          initial={instant ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mt-1 font-display text-2xl font-bold"
        >
          {title}
        </m.h1>
      </header>

      <section aria-hidden className="relative mt-6 flex flex-col items-center gap-3">
        <m.p {...fadeIn(STAGE.xp)} className="font-display text-6xl font-bold tabular-nums text-brand drop-shadow-[0_0_24px_rgb(34_197_94/0.45)]">
          +<CountUp value={xpGained} play={reached(STAGE.xp)} instant={instant} />
          <span className="ml-1.5 text-2xl">XP</span>
        </m.p>
        <ul className="flex flex-wrap justify-center gap-1.5">
          {xpSources.map(({ source, amount }, index) => (
            <m.li
              key={source}
              {...fadeIn(STAGE.xp, 0.6 + index * 0.08)}
              className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] text-foreground-secondary"
            >
              {xpSourceLabels[source]} <span className="font-semibold text-foreground">+{amount}</span>
            </m.li>
          ))}
        </ul>
      </section>

      <m.div {...fadeIn(STAGE.xp, 0.4)} className="mt-6">
        <LevelMeter before={levelBefore} after={levelAfter} play={reached(STAGE.level)} instant={instant} effects={effects} />
      </m.div>

      {newBadges.length > 0 && (
        <section aria-hidden className="mt-8">
          <m.h2
            {...fadeIn(STAGE.badges)}
            className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-foreground-secondary"
          >
            {newBadges.length === 1 ? "New badge" : `${newBadges.length} new badges`}
          </m.h2>
          {/* Flex, not grid, so a part-filled last row stays centred. */}
          <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-5">
            {newBadges.map((item, order) => (
              <BadgeReveal
                key={item.id}
                item={item}
                order={order}
                play={reached(STAGE.badges)}
                instant={instant}
                effects={effects}
                size={newBadges.length === 1 ? 112 : 76}
                showXp={newBadges.length === 1}
                className={newBadges.length === 1 ? undefined : "w-[104px]"}
              />
            ))}
          </div>
        </section>
      )}

      {records.length > 0 && (
        <section aria-hidden className="mt-8">
          <m.h2
            {...fadeIn(STAGE.records)}
            className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-foreground-secondary"
          >
            {records.length === 1 ? "New record" : `${records.length} new records`}
          </m.h2>
          <ul className="mt-3 flex flex-col gap-2">
            {records.map((record, index) => (
              <m.li
                key={record.exerciseId}
                {...fadeIn(STAGE.records, index * 0.12)}
                className="flex items-center justify-between gap-3 rounded-2xl border border-brand/20 bg-brand/[0.06] px-4 py-3"
              >
                <span className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                  <Trophy size={16} className="shrink-0 text-brand" aria-hidden />
                  <span className="truncate">{record.exerciseName}</span>
                </span>
                <span className="shrink-0 text-sm tabular-nums">
                  <span className="font-semibold">{record.e1rm} kg</span>{" "}
                  <span className="text-foreground-secondary">e1RM · +{round1(record.e1rm - record.previousBest)}</span>
                </span>
              </m.li>
            ))}
          </ul>
        </section>
      )}

      {showCast && (
        <div className="mt-8">
          <CastReaction line={line} play={reached(STAGE.cast)} instant={instant} />
        </div>
      )}

      <m.div {...fadeIn(STAGE.cast)} className="mt-6">
        <StatChipRow stats={stats} />
      </m.div>

      <div className="sticky bottom-0 mt-6 flex gap-2 bg-gradient-to-t from-background via-background to-transparent pb-[max(1rem,env(safe-area-inset-bottom))] pt-6">
        <Button
          size="lg"
          variant="secondary"
          aria-label="Share workout"
          onClick={(event) => {
            event.stopPropagation();
            setShareOpen(true);
          }}
        >
          <Share2 size={20} aria-hidden />
        </Button>
        <Button
          size="lg"
          fullWidth
          onClick={(event) => {
            event.stopPropagation();
            onDone();
          }}
        >
          Done
        </Button>
      </div>

      <WorkoutShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        workoutTitle={title}
        durationSeconds={share.durationSeconds}
        volumeKg={share.volumeKg}
        xpReward={xpGained}
      />
    </div>
  );
}
