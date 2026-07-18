# PhysIQx Mascots — Character Sheets

The canonical definition of Kix and Nyra. Every image prompt, story
episode, Rive rig, and in-app appearance traces back to this file.
Design choices here ARE the characterization — change them only with
intent.

Status: **CINEMATIC CANON — KIX LOCKED, NYRA ANCHOR LOCKED** (2026-07).
Canon in `design/mascots/`:
- `kix/kix-anchor.png` — photoreal head-and-shoulders portrait
- `kix/kix-grid.png` — eight-panel expression grid (default / focus /
  joy / sheepish ×2 / salute / determined / asleep), face consistent,
  ear fold correct, warmth intact. LOCKED.
- `nyra/nyra-anchor.png` — seated regal full-body, scar correct (thin
  healed line above the RIGHT brow), glow tight, emerges from dark.
  LOCKED.
- `nyra/nyra-grid.png` — five-panel expression grid (level stare /
  narrowed / eyes-closed-no-green / the slow nod / head tilt), scar
  consistent with the anchor in every panel, cropped to content.
  LOCKED.
- `drafts/nyra-first-cinematic-sheet.png` — her first photoreal sheet,
  retired (cheek claw-mark scar + glare contradict canon; kept for
  its panel quality).
- `archive-clay/` — the retired clay-era canon.

**THE PIVOT IS COMPLETE** — both characters have cinematic anchors +
expression grids. Next asset phase: full-body pose sets (Kix action
poses, Nyra quadruped/teaching poses), then the duo poster, then
in-app integration (Phase K1 surfaces per the ownership map).

THE ANCHORS ARE NEVER EDITED AGAIN: residual nits are corrected
forward in new prompts, never backward (edit-loop passes mutate faces
— learned the hard way). Known accepted quirk of the Kix expression
grid: the ear-fold occasionally mirror-drifts between panels;
invisible at app sizes, enforce the correct side (HIS left) in
single-pose prompts.

