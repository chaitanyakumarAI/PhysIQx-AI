/**
 * Generated medal art (docs/ASSET_PROMPTS.md §2). Add a collectible's id
 * here once its file is in `public/badges/` — until then the vector medal
 * renders. An explicit list (not a file-exists probe) so missing art never
 * produces a broken image or a 404 request.
 *
 * File naming: public/badges/<collectible-id>.webp, e.g.
 * "iron-ledger-gold.webp", "first-rep.webp", "rank-silver.webp".
 */
const AVAILABLE_ART = new Set<string>([
  // All 70 generated 2026-10-25: Blueprint Studio "PhysIQx Medal" Style
  // (iron-ledger bronze/silver: the Weave pilot it was built from).
  "anniversary",
  "big-session-bronze",
  "big-session-gold",
  "big-session-platinum",
  "big-session-silver",
  "body-map",
  "calibrated",
  "cardio-engine-bronze",
  "cardio-engine-gold",
  "cardio-engine-platinum",
  "cardio-engine-silver",
  "comeback-kid",
  "double-duty-bronze",
  "double-duty-gold",
  "double-duty-platinum",
  "double-duty-silver",
  "explorer-bronze",
  "explorer-gold",
  "explorer-platinum",
  "explorer-silver",
  "first-import",
  "first-rep",
  "full-house",
  "iron-ledger-bronze",
  "iron-ledger-gold",
  "iron-ledger-platinum",
  "iron-ledger-silver",
  "iron-year",
  "long-haul-bronze",
  "long-haul-gold",
  "long-haul-platinum",
  "long-haul-silver",
  "perfect-month",
  "perfect-week-bronze",
  "perfect-week-gold",
  "perfect-week-platinum",
  "perfect-week-silver",
  "physiq-climber-bronze",
  "physiq-climber-gold",
  "physiq-climber-platinum",
  "physiq-climber-silver",
  "rank-bronze",
  "rank-diamond",
  "rank-gold",
  "rank-iron",
  "rank-legend",
  "rank-obsidian",
  "rank-platinum",
  "rank-silver",
  "record-breaker-bronze",
  "record-breaker-gold",
  "record-breaker-platinum",
  "record-breaker-silver",
  "steady-scale-bronze",
  "steady-scale-gold",
  "steady-scale-platinum",
  "steady-scale-silver",
  "strength-standard-bronze",
  "strength-standard-gold",
  "strength-standard-platinum",
  "strength-standard-silver",
  "tonnage-bronze",
  "tonnage-gold",
  "tonnage-platinum",
  "tonnage-silver",
  "unbroken-bronze",
  "unbroken-gold",
  "unbroken-platinum",
  "unbroken-silver",
  "unshakeable",
]);

export function artFor(collectibleId: string): string | null {
  return AVAILABLE_ART.has(collectibleId) ? `/badges/${collectibleId}.webp` : null;
}
