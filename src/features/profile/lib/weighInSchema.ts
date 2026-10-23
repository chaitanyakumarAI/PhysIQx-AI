import { z } from "zod";

/** What the server accepts when a weigh-in syncs (WeighIn, @/types/ledger). */
export const weighInSchema = z
  .object({
    date: z.iso.date(),
    weightKg: z.number().finite().min(20).max(400),
  })
  .strict();
