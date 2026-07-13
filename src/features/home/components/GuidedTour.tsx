"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { duration, easeOut } from "@/lib/motion";

interface TourStep {
  id: string;
  /** CSS selector for the element the spotlight frames. */
  target: string;
  /** Fixed elements (the nav) never need the page scrolled to them. */
  fixed?: boolean;
  title: string;
  body: string;
}

/**
 * The walkthrough teaches on the REAL interface: each beat spotlights a live
 * element the user will use tomorrow morning, in the order they'll use them.
 * The last two beats point at the actual nav tabs — teaching where things
 * live beats teleporting the user through screens they haven't earned yet.
 */
const tourSteps: TourStep[] = [
  {
    id: "mission",
    target: '[data-tour="mission"]',
    title: "One mission a day",
    body: "Your morning starts here — a single clear workout. Tap Start when you're ready.",
  },
  {
    id: "score",
    target: '[data-tour="score"]',
    title: "The PhysIQ Score",
    body: "Four pillars, one number. It only moves on what you actually do.",
  },
  {
    id: "week",
    target: '[data-tour="week"]',
    title: "Consistency wins",
    body: "Green days are the biggest force on your score. Rest days you planned count too.",
  },
  {
    id: "nav-train",
    target: 'nav a[href="/train"]',
    fixed: true,
    title: "Train lives here",
    body: "The exercise catalog, programs, and your own custom plans.",
  },
  {
    id: "nav-insights",
    target: 'nav a[href="/insights"]',
    fixed: true,
    title: "Watch it pay off",
    body: "Trends, records, and your streak. That's the tour — go earn some green.",
  },
];

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const SPOTLIGHT_PADDING = 8;

/**
 * Guided product walkthrough over the live Home screen. A spotlight window
 * (everything else dimmed) glides between real UI elements while the page
 * auto-scrolls — motion does the teaching, captions stay to one line.
 * Activated by ?tour=1 (onboarding's finale and Profile's "Replay app
 * tour"), skippable at every beat, Escape included, reduced-motion aware.
 */
export function GuidedTour() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<SpotlightRect | null>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  const step = tourSteps[stepIndex]!;
  const isLast = stepIndex === tourSteps.length - 1;

  useEffect(() => {
    if (searchParams.get("tour") === "1") {
      setStepIndex(0);
      setActive(true);
    }
  }, [searchParams]);

  const finish = useCallback(() => {
    setActive(false);
    setRect(null);
    router.replace("/home", { scroll: false });
  }, [router]);

  const measure = useCallback(() => {
    const el = document.querySelector(step.target);
    if (!el) return;
    const box = el.getBoundingClientRect();
    setRect({
      top: box.top - SPOTLIGHT_PADDING,
      left: box.left - SPOTLIGHT_PADDING,
      width: box.width + SPOTLIGHT_PADDING * 2,
      height: box.height + SPOTLIGHT_PADDING * 2,
    });
  }, [step.target]);

  // Scroll the target into view, then frame it. The initial delay lets the
  // screen's entrance stagger settle so we measure resting positions.
  useEffect(() => {
    if (!active) return;
    const el = document.querySelector(step.target);
    if (!el) {
      finish();
      return;
    }
    if (!step.fixed) {
      el.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "center",
      });
    }
    const settle = window.setTimeout(
      () => {
        measure();
        nextButtonRef.current?.focus({ preventScroll: true });
      },
      reducedMotion ? 80 : stepIndex === 0 ? 750 : 480,
    );
    return () => window.clearTimeout(settle);
  }, [active, step, stepIndex, measure, finish, reducedMotion]);

  // The spotlight tracks its target through user scrolls and resizes.
  useEffect(() => {
    if (!active) return;
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
  }, [active, measure]);

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, finish]);

  if (!active) return null;

  // Caption sits in whichever half of the screen the spotlight isn't.
  const captionOnTop =
    rect !== null && rect.top + rect.height / 2 > window.innerHeight / 2;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="App walkthrough"
      className="fixed inset-0 z-[60]"
    >
      <AnimatePresence>
        {rect && (
          <m.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            }}
            transition={{
              duration: reducedMotion ? 0 : 0.45,
              ease: easeOut,
            }}
            style={{ position: "fixed" }}
            className="rounded-2xl ring-2 ring-brand/70 [box-shadow:0_0_0_9999px_rgb(0_0_0/0.72),0_0_24px_-4px_rgb(34_197_94/0.5)]"
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <m.div
          key={step.id}
          initial={{ opacity: 0, y: captionOnTop ? -10 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration.fast, ease: easeOut }}
          className={`fixed inset-x-5 ${captionOnTop ? "top-16" : "bottom-32"}`}
        >
          <div className="mx-auto max-w-md rounded-card border border-border/60 bg-surface-elevated/95 p-5 shadow-card-elevated backdrop-blur-xl">
            <div aria-hidden className="mb-3 flex items-center gap-1.5">
              {tourSteps.map((s, index) => (
                <span
                  key={s.id}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === stepIndex ? "w-6 bg-brand" : "w-1.5 bg-foreground/20"
                  }`}
                />
              ))}
            </div>
            <h2 className="font-display text-lg font-bold">{step.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-foreground-secondary">
              {step.body}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={finish}>
                Skip
              </Button>
              <Button
                ref={nextButtonRef}
                size="sm"
                className="flex-1"
                onClick={() =>
                  isLast ? finish() : setStepIndex((index) => index + 1)
                }
              >
                {isLast ? "Start exploring" : "Next"}
              </Button>
            </div>
          </div>
        </m.div>
      </AnimatePresence>
    </div>
  );
}
