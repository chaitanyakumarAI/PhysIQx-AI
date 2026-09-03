# PhysIQx AI — Holographic Body Scan Expansion Handbook (v3)

> **Location**: `docs/BODY_SHAPE_EXPANSION_HANDBOOK.md`  
> **Target Directory**: `public/body-shapes/`  
> **Workflow Pattern**: 10 Assets per Iteration → Visual Audit → `refine and generate`

---

## 📋 WORKFLOW & COMMAND INSTRUCTIONS

To resume or execute image generation in any session:

1. **Generation Batch Command**: Request generation in batches of 10 assets using:
   ```text
   refine and generate
   ```
2. **Visual Quality Audit**: After each batch of 10, audit every image against the **5 Zero-Tolerance Constraints** below.
3. **Remediation & Replace**: If any image violates the visual standards (e.g. visible bones, wrong color, human facial features), refine the prompt, re-generate, and replace the asset before moving to the next batch.

---

## 🎨 5 ZERO-TOLERANCE VISUAL CONSTRAINTS

Every generated asset **MUST** comply with the following 5 criteria:

| # | Visual Standard | Requirement Details |
|---|---|---|
| 1 | **Single Color Palette** | **Pure `#00E676` Neon Emerald Green** only. ABSOLUTELY NO cyan, blue, teal, or multi-color gradients. |
| 2 | **Faceless Abstract Head** | Featureless smooth ovoid mannequin head. ABSOLUTELY NO eyes, nose, mouth, hair, ears, or human faces. |
| 3 | **Zero Internal Bones** | Surface triangulation polygon mesh ONLY. ABSOLUTELY NO ribcage, spine, skull, or skeletal bones visible inside. |
| 4 | **Compression Gym Apparel** | Tight form-fitting neon green compression gear (Men: mid-thigh shorts + sleeveless top; Women: full leggings + sports bra top). NO solid black clothing, NO dark fabrics. |
| 5 | **Clean HUD & Background** | Pure `#000000` pitch black background, subtle floor radar rings, faint corner brackets. ABSOLUTELY NO text, numbers, or bar charts. |

---

## 📁 COMPLETED ASSET INVENTORY (39 Certified Assets)

The following 39 high-fidelity AI assets are **certified clean** and stored in `public/body-shapes/`:

```
public/body-shapes/
├── athletic_female_45deg.png
├── athletic_female_front.png
├── athletic_female_side.png
├── athletic_male_45deg.png
├── athletic_male_front.png
├── athletic_male_side.png
├── athletic_neutral_icon.png
├── current_average_front.png
├── current_overweight_front.png
├── current_underweight_front.png
├── dadbod_male_front.png             [NEW - Certified]
├── lean_female_45deg.png
├── lean_female_front.png
├── lean_female_side.png
├── lean_male_45deg.png
├── lean_male_front.png
├── lean_male_side.png
├── lean_neutral_icon.png
├── muscular_female_45deg.png
├── muscular_female_front.png
├── muscular_female_side.png
├── muscular_male_45deg.png
├── muscular_male_front.png
├── muscular_male_side.png
├── muscular_neutral_icon.png
├── powerful_female_45deg.png
├── powerful_female_front.png
├── powerful_female_side.png
├── powerful_male_45deg.png
├── powerful_male_front.png
├── powerful_male_side.png
├── powerful_neutral_icon.png
├── short_athletic_female_front.png   [NEW - Certified]
├── short_lean_female_front.png       [NEW - Certified]
├── short_lean_male_front.png           [NEW - Certified]
├── short_lean_male_side.png            [NEW - Certified]
├── short_muscular_male_45deg.png       [NEW - Certified]
├── short_muscular_male_front.png       [NEW - Certified]
└── skinnyfat_male_front.png          [NEW - Certified]
```

---

## ⚙️ UNIVERSAL PROMPT SUFFIX (Mandatory for All Prompts)

Append this suffix to **every single image generation prompt**:

```text
, wearing tight form-fitting compression gym outfit — men: green compression shorts to mid-thigh and fitted sleeveless compression top; women: green compression leggings and athletic sports bra top — gym clothing rendered as a slightly denser neon green polygon mesh layer over the translucent body (NO solid black fabric NO dark clothing), neon green (#00E676) holographic body scan render, hard-edge flat-shaded low-poly triangulated mesh, zero smooth shading, pure angular faceted geometry, single-color neon green only (NOT blue NOT cyan NOT teal), subsurface green bioluminescent emission, scattered fine green data-point particles, concentric radar pulse rings at ground level beneath feet, pure black (#000000) void background, minimal biometric HUD — only faint thin corner brackets, ABSOLUTELY NO text NO numbers NO bar charts NO UI readouts, ABSOLUTELY NO INTERNAL BONES NO RIBCAGE NO SKELETON ONLY SURFACE POLYGON MESH, faceless abstract mannequin head (featureless smooth ovoid shape — no eyes no nose no mouth no hair no ears no facial features), ultra-detailed, 4K render, digital twin fitness scanner aesthetic
```

