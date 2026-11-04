"use client";

import { useEffect, useState } from "react";
import { getMedia, onMediaStored } from "./mediaStore";

/**
 * Object URLs for stored images, shared across components and kept while
 * the app runs, so the avatar doesn't flicker back to its preset on every
 * screen. The oldest are released past a cap (each one pins its Blob).
 */
const MAX_CACHED = 60;
const urls = new Map<string, string>();

function remember(id: string, url: string): void {
  urls.set(id, url);
  while (urls.size > MAX_CACHED) {
    const [oldest, oldestUrl] = urls.entries().next().value as [string, string];
    urls.delete(oldest);
    URL.revokeObjectURL(oldestUrl);
  }
}

/** Forgets one image's URL (after the image itself is deleted). */
export function forgetMediaUrl(id: string): void {
  const url = urls.get(id);
  if (!url) return;
  urls.delete(id);
  URL.revokeObjectURL(url);
}

/** A displayable URL for a stored image, or null while loading or missing. */
export function useMediaUrl(mediaId: string | null | undefined): string | null {
  const [loaded, setLoaded] = useState<{ id: string; url: string } | null>(null);

  useEffect(() => {
    if (!mediaId || urls.has(mediaId)) return;
    let cancelled = false;
    const load = () =>
      void getMedia(mediaId)
        .then((blob) => {
          if (cancelled || !blob) return;
          const url = urls.get(mediaId) ?? URL.createObjectURL(blob);
          remember(mediaId, url);
          setLoaded({ id: mediaId, url });
        })
        .catch((error: unknown) => console.warn("[media] could not load", mediaId, error));
    load();
    // Not here yet (a restore still downloading it): show it once stored.
    const stop = onMediaStored((id) => {
      if (id === mediaId) load();
    });
    return () => {
      cancelled = true;
      stop();
    };
  }, [mediaId]);

  if (!mediaId) return null;
  return urls.get(mediaId) ?? (loaded?.id === mediaId ? loaded.url : null);
}
