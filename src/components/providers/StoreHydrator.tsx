"use client";

import { useEffect } from "react";
import { useCardioStore } from "@/store/cardioStore";
import { usePlansStore } from "@/store/plansStore";
import { useProfileStore } from "@/store/profileStore";
import { useSessionStore } from "@/store/sessionStore";
import { migrateLegacyMedia, pruneOrphanMedia } from "@/features/profile/lib/media";

/**
 * Persisted Zustand stores use `skipHydration` (see sessionStore.ts) so the
 * client's first render matches the server's — this triggers the real
 * rehydration explicitly, once, after mount. A separate component from
 * MotionProvider on purpose: that one owns Framer Motion config, not
 * app-wide store bootstrapping — a distinct concern, not a shared one.
 */
const persistedStores = [useSessionStore, useProfileStore, usePlansStore, useCardioStore];

export function StoreHydrator() {
  useEffect(() => {
    for (const store of persistedStores) void store.persist.rehydrate();
    // Images saved before the media store existed move out of localStorage
    // once; then stored images nothing refers to are cleaned up.
    void migrateLegacyMedia()
      .then(() => pruneOrphanMedia())
      .catch((error: unknown) => console.warn("[media] startup tidy-up failed:", error));

    // Cross-tab safety: when another tab writes one of these stores, reload
    // it here before this tab writes again — otherwise this tab's stale copy
    // would overwrite the other tab's new history. (`storage` events only
    // fire in the tabs that didn't make the change.)
    const byKey = new Map(persistedStores.map((store) => [store.persist.getOptions().name, store]));
    const onStorage = (event: StorageEvent) => {
      const store = event.key ? byKey.get(event.key) : undefined;
      if (store) void store.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return null;
}
