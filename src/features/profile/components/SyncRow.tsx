"use client";

import Link from "next/link";
import { ChevronRight, Cloud, RefreshCw } from "lucide-react";
import { iconSize } from "@/constants/icons";
import { formatRelativeTime } from "@/features/compete/lib/derive";
import { syncAll, useSyncState } from "@/lib/sync/pullClient";
import { useOutboxStatus } from "@/lib/sync/syncClient";
import { cn } from "@/lib/utils";
import type { SettingsItem } from "../types";

const rowClass =
  "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60";

function syncedLabel(lastSyncedAt: string | null): string {
  if (!lastSyncedAt) return "Not synced yet";
  if (Date.now() - Date.parse(lastSyncedAt) < 60_000) return "Synced just now";
  return `Synced ${formatRelativeTime(lastSyncedAt, new Date())}`;
}

/**
 * Profile › Cloud sync. Signed in: when this device last synced, and a tap
 * syncs now. Guests: everything stays on this device — the row offers a
 * sign-in to back it up.
 */
export function SyncRow({ item, className }: { item: SettingsItem; className?: string }) {
  const { account, syncing, lastSyncedAt } = useSyncState();
  const outbox = useOutboxStatus();

  if (!account) {
    return (
      <Link href="/login" className={cn(rowClass, className)}>
        <Cloud size={iconSize.sm} aria-hidden className="shrink-0 text-foreground-secondary" />
        <span className="flex-1 font-medium">Back up your training</span>
        <span className="text-sm text-foreground-secondary">Sign in</span>
        <ChevronRight size={iconSize.sm} aria-hidden className="shrink-0 text-foreground-secondary" />
      </Link>
    );
  }

  const status = syncing
    ? "Syncing…"
    : outbox.pending > 0
      ? `${outbox.pending} waiting to upload`
      : syncedLabel(lastSyncedAt);

  return (
    <button
      type="button"
      onClick={() => void syncAll()}
      disabled={syncing}
      aria-label={`${item.label}: ${status}. Sync now`}
      className={cn(rowClass, "disabled:cursor-progress", className)}
    >
      <Cloud size={iconSize.sm} aria-hidden className="shrink-0 text-foreground-secondary" />
      <span className="flex-1 font-medium">{item.label}</span>
      <span className="text-sm text-foreground-secondary" aria-live="polite">
        {status}
      </span>
      <RefreshCw
        size={iconSize.sm}
        aria-hidden
        className={cn("shrink-0 text-foreground-secondary", syncing && "animate-spin")}
      />
    </button>
  );
}