---

## 🚀 PENDING BATCH QUEUES (10 per Iteration)

### 📦 BATCH 2: Tall Stature Archetypes (10 Assets)

#### 1. `tall_lean_male_front`
> **Filename**: `tall_lean_male_front.png`  
> **Prompt**: `Full body front-facing holographic fitness scan of a very tall lean male (over 6-foot-1 height, elongated proportions), neutral standing stance, the figure towers in the frame — long limbs, long neck, small head relative to extreme height, very long inseam visible in compression shorts, narrow elongated torso, basketball player or rowing athlete proportions without heavy muscle mass — just tall elongated lean frame, full body head-to-toe in frame with proportional margins communicating tall stature clearly` + Universal Suffix

#### 2. `tall_lean_male_side`
> **Filename**: `tall_lean_male_side.png`  
> **Prompt**: `Full body lateral side-profile holographic fitness scan of a tall lean male (over 6-foot-1 height), standing upright in side profile, long vertical spine line, slender front-to-back torso depth, elongated arms and legs clearly readable from side angle` + Universal Suffix

#### 3. `tall_athletic_male_front`
> **Filename**: `tall_athletic_male_front.png`  
> **Prompt**: `Full body front-facing holographic fitness scan of a tall athletic male (over 6-foot-1 height), confident athletic stance, broad shoulders on an elongated torso, defined quad length, long athletic limbs with visible muscle definition through compression outfit` + Universal Suffix

#### 4. `tall_athletic_male_45deg`
> **Filename**: `tall_athletic_male_45deg.png`  
> **Prompt**: `Three-quarter 45-degree angle holographic fitness scan of a tall athletic male (over 6-foot-1 height), scanner pose, 45-degree angle reveals height, long chest depth, and broad V-taper on an elongated frame simultaneously` + Universal Suffix

#### 5. `tall_muscular_male_front`
> **Filename**: `tall_muscular_male_front.png`  
> **Prompt**: `Full body front-facing holographic fitness scan of a tall muscular male (over 6-foot-1 height), powerful standing stance, heavy muscularity distributed across an elongated frame — broad chest, thick arms, long muscular quads, impressive imposing stature` + Universal Suffix

#### 6. `tall_lean_female_front`
> **Filename**: `tall_lean_female_front.png`  
> **Prompt**: `Full body front-facing holographic fitness scan of a tall lean female (over 5-foot-10 height), neutral stance, long elegant limbs, elongated waist, high hip line, slim ectomorph proportions, fashion model or high-jumper stature` + Universal Suffix

#### 7. `tall_athletic_female_front`
> **Filename**: `tall_athletic_female_front.png`  
> **Prompt**: `Full body front-facing holographic fitness scan of a tall athletic female (over 5-foot-10 height), athletic stance, long toned legs in compression leggings, defined abdominal core, broad shoulders relative to narrow waist, volleyball player proportions` + Universal Suffix

#### 8. `tall_muscular_female_front`
> **Filename**: `tall_muscular_female_front.png`  
> **Prompt**: `Full body front-facing holographic fitness scan of a tall muscular female (over 5-foot-10 height), powerful athletic stance, developed shoulder caps, muscular long quads, strong upper body definition on a tall imposing female frame` + Universal Suffix

#### 9. `short_athletic_male_front`
> **Filename**: `short_athletic_male_front.png`  
> **Prompt**: `Full body front-facing holographic fitness scan of a short athletic male (under 5-foot-4 height), compact explosive build, short powerful legs, thick calves, broad chest relative to short stature, wrestler or sprinter compact proportions` + Universal Suffix

#### 10. `short_muscular_female_front`
> **Filename**: `short_muscular_female_front.png`  
> **Prompt**: `Full body front-facing holographic fitness scan of a short muscular female (under 5-foot-2 height), dense muscular build, thick quad sweep, strong shoulders, compact powerlifter female proportions` + Universal Suffix

---

### 📦 BATCH 3: Body Shape & Distribution Realism (10 Assets)

#### 1. `apple_male_front`
> **Filename**: `apple_male_front.png`  
> **Prompt**: `Full body front-facing holographic fitness scan of a male with android fat distribution (apple body shape), wider midsection than chest, abdominal belly projection visible through compression top, comparatively slimmer arms and legs` + Universal Suffix

#### 2. `pear_female_front`
> **Filename**: `pear_female_front.png`  
> **Prompt**: `Full body front-facing holographic fitness scan of a female with gynoid fat distribution (pear body shape), narrower shoulders and chest, defined waist transitioning into significantly wider hips, heavy thighs and glute volume` + Universal Suffix

#### 3. `hourglass_female_front`
> **Filename**: `hourglass_female_front.png`  
> **Prompt**: `Full body front-facing holographic fitness scan of a female with classic hourglass physique, equal bust and hip width with a sharply indented narrow waist, balanced curves, athletic compression leggings and bra top` + Universal Suffix

