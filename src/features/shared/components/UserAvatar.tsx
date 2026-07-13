"use client";

import { Avatar, type AvatarProps } from "@/components/ui/Avatar";
import {
  DEFAULT_AVATAR_PRESET,
  findAvatarPreset,
} from "@/features/profile/lib/avatarPresets";
import { useProfileStore } from "@/store/profileStore";

export type UserAvatarProps = Omit<AvatarProps, "src" | "variant">;

/**
 * The current user's avatar, wherever it appears (Home header, Profile
 * card). Reads the persisted customization: an uploaded image wins, then a
 * chosen preset portrait, then the default preset — never the bare
 * initials circle (a letter is a weak hero for the profile card) — so
 * every surface updates the moment the user picks a new look, with no
 * prop threading. Other people's avatars keep using plain <Avatar>.
 */
export function UserAvatar(props: UserAvatarProps) {
  const avatarPresetId = useProfileStore((state) => state.avatarPresetId);
  const avatarDataUrl = useProfileStore((state) => state.avatarDataUrl);
  const preset = findAvatarPreset(avatarPresetId) ?? DEFAULT_AVATAR_PRESET;

  return <Avatar {...props} variant="brand" src={avatarDataUrl ?? preset.src} />;
}
