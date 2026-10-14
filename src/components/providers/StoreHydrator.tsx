"use client";

import { useEffect } from "react";
import { useCardioStore } from "@/store/cardioStore";
import { usePlansStore } from "@/store/plansStore";
import { useProfileStore } from "@/store/profileStore";
import { useSessionStore } from "@/store/sessionStore";

/**
 * Persisted Zustand stores use `skipHydration` (see sessionStore.ts) so the
 * client's first render matches the server's — this triggers the real
 * rehydration explicitly, once, after mount. A separate component from
 * MotionProvider on purpose: that one owns Framer Motion config, not
 * app-wide store bootstrapping — a distinct concern, not a shared one.
 */
export function StoreHydrator() {
  useEffect(() => {
    useSessionStore.persist.rehydrate();
    useProfileStore.persist.rehydrate();
    usePlansStore.persist.rehydrate();
    useCardioStore.persist.rehydrate();
  }, []);

  return null;
}
