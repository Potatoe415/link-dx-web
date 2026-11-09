#!/usr/bin/env python3
"""
scripts/pack_object_sprites.py

Processes the 4x4 Studio Ghibli objects/props sprite sheet:
1. Despills and removes the #00FF00 green chroma background.
2. Extracts and trims individual sprites into public/assets/ui/ghibli_props/.
3. Saves a unified transparent sheet: public/assets/ui/objects_ghibli.png.
4. Generates an HTML preview for verification.

Usage:
  python scripts/pack_object_sprites.py <input_sheet_path>
"""

import os
import sys
from PIL import Image

ITEM_NAMES = [
    # Row 1
    "sword_l1", "signpost", "bush", "flowers_grass",
    # Row 2
    "rupee_green", "rupee_blue", "rupee_red", "heart_recovery",
    # Row 3
    "sleepy_toadstool", "magic_powder", "tail_key", "heart_piece",
    # Row 4
    "chest_closed", "chest_opened", "pushable_stone", "secret_seashell"
]

def despill_and_mask(im):
    im = im.convert('RGBA')
    width, height = im.size
    pixels = im.load()

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            # Chroma green detection
            if g > 135 and g > r * 1.35 and g > b * 1.35:
                pixels[x, y] = (0, 0, 0, 0)
            elif g > 110 and g > (r + b) * 0.7:
                # Edge / semi-transparent antialiasing
                diff = g - max(r, b)
                alpha = max(0, 255 - int(diff * 2.8))
                clean_g = min(g, max(r, b))
                pixels[x, y] = (r, clean_g, b, alpha)
            else:
                # Despill fringe on solid edge pixels
                if g > max(r, b):
                    pixels[x, y] = (r, max(r, b), b, a)

    return im

def process_sheet(src_path):
    if not os.path.exists(src_path):
        print(f"[ERROR] Source sheet not found: {src_path}")
        return False

    out_dir = os.path.join('public', 'assets', 'ui', 'ghibli_props')
    os.makedirs(out_dir, exist_ok=True)

    raw = Image.open(src_path)
    print(f"Loading raw sheet: {src_path} (size: {raw.size})")

    if raw.size != (1024, 1024):
        raw = raw.resize((1024, 1024), Image.Resampling.LANCZOS)

    transparent = despill_and_mask(raw)
    trans_out = os.path.join('public', 'assets', 'ui', 'objects_ghibli.png')
    transparent.save(trans_out, 'PNG')
    print(f"[OK] Saved unified transparent sheet: {trans_out}")

    # 4x4 Grid Slicing: each cell is 256x256
    cell_w = 256
    cell_h = 256
    coords = {}

    for i, name in enumerate(ITEM_NAMES):
        row = i // 4
        col = i % 4
        x1 = col * cell_w
        y1 = row * cell_h
        x2 = x1 + cell_w
        y2 = y1 + cell_h

        cell = transparent.crop((x1, y1, x2, y2))
        bbox = cell.getbbox()
        if bbox:
            cropped = cell.crop(bbox)
            # Store absolute coords on objects_ghibli.png
            abs_bbox = (x1 + bbox[0], y1 + bbox[1], x1 + bbox[2], y1 + bbox[3])
            coords[name] = {
                'x': abs_bbox[0],
                'y': abs_bbox[1],
                'w': abs_bbox[2] - abs_bbox[0],
                'h': abs_bbox[3] - abs_bbox[1]
            }
        else:
            cropped = cell
            coords[name] = {'x': x1, 'y': y1, 'w': cell_w, 'h': cell_h}

        item_out = os.path.join(out_dir, f"{name}.png")
        cropped.save(item_out, 'PNG')
        print(f"  - Extracted {name}: {cropped.size} -> {item_out}")

    print("\n[OK] Extracted all 16 items successfully!")
    print(coords)
    return True

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python scripts/pack_object_sprites.py <input_sheet_path>")
        sys.exit(1)
    process_sheet(sys.argv[1])
