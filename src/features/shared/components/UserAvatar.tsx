"use client";

import { Avatar, type AvatarProps } from "@/components/ui/Avatar";
import { findAvatarPreset } from "@/features/profile/lib/avatarPresets";
import { useProfileStore } from "@/store/profileStore";

export type UserAvatarProps = Omit<AvatarProps, "src" | "variant">;

/**
 * The current user's avatar, wherever it appears (Home header, Profile
 * card). Reads the persisted customization: an uploaded image wins, then a
 * chosen preset gradient, then the default brand gradient — so every
 * surface updates the moment the user picks a new look, with no prop
 * threading. Other people's avatars keep using plain <Avatar>.
 */
export function UserAvatar({ className, ...props }: UserAvatarProps) {
  const avatarPresetId = useProfileStore((state) => state.avatarPresetId);
  const avatarDataUrl = useProfileStore((state) => state.avatarDataUrl);
  const preset = findAvatarPreset(avatarPresetId);

  return (
    <Avatar
      {...props}
      variant="brand"
      src={avatarDataUrl ?? undefined}
      // cn inside Avatar merges these after the variant classes, so a
      // preset's gradient cleanly overrides the brand default.
      className={preset ? `${preset.className} ${className ?? ""}` : className}
    />
  );
}
