"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { SettingsPageHeader } from "@/features/profile/components/SettingsPageHeader";
import { UserAvatar } from "@/features/shared/components/UserAvatar";
import { AVATAR_PRESETS } from "@/features/profile/lib/avatarPresets";
import { mockProfile } from "@/data/profile";
import { useProfileStore } from "@/store/profileStore";

/** Uploads above this size would bloat localStorage — data URLs live there. */
const MAX_UPLOAD_BYTES = 200 * 1024;

export function AvatarContent() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const avatarPresetId = useProfileStore((state) => state.avatarPresetId);
  const avatarDataUrl = useProfileStore((state) => state.avatarDataUrl);
  const setPresetAvatar = useProfileStore((state) => state.setPresetAvatar);
  const setUploadedAvatar = useProfileStore((state) => state.setUploadedAvatar);

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError("That image is over 200KB — pick a smaller one.");
      return;
    }
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setUploadedAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <PageContainer>
      <SettingsPageHeader title="Avatar" />

      <div className="flex justify-center">
        <UserAvatar name={mockProfile.displayName} size="xl" />
      </div>

      <Section title="Pick a look">
        <Card padding="md">
          <div role="group" aria-label="Preset avatars" className="grid grid-cols-4 gap-3">
            {AVATAR_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                aria-label={`${preset.label} avatar`}
                aria-pressed={preset.id === avatarPresetId}
                onClick={() => setPresetAvatar(preset.id)}
                className={cn(
                  "aspect-square overflow-hidden rounded-full transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                  preset.id === avatarPresetId &&
                    "ring-2 ring-brand ring-offset-2 ring-offset-surface",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- small
                    static asset grid; next/image adds nothing at this size */}
                <img src={preset.src} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
        </Card>
      </Section>

      <Section title="Or upload your own">
        <Card padding="md" className="flex flex-col gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
          <Button
            variant="secondary"
            fullWidth
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={iconSize.sm} aria-hidden />
            Choose image (max 200KB)
          </Button>
          {uploadError && (
            <p role="alert" className="text-sm text-danger">
              {uploadError}
            </p>
          )}
          {avatarDataUrl && !uploadError && (
            <p role="status" className="text-sm text-foreground-secondary">
              Uploaded image applied — it&apos;s saved on this device.
            </p>
          )}
        </Card>
      </Section>
    </PageContainer>
  );
}
