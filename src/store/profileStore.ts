import { create } from "zustand";
import { persist } from "zustand/middleware";

/** One dated weight entry — ISO date (yyyy-mm-dd), kg. */
export interface WeightEntry {
  date: string;
  weightKg: number;
}

/**
 * User-adjustable profile data — avatar plus body stats (height, dated
 * weight log). The second persisted store after sessionStore, following its
 * exact SSR contract: `skipHydration` + explicit rehydration from
 * StoreHydrator so the client's first render always matches the server's.
 * The mock Profile fixture stays the identity source of truth; this store
 * only overrides what the user has personally customized.
 */
export interface OnboardingProfileData {
  goal?: string;
  experienceLevel?: string;
  activeSplit?: string;
  sessionFrequency?: string;
  goalBodyShape?: string;
  trainingDaysPerWeek?: number;
  completedAt?: string;
}

interface ProfileStoreState {
  /** One of AVATAR_PRESETS' ids, or null when unset/uploaded. */
  avatarPresetId: string | null;
  /** A locally-uploaded image as a data URL (capped at upload time). */
  avatarDataUrl: string | null;
  /** null until the user sets it — the UI falls back to the seed fixture. */
  heightCm: number | null;
  /** User-logged weights, one per date (logging twice a day overwrites). */
  weightEntries: WeightEntry[];
  /**
   * The up-to-3 achievements showcased on Profile. Empty = default (first
   * unlocked ones). Selecting a 4th replaces the oldest pick.
   */
  showcaseAchievementIds: string[];
  /** Saved onboarding selections. */
  onboardingProfile: OnboardingProfileData | null;
  setPresetAvatar: (presetId: string) => void;
  setUploadedAvatar: (dataUrl: string) => void;
  clearAvatar: () => void;
  setHeight: (heightCm: number) => void;
  logWeight: (weightKg: number, date: string) => void;
  toggleShowcaseAchievement: (id: string) => void;
  setOnboardingProfile: (data: Partial<OnboardingProfileData>) => void;
}

const SHOWCASE_LIMIT = 3;

export const useProfileStore = create<ProfileStoreState>()(
  persist(
    (set) => ({
      avatarPresetId: null,
      avatarDataUrl: null,
      heightCm: null,
      weightEntries: [],
      showcaseAchievementIds: [],
      onboardingProfile: null,
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
    }),
    {
      name: "physiqx-profile",
      skipHydration: true,
    },
  ),
);
