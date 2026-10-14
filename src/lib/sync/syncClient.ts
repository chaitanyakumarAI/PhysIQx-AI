"use client";

import { useSyncExternalStore } from "react";
import { saveWorkoutSession } from "@/features/session/actions/saveWorkoutSession";
import { saveCardioActivity } from "@/features/train/actions/saveCardioActivity";
import type { CardioActivity } from "@/types/cardio";
import type { CompletedSessionSummary, WorkoutSession } from "@/types/workoutSession";
import {
  enqueue,
  processOutbox,
  summarizeOutbox,
  type JobResult,
  type OutboxEntry,
  type OutboxSummary,
  type SyncJob,
} from "./outbox";

/**
 * Browser wiring for the outbox: localStorage persistence, delivery through
 * the server actions, triggers (enqueue, coming online, app start), and a
 * hook for status UI. One flush at a time.
 */

const STORAGE_KEY = "physiqx-outbox";
const LEGACY_WORKOUT_KEY = "physiqx-sync-queue";
const LEGACY_CARDIO_KEY = "physiqx-cardio-sync-queue";
const CHANGE_EVENT = "physiqx-outbox-change";

interface LegacyWorkoutItem {
  session: WorkoutSession;
  summary: CompletedSessionSummary;
}

function storage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

/** Moves queues from the old sync engine into the outbox, once. */
function migrateLegacy(store: Storage, queue: OutboxEntry[]): OutboxEntry[] {
  const raw = store.getItem(LEGACY_WORKOUT_KEY);
  if (raw) {
    try {
      const now = new Date().toISOString();
      for (const item of JSON.parse(raw) as LegacyWorkoutItem[]) {
        queue = enqueue(
          queue,
          { kind: "workout", id: item.summary.id, session: item.session, summary: item.summary },
          now,
        );
      }
    } catch {
      // Unreadable legacy data: nothing safe to migrate.
    }
    store.removeItem(LEGACY_WORKOUT_KEY);
  }
  // Legacy cardio entries used a model the server no longer accepts; the
  // cardio store re-queues current activities itself.
  store.removeItem(LEGACY_CARDIO_KEY);
  return queue;
}

export function loadOutbox(): OutboxEntry[] {
  const store = storage();
  if (!store) return [];
  let queue: OutboxEntry[] = [];
  try {
    queue = JSON.parse(store.getItem(STORAGE_KEY) ?? "[]") as OutboxEntry[];
  } catch {
    queue = [];
  }
  if (store.getItem(LEGACY_WORKOUT_KEY) || store.getItem(LEGACY_CARDIO_KEY)) {
    queue = migrateLegacy(store, queue);
    saveOutbox(queue);
  }
  return queue;
}

function saveOutbox(queue: OutboxEntry[]): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error("[outbox] could not persist:", error);
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

async function deliver(job: SyncJob): Promise<JobResult> {
  const result =
    job.kind === "workout"
      ? await saveWorkoutSession(job.session, job.summary)
      : await saveCardioActivity(job.activity);
  if (result.success) return { status: "synced" };
  if (result.reason === "unauthenticated") return { status: "unauthenticated" };
  return { status: "failed", error: result.error ?? "Sync failed" };
}

let flushing: Promise<SyncReport> | null = null;
let blockedByAuth = false;

export interface SyncReport {
  synced: number;
  failed: number;
  blockedByAuth: boolean;
}

/** Delivers everything due (or everything, when forced). */
export function syncNow(options: { force?: boolean } = {}): Promise<SyncReport> {
  if (flushing) return flushing;
  flushing = (async () => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return { synced: 0, failed: 0, blockedByAuth };
    }
    const report = await processOutbox(loadOutbox(), deliver, new Date().toISOString(), options);
    blockedByAuth = report.blockedByAuth;
    saveOutbox(report.queue);
    return { synced: report.synced, failed: report.failed, blockedByAuth: report.blockedByAuth };
  })().finally(() => {
    flushing = null;
  });
  return flushing;
}

function queue(jobs: SyncJob[]): void {
  if (jobs.length === 0) return;
  const now = new Date().toISOString();
  saveOutbox(jobs.reduce((entries, job) => enqueue(entries, job, now), loadOutbox()));
  void syncNow();
}

export function queueWorkout(session: WorkoutSession, summary: CompletedSessionSummary): void {
  queue([{ kind: "workout", id: summary.id, session, summary }]);
}

export function queueCardio(activities: CardioActivity[]): void {
  queue(activities.map((activity) => ({ kind: "cardio" as const, id: activity.id, activity })));
}

/** Retries due entries when the browser comes back online and periodically. */
export function startBackgroundSync(): () => void {
  if (typeof window === "undefined") return () => {};
  const run = () => void syncNow();
  window.addEventListener("online", run);
  const timer = window.setInterval(run, 60_000);
  run();
  return () => {
    window.removeEventListener("online", run);
    window.clearInterval(timer);
  };
}

// --- Status for UI -----------------------------------------------------------

export interface OutboxStatus extends OutboxSummary {
  /** Guests: nothing to show — their data is meant to stay local for now. */
  blockedByAuth: boolean;
}

const EMPTY: OutboxStatus = { pending: 0, failing: 0, lastError: null, blockedByAuth: false };
let cachedRaw: string | null = null;
let cachedStatus: OutboxStatus = EMPTY;

function readStatus(): OutboxStatus {
  const raw = storage()?.getItem(STORAGE_KEY) ?? "[]";
  if (raw !== cachedRaw || cachedStatus.blockedByAuth !== blockedByAuth) {
    cachedRaw = raw;
    let entries: OutboxEntry[] = [];
    try {
      entries = JSON.parse(raw) as OutboxEntry[];
    } catch {
      entries = [];
    }
    cachedStatus = { ...summarizeOutbox(entries), blockedByAuth };
  }
  return cachedStatus;
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useOutboxStatus(): OutboxStatus {
  return useSyncExternalStore(subscribe, readStatus, () => EMPTY);
}
