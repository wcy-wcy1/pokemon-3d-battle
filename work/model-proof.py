"""Assemble matched in-game captures saved by model-finish-test.cjs."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parent
species = [(25, "皮卡丘"), (9, "水箭龟"), (59, "风速狗"),
           (149, "快龙"), (144, "急冻鸟"), (150, "超梦")]
width, height, label = 450, 342, 30
sheet = Image.new("RGB", (3 * width, 4 * (height + label)), "#172224")
draw = ImageDraw.Draw(sheet)
font = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 17)
for i, (dex, name) in enumerate(species):
    for row, (stage, caption) in enumerate([("before", "调整前"), ("after", "调整后")]):
        x, y = i % 3 * width, (i // 3 * 2 + row) * (height + label)
        with Image.open(root / f"model-{stage}-{dex}.jpg") as image:
            sheet.paste(image.resize((width, height), Image.Resampling.LANCZOS), (x, y))
        draw.text((x + 12, y + height + 3), f"{name}  /  {caption}", font=font, fill="#e1eee8")
sheet.save(root.parent / "outputs/model-finish-comparison.jpg", quality=91)
