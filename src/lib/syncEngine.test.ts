import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  enqueuePendingSession,
  getPendingSyncQueue,
  removePendingSession,
  clearSyncQueue,
  flushSyncQueue,
} from "./syncEngine";
import type { WorkoutSession } from "@/types/workoutSession";
import type { CompletedSessionSummary } from "@/store/sessionStore";

describe("syncEngine", () => {
  const storageMock: Record<string, string> = {};

  beforeEach(() => {
    Object.keys(storageMock).forEach((k) => delete storageMock[k]);

    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storageMock[key] ?? null,
      setItem: (key: string, val: string) => {
        storageMock[key] = val;
      },
      removeItem: (key: string) => {
        delete storageMock[key];
      },
      clear: () => {
        Object.keys(storageMock).forEach((k) => delete storageMock[k]);
      },
    });

    clearSyncQueue();
  });

  const mockSession: WorkoutSession = {
    id: "session-1",
    missionId: "mission-1",
    title: "Push Heavy",
    status: "completed",
    startedAt: "2026-09-13T10:00:00Z",
    completedAt: "2026-09-13T10:45:00Z",
    exercises: [],
    xpReward: 150,
  };

  const mockSummary: CompletedSessionSummary = {
    id: "session-1",
    missionId: "mission-1",
    title: "Push Heavy",
    date: "2026-09-13",
    completedAt: "2026-09-13T10:45:00Z",
    durationSec: 2700,
    setsCompleted: 12,
    totalVolumeKg: 3500,
    xpEarned: 150,
    topSets: [],
  };

  it("enqueues a pending session and prevents duplicates", () => {
    enqueuePendingSession(mockSession, mockSummary);
    let queue = getPendingSyncQueue();
    expect(queue.length).toBe(1);
    expect(queue[0]?.id).toBe("session-1");
    expect(queue[0]?.retryCount).toBe(0);

    // Re-enqueueing should not duplicate
    enqueuePendingSession(mockSession, mockSummary);
    queue = getPendingSyncQueue();
    expect(queue.length).toBe(1);
  });

  it("removes a session from the queue", () => {
    enqueuePendingSession(mockSession, mockSummary);
    expect(getPendingSyncQueue().length).toBe(1);

    removePendingSession("session-1");
    expect(getPendingSyncQueue().length).toBe(0);
  });

  it("flushes successful sessions from the queue", async () => {
    enqueuePendingSession(mockSession, mockSummary);

    const mockSyncAction = vi.fn().mockResolvedValue({ success: true, sessionDbId: "db-123" });

    const report = await flushSyncQueue(mockSyncAction);
    expect(report.syncedCount).toBe(1);
    expect(report.failedCount).toBe(0);
    expect(report.remainingCount).toBe(0);

    expect(getPendingSyncQueue().length).toBe(0);
    expect(mockSyncAction).toHaveBeenCalledTimes(1);
  });

  it("retains failed sessions in the queue and increments retryCount", async () => {
    enqueuePendingSession(mockSession, mockSummary);

    const mockSyncAction = vi.fn().mockResolvedValue({ success: false, error: "Network timeout" });

    const report = await flushSyncQueue(mockSyncAction);
    expect(report.syncedCount).toBe(0);
    expect(report.failedCount).toBe(1);
    expect(report.remainingCount).toBe(1);

    const queue = getPendingSyncQueue();
    expect(queue.length).toBe(1);
    expect(queue[0]?.retryCount).toBe(1);
  });
});
