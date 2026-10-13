"""
Removes the Instagram 3x3 grid lines and the "multiple images" icon from the festival poster
screenshot, producing a separate texture. The source image is never modified.

    python tools/clean_poster.py

Grid lines are thin near-white rows/columns that run across the whole image; each line pixel is
replaced by interpolating the pixels just outside the line. The icon sits on plain dark starfield
background and is filled from the surrounding area.
"""

from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public" / "textures" / "festival-poster.jpg"
OUT = ROOT / "public" / "textures" / "festival-poster-clean.jpg"


def line_positions(img, axis):
    """Indices of rows (axis=1) or columns (axis=0) that are near-white along most of their length."""
    w, h = img.size
    px = img.load()
    hits = []
    n = w if axis == 0 else h
    m = h if axis == 0 else w
    for i in range(n):
        bright = 0
        for j in range(0, m, 3):
            r, g, b = px[i, j] if axis == 0 else px[j, i]
            if r > 200 and g > 200 and b > 200:
                bright += 1
        if bright > 0.8 * (m / 3):
            hits.append(i)
    # group consecutive indices into lines, padded by one pixel for JPEG fringes
    lines, start = [], None
    for k, i in enumerate(hits):
        if start is None:
            start = i
        if k == len(hits) - 1 or hits[k + 1] != i + 1:
            lines.append((start - 1, i + 1))
            start = None
    return lines


def fill_lines(img, lines, axis):
    px = img.load()
    w, h = img.size
    for a, b in lines:
        lo, hi = max(a - 1, 0), min(b + 1, (w if axis == 0 else h) - 1)
        span = hi - lo
        for j in range(h if axis == 0 else w):
            c0 = px[lo, j] if axis == 0 else px[j, lo]
            c1 = px[hi, j] if axis == 0 else px[j, hi]
            for i in range(a, b + 1):
                t = (i - lo) / span
                c = tuple(round(c0[k] * (1 - t) + c1[k] * t) for k in range(3))
                if axis == 0:
                    px[i, j] = c
                else:
                    px[j, i] = c


def fill_icon(img, box):
    """Replace the icon box with a blurred patch taken from the dark background right next to it."""
    x0, y0, x1, y1 = box
    w = x1 - x0
    patch = img.crop((x0 - w - 4, y0, x0 - 4, y1)).filter(ImageFilter.GaussianBlur(2))
    img.paste(patch, (x0, y0))


def main():
    img = Image.open(SRC).convert("RGB")
    cols = line_positions(img, 0)
    rows = line_positions(img, 1)
    print("size", img.size, "grid columns", cols, "grid rows", rows)
    fill_lines(img, cols, 0)
    fill_lines(img, rows, 1)
    fill_icon(img, (312, 10, 376, 66))
    img.save(OUT, quality=92)
    print("wrote", OUT)


main()
