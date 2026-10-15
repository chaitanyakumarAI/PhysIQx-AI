"use client";

import { useEffect, useState } from "react";
import type { Viewport } from "../stage";

/** A typical phone until the first measure, so the stage never sizes to 0. */
const FALLBACK: Viewport = { width: 390, height: 844 };

export function useViewport(): Viewport {
  const [viewport, setViewport] = useState<Viewport>(FALLBACK);

  useEffect(() => {
    const update = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return viewport;
}
