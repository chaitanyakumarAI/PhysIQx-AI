import { z } from "zod";

/** The private bucket (migration 008); each athlete's files sit under their user id. */
export const MEDIA_BUCKET = "athlete-media";

/** Where an image lives in the bucket. Always built from the signed-in id, never sent by a client. */
export function mediaStoragePath(userId: string, mediaId: string): string {
  return `${userId}/${mediaId}`;
}

/**
 * What a device tells the server about one stored image. Photo details
 * travel with it so a restore can rebuild the check-in. Bounds are sanity
 * limits, looser than the form, so nothing a screen saves is refused (the
 * outbox would retry it forever).
 */
export const mediaRecordSchema = z
  .object({
    mediaId: z.string().regex(/^(photo|avatar)-\d+-[a-z0-9]+$/),
    kind: z.enum(["avatar", "photo"]),
    photo: z
      .object({
        photoId: z.string().min(1).max(200),
        date: z.iso.date(),
        angle: z.enum(["front", "side", "back"]),
        weightKg: z.number().finite().min(0).max(1000).optional(),
        notes: z.string().max(2000).optional(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .refine((record) => (record.kind === "photo") === Boolean(record.photo), "A photo carries its details; an avatar doesn't");

export type MediaRecord = z.infer<typeof mediaRecordSchema>;
