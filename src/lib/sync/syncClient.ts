"use client";

import { useSyncExternalStore } from "react";
import { saveProfileSnapshot } from "@/features/profile/actions/saveProfileSnapshot";
import { deleteMediaRecord, saveMediaRecord } from "@/features/profile/actions/syncMedia";
import type { MediaRecord } from "@/features/profile/lib/mediaRecord";
import { uploadMedia } from "@/lib/media/cloudMedia";
import { saveWeighIn } from "@/features/profile/actions/saveWeighIn";
import { mediaBackfillRecords } from "@/features/profile/lib/media";
import { buildProfileSnapshot } from "@/features/profile/lib/profileSnapshot";
import { saveWorkoutSession } from "@/features/session/actions/saveWorkoutSession";
import { deleteCardioActivity } from "@/features/train/actions/deleteCardioActivity";
import { saveCardioActivity } from "@/features/train/actions/saveCardioActivity";
import { deleteUserPlan, saveUserPlan } from "@/features/train/actions/syncPlan";
import { usePlansStore } from "@/store/plansStore";
import { useProfileStore } from "@/store/profileStore";
import type { CardioActivity } from "@/types/cardio";
import type { CompletedSessionSummary, WorkoutSession } from "@/types/workoutSession";
import { backfillJobs, jobForEvent } from "./jobs";
import {
  belongsTo,
  claimGuestEntries,
  enqueue,
  processOutbox,
  reconcileOutbox,
  summarizeOutbox,
  type JobResult,
  type OutboxEntry,
  type OutboxSummary,
  type SyncJob,
} from "./outbox";
import type { SyncWriteResult } from "./signedInWrite";
import { onSyncEvent } from "./syncEvents";
import { whenHydrated } from "./whenHydrated";

/**
 * Browser wiring for the outbox: localStorage persistence, delivery through
 * the server actions, triggers (enqueue, coming online, app start), and a
 * hook for status UI. One flush at a time.
 */

const STORAGE_KEY = "physiqx-outbox";
const LEGACY_WORKOUT_KEY = "physiqx-sync-queue";
const LEGACY_CARDIO_KEY = "physiqx-cardio-sync-queue";
const CHANGE_EVENT = "physiqx-outbox-change";
/** Set once this device has queued what it recorded before everything synced. */
const BACKFILL_KEY = "physiqx-sync-backfill-v1";
/** Images arrived later (W7): their own one-time backfill. */
const MEDIA_BACKFILL_KEY = "physiqx-sync-backfill-media-v1";
/** The account this device's local data belongs to (set by its first restore). */
const OWNER_KEY = "physiqx-sync-owner";

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

function send(job: SyncJob): Promise<SyncWriteResult> {
  switch (job.kind) {
    case "workout":
      return saveWorkoutSession(job.session, job.summary);
    case "cardio":
      return saveCardioActivity(job.activity);
    case "cardioDelete":
      return deleteCardioActivity(job.id);
    case "weighIn":
      return saveWeighIn(job.weighIn);
    case "profile":
      return saveProfileSnapshot(job.profile);
    case "plan":
      return saveUserPlan(job.plan);
    case "planDelete":
      return deleteUserPlan(job.id);
    case "media":
      return sendMedia(job.media);
    case "mediaDelete":
      return deleteMediaRecord(job.id);
  }
}

/** Bytes first (straight to Storage), then the record that points at them. */
async function sendMedia(media: MediaRecord): Promise<SyncWriteResult> {
  const account = signedInAccount;
  if (!account) return { success: false, reason: "unauthenticated", error: "Not signed in." };
  // Deleted from this device since it was queued: nothing left to back up.
  if ((await uploadMedia(media.mediaId, account)) === "missing") return { success: true };
  return saveMediaRecord(media);
}

/** Images still waiting to upload: kept when local data is cleared or pruned. */
export function pendingMediaIds(): Set<string> {
  return new Set(loadOutbox().filter((entry) => entry.job.kind === "media").map((entry) => entry.job.id));
}

async function deliver(job: SyncJob): Promise<JobResult> {
  const result = await send(job);
  if (result.success) return { status: "synced" };
  if (result.reason === "unauthenticated") return { status: "unauthenticated" };
  return { status: "failed", error: result.error ?? "Sync failed" };
}

let flushing: Promise<SyncReport> | null = null;
/** Something asked for a flush while one ran: run again once it ends. */
let flushAgain = false;
let blockedByAuth = false;

export interface SyncReport {
  synced: number;
  failed: number;
  blockedByAuth: boolean;
}

