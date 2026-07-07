import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * User-adjustable profile presentation — currently just the avatar. The
 * second persisted store after sessionStore, following its exact SSR
 * contract: `skipHydration` + explicit rehydration from StoreHydrator so
 * the client's first render always matches the server's. The mock Profile
 * fixture stays the identity source of truth; this store only overrides
 * what the user has personally customized.
 */
interface ProfileStoreState {
  /** One of AVATAR_PRESETS' ids, or null when unset/uploaded. */
  avatarPresetId: string | null;
  /** A locally-uploaded image as a data URL (capped at upload time). */
  avatarDataUrl: string | null;
  setPresetAvatar: (presetId: string) => void;
  setUploadedAvatar: (dataUrl: string) => void;
  clearAvatar: () => void;
}

export const useProfileStore = create<ProfileStoreState>()(
  persist(
    (set) => ({
      avatarPresetId: null,
      avatarDataUrl: null,
      setPresetAvatar: (presetId) =>
        set({ avatarPresetId: presetId, avatarDataUrl: null }),
      setUploadedAvatar: (dataUrl) =>
        set({ avatarDataUrl: dataUrl, avatarPresetId: null }),
      clearAvatar: () => set({ avatarPresetId: null, avatarDataUrl: null }),
    }),
    {
      name: "physiqx-profile",
      skipHydration: true,
    },
  ),
);
