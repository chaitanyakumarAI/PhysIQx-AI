"""
export_icons.py — Generate all app icon sizes from master PNG.
Run: python scripts/export_icons.py
"""
from pathlib import Path
from PIL import Image

MASTER = Path(r"C:\Users\HP\.gemini\antigravity\brain\9a2ff838-642e-4b22-ad74-a02fe0ccac90\physiqx_app_icon_1784474985896.png")
PUBLIC = Path(__file__).parent.parent / "public"
PUBLIC.mkdir(exist_ok=True)

img = Image.open(MASTER).convert("RGBA")

# Compose onto solid dark bg so no alpha fringing at any size
from PIL import Image as _I
def on_dark(src, size):
    bg = _I.new("RGB", (size, size), (10, 13, 11))
    resized = src.resize((size, size), _I.LANCZOS)
    bg.paste(resized, mask=resized.split()[3])
    return bg

SIZES = {
    "favicon-16x16.png":   16,
    "favicon-32x32.png":   32,
    "apple-touch-icon.png": 180,
    "icon-192.png":        192,
    "icon-512.png":        512,
    "icon-1024.png":       1024,
}

for filename, size in SIZES.items():
    out = on_dark(img, size)
    dest = PUBLIC / filename
    out.save(dest, "PNG", optimize=True)
    kb = dest.stat().st_size / 1024
    print(f"  OK  {filename}  ({kb:.0f} KB)")

# Also save favicon.ico (16+32 multi-size)
import struct, zlib

def png_bytes(pil_img):
    import io
    buf = io.BytesIO()
    pil_img.save(buf, "PNG")
    return buf.getvalue()

ico_sizes = [16, 32, 48]
ico_images = [on_dark(img, s) for s in ico_sizes]

# Write proper .ico with multiple sizes
import io

def make_ico(images):
    """Minimal valid ICO builder."""
    num = len(images)
    # ICO header: 6 bytes
    header = struct.pack("<HHH", 0, 1, num)
    # Each image entry: 16 bytes
    # We'll calculate offsets after building PNG data
    png_datas = [png_bytes(im) for im in images]
    offset = 6 + num * 16
    entries = b""
    for i, (im, data) in enumerate(zip(images, png_datas)):
        w = im.width if im.width < 256 else 0
        h = im.height if im.height < 256 else 0
        entries += struct.pack("<BBBBHHII", w, h, 0, 0, 1, 32, len(data), offset)
        offset += len(data)
    ico_buf = io.BytesIO()
    ico_buf.write(header)
    ico_buf.write(entries)
    for data in png_datas:
        ico_buf.write(data)
    return ico_buf.getvalue()

ico_data = make_ico(ico_images)
ico_path = PUBLIC / "favicon.ico"
ico_path.write_bytes(ico_data)
print(f"  OK  favicon.ico  ({len(ico_data)//1024} KB, 3 sizes: 16/32/48)")

print("\n[DONE] All icons in public/")
