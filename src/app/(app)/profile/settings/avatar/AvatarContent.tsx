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
import { MAX_IMAGE_UPLOAD_BYTES, saveUploadedAvatar } from "@/features/profile/lib/media";
import { mockProfile } from "@/data/profile";
import { useProfileStore } from "@/store/profileStore";

export function AvatarContent() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const avatarPresetId = useProfileStore((state) => state.avatarPresetId);
  const hasUpload = useProfileStore((state) => Boolean(state.avatarMediaId || state.avatarDataUrl));
  const setPresetAvatar = useProfileStore((state) => state.setPresetAvatar);
  const [saving, setSaving] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > MAX_IMAGE_UPLOAD_BYTES) {
      setUploadError("That file isn't an image we can use. Pick a JPEG, PNG or HEIC photo.");
      return;
    }
    setUploadError(null);
    setSaving(true);
    try {
      // Shrunk to avatar size on the way in, so any photo size works.
      await saveUploadedAvatar(file);
    } catch (error) {
      console.error("[avatar] upload failed:", error);
      setUploadError("Couldn't read that image. Try a different one.");
    } finally {
      setSaving(false);
    }
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
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />
          <Button
            variant="secondary"
            fullWidth
            loading={saving}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={iconSize.sm} aria-hidden />
            Choose image
          </Button>
          {uploadError && (
            <p role="alert" className="text-sm text-danger">
              {uploadError}
            </p>
          )}
          {hasUpload && !uploadError && (
            <p role="status" className="text-sm text-foreground-secondary">
              Uploaded image applied — it&apos;s saved on this device.
            </p>
          )}
        </Card>
      </Section>
    </PageContainer>
  );
}
