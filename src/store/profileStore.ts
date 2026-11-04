import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_PRIVACY_PREFERENCES } from "@/features/profile/lib/privacy";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/lib/notifications";
import { emitSyncEvent } from "@/lib/sync/syncEvents";
import type { BodyBuild, Sex, WeighIn } from "@/types/ledger";
import type {
  ExperienceLevel,
  GoalBodyShape,
  ProfileGoal,
  SessionFrequency,
} from "@/types/profile";
import type { ProgramType } from "@/types/training";

/** One dated weight entry — local calendar day (yyyy-mm-dd), kg. */
export type WeightEntry = WeighIn;

export interface ProgressPhotoEntry {
  id: string;
  date: string;
  angle: "front" | "side" | "back";
  weightKg?: number;
  notes?: string;
  /** The image in the media store (lib/media); absent = no image, the
   *  angle's silhouette shows instead. */
  mediaId?: string;
  /** Legacy (before IndexedDB): the image inline. Moved to the media store
   *  once after hydration (features/profile/lib/media). */
  dataUrl?: string;
}

/** Ids of the placeholder photos earlier builds wrote into user data. */
const LEGACY_SEED_PHOTO_PREFIX = "photo-seed-";

/** What onboarding asks about training. */
export interface OnboardingProfileData {
  goal?: ProfileGoal;
  experienceLevel?: ExperienceLevel;
  activeSplit?: ProgramType;
  sessionFrequency?: SessionFrequency;
  goalBodyShape?: GoalBodyShape;
  trainingDaysPerWeek?: number;
  completedAt?: string;
}

/** Who the athlete is — asked once ("About you"), editable in Profile. */
export interface AthleteDetails {
  displayName: string | null;
  sex: Sex | null;
  birthYear: number | null;
  /** The silhouette the athlete picked as closest to them today. */
  currentBuild: BodyBuild | null;
}

export interface UserPreferences {
  /** Log Rate of Perceived Exertion (1–10) per set. Off by default for cleaner, faster set rows. */
  trackRpe: boolean;
  /** Ghost-fill suggested weight and reps from previous sessions as placeholder hints. */
  showGhostSuggestions: boolean;
  /** Automatically start the rest countdown timer when a set is marked complete. */
  autoRestTimer: boolean;
  /** Kept for persisted-state compatibility; mascots are hidden app-wide. */
  showMascots: boolean;
  /** Display rule-based coach insight cards (from logged data) on Home and Insights. */
  showAiInsights: boolean;
  /** Particle confetti and celebration modal animations on achievements or finished workouts. */
  celebrationEffects: boolean;
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  trackRpe: false,
  showGhostSuggestions: true,
  autoRestTimer: true,
  showMascots: true,
  showAiInsights: true,
  celebrationEffects: true,
};

/**
 * The athlete's own data — identity, body stats, onboarding answers,
 * preferences. Part of the local-first ledger (see features/shared/hooks/
 * useLedger): nothing here falls back to a fixture identity; unset is null.
 * Same SSR contract as every persisted store: `skipHydration` + explicit
 * rehydration from StoreHydrator.
 */
interface ProfileStoreState extends AthleteDetails {
  /** One of AVATAR_PRESETS' ids, or null when unset/uploaded. */
  avatarPresetId: string | null;
  /** An uploaded avatar in the media store (lib/media), or null. */
  avatarMediaId: string | null;
  /** Legacy (before IndexedDB): an uploaded avatar inline; moved once. */
  avatarDataUrl: string | null;
  heightCm: number | null;
  /** User-logged weights, one per date (logging twice a day overwrites). */
  weightEntries: WeightEntry[];
  photos: ProgressPhotoEntry[];
  /**
   * The up-to-3 achievements showcased on Profile. Empty = default (first
   * unlocked ones). Selecting a 4th replaces the oldest pick.
   */
  showcaseAchievementIds: string[];
  /** Saved onboarding selections. */
  onboardingProfile: OnboardingProfileData | null;
  /** Explore the app on generated sample data (never mixed into real data). */
  demoMode: boolean;
  /** User preferences for logging, commentary, and visual noise. */
  preferences: UserPreferences;
  /** User notification preferences (streak risk, mission reminders, challenge results, etc.). */
  notificationPreferences: Record<string, boolean>;
  /** Profile › Privacy switches (features/profile/lib/privacy). */
  privacyPreferences: Record<string, boolean>;
  setPresetAvatar: (presetId: string) => void;
  setUploadedAvatar: (mediaId: string) => void;
  clearAvatar: () => void;
  setHeight: (heightCm: number) => void;
  logWeight: (weightKg: number, date: string) => void;
  setAthleteDetails: (patch: Partial<AthleteDetails>) => void;
  addPhoto: (entry: Omit<ProgressPhotoEntry, "id">) => void;
  deletePhoto: (id: string) => void;
  toggleShowcaseAchievement: (id: string) => void;
  setOnboardingProfile: (data: Partial<OnboardingProfileData>) => void;
  setDemoMode: (enabled: boolean) => void;
  updatePreferences: (patch: Partial<UserPreferences>) => void;
  updateNotificationPreferences: (patch: Record<string, boolean>) => void;
  updatePrivacyPreferences: (patch: Record<string, boolean>) => void;
  resetPreferences: () => void;
}

