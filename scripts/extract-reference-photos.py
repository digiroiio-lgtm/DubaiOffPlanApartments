"""Extract placeholder photos from the design reference mockup.

The original photo assets behind the reference design were not supplied, so the
photo regions are cropped from the 1019x1543 mockup and the baked-in text/UI is
removed with a simple diffusion fill. Replace the outputs with the original,
licensed high-resolution photos before launch.

Usage: python3 -I scripts/extract-reference-photos.py <reference.png> <out_dir>
"""
import sys
import numpy as np
from PIL import Image, ImageFilter

src, out = sys.argv[1], sys.argv[2]
ref = np.asarray(Image.open(src).convert("RGB")).astype(np.float64)


def dilate(mask, r):
    m = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(2 * r + 1))
    return np.asarray(m) > 0


def diffuse_fill(img, mask, iters=300, level=0):
    """Fill masked pixels with a multi-scale Laplace (membrane) fill."""
    img = img.copy()
    h, w = mask.shape
    if level < 4 and min(h, w) > 16:
        small = np.asarray(Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).resize((w // 2, h // 2), Image.BILINEAR)).astype(np.float64)
        smask = np.asarray(Image.fromarray((mask * 255).astype(np.uint8)).resize((w // 2, h // 2), Image.BILINEAR)) > 0
        filled = diffuse_fill(small, smask, iters, level + 1)
        up = np.asarray(Image.fromarray(np.clip(filled, 0, 255).astype(np.uint8)).resize((w, h), Image.BILINEAR)).astype(np.float64)
        img[mask] = up[mask]
    else:
        img[mask] = img[~mask].mean(axis=0)
    for _ in range(iters):
        p = np.pad(img, ((1, 1), (1, 1), (0, 0)), mode="edge")
        avg = (p[:-2, 1:-1] + p[2:, 1:-1] + p[1:-1, :-2] + p[1:-1, 2:]) / 4
        img[mask] = avg[mask]
    return img


def text_mask(img, boxes, light=True):
    m = np.zeros(img.shape[:2], bool)
    for x0, y0, x1, y1 in boxes:
        reg = img[y0:y1, x0:x1]
        lum = reg.mean(axis=2)
        if light:
            sel = (reg.min(axis=2) > 165) | ((reg[..., 0] > 150) & (reg[..., 0] - reg[..., 2] > 35))
        else:
            sel = lum < 255
        m[y0:y1, x0:x1] |= sel
    return m


def save(arr, name, quality=90):
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).save(f"{out}/{name}", quality=quality, method=6)


# ---------- Hero (y 45..516) ----------
hero = ref[46:516].copy()  # 470 rows, y offset 46
H = hero.shape[0]
o = 46
mask = np.zeros(hero.shape[:2], bool)
mask[104 - o:136 - o, 44:302] = True    # eyebrow + gold rule
mask[138 - o:304 - o, 44:448] = True    # headline
mask[306 - o:362 - o, 44:412] = True    # subtitle
mask[374 - o:438 - o, 44:404] = True    # button + explore link
hero = diffuse_fill(hero, mask)

# Form card (x 681..977, y 77..491): mirror the strip immediately to its left.
fx0, fx1, fy0, fy1 = 668, 990, 66 - o, 503 - o
w = fx1 - fx0
strip = hero[:, fx0 - w:fx0]  # translated copy of the neighbouring skyline
patch = hero.copy()
patch[:, fx0:fx1] = strip
blend = np.zeros((H, hero.shape[1]))
blend[fy0:fy1, fx0:fx1] = 1
blend = np.asarray(Image.fromarray((blend * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(10))) / 255.0
blend[fy0 + 4:fy1 - 4, fx0 + 4:fx1 - 4] = 1
hero = hero * (1 - blend[..., None]) + patch * blend[..., None]
save(hero, "hero-dubai-waterfront.webp")

# ---------- Bottom CTA (y 1338..1478) ----------
cta = ref[1339:1478].copy()
o = 1339
m = np.zeros(cta.shape[:2], bool)
m[1355 - o:1394 - o, 46:505] = True   # headline
m[1394 - o:1414 - o, 46:345] = True   # subline
m[1420 - o:1462 - o, 46:262] = True   # button
cta = diffuse_fill(cta, m)
save(cta, "cta-dubai-skyline.webp")

# ---------- Area cards (photo y 716..900) ----------
for name, (x0, x1) in {
    "area-jvc.webp": (49, 348),
    "area-business-bay.webp": (362, 659),
    "area-dubai-south.webp": (672, 971),
}.items():
    save(ref[717:900, x0:x1], name, 92)

print("ok")
