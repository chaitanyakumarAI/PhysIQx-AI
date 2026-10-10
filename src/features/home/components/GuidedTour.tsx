"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { duration, easeOut } from "@/lib/motion";

interface TourStep {
  id: string;
  /** The tab this beat lives on — the tour navigates there itself. */
  route: string;
  /** CSS selector for the element the spotlight frames. */
  target: string;
  /** Fixed elements (the nav) never need the page scrolled to them. */
  fixed?: boolean;
  title: string;
  body: string;
}

/**
 * The walkthrough teaches on the REAL interface, travelling across tabs in
 * the order a new user will actually live them: the Home morning flow, how
 * to find and plan training, where the data pays off, the social layer,
 * and finally where the body measures live. The spotlight stays mounted
 * across navigations, so it glides from one screen's element to the
 * next — continuity instead of a hard cut.
 */
const tourSteps: TourStep[] = [
  {
    id: "mission",
    route: "/home",
    target: '[data-tour="mission"]',
    title: "One mission a day",
    body: "Your morning starts here — a single clear workout. Tap Start when you're ready.",
  },
  {
    id: "score",
    route: "/home",
    target: '[data-tour="score"]',
    title: "The PhysIQ Score",
    body: "Four pillars, one number. It only moves on what you actually do.",
  },
  {
    id: "week",
    route: "/home",
    target: '[data-tour="week"]',
    title: "Consistency wins",
    body: "Green days are the biggest force on your score. Planned rest counts too.",
  },
  {
    id: "train-search",
    route: "/train",
    target: '[data-tour="train-search"]',
    title: "Find any exercise",
    body: "Search the catalog or tap a muscle — results rank by how hard they hit it.",
  },
  {
    id: "train-plans",
    route: "/train",
    target: '[data-tour="train-plans"]',
    title: "Build your own split",
    body: "Any days, any exercises, any sets and reps. Each day starts with one tap.",
  },
  {
    id: "train-cardio",
    route: "/train",
    target: '[data-tour="train-cardio"]',
    title: "Cardio counts too",
    body: "A quarter of your score. Logging a session takes three taps.",
  },
  {
    id: "insights-trend",
    route: "/insights",
    target: '[data-tour="insights-trend"]',
    title: "Your story in charts",
    body: "Drag across any chart to scrub through your history day by day.",
  },
  {
    id: "insights-heatmap",
    route: "/insights",
    target: '[data-tour="insights-heatmap"]',
    title: "Twelve weeks at a glance",
    body: "Your consistency map. Tap any square to see what happened that day.",
  },
  {
    id: "compete",
    route: "/compete",
    target: '[data-tour="compete-challenge"]',
    title: "Climb with your circle",
    body: "Weekly challenges and XP leaderboards. XP is social — your score stays personal.",
  },
  {
    id: "body-stats",
    route: "/profile",
    target: 'a[href="/profile/body"]',
    title: "Body measures live here",
    body: "Height, weight and trends — weekly weigh-ins keep Body Shape honest. That's the tour; go earn some green.",
  },
];

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const SPOTLIGHT_PADDING = 8;
/** How long we poll for a step's target after navigating to its route. */
const TARGET_WAIT_MS = 5000;
const TARGET_POLL_MS = 120;

/**
 * Guided product walkthrough over the live app. A spotlight window
 * (everything else dimmed) glides between real UI elements — navigating
 * tabs and auto-scrolling as it goes — while one-line captions do the
 * least talking possible. Activated by ?tour=1 (onboarding's finale and
 * Profile's "Replay app tour"), skippable at every beat, Escape included,
 * reduced-motion aware.
 */
export function GuidedTour() {
  const router = useRouter();
  const pathname = usePathname();
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
    // Param disappearing mid-tour is expected (the tour navigates away from
    // the triggering URL) — never deactivate here.
  }, [searchParams]);

  const finish = useCallback(
    (goHome: boolean) => {
      setActive(false);
      setRect(null);
      if (goHome) {
        router.push("/home");
      } else if (searchParams.get("tour") === "1") {
        // Skipped on the triggering URL: strip the param so refresh doesn't
        // restart the tour. Elsewhere, stay exactly where the user skipped.
        router.replace(pathname, { scroll: false });
      }
    },
    [router, pathname, searchParams],
  );

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

  // Travel to the step's tab if needed, wait for its target to exist, then
  // scroll it into view and frame it. Polling covers route compilation and
  // each screen's first-visit entrance stagger.
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let waited = 0;

    if (pathname !== step.route) {
      router.push(step.route);
      return; // pathname change re-runs this effect on arrival
    }

    const frameTarget = () => {
      if (cancelled) return;
      const el = document.querySelector(step.target);
      if (!el) {
        waited += TARGET_POLL_MS;
        if (waited >= TARGET_WAIT_MS) {
          finish(false); // target truly missing — bail rather than hang
          return;
        }
        window.setTimeout(frameTarget, TARGET_POLL_MS);
        return;
      }
      if (!step.fixed) {
        el.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "center",
        });
      }
      window.setTimeout(
        () => {
          if (cancelled) return;
          measure();
          nextButtonRef.current?.focus({ preventScroll: true });
        },
        reducedMotion ? 80 : 500,
      );
    };

    // Initial delay lets the entrance stagger settle before first measure.
    const start = window.setTimeout(frameTarget, stepIndex === 0 ? 700 : 250);
    return () => {
      cancelled = true;
      window.clearTimeout(start);
    };
  }, [active, step, stepIndex, pathname, router, measure, finish, reducedMotion]);

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
      if (event.key === "Escape") finish(false);
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
                    index === stepIndex ? "w-5 bg-brand" : "w-1.5 bg-foreground/20"
                  }`}
                />
              ))}
            </div>
            <h2 className="font-display text-lg font-bold">{step.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-foreground-secondary">
              {step.body}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => finish(false)}>
                Skip
              </Button>
              <Button
                ref={nextButtonRef}
                size="sm"
                className="flex-1"
                onClick={() =>
                  isLast ? finish(true) : setStepIndex((index) => index + 1)
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
