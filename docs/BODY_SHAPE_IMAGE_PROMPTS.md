# PhysIQx AI — Body Shape Image Generation Prompts (v2)

> **Output folder**: `public/body-shapes/`
> **Recommended tools**: Midjourney v6 (`--style raw --ar 3:4`), Leonardo AI (Alchemy), Stable Diffusion XL

---

## ❌ MISTAKES FROM BATCH 1 — FIXED IN v2

| Issue | What went wrong | Fix applied |
|---|---|---|
| **No clothing** | Figures rendered as bare body mesh — inappropriate | Explicit compression gym outfit added to every prompt |
| **Wrong color** | Output was cyan/teal/blue, not brand green | Stronger green spec: `#00E676 neon green`, explicit "NOT blue, NOT cyan" |
| **Visible faces** | Male front had a realistic rendered face | Added "faceless abstract head — featureless ovoid" |
| **UI clutter** | Female image had random bar charts, big text overlays | Changed to "minimal HUD annotation only — NO bar charts, NO text overlays, NO readout panels" |
| **Mesh too smooth** | Low-poly but still somewhat smooth shading | "hard-edge flat-shaded polygons, zero smooth shading, no Phong/Gouraud shading" |
| **Inconsistent glow** | Some images had inner blue glow competing with green | "single-color neon green only, no blue inner glow" |

---

## ⚙️ UNIVERSAL STYLE SUFFIX (v2)
Append this to **every** prompt below, word for word:

```
, wearing tight form-fitting compression gym outfit — men: green compression shorts to mid-thigh and fitted sleeveless compression top; women: green compression leggings and athletic sports bra top — gym clothing rendered as a slightly denser neon green polygon mesh layer over the translucent body (NO solid black fabric, NO dark clothing), body shape contours and muscle volumes fully readable through the tight translucent mesh, neon green (#00E676) holographic body scan render, hard-edge flat-shaded low-poly triangulated mesh, zero smooth shading, pure angular faceted geometry, single-color neon green only (NOT blue NOT cyan NOT teal), subsurface green bioluminescent emission from muscle mass, translucent volumetric holographic figure, scattered fine green data-point particles around silhouette extremities, concentric radar pulse rings at ground level beneath feet, pure black (#000000) void background, minimal biometric HUD — only faint thin corner brackets, ABSOLUTELY NO text, NO numbers, NO bar charts, NO UI readouts, faceless abstract mannequin head (featureless smooth ovoid shape — no eyes no nose no mouth no hair no facial features), ultra-detailed, sharp angular geometry, 4K render, digital twin fitness scanner aesthetic
```

---

## 🏃 CATEGORY 1: LEAN
> Filename prefix: `lean_` | Low body fat, slim frame, runner/cyclist build

---

### `lean_male_front.png`
```
Full body front-facing holographic fitness scan of a lean male wearing compression gym outfit, neutral standing stance feet shoulder-width apart, slim narrow torso, runner's proportions — narrow hips and long lean legs, minimal muscle bulk but subtle muscle definition visible through the compression mesh, flat stomach, light ectomorph frame, full body head-to-toe in frame with equal space above head and below feet
```
*[append UNIVERSAL STYLE SUFFIX]*

---

### `lean_male_side.png`
```
Full body lateral side-profile holographic fitness scan of a lean male wearing compression gym outfit, standing upright in perfect side view, slim front-to-back depth from side angle, minimal chest projection, almost no gluteal depth, long thin limbs, marathon runner side silhouette — extremely narrow profile in every plane, compression shorts and sleeveless top visible as denser polygon layer, full body head-to-toe visible in frame
```
*[append UNIVERSAL STYLE SUFFIX]*

---

### `lean_male_45deg.png`
```
Three-quarter 45-degree angle holographic fitness scan of a lean male wearing compression gym outfit, mid-stride running posture frozen in scan — one foot slightly ahead, arms at sides with slight swing, forward lean energy, elongated slim silhouette, hip flexor and oblique region readable through compression mesh, shoulder girdle narrow and angular in the mesh topology, full body visible in frame
```
*[append UNIVERSAL STYLE SUFFIX]*

