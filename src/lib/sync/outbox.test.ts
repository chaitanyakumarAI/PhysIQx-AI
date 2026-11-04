import { describe, expect, it, vi } from "vitest";
import { makeCardio } from "@/test/fixtures";
import {
  backoffMs,
  claimGuestEntries,
  enqueue,
  processOutbox,
  reconcileOutbox,
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

describe("outbox keys", () => {
  it("lets a delete replace a save still waiting for the same record, and back", () => {
    const plan = { id: "p1", name: "Push Pull", days: [] };
    let queue = enqueue([], { kind: "plan", id: "p1", plan }, NOW);
    queue = enqueue(queue, { kind: "planDelete", id: "p1" }, NOW);
    expect(queue.map((entry) => entry.job.kind)).toEqual(["planDelete"]);
    queue = enqueue(queue, cardioJob("c1"), NOW);
    queue = enqueue(queue, { kind: "cardioDelete", id: "c1" }, NOW);
    queue = enqueue(queue, cardioJob("c1"), NOW); // re-imported
    expect(queue.map((entry) => entry.key)).toEqual(["plan:p1", "cardio:c1"]);
    expect(queue.map((entry) => entry.job.kind)).toEqual(["planDelete", "cardio"]);
    queue = enqueue(queue, { kind: "media", id: "photo-1-a", media: { mediaId: "photo-1-a", kind: "avatar" } }, NOW);
    queue = enqueue(queue, { kind: "mediaDelete", id: "photo-1-a" }, NOW);
    expect(queue.at(-1)).toMatchObject({ key: "media:photo-1-a", job: { kind: "mediaDelete" } });
  });
});

describe("accounts", () => {
  it("keeps the same record separately for each account", () => {
    let queue = enqueue([], cardioJob("a"), NOW, "user-a");
    queue = enqueue(queue, cardioJob("a"), NOW, "user-b");
    queue = enqueue(queue, cardioJob("a"), NOW, "user-a");
    expect(queue.map((entry) => entry.owner)).toEqual(["user-b", "user-a"]);
  });

  it("only uploads an account's own changes, and guest changes to anyone", async () => {
    let queue = enqueue([], cardioJob("mine"), NOW, "user-a");
    queue = enqueue(queue, cardioJob("theirs"), NOW, "user-b");
    queue = enqueue(queue, cardioJob("guest"), NOW, null);
    const delivered: string[] = [];
    const report = await processOutbox(
      queue,
      async (job): Promise<JobResult> => {
        delivered.push(job.id);
        return { status: "synced" };
      },
      NOW,
      { account: "user-a" },
    );
    expect(delivered.sort()).toEqual(["guest", "mine"]);
    expect(report.queue.map((entry) => entry.job.id)).toEqual(["theirs"]);
    expect(summarizeOutbox(report.queue).failing).toBe(0);
  });

  it("hands guest changes to the first account, replacing its older copy", () => {
    let queue = enqueue([], cardioJob("a"), NOW, "user-a");
    queue = enqueue(queue, cardioJob("a"), NOW, null);
    queue = enqueue(queue, cardioJob("b"), NOW, null);
    queue = enqueue(queue, cardioJob("c"), NOW, "user-b");
    const claimed = claimGuestEntries(queue, "user-a");
    expect(claimed.map((entry) => `${entry.owner}:${entry.job.id}`)).toEqual([
      "user-a:a",
      "user-a:b",
      "user-b:c",
    ]);
  });
});

describe("reconcileOutbox", () => {
  const LATER = "2026-10-14T12:00:05.000Z";
  const synced = async (): Promise<JobResult> => ({ status: "synced" });

  it("keeps what was queued while a flush ran", async () => {
    const flushed = enqueue([], cardioJob("a"), NOW);
    const report = await processOutbox(flushed, synced, NOW);
    const latest = enqueue(flushed, cardioJob("b"), LATER);
    expect(reconcileOutbox(latest, flushed, report.queue).map((entry) => entry.key)).toEqual(["cardio:b"]);
  });

  it("keeps a record refreshed while its old copy was being delivered", async () => {
    const flushed = enqueue([], cardioJob("a"), NOW);
    const report = await processOutbox(flushed, synced, NOW);
    const refreshed = enqueue(flushed, cardioJob("a"), LATER);
    const result = reconcileOutbox(refreshed, flushed, report.queue);
    expect(result).toHaveLength(1);
    expect(result[0]?.nextAttemptAt).toBe(LATER);
  });

  it("applies the flush's result to untouched entries", async () => {
    const flushed = enqueue(enqueue([], cardioJob("a"), NOW), cardioJob("b"), NOW);
    const report = await processOutbox(
      flushed,
      async (job): Promise<JobResult> =>
        job.id === "a" ? { status: "synced" } : { status: "failed", error: "500" },
      NOW,
    );
    const reread = JSON.parse(JSON.stringify(flushed)) as typeof flushed; // as loaded from storage
    const result = reconcileOutbox(reread, flushed, report.queue);
    expect(result.map((entry) => [entry.key, entry.attempts])).toEqual([["cardio:b", 1]]);
  });

  it("doesn't bring back what another tab delivered meanwhile", async () => {
    const flushed = enqueue([], cardioJob("a"), NOW);
    const report = await processOutbox(
      flushed,
      async (): Promise<JobResult> => ({ status: "failed", error: "timeout" }),
      NOW,
    );
    expect(reconcileOutbox([], flushed, report.queue)).toEqual([]);
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

  it("clears earlier failures once the server says nobody is signed in", async () => {
    const queue = enqueue([], cardioJob("a"), NOW);
    const failed = await processOutbox(queue, async (): Promise<JobResult> => ({ status: "failed", error: "Failed to fetch" }), NOW);
    expect(summarizeOutbox(failed.queue).failing).toBe(1);
    const guest = await processOutbox(failed.queue, async (): Promise<JobResult> => ({ status: "unauthenticated" }), NOW, { force: true });
    expect(summarizeOutbox(guest.queue)).toEqual({ pending: 1, failing: 0, lastError: null });
    expect(guest.queue[0]?.nextAttemptAt).toBe(NOW);
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
