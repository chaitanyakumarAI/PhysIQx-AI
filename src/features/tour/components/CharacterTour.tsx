"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { portraitFor, SPEAKERS, TOUR_SCRIPT, type Speaker, type TourLine } from "../script";

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const SPOTLIGHT_PADDING = 8;
const TARGET_WAIT_MS = 5000;
const TARGET_POLL_MS = 120;
const TYPE_MS_PER_CHAR = 28;
/** Room the characters + bubble need; targets are scrolled to leave it free. */
const STAGE_HEIGHT = 300;
const TARGET_TOP_OFFSET = 72;

/** The last line each character said — they keep their face between lines. */
function lastLineOf(lines: TourLine[], upTo: number, speaker: Speaker): TourLine {
  for (let index = upTo; index >= 0; index--) {
    if (lines[index]!.speaker === speaker) return lines[index]!;
  }
  return speaker === "kix"
    ? { speaker: "kix", expression: "default", text: "" }
    : { speaker: "nyra", expression: "stare", text: "" };
}

function Portrait({
  line,
  speaking,
  side,
  size,
  reducedMotion,
  lineKey,
}: {
  line: TourLine;
  speaking: boolean;
  side: "left" | "right";
  size: number;
  reducedMotion: boolean;
  lineKey: string;
}) {
  const src = portraitFor(line);
  return (
    <m.div
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: side === "left" ? -140 : 140, rotate: side === "left" ? -6 : 6 }}
      animate={{
        opacity: speaking ? 1 : 0.42,
        x: 0,
        rotate: 0,
        scale: speaking ? 1.04 : 0.9,
        y: speaking ? 0 : 8,
      }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      {/* Each character's one light source: Kix's gloves glow from below,
          Nyra's eyes from within (MASCOTS.md glow language). */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-x-[10%] rounded-full blur-2xl transition-opacity duration-500",
          side === "left" ? "bottom-[-8%] h-1/2 bg-brand/45" : "top-[30%] h-1/3 bg-brand/20",
          speaking ? "opacity-100" : "opacity-0",
        )}
      />
      <m.div
        key={lineKey}
        animate={
          speaking && !reducedMotion
            ? line.speaker === "kix"
              ? { y: [0, -9, 0], scale: [1, 1.02, 1] }
              : { scale: [1, 1.015, 1] }
            : {}
        }
        transition={{ duration: line.speaker === "kix" ? 0.45 : 0.9, ease: "easeOut" }}
        className={cn(
          "relative size-full overflow-hidden rounded-[28px] border bg-[#0b0e0c]",
          speaking ? "border-brand/50 shadow-[0_0_28px_-6px_rgba(34,197,94,0.55)]" : "border-white/10",
        )}
      >
        <AnimatePresence initial={false}>
          <m.div
            key={src}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            <Image
              src={src}
              alt=""
              fill
              sizes={`${size}px`}
              priority
              className="object-cover [mask-image:radial-gradient(circle_at_50%_42%,black_62%,transparent_100%)]"
            />
          </m.div>
        </AnimatePresence>
      </m.div>
      <span
        className={cn(
          "absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors",
          speaking ? "border-brand/50 bg-brand text-zinc-950" : "border-white/10 bg-surface-elevated text-foreground-secondary",
        )}
      >
        {SPEAKERS[line.speaker].name}
      </span>
    </m.div>
  );
}

/**
 * The app tour, told by Kix and Nyra. Like Supercell's character
 * introductions: the two slide in from the screen edges and talk it
 * through while a spotlight frames the real element behind them. Tap to
 * finish a line, tap again for the next; Skip and Escape always work.
 * Activated by ?tour=1 (onboarding's finale, Profile's "Replay app tour").
 */
