"use client";
// Local Blob URLs and SVG data URLs, which next/image cannot optimize.
/* eslint-disable @next/next/no-img-element */

import { useMediaUrl } from "@/lib/media/useMediaUrl";
import type { ProgressPhotoEntry } from "@/store/profileStore";
import { photoPlaceholder } from "../lib/photoPlaceholder";

interface ProgressPhotoImageProps {
  photo: ProgressPhotoEntry;
  alt: string;
  className?: string;
}

/** A check-in's image from the media store, or the angle's silhouette. */
export function ProgressPhotoImage({ photo, alt, className }: ProgressPhotoImageProps) {
  const stored = useMediaUrl(photo.mediaId);
  // While a stored image loads, show the dark card background, not the silhouette.
  if (photo.mediaId && !stored) return <div aria-hidden className={className} />;
  const src = stored ?? photo.dataUrl ?? photoPlaceholder(photo.angle);
  return <img src={src} alt={alt} className={className} />;
}
