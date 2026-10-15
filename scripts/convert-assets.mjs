// Converts generated PNGs to optimized WebP for the app.
//
//   node scripts/convert-assets.mjs <input-folder> <output-folder> [--size 512]
//
// Example: node scripts/convert-assets.mjs ~/Downloads/medals public/badges
// Keeps transparency, resizes to --size px (default 512, plenty for 2x at
// 120 px), quality 85. Prints each file's size so you can spot heavy ones.
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

fs.mkdirSync(output, { recursive: true });
const files = fs.readdirSync(input).filter((file) => /\.(png|jpe?g|webp)$/i.test(file));
if (files.length === 0) console.log("No images found in", input);

for (const file of files) {
  const target = path.join(output, `${path.parse(file).name}.webp`);
  await sharp(path.join(input, file))
    .resize(size, size, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85, alphaQuality: 90 })
    .toFile(target);
  const kb = Math.round(fs.statSync(target).size / 1024);
  console.log(`${file} → ${target} (${kb} KB)${kb > 150 ? "  ⚠ over 150 KB" : ""}`);
}
