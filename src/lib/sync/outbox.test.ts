import { describe, expect, it, vi } from "vitest";
import { makeCardio } from "@/test/fixtures";
import {
  backoffMs,
  enqueue,
  processOutbox,
  summarizeOutbox,
  type JobResult,
  type SyncJob,
} from "./outbox";

const NOW = "2026-10-14T12:00:00.000Z";
const cardioJob = (id: string): SyncJob => ({
  kind: "cardio",
  id,
  activity: makeCardio("2026-10-13", 30, "run", { id }),
});

describe("enqueue", () => {
  it("keeps one entry per record and refreshes its payload", () => {
    let queue = enqueue([], cardioJob("a"), NOW);
    queue = enqueue(queue, cardioJob("a"), NOW);
    queue = enqueue(queue, cardioJob("b"), NOW);
    expect(queue.map((entry) => entry.key)).toEqual(["cardio:a", "cardio:b"]);
  });
});

describe("processOutbox", () => {
  it("removes delivered entries", async () => {
    const queue = enqueue([], cardioJob("a"), NOW);
    const report = await processOutbox(queue, async () => ({ status: "synced" }), NOW);
    expect(report.queue).toEqual([]);
    expect(report.synced).toBe(1);
  });

  it("backs off failures and never drops them", async () => {
    const queue = enqueue([], cardioJob("a"), NOW);
    const report = await processOutbox(
      queue,
      async (): Promise<JobResult> => ({ status: "failed", error: "500" }),
      NOW,
    );
    const [entry] = report.queue;
    expect(entry!.attempts).toBe(1);
    expect(entry!.lastError).toBe("500");
    expect(Date.parse(entry!.nextAttemptAt) - Date.parse(NOW)).toBe(backoffMs(1));
  });

  it("skips entries that aren't due yet unless forced", async () => {
    const handler = vi.fn(async (): Promise<JobResult> => ({ status: "synced" }));
    const failed = await processOutbox(
      enqueue([], cardioJob("a"), NOW),
      async () => ({ status: "failed", error: "x" }),
      NOW,
    );
    const later = await processOutbox(failed.queue, handler, NOW);
    expect(handler).not.toHaveBeenCalled();
    expect(later.queue).toHaveLength(1);
    const forced = await processOutbox(failed.queue, handler, NOW, { force: true });
    expect(forced.queue).toHaveLength(0);
  });

  it("pauses without penalty when nobody is signed in", async () => {
    let queue = enqueue([], cardioJob("a"), NOW);
    queue = enqueue(queue, cardioJob("b"), NOW);
    const handler = vi.fn(async (): Promise<JobResult> => ({ status: "unauthenticated" }));
    const report = await processOutbox(queue, handler, NOW);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(report.blockedByAuth).toBe(true);
    expect(report.queue.every((entry) => entry.attempts === 0)).toBe(true);
  });

  it("treats thrown errors as failures", async () => {
    const report = await processOutbox(
      enqueue([], cardioJob("a"), NOW),
      async () => {
        throw new Error("offline");
      },
      NOW,
    );
    expect(report.failed).toBe(1);
    expect(report.queue[0]!.lastError).toBe("offline");
  });
});

describe("backoff and summary", () => {
  it("doubles up to a ceiling", () => {
    expect(backoffMs(1)).toBe(30_000);
    expect(backoffMs(2)).toBe(60_000);
    expect(backoffMs(50)).toBe(6 * 60 * 60_000);
  });

  it("summarizes pending and failing entries", () => {
    const queue = enqueue(enqueue([], cardioJob("a"), NOW), cardioJob("b"), NOW).map((entry, index) =>
      index === 0 ? { ...entry, attempts: 2, lastError: "timeout" } : entry,
    );
    expect(summarizeOutbox(queue)).toEqual({ pending: 2, failing: 1, lastError: "timeout" });
  });
});
