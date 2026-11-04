import { z } from "zod";
import { onboardingSchema } from "@/features/onboarding/schemas";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/lib/notifications";
import { DEFAULT_PRIVACY_PREFERENCES } from "./privacy";
import { DEFAULT_USER_PREFERENCES, type useProfileStore } from "@/store/profileStore";

/**
 * Everything about the athlete that should follow them to a new device:
 * body details, onboarding answers, the active plan and settings. Sent whole
 * (the newest device's copy wins), so one outbox entry covers every edit.
 * Photos and uploaded avatars stay on the device for now (see
 * docs/SYNC_RESTORE_PLAN.md §5); demo mode is a per-device view.
 *
 * Bounds are sanity limits, looser than the forms': the server's job is to
 * reject garbage, and a value any screen accepts must never be refused here
 * (it would retry forever).
 */
const onboarding = onboardingSchema.shape;

export const profileSnapshotSchema = z
  .object({
    displayName: z.string().trim().min(1).max(60).nullable(),
    sex: onboarding.sex.unwrap().nullable(),
    birthYear: z.number().int().min(1900).max(2100).nullable(),
    heightCm: z.number().finite().min(50).max(300).nullable(),
    currentBuild: onboarding.currentBuild.unwrap().nullable(),
    onboarding: z
      .object({
        goal: onboarding.goal,
        experienceLevel: onboarding.experienceLevel,
        activeSplit: onboarding.activeSplit,
        sessionFrequency: onboarding.sessionFrequency,
        goalBodyShape: onboarding.goalBodyShape,
        trainingDaysPerWeek: z.number().int().min(1).max(7).optional(),
        completedAt: z.iso.datetime({ offset: true }).optional(),
      })
      .nullable(),
    activePlanId: z.string().min(1).max(200).nullable(),
    settings: z.object({
      preferences: z.object({
        trackRpe: z.boolean(),
        showGhostSuggestions: z.boolean(),
        autoRestTimer: z.boolean(),
        showMascots: z.boolean(),
        showAiInsights: z.boolean(),
        celebrationEffects: z.boolean(),
      }),
      notificationPreferences: z
        .record(z.string().min(1).max(60), z.boolean())
        .refine((prefs) => Object.keys(prefs).length <= 50, "Too many notification preferences"),
      showcaseAchievementIds: z.array(z.string().min(1).max(200)).max(3),
      avatarPresetId: z.string().min(1).max(60).nullable(),
      // An uploaded avatar's media id (its bytes sync as a media item).
      avatarMediaId: z.string().regex(/^avatar-\d+-[a-z0-9]+$/).nullable().optional(),
      // Optional: snapshots from before the Privacy switches were saved.
      privacyPreferences: z
        .record(z.string().min(1).max(60), z.boolean())
        .refine((prefs) => Object.keys(prefs).length <= 20, "Too many privacy preferences")
        .optional(),
    }),
    /** When this device last changed any of it — newer wins. */
    updatedAt: z.iso.datetime({ offset: true }),
  })
  .strict();

export type ProfileSnapshot = z.infer<typeof profileSnapshotSchema>;

export type ProfileState = ReturnType<typeof useProfileStore.getState>;

export function buildProfileSnapshot(
  profile: ProfileState,
  activePlanId: string | null,
  updatedAt: string,
): ProfileSnapshot {
  return {
    displayName: profile.displayName?.trim() || null,
    sex: profile.sex,
    birthYear: profile.birthYear,
    heightCm: profile.heightCm,
    currentBuild: profile.currentBuild,
    onboarding: profile.onboardingProfile ? { ...profile.onboardingProfile } : null,
    activePlanId,
    settings: {
      // Older persisted states can miss newer keys: fill from the defaults.
      preferences: { ...DEFAULT_USER_PREFERENCES, ...profile.preferences },
      notificationPreferences: {
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        ...profile.notificationPreferences,
      },
      showcaseAchievementIds: profile.showcaseAchievementIds.slice(-3),
      avatarPresetId: profile.avatarPresetId,
      privacyPreferences: { ...DEFAULT_PRIVACY_PREFERENCES, ...profile.privacyPreferences },
      avatarMediaId: profile.avatarMediaId ?? null,
    },
    updatedAt,
  };
}

/** A `profiles` update for one snapshot. */
export interface ProfileRow {
  name?: string;
  sex?: string;
  birth_year?: number;
  height_cm?: number;
  current_build?: string;
  goal?: string;
  experience_level?: string;
  active_split?: string;
  session_frequency?: string;
  goal_body_shape?: string;
  training_days_per_week?: number;
  onboarding_completed_at?: string;
  active_plan_ref?: string;
  settings: ProfileSnapshot["settings"];
  /** Always UTC ("…Z"), so it compares and filters cleanly. */
  client_updated_at: string;
}

/**
 * Maps a snapshot to a `profiles` update. Unset values are left out rather
 * than written as null: a device that hasn't been told something (a new
 * phone before its first restore) must never erase what another device
 * knows. Settings always travel whole.
 */
export function toProfileRow(snapshot: ProfileSnapshot): ProfileRow {
  const row: ProfileRow = {
    settings: snapshot.settings,
    client_updated_at: new Date(snapshot.updatedAt).toISOString(),
  };
  const set = <K extends keyof ProfileRow>(key: K, value: ProfileRow[K] | null | undefined) => {
    if (value !== null && value !== undefined) row[key] = value;
  };
  set("name", snapshot.displayName);
  set("sex", snapshot.sex);
  set("birth_year", snapshot.birthYear);
  set("height_cm", snapshot.heightCm);
  set("current_build", snapshot.currentBuild);
  set("active_plan_ref", snapshot.activePlanId);
  const onboardingAnswers = snapshot.onboarding;
  if (onboardingAnswers) {
    set("goal", onboardingAnswers.goal);
    set("experience_level", onboardingAnswers.experienceLevel);
    set("active_split", onboardingAnswers.activeSplit);
    set("session_frequency", onboardingAnswers.sessionFrequency);
    set("goal_body_shape", onboardingAnswers.goalBodyShape);
    set("training_days_per_week", onboardingAnswers.trainingDaysPerWeek);
    set("onboarding_completed_at", onboardingAnswers.completedAt);
  }
  return row;
}
