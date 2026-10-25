# PhysIQx — Asset Generation Prompts

*Created 2026-10-15. Every image the gamification and tour work needs, as
paste-ready prompts. Track progress in `docs/TODO.md` → "Asset generation".*

The app already works without these. Badges render as vector medals and the
tour uses the existing expression crops. Each asset you generate **replaces**
its placeholder automatically once registered (see §5).

---

## 0. How to run these

- **Any capable image model works** (GPT-image, Midjourney v7, Imagen, Flux,
  SDXL). Use the same model for a whole set so the style matches.
- **Output: always PNG** (owner rule, 2026-10-25) — never JPEG: its
  compression smears the edges and the cutout gets worse. Pick a model or
  setting that returns PNG (on Weave, Nano Banana 2.1 with
  `output_format: png`), **1024 × 1024**, then convert to WebP (§5).
- **Background:** transparent if the model truly supports it. Otherwise a
  **flat, solid `#0a0d0b`** (the app background, so reflections in polished
  metal match the app) — except dark subjects (Legendary obsidian medals,
  Nyra), which go on flat white. Never a gradient, floor, shadow or
  vignette: `convert-assets.mjs --cutout` keys out one flat colour.
- **Consistency is everything.**
  - **Characters:** always attach the locked anchors from `design/mascots/`
    (`kix/kix-anchor.png`, `kix/kix-grid.png`, `nyra/nyra-anchor.png`,
    `nyra/nyra-grid.png`).
  - **Medals:** generate each family's **Bronze first**, then attach it as the
    reference for Silver, Gold and Platinum so the emblem stays identical and
    only the metal changes.
- **Never edit an anchor** (MASCOTS.md). Fix problems in the next prompt, not
  with edit passes.
- **Negative prompt** (for models that take one): `text, letters, numbers,
  watermark, logo, signature, blurry, low detail, extra limbs, extra fingers,
  cropped, frame border, multiple subjects, busy background`.

---

## 1. Kix & Nyra — stage poses and celebration scenes

The tour (`src/features/tour/`) stages the characters like Clash of Clans:
big, chest-up, standing at the bottom corners of the screen (Kix left, Nyra
right) with the speech bubble above them. **Twelve stage cuts already
exist**, cut from the locked expression grids into `public/mascots/stage/`
(`scripts/crop_mascot_stage.py`): Kix default · focus · joy · sheepish ·
worried · proud · determined; Nyra stare · narrowed · closed · nod · tilt.
Generate only the poses below: the gestures the grids can't give.

### Character blocks (paste before every pose)

