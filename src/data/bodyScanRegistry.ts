/**
 * PhysIQx AI — Body Scan Hologram Central Asset Registry
 *
 * Single source of truth tracking all certified high-fidelity body scan assets
 * in `public/body-shapes/`.
 *
 * When new AI images are generated, add their filenames to `REGISTERED_BODY_SCANS`.
 * The resolver automatically uses newly added files without breaking existing UI.
 */

export const REGISTERED_BODY_SCANS: Set<string> = new Set([
  // LEAN
  "lean_male_front.png",
  "lean_male_side.png",
  "lean_male_45deg.png",
  "lean_female_front.png",
  "lean_female_side.png",
  "lean_female_45deg.png",
  "lean_neutral_icon.png",

  // ATHLETIC
  "athletic_male_front.png",
  "athletic_male_side.png",
  "athletic_male_45deg.png",
  "athletic_female_front.png",
  "athletic_female_side.png",
  "athletic_female_45deg.png",
  "athletic_neutral_icon.png",

  // MUSCULAR
  "muscular_male_front.png",
  "muscular_male_side.png",
  "muscular_male_45deg.png",
  "muscular_female_front.png",
  "muscular_female_side.png",
  "muscular_female_45deg.png",
  "muscular_neutral_icon.png",

  // POWERFUL
  "powerful_male_front.png",
  "powerful_male_side.png",
  "powerful_male_45deg.png",
  "powerful_female_front.png",
  "powerful_female_side.png",
  "powerful_female_45deg.png",
  "powerful_neutral_icon.png",

  // CURRENT STARTING POINTS & REALISTIC SHAPES
  "current_underweight_front.png",
  "current_average_front.png",
  "current_overweight_front.png",
  "skinnyfat_male_front.png",
  "skinnyfat_female_front.png",
  "skinnyfat_neutral_icon.png",
  "dadbod_male_front.png",
  "dadbod_male_side.png",
  "dadbod_neutral_icon.png",
  "apple_male_front.png",
  "apple_female_front.png",
  "apple_neutral_icon.png",
  "pear_male_front.png",
  "pear_female_front.png",
  "pear_neutral_icon.png",
  "hourglass_female_front.png",
  "rectangular_male_front.png",
  "endomorph_male_front.png",
  "endomorph_female_front.png",

  // SHORT HEIGHT VARIANTS
  "short_lean_male_front.png",
  "short_lean_male_side.png",
  "short_lean_female_front.png",
  "short_lean_neutral_icon.png",
  "short_athletic_male_front.png",
  "short_athletic_female_front.png",
  "short_muscular_male_front.png",
  "short_muscular_male_45deg.png",
  "short_muscular_female_front.png",
  "short_muscular_neutral_icon.png",

  // TALL HEIGHT VARIANTS
  "tall_lean_male_front.png",
  "tall_lean_male_side.png",
  "tall_lean_female_front.png",
  "tall_lean_neutral_icon.png",
  "tall_athletic_male_front.png",
  "tall_athletic_male_45deg.png",
  "tall_athletic_female_front.png",
  "tall_muscular_male_front.png",
  "tall_muscular_female_front.png",
  "tall_muscular_neutral_icon.png",
]);

/**
 * Register new assets dynamically at runtime if needed
 */
export function registerBodyScanAsset(filename: string): void {
  REGISTERED_BODY_SCANS.add(filename);
}

/**
 * Check if an asset is registered
 */
export function isBodyScanRegistered(filename: string): boolean {
  return REGISTERED_BODY_SCANS.has(filename);
}
