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
  // e.g. "iron-ledger-bronze",
]);

export function artFor(collectibleId: string): string | null {
  return AVAILABLE_ART.has(collectibleId) ? `/badges/${collectibleId}.webp` : null;
}