---

### `lean_female_front.png`
```
Full body front-facing holographic fitness scan of a lean female wearing compression gym outfit — black compression leggings and sports bra, neutral standing stance, slim narrow frame, ballet dancer or distance runner proportions, long lean legs, flat stomach, narrow hips proportionate to slim shoulders, low body fat readable through the tight compression leggings mesh, minimal curves, ectomorph female frame, full body head-to-toe in frame
```
*[append UNIVERSAL STYLE SUFFIX]*

---

### `lean_female_side.png`
```
Full body lateral side-profile holographic fitness scan of a lean female wearing compression gym outfit — compression leggings and sports bra visible as denser polygon layer, standing upright in perfect side view, minimal front-to-back body depth, flat chest projection, minimal glute depth, long neck, slim calf taper, cross-country runner side silhouette — almost no curve depth from this angle, full body head-to-toe visible
```
*[append UNIVERSAL STYLE SUFFIX]*

---

### `lean_female_45deg.png`
```
Three-quarter 45-degree angle holographic fitness scan of a lean female wearing compression gym outfit — compression leggings and sports bra, slight contrapposto weight shift on one leg, arms relaxed, elongated slim silhouette readable from this angle, sprinter-at-rest pose energy, angular mesh planes across the lean torso and thighs, full body visible in frame
```
*[append UNIVERSAL STYLE SUFFIX]*

---

### `lean_neutral_icon.png` — SQUARE 1:1 FORMAT
```
Compact centered holographic fitness scan of a lean androgynous figure wearing compression gym outfit, gender-neutral slim physique, square composition with figure centered and full body head-to-toe visible with even margins all sides, narrow slim silhouette immediately readable as lean body type at thumbnail size, minimal simplified mesh for icon legibility
```
*[append UNIVERSAL STYLE SUFFIX]*

---

## 💪 CATEGORY 2: ATHLETIC
> Filename prefix: `athletic_` | V-taper, balanced muscle, swimmer/decathlete build

---

### `athletic_male_front.png`
```
Full body front-facing holographic fitness scan of an athletic male wearing compression gym outfit — compression shorts and sleeveless top, confident neutral stance, clear V-taper body shape — broad shoulders visibly wider than waist, visible abdominal definition through compression top mesh, moderate chest width, developed arms with bicep and tricep volume readable through the sleeve-less compression top, balanced quad mass in compression shorts, Olympic decathlete or swimmer proportions, full body head-to-toe in frame
```
*[append UNIVERSAL STYLE SUFFIX]*

---

### `athletic_male_side.png`
```
Full body lateral side-profile holographic fitness scan of an athletic male wearing compression gym outfit, upright posture, visible chest depth from side — chest projects forward with clear pec-to-ab transition readable in mesh, tight glutes with functional athletic projection visible from side, strong hamstring volume, prominent calf development, balanced front-to-back muscle depth — neither too lean nor too bulky, full body visible in frame
```
*[append UNIVERSAL STYLE SUFFIX]*

---

### `athletic_male_45deg.png`
```
Three-quarter 45-degree angle holographic fitness scan of an athletic male wearing compression gym outfit — compression shorts and sleeveless top, confident power stance feet hip-width, the 45-degree angle simultaneously reveals V-taper width AND slight chest depth, rounded deltoid cap visible from this angle, core tight and visible through compression top mesh, athletic readiness energy, full body visible in frame
```
*[append UNIVERSAL STYLE SUFFIX]*

---

### `athletic_female_front.png`
```
Full body front-facing holographic fitness scan of an athletic female wearing compression gym outfit — black compression leggings and sports bra, poised neutral stance, athletic hourglass with muscle definition — broader shoulders than a lean female, visible abdominal tone through sports bra mesh, toned arms with deltoid shape readable, moderate quad and glute development visible through compression leggings mesh, elite gymnast or volleyball player proportions, full body head-to-toe in frame
```
*[append UNIVERSAL STYLE SUFFIX]*

---