**KIX:**
> Cinematic photoreal 3D character render of Kix, an anthropomorphic
> kangaroo. Soft charcoal-grey fur (#1a1f1c), warmer pale-grey belly, muzzle
> and inner ears. Deer-like tapered muzzle with split lip, warm amber eyes
> with a soft catchlight, tall oval ears angled back, the tip of the
> character's LEFT ear permanently bent. Solid, dense, huggable build —
> padded chest, strong arms, never fat, never lanky. Neon-green boxing gloves
> (#22c55e) with a soft self-glow and matching green ankle tape — the only
> green on the body. Calm, warm, openly expressive face; no teeth bared.
> Dramatic dark studio lighting; the glove glow gently lights nearby fur; the
> air stays dark, no halo, no lens flare. Same face, proportions and colours
> as the attached reference.

**NYRA:**
> Cinematic photoreal 3D render of Nyra, a black panther. True matte-black
> coat (#0d0f0e), elegant long lines, stillness. Luminous green eyes
> (#22c55e) — the glow hugs only the eyes, with no green anywhere else. One
> thin, pale, old scar over the RIGHT brow, barely visible. No accessories.
> Set, neutral mouth with no smile; no fangs. Semi-anthro "teaching mode":
> sitting upright with near-human posture. Dramatic dark lighting; she
> emerges from the dark. Same face and markings as the attached reference.

**Framing suffix (always) — it must match the existing stage cuts:**
> Chest-up portrait, facing the viewer, vertical 3:4 frame. The bottom edge
> of the frame cuts across the chest (across the gloves for Kix). The head
> sits in the upper half, the tops of the ears about 5% below the top edge.
> Same scale and position as the attached stage cut. Flat near-black
> background (#0d0f0c), high detail fur, no text.

Attach an existing stage cut (`public/mascots/stage/kix-default.webp` or
`nyra-stare.webp`) **as the framing reference**, together with the anchor,
so every pose lines up and expression swaps never make the body jump.

### Stage poses — save to `public/mascots/stage/` (convert with `--size 720` → 540 × 720)

| File | Used for | Prompt (character block + framing suffix + this) |
|---|---|---|
| `kix-wave.webp` | Intro hello | Kix raising one glowing glove in a friendly wave hello, warm open half-smile. |
| `kix-point-up.webp` | Spotlight beats | Kix pointing up and toward the viewer's right with one glove (the UI he's explaining sits above him), eager, mouth slightly open as if explaining. |
| `kix-celebrate.webp` | Finale, level-ups | Kix with both gloves raised high in full unguarded joy, eyes bright (rare expression — reserved for milestones). |
| `kix-thinking.webp` | Questions | Kix with one glove at his chin, considering, calm focus. |
| `nyra-gesture-up.webp` | Spotlight beats | Nyra in upright teaching posture, one front paw lifted and angled up toward the viewer's left (the UI above her), measuring look. |
| `nyra-teach.webp` | Explaining rules | Nyra sitting upright with near-human teaching posture, calm level stare at the viewer — the "pay attention" pose. |

### Duo and celebrations — save to `public/mascots/scenes/`

| File | Prompt |
|---|---|
| `duo-intro.webp` | Both characters together (attach both anchors): Kix standing on the left with one glove raised in welcome, Nyra sitting upright on the right in teaching posture with a level stare. Seated Nyra's eye-line sits just above standing Kix's. Dark stage, a soft green floor glow between them. Wide 3:2 framing, transparent background, no text. |
| `duo-finale.webp` | Same pair, ending beat: Kix celebrating with both gloves up, Nyra giving her slow nod. Wide 3:2, transparent background, no text. |
| `kix-level-up.webp` | Kix in full joy, gloves up, a burst of green light particles rising from the gloves — the level-up moment. Square, transparent background. |
| `nyra-legendary-nod.webp` | Nyra's slow nod, close-up portrait, green eyes half-closed, a single faint violet (#a78bfa) glint reflected in the eyes — for legendary unlocks. Square, transparent background. |
| `nyra-rest.webp` | Nyra lying calmly along a low ledge, eyes open, watchful — for rest-day moments. Full body, side view, wide 3:2, flat #0d0f0c background, no text. |

---

## 2. Collection medals — 70 items

### Medal style guide (paste into every medal prompt)

> Premium 3D game medal icon, straight-on front view, a medallion with
> **{SHAPE}**, thick and beveled, in **{MATERIAL}**. The inner face is dark obsidian
> enamel (#0b0e0c), with a raised emblem in **{MATERIAL}**: **{EMBLEM}**. The
> emblem edges catch a soft rim light; a faint glow pools around the emblem.
> Crisp, clean, readable at 64 px. Soft studio light from the top-left.
> Mobile-game award quality, like Apple Fitness awards or Clash Royale
> badges. Isolated on a transparent background, centred, the medal fills 90%
> of the frame. No text, no letters, no numbers.

**{MATERIAL} and {SHAPE} by tier.** The rim grows more elaborate with each
tier, exactly like the vector medals in the app
(`src/features/collection/components/Medal.tsx`), so art and fallback match:

| Tier | Material | Shape (the rim) |
|---|---|---|
| Bronze | warm polished bronze with copper highlights | a plain round coin rim with a finely reeded edge |
| Silver | bright brushed sterling silver with cool white highlights | a round rim ringed with small polished beads |
| Gold | rich polished 24k gold with warm highlights | a scalloped rosette rim (18 scallops) with a small laurel wreath along the lower edge |
| Platinum | cool platinum with a pale cyan sheen | a 12-sided gem-cut faceted rim, a small cut jewel at the top, laurels along the lower edge |
| Legendary | glossy black obsidian inlaid with glowing violet amethyst (#a78bfa) veins | an 8-point star crest behind a round rim, a violet jewel at the top, faint violet rays behind |

Generate Bronze → attach it → Silver → Gold → Platinum (same emblem, new
metal and rim).

### 2a. Families (13 × 4 tiers) — files `public/badges/<family>-<tier>.webp`

| Family id | Emblem |
|---|---|
| `iron-ledger` | a chunky hexagonal dumbbell lying across a closed leather-bound ledger book |
| `tonnage` | three thick Olympic weight plates stacked flat, slightly offset like a coin stack |
| `record-breaker` | a barbell punching upward through a cracked horizontal bar, small shards flying |
| `perfect-week` | seven small pips arranged in a ring, all lit, with a bold check mark in the centre |
| `unbroken` | a closed chain of links forming a circle around a small steady flame |
| `cardio-engine` | a heart shape traced by a heartbeat line, with turbine fins at its base |
| `long-haul` | a winding trail ribbon running toward a distant mountain horizon |
| `steady-scale` | a minimalist balance scale with both pans perfectly level |
| `strength-standard` | a barbell framed by a laurel wreath |
| `physiq-climber` | a circular gauge dial with the needle sweeping high, inside a hexagon |
| `explorer` | a compass rose whose needle is a small dumbbell |
| `big-session` | a tall tower of stacked rectangular blocks, like a set counter |
| `double-duty` | a lightning bolt splitting a dumbbell (left) and a running shoe (right) |

Example (Iron Ledger, Gold): *[style guide with MATERIAL = "rich polished
24k gold with warm highlights", EMBLEM = "a chunky hexagonal dumbbell lying
across a closed leather-bound ledger book"]* → save as
`iron-ledger-gold.webp`.

### 2b. Milestones (10) — files `public/badges/<id>.webp`, material from its tier

| Id | Tier | Emblem |
|---|---|---|
| `first-rep` | Bronze | a single bright spark bursting above a raised closed fist |
| `calibrated` | Bronze | a precision crosshair ring with fine calibration ticks |
| `body-map` | Bronze | a stylised standing human silhouette inside a scanning frame of corner brackets |
| `first-import` | Bronze | a sports watch face with an arrow flowing out of it into a small document |
| `comeback-kid` | Silver | a circular return arrow wrapped around a rising sun |
| `full-house` | Gold | four upright pillars side by side, all four tops glowing |
| `perfect-month` | Gold | a calendar grid with every day cell lit |
| `iron-year` | Platinum | an anvil with a hammer resting on it, sparks, ringed by 12 small notches |
| `anniversary` | Legendary | a laurel ring around a single candle flame |
| `unshakeable` | Legendary | a mountain peak with a planted flag, ringed by 52 tiny ticks |

### 2c. Rank insignia (8) — files `public/badges/rank-<id>.webp`

Use a **shield crest** instead of a round medal:

> Premium 3D game rank insignia, front view, a heraldic shield crest in
> {MATERIAL} with {DETAIL}, dark obsidian inner field (#0b0e0c), soft rim
> light, transparent background, centred, no text.

| Id | Material | Detail |
|---|---|---|
| `rank-iron` | brushed dark steel | a single chevron |
| `rank-bronze` | polished bronze | two chevrons |
| `rank-silver` | sterling silver | three chevrons and small swept wings |
| `rank-gold` | 24k gold | a small crown above three chevrons |
| `rank-platinum` | platinum with cyan sheen | wings and a crown |
| `rank-diamond` | faceted ice-blue diamond crystal | a diamond gem set in the centre |
| `rank-obsidian` | black volcanic glass | a glowing green (#22c55e) core seam down the centre |
| `rank-legend` | obsidian with violet amethyst (#a78bfa) inlays | a radiant crown and wings |

---

## 3. Optional hero art

| File | Prompt |
|---|---|
| `public/scenes/level-up-burst.webp` | Abstract celebratory burst of green (#22c55e) light streaks and soft particles radiating from the centre, dark #0a0d0b background, no objects, no text, square. |
| `public/scenes/collection-header.webp` | A dark display shelf with a row of glowing medals in bronze, silver, gold and platinum, shallow depth of field, cinematic, 3:1 banner, no text. |

---

## 4. Already exist (don't regenerate)

- 12 stage cuts — `public/mascots/stage/*.webp` (the tour) and 13 square
  expression crops — `public/mascots/*.webp`, all cut from the locked grids.
- Body-build silhouettes — `public/body-shapes/*` (onboarding and Body Shape).
- 16 avatar presets — `public/avatars/*`.

---

## 5. After generating — plug them in

1. Convert to WebP (quality 85, ideally ≤ 150 KB) with the bundled script —
   add `--cutout` when the PNG has a flat background instead of transparency
   (round medals are cut along their fitted circle):
   ```bash
   node scripts/convert-assets.mjs <folder-with-pngs> public/badges --cutout
   ```
2. **Medals:** put them in `public/badges/` using the file names above, then
   add each id to `AVAILABLE_ART` in
   `src/features/collection/lib/badgeArt.ts`. The medal component switches to
   the art automatically.
3. **Stage poses:** convert with `--size 720` into `public/mascots/stage/`
   and tell Claude. Each new pose gets a name in the expression types
   (`src/features/tour/script.ts`) and its body language
   (`src/features/tour/castMotion.ts`), then the script uses it: waving on
   the intro, pointing up on spotlight beats, celebrating on the finale.
4. **Check at phone size:** each medal must read at 64 px and each stage
   pose at about 240 px tall.
