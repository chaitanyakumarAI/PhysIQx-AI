"use client";

import { AnimatePresence, m } from "framer-motion";
import type { SpotlightRect } from "../hooks/useTourDirector";

/**
 * Dims the app around the spotlit element (or all of it for the intro and
 * finale) and lays the stage floor the cast stands on. The floor is solid
 * where the characters' near-black render backgrounds sit, so they rise out
 * of it instead of reading as pasted rectangles.
 */
export function TourBackdrop({
  rect,
  floorHeight,
  reducedMotion,
}: {
  rect: SpotlightRect | null;
  floorHeight: number;
  reducedMotion: boolean;
}) {
  return (
    <>
      <AnimatePresence>
        {rect ? (
          <m.div
            key="spotlight"
            aria-hidden
            initial={{ opacity: 0, ...rect }}
            animate={{ opacity: 1, ...rect }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed rounded-[22px] ring-2 ring-brand/80 [box-shadow:0_0_0_9999px_rgb(0_0_0/0.72),0_0_32px_-4px_rgb(34_197_94/0.6)]"
          >
            {!reducedMotion && (
              <m.span
                className="absolute -inset-1.5 rounded-[26px] ring-2 ring-brand/40"
                animate={{ opacity: [0.15, 0.85, 0.15] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </m.div>
        ) : (
          <m.div
            key="scene"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 bg-black/80"
          />
        )}
      </AnimatePresence>

      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 bg-[linear-gradient(to_top,#0d0f0c_0%,#0d0f0c_56%,rgb(13_15_12/0)_100%)] transition-[height] duration-500"
        style={{ height: floorHeight }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_50%_100%,rgb(34_197_94/0.16),transparent_75%)]" />
      </div>
    </>
  );
}