/** Delivers everything due (or everything, when forced). */
export function syncNow(options: { force?: boolean } = {}): Promise<SyncReport> {
  if (flushing) {
    flushAgain = true;
    return flushing;
  }
  flushing = (async () => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return { synced: 0, failed: 0, blockedByAuth };
    }
    const flushed = loadOutbox();
    const report = await processOutbox(flushed, deliver, new Date().toISOString(), {
      ...options,
      account: signedInAccount,
    });
    blockedByAuth = report.blockedByAuth;
    // Entries queued while this flush ran are in storage, not in `flushed`.
    saveOutbox(reconcileOutbox(loadOutbox(), flushed, report.queue));
    return { synced: report.synced, failed: report.failed, blockedByAuth: report.blockedByAuth };
  })().finally(() => {
    flushing = null;
    if (flushAgain) {
      flushAgain = false;
      void syncNow();
    }
  });
  return flushing;
}

function queue(jobs: SyncJob[]): void {
  if (jobs.length === 0) return;
  const now = new Date().toISOString();
  const owner = deviceOwner();
  saveOutbox(jobs.reduce((entries, job) => enqueue(entries, job, now, owner), loadOutbox()));
  void syncNow();
}

// --- Accounts ----------------------------------------------------------------

/** Who is signed in, per the browser session (pullClient keeps it current). */
let signedInAccount: string | null = null;

export function setSignedInAccount(account: string | null): void {
  if (account === signedInAccount) return;
  signedInAccount = account;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function deviceOwner(): string | null {
  return storage()?.getItem(OWNER_KEY) ?? null;
}

/**
 * Hands the device's local data to `owner` (null: nobody — after sign-out).
 * Taking ownership also takes over what was queued as a guest.
 */
export function setDeviceOwner(owner: string | null): void {
  const store = storage();
  if (!store) return;
  if (!owner) {
    store.removeItem(OWNER_KEY);
    return;
  }
  store.setItem(OWNER_KEY, owner);
  saveOutbox(claimGuestEntries(loadOutbox(), owner));
}

/** Changes still waiting to upload that `account` may send. */
export function pendingUploadsFor(account: string | null): OutboxEntry[] {
  return loadOutbox().filter((entry) => belongsTo(entry, account));
}

export function queueCardio(activities: CardioActivity[]): void {
  queue(activities.map((activity) => ({ kind: "cardio" as const, id: activity.id, activity })));
}

function profileSnapshotNow() {
  return buildProfileSnapshot(
    useProfileStore.getState(),
    usePlansStore.getState().activePlanId,
    new Date().toISOString(),
  );
}

/** Queues, once per device, what was recorded before these kinds synced. */
function backfillOnce(): void {
  const store = storage();
  if (!store || store.getItem(BACKFILL_KEY)) return;
  const plans = usePlansStore.getState();
  queue(backfillJobs({ profile: useProfileStore.getState(), plans: plans.plans, activePlanId: plans.activePlanId }));
  store.setItem(BACKFILL_KEY, new Date().toISOString());
}

/** Queues, once per device, images saved before they synced (the avatar; photos if opted in). */
function backfillMediaOnce(): void {
  const store = storage();
  if (!store || store.getItem(MEDIA_BACKFILL_KEY)) return;
  queue(mediaBackfillRecords().map((media): SyncJob => ({ kind: "media", id: media.mediaId, media })));
  store.setItem(MEDIA_BACKFILL_KEY, new Date().toISOString());
}

/** Retries due entries when the browser comes back online and periodically. */
export function startBackgroundSync(): () => void {
  if (typeof window === "undefined") return () => {};
  void whenHydrated([useProfileStore, usePlansStore]).then(() => {
    backfillOnce();
    backfillMediaOnce();
  });
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
let cachedAccount: string | null = null;

function readStatus(): OutboxStatus {
  const raw = storage()?.getItem(STORAGE_KEY) ?? "[]";
  if (raw !== cachedRaw || cachedStatus.blockedByAuth !== blockedByAuth || cachedAccount !== signedInAccount) {
    cachedAccount = signedInAccount;
    cachedRaw = raw;
    let entries: OutboxEntry[] = [];
    try {
      entries = JSON.parse(raw) as OutboxEntry[];
    } catch {
      entries = [];
    }
    // Only what this account (or a guest) can upload: another account's
    // waiting changes aren't this person's problem.
    cachedStatus = {
      ...summarizeOutbox(entries.filter((entry) => belongsTo(entry, signedInAccount))),
      blockedByAuth,
    };
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

// Every change the stores announce (workouts archived, weigh-ins, profile,
// plans, deletes) is queued for upload.
onSyncEvent((event) => queue([jobForEvent(event, profileSnapshotNow)]));
