"use client";

import { useSyncExternalStore } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCardioStore } from "@/store/cardioStore";
import { clearMedia } from "@/lib/media/mediaStore";
import { useNotificationStore } from "@/store/notificationStore";
import { usePlansStore } from "@/store/plansStore";
import { useProfileStore } from "@/store/profileStore";
import { useSessionStore } from "@/store/sessionStore";
import { pullLedgerChanges } from "./pullLedgerChanges";
import {
  hasMorePages,
  ledgerCursorsSchema,
  mergeLedger,
  nextCursors,
  profilePatch,
  type LedgerCursors,
  type LedgerPage,
} from "./restore";
import {
  deviceOwner,
  pendingUploadsFor,
  setDeviceOwner,
  setSignedInAccount,
  syncNow,
} from "./syncClient";
import { whenHydrated } from "./whenHydrated";

/**
 * Restore, the browser half: pulls what other devices recorded and merges it
 * into the stores (rules in restore.ts). Runs after sign-in, at app start
 * while signed in, on reconnect and when the app comes back into view — never
 * for guests or in sample-data mode. Writes go straight to the stores'
 * state, not through their actions, so nothing echoes back to the outbox.
 *
 * Accounts (owner decisions 2026-10-23, docs/SYNC_RESTORE_PLAN.md §6): the
 * device's local data belongs to one account. Guest data goes to the first
 * account that signs in. Signing in as someone else swaps the local data for
 * theirs — the previous account's waiting changes stay queued for them.
 * Signing out removes the account's data from the device.
 */

const CURSOR_PREFIX = "physiqx-sync-cursor:";
const LAST_PULL_PREFIX = "physiqx-sync-last-pull:";
const PAGE_SIZE = 100;
/** A runaway guard: 50 pages of 100 is years of training. */
const MAX_PAGES = 50;
/** Reconnects and tab switches pull at most this often. */
const MIN_PULL_GAP_MS = 60_000;

const STORES = [useSessionStore, useCardioStore, useProfileStore, usePlansStore];

export type PullOutcome = "restored" | "upToDate" | "skipped" | "unauthenticated" | "failed";

function storage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

// --- State for UI --------------------------------------------------------------

export interface SyncState {
  /** Signed-in account per the browser session; null = guest. */
  account: string | null;
  /** A full restore is running (first pull for this account on this device). */
  restoring: boolean;
  /** Any pull or "Sync now" is running. */
  syncing: boolean;
  /** When this account last pulled successfully on this device. */
  lastSyncedAt: string | null;
}

let state: SyncState = { account: null, restoring: false, syncing: false, lastSyncedAt: null };
const listeners = new Set<() => void>();

function update(patch: Partial<SyncState>): void {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

const GUEST_STATE: SyncState = { account: null, restoring: false, syncing: false, lastSyncedAt: null };

export function useSyncState(): SyncState {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
    () => GUEST_STATE,
  );
}

// --- Local data ----------------------------------------------------------------

