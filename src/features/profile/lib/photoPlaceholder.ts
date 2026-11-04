import type { ProgressPhotoEntry } from "@/store/profileStore";

const ANGLE_COLOR: Record<ProgressPhotoEntry["angle"], string> = {
  front: "%2310b981",
  side: "%2338bdf8",
  back: "%23a855f7",
};

/**
 * The athletic silhouette a check-in without an image shows. Drawn on the
 * fly from its angle — never stored (it used to be saved as a data URL).
 */
export function photoPlaceholder(angle: ProgressPhotoEntry["angle"]): string {
  const color = ANGLE_COLOR[angle];
  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500' fill='%23121214'><rect width='400' height='500' rx='16' fill='%2318181b'/><circle cx='200' cy='130' r='45' fill='${color}' fill-opacity='0.3' stroke='${color}' stroke-width='2'/><path d='M130,220 C130,170 270,170 270,220 L280,360 C280,380 250,390 200,390 C150,390 120,380 120,360 Z' fill='${color}' fill-opacity='0.25' stroke='${color}' stroke-width='2'/><text x='200' y='450' fill='${color}' font-family='sans-serif' font-size='14' font-weight='bold' text-anchor='middle'>Logged Check-in (${angle.toUpperCase()})</text></svg>`;
}
