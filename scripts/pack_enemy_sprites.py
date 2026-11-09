#!/usr/bin/env python3
"""
Packs raw greenscreen (#00FF00) Studio Ghibli enemy sprite renders into
public/assets/spritesheet.png and registers their frame coordinates.

Usage:
  python scripts/pack_enemy_sprites.py --input <path_to_greenscreen_art.png> --enemy <urchin|octorok|leever|crab>
"""

import sys
import os
from PIL import Image

def despill_and_crop(img):
    """Removes chroma green background (#00FF00) and applies soft despill."""
    img = img.convert('RGBA')
    datas = img.getdata()
    new_data = []

    for item in datas:
        r, g, b, a = item
        if a == 0:
            new_data.append((0, 0, 0, 0))
            continue

        # Chromatic green detection
        if g > 130 and g > r + 30 and g > b + 30:
            new_data.append((0, 0, 0, 0))
        elif g > 110 and g > r + 15 and g > b + 15:
            # Soft edge despill
            new_data.append((r, min(g, max(r, b)), b, 128))
        else:
            # Despill fringe
            new_data.append((r, min(g, max(r, b) + 20), b, a))

    img.putdata(new_data)
    # Crop to non-transparent bounding box
    bbox = img.getbbox()
    if bbox:
        return img.crop(bbox)
    return img

print("Chroma key and despill enemy pack utility loaded.")
