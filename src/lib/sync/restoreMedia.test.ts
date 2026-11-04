import { describe, expect, it } from "vitest";
import { mediaRecordSchema } from "@/features/profile/lib/mediaRecord";
import type { ProgressPhotoEntry } from "@/store/profileStore";
import { mergeMedia, type MediaRow } from "./restoreMedia";

const AT = "2026-11-04T10:00:00.000000+00:00";
const row = (clientRef: string, overrides: Partial<MediaRow> = {}): MediaRow => ({
  id: "00000000-0000-4000-8000-000000000001",
  client_ref: clientRef,
  kind: "photo",
  storage_path: `user-1/${clientRef}`,
  photo: { photoId: `check-${clientRef}`, date: "2026-11-01", angle: "front", weightKg: 80 },
  deleted_at: null,
  updated_at: AT,
  ...overrides,
});
const local = (id: string, mediaId: string, date = "2026-10-20"): ProgressPhotoEntry => ({ id, date, angle: "side", mediaId });
const none = new Set<string>();

describe("mergeMedia", () => {
  it("brings back another device's check-ins, newest first, and asks for their images", () => {
    const merged = mergeMedia([local("mine", "photo-1-a")], [row("photo-2-b")], none, null);
    expect(merged.photos.map((photo) => photo.id)).toEqual(["check-photo-2-b", "mine"]);
    expect(merged.photos[0]).toEqual({ id: "check-photo-2-b", date: "2026-11-01", angle: "front", weightKg: 80, mediaId: "photo-2-b" });
    expect(merged.download).toEqual([{ mediaId: "photo-2-b", storagePath: "user-1/photo-2-b" }]);
    expect(merged.changes).toBe(1);
  });

  it("keeps a check-in this device already has, but still makes sure its image is here", () => {
    const mine = { ...local("check-photo-2-b", "photo-2-b"), notes: "mine" };
    const merged = mergeMedia([mine], [row("photo-2-b")], none, null);
    expect(merged.photos).toEqual([mine]);
    expect(merged.download).toHaveLength(1);
    expect(merged.changes).toBe(0);
  });

  it("removes check-ins deleted elsewhere, unless this device's change is still uploading", () => {
    const photos = [local("a", "photo-1-a"), local("b", "photo-2-b")];
    const merged = mergeMedia(
      photos,
      [row("photo-1-a", { deleted_at: AT }), row("photo-2-b", { deleted_at: AT })],
      new Set(["media:photo-2-b"]),
      null,
    );
    expect(merged.photos.map((photo) => photo.id)).toEqual(["b"]);
    expect(merged.discard).toEqual(["photo-1-a"]);
  });

  it("downloads only the current avatar, and skips rows it can't read", () => {
    const rows = [
      row("avatar-1-old", { kind: "avatar", photo: null }),
      row("avatar-2-now", { kind: "avatar", photo: null }),
      row("photo-3-c", { photo: { photoId: "x" } }),
    ];
    const merged = mergeMedia([], rows, none, "avatar-2-now");
    expect(merged.download.map((item) => item.mediaId)).toEqual(["avatar-2-now"]);
    expect(merged.photos).toEqual([]);
  });
});

describe("mediaRecordSchema", () => {
  it("accepts what the device sends and refuses ids that could escape the athlete's folder", () => {
    expect(mediaRecordSchema.safeParse({ mediaId: "avatar-1730700000000-k3j9a", kind: "avatar" }).success).toBe(true);
    expect(mediaRecordSchema.safeParse({ mediaId: "../other-user/avatar", kind: "avatar" }).success).toBe(false);
    expect(mediaRecordSchema.safeParse({ mediaId: "photo-1-a", kind: "photo" }).success).toBe(false); // no details
  });
});
