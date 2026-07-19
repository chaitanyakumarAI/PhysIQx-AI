"""
crop_mascots.py
Crops pose expressions from the Kix and Nyra grid images and exports
480x480 WebP files to public/mascots/. Run from the project root.

Grid layouts (verified from image dimensions):
  kix-grid.png  2816x1536  4 cols x 2 rows (704x768 per cell)
  nyra-grid.png 2816x800   5 cols x 1 row  (563x800 per cell)

Kix pose mapping (left->right, top->bottom):
  Row 0: default, focus, joy, sheepish
  Row 1: worried, proud, determined, asleep

Nyra pose mapping (left->right):
  Col 0: stare, 1: narrowed, 2: closed, 3: nod, 4: tilt
"""

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).parent.parent
DESIGN = ROOT / "design" / "mascots"
PUBLIC = ROOT / "public" / "mascots"
PUBLIC.mkdir(parents=True, exist_ok=True)

OUTPUT_SIZE = 480   # Square output px
WEBP_QUALITY = 88   # Quality/size balance


def crop_and_save(src, box, name, output_size=OUTPUT_SIZE):
    """Crop box from src, resize to square, save as WebP."""
    crop = src.crop(box)
    crop = crop.resize((output_size, output_size), Image.LANCZOS)
    # Convert RGBA to RGB for smaller WebP (no transparency needed on dark bg)
    if crop.mode == "RGBA":
        bg = Image.new("RGB", crop.size, (10, 13, 11))  # app bg color #0a0d0b
        bg.paste(crop, mask=crop.split()[3])
        crop = bg
    dest = PUBLIC / f"{name}.webp"
    crop.save(dest, "WEBP", quality=WEBP_QUALITY, method=6)
    size_kb = dest.stat().st_size / 1024
    print(f"  OK  {name}.webp  ({size_kb:.0f} KB)")


# ── KIX GRID: 2816x1536, 4 cols x 2 rows = 704x768 per cell ─────────────────
print("\n[KIX] Processing Kix grid (8 poses)...")
kix_grid = Image.open(DESIGN / "kix" / "kix-grid.png").convert("RGBA")
W, H = kix_grid.size          # 2816, 1536
COL_W = W // 4                 # 704
ROW_H = H // 2                 # 768

# Face is in the upper ~88% of each cell; center-crop to square
FACE_H = int(ROW_H * 0.88)    # 676

KIX_POSES = [
    (0, 0, "kix-default"),
    (1, 0, "kix-focus"),
    (2, 0, "kix-joy"),
    (3, 0, "kix-sheepish"),
    (0, 1, "kix-worried"),
    (1, 1, "kix-proud"),
    (2, 1, "kix-determined"),
    (3, 1, "kix-asleep"),
]

for col, row, pose in KIX_POSES:
    x0 = col * COL_W
    y0 = row * ROW_H
    x1 = x0 + COL_W
    y1 = y0 + FACE_H
    cell_w = x1 - x0
    cell_h = y1 - y0
    side = min(cell_w, cell_h)
    cx = x0 + (cell_w - side) // 2
    cy = y0 + (cell_h - side) // 2
    crop_and_save(kix_grid, (cx, cy, cx + side, cy + side), pose)

# ── KIX ANCHOR: higher-quality overwrite for kix-default ─────────────────────
print("\n[KIX] Overwriting kix-default from anchor (higher quality)...")
kix_anchor = Image.open(DESIGN / "kix" / "kix-anchor.png").convert("RGBA")
AW, AH = kix_anchor.size  # 2816, 1536

ax0 = int(AW * 0.25)
ax1 = int(AW * 0.75)
ay0 = int(AH * 0.0)
ay1 = int(AH * 0.72)
side = min(ax1 - ax0, ay1 - ay0)
cx = ax0 + (ax1 - ax0 - side) // 2
cy = ay0 + (ay1 - ay0 - side) // 2
crop_and_save(kix_anchor, (cx, cy, cx + side, cy + side), "kix-default")

# ── NYRA GRID: 2816x800, 5 cols x 1 row = 563x800 per cell ──────────────────
print("\n[NYRA] Processing Nyra grid (5 poses)...")
nyra_grid = Image.open(DESIGN / "nyra" / "nyra-grid.png").convert("RGBA")
NW, NH = nyra_grid.size       # 2816, 800
NCOL_W = NW // 5              # 563

NYRA_POSES = [
    (0, "nyra-stare"),
    (1, "nyra-narrowed"),
    (2, "nyra-closed"),
    (3, "nyra-nod"),
    (4, "nyra-tilt"),
]

for col, pose in NYRA_POSES:
    x0 = col * NCOL_W
    x1 = (col + 1) * NCOL_W if col < 4 else NW
    cell_w = x1 - x0
    cell_h = NH
    # Square from top-center (faces fill top ~88% of each cell)
    side = min(cell_w, int(cell_h * 0.88))
    cx = x0 + (cell_w - side) // 2
    cy = 0
    crop_and_save(nyra_grid, (cx, cy, cx + side, cy + side), pose)

# ── NYRA ANCHOR: higher-quality overwrite for nyra-stare ─────────────────────
print("\n[NYRA] Overwriting nyra-stare from anchor (higher quality)...")
nyra_anchor = Image.open(DESIGN / "nyra" / "nyra-anchor.png").convert("RGBA")
NAW, NAH = nyra_anchor.size   # 2816, 1536

nx0 = int(NAW * 0.28)
nx1 = int(NAW * 0.72)
ny0 = int(NAH * 0.02)
ny1 = int(NAH * 0.68)
side = min(nx1 - nx0, ny1 - ny0)
cx = nx0 + (nx1 - nx0 - side) // 2
cy = ny0 + (ny1 - ny0 - side) // 2
crop_and_save(nyra_anchor, (cx, cy, cx + side, cy + side), "nyra-stare")

print("\n[DONE] All mascot poses exported to public/mascots/")
files = sorted(f.name for f in PUBLIC.glob("*.webp"))
for f in files:
    print(f"  {f}")