Glow post-pass recipe (applies to all future renders of both):
`fix-glow.js` (halo crush around Kix's gloves) and `fix-nyra-face.js`
(face de-green keeping irises) — scripts live in the job tmp dir;
recreate from this description if lost: crush green-dominant pixels
below an iris/leather brightness threshold toward dark, luminance-gate
the background.

---

## The duo in one line

**Kix** — the contender: soft outside, unbendable inside.
**Nyra** — the standard: blade outside, fracture inside.

The soft one is the strong one; the hard one is the hurt one. Kix is who
you are on a good day, Nyra is who you are becoming. The user is not
watching their story — the user is the third member of the gym.

Names: *Kix* from "kicks" — snap, quickness, fight. *Nyra* coined from
Nyx (Greek night) with Sanskrit echoes of "graceful / lustrous"; in-world
nobody knows if it's her real name.

Genders (Kix male, Nyra female) are NEVER declared — no pronouns in-app,
no visual gender-coding. Gender seeps out slowly through voice and word
choice in story content only.

---

## KIX — The Contender

**Species:** Kangaroo
**Role:** The effort. Celebration, comebacks, training beside you.
**Reads as:** calm and gentle at first glance, immovable at second.

### Design thesis

His personality IS his silhouette: soft, rounded shapes over genuinely
dense mass — solid chest, sturdy arms, grounded stance. Huggable at
first glance, unbudgeable at second. The double-take is the character.
(Draft 3's physique is the accepted reference for this balance.)

### Physical spec

| Attribute | Spec |
|---|---|
| Build | ~3 heads tall; solid and sturdy — padded chest, firm rounded torso, strong arms and haunches; soft-looking but dense, never fat, never lanky (draft 3 = reference) |
| Species markers (PROTECTED) | Deer-like tapered muzzle with split lip; long narrow feet; massive body-length tail; tall oval ears angled back |
| Stance | Long feet firmly planted, tail resting its weight on the ground — never mid-bounce in neutral poses |
| Fur | Soft charcoal `#1a1f1c` — one tone above app black, never disappears into UI |
| Belly / muzzle / inner ears | Warmer pale gray (approachability) |
| Eyes | Moderate, warm AMBER, bright and awake, soft catchlight (canonized from the locked anchor — brown was the draft) |
| Signature asymmetry | Left ear tip permanently bent — his history, never explained |
| Gear | Neon-green boxing gloves `#22c55e` with soft self-glow + matching ankle tape — the ONLY green on his body |
| Tail | Thick, grounded, resting like a tripod — stability, not bounce |

### Personality

- Calm, gentle, almost quiet — never raises his voice, never needs to
- The softness is real, but sits on something unbendable: he does not miss
- **Openly expressive — the green flag.** His face hides nothing and
  everything on it is FOR you: visible pride when you show up, genuine
  unjealous excitement for your PRs, worry only as care. Never
  passive-aggressive, never guilt-trips, always in your corner. Nyra
  is unreadable; Kix is an open book with only good pages. (He wears
  the brand green — he IS the green flag.)
- Devoted to the user first, to earning Nyra's nod second
- Flaw: impatient underneath the calm — wants to train on rest days,
  celebrates a beat too early. He gets corrected so the user never is.
- Wants: Nyra's nod. Fears: being ordinary.

### Expression range (sheet must show all)

1. Warm open half-smile, no teeth — default (canonized from the
   locked anchor; the draft said closed-mouth, the open version serves
   "openly expressive" better)
2. Quiet focus — eyes narrowed, gloves up
3. Full unguarded joy — RARE, reserved for user milestones
4. Sheepish — bent ear forward, caught training on a rest day
5. Asleep on the gym bench

### Never

Aggressive, smug, mid-shout, teeth-bared.

---

## NYRA — The Standard

**Species:** Black panther
**Role:** The discipline. Plans, standards, rest orders, the nod.
**Reads as:** stillness given a shape.

### Design thesis

Long, elegant, unhurried lines — nothing about her pose asks for
attention, which is why she commands it. Her one secret lives on her
face. She says the true thing bluntly — about effort choices, never
about the person. Underneath: something broken she never shows. We
never explain what. The armor is the brokenness made visible.

### Physical spec

| Attribute | Spec |
|---|---|
| Build | Long and low, adult-cat elegance; taller than Kix when seated upright |
| Form | Quadruped by default; semi-anthro upright ONLY in teaching mode (see Art direction) |
| Movement | Implied even in stillness |
| Coat | True matte black `#0d0f0e` — darker than Kix; she emerges from dark UI rather than sitting on it |
| Eyes | Luminous green `#22c55e` — her ONLY light. The glow hugs the eyes: tight rim + a whisper at the inner brow, NOTHING beyond — no cheek/neck/shoulder green (canonized with the anchor; the draft's shoulder-trace read as paint and was cut) |
| Gear | None. No accessories. Her green is internal where Kix's is equipment |
| Signature mark | One thin pale old scar, short, over the RIGHT brow (canonized from the anchor as rendered; the draft said left) — barely visible until you look. The only evidence of what broke her. Never referenced, never explained |
| Mouth | Set, neutral — she has no default smile |

### Personality

- Still — moves only when movement means something
- Precise — sees the set you cut short from across the gym
- No filter — says the true thing immediately, without softening it
- Secretly kind — the plan on the wall is always exactly what you
  needed; she stays after close re-taping Kix's gloves
- Flaw: she cannot celebrate. Her maximum is a slow nod — which makes
  the nod priceless
- Broken inside: cause unknown, never shown in-app, circled (never
  landed on) by story episodes
- Backstory rule: the "former champion" rumor stays a rumor forever.
  Kix believes it completely. We never confirm.

### Expression range

1. Level stare — default
2. Eyes narrowed — you're being measured
3. Eyes closed — disappointment (her harshest expression)
4. The slow nod — the rarest asset in the brand
5. **Sheet-only:** alone, eyes down, guard fully off — the broken
   interior. Reserved exclusively for deep story episodes; the app
   NEVER shows this.

### Never

Snarling, pouncing, fangs, "cool action pose" — the moment she
performs, she's dead as a character.

---

## Art direction (REVISED 2026-07 — the cinematic pivot)

**Style: cinematic realism** — photographic fur, true animal anatomy,
dramatic dark lighting. Decided after a side-by-side test: the
photoreal Nyra was categorically stronger, and a photoreal Kix test
PASSED the warmth check (amber eyes + open half-smile survive real
anatomy). The characters remain DESIGNED film characters, not
wildlife photography: the folded ear, the glowing gear, the green
eyes, the scar, and the full expression ranges are all still canon —
realism is the rendering, not the character.

The clay-era canon lives in `design/mascots/archive-clay/` — kept as
the "storybook style" (possible future use: merch, alternate art).
Its reference images (`reference_style/stylized-3d/`) no longer drive
mascot generation.

**The dials that SURVIVE the pivot (hard rules):**

1. Palette muted — green `#22c55e` is the only loud note
2. Emotional register serious — warmth allowed, cuteness not
3. Glow is physical — soft inner luminance on surfaces, light kisses
   nearby fur, the air stays dark; no halo, no lens flare
4. Motion restrained — stillness is a pose

**Small-size rule:** in-app tiny surfaces use tight crops of the
cinematic renders (eyes/face carry the identity); if muddiness
appears at icon sizes, a simplified vector mark is derived per
surface — never a third full style.

**Nyra's two postures (canon):**
- **Quadruped** — her default state everywhere: prowling, lying across
  the doorway, seated watching. A real panther.
- **Semi-anthro upright** — her *teaching mode* only: sitting up with
  near-human posture when she explains something in the app (coach
  cards, plans, insights). The posture shift is itself a wordless
  signal: when Nyra sits up, pay attention.

**Glow language:** one emissive source per character — Kix's gloves,
Nyra's eyes — soft falloff, never lens-flare. Mirrors the reference
boy's ember arm: the glow is part of the body's story, not an effect.

**Production route:** AI generation with these style references
attached, prompts authored in this repo, user drives the generator.
Sequence: Kix sheet first → lock → Nyra generated with Kix's winning
sheet as an additional style anchor → pose sets. If a future
commercial push needs perfect consistency, a one-time human character
artist pass over the locked designs is the upgrade path.

---

## Shared world rules

- Same stylized-3D mascot style: Pixar-appeal rounded forms, no
  realistic fur strands, no teeth
- All light is green `#22c55e` or near-white; background always flat
  `#0a0d0b`
- Scale relationship FIXED: seated Nyra's eye-line sits just above
  standing Kix's
- No gender markers of any kind — no lash-coding, no accessories-as-
  gender, no body-shape shorthand
- In-app both are SILENT — they act, never talk. Push notifications are
  the one exception (each in their own voice). Story videos may add
  voice later
- Anti-Clippy law: they appear at moments of emotion, never at moments
  of input. Never during a live set. Never both on one data screen.
  Duo scenes are reserved for legendary moments (onboarding finale,
  30-day streak, score band-up)
- Nyra never shames. Kix never warns.

## Surface ownership

| Surface | Owner |
|---|---|
| Workout Complete, PRs, comebacks, empty states, cardio, 404 | Kix |
| Coach program face, insight cards, streak-risk, rest-day, band-ups | Nyra |
| Onboarding finale, 30-day streak, band-up moments, anniversaries | Both (rare by design) |

## Consistency clause

Append to EVERY generation, always:

> Character reference sheet, consistent character design across all
> poses, same proportions and colors in every view, front view / side
> view / three-quarter view, expression grid, flat #0a0d0b background,
> no text labels.

---

## Generation prompts (v1 — attach `reference_style/stylized-3d/*` as style images to every run)

### Kix — MASTER PROMPT A: turnaround sheet (SUPERSEDED — the anchor exists)

Kept for history / regeneration-from-scratch emergencies only. For all
new Kix art, attach `design/mascots/kix/kix-anchor.png` and describe
the pose/expression — never re-describe the character from text.

Paste whole. Attach all 5 images from `reference_style/stylized-3d/`.

> Professional character reference sheet for a AAA animated film,
> matching the exact rendering style of the attached reference images —
> stylized realism: sculpted painted-clay forms, matte materials,
> serious emotional register, believable light. One character, three
> full-body views on one sheet: front view, three-quarter view, side
> view — evenly spaced, identical scale, identical proportions and
> colors in every view, standing on the same invisible ground line.
> Flat near-black background (#0a0d0b), a single soft contact shadow
> under each pose, nothing else in frame. No text, no labels, no
> watermark, no logos.
>
> THE CHARACTER — "Kix," a boxing kangaroo. His design law: soft at
> first glance, immovable at second. A viewer should want to hug him,
> then notice he could not be pushed over.
>
> PROPORTIONS: compact, about 2.5 heads tall — stylized but dignified,
> not chibi. Head large with real skull structure. Shoulders broad,
> about one and a half head-widths. Center of gravity low and settled.
>
> HEAD & FACE: rounded kangaroo head with a soft, slightly shortened
> muzzle; simple dark matte nose. Eyes moderately large — never
> oversized — deep warm brown, heavy-lidded, calm, with a small soft
> catchlight; he looks quietly sure, never sleepy. Subtle fur-covered
> brow ridges capable of gentle expression. Default expression: a calm
> closed-mouth half-smile — settled confidence, zero smugness, zero
> aggression, no teeth ever. Tall rounded ears; THE SIGNATURE: the tip
> of his LEFT ear is permanently folded forward at its final third —
> an old, healed detail, not an injury on display.
>
> BODY: soft rounded silhouette built over genuinely dense mass —
> a padded chest flowing into a round firm belly, thick strong
> forearms, powerful haunches, wide stable feet planted flat and
> slightly apart. He stands still and grounded — never mid-bounce.
> Thick muscular tail resting its full weight on the ground behind him
> like a third leg, a tripod of stability.
>
> FUR & COLOR: fur rendered as soft sculpted matte clumps — grouped
> painted-clay masses with visible directional flow, NO individual
> hair strands, NO gloss. Body coat: soft deep charcoal (#1a1f1c),
> clearly a step above pure black. Warmer pale-gray zones: muzzle,
> chest-and-belly panel, inner ears. Palette otherwise muted and
> desaturated.
>
> GEAR — THE ONLY COLOR: neon green boxing gloves (#22c55e), worn
> matte leather with stitched seams, emitting a soft inner glow with
> gentle falloff onto his forearms and chest — as if lit from within,
> never a lens flare. Matching green athletic tape wrapped at both
> ankles, faintly glowing. Nothing else on the body: no clothing, no
> logos, no accessories.
>
> LIGHTING & RENDER: soft neutral studio key from upper left, low
> ambient fill, the only colored light in the scene being the green
> bounce from his own gloves. Subtle subsurface softness in the ears.
> Physically plausible materials, cinematic but restrained — a
> character sheet, not a poster.
>
> NEVER: oversized eyes, plastic or glossy surfaces, individual fur
> strands, photorealism, cartoon outlines, chibi cuteness, aggression,
> bared teeth, mid-action poses, extra costume pieces, bright or
> colorful backgrounds, blue or purple light, text of any kind.

Condensed fallback (for generators that truncate long prompts):

> Character reference sheet, stylized-realism 3D like the attached
> images — painted-clay sculpted fur, matte materials, serious tone.
> A compact boxing kangaroo, 2.5 heads tall, soft rounded silhouette
> over dense mass: broad shoulders, thick forearms, round firm belly,
> planted feet, heavy tail resting like a tripod. Charcoal fur
> #1a1f1c, pale-gray muzzle/belly/inner ears, left ear tip folded
> forward. Calm heavy-lidded brown eyes, subtle brow ridges, gentle
> closed-mouth half-smile. Neon green boxing gloves #22c55e with soft
> inner glow + green ankle tape — the only color. Front, 3/4 and side
> views, identical proportions, flat #0a0d0b background, soft contact
> shadows, no text. Never: big eyes, gloss, fur strands, teeth,
> outlines, chibi, action poses.

### Kix — Prompt B: expression grid (v2 — run with the ANCHOR attached, not the style refs)

> Expression study grid of EXACTLY this character from the attached
> reference image — identical design, proportions, fur style, colors,
> amber eyes, folded left ear tip, green gloves. Same rendering style,
> flat #0a0d0b background, no text labels. His personality: openly
> expressive and warm — every feeling readable at a glance, ears and
> brows doing loud work while the mouth stays gentle. Six panels, bust
> framing, arranged in a grid: 1) his default warm open half-smile, no
> teeth, genuinely glad to see you; 2) quiet focus — eyes narrowed,
> gloves raised in guard; 3) full unguarded joy — eyes bright, ears
> up, the biggest smile he has, still no teeth; 4) sheepish — bent ear
> tipped forward, eyes aside, caught doing something he shouldn't;
> 5) proud of YOU — soft eyes, chin slightly raised, one glove lifted
> in salute; 6) asleep — peaceful, eyes closed, slumped. Glove rules:
> both gloves glow equally with a soft inner luminance, no outer halo;
> ankle tape (if visible) is the same deep green #22c55e as the
> gloves.