### `athletic_female_side.png`
```
Full body lateral side-profile holographic fitness scan of an athletic female wearing compression gym outfit — compression leggings and sports bra, upright proud posture, visible glute development from side — athletic posterior chain projection clear in profile, strong hamstring mass, defined calf, tight core visible from side, the side mesh cascade from shoulder to calf shows athletic functional depth, full body visible in frame
```
*[append UNIVERSAL STYLE SUFFIX]*

---

### `athletic_female_45deg.png`
```
Three-quarter 45-degree angle holographic fitness scan of an athletic female wearing compression gym outfit — compression leggings and sports bra, weight shifted to back foot with front leg slightly extended, arms relaxed and toned, the 45-degree angle reveals both front abdominal tone AND side glute profile simultaneously, athletic shoulder width visible, mesh glows most intensely at major trained muscle group volumes, full body visible in frame
```
*[append UNIVERSAL STYLE SUFFIX]*

---

### `athletic_neutral_icon.png` — SQUARE 1:1 FORMAT
```
Compact centered holographic fitness scan of an athletic androgynous figure wearing compression gym outfit, gender-neutral V-taper physique, square composition with figure centered and full body visible with even margins, clear V-taper silhouette readable at thumbnail size, stronger mesh glow than lean icon variant, immediately recognizable as athletic body type
```
*[append UNIVERSAL STYLE SUFFIX]*

---

## 🏋️ CATEGORY 3: MUSCULAR
> Filename prefix: `muscular_` | Large defined muscles, hypertrophy build

---

### `muscular_male_front.png`
```
Full body front-facing holographic fitness scan of a highly muscular male wearing compression gym outfit — tight compression shorts and sleeveless compression top stretched over large muscle mass, relaxed front pose with arms naturally away from body due to lat width, extremely developed chest — pectoral mass creates deep overhang visible through stretched compression top mesh, large rounded deltoids, peaked bicep mass visible, thick neck and traps rising above shoulders, wide torso at top with dramatic taper, prominent quad sweep in compression shorts, bodybuilder physique — classic physique division size, full body head-to-toe in frame
```
*[append UNIVERSAL STYLE SUFFIX]*

---

### `muscular_male_side.png`
```
Full body lateral side-profile holographic fitness scan of a highly muscular male wearing compression gym outfit, side view reveals extraordinary depth — large chest projects far forward, thick back mass projects rearward, thick glute and hamstring mass from side, powerful calf, compression top stretched tightly across the chest and back depth showing enormous muscle volume, the side mesh shows layered muscle plane depth from shoulder to hip, full body visible in frame
```
*[append UNIVERSAL STYLE SUFFIX]*

---

### `muscular_male_45deg.png`
```
Three-quarter 45-degree angle holographic fitness scan of a highly muscular male wearing compression gym outfit — compression shorts and sleeveless top, the 45-degree angle reveals the lat spread and chest depth simultaneously — the widest silhouette in this category set, rounded shoulder cap, thick arm mass, the compression top mesh is stretched most densely across the overlapping pec-delt-trap junction showing massive muscle volume, full body visible in frame
```
*[append UNIVERSAL STYLE SUFFIX]*

---

### `muscular_female_front.png`
```
Full body front-facing holographic fitness scan of a muscular female wearing compression gym outfit — black compression leggings and sports bra stretched over developed muscle mass, confident wide stance, heavily developed shoulders and arms for a female frame, visible abdominal muscle detail through sports bra mesh, developed glute and quad mass filling compression leggings, strong thick legs, women's physique competitor aesthetic, full body head-to-toe in frame
```
*[append UNIVERSAL STYLE SUFFIX]*

---

### `muscular_female_side.png`
```
Full body lateral side-profile holographic fitness scan of a muscular female wearing compression gym outfit — compression leggings and sports bra, side view highlights dramatic glute development — substantial rounded posterior projection clearly visible through compression leggings mesh, developed hamstrings, chest depth appropriate to development, thick arm mass in profile, the compression legging mesh wraps tightly over the large glute and quad volumes, full body visible in frame
```
*[append UNIVERSAL STYLE SUFFIX]*

---