const SHOWCASE_LIMIT = 3;

export const useProfileStore = create<ProfileStoreState>()(
  persist(
    (set) => {
      /** Writes a field that syncs (see lib/sync/profileSnapshot) and announces it. */
      const changeProfile = (
        partial: Partial<ProfileStoreState> | ((state: ProfileStoreState) => Partial<ProfileStoreState>),
      ) => {
        set(partial);
        emitSyncEvent({ type: "profileChanged" });
      };
      return {
        displayName: null,
        sex: null,
        birthYear: null,
        currentBuild: null,
        avatarPresetId: null,
        avatarMediaId: null,
        avatarDataUrl: null,
        heightCm: null,
        weightEntries: [],
        photos: [],
        showcaseAchievementIds: [],
        onboardingProfile: null,
        demoMode: false,
        preferences: DEFAULT_USER_PREFERENCES,
        notificationPreferences: DEFAULT_NOTIFICATION_PREFERENCES,
        privacyPreferences: DEFAULT_PRIVACY_PREFERENCES,
        setPresetAvatar: (presetId) =>
          changeProfile({ avatarPresetId: presetId, avatarMediaId: null, avatarDataUrl: null }),
        setUploadedAvatar: (mediaId) =>
          changeProfile({ avatarMediaId: mediaId, avatarDataUrl: null, avatarPresetId: null }),
        clearAvatar: () =>
          changeProfile({ avatarPresetId: null, avatarMediaId: null, avatarDataUrl: null }),
        setHeight: (heightCm) => changeProfile({ heightCm }),
        logWeight: (weightKg, date) => {
          set((state) => ({
            weightEntries: [
              ...state.weightEntries.filter((entry) => entry.date !== date),
              { date, weightKg },
            ].sort((a, b) => a.date.localeCompare(b.date)),
          }));
          emitSyncEvent({ type: "weighInLogged", weighIn: { date, weightKg } });
        },
        setAthleteDetails: (patch) => changeProfile(patch),
        addPhoto: (entry) =>
          set((state) => ({
            photos: [
              {
                ...entry,
                id: "photo-" + Date.now(),
              },
              ...state.photos,
            ],
          })),
        deletePhoto: (id) =>
          set((state) => ({
            photos: state.photos.filter((p) => p.id !== id),
          })),
        toggleShowcaseAchievement: (id) =>
          changeProfile((state) => {
            if (state.showcaseAchievementIds.includes(id)) {
              return {
                showcaseAchievementIds: state.showcaseAchievementIds.filter(
                  (selected) => selected !== id,
                ),
              };
            }
            // At the limit, the oldest pick rotates out.
            return {
              showcaseAchievementIds: [
                ...state.showcaseAchievementIds,
                id,
              ].slice(-SHOWCASE_LIMIT),
            };
          }),
        setOnboardingProfile: (data) =>
          changeProfile((state) => ({
            onboardingProfile: {
              ...state.onboardingProfile,
              ...data,
              completedAt: new Date().toISOString(),
            },
          })),
        setDemoMode: (enabled) => set({ demoMode: enabled }),
        updatePreferences: (patch) =>
          changeProfile((state) => ({
            preferences: {
              ...(state.preferences ?? DEFAULT_USER_PREFERENCES),
              ...patch,
            },
          })),
        updatePrivacyPreferences: (patch) =>
          changeProfile((state) => ({
            privacyPreferences: { ...DEFAULT_PRIVACY_PREFERENCES, ...state.privacyPreferences, ...patch },
          })),
        updateNotificationPreferences: (patch) =>
          changeProfile((state) => ({
            notificationPreferences: {
              ...(state.notificationPreferences ?? DEFAULT_NOTIFICATION_PREFERENCES),
              ...patch,
            },
          })),
        resetPreferences: () => changeProfile({ preferences: DEFAULT_USER_PREFERENCES }),
      };
    },
    {
      name: "physiqx-profile",
      version: 4,
      migrate: (persisted, version) => {
        const state = persisted as Partial<ProfileStoreState>;
        // v0 → v1: drop the placeholder progress photos earlier builds seeded
        // into the user's own data (they were being exported as theirs).
        if (version < 1 && Array.isArray(state.photos)) {
          state.photos = state.photos.filter(
            (photo) => !photo.id.startsWith(LEGACY_SEED_PHOTO_PREFIX),
          );
        }
        // v1 → v2: athlete details and demo mode didn't exist yet.
        if (version < 2) {
          state.displayName ??= null;
          state.sex ??= null;
          state.birthYear ??= null;
          state.currentBuild ??= null;
          state.demoMode ??= false;
        }
        // v2 → v3: Privacy switches were component state, never saved.
        if (version < 3) state.privacyPreferences ??= DEFAULT_PRIVACY_PREFERENCES;
        // v3 → v4: images moved to IndexedDB; the data URLs move after hydration.
        if (version < 4) state.avatarMediaId ??= null;
        return state as ProfileStoreState;
      },
      skipHydration: true,
    },
  ),
);