### Nyra — MASTER PROMPT A: hero portrait (v2 — attach the 5 style refs + `kix-anchor.png` as the universe anchor)

Lesson from Kix applied: lock the design in ONE hero image first, then
derive turnaround/poses from the winner. Paste whole:

> A single character design portrait, three-quarter view, of an
> original animated-film character, rendered exactly in the style of
> the attached reference images — stylized realism: hand-sculpted
> painted-clay look, matte materials, serious cinematic lighting, flat
> near-black background (#0a0d0b), soft contact shadow. The attached
> kangaroo character is from the same film: match his rendering style,
> material feel and world exactly, but do NOT include him in the
> image.
>
> "Nyra" — an adult black panther. Her design law: stillness given a
> shape. Nothing about her pose asks for attention, which is why she
> commands it. Dignity, never menace. Calm, watchful, unreadable.
>
> POSE: seated quadruped, upright and regal like a sculpture of
> herself — front paws together, tail wrapped around them with the
> tip resting still, head turned three-quarter toward the viewer,
> level gaze. A real panther's posture, unhurried, symmetric, settled.
>
> ANATOMY — true big cat, PROTECTED: broad panther skull with strong
> jaw, small rounded ears, heavy soft paws, long thick tail. Long,
> elegant, adult-cat proportions — stylized but never cute, never
> kitten-like, never dog-like.
>
> SURFACE: fur as smooth sculpted matte masses — velvet over muscle,
> painted-clay finish, NO individual hair strands, NO gloss, NO shine.
> Coat: true matte black (#0d0f0e), darker than the kangaroo's
> charcoal, so dark her silhouette almost merges with the background —
> she EMERGES from the dark rather than standing on it.
>
> EYES — her only light: luminous green (#22c55e), steady and level,
> half-lidded calm, casting a very faint green glow onto her brow and
> cheekbones, with the subtlest green trace along her shoulder line.
> No other light source on her body. NO glowing markings, NO glowing
> lines or patterns on the coat, NO circuit lines.
>
> FACE: set neutral mouth — she has no default smile. Subtle
> fur-covered brow ridges. One thin pale old scar, short, over the
> LEFT brow — barely visible until you look, healed long ago. Her
> expression gives nothing away.
>
> LIGHT: very dim neutral key from upper left, a subtle cool rim
> along her back edge separating her from the background, and the
> green of her own eyes as the only colored light.
>
> NEVER: snarling, fangs, open mouth, aggression, cuteness, big round
> eyes, kitten proportions, gloss, plastic, fur strands, collar,
> accessories, gear, glowing body markings, blue or purple light,
> action pose, text, watermark.

### Nyra — Prompt B: expression grid (v2 — run with `nyra-anchor.png` attached, nothing else)

> Expression study grid of EXACTLY this character from the attached
> reference image — identical black panther, same face structure, same
> matte black coat, same green eyes, same thin pale scar over the
> right brow, same rendering style. Flat #0a0d0b background, no text
> labels. Her nature: still, precise, unreadable — she expresses only
> through her eyes and tiny shifts of the head; her mouth never moves.
> Five panels, head-and-shoulders framing, arranged in a grid: 1)
> level stare — calm, direct, unreadable, her default; 2) eyes
> narrowed — measuring you, precise, not angry; 3) eyes fully closed,
> head perfectly level — quiet disappointment, her harshest
> expression; 4) the slow approving nod — head bowed a few degrees,
> eyes softened, the barest hint of warmth, the rarest thing she does;
> 5) head tilted slightly, one ear turned — curiosity, almost
> imperceptible. GLOW RULES: the green stays tight around the eyes
> only — no glow on cheeks, neck or shoulders, no outer halo, the air
> stays dark. In panel 3 (eyes closed) her face carries NO green at
> all — the light is gone with the eyes. Mouth closed and neutral in
> every panel, no fangs, no snarl, never.

**Iteration rules:** generate 4+ candidates per prompt; judge against
the four dials before anything else. Reject: oversized eyes, glossy
materials, visible fur strands, aggression, cuteness-drift (Kix) or
menace-drift (Nyra). When a candidate wins, it becomes the permanent
style anchor attached to every future generation of that character.

**Acceptance test:** place Nyra's level stare beside Kix's calm
half-smile. "Kids' movie" gut reading → eyes too big or materials too
glossy, regenerate. Countable fur strands → too real, regenerate.

---

## Open decisions

None — both characters locked.

## Resolved decisions

- **Nyra's scar: approved and locked with the anchor** — right brow,
  thin, pale, healed; visible on the second look, exactly as the
  "broken inside" concept demands.

- **Kix's gloves: always on** (locked with the anchor). Gloves-off
  unlocks only if story videos someday need it.
- **Kix anchor** = the glow-corrected polish draft (v1 post pass,
  2026-07-18). Known accepted quirks: soft glow bleed at glove edges
  (physically honest for emissive leather). Forward-prompt rules that
  every future Kix generation must carry: ankle tape is the same deep
  green #22c55e as the gloves; both gloves glow equally, soft inner
  luminance, no outer halo.
