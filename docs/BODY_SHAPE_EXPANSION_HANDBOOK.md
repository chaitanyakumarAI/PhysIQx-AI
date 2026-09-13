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

## 📁 COMPLETED ASSET INVENTORY (67 Certified Assets)

The following 67 high-fidelity AI assets are **certified clean** and stored in `public/body-shapes/`:

```
public/body-shapes/
├── apple_female_front.png          [BATCH 3 - Certified]
├── apple_male_front.png            [BATCH 3 - Certified]
├── apple_neutral_icon.png          [BATCH 4 - Certified]
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
├── dadbod_male_front.png           [BATCH 1 - Certified]
├── dadbod_male_side.png            [BATCH 3 - Certified]
├── dadbod_neutral_icon.png         [BATCH 4 - Certified]
├── endomorph_female_front.png      [BATCH 3 - Certified]
├── endomorph_male_front.png        [BATCH 3 - Certified]
├── hourglass_female_front.png      [BATCH 3 - Certified]
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
├── pear_female_front.png           [BATCH 3 - Certified]
├── pear_male_front.png             [BATCH 3 - Certified]
├── pear_neutral_icon.png           [BATCH 4 - Certified]
├── powerful_female_45deg.png
├── powerful_female_front.png
├── powerful_female_side.png
├── powerful_male_45deg.png
├── powerful_male_front.png
├── powerful_male_side.png
├── powerful_neutral_icon.png
├── rectangular_male_front.png      [BATCH 3 - Certified]
├── short_athletic_female_front.png [BATCH 1 - Certified]
├── short_athletic_male_front.png   [BATCH 2 - Certified]
├── short_lean_female_front.png     [BATCH 1 - Certified]
├── short_lean_male_front.png       [BATCH 1 - Certified]
├── short_lean_male_side.png        [BATCH 1 - Certified]
├── short_lean_neutral_icon.png     [BATCH 4 - Certified]
├── short_muscular_female_front.png [BATCH 2 - Certified]
├── short_muscular_male_45deg.png   [BATCH 1 - Certified]
├── short_muscular_male_front.png   [BATCH 1 - Certified]
├── short_muscular_neutral_icon.png [BATCH 4 - Certified]
├── skinnyfat_female_front.png      [BATCH 3 - Certified]
├── skinnyfat_male_front.png        [BATCH 1 - Certified]
├── skinnyfat_neutral_icon.png      [BATCH 4 - Certified]
├── tall_athletic_female_front.png  [BATCH 2 - Certified]
├── tall_athletic_male_45deg.png    [BATCH 2 - Certified]
├── tall_athletic_male_front.png    [BATCH 2 - Certified]
├── tall_lean_female_front.png      [BATCH 2 - Certified]
├── tall_lean_male_front.png        [BATCH 2 - Certified]
├── tall_lean_male_side.png         [BATCH 2 - Certified]
├── tall_lean_neutral_icon.png      [BATCH 4 - Certified]
├── tall_muscular_female_front.png  [BATCH 2 - Certified]
├── tall_muscular_male_front.png    [BATCH 2 - Certified]
└── tall_muscular_neutral_icon.png  [BATCH 4 - Certified]
```

---

## ⚙️ UNIVERSAL PROMPT SUFFIX (Mandatory for All Prompts)

Append this suffix to **every single image generation prompt**:

```text
, wearing tight form-fitting compression gym outfit — men: green compression shorts to mid-thigh and fitted sleeveless compression top; women: green compression leggings and athletic sports bra top — gym clothing rendered as a slightly denser neon green polygon mesh layer over the translucent body (NO solid black fabric NO dark clothing), neon green (#00E676) holographic body scan render, hard-edge flat-shaded low-poly triangulated mesh, zero smooth shading, pure angular faceted geometry, single-color neon green only (NOT blue NOT cyan NOT teal), subsurface green bioluminescent emission, scattered fine green data-point particles, concentric radar pulse rings at ground level beneath feet, pure black (#000000) void background, minimal biometric HUD — only faint thin corner brackets, ABSOLUTELY NO text NO numbers NO bar charts NO UI readouts, ABSOLUTELY NO INTERNAL BONES NO RIBCAGE NO SKELETON ONLY SURFACE POLYGON MESH, faceless abstract mannequin head (featureless smooth ovoid shape — no eyes no nose no mouth no hair no ears no facial features), ultra-detailed, 4K render, digital twin fitness scanner aesthetic
```

