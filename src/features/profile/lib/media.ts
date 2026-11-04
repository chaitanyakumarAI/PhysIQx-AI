import { downscaleImage } from "@/lib/media/image";
import {
  deleteMedia,
  listMediaIds,
  mediaIdCreatedAt,
  newMediaId,
  putMedia,
} from "@/lib/media/mediaStore";
import { forgetMediaUrl } from "@/lib/media/useMediaUrl";
import { whenHydrated } from "@/lib/sync/whenHydrated";
import { useProfileStore, type ProgressPhotoEntry } from "@/store/profileStore";

/**
 * The athlete's images: progress photos and an uploaded avatar. Bytes live
 * in the media store (IndexedDB); the profile store keeps only their ids.
 * Images are shrunk before they're stored — the app never shows them
 * bigger than this.
 */
export const PHOTO_MAX_SIDE = 1600;
export const AVATAR_MAX_SIDE = 512;
/** Uploads bigger than this are almost certainly not photos. */
export const MAX_IMAGE_UPLOAD_BYTES = 25 * 1024 * 1024;

export type PhotoDetails = Omit<ProgressPhotoEntry, "id" | "mediaId" | "dataUrl">;

/** Saves a check-in; with no image, the angle's silhouette stands in. */
export async function saveProgressPhoto(image: Blob | null, details: PhotoDetails): Promise<void> {
  let mediaId: string | undefined;
  if (image) {
    mediaId = newMediaId("photo");
    await putMedia(mediaId, await downscaleImage(image, PHOTO_MAX_SIDE, "image/jpeg", 0.85));
  }
  useProfileStore.getState().addPhoto({ ...details, ...(mediaId ? { mediaId } : {}) });
}

export async function removeProgressPhoto(id: string): Promise<void> {
  const photo = useProfileStore.getState().photos.find((entry) => entry.id === id);
  useProfileStore.getState().deletePhoto(id);
  if (photo?.mediaId) await discard(photo.mediaId);
}

/** Stores an uploaded avatar and makes it the athlete's look. */
export async function saveUploadedAvatar(image: Blob): Promise<void> {
  const previous = useProfileStore.getState().avatarMediaId;
  const mediaId = newMediaId("avatar");
  // WebP keeps transparency; browsers that can't encode it fall back to PNG.
  await putMedia(mediaId, await downscaleImage(image, AVATAR_MAX_SIDE, "image/webp", 0.9));
  useProfileStore.getState().setUploadedAvatar(mediaId);
  if (previous) await discard(previous);
}

async function discard(mediaId: string): Promise<void> {
  forgetMediaUrl(mediaId);
  await deleteMedia(mediaId).catch(() => undefined);
}

const isSvgDataUrl = (url: string) => url.startsWith("data:image/svg");

/**
 * One-time move of images saved before the media store existed: data URLs
 * inside the persisted profile go to IndexedDB (shrunk on the way), and
 * the old generated silhouettes are dropped (the UI draws them now). An
 * image that can't be moved keeps its data URL, so nothing disappears.
 */
export async function migrateLegacyMedia(): Promise<number> {
  await whenHydrated([useProfileStore]);
  const { photos, avatarDataUrl } = useProfileStore.getState();
  if (!avatarDataUrl && !photos.some((photo) => photo.dataUrl)) return 0;

  let moved = 0;
  const movedPhotos = new Map<string, string | null>(); // photo id → media id (null: silhouette)
  for (const photo of photos) {
    if (!photo.dataUrl) continue;
    if (isSvgDataUrl(photo.dataUrl)) {
      movedPhotos.set(photo.id, null);
      continue;
    }
    try {
      const mediaId = newMediaId("photo");
      const blob = await (await fetch(photo.dataUrl)).blob();
      await putMedia(mediaId, await downscaleImage(blob, PHOTO_MAX_SIDE, "image/jpeg", 0.85));
      movedPhotos.set(photo.id, mediaId);
      moved += 1;
    } catch (error) {
      console.warn("[media] kept an inline photo it couldn't move:", error);
    }
  }
  let avatarMediaId: string | null = null;
  if (avatarDataUrl) {
    try {
      avatarMediaId = newMediaId("avatar");
      const blob = await (await fetch(avatarDataUrl)).blob();
      await putMedia(avatarMediaId, await downscaleImage(blob, AVATAR_MAX_SIDE, "image/webp", 0.9));
      moved += 1;
    } catch (error) {
      avatarMediaId = null;
      console.warn("[media] kept an inline avatar it couldn't move:", error);
    }
  }

  // Applied to the latest state: the athlete may have changed things meanwhile.
  useProfileStore.setState((state) => ({
    photos: state.photos.map((photo) => {
      if (!movedPhotos.has(photo.id)) return photo;
      const { dataUrl: _inline, ...rest } = photo;
      void _inline;
      const mediaId = movedPhotos.get(photo.id);
      return mediaId ? { ...rest, mediaId } : rest;
    }),
    ...(avatarMediaId && state.avatarDataUrl === avatarDataUrl
      ? { avatarMediaId, avatarDataUrl: null }
      : {}),
  }));
  return moved;
}

/** Saves younger than this are never pruned (their store write may be pending). */
const PRUNE_GRACE_MS = 5 * 60_000;

/** Deletes stored images nothing refers to any more (replaced avatars, crashes mid-save). */
export async function pruneOrphanMedia(now = Date.now()): Promise<number> {
  await whenHydrated([useProfileStore]);
  const { photos, avatarMediaId } = useProfileStore.getState();
  const inUse = new Set([...photos.map((photo) => photo.mediaId), avatarMediaId].filter(Boolean));
  let pruned = 0;
  for (const id of await listMediaIds()) {
    const createdAt = mediaIdCreatedAt(id);
    if (inUse.has(id) || (createdAt !== null && now - createdAt < PRUNE_GRACE_MS)) continue;
    await discard(id);
    pruned += 1;
  }
  return pruned;
}
