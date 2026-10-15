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
- **Output:** PNG with a **transparent background** where noted (otherwise
  flat `#0a0d0b`), **1024 × 1024**, then convert to WebP (§5).
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

## 1. Kix & Nyra — tour and celebration poses

Used by the character tour (`src/features/tour/`) and future celebrations.
Waist-up framing so they read at about 100 px on a phone. Transparent
background.

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

**Framing suffix (always):**
> Waist-up three-quarter view, centred, character fills 85% of the frame,
> transparent background, high detail fur, no text.

### Poses — save to `public/mascots/tour/`

| File | Prompt (character block + framing suffix + this) |
|---|---|
| `kix-wave.webp` | Kix raising one glowing glove in a friendly wave hello, warm open half-smile. |
| `kix-point-left.webp` | Kix pointing to the viewer's left with one glove, eager, mouth slightly open as if explaining. |
| `kix-point-right.webp` | Kix pointing to the viewer's right with one glove, eager explaining expression. |
| `kix-glove-up.webp` | Kix holding one glove up in a proud "nice work" gesture, warm proud smile. |
| `kix-celebrate.webp` | Kix with both gloves raised high in full unguarded joy, eyes bright (rare expression — reserved for milestones). |
| `kix-sheepish.webp` | Kix rubbing the back of his head with one glove, bent ear tipped forward, sheepish half-smile — caught wanting to train on a rest day. |
| `kix-thinking.webp` | Kix with one glove at his chin, considering, calm focus. |
| `kix-guard.webp` | Kix with both gloves up in a relaxed boxing guard, quiet determined focus. |
| `nyra-teach.webp` | Nyra sitting upright, calm level stare at the viewer — the "pay attention" posture. |
| `nyra-gesture.webp` | Nyra sitting upright, one front paw lifted slightly as if indicating something beside her, measuring look. |
| `nyra-narrowed.webp` | Nyra sitting upright, eyes narrowed — measuring the viewer, not angry. |
| `nyra-tilt.webp` | Nyra sitting upright, head tilted slightly, curious and assessing. |
| `nyra-nod.webp` | Nyra mid slow nod: head lowered a few degrees, eyes half-closed with approval — her rarest, most valuable expression. |
| `nyra-rest.webp` | Nyra lying calmly along a low ledge, eyes open, watchful — for rest-day moments. Full body, side view. |

### Duo and celebrations — save to `public/mascots/scenes/`

| File | Prompt |
|---|---|
| `duo-intro.webp` | Both characters together (attach both anchors): Kix standing on the left with one glove raised in welcome, Nyra sitting upright on the right in teaching posture with a level stare. Seated Nyra's eye-line sits just above standing Kix's. Dark stage, a soft green floor glow between them. Wide 3:2 framing, transparent background, no text. |
| `duo-finale.webp` | Same pair, ending beat: Kix celebrating with both gloves up, Nyra giving her slow nod. Wide 3:2, transparent background, no text. |
| `kix-level-up.webp` | Kix in full joy, gloves up, a burst of green light particles rising from the gloves — the level-up moment. Square, transparent background. |
| `nyra-legendary-nod.webp` | Nyra's slow nod, close-up portrait, green eyes half-closed, a single faint violet (#a78bfa) glint reflected in the eyes — for legendary unlocks. Square, transparent background. |

---

## 2. Collection medals — 70 items

### Medal style guide (paste into every medal prompt)

> Premium 3D game medal icon, straight-on front view, a circular medallion
> with a thick beveled rim in **{MATERIAL}**. The inner face is dark obsidian
> enamel (#0b0e0c), with a raised emblem in **{MATERIAL}**: **{EMBLEM}**. The
> emblem edges catch a soft rim light; a faint glow pools around the emblem.
> Crisp, clean, readable at 64 px. Soft studio light from the top-left.
> Mobile-game award quality, like Apple Fitness awards or Clash Royale
> badges. Isolated on a transparent background, centred, the medal fills 90%
> of the frame. No text, no letters, no numbers.

**{MATERIAL} by tier:**

| Tier | Material |
|---|---|
| Bronze | warm polished bronze with copper highlights |
| Silver | bright brushed sterling silver with cool white highlights |
| Gold | rich polished 24k gold with warm highlights |
| Platinum | cool platinum with a pale cyan sheen |
| Legendary | glossy black obsidian inlaid with glowing violet amethyst (#a78bfa) veins |

Generate Bronze → attach it → Silver → Gold → Platinum (same emblem, new
metal).

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

- 13 expression crops — `public/mascots/*.webp` (used by the tour today).
- Body-build silhouettes — `public/body-shapes/*` (onboarding and Body Shape).
- 16 avatar presets — `public/avatars/*`.

---

## 5. After generating — plug them in

1. Convert to WebP (quality 85, ideally ≤ 150 KB) with the bundled script:
   ```bash
   node scripts/convert-assets.mjs <folder-with-pngs> public/badges
   ```
2. **Medals:** put them in `public/badges/` using the file names above, then
   add each id to `AVAILABLE_ART` in
   `src/features/collection/lib/badgeArt.ts`. The medal component switches to
   the art automatically.
3. **Tour poses:** put them in `public/mascots/tour/` and tell Claude. The
   tour script (`src/features/tour/script.ts`) will be pointed at the new
   poses (pointing left or right toward the spotlight, waving on the intro,
   celebrating on the finale).
4. **Check at phone size:** each medal must read at 64 px and each portrait
   at 96 px.
