"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Cloud, CloudOff, RefreshCw } from "lucide-react";
import { iconSize } from "@/constants/icons";
import {
  flushSyncQueue,
  getPendingSyncQueue,
} from "@/lib/syncEngine";
import { saveWorkoutSession } from "@/features/session/actions/saveWorkoutSession";
import { playSyncSuccess } from "@/lib/audioEngine";

export function NetworkStatusIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const checkStatus = () => {
    if (typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine);
    }
    const queue = getPendingSyncQueue();
    setPendingCount(queue.length);
  };

  const triggerSync = async () => {
    if (!navigator.onLine || isSyncing) return;

    const queue = getPendingSyncQueue();
    if (queue.length === 0) return;

    setIsSyncing(true);
    try {
      const report = await flushSyncQueue(saveWorkoutSession);
      if (report.syncedCount > 0) {
        playSyncSuccess();
        setToastMessage(
          `Back online &bull; ${report.syncedCount} workout${report.syncedCount > 1 ? "s" : ""} synchronized`,
        );
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch {
      // Sync retry on next network tick
    } finally {
      setIsSyncing(false);
      checkStatus();
    }
  };

  useEffect(() => {
    checkStatus();

    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      checkStatus();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const interval = setInterval(checkStatus, 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Show Toast when reconnect sync finishes
  if (toastMessage) {
    return (
      <aside
        aria-label="Network synchronization"
        className="fixed top-4 inset-x-0 z-50 mx-auto flex w-fit max-w-sm items-center gap-2 rounded-full border border-emerald-500/40 bg-surface-elevated/95 px-4 py-2 text-xs font-semibold text-emerald-400 shadow-card backdrop-blur-md animate-in fade-in slide-in-from-top duration-300"
      >
        <CheckCircle2 size={iconSize.sm} />
        <span dangerouslySetInnerHTML={{ __html: toastMessage }} />
      </aside>
    );
  }

  // If online and zero pending, hide completely
  if (isOnline && pendingCount === 0) {
    return null;
  }

  // Display floating pill when offline or with pending items
  return (
    <aside
      aria-label="Offline sync status"
      className="fixed bottom-20 inset-x-0 z-40 mx-auto flex w-fit max-w-sm items-center gap-2.5 rounded-full border border-border/80 bg-surface-elevated/95 px-3.5 py-1.5 text-xs shadow-card backdrop-blur-md"
    >
      {!isOnline ? (
        <>
          <CloudOff size={iconSize.xs} className="text-amber-400 shrink-0" />
          <span className="text-foreground-secondary">
            Offline mode {pendingCount > 0 && `&bull; ${pendingCount} saved locally`}
          </span>
        </>
      ) : (
        <>
          <Cloud size={iconSize.xs} className="text-brand shrink-0" />
          <span className="text-foreground-secondary">
            {pendingCount} workout{pendingCount > 1 ? "s" : ""} pending sync
          </span>
          <button
            type="button"
            onClick={triggerSync}
            disabled={isSyncing}
            className="flex items-center gap-1 text-xs font-bold text-brand hover:underline disabled:opacity-50"
          >
            {isSyncing ? (
              <RefreshCw size={iconSize.xs} className="animate-spin" />
            ) : (
              "Sync now"
            )}
          </button>
        </>
      )}
    </aside>
  );
}
