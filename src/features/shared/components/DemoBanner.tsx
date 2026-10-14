"use client";

import { Sparkles, X } from "lucide-react";
import { iconSize } from "@/constants/icons";
import { useProfileStore } from "@/store/profileStore";

/** Shown wherever demo data is on screen, with a one-tap way out. */
export function DemoBanner() {
  const setDemoMode = useProfileStore((state) => state.setDemoMode);
  return (
    <div
      role="status"
      className="flex items-center gap-3 rounded-field border border-info/30 bg-info/10 px-4 py-3 text-sm"
    >
      <Sparkles size={iconSize.xs} className="shrink-0 text-info" aria-hidden />
      <span className="flex-1 text-foreground">
        You&apos;re exploring sample data. Your own log is untouched.
      </span>
      <button
        type="button"
        onClick={() => setDemoMode(false)}
        className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 font-semibold text-info hover:bg-info/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/60"
      >
        Exit
        <X size={iconSize.xs} aria-hidden />
      </button>
    </div>
  );
}
