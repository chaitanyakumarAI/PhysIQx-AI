import type { WorkoutSession } from "@/types/workoutSession";
import type { CompletedSessionSummary } from "@/store/sessionStore";
import type { SaveSessionResult } from "@/features/session/actions/saveWorkoutSession";

export interface PendingSyncItem {
  id: string;
  session: WorkoutSession;
  summary: CompletedSessionSummary;
  queuedAt: string;
  retryCount: number;
}

export interface SyncReport {
  syncedCount: number;
  failedCount: number;
  remainingCount: number;
}

const STORAGE_KEY = "physiqx-sync-queue";

function getStorage(): Storage | null {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  if (typeof globalThis !== "undefined" && globalThis.localStorage) {
    return globalThis.localStorage;
  }
  return null;
}

/**
 * Retrieves the current pending sync queue from localStorage.
 */
export function getPendingSyncQueue(): PendingSyncItem[] {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Persists the pending sync queue to localStorage.
 */
export function savePendingSyncQueue(queue: PendingSyncItem[]): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error("[syncEngine] Error saving sync queue to localStorage:", error);
  }
}

/**
 * Queues a finished workout session for background syncing when network is restored.
 */
export function enqueuePendingSession(
  session: WorkoutSession,
  summary: CompletedSessionSummary,
): void {
  const queue = getPendingSyncQueue();
  const exists = queue.some((item) => item.id === session.id);

  if (!exists) {
    queue.push({
      id: session.id,
      session,
      summary,
      queuedAt: new Date().toISOString(),
      retryCount: 0,
    });
    savePendingSyncQueue(queue);
  }
}

/**
 * Removes a successfully synced session from the queue.
 */
export function removePendingSession(sessionId: string): void {
  const queue = getPendingSyncQueue();
  const filtered = queue.filter((item) => item.id !== sessionId);
  savePendingSyncQueue(filtered);
}

/**
 * Clears the entire sync queue (useful for testing or full reset).
 */
export function clearSyncQueue(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Iterates through all pending workouts in the sync queue and executes the save action.
 */
export function flushSyncQueue(
  syncAction: (
    session: WorkoutSession,
    summary: CompletedSessionSummary,
  ) => Promise<SaveSessionResult>,
): Promise<SyncReport> {
  return (async () => {
    const queue = getPendingSyncQueue();
    if (queue.length === 0) {
      return { syncedCount: 0, failedCount: 0, remainingCount: 0 };
    }

    let syncedCount = 0;
    let failedCount = 0;
    const remainingQueue: PendingSyncItem[] = [];

    for (const item of queue) {
      try {
        const result = await syncAction(item.session, item.summary);
        if (result.success) {
          syncedCount += 1;
        } else {
          failedCount += 1;
          remainingQueue.push({
            ...item,
            retryCount: item.retryCount + 1,
          });
        }
      } catch {
        failedCount += 1;
        remainingQueue.push({
          ...item,
          retryCount: item.retryCount + 1,
        });
      }
    }

    savePendingSyncQueue(remainingQueue);

    return {
      syncedCount,
      failedCount,
      remainingCount: remainingQueue.length,
    };
  })();
}

/**
 * Sets up online event listener to trigger sync automatically when internet connectivity returns.
 */
export function initOnlineSync(
  syncAction: (
    session: WorkoutSession,
    summary: CompletedSessionSummary,
  ) => Promise<SaveSessionResult>,
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleOnline = () => {
    flushSyncQueue(syncAction).catch((err) => {
      console.error("[syncEngine] Background online sync error:", err);
    });
  };

  window.addEventListener("online", handleOnline);

  // Trigger an initial flush if online
  if (navigator.onLine) {
    handleOnline();
  }

  return () => {
    window.removeEventListener("online", handleOnline);
  };
}
