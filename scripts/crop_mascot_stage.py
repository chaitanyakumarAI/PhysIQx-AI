"""
crop_mascot_stage.py
Exports the chest-up "stage" cuts the character tour uses (Clash of
Clans-style big characters at the screen corners) from the locked
expression grids. Run from the project root:

    python scripts/crop_mascot_stage.py

Writes public/mascots/stage/<speaker>-<expression>.webp. Every cut of a
character shares one frame size and anchor, so expression swaps never
make the body jump. The edges fade in CSS (CharacterTour), not here.

Skipped on purpose: kix-asleep (its grid panel carries a generator
watermark across the jaw) — the tour never uses it.
"""

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).parent.parent
DESIGN = ROOT / "design" / "mascots"
OUT = ROOT / "public" / "mascots" / "stage"
OUT.mkdir(parents=True, exist_ok=True)

WEBP_QUALITY = 84
# 3:4 frame for both characters; the CSS sizes them by height.
FRAME_W, FRAME_H = 540, 720
# Grid panels are separated by thin lines; stay clear of them.
INSET = 10


def save(crop: Image.Image, name: str) -> None:
    crop = crop.resize((FRAME_W, FRAME_H), Image.LANCZOS).convert("RGB")
    dest = OUT / f"{name}.webp"
    crop.save(dest, "WEBP", quality=WEBP_QUALITY, method=6)
    print(f"  OK  stage/{name}.webp  ({dest.stat().st_size / 1024:.0f} KB)")


def cut(grid: Image.Image, cell: tuple[int, int, int, int], center_x: float) -> Image.Image:
    """A 3:4 window as tall as the panel allows, centred on the face."""
    x0, y0, x1, y1 = cell
    x0, y0, x1, y1 = x0 + INSET, y0 + INSET, x1 - INSET, y1 - INSET
    height = y1 - y0
    width = round(height * FRAME_W / FRAME_H)
    if width > x1 - x0:  # panel too narrow: shrink the window instead
        width = x1 - x0
        height = round(width * FRAME_H / FRAME_W)
    left = round(x0 + (x1 - x0) * center_x - width / 2)
    left = max(x0, min(left, x1 - width))
    return grid.crop((left, y0, left + width, y0 + height))


# ── Kix: 2816x1536 grid, 4 x 2 panels of 704x768 ────────────────────────────
# (col, row, name, face centre as a fraction of the panel width)
KIX = [
    (0, 0, "kix-default", 0.50),
    (1, 0, "kix-focus", 0.50),
    (2, 0, "kix-joy", 0.50),
    (3, 0, "kix-sheepish", 0.50),
    (0, 1, "kix-worried", 0.49),
    (1, 1, "kix-proud", 0.47),  # raised glove sits left of the face
    (2, 1, "kix-determined", 0.50),
]

print("\n[KIX] stage cuts")
kix = Image.open(DESIGN / "kix" / "kix-grid.png").convert("RGB")
col_w, row_h = kix.width // 4, kix.height // 2
for col, row, name, cx in KIX:
    cell = (col * col_w, row * row_h, (col + 1) * col_w, (row + 1) * row_h)
    save(cut(kix, cell, cx), name)

# ── Nyra: 2816x800 grid, 5 panels of ~563x768 (bottom 32px is padding) ─────
NYRA = ["nyra-stare", "nyra-narrowed", "nyra-closed", "nyra-nod", "nyra-tilt"]
NYRA_CONTENT_H = 768

print("\n[NYRA] stage cuts")
nyra = Image.open(DESIGN / "nyra" / "nyra-grid.png").convert("RGB")
panel_w = nyra.width / 5
for index, name in enumerate(NYRA):
    cell = (round(index * panel_w), 0, round((index + 1) * panel_w), NYRA_CONTENT_H)
    save(cut(nyra, cell, 0.5), name)

print("\n[DONE] public/mascots/stage/")