---

## 🚀 BATCH STATUSES (All Batches 100% Complete & Integrated)

### 📦 BATCH 1: Core Archetypes & Initial Short Set (39 Assets) — ✅ COMPLETE
- Core Archetypes (Lean, Athletic, Muscular, Powerful in Front, Side, 45°, Icons)
- Baseline starting points (`current_underweight`, `current_average`, `current_overweight`)
- Initial short stature explorations

### 📦 BATCH 2: Tall & Short Stature Archetypes (10 Assets) — ✅ COMPLETE
1. `tall_lean_male_front.png` ✅
2. `tall_lean_male_side.png` ✅
3. `tall_athletic_male_front.png` ✅
4. `tall_athletic_male_45deg.png` ✅
5. `tall_muscular_male_front.png` ✅
6. `tall_lean_female_front.png` ✅
7. `tall_athletic_female_front.png` ✅
8. `tall_muscular_female_front.png` ✅
9. `short_athletic_male_front.png` ✅
10. `short_muscular_female_front.png` ✅

### 📦 BATCH 3: Body Shape & Distribution Realism (10 Assets) — ✅ COMPLETE
1. `apple_male_front.png` ✅
2. `pear_female_front.png` ✅
3. `hourglass_female_front.png` ✅
4. `rectangular_male_front.png` ✅
5. `endomorph_male_front.png` ✅
6. `skinnyfat_female_front.png` ✅
7. `dadbod_male_side.png` ✅
8. `apple_female_front.png` ✅
9. `pear_male_front.png` ✅
10. `endomorph_female_front.png` ✅

### 📦 BATCH 4: Additional Angles & 1:1 Icons (8 Assets) — ✅ COMPLETE
1. `short_lean_neutral_icon.png` (1:1) ✅
2. `short_muscular_neutral_icon.png` (1:1) ✅
3. `tall_lean_neutral_icon.png` (1:1) ✅
4. `tall_muscular_neutral_icon.png` (1:1) ✅
5. `skinnyfat_neutral_icon.png` (1:1) ✅
6. `dadbod_neutral_icon.png` (1:1) ✅
7. `apple_neutral_icon.png` (1:1) ✅
8. `pear_neutral_icon.png` (1:1) ✅

---

## 📱 APP INTEGRATION & TOUCHPOINTS

All 67 assets are wired into the application:
1. **Central Asset Registry**: [`src/data/bodyScanRegistry.ts`](file:///e:/physQIx%20AI/src/data/bodyScanRegistry.ts)
2. **Dynamic Resolver & Fallbacks**: [`src/utils/bodyScanResolver.ts`](file:///e:/physQIx%20AI/src/utils/bodyScanResolver.ts)
3. **Primary Component**: [`src/components/ui/HologramBodyScan.tsx`](file:///e:/physQIx%20AI/src/components/ui/HologramBodyScan.tsx)
4. **Onboarding Flow**:
   - [`src/features/onboarding/components/steps/BodyShapeStep.tsx`](file:///e:/physQIx%20AI/src/features/onboarding/components/steps/BodyShapeStep.tsx) (Live interactive angle & gender switchers)
   - [`src/features/onboarding/components/steps/DNAResultStep.tsx`](file:///e:/physQIx%20AI/src/features/onboarding/components/steps/DNAResultStep.tsx) (PhysIQ DNA archetype holographic scan reveal)
5. **Body Stats Screen**:
   - [`src/app/(app)/profile/body/BodyContent.tsx`](file:///e:/physQIx%20AI/src/app/(app)/profile/body/BodyContent.tsx) (Dedicated Digital Twin Hologram Scan calibrated to height and shape)
6. **Interactive Demo / Scanner**:
   - [`src/app/hologram-demo/page.tsx`](file:///e:/physQIx%20AI/src/app/hologram-demo/page.tsx) (Dynamic test bench with stature, gender, angle, and archetype toggles)
