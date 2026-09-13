"use client";

import { useEffect } from "react";
import { initOnlineSync } from "@/lib/syncEngine";
import { saveWorkoutSession } from "@/features/session/actions/saveWorkoutSession";

/**
 * Registers the PWA Service Worker (/sw.js) in production or offline-capable
 * browser environments, and initializes the background offline sync queue listener.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    // 1. Initialize offline sync queue listener
    const cleanupSync = initOnlineSync(saveWorkoutSession);

    // 2. Register Service Worker in production
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          reg.onupdatefound = () => {
            const installing = reg.installing;
            if (installing) {
              installing.onstatechange = () => {
                if (installing.state === "installed" && navigator.serviceWorker.controller) {
                  // Update available in background
                }
              };
            }
          };
        })
        .catch((err) => {
          console.warn("[SW] Registration failed:", err);
        });
    }

    return () => {
      cleanupSync();
    };
  }, []);

  return null;
}
