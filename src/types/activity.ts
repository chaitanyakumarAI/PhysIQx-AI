/**
 * ActivityEvent — docs/DATA_MODELS.md "ActivityEvent". The "Live from your
 * circle" feed: append-only and generated, never authored by a user.
 * `occurredAt` is a real timestamp; relative text ("12m ago") is derived at
 * render time (see features/compete/lib/derive.ts), never stored.
 */
export type ActivityEventType =
  | "achievement-unlock"
  | "personal-record"
  | "challenge-join";

export interface ActivityEvent {
  id: string;
  actorName: string;
  type: ActivityEventType;
  /** e.g. "unlocked Consistency King", "hit a new PR on Deadlift · 220 kg" */
  description: string;
  occurredAt: string;
}
