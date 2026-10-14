import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/lib/notifications";
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
  dataUrl: string;
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
  /** A locally-uploaded image as a data URL (capped at upload time). */
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
  setPresetAvatar: (presetId: string) => void;
  setUploadedAvatar: (dataUrl: string) => void;
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
  resetPreferences: () => void;
}

const SHOWCASE_LIMIT = 3;

export const useProfileStore = create<ProfileStoreState>()(
  persist(
    (set) => ({
      displayName: null,
      sex: null,
      birthYear: null,
      currentBuild: null,
      avatarPresetId: null,
      avatarDataUrl: null,
      heightCm: null,
      weightEntries: [],
      photos: [],
      showcaseAchievementIds: [],
      onboardingProfile: null,
      demoMode: false,
      preferences: DEFAULT_USER_PREFERENCES,
      notificationPreferences: DEFAULT_NOTIFICATION_PREFERENCES,
      setPresetAvatar: (presetId) =>
        set({ avatarPresetId: presetId, avatarDataUrl: null }),
      setUploadedAvatar: (dataUrl) =>
        set({ avatarDataUrl: dataUrl, avatarPresetId: null }),
      clearAvatar: () => set({ avatarPresetId: null, avatarDataUrl: null }),
      setHeight: (heightCm) => set({ heightCm }),
      logWeight: (weightKg, date) =>
        set((state) => ({
          weightEntries: [
            ...state.weightEntries.filter((entry) => entry.date !== date),
            { date, weightKg },
          ].sort((a, b) => a.date.localeCompare(b.date)),
        })),
      setAthleteDetails: (patch) => set(patch),
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
        set((state) => {
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
        set((state) => ({
          onboardingProfile: {
            ...state.onboardingProfile,
            ...data,
            completedAt: new Date().toISOString(),
          },
        })),
      setDemoMode: (enabled) => set({ demoMode: enabled }),
      updatePreferences: (patch) =>
        set((state) => ({
          preferences: {
            ...(state.preferences ?? DEFAULT_USER_PREFERENCES),
            ...patch,
          },
        })),
      updateNotificationPreferences: (patch) =>
        set((state) => ({
          notificationPreferences: {
            ...(state.notificationPreferences ?? DEFAULT_NOTIFICATION_PREFERENCES),
            ...patch,
          },
        })),
      resetPreferences: () => set({ preferences: DEFAULT_USER_PREFERENCES }),
    }),
    {
      name: "physiqx-profile",
      version: 2,
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
        return state as ProfileStoreState;
      },
      skipHydration: true,
    },
  ),
);
