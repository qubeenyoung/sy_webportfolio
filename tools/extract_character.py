"""
Cuts the character (with her laptop) out of the reference room illustration so she can be placed
in the 3D room as a 2D layer. Uses rembg's local "isnet-anime" segmentation model (runs offline
after the first model download; nothing is sent to external services).

    python tools/extract_character.py

Output: public/textures/character.png (RGBA, cropped to the character) and a JSON sidecar with
the crop rectangle in reference-image pixels, which the web app uses to size and place the layer.
"""

import json
from pathlib import Path

from PIL import Image, ImageDraw
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "ref_pics" / "방구조 및 물건 배치.png"
OUT = ROOT / "public" / "textures" / "character.png"
META = ROOT / "public" / "textures" / "character.json"

# Region around the character in the 1672x941 reference (bun to socks, laptop and both arms).
CROP = (395, 15, 800, 485)

# The segmentation also keeps two duvet folds hugging her and a sliver of pillow by her hair.
# Polygons in CROP-relative pixels that are cleared afterwards.
ERASE = [
    [(0, 150), (108, 165), (108, 249), (0, 217)],  # duvet fold on the left, under the laptop
    [(345, 272), (405, 279), (405, 389), (300, 362), (282, 335), (300, 317), (330, 285)],  # duvet fold on the right
    [(188, 95), (212, 99), (214, 129), (196, 127)],  # pillow sliver left of her hair
]


def main():
    ref = Image.open(SRC).convert("RGB")
    crop = ref.crop(CROP)
    session = new_session("isnet-anime")
    cut = remove(crop, session=session, alpha_matting=False, post_process_mask=True)
    alpha = cut.getchannel("A")
    draw = ImageDraw.Draw(alpha)
    for poly in ERASE:
        draw.polygon(poly, fill=0)
    cut.putalpha(alpha)
    bbox = cut.getchannel("A").point(lambda a: 255 if a > 16 else 0).getbbox()
    cut = cut.crop(bbox)
    x0, y0 = CROP[0] + bbox[0], CROP[1] + bbox[1]
    rect = {"x": x0, "y": y0, "width": cut.width, "height": cut.height, "refWidth": ref.width, "refHeight": ref.height}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    cut.save(OUT)
    META.write_text(json.dumps(rect, indent=2))
    print("wrote", OUT, rect)


main()
