"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TOUR_IMAGES, TOUR_SCRIPT } from "../script";

export interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const SPOTLIGHT_PADDING = 8;
const TARGET_WAIT_MS = 3000;
const TARGET_POLL_MS = 120;
/** Clear of the Skip button, with room for the pointer arrow above. */
const TARGET_MIN_TOP = 100;
/** Extra scroll room so even a page's last element can park above the stage. */
const SCROLL_ROOM = "75vh";
/** Kix lands before anyone speaks. */
const INTRO_DELAY_MS = 900;
const EXIT_MS = 560;

/**
 * Runs the tour: which beat and line are on, travelling between tabs,
 * parking each target above the stage, and the exit. Activated by
 * ?tour=1 (onboarding's finale, Profile's "Replay app tour").
 */
export function useTourDirector({ reserve, reducedMotion }: { reserve: number; reducedMotion: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [beatIndex, setBeatIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [rect, setRect] = useState<SpotlightRect | null>(null);
  const [ready, setReady] = useState(false);
  const reserveRef = useRef(reserve);
  const leavingRef = useRef(false);

  useEffect(() => {
    reserveRef.current = reserve;
  }, [reserve]);

  const beat = TOUR_SCRIPT[beatIndex]!;
  const line = beat.lines[lineIndex]!;
  const isLastBeat = beatIndex === TOUR_SCRIPT.length - 1;
  const isFinalLine = isLastBeat && lineIndex === beat.lines.length - 1;

  useEffect(() => {
    if (searchParams.get("tour") !== "1") return;
    leavingRef.current = false;
    setLeaving(false);
    setBeatIndex(0);
    setLineIndex(0);
    setActive(true);
  }, [searchParams]);

  // Warm the cache so expression swaps never flash.
  useEffect(() => {
    if (!active) return;
    for (const src of TOUR_IMAGES) {
      const image = new window.Image();
      image.src = src;
    }
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const { body } = document;
    const previous = body.style.paddingBottom;
    body.style.paddingBottom = SCROLL_ROOM;
    return () => {
      body.style.paddingBottom = previous;
    };
  }, [active]);

  const finish = useCallback(
    (goHome: boolean) => {
      if (leavingRef.current) return;
      leavingRef.current = true;
      setLeaving(true);
      window.setTimeout(
        () => {
          leavingRef.current = false;
          setActive(false);
          setLeaving(false);
          setReady(false);
          setRect(null);
          if (goHome) router.push("/home");
          else if (new URLSearchParams(window.location.search).get("tour") === "1") {
            router.replace(window.location.pathname, { scroll: false });
          }
        },
        reducedMotion ? 0 : EXIT_MS,
      );
    },
    [router, reducedMotion],
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

  // Travel to the beat's tab, wait for its element, park it above the stage.
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let waited = 0;
    setReady(false);
    if (pathname !== beat.route) {
      setRect(null);
      router.push(beat.route);
      return;
    }
    if (!beat.target) {
      setRect(null);
      const timer = window.setTimeout(() => !cancelled && setReady(true), beatIndex === 0 ? INTRO_DELAY_MS : 250);
      return () => {
        cancelled = true;
        window.clearTimeout(timer);
      };
    }
    const target = beat.target;
    const frame = () => {
      if (cancelled) return;
      const element = document.querySelector(target);
      if (!element) {
        waited += TARGET_POLL_MS;
        if (waited >= TARGET_WAIT_MS) {
          // Not on screen for this athlete: skip the beat.
          setLineIndex(0);
          if (isLastBeat) finish(true);
          else setBeatIndex((index) => index + 1);
          return;
        }
        window.setTimeout(frame, TARGET_POLL_MS);
        return;
      }
      // Centre the target in the room above the stage (or pin its top if it's tall).
      const box = element.getBoundingClientRect();
      const room = window.innerHeight - reserveRef.current - TARGET_MIN_TOP;
      const fits = box.height + SPOTLIGHT_PADDING * 2 < room;
      const parkAt = fits ? TARGET_MIN_TOP + (room - box.height) / 2 : TARGET_MIN_TOP;
      window.scrollBy({ top: box.top - parkAt, behavior: reducedMotion ? "auto" : "smooth" });
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

  const nextLine = useCallback(() => {
    if (!ready || leavingRef.current) return;
    if (lineIndex < beat.lines.length - 1) {
      setLineIndex((index) => index + 1);
      return;
    }
    if (isLastBeat) {
      finish(true);
      return;
    }
    setLineIndex(0);
    setBeatIndex((index) => index + 1);
  }, [ready, lineIndex, beat.lines.length, isLastBeat, finish]);

  const skip = useCallback(() => finish(false), [finish]);

  return { active, leaving, beat, beatIndex, line, lineIndex, isFinalLine, ready, rect, nextLine, skip };
}
