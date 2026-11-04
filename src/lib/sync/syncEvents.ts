import type { MediaRecord } from "@/features/profile/lib/mediaRecord";
import type { WeighIn } from "@/types/ledger";
import type { UserPlan } from "@/types/plan";
import type { CompletedSessionSummary, WorkoutSession } from "@/types/workoutSession";

/**
 * What the stores tell the sync client about the athlete's own changes. The
 * stores emit only on user actions — never on rehydration or a restore — so
 * nothing echoes back to the server. The sync client subscribes and queues
 * the upload. This indirection keeps the stores free of server-action
 * imports, so they stay usable in tests and on the server.
 */
export type SyncEvent =
  /** A workout left the active state with work in it (finished, abandoned, or replaced). */
  | { type: "workoutArchived"; session: WorkoutSession; summary: CompletedSessionSummary }
  | { type: "weighInLogged"; weighIn: WeighIn }
  /** Body details, onboarding answers, settings or the active plan changed. */
  | { type: "profileChanged" }
  | { type: "planSaved"; plan: UserPlan }
  | { type: "planDeleted"; planId: string }
  | { type: "cardioRemoved"; activityId: string }
  /** An image to back up (the avatar, or a photo when photo backup is on). */
  | { type: "mediaSaved"; media: MediaRecord }
  | { type: "mediaDeleted"; mediaId: string };

type SyncEventHandler = (event: SyncEvent) => void;

let handler: SyncEventHandler | null = null;

export function onSyncEvent(next: SyncEventHandler | null): void {
  handler = next;
}

export function emitSyncEvent(event: SyncEvent): void {
  handler?.(event);
}
