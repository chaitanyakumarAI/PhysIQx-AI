import { mediaRecordSchema } from "@/features/profile/lib/mediaRecord";
import type { ProgressPhotoEntry } from "@/store/profileStore";

/**
 * Restore for images, the pure half: what `get_media_changes` (migration
 * 008) returns and how it merges into this device. Photos come back as
 * check-ins (their details travel with the image); the avatar's id arrives
 * with the profile snapshot, so here it only decides what to download.
 * Rules match restore.ts: this device's waiting changes win; tombstones
 * remove the local copy.
 */
export interface MediaRow {
  id: string;
  client_ref: string;
  kind: string;
  storage_path: string;
  photo: unknown;
  deleted_at: string | null;
  updated_at: string;
}

export interface MediaPage {
  media: MediaRow[];
  has_more: boolean;
  server_time: string;
}

export interface MediaMerge {
  photos: ProgressPhotoEntry[];
  /** Images to fetch if this device doesn't have them yet. */
  download: { mediaId: string; storagePath: string }[];
  /** Local images whose check-in another device deleted. */
  discard: string[];
  changes: number;
}

const photoDetails = mediaRecordSchema.shape.photo.unwrap();

export function mergeMedia(
  photos: ProgressPhotoEntry[],
  rows: MediaRow[],
  pending: ReadonlySet<string>,
  avatarMediaId: string | null,
): MediaMerge {
  let merged = photos;
  const download: MediaMerge["download"] = [];
  const discard: string[] = [];
  let changes = 0;
  let added = false;

  for (const row of rows) {
    if (pending.has(`media:${row.client_ref}`)) continue;

    if (row.deleted_at) {
      if (merged.some((photo) => photo.mediaId === row.client_ref)) {
        merged = merged.filter((photo) => photo.mediaId !== row.client_ref);
        discard.push(row.client_ref);
        changes += 1;
      }
      continue;
    }

    if (row.kind === "avatar") {
      if (row.client_ref === avatarMediaId) download.push({ mediaId: row.client_ref, storagePath: row.storage_path });
      continue;
    }

    const details = photoDetails.safeParse(row.photo);
    if (row.kind !== "photo" || !details.success) continue;
    download.push({ mediaId: row.client_ref, storagePath: row.storage_path });
    if (merged.some((photo) => photo.id === details.data.photoId)) continue;
    const { photoId, ...rest } = details.data;
    merged = [...merged, { id: photoId, ...rest, mediaId: row.client_ref }];
    added = true;
    changes += 1;
  }

  // Newest first, like the photo timeline; untouched lists keep their order.
  if (added) merged = [...merged].sort((a, b) => b.date.localeCompare(a.date));
  return { photos: merged, download, discard, changes };
}
