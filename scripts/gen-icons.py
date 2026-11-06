#!/usr/bin/env python3
"""Generate Android launcher mipmaps for CV Studio from the PWA 512px icon."""
from PIL import Image
import os

SRC = "/home/z/my-project/public/icons/icon-512.png"
RES = "/home/z/my-project/android-project/res"
# launcher sizes: mdpi 48, hdpi 72, xhdpi 96, xxhdpi 144, xxxhdpi 192 (ldpi 36 rarely needed)
DENSITIES = {"mipmap-mdpi": 48, "mipmap-hdpi": 72, "mipmap-xhdpi": 96,
             "mipmap-xxhdpi": 144, "mipmap-xxxhdpi": 192}

img = Image.open(SRC).convert("RGBA")
print("source:", img.size)

# draw on a white→dark square canvas so launcher masks look clean
canvas = Image.new("RGBA", (512, 512), (12, 10, 9, 255))  # stone-950 background
src = img.resize((512, 512), Image.LANCZOS) if img.size != (512, 512) else img
canvas.alpha_composite(src)

for d, size in DENSITIES.items():
    out_dir = os.path.join(RES, d)
    os.makedirs(out_dir, exist_ok=True)
    canvas.resize((size, size), Image.LANCZOS).save(os.path.join(out_dir, "ic_launcher.png"))
    print("wrote", d, size)

# adaptive icon foreground (108dp units → 432x432 with safe zone 264) for API 26+
fg = Image.new("RGBA", (1080, 1080), (12, 10, 9, 0))
inner = src.resize((720, 720), Image.LANCZOS)
fg.alpha_composite(inner, (180, 180))
os.makedirs(os.path.join(RES, "mipmap-anydpi-v26"), exist_ok=True)
fg.save(os.path.join(RES, "mipmap-xxxhdpi", "ic_launcher_foreground.png"))
print("adaptive foreground written")
print("ICONS OK")
