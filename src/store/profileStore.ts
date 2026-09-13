import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/lib/notifications";

/** One dated weight entry — ISO date (yyyy-mm-dd), kg. */
export interface WeightEntry {
  date: string;
  weightKg: number;
}

export interface ProgressPhotoEntry {
  id: string;
  date: string;
  angle: "front" | "side" | "back";
  weightKg?: number;
  notes?: string;
  dataUrl: string;
}

export const SEED_PROGRESS_PHOTOS: ProgressPhotoEntry[] = [
  {
    id: "photo-seed-1",
    date: new Date(Date.now() - 45 * 86400000).toISOString().split("T")[0]!,
    angle: "front",
    weightKg: 82.5,
    notes: "Baseline check-in. Starting new Hypertrophy wave.",
    dataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500' fill='%23121214'><rect width='400' height='500' rx='16' fill='%2318181b'/><circle cx='200' cy='130' r='45' fill='%2327272a'/><path d='M130,220 C130,170 270,170 270,220 L280,360 C280,380 250,390 200,390 C150,390 120,380 120,360 Z' fill='%2327272a'/><text x='200' y='450' fill='%2371717a' font-family='sans-serif' font-size='14' text-anchor='middle'>Week 0 · Baseline (Front)</text></svg>",
  },
  {
    id: "photo-seed-2",
    date: new Date(Date.now() - 21 * 86400000).toISOString().split("T")[0]!,
    angle: "side",
    weightKg: 80.8,
    notes: "Mid-phase progress. Posture and shoulder separation improving.",
    dataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500' fill='%23121214'><rect width='400' height='500' rx='16' fill='%2318181b'/><circle cx='200' cy='130' r='45' fill='%2327272a'/><path d='M160,220 C160,170 250,170 250,220 L240,360 C240,380 220,390 190,390 C160,390 150,380 150,360 Z' fill='%2327272a'/><text x='200' y='450' fill='%2371717a' font-family='sans-serif' font-size='14' text-anchor='middle'>Week 4 · Check-in (Side)</text></svg>",
  },
  {
    id: "photo-seed-3",
    date: new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0]!,
    angle: "front",
    weightKg: 79.2,
    notes: "Current state. Noticeable core definition and vascularity.",
    dataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500' fill='%23121214'><rect width='400' height='500' rx='16' fill='%2318181b'/><circle cx='200' cy='130' r='45' fill='%2310b981' fill-opacity='0.25' stroke='%2310b981' stroke-width='2'/><path d='M125,215 C125,165 275,165 275,215 L285,360 C285,380 250,395 200,395 C150,395 115,380 115,360 Z' fill='%2310b981' fill-opacity='0.2' stroke='%2310b981' stroke-width='2'/><text x='200' y='450' fill='%2310b981' font-family='sans-serif' font-size='14' font-weight='bold' text-anchor='middle'>Week 7 · Current (Front)</text></svg>",
  },
];


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

export interface UserPreferences {
  /** Log Rate of Perceived Exertion (1–10) per set. Off by default for cleaner, faster set rows. */
  trackRpe: boolean;
  /** Ghost-fill suggested weight and reps from previous sessions as placeholder hints. */
  showGhostSuggestions: boolean;
  /** Automatically start the rest countdown timer when a set is marked complete. */
  autoRestTimer: boolean;
  /** Display Kix and Nyra mascot illustrations and coaching commentary across the app. */
  showMascots: boolean;
  /** Display AI-generated coach insight cards on Home and Insights. */
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

interface ProfileStoreState {
  /** One of AVATAR_PRESETS' ids, or null when unset/uploaded. */
  avatarPresetId: string | null;
  /** A locally-uploaded image as a data URL (capped at upload time). */
  avatarDataUrl: string | null;
  /** null until the user sets it — the UI falls back to the seed fixture. */
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
  /** User preferences for logging, commentary, and visual noise. */
  preferences: UserPreferences;
  /** User notification preferences (streak risk, mission reminders, challenge results, etc.). */
  notificationPreferences: Record<string, boolean>;
  setPresetAvatar: (presetId: string) => void;
  setUploadedAvatar: (dataUrl: string) => void;
  clearAvatar: () => void;
  setHeight: (heightCm: number) => void;
  logWeight: (weightKg: number, date: string) => void;
  addPhoto: (entry: Omit<ProgressPhotoEntry, "id">) => void;
  deletePhoto: (id: string) => void;
  toggleShowcaseAchievement: (id: string) => void;
  setOnboardingProfile: (data: Partial<OnboardingProfileData>) => void;
  updatePreferences: (patch: Partial<UserPreferences>) => void;
  updateNotificationPreferences: (patch: Record<string, boolean>) => void;
  resetPreferences: () => void;
}

const SHOWCASE_LIMIT = 3;

export const useProfileStore = create<ProfileStoreState>()(
  persist(
    (set) => ({
      avatarPresetId: null,
      avatarDataUrl: null,
      heightCm: null,
      weightEntries: [],
      photos: SEED_PROGRESS_PHOTOS,
      showcaseAchievementIds: [],
      onboardingProfile: null,
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
      skipHydration: true,
    },
  ),
);
