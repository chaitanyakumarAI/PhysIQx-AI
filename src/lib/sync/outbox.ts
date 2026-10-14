import type { CardioActivity } from "@/types/cardio";
import type { CompletedSessionSummary, WorkoutSession } from "@/types/workoutSession";

/**
 * The outbox — every write bound for the cloud waits here until the server
 * confirms it. Local-first: the ledger is already updated; this only
 * delivers a copy. Pure queue logic (no I/O) so it's fully testable; the
 * browser wiring lives in syncClient.ts.
 *
 * - Durable: entries survive reloads (localStorage) and are never dropped.
 * - Backoff: failures retry after 30 s, doubling to a 6-hour ceiling.
 * - Guests: "not signed in" pauses delivery without counting as a failure,
 *   so a guest's history uploads the day they create an account.
 */

export type SyncJob =
  | { kind: "workout"; id: string; session: WorkoutSession; summary: CompletedSessionSummary }
  | { kind: "cardio"; id: string; activity: CardioActivity };

export interface OutboxEntry {
  /** kind:id — one entry per record; re-queueing replaces the payload. */
  key: string;
  job: SyncJob;
  queuedAt: string;
  attempts: number;
  nextAttemptAt: string;
  lastError?: string;
}

export type JobResult =
  | { status: "synced" }
  | { status: "unauthenticated" }
  | { status: "failed"; error: string };

export type JobHandler = (job: SyncJob) => Promise<JobResult>;

const BASE_BACKOFF_MS = 30_000;
const MAX_BACKOFF_MS = 6 * 60 * 60_000;

export function outboxKey(job: SyncJob): string {
  return `${job.kind}:${job.id}`;
}

/** Delay before retry number `attempts` (1-based). */
export function backoffMs(attempts: number): number {
  return Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * 2 ** Math.max(0, attempts - 1));
}

/** Adds or refreshes a job; a refreshed job is due immediately. */
export function enqueue(queue: OutboxEntry[], job: SyncJob, nowIso: string): OutboxEntry[] {
  const key = outboxKey(job);
  const existing = queue.find((entry) => entry.key === key);
  const entry: OutboxEntry = {
    key,
    job,
    queuedAt: existing?.queuedAt ?? nowIso,
    attempts: existing?.attempts ?? 0,
    nextAttemptAt: nowIso,
  };
  return [...queue.filter((item) => item.key !== key), entry];
}

export interface ProcessReport {
  queue: OutboxEntry[];
  synced: number;
  failed: number;
  /** Delivery paused because nobody is signed in. */
  blockedByAuth: boolean;
}

/**
 * Attempts every due entry, oldest first. Stops at the first
 * "unauthenticated" answer — every other job would get the same one.
 */
export async function processOutbox(
  queue: OutboxEntry[],
  handler: JobHandler,
  nowIso: string,
  options: { force?: boolean } = {},
): Promise<ProcessReport> {
  const now = Date.parse(nowIso);
  const remaining: OutboxEntry[] = [];
  let synced = 0;
  let failed = 0;
  let blockedByAuth = false;

  const ordered = [...queue].sort((a, b) => a.queuedAt.localeCompare(b.queuedAt));
  for (const entry of ordered) {
    const due = options.force || Date.parse(entry.nextAttemptAt) <= now;
    if (blockedByAuth || !due) {
      remaining.push(entry);
      continue;
    }
    let result: JobResult;
    try {
      result = await handler(entry.job);
    } catch (error) {
      result = { status: "failed", error: error instanceof Error ? error.message : "Network error" };
    }
    if (result.status === "synced") {
      synced += 1;
    } else if (result.status === "unauthenticated") {
      blockedByAuth = true;
      remaining.push(entry);
    } else {
      failed += 1;
      const attempts = entry.attempts + 1;
      remaining.push({
        ...entry,
        attempts,
        lastError: result.error,
        nextAttemptAt: new Date(now + backoffMs(attempts)).toISOString(),
      });
    }
  }
  return { queue: remaining, synced, failed, blockedByAuth };
}

export interface OutboxSummary {
  pending: number;
  /** Entries that have failed at least once. */
  failing: number;
  lastError: string | null;
}

export function summarizeOutbox(queue: OutboxEntry[]): OutboxSummary {
  const failingEntries = queue.filter((entry) => entry.attempts > 0);
  return {
    pending: queue.length,
    failing: failingEntries.length,
    lastError: failingEntries.at(-1)?.lastError ?? null,
  };
}
