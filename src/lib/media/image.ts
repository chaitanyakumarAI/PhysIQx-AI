/**
 * Shrinks an image so its longer side is at most `maxSide`, re-encoded at
 * `quality`. A phone photo (often 4000 px, 5+ MB) becomes a few hundred KB
 * without visible loss at the sizes the app shows. Orientation follows the
 * photo's EXIF data. Where the browser can't decode or encode (old engines,
 * tests), the original is returned unchanged.
 */
export async function downscaleImage(
  source: Blob,
  maxSide: number,
  type: "image/jpeg" | "image/webp" = "image/jpeg",
  quality = 0.85,
): Promise<Blob> {
  if (typeof createImageBitmap === "undefined" || typeof document === "undefined") return source;
  const bitmap = await createImageBitmap(source);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    return source;
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  // Browsers that can't encode `type` fall back to PNG, which still works.
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob ?? source), type, quality));
}