export function CharacterTour() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reducedMotion = useReducedMotion() ?? false;
  const [active, setActive] = useState(false);
  const [beatIndex, setBeatIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [rect, setRect] = useState<SpotlightRect | null>(null);
  const [typed, setTyped] = useState(0);
  const [ready, setReady] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const beat = TOUR_SCRIPT[beatIndex]!;
  const line = beat.lines[lineIndex]!;
  const isLastBeat = beatIndex === TOUR_SCRIPT.length - 1;
  const isLastLine = lineIndex === beat.lines.length - 1;
  const lineDone = typed >= line.text.length;

  useEffect(() => {
    if (searchParams.get("tour") === "1") {
      setBeatIndex(0);
      setLineIndex(0);
      setActive(true);
    }
  }, [searchParams]);

  // Warm the cache so expression swaps never flash.
  useEffect(() => {
    if (!active) return;
    for (const tourBeat of TOUR_SCRIPT) {
      for (const tourLine of tourBeat.lines) {
        const image = new window.Image();
        image.src = portraitFor(tourLine);
      }
    }
  }, [active]);

  const finish = useCallback(
    (goHome: boolean) => {
      setActive(false);
      setRect(null);
      if (goHome) router.push("/home");
      else if (searchParams.get("tour") === "1") router.replace(pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const measure = useCallback(() => {
    if (!beat.target) return;
    const element = document.querySelector(beat.target);
    if (!element) return;
    const box = element.getBoundingClientRect();
    setRect({
      top: box.top - SPOTLIGHT_PADDING,
      left: box.left - SPOTLIGHT_PADDING,
      width: box.width + SPOTLIGHT_PADDING * 2,
      height: box.height + SPOTLIGHT_PADDING * 2,
    });
  }, [beat.target]);

  // Travel to the beat's tab, wait for its element, scroll it into view.
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let waited = 0;
    setReady(false);
    if (pathname !== beat.route) {
      router.push(beat.route);
      return;
    }
    if (!beat.target) {
      setRect(null);
      const timer = window.setTimeout(() => !cancelled && setReady(true), beatIndex === 0 ? 600 : 150);
      return () => {
        cancelled = true;
        window.clearTimeout(timer);
      };
    }
    const frame = () => {
      if (cancelled) return;
      const element = document.querySelector(beat.target!);
      if (!element) {
        waited += TARGET_POLL_MS;
        if (waited >= TARGET_WAIT_MS) {
          // The element isn't on screen for this athlete: skip the beat.
          if (isLastBeat) finish(true);
          else setBeatIndex((index) => index + 1);
          return;
        }
        window.setTimeout(frame, TARGET_POLL_MS);
        return;
      }
      // Park the target near the top so the cast has the bottom of the screen.
      const box = element.getBoundingClientRect();
      window.scrollBy({ top: box.top - TARGET_TOP_OFFSET, behavior: reducedMotion ? "auto" : "smooth" });
      window.setTimeout(
        () => {
          if (cancelled) return;
          measure();
          setReady(true);
        },
        reducedMotion ? 80 : 520,
      );
    };
    const start = window.setTimeout(frame, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(start);
    };
  }, [active, beat, beatIndex, pathname, router, measure, finish, isLastBeat, reducedMotion]);

  // Keep the spotlight on its element through scrolls and resizes.
  useEffect(() => {
    if (!active || !beat.target) return;
    let frame = 0;
    const follow = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", follow, { passive: true });
    window.addEventListener("resize", follow);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", follow);
      window.removeEventListener("resize", follow);
    };
  }, [active, beat.target, measure]);

  // Typewriter for the current line.
  useEffect(() => {
    if (!active || !ready) return;
    if (reducedMotion) {
      setTyped(line.text.length);
      return;
    }
    setTyped(0);
    const timer = window.setInterval(() => {
      setTyped((count) => {
        if (count >= line.text.length) {
          window.clearInterval(timer);
          return count;
        }
        return count + 1;
      });
    }, TYPE_MS_PER_CHAR);
    return () => window.clearInterval(timer);
  }, [active, ready, line.text, reducedMotion, beatIndex, lineIndex]);

  const advance = useCallback(() => {
    if (!ready) return;
    if (!lineDone) {
      setTyped(line.text.length);
      return;
    }
    if (!isLastLine) {
      setLineIndex((index) => index + 1);
      return;
    }
    if (isLastBeat) {
      finish(true);
      return;
    }
    setLineIndex(0);
    setBeatIndex((index) => index + 1);
  }, [ready, lineDone, line.text.length, isLastLine, isLastBeat, finish]);

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish(false);
      else if (event.key === "Enter" || event.key === " " || event.key === "ArrowRight") {
        event.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, advance, finish]);

  useEffect(() => {
    if (active && ready) stageRef.current?.focus({ preventScroll: true });
  }, [active, ready, beatIndex]);

  const placement = useMemo<"top" | "bottom" | "center">(() => {
    if (!beat.target) return "center";
    if (!rect || typeof window === "undefined") return "bottom";
    const spaceBelow = window.innerHeight - (rect.top + rect.height);
    if (spaceBelow >= STAGE_HEIGHT) return "bottom";
    return rect.top >= STAGE_HEIGHT ? "top" : "bottom";
  }, [beat.target, rect]);

  if (!active) return null;

  const kixLine = lastLineOf(beat.lines, lineIndex, "kix");
  const nyraLine = lastLineOf(beat.lines, lineIndex, "nyra");
  const centered = placement === "center";
  const portraitSize = centered ? 132 : 96;
  const kixSpeaking = line.speaker === "kix";

  return (
    <div role="dialog" aria-modal="true" aria-label="App tour with Kix and Nyra" className="fixed inset-0 z-[60]">
      {/* Dim everything; cut a lit window around the target. */}
      <AnimatePresence>
        {beat.target && rect ? (
          <m.div
            key="spotlight"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "fixed" }}
            className="rounded-2xl ring-2 ring-brand/70 [box-shadow:0_0_0_9999px_rgb(0_0_0/0.74),0_0_28px_-4px_rgb(34_197_94/0.55)]"
          />
        ) : (
          <m.div
            key="backdrop"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[radial-gradient(ellipse_at_50%_55%,rgba(34,197,94,0.10),rgba(0,0,0,0.86)_62%)] bg-black/60"
          />
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => finish(false)}
        className="fixed right-4 top-[max(1rem,env(safe-area-inset-top))] z-10 min-h-11 rounded-full border border-white/15 bg-black/50 px-4 text-sm font-semibold text-foreground-secondary backdrop-blur hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
      >
        Skip tour
      </button>

      {ready && (
        <div
          ref={stageRef}
          tabIndex={-1}
          onClick={advance}
          className={cn(
            "fixed inset-x-0 flex cursor-pointer justify-center px-4 outline-none",
            placement === "bottom" && "bottom-[max(1.25rem,env(safe-area-inset-bottom))]",
            placement === "top" && "top-16",
            centered && "top-1/2 -translate-y-1/2",
          )}
        >
          <div
            className={cn(
              "flex w-full max-w-md gap-4",
              placement === "top" ? "flex-col-reverse" : "flex-col",
            )}
          >
            {/* The speech bubble, its tail pointing at whoever is talking. */}
            <m.div
              key={`${beatIndex}-${lineIndex}`}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: placement === "top" ? -8 : 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="relative rounded-[22px] border border-white/10 bg-[#141a16]/95 p-4 shadow-[0_18px_48px_-12px_rgba(0,0,0,0.8)] backdrop-blur-xl"
            >
              <span
                aria-hidden
                className={cn(
                  "absolute size-4 rotate-45 border-white/10 bg-[#141a16]",
                  placement === "top" ? "-top-2 border-l border-t" : "-bottom-2 border-b border-r",
                  kixSpeaking ? "left-12" : "right-12",
                )}
              />
              <p className="flex items-baseline gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
                  {SPEAKERS[line.speaker].name}
                </span>
                <span className="text-[11px] text-foreground-muted">{SPEAKERS[line.speaker].role}</span>
              </p>
              <p className="sr-only" aria-live="polite">
                {SPEAKERS[line.speaker].name}: {line.text}
              </p>
              <p aria-hidden className="mt-1.5 min-h-[3.25rem] text-[15px] leading-relaxed text-foreground">
                {line.text.slice(0, typed)}
                {!lineDone && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-brand" />}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <div aria-hidden className="flex gap-1.5">
                  {TOUR_SCRIPT.map((tourBeat, index) => (
                    <span
                      key={tourBeat.id}
                      className={cn(
                        "h-1 rounded-full transition-all duration-300",
                        index === beatIndex ? "w-5 bg-brand" : index < beatIndex ? "w-1.5 bg-brand/50" : "w-1.5 bg-white/15",
                      )}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    advance();
                  }}
                  className="inline-flex min-h-11 items-center gap-1 rounded-full bg-brand px-4 text-sm font-semibold text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  {!lineDone ? "Skip line" : isLastLine && isLastBeat ? "Let's go" : "Next"}
                  <ChevronRight size={16} aria-hidden />
                </button>
              </div>
            </m.div>

            {/* The cast: Kix stage-left, Nyra stage-right. */}
            <div className={cn("flex items-end justify-between px-1", centered && "justify-center gap-6")}>
              <Portrait
                line={kixLine}
                speaking={kixSpeaking}
                side="left"
                size={portraitSize}
                reducedMotion={reducedMotion}
                lineKey={`k-${beatIndex}-${lineIndex}`}
              />
              <Portrait
                line={nyraLine}
                speaking={!kixSpeaking}
                side="right"
                size={portraitSize}
                reducedMotion={reducedMotion}
                lineKey={`n-${beatIndex}-${lineIndex}`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
