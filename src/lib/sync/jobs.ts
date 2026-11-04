import {
  buildProfileSnapshot,
  type ProfileSnapshot,
  type ProfileState,
} from "@/features/profile/lib/profileSnapshot";
import type { UserPlan } from "@/types/plan";
import type { SyncJob } from "./outbox";
import type { SyncEvent } from "./syncEvents";

/**
 * Pure mapping from what happened on the device to what the outbox sends.
 * The profile is read at queue time (`snapshot`), so the job carries every
 * edit up to that moment.
 */
export function jobForEvent(event: SyncEvent, snapshot: () => ProfileSnapshot): SyncJob {
  switch (event.type) {
    case "workoutArchived":
      return { kind: "workout", id: event.summary.id, session: event.session, summary: event.summary };
    case "weighInLogged":
      return { kind: "weighIn", id: event.weighIn.date, weighIn: event.weighIn };
    case "profileChanged":
      return { kind: "profile", id: "me", profile: snapshot() };
    case "planSaved":
      return { kind: "plan", id: event.plan.id, plan: event.plan };
    case "planDeleted":
      return { kind: "planDelete", id: event.planId };
    case "cardioRemoved":
      return { kind: "cardioDelete", id: event.activityId };
    case "mediaSaved":
      return { kind: "media", id: event.media.mediaId, media: event.media };
    case "mediaDeleted":
      return { kind: "mediaDelete", id: event.mediaId };
  }
}

/** Dated before any real edit, so a backfilled profile never beats a newer device's. */
const UNKNOWN_EDIT_TIME = "1970-01-01T00:00:00.000Z";

export interface BackfillInput {
  profile: ProfileState;
  plans: UserPlan[];
  activePlanId: string | null;
}

/**
 * The one-time upload of what was recorded before weigh-ins, plans and the
 * profile synced. Workouts and cardio were already queued as they happened.
 * A profile nobody filled in is skipped: defaults must not overwrite an
 * account's settings the day this device signs in to it.
 */
export function backfillJobs({ profile, plans, activePlanId }: BackfillInput): SyncJob[] {
  const jobs: SyncJob[] = [
    ...profile.weightEntries.map((weighIn): SyncJob => ({ kind: "weighIn", id: weighIn.date, weighIn })),
    ...plans.map((plan): SyncJob => ({ kind: "plan", id: plan.id, plan })),
  ];
  const told =
    profile.onboardingProfile !== null ||
    profile.displayName !== null ||
    profile.sex !== null ||
    profile.birthYear !== null ||
    profile.heightCm !== null ||
    profile.currentBuild !== null ||
    profile.avatarPresetId !== null ||
    profile.showcaseAchievementIds.length > 0 ||
    activePlanId !== null;
  if (told) {
    const updatedAt = profile.onboardingProfile?.completedAt ?? UNKNOWN_EDIT_TIME;
    jobs.push({ kind: "profile", id: "me", profile: buildProfileSnapshot(profile, activePlanId, updatedAt) });
  }
  return jobs;
}
