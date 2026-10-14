"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AlertCircle, CheckCircle2, CloudOff, RefreshCw } from "lucide-react";
import { iconSize } from "@/constants/icons";
import { playSyncSuccess } from "@/lib/audioEngine";
import { syncNow, useOutboxStatus } from "@/lib/sync/syncClient";

function subscribeOnline(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

/**
 * Quiet unless it matters: offline (everything still works and saves on
 * this device), or cloud copies that keep failing to deliver. Guests see
 * nothing — their data is meant to live on the device.
 */
export function NetworkStatusIndicator() {
  const online = useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);
  const status = useOutboxStatus();
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  async function retry() {
    setSyncing(true);
    try {
      const report = await syncNow({ force: true });
      if (report.synced > 0) {
        playSyncSuccess();
        setToast(`${report.synced} ${report.synced === 1 ? "item" : "items"} synced`);
      }
    } finally {
      setSyncing(false);
    }
  }

  if (toast) {
    return (
      <aside
        role="status"
        className="fixed inset-x-0 top-4 z-50 mx-auto flex w-fit max-w-sm items-center gap-2 rounded-full border border-brand/40 bg-surface-elevated/95 px-4 py-2 text-xs font-semibold text-brand shadow-card backdrop-blur-md"
      >
        <CheckCircle2 size={iconSize.sm} aria-hidden />
        {toast}
      </aside>
    );
  }

  if (!online) {
    return (
      <aside
        role="status"
        className="fixed inset-x-0 bottom-24 z-40 mx-auto flex w-fit max-w-sm items-center gap-2 rounded-full border border-border/80 bg-surface-elevated/95 px-3.5 py-1.5 text-xs text-foreground-secondary shadow-card backdrop-blur-md"
      >
        <CloudOff size={iconSize.xs} className="shrink-0 text-warning" aria-hidden />
        Offline — everything saves on this device
      </aside>
    );
  }

  if (status.blockedByAuth || status.failing === 0) return null;

  return (
    <aside
      role="status"
      className="fixed inset-x-0 bottom-24 z-40 mx-auto flex w-fit max-w-sm items-center gap-2.5 rounded-full border border-border/80 bg-surface-elevated/95 px-3.5 py-1.5 text-xs text-foreground-secondary shadow-card backdrop-blur-md"
    >
      <AlertCircle size={iconSize.xs} className="shrink-0 text-warning" aria-hidden />
      {status.pending} {status.pending === 1 ? "item" : "items"} waiting to sync
      <button
        type="button"
        onClick={retry}
        disabled={syncing}
        className="inline-flex min-h-8 items-center gap-1 font-bold text-brand hover:underline disabled:opacity-50"
      >
        {syncing ? <RefreshCw size={iconSize.xs} className="animate-spin" aria-hidden /> : "Retry"}
      </button>
    </aside>
  );
}
