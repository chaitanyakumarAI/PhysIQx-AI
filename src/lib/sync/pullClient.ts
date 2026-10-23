"use client";

import { createClient } from "@/lib/supabase/client";
import { useCardioStore } from "@/store/cardioStore";
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
import { loadOutbox, syncNow } from "./syncClient";
import { whenHydrated } from "./whenHydrated";

/**
 * Restore, the browser half: pulls what other devices recorded and merges it
 * into the stores (rules in restore.ts). Runs after sign-in, at app start
 * while signed in, on reconnect and when the app comes back into view — never
 * for guests or in sample-data mode. Writes go straight to the stores'
 * state, not through their actions, so nothing echoes back to the outbox.
 */

/** The account this device's data belongs to — set by its first restore. */
const OWNER_KEY = "physiqx-sync-owner";
const cursorKey = (userId: string) => `physiqx-sync-cursor:${userId}`;
const PAGE_SIZE = 100;
/** A runaway guard: 50 pages of 100 is years of training. */
const MAX_PAGES = 50;
/** Reconnects and tab switches pull at most this often. */
const MIN_PULL_GAP_MS = 60_000;

const STORES = [useSessionStore, useCardioStore, useProfileStore, usePlansStore];

export type PullOutcome =
  | "restored"
  | "upToDate"
  | "skipped"
  /** Signed in as someone other than this device's owner (Phase D decides what happens). */
  | "otherAccount"
  | "unauthenticated"
  | "failed";

function storage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

/** A corrupt cursor would fail every pull: start over (merges are idempotent). */
function readCursors(store: Storage, userId: string): LedgerCursors {
  try {
    const parsed = ledgerCursorsSchema.safeParse(JSON.parse(store.getItem(cursorKey(userId)) ?? "{}"));
    return parsed.success ? parsed.data : {};
  } catch {
    return {};
  }
}

/** Merges one page into the stores; synchronous, so no write lands in between. */
function applyPage(page: LedgerPage): number {
  const pending = new Set(loadOutbox().map((entry) => entry.key));
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
  const owner = store.getItem(OWNER_KEY);
  if (owner && owner !== userId) return "otherAccount";

  let cursors = readCursors(store, userId);
  let changes = 0;
  for (let pageIndex = 0; pageIndex < MAX_PAGES; pageIndex += 1) {
    const result = await pullLedgerChanges(cursors, PAGE_SIZE);
    if (result.status === "unauthenticated") return "unauthenticated";
    if (result.status === "error") return "failed";
    if (result.userId !== userId) return "otherAccount";
    // What was logged here before this account first signed in is theirs
    // now (owner decision 2026-10-23) — the outbox uploads it.
    if (!store.getItem(OWNER_KEY)) store.setItem(OWNER_KEY, userId);
    if (useProfileStore.getState().demoMode) return "skipped";

    // Another tab may have written since this one last read storage: merge
    // into the latest copy, or this write would drop that tab's changes.
    await Promise.all(STORES.map((persisted) => persisted.persist.rehydrate()));
    changes += applyPage(result.page);
    cursors = nextCursors(cursors, result.page);
    store.setItem(cursorKey(userId), JSON.stringify(cursors));
    if (!hasMorePages(result.page)) break;
  }
  return changes > 0 ? "restored" : "upToDate";
}

let pulling: Promise<PullOutcome> | null = null;
let lastPullAt = 0;

/** Pulls and merges everything new for `userId`. One pull at a time. */
export function pullNow(userId: string): Promise<PullOutcome> {
  if (pulling) return pulling;
  pulling = run(userId)
    .catch((error: unknown) => {
      console.error("[pull] failed:", error);
      return "failed" as const;
    })
    .finally(() => {
      pulling = null;
      lastPullAt = Date.now();
    });
  return pulling;
}

/** Wires the triggers; returns a cleanup. */
export function startBackgroundPull(): () => void {
  if (typeof window === "undefined") return () => {};
  let supabase: ReturnType<typeof createClient>;
  try {
    supabase = createClient();
  } catch {
    return () => {}; // Supabase isn't configured: local-only.
  }

  let userId: string | null = null;
  const pull = (force = false) => {
    if (!userId || (!force && Date.now() - lastPullAt < MIN_PULL_GAP_MS)) return;
    void pullNow(userId);
  };

  // Fires at start (the stored session, read locally) and on every sign-in.
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    const previous = userId;
    userId = session?.user.id ?? null;
    if (!userId || userId === previous) return;
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
