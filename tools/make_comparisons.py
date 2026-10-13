"""
Builds the reference-comparison images in docs/reference-match/ from screenshots of the web app.

    python tools/make_comparisons.py <final.png> <before.png>

<final.png>  : the current site at 1672x941, default camera, debug panel hidden (?panel=0)
<before.png> : the site before this round of work, same size and camera
"""

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "reference-match"
REF = OUT / "reference-original.png"

try:
    FONT = ImageFont.truetype("malgun.ttf", 26)
except OSError:
    FONT = ImageFont.load_default()


def labeled_row(images, labels, scale=1.0, pad=14, bar=44):
    imgs = [im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS) for im in images]
    w = sum(i.width for i in imgs) + pad * (len(imgs) + 1)
    h = max(i.height for i in imgs) + bar + pad
    canvas = Image.new("RGB", (w, h), "#1f1d1b")
    d = ImageDraw.Draw(canvas)
    x = pad
    for im, label in zip(imgs, labels):
        canvas.paste(im, (x, bar))
        d.text((x, 9), label, fill="#efe8da", font=FONT)
        x += im.width + pad
    return canvas


def main():
    final = Image.open(sys.argv[1]).convert("RGB")
    before = Image.open(sys.argv[2]).convert("RGB").resize(final.size)
    ref = Image.open(REF).convert("RGB").resize(final.size)

    final.save(OUT / "final-room.png")
    Image.blend(ref, final, 0.5).save(OUT / "reference-overlay.png")
    labeled_row([ref, final], ["원본 일러스트 (reference)", "최종 3D 웹 화면 (final)"], scale=0.6).save(OUT / "reference-vs-final.png")
    labeled_row([before, final], ["작업 전 (before)", "작업 후 (after)"], scale=0.6).save(OUT / "before-after.png")

    char_box = (430, 10, 790, 490)  # around the character in the 1672x941 frame
    labeled_row([ref.crop(char_box), final.crop(char_box)], ["원본", "최종 (원본에서 분리한 2D 레이어)"], scale=1.2).save(OUT / "character-closeup.png")

    curtain_box = (0, 0, 460, 500)  # window, both curtains, trophy
    labeled_row(
        [ref.crop(curtain_box), before.crop(curtain_box), final.crop(curtain_box)],
        ["원본", "작업 전 (S자 커튼)", "최종 (수직 커튼)"],
        scale=1.0,
    ).save(OUT / "curtain-closeup.png")
    print("wrote", sorted(p.name for p in OUT.glob("*.png")))


main()
