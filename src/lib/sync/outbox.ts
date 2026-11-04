import type { MediaRecord } from "@/features/profile/lib/mediaRecord";
import type { ProfileSnapshot } from "@/features/profile/lib/profileSnapshot";
import type { CardioActivity } from "@/types/cardio";
import type { WeighIn } from "@/types/ledger";
import type { UserPlan } from "@/types/plan";
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
 * - Accounts: an entry belongs to the account that owned the device when it
 *   was queued and only ever uploads as that account. Guest entries (no
 *   owner) go to the first account that signs in (owner decision 2026-10-23).
 */

export type SyncJob =
  | { kind: "workout"; id: string; session: WorkoutSession; summary: CompletedSessionSummary }
  | { kind: "cardio"; id: string; activity: CardioActivity }
  | { kind: "cardioDelete"; id: string }
  /** id = the weigh-in's date (one per day). */
  | { kind: "weighIn"; id: string; weighIn: WeighIn }
  /** One snapshot of the whole profile; the newest replaces any pending one. */
  | { kind: "profile"; id: "me"; profile: ProfileSnapshot }
  | { kind: "plan"; id: string; plan: UserPlan }
  | { kind: "planDelete"; id: string }
  /** id = the media id; the bytes are read from the media store at delivery. */
  | { kind: "media"; id: string; media: MediaRecord }
  | { kind: "mediaDelete"; id: string };

export interface OutboxEntry {
  /** kind:id — one entry per record; re-queueing replaces the payload. */
  key: string;
  job: SyncJob;
  queuedAt: string;
  attempts: number;
  nextAttemptAt: string;
  lastError?: string;
  /** The account this change belongs to; null/absent = logged as a guest. */
  owner?: string | null;
}

/** An entry's identity: the same record can wait for two accounts. */
function entryId(entry: Pick<OutboxEntry, "key" | "owner">): string {
  return `${entry.owner ?? ""}|${entry.key}`;
}

export type JobResult =
  | { status: "synced" }
  | { status: "unauthenticated" }
  | { status: "failed"; error: string };

export type JobHandler = (job: SyncJob) => Promise<JobResult>;

const BASE_BACKOFF_MS = 30_000;
const MAX_BACKOFF_MS = 6 * 60 * 60_000;

/** A delete shares its record's key, so it replaces a save still waiting (and vice versa). */
const RECORD_OF: Partial<Record<SyncJob["kind"], string>> = {
  cardioDelete: "cardio",
  planDelete: "plan",
  mediaDelete: "media",
};

export function outboxKey(job: SyncJob): string {
  return `${RECORD_OF[job.kind] ?? job.kind}:${job.id}`;
}

/** Delay before retry number `attempts` (1-based). */
export function backoffMs(attempts: number): number {
  return Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * 2 ** Math.max(0, attempts - 1));
}

/** Adds or refreshes a job; a refreshed job is due immediately. */
export function enqueue(
  queue: OutboxEntry[],
  job: SyncJob,
  nowIso: string,
  owner: string | null = null,
): OutboxEntry[] {
  const id = entryId({ key: outboxKey(job), owner });
  const existing = queue.find((entry) => entryId(entry) === id);
  const entry: OutboxEntry = {
    key: outboxKey(job),
    job,
    queuedAt: existing?.queuedAt ?? nowIso,
    attempts: existing?.attempts ?? 0,
    nextAttemptAt: nowIso,
    owner,
  };
  return [...queue.filter((item) => entryId(item) !== id), entry];
}

/** Whether `account` (null = guest) may upload this entry. */
export function belongsTo(entry: OutboxEntry, account: string | null): boolean {
  return !entry.owner || entry.owner === account;
}

/**
 * The first account to sign in on a device takes over what was logged as a
 * guest. If it already had the same record waiting, the guest copy (the
 * device's latest) replaces it.
 */
export function claimGuestEntries(queue: OutboxEntry[], owner: string): OutboxEntry[] {
  const guestKeys = new Set(queue.filter((entry) => !entry.owner).map((entry) => entry.key));
  if (guestKeys.size === 0) return queue;
  return queue
    .filter((entry) => !(entry.owner === owner && guestKeys.has(entry.key)))
    .map((entry) => (entry.owner ? entry : { ...entry, owner }));
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
  options: { force?: boolean; account?: string | null } = {},
): Promise<ProcessReport> {
  const now = Date.parse(nowIso);
  const remaining: OutboxEntry[] = [];
  let synced = 0;
  let failed = 0;
  let blockedByAuth = false;

  const ordered = [...queue].sort((a, b) => a.queuedAt.localeCompare(b.queuedAt));
  for (const entry of ordered) {
    const due = options.force || Date.parse(entry.nextAttemptAt) <= now;
    // Another account's change waits for that account (not a failure).
    if (blockedByAuth || !due || !belongsTo(entry, options.account ?? null)) {
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
      // Waiting for sign-in isn't failing: forget earlier failures (a server
      // outage) so a guest sees no warning, and retry as soon as asked.
      remaining.push({ ...entry, attempts: 0, lastError: undefined, nextAttemptAt: nowIso });
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

/**
 * Folds a finished flush back into the outbox as it is now. A flush works on
 * the snapshot it loaded; anything queued, refreshed or removed while it ran
 * (by this tab or another) must survive it rather than be overwritten.
 *
 * - Entries the flush never saw, or that changed meanwhile: kept as they are.
 * - Entries still exactly as the flush saw them: replaced by its result
 *   (gone if delivered, rescheduled if they failed).
 * - Entries gone meanwhile (another tab delivered them): stay gone.
 */
export function reconcileOutbox(
  latest: OutboxEntry[],
  flushed: OutboxEntry[],
  result: OutboxEntry[],
): OutboxEntry[] {
  const seen = new Map(flushed.map((entry) => [entryId(entry), JSON.stringify(entry)]));
  const after = new Map(result.map((entry) => [entryId(entry), entry]));
  return latest.flatMap((entry) => {
    const snapshot = seen.get(entryId(entry));
    if (snapshot === undefined || snapshot !== JSON.stringify(entry)) return [entry];
    const next = after.get(entryId(entry));
    return next ? [next] : [];
  });
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
