"use client";

import { useCallback, useEffect, useMemo } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { RESTING_POSE, SPEAKERS, TOUR_SCRIPT, type CastPose, type Speaker, type TourLine } from "../script";
import { computeStageMetrics } from "../stage";
import type { CastRole } from "../castMotion";
import { useTourDirector } from "../hooks/useTourDirector";
import { useTypewriter } from "../hooks/useTypewriter";
import { useViewport } from "../hooks/useViewport";
import { CastMember } from "./CastMember";
import { SpeechBubble } from "./SpeechBubble";
import { TourBackdrop } from "./TourBackdrop";
import { TourPointer } from "./TourPointer";

/** Space between the stage column's edge and the bubble. */
const BUBBLE_GUTTER = 12;
/** The bubble leans toward whoever is talking by this share of the stage. */
const BUBBLE_LEAN = 0.08;
/** Height of the bubble's tail (SpeechBubble draws it below the bubble). */
const TAIL_HEIGHT = 18;
/** The floor's solid part has to cover the tallest render. */
const FLOOR_OVER_CAST = 1.15;

/** The last pose a character took in this beat — they hold it between lines. */
function lastPoseOf(lines: TourLine[], upTo: number, speaker: Speaker): CastPose {
  for (let index = upTo; index >= 0; index--) {
    const line = lines[index]!;
    if (line.speaker === speaker) return line;
  }
  return RESTING_POSE[speaker];
}

/** Moves focus to each new bubble's button so Enter and screen readers follow along. */
const focusOnMount = (node: HTMLButtonElement | null) => node?.focus({ preventScroll: true });

/**
 * The app tour, told by Kix and Nyra the way Clash of Clans introduces
 * itself: two big characters at the screen corners, a comic speech bubble,
 * and a bouncing arrow on the real UI. Tap to finish a line, tap again for
 * the next; Skip and Escape always work.
 */
export function CharacterTour() {
  const reducedMotion = useReducedMotion() ?? false;
  const viewport = useViewport();
  const dialogue = useMemo(() => computeStageMetrics(viewport, false), [viewport]);
  const scene = useMemo(() => computeStageMetrics(viewport, true), [viewport]);
  const { active, leaving, beat, beatIndex, line, lineIndex, isFinalLine, ready, rect, nextLine, skip } =
    useTourDirector({ reserve: dialogue.reserve, reducedMotion });
  const cue = `${beatIndex}-${lineIndex}`;
  const { typed, done, complete } = useTypewriter(line.text, cue, active && ready && !leaving, reducedMotion);

  const advance = useCallback(() => {
    if (!ready || leaving) return;
    if (done) nextLine();
    else complete();
  }, [ready, leaving, done, nextLine, complete]);

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        skip();
        return;
      }
      // Buttons handle their own Enter/Space.
      const onButton = event.target instanceof HTMLButtonElement;
      if (event.key === "ArrowRight" || ((event.key === "Enter" || event.key === " ") && !onButton)) {
        event.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, advance, skip]);

  if (!active) return null;

  const metrics = beat.target ? dialogue : scene;
  const roleOf = (speaker: Speaker): CastRole =>
    !ready ? "waiting" : line.speaker === speaker ? "speaking" : "listening";
  const typing = ready && !done;
  const lean = Math.round(metrics.width * BUBBLE_LEAN);
  const bubbleWidth = metrics.width - BUBBLE_GUTTER * 2 - lean;
  const bubbleLeft = line.speaker === "kix" ? BUBBLE_GUTTER : BUBBLE_GUTTER + lean;

  return (
    <m.div
      role="dialog"
      aria-modal="true"
      aria-label="App tour with Kix and Nyra"
      className="fixed inset-0 z-[60] cursor-pointer select-none"
      onClick={advance}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: 0.25, delay: leaving && !reducedMotion ? 0.3 : 0 }}
    >
      <TourBackdrop
        rect={rect}
        floorHeight={Math.round(metrics.cast.kix.height * FLOOR_OVER_CAST)}
        reducedMotion={reducedMotion}
      />

      <AnimatePresence>
        {rect && ready && !leaving && (
          <TourPointer key="pointer" rect={rect} viewportWidth={viewport.width} reducedMotion={reducedMotion} />
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          skip();
        }}
        className="fixed right-4 top-[max(1rem,env(safe-area-inset-top))] z-20 min-h-11 rounded-full border border-white/15 bg-black/50 px-4 text-sm font-semibold text-foreground-secondary backdrop-blur hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
      >
        Skip tour
      </button>

      <p className="sr-only" aria-live="polite">
        {ready ? `${SPEAKERS[line.speaker].name}: ${line.text}` : ""}
      </p>

      {/* The stage: the app column, pinned to the bottom of the screen. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 mx-auto max-w-md" style={{ height: metrics.reserve }}>
        {(["kix", "nyra"] as const).map((speaker) => (
          <CastMember
            key={speaker}
            pose={lastPoseOf(beat.lines, lineIndex, speaker)}
            role={roleOf(speaker)}
            cue={cue}
            talking={typing && line.speaker === speaker}
            leaving={leaving}
            box={metrics.cast[speaker]}
            reducedMotion={reducedMotion}
          />
        ))}

        <div className="absolute inset-x-0" style={{ bottom: metrics.bubbleBottom + TAIL_HEIGHT }}>
          <AnimatePresence mode="wait">
            {ready && !leaving && (
              <SpeechBubble
                key={cue}
                line={line}
                typed={typed}
                done={done}
                final={isFinalLine}
                step={beatIndex}
                steps={TOUR_SCRIPT.length}
                left={bubbleLeft}
                width={bubbleWidth}
                tipX={metrics.cast[line.speaker].faceX - bubbleLeft}
                onNext={advance}
                nextRef={focusOnMount}
                reducedMotion={reducedMotion}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </m.div>
  );
}
