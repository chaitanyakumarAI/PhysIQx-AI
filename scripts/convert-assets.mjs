// Converts generated PNGs to optimized WebP for the app.
//
//   node scripts/convert-assets.mjs <input-folder> <output-folder> [--size 512] [--cutout]
//
// Example: node scripts/convert-assets.mjs ~/Downloads/medals public/badges --cutout
// Keeps transparency, resizes to --size px (default 512, plenty for 2x at
// 120 px), quality 85. Prints each file's size so you can spot heavy ones.
//
// --cutout: for models that can't output transparency. Removes a flat
// background (sampled from the corners) by flood-filling inward from the
// edges, so dark or white areas inside the subject are kept, then trims and
// centres the subject at 90% of the frame.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const [, , input, output, ...rest] = process.argv;
if (!input || !output) {
  console.error("Usage: node scripts/convert-assets.mjs <input-folder> <output-folder> [--size 512]");
  process.exit(1);
}
const sizeFlag = rest.indexOf("--size");
const size = sizeFlag >= 0 ? Number(rest[sizeFlag + 1]) : 512;
const cutout = rest.includes("--cutout");
/** How close (RGB distance) a pixel must be to the background to be removed. */
const TOLERANCE = 60;
/** The subject's share of the square frame after trimming. */
const FILL = 0.9;

/** Flood-fills the background from the edges to alpha 0; returns a PNG buffer. */
async function removeBackground(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const at = (x, y) => (y * width + x) * 4;
  // Background colour: the average of the four corners.
  const corners = [at(0, 0), at(width - 1, 0), at(0, height - 1), at(width - 1, height - 1)];
  const bg = [0, 1, 2].map((c) => corners.reduce((sum, i) => sum + data[i + c], 0) / 4);
  const distance = (i) => Math.hypot(data[i] - bg[0], data[i + 1] - bg[1], data[i + 2] - bg[2]);

  const seen = new Uint8Array(width * height);
  const stack = [];
  for (let x = 0; x < width; x += 1) stack.push(x, 0, x, height - 1);
  for (let y = 0; y < height; y += 1) stack.push(0, y, width - 1, y);
  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    if (x < 0 || y < 0 || x >= width || y >= height || seen[y * width + x]) continue;
    seen[y * width + x] = 1;
    const i = at(x, y);
    const d = distance(i);
    if (d > TOLERANCE * 1.6) continue; // the subject's edge
    // Soft edge: near-background pixels fade instead of cutting hard.
    data[i + 3] = d <= TOLERANCE ? 0 : Math.round((255 * (d - TOLERANCE)) / (TOLERANCE * 0.6));
    if (d <= TOLERANCE) stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
  }

  const trimmed = await sharp(data, { raw: info }).png().trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
  const side = Math.round(Math.max(trimmed.info.width, trimmed.info.height) / FILL);
  return sharp({ create: { width: side, height: side, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: trimmed.data, gravity: "centre" }])
    .png()
    .toBuffer();
}

fs.mkdirSync(output, { recursive: true });
const files = fs.readdirSync(input).filter((file) => /\.(png|jpe?g|webp)$/i.test(file));
if (files.length === 0) console.log("No images found in", input);

for (const file of files) {
  const target = path.join(output, `${path.parse(file).name}.webp`);
  const source = cutout ? await removeBackground(path.join(input, file)) : path.join(input, file);
  await sharp(source)
    .resize(size, size, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85, alphaQuality: 90 })
    .toFile(target);
  const kb = Math.round(fs.statSync(target).size / 1024);
  console.log(`${file} → ${target} (${kb} KB)${kb > 150 ? "  ⚠ over 150 KB" : ""}`);
}
