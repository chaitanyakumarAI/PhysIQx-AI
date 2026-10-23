import { z } from "zod";

/**
 * What the server accepts when a cardio activity syncs. Mirrors CardioActivity
 * (@/types/cardio); bounds reject impossible values (a 2,000 km run, a heart
 * rate of 400) that a tampered or corrupted request could otherwise store.
 */
export const cardioActivitySchema = z.object({
  id: z.string().min(1).max(300),
  source: z.enum(["gpx", "tcx", "strava", "apple_health", "health_connect", "garmin", "manual"]),
  externalId: z.string().max(300).optional(),
  type: z.enum(["walk", "run", "cycle", "swim", "row", "hiit", "sports", "other"]),
  startedAt: z.iso.datetime({ offset: true }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  durationMin: z.number().finite().gt(0).max(24 * 60),
  distanceKm: z.number().finite().min(0).max(1000).optional(),
  avgHeartRate: z.number().finite().min(20).max(250).optional(),
  maxHeartRate: z.number().finite().min(20).max(250).optional(),
  calories: z.number().finite().min(0).max(20000).optional(),
  importedAt: z.iso.datetime({ offset: true }),
});
