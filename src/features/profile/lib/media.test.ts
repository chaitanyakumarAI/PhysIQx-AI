import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { getMedia, listMediaIds, memoryBackend, putMedia, setMediaBackend } from "@/lib/media/mediaStore";
import { useProfileStore } from "@/store/profileStore";
import {
  migrateLegacyMedia,
  pruneOrphanMedia,
  removeProgressPhoto,
  saveProgressPhoto,
  saveUploadedAvatar,
} from "./media";

// The profile store binds to localStorage when created (at import).
vi.hoisted(() => {
  const memory = new Map<string, string>();
  const storage = {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => void memory.set(key, value),
    removeItem: (key: string) => void memory.delete(key),
    clear: () => memory.clear(),
    key: () => null,
    length: 0,
  };
  Object.assign(globalThis, { localStorage: storage, window: { localStorage: storage, dispatchEvent: () => true } });
});

// A 1×1 PNG, as an earlier build would have stored it.
const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
const SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'/>";
const details = { date: "2026-11-04", angle: "front" as const, weightKg: 80 };

beforeAll(async () => {
  await useProfileStore.persist.rehydrate();
});

beforeEach(() => {
  setMediaBackend(memoryBackend());
  useProfileStore.setState({ photos: [], avatarMediaId: null, avatarDataUrl: null, avatarPresetId: null });
});

describe("progress photos", () => {
  it("stores the image in the media store and only its id in the profile", async () => {
    await saveProgressPhoto(new Blob(["jpeg-bytes"], { type: "image/jpeg" }), details);
    const [photo] = useProfileStore.getState().photos;
    expect(photo).toMatchObject({ ...details, mediaId: expect.stringMatching(/^photo-/) });
    expect(photo).not.toHaveProperty("dataUrl");
    expect(await getMedia(photo!.mediaId!)).toBeInstanceOf(Blob);
  });

  it("saves a check-in without an image (the silhouette shows), and deletes images with their check-in", async () => {
    await saveProgressPhoto(null, details);
    expect(useProfileStore.getState().photos[0]).not.toHaveProperty("mediaId");

    await saveProgressPhoto(new Blob(["x"], { type: "image/jpeg" }), details);
    const withImage = useProfileStore.getState().photos[0]!;
    await removeProgressPhoto(withImage.id);
    expect(useProfileStore.getState().photos).toHaveLength(1);
    expect(await getMedia(withImage.mediaId!)).toBeUndefined();
  });
});

describe("avatar", () => {
  it("replaces the previous upload and its stored image", async () => {
    await saveUploadedAvatar(new Blob(["first"], { type: "image/png" }));
    const first = useProfileStore.getState().avatarMediaId!;
    await saveUploadedAvatar(new Blob(["second"], { type: "image/png" }));
    const second = useProfileStore.getState().avatarMediaId!;
    expect(second).not.toBe(first);
    expect(await getMedia(first)).toBeUndefined();
    expect(await getMedia(second)).toBeInstanceOf(Blob);
  });
});

describe("migrateLegacyMedia", () => {
  it("moves inline images out of the profile and drops stored silhouettes", async () => {
    useProfileStore.setState({
      photos: [
        { id: "p1", ...details, dataUrl: PNG },
        { id: "p2", ...details, angle: "side", dataUrl: SVG },
      ],
      avatarDataUrl: PNG,
    });
    expect(await migrateLegacyMedia()).toBe(2);

    const { photos, avatarDataUrl, avatarMediaId } = useProfileStore.getState();
    expect(photos[0]).toMatchObject({ id: "p1", mediaId: expect.any(String) });
    expect(photos[0]).not.toHaveProperty("dataUrl");
    expect(photos[1]).toEqual({ id: "p2", ...details, angle: "side" });
    expect(avatarDataUrl).toBeNull();
    expect((await getMedia(avatarMediaId!))?.type).toBe("image/png");
    expect(await migrateLegacyMedia()).toBe(0); // once
  });
});

describe("pruneOrphanMedia", () => {
  it("deletes images nothing refers to, but never one saved moments ago", async () => {
    const hour = 60 * 60_000;
    const now = Date.now();
    await putMedia(`photo-${now - hour}-old`, new Blob(["orphan"]));
    await putMedia(`photo-${now - 1000}-fresh`, new Blob(["saving"]));
    await saveProgressPhoto(new Blob(["kept"], { type: "image/jpeg" }), details);
    const kept = useProfileStore.getState().photos[0]!.mediaId!;

    expect(await pruneOrphanMedia(now + 1000)).toBe(1);
    expect((await listMediaIds()).sort()).toEqual([kept, `photo-${now - 1000}-fresh`].sort());
  });
});