### `muscular_female_45deg.png`
```
Three-quarter 45-degree angle holographic fitness scan of a muscular female wearing compression gym outfit — compression leggings and sports bra, arms slightly flexed showing bicep peak from this angle, strong shoulder cap, the 45-degree angle simultaneously shows front quad sweep AND side glute development — largest female silhouette in this set, dense mesh glows brightest over the largest muscle mass concentrations, full body visible in frame
```
*[append UNIVERSAL STYLE SUFFIX]*

---

### `muscular_neutral_icon.png` — SQUARE 1:1 FORMAT
```
Compact centered holographic fitness scan of a muscular androgynous figure wearing compression gym outfit, gender-neutral large muscular physique, square composition with figure centered and full body visible, wide shoulders and thick arms clearly readable at thumbnail size, denser more complex polygon mesh than lean or athletic icon variants, deepest green glow intensity of the four icon variants
```
*[append UNIVERSAL STYLE SUFFIX]*

---

## 🪨 CATEGORY 4: POWERFUL
> Filename prefix: `powerful_` | Maximum mass, powerlifter/strongman build

---

### `powerful_male_front.png`
```
Full body front-facing holographic fitness scan of an extremely powerful heavy-set male wearing compression gym outfit — compression shorts and sleeveless top stretched to their limits over enormous body mass, very wide power stance, barrel chest of extraordinary width and depth visible through the stretched compression top, thick traps rising to meet the neck making neck appear very short, massive arms that hang away from body due to sheer lat mass, enormous quad mass in compression shorts with inner sweep nearly touching, thick calves, raw powerlifter physique — maximum mass body, full body head-to-toe in frame
```
*[append UNIVERSAL STYLE SUFFIX]*

---

### `powerful_male_side.png`
```
Full body lateral side-profile holographic fitness scan of a powerful heavy-set male wearing compression gym outfit, the side profile is the most dramatically thick in the entire set — enormous chest projects far forward through stretched compression top, thick abdominal depth, massive glute and hamstring projection rearward, thick neck from side, the compression top and shorts are stretched across the sheer mass, the polygon mesh is largest and boldest across the maximum body volumes, full body visible in frame
```
*[append UNIVERSAL STYLE SUFFIX]*

---

### `powerful_male_45deg.png`
```
Three-quarter 45-degree angle holographic fitness scan of a powerful heavy-set male wearing compression gym outfit, immovable wide power stance at 45 degrees, radiating physical dominance, 45-degree angle reveals both the enormous chest depth AND thick back simultaneously, traps cresting over the shoulders visible from this angle, massive arm hangs away from body, compression outfit stretched over every muscle mass, the most intensely glowing scan in the male set due to maximum body mass, full body visible in frame
```
*[append UNIVERSAL STYLE SUFFIX]*

---

### `powerful_female_front.png`
```
Full body front-facing holographic fitness scan of a powerful strong female wearing compression gym outfit — black compression leggings and sports bra stretched over substantial powerful physique, Olympic weightlifter or powerlifter build, thick strong legs with dense quad development visible through compression leggings mesh, broad shoulders for female frame, substantial overall body mass with functional strength build, confident wide stance, full body head-to-toe in frame
```
*[append UNIVERSAL STYLE SUFFIX]*

---

### `powerful_female_side.png`
```
Full body lateral side-profile holographic fitness scan of a powerful strong female wearing compression gym outfit — compression leggings and sports bra, side view shows the most substantial female profile in the set — thick anterior and posterior body depth, strong glute projection rearward through compression leggings, heavy hamstrings, thick calf, the side silhouette is clearly wider and more voluminous than any other female variant, full body visible in frame
```
*[append UNIVERSAL STYLE SUFFIX]*

---

### `powerful_female_45deg.png`
```
Three-quarter 45-degree angle holographic fitness scan of a powerful strong female wearing compression gym outfit — compression leggings and sports bra stretched over powerful physique, commanding wide stance at 45 degrees, arms slightly away from body due to overall mass, thick arms and broad shoulders visible, the 45-degree angle communicates sheer size and presence, maximum brightness green glow in female set due to greatest body mass, full body visible in frame
```
*[append UNIVERSAL STYLE SUFFIX]*

