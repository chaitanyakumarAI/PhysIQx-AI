"use client";

import { useCallback, useEffect, useState } from "react";

const MS_PER_CHAR = 26;

/**
 * Types `text` out one character at a time while `running`. `cue` names the
 * line, so a new line starts from zero instead of flashing the old count.
 */
export function useTypewriter(text: string, cue: string, running: boolean, instant: boolean) {
  const [progress, setProgress] = useState({ cue: "", count: 0 });

  useEffect(() => {
    if (!running) return;
    if (instant) {
      setProgress({ cue, count: text.length });
      return;
    }
    setProgress({ cue, count: 0 });
    const timer = window.setInterval(() => {
      setProgress((current) =>
        current.cue !== cue || current.count >= text.length ? current : { cue, count: current.count + 1 },
      );
    }, MS_PER_CHAR);
    return () => window.clearInterval(timer);
  }, [text, cue, running, instant]);

  const typed = progress.cue === cue ? progress.count : instant ? text.length : 0;
  const complete = useCallback(() => setProgress({ cue, count: text.length }), [cue, text.length]);

  return { typed, done: typed >= text.length, complete };
}
