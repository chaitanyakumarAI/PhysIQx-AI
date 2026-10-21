"use client";

import type { PointerEvent, ReactNode } from "react";
import { m, useReducedMotion, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

const SPRING = { stiffness: 220, damping: 18, mass: 0.6 };

export interface TiltProps {
  children: ReactNode;
  /** Largest tilt in degrees, reached at the edges. */
  max?: number;
  className?: string;
}

/**
 * Tips its content toward the pointer or finger, like turning a medal in
 * your hand, and springs back on release. Touch-drag tilts instead of
 * scrolling (`touch-none`), so keep it to small showcase surfaces.
 */
export function Tilt({ children, max = 14, className }: TiltProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const rotateX = useSpring(0, SPRING);
  const rotateY = useSpring(0, SPRING);

  if (reducedMotion) return <div className={className}>{children}</div>;

  const follow = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    rotateY.set(((event.clientX - box.left) / box.width - 0.5) * max * 2);
    rotateX.set(-((event.clientY - box.top) / box.height - 0.5) * max * 2);
  };
  const settle = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <div
      className={cn("touch-none [perspective:640px]", className)}
      onPointerMove={follow}
      onPointerLeave={settle}
      onPointerUp={settle}
      onPointerCancel={settle}
    >
      <m.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>{children}</m.div>
    </div>
  );
}
