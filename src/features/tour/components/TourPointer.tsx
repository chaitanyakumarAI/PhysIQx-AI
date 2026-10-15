"use client";

import { m } from "framer-motion";
import { cn } from "@/lib/utils";
import type { SpotlightRect } from "../hooks/useTourDirector";

const WIDTH = 40;
const HEIGHT = 46;
const GAP = 6;
/** Leave the screen edge this much room. */
const EDGE = 28;

/**
 * The big bouncing arrow from Clash of Clans' tutorial, in brand green:
 * it sits above the spotlit element and points down at it (below and
 * pointing up when there's no room above).
 */
export function TourPointer({
  rect,
  viewportWidth,
  reducedMotion,
}: {
  rect: SpotlightRect;
  viewportWidth: number;
  reducedMotion: boolean;
}) {
  const above = rect.top >= HEIGHT + GAP + 16;
  const centre = Math.min(Math.max(rect.left + rect.width / 2, EDGE), viewportWidth - EDGE);
  const position = { left: centre - WIDTH / 2, top: above ? rect.top - HEIGHT - GAP : rect.top + rect.height + GAP };

  return (
    <m.div
      aria-hidden
      className="pointer-events-none fixed"
      initial={{ opacity: 0, ...position }}
      animate={{ opacity: 1, ...position, y: reducedMotion ? 0 : above ? [0, 9, 0] : [0, -9, 0] }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      transition={{
        default: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
        y: { duration: 0.9, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox="0 0 40 46"
        className={cn("drop-shadow-[0_0_12px_rgb(34_197_94/0.6)]", !above && "rotate-180")}
      >
        <path
          d="M13 3H27V21H36L20 42L4 21H13Z"
          fill="#22c55e"
          stroke="#052e16"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M17 7V20" stroke="rgb(255 255 255 / 0.5)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </m.div>
  );
}
