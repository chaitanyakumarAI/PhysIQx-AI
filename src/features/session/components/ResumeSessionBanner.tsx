"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { iconSize } from "@/constants/icons";
import { useSessionStore } from "@/store/sessionStore";
import { useElapsedSeconds } from "../hooks/useElapsedSeconds";
import { formatElapsedTime } from "../lib/derive";

/**
 * Persistent "resume workout" banner shown on every tab screen while a
 * session is active — per docs/ROUTES.md's session flow. Fixed above
 * BottomNavigation using a spacing-scale offset (bottom-24) generous enough
 * to clear it with headroom, rather than a pixel-matched calc() coupled to
 * that component's exact height — simpler and more consistent with the
 * "8-point grid, never arbitrary spacing" rule than a brittle precise value.
 */
export function ResumeSessionBanner() {
  const session = useSessionStore((state) => state.session);
  const elapsedSeconds = useElapsedSeconds(
    session?.startedAt ?? null,
    session?.status === "active",
  );

  if (!session || session.status !== "active") return null;

  return (
    <Link
      href={`/session/${session.missionId}`}
      className="fixed inset-x-0 bottom-24 z-40 mx-auto flex w-[calc(100%-2.5rem)] max-w-md items-center gap-3 rounded-full border border-brand/30 bg-surface-elevated/95 px-4 py-3 shadow-card backdrop-blur-md transition-colors hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand text-zinc-950">
        <Play size={iconSize.sm} aria-hidden fill="currentColor" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">
          Workout in progress
        </span>
        <span className="block text-xs text-foreground-secondary">
          {formatElapsedTime(elapsedSeconds)} elapsed
        </span>
      </span>
      <span className="shrink-0 text-sm font-semibold text-brand">Resume</span>
    </Link>
  );
}