#### 4. `rectangular_male_front`
> **Filename**: `rectangular_male_front.png`  
> **Prompt**: `Full body front-facing holographic fitness scan of a male with straight/rectangular body distribution, equal width shoulders, waist, and hips, minimal waist taper, straight vertical torso side contour` + Universal Suffix

#### 5. `endomorph_male_front`
> **Filename**: `endomorph_male_front.png`  
> **Prompt**: `Full body front-facing holographic fitness scan of a male endomorph physique, broad heavy bone structure, naturally thick waist, dense limbs, solid heavy-set frame with soft waist definition` + Universal Suffix

#### 6. `skinnyfat_female_front`
> **Filename**: `skinnyfat_female_front.png`  
> **Prompt**: `Full body front-facing holographic fitness scan of a skinny-fat female starting point, slim arms and legs combined with soft abdominal belly, low muscle tone, slender frame with central waist softness` + Universal Suffix

#### 7. `dadbod_male_side`
> **Filename**: `dadbod_male_side.png`  
> **Prompt**: `Full body lateral side-profile holographic fitness scan of a male dad-bod physique, standing side profile showing distinct forward abdominal belly curve through compression shirt, moderately broad shoulders, relaxed posture` + Universal Suffix

#### 8. `apple_female_front`
> **Filename**: `apple_female_front.png`  
> **Prompt**: `Full body front-facing holographic fitness scan of an apple-shaped female, central abdominal volume, fuller waistline, slimmer legs and arms relative to torso width` + Universal Suffix

#### 9. `pear_male_front`
> **Filename**: `pear_male_front.png`  
> **Prompt**: `Full body front-facing holographic fitness scan of a male with pear body shape (lower-body fat bias), narrow shoulders, slim upper torso, widening lower waist, wide hips and thick thighs` + Universal Suffix

#### 10. `endomorph_female_front`
> **Filename**: `endomorph_female_front.png`  
> **Prompt**: `Full body front-facing holographic fitness scan of a female endomorph, wide hip structure, soft curvaceous volume across hips and thighs, solid full frame` + Universal Suffix

---

### 📦 BATCH 4: Additional Angles & Icons (8 Assets)

#### 1. `short_lean_neutral_icon`
> **Filename**: `short_lean_neutral_icon.png` (`1:1` aspect ratio)  
> **Prompt**: `Centered 1:1 ratio holographic icon scan of a short lean body archetype, full figure centered in square frame, neon green (#00E676) triangulated mesh` + Universal Suffix

#### 2. `short_muscular_neutral_icon`
> **Filename**: `short_muscular_neutral_icon.png` (`1:1` aspect ratio)  
> **Prompt**: `Centered 1:1 ratio holographic icon scan of a short stocky muscular body archetype, full figure centered in square frame, dense glowing neon green mesh` + Universal Suffix

#### 3. `tall_lean_neutral_icon`
> **Filename**: `tall_lean_neutral_icon.png` (`1:1` aspect ratio)  
> **Prompt**: `Centered 1:1 ratio holographic icon scan of a tall elongated lean body archetype, tall figure fitted into square frame, glowing neon green mesh` + Universal Suffix

#### 4. `tall_muscular_neutral_icon`
> **Filename**: `tall_muscular_neutral_icon.png` (`1:1` aspect ratio)  
> **Prompt**: `Centered 1:1 ratio holographic icon scan of a tall imposing muscular body archetype, centered in square frame, glowing neon green mesh` + Universal Suffix

#### 5. `skinnyfat_neutral_icon`
> **Filename**: `skinnyfat_neutral_icon.png` (`1:1` aspect ratio)  
> **Prompt**: `Centered 1:1 ratio holographic icon scan of a skinny-fat starting point body archetype, centered in square frame, neon green mesh` + Universal Suffix

#### 6. `dadbod_neutral_icon`
> **Filename**: `dadbod_neutral_icon.png` (`1:1` aspect ratio)  
> **Prompt**: `Centered 1:1 ratio holographic icon scan of a dad-bod starting point body archetype, centered in square frame, neon green mesh` + Universal Suffix

#### 7. `apple_neutral_icon`
> **Filename**: `apple_neutral_icon.png` (`1:1` aspect ratio)  
> **Prompt**: `Centered 1:1 ratio holographic icon scan of an apple body shape archetype, centered in square frame, neon green mesh` + Universal Suffix

#### 8. `pear_neutral_icon`
> **Filename**: `pear_neutral_icon.png` (`1:1` aspect ratio)  
> **Prompt**: `Centered 1:1 ratio holographic icon scan of a pear body shape archetype, centered in square frame, neon green mesh` + Universal Suffix

---

## 📌 RESUMING SUMMARY FOR NEXT SESSION

When resuming this process:
1. Open this file: **`docs/BODY_SHAPE_EXPANSION_HANDBOOK.md`**.
2. Run command **`refine and generate`** to process the next batch of 10 items.
3. Save generated files directly into **`public/body-shapes/`**.
4. Update the **Completed Asset Inventory** list above after each successful batch audit.
