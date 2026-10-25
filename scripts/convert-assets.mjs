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
/** Pixels this close (RGB distance) to the background colour are background. */
const HARD = 16;
/** Edge pixels fade from transparent (HARD) to opaque (SOFT). */
const SOFT = 70;
/** Width, in px, of the soft edge band around the subject. */
const BAND = 2;
/** The subject's share of the square frame after trimming. */
const FILL = 0.9;
/** Subjects at least this convex (area / hull area) get their outline filled solid. */
const CONVEX = 0.96;

/** Convex hull (monotone chain) of points [x, y]. */
function convexHull(points) {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list) => {
    const out = [];
    for (const point of list) {
      while (out.length >= 2 && cross(out[out.length - 2], out[out.length - 1], point) <= 0) out.pop();
      out.push(point);
    }
    out.pop();
    return out;
  };
  return [...half(sorted), ...half([...sorted].reverse())];
}

/** Horizontal span [from, to] of a convex polygon at row y, or null. */
function hullSpan(hull, y) {
  let from = Infinity;
  let to = -Infinity;
  for (let i = 0; i < hull.length; i += 1) {
    const [x1, y1] = hull[i];
    const [x2, y2] = hull[(i + 1) % hull.length];
    if ((y < Math.min(y1, y2)) || (y > Math.max(y1, y2))) continue;
    const x = y1 === y2 ? Math.min(x1, x2) : x1 + ((y - y1) * (x2 - x1)) / (y2 - y1);
    const xb = y1 === y2 ? Math.max(x1, x2) : x;
    from = Math.min(from, x, xb);
    to = Math.max(to, x, xb);
  }
  return from <= to ? [Math.ceil(from), Math.floor(to)] : null;
}

/**
 * Keeps only the largest connected subject (drops specks), and if it's
 * nearly convex — a round medal — fills its outline solid: a polished rim
 * that reflects pure white can't be told from a white background by colour.
 */
function cleanSubject(background, width, height) {
  const count = width * height;
  const label = new Int32Array(count);
  let best = 0;
  let bestSize = 0;
  let next = 0;
  for (let start = 0; start < count; start += 1) {
    if (background[start] || label[start]) continue;
    next += 1;
    let size = 0;
    const stack = [start];
    label[start] = next;
    while (stack.length) {
      const p = stack.pop();
      size += 1;
      const x = p % width;
      for (const q of [x > 0 ? p - 1 : -1, x < width - 1 ? p + 1 : -1, p - width, p + width]) {
        if (q >= 0 && q < count && !background[q] && !label[q]) {
          label[q] = next;
          stack.push(q);
        }
      }
    }
    if (size > bestSize) {
      bestSize = size;
      best = next;
    }
  }
  const points = [];
  for (let y = 0; y < height; y += 1) {
    let left = -1;
    let right = -1;
    for (let x = 0; x < width; x += 1) {
      const p = y * width + x;
      if (label[p] !== best) {
        if (!background[p]) background[p] = 1; // a speck
        continue;
      }
      if (left < 0) left = x;
      right = x;
    }
    if (left >= 0) points.push([left, y], [right, y]);
  }
  const hull = convexHull(points);
  let hullArea = 0;
  const spans = [];
  for (let y = 0; y < height; y += 1) {
    const span = hullSpan(hull, y);
    spans.push(span);
    if (span) hullArea += span[1] - span[0] + 1;
  }
  const convexity = bestSize / hullArea;
  if (convexity < CONVEX) return { convexity, circle: null };

  // A coin: most outline points sit at one distance from the centre. Fit
  // the circle so a sliver of reflection stuck to the rim can't distort it.
  let cx = 0;
  let cy = 0;
  for (let p = 0; p < count; p += 1) {
    if (label[p] !== best) continue;
    cx += p % width;
    cy += Math.floor(p / width);
  }
  cx /= bestSize;
  cy /= bestSize;
  const radii = points.map(([x, y]) => Math.hypot(x - cx, y - cy)).sort((a, b) => a - b);
  const r = radii[Math.floor(radii.length / 2)];
  const onCircle = radii.filter((d) => Math.abs(d - r) <= r * 0.04).length / radii.length;
  if (onCircle >= 0.85) return { convexity, circle: { cx, cy, r } };

  spans.forEach((span, y) => {
    if (!span) return;
    for (let x = span[0]; x <= span[1]; x += 1) background[y * width + x] = 0;
  });
  return { convexity, circle: null };
}

