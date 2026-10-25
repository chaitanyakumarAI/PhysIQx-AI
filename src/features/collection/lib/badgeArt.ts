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
  // Pilot (Weave, Nano Banana 2 Lite), 2026-10-24.
  "iron-ledger-bronze",
  "iron-ledger-silver",
  // Blueprint Studio "PhysIQx Medal" Style (native transparent PNG), 2026-10-25.
  "iron-ledger-gold",
  "iron-ledger-platinum",
  "tonnage-bronze",
]);

export function artFor(collectibleId: string): string | null {
  return AVAILABLE_ART.has(collectibleId) ? `/badges/${collectibleId}.webp` : null;
}
