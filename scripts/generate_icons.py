"""
generate_icons.py
Takes the master 1024x1024 icon and generates all required sizes for public/.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).parent.parent
PUBLIC = ROOT / "public"

# The path to the chosen generated icon
SRC_ICON = Path(r"C:\Users\HP\.gemini\antigravity\brain\9a2ff838-642e-4b22-ad74-a02fe0ccac90\icon_26_lynxgaze_1784480129312.png")

if not SRC_ICON.exists():
    print(f"Error: Source icon not found at {SRC_ICON}")
    exit(1)

print("Opening master icon...")
img = Image.open(SRC_ICON).convert("RGBA")

# Ensure it's square
w, h = img.size
if w != h:
    print(f"Warning: Image is not square ({w}x{h}). It will be squished.")

sizes = {
    "icon-1024.png": 1024,
    "icon-512.png": 512,
    "icon-192.png": 192,
    "apple-touch-icon.png": 180,
    "favicon-32x32.png": 32,
    "favicon-16x16.png": 16,
}

print("\nGenerating PNG icons...")
for filename, size in sizes.items():
    dest = PUBLIC / filename
    resized = img.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(dest, "PNG")
    print(f"  OK {filename} ({size}x{size})")

print("\nGenerating favicon.ico (multi-size)...")
icon_sizes = [(16, 16), (32, 32), (64, 64)]
img.save(PUBLIC / "favicon.ico", format="ICO", sizes=icon_sizes)
print("  OK favicon.ico")

print("\n[DONE] All icons generated successfully.")
