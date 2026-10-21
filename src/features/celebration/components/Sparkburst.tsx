"use client";

import { m, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SparkburstProps {
  /** Bump to fire again; 0 = idle. */
  burst: number;
  color: string;
  count?: number;
  /** How far the sparks fly, in px. */
  radius?: number;
  className?: string;
}

/**
 * A one-shot ring of sparks thrown out from the centre of its parent —
 * the "struck" moment of a level-up or a badge landing. Off under reduced
 * motion. Spark paths are fixed per index, so a burst is identical every time.
 */
export function Sparkburst({ burst, color, count = 16, radius = 80, className }: SparkburstProps) {
  const reducedMotion = useReducedMotion() ?? false;
  if (reducedMotion || burst === 0) return null;
  return (
    <div aria-hidden className={cn("pointer-events-none absolute left-1/2 top-1/2", className)}>
      {Array.from({ length: count }, (_, index) => {
        const angle = (index / count) * Math.PI * 2 + (index % 3) * 0.17;
        const distance = radius * (0.55 + ((index * 37) % 10) / 22);
        const size = 3 + (index % 4);
        return (
          <m.span
            key={`${burst}-${index}`}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              marginLeft: -size / 2,
              marginTop: -size / 2,
              background: index % 4 === 0 ? "#ffffff" : color,
              boxShadow: `0 0 8px ${color}`,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, opacity: 0, scale: 0.3 }}
            transition={{ duration: 0.75 + (index % 5) * 0.06, ease: [0.16, 1, 0.3, 1] }}
          />
        );
      })}
    </div>
  );
}
