"use client";

import { useEffect } from "react";

/**
 * Registers the PWA Service Worker (/sw.js) in production or offline-capable
 * browser environments.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
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
  }, []);

  return null;
}
