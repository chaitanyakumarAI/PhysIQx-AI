"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import type { RecoveryStatus } from "../lib/derive";

export interface StatusStripProps {
  recovery: RecoveryStatus;
}

function formatToday(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/**
 * The thin strip above the greeting: today's date and the live recovery
 * chip. Date is computed client-side for the same reason as the greeting —
 * this route is statically prerendered, so a server date would freeze at
 * build time (same suppressHydrationWarning contract as WelcomeHeader).
 */
export function StatusStrip({ recovery }: StatusStripProps) {
  const [today] = useState(() => formatToday(new Date()));

  return (
    <div className="flex items-center justify-between gap-4 pt-6">
      <span
        suppressHydrationWarning
        className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-secondary"
      >
        {today}
      </span>
      <Badge tone={recovery.tone === "brand" ? "brand" : "info"}>
        <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-current" />
        {recovery.label}
      </Badge>
    </div>
  );
}