---

### `powerful_neutral_icon.png` — SQUARE 1:1 FORMAT
```
Compact centered holographic fitness scan of a powerful heavy-set androgynous figure wearing compression gym outfit, gender-neutral maximum-mass physique, square composition with figure centered and full body visible, widest and heaviest silhouette of all four icon variants — clearly the largest body in the set at thumbnail size, thick arms wide stance and barrel chest readable in miniature, most densely packed polygon mesh of all icons
```
*[append UNIVERSAL STYLE SUFFIX]*

---

## 🎯 BONUS: CURRENT STATE VARIANTS
> Prefix: `current_` — Starting point scans for Body Pillar comparison view

---

### `current_underweight_front.png`
```
Full body front-facing holographic fitness scan of an underweight male wearing compression gym outfit — compression shorts and sleeveless top loose on the thin frame, very slim narrow physique with low muscle mass, prominent shoulder bones and collar visible through loose compression top mesh, thin arms, minimal leg mass, sparse point-cloud mesh communicating the beginning of a fitness journey — fewer data points than the trained physiques, low-energy scan presence, full body head-to-toe in frame
```
*[append UNIVERSAL STYLE SUFFIX]*

---

### `current_average_front.png`
```
Full body front-facing holographic fitness scan of an average untrained male wearing compression gym outfit — compression shorts and t-shirt style compression top, moderate body fat with little muscle definition, soft belly visible through compression top mesh, minimal arm definition, legs lack development, the scan mesh is softer and more rounded than the trained physiques — fewer sharp muscle plane transitions, modest polygon complexity, "day one at the gym" physique energy, full body head-to-toe in frame
```
*[append UNIVERSAL STYLE SUFFIX]*

---

### `current_overweight_front.png`
```
Full body front-facing holographic fitness scan of an overweight male wearing compression gym outfit — compression shorts and fitted compression top that wraps the body with dignity and respect, substantial body volume visible through the scan mesh depth — wider midsection, fuller limbs, rounded silhouette rendered with technical precision not caricature, the holographic scan treats this starting-point body with the same clinical dignity as the goal physiques, full body head-to-toe in frame
```
*[append UNIVERSAL STYLE SUFFIX]*

---

## 🎨 GENERATION SETTINGS

| Setting | Value |
|---|---|
| **Primary color** | Neon green `#00E676` — NOT blue, NOT cyan |
| **Background** | Pure black `#000000` |
| **Face** | Featureless ovoid — no facial features |
| **HUD overlay** | Minimal — thin measurement lines and corner brackets ONLY |
| **Aspect ratio** | `3:4` for all card variants · `1:1` for `_neutral_icon` variants |
| **Mesh density** | Lean = sparse wide triangles · Powerful = dense compressed polygons |
| **Glow intensity** | Lean = subtle · Athletic = moderate · Muscular = strong · Powerful = maximum |
| **Midjourney flag** | `--style raw --v 6 --ar 3:4` (or `--ar 1:1` for icons) |

---

## 📁 FILE MANIFEST (33 high-fidelity AI images total)

```
public/body-shapes/
lean_male_front.png · lean_male_side.png · lean_male_45deg.png
lean_female_front.png · lean_female_side.png · lean_female_45deg.png
lean_neutral_icon.png
athletic_male_front.png · athletic_male_side.png · athletic_male_45deg.png
athletic_female_front.png · athletic_female_side.png · athletic_female_45deg.png
athletic_neutral_icon.png
muscular_male_front.png · muscular_male_side.png · muscular_male_45deg.png
muscular_female_front.png · muscular_female_side.png · muscular_female_45deg.png
muscular_neutral_icon.png
powerful_male_front.png · powerful_male_side.png · powerful_male_45deg.png
powerful_female_front.png · powerful_female_side.png · powerful_female_45deg.png
powerful_neutral_icon.png
current_underweight_front.png · current_average_front.png · current_overweight_front.png
skinnyfat_male_front.png · dadbod_male_front.png
```

*PhysIQx AI · Body Pillar visual asset pipeline · Prompts v2*