function readCursors(store: Storage, userId: string): LedgerCursors | null {
  const raw = store.getItem(CURSOR_PREFIX + userId);
  if (raw === null) return null;
  try {
    // A corrupt cursor would fail every pull: start over (merges are idempotent).
    const parsed = ledgerCursorsSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/**
 * Empties the ledger stores on this device (account switch, sign-out). A
 * workout in progress is archived first, so its sets queue for the account
 * they belong to. Restore cursors go too: with nothing local, the next
 * restore must start from the beginning.
 */
export async function clearLocalData(): Promise<void> {
  await whenHydrated(STORES);
  if (useSessionStore.getState().session) useSessionStore.getState().abandonSession();
  useSessionStore.setState(useSessionStore.getInitialState(), true);
  useCardioStore.setState(useCardioStore.getInitialState(), true);
  useProfileStore.setState(useProfileStore.getInitialState(), true);
  usePlansStore.setState(usePlansStore.getInitialState(), true);
  // Read/dismissed notifications are per person too, and so are their images.
  useNotificationStore.setState(useNotificationStore.getInitialState(), true);
  await clearMedia().catch(() => undefined);
  const store = storage();
  if (!store) return;
  for (const key of Object.keys(store)) {
    if (key.startsWith(CURSOR_PREFIX) || key.startsWith(LAST_PULL_PREFIX)) store.removeItem(key);
  }
}

// --- Pull --------------------------------------------------------------------------

/** Merges one page into the stores; synchronous, so no write lands in between. */
function applyPage(page: LedgerPage, userId: string): number {
  const pending = new Set(pendingUploadsFor(userId).map((entry) => entry.key));
  const { history } = useSessionStore.getState();
  const { activities } = useCardioStore.getState();
  const profile = useProfileStore.getState();
  const { plans, activePlanId } = usePlansStore.getState();

  const merged = mergeLedger(
    { history, activities, weighIns: profile.weightEntries, plans },
    page,
    pending,
  );
  const patch = profilePatch(
    profile,
    activePlanId,
    new Set(merged.plans.map((plan) => plan.id)),
    page.profile,
    pending.has("profile:me"),
  );
  const profileChanges = Object.keys(patch.profile).length;

  if (merged.history !== history) useSessionStore.setState({ history: merged.history });
  if (merged.activities !== activities) useCardioStore.setState({ activities: merged.activities });
  if (merged.weighIns !== profile.weightEntries || profileChanges > 0) {
    useProfileStore.setState({ ...patch.profile, weightEntries: merged.weighIns });
  }
  // The active plan must still exist — a tombstone may have removed it.
  const wanted = patch.activePlanId ?? activePlanId;
  const nextActive =
    wanted && merged.plans.some((plan) => plan.id === wanted) ? wanted : (merged.plans[0]?.id ?? null);
  if (merged.plans !== plans || nextActive !== activePlanId) {
    usePlansStore.setState({ plans: merged.plans, activePlanId: nextActive });
  }
  return merged.changes + profileChanges + (nextActive !== activePlanId ? 1 : 0);
}

async function run(userId: string): Promise<PullOutcome> {
  if (!navigator.onLine) return "skipped";
  const store = storage();
  if (!store) return "skipped";
  await whenHydrated(STORES);
  if (useProfileStore.getState().demoMode) return "skipped";

  const owner = deviceOwner();
  if (owner && owner !== userId) {
    // Someone else's data is on this device: swap it for this account's.
    // (Clearing archives their workout in progress under their name first.)
    await clearLocalData();
    setDeviceOwner(userId);
  }
  let cursors = readCursors(store, userId);
  update({ restoring: cursors === null });

  let changes = 0;
  for (let pageIndex = 0; pageIndex < MAX_PAGES; pageIndex += 1) {
    const result = await pullLedgerChanges(cursors ?? {}, PAGE_SIZE);
    if (result.status === "unauthenticated") return "unauthenticated";
    if (result.status === "error") return "failed";
    if (result.userId !== userId) return "skipped"; // the session changed mid-pull
    // Data logged here as a guest is this account's now; so are its uploads.
    if (deviceOwner() !== userId) setDeviceOwner(userId);
    if (useProfileStore.getState().demoMode) return "skipped";

    // Another tab may have written since this one last read storage: merge
    // into the latest copy, or this write would drop that tab's changes.
    await Promise.all(STORES.map((persisted) => persisted.persist.rehydrate()));
    changes += applyPage(result.page, userId);
    cursors = nextCursors(cursors ?? {}, result.page);
    store.setItem(CURSOR_PREFIX + userId, JSON.stringify(cursors));
    if (!hasMorePages(result.page)) break;
  }
  const now = new Date().toISOString();
  store.setItem(LAST_PULL_PREFIX + userId, now);
  update({ lastSyncedAt: now });
  return changes > 0 ? "restored" : "upToDate";
}

let pulling: Promise<PullOutcome> | null = null;
let lastPullAt = 0;

/** Pulls and merges everything new for `userId`. One pull at a time. */
export function pullNow(userId: string): Promise<PullOutcome> {
  if (pulling) return pulling;
  update({ syncing: true });
  pulling = run(userId)
    .catch((error: unknown) => {
      console.error("[pull] failed:", error);
      return "failed" as const;
    })
    .finally(() => {
      pulling = null;
      lastPullAt = Date.now();
      update({ syncing: false, restoring: false });
    });
  return pulling;
}

/** Profile › Sync now: upload what's waiting, then pull. */
export async function syncAll(): Promise<PullOutcome> {
  if (!state.account) return "unauthenticated";
  update({ syncing: true });
  try {
    await syncNow({ force: true });
  } finally {
    update({ syncing: false });
  }
  return pullNow(state.account);
}

// --- Sign-out ------------------------------------------------------------------

/**
 * Uploads what this account still has waiting and reports how many changes
 * couldn't go (offline, server down). Zero means signing out loses nothing.
 */
export async function prepareSignOut(): Promise<number> {
  const account = state.account;
  if (!account) return 0;
  await syncNow({ force: true });
  return pendingUploadsFor(account).length;
}

/**
 * Signs out and removes the account's data from this device. Changes that
 * couldn't upload stay queued under the account and go up the next time it
 * signs in here.
 */
export async function signOutAndClear(): Promise<void> {
  await createClient().auth.signOut();
  await clearLocalData();
  setDeviceOwner(null);
}

// --- Triggers ------------------------------------------------------------------

/** Wires the triggers; returns a cleanup. */
export function startBackgroundPull(): () => void {
  if (typeof window === "undefined") return () => {};
  let supabase: ReturnType<typeof createClient>;
  try {
    supabase = createClient();
  } catch {
    return () => {}; // Supabase isn't configured: local-only.
  }

  const pull = (force = false) => {
    const userId = state.account;
    if (!userId || (!force && Date.now() - lastPullAt < MIN_PULL_GAP_MS)) return;
    void pullNow(userId);
  };

  // Fires at start (the stored session, read locally) and on every sign-in.
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    const userId = session?.user.id ?? null;
    if (userId === state.account) return;
    const store = storage();
    update({
      account: userId,
      lastSyncedAt: userId ? (store?.getItem(LAST_PULL_PREFIX + userId) ?? null) : null,
      // Show "Restoring…" from the first moment on a device that's never had this account.
      restoring: Boolean(userId && store && readCursors(store, userId) === null),
    });
    setSignedInAccount(userId);
    if (!userId) return;
    // Upload first (a guest's history becomes the account's), then restore.
    void syncNow({ force: true }).finally(() => pull(true));
  });

  const onOnline = () => pull();
  const onVisible = () => {
    if (document.visibilityState === "visible") pull();
  };
  window.addEventListener("online", onOnline);
  document.addEventListener("visibilitychange", onVisible);
  return () => {
    subscription.unsubscribe();
    window.removeEventListener("online", onOnline);
    document.removeEventListener("visibilitychange", onVisible);
  };
}