/**
 * Background removal for flat-background renders:
 * 1. Background = pixels nearly the corner colour AND connected to the image
 *    edge (flood fill). A tight tolerance, so light highlights on the subject
 *    — a near-white rim catching the light — are never eaten, and anything
 *    enclosed by the subject stays solid.
 * 2. A narrow band along that boundary gets partial alpha, and its colour is
 *    un-mixed from the background (C = aF + (1-a)B, solved for F), so the
 *    edge is smooth with no light halo on dark screens.
 */
async function removeBackground(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const count = width * height;
  const corners = [0, width - 1, (height - 1) * width, count - 1].map((p) => p * 4);
  // Already transparent (a model that outputs alpha): nothing to key, only
  // trim and centre.
  if (corners.every((i) => data[i + 3] === 0)) return finish(data, info);
  const bg = [0, 1, 2].map((c) => corners.reduce((sum, i) => sum + data[i + c], 0) / 4);
  const distance = (p) => Math.hypot(data[p * 4] - bg[0], data[p * 4 + 1] - bg[1], data[p * 4 + 2] - bg[2]);

  // 1. Background: flood fill from every edge pixel.
  const background = new Uint8Array(count);
  const stack = [];
  for (let x = 0; x < width; x += 1) stack.push(x, (height - 1) * width + x);
  for (let y = 0; y < height; y += 1) stack.push(y * width, y * width + width - 1);
  while (stack.length) {
    const p = stack.pop();
    if (background[p] || distance(p) > HARD) continue;
    background[p] = 1;
    const x = p % width;
    if (x > 0) stack.push(p - 1);
    if (x < width - 1) stack.push(p + 1);
    if (p >= width) stack.push(p - width);
    if (p < count - width) stack.push(p + width);
  }

  const { convexity, circle } = cleanSubject(background, width, height);
  if (circle) {
    // Round: the circle is the outline, with a 1 px anti-aliased edge.
    console.log(`  ${path.basename(file)}: circular subject (r ${circle.r.toFixed(0)} px)`);
    for (let p = 0; p < count; p += 1) {
      const d = Math.hypot((p % width) - circle.cx, Math.floor(p / width) - circle.cy);
      data[p * 4 + 3] = Math.round(255 * Math.min(1, Math.max(0, circle.r - 0.5 - d)));
    }
    return finish(data, info);
  }
  if (convexity >= CONVEX) console.log(`  ${path.basename(file)}: convex subject (${convexity.toFixed(3)}), outline filled`);

  // 2. The edge band: subject pixels within BAND px of the background.
  let near = background;
  for (let step = 0; step < BAND; step += 1) {
    const grown = near.slice();
    for (let p = 0; p < count; p += 1) {
      if (near[p]) continue;
      const x = p % width;
      if ((x > 0 && near[p - 1]) || (x < width - 1 && near[p + 1]) || (p >= width && near[p - width]) || (p < count - width && near[p + width])) {
        grown[p] = 1;
      }
    }
    near = grown;
  }

  for (let p = 0; p < count; p += 1) {
    const i = p * 4;
    if (background[p]) {
      data[i + 3] = 0;
      continue;
    }
    if (!near[p]) continue; // solid subject
    const alpha = Math.min(1, Math.max(0, (distance(p) - HARD) / (SOFT - HARD)));
    data[i + 3] = Math.round(alpha * 255);
    if (alpha > 0) {
      for (let c = 0; c < 3; c += 1) {
        data[i + c] = Math.round(Math.min(255, Math.max(0, bg[c] + (data[i + c] - bg[c]) / alpha)));
      }
    }
  }

  return finish(data, info);
}

/** Trims to the subject and centres it at FILL of a square frame. */
async function finish(data, info) {
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
