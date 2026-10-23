"use server";

import { weighInSchema } from "@/features/profile/lib/weighInSchema";
import { signedInWrite, type SyncWriteResult } from "@/lib/sync/signedInWrite";
import type { WeighIn } from "@/types/ledger";

/**
 * Server Action — upserts one weigh-in into `weigh_ins`. One per user per
 * day, like the local ledger: logging again that day replaces it.
 */
export async function saveWeighIn(input: WeighIn): Promise<SyncWriteResult> {
  return signedInWrite("weigh-in", weighInSchema, input, (supabase, userId, weighIn) =>
    supabase
      .from("weigh_ins")
      .upsert(
        { user_id: userId, date: weighIn.date, weight_kg: weighIn.weightKg, deleted_at: null },
        { onConflict: "user_id,date" },
      ),
  );
}
