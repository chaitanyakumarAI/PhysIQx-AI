import type { CompletedSessionSummary, WorkoutSession } from "@/types/workoutSession";

/**
 * Fired by sessionStore whenever a workout leaves the active state with work
 * in it (finished, abandoned, or replaced by a new session). The sync client
 * subscribes and queues the upload. This indirection keeps the store free of
 * server-action imports, so it stays usable in tests and on the server.
 */
type ArchiveHandler = (session: WorkoutSession, summary: CompletedSessionSummary) => void;

let handler: ArchiveHandler | null = null;

export function onWorkoutArchived(next: ArchiveHandler | null): void {
  handler = next;
}

export function emitWorkoutArchived(session: WorkoutSession, summary: CompletedSessionSummary): void {
  handler?.(session, summary);
}
