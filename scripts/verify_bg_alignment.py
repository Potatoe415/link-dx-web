#!/usr/bin/env python3
"""
scripts/verify_bg_alignment.py

Visual and semantic alignment verifier between a Studio Ghibli background
(*_bg.png) and the original Game Boy room manifest (*_manifest.json).

Generates a diagnostic overlay image in scratch/<id>_alignment_check.png:
- Red overlays: Impassable colliders (trees, walls, cliffs, deep water).
- Cyan overlays: Ground zones (shallow water, holes, stairs).
- Green overlays: Warp triggers / doorways.
- Yellow overlays: Cuttables (bushes, grass).

Usage:
  python scripts/verify_bg_alignment.py <room_id>
Example:
  python scripts/verify_bg_alignment.py ow_r15_c02
"""

import json
import os
import sys
from PIL import Image, ImageDraw

def verify_room(room_id):
    os.makedirs('scratch', exist_ok=True)
    bg_path = os.path.join('public', 'assets', 'rooms', f'{room_id}_bg.png')
    manifest_path = os.path.join('public', 'assets', 'rooms', f'{room_id}_manifest.json')
    pixel_path = os.path.join('public', 'assets', 'rooms', f'{room_id}_bg_pixel.png')

    if not os.path.exists(bg_path):
        print(f"[ERROR] Background image not found: {bg_path}")
        return False
    if not os.path.exists(manifest_path):
        print(f"[ERROR] Manifest not found: {manifest_path}")
        return False

    with open(manifest_path, 'r', encoding='utf-8') as f:
        manifest = json.load(f)

    # 1280x1024 canvas (scale 8x from 160x128)
    bg = Image.open(bg_path).convert('RGBA')
    overlay = Image.new('RGBA', bg.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    SCALE = 8

    # 1. Colliders in semi-transparent Red
    for c in manifest.get('colliders', []):
        x1 = c['x'] * SCALE
        y1 = c['y'] * SCALE
        x2 = (c['x'] + c['w']) * SCALE
        y2 = (c['y'] + c['h']) * SCALE
        draw.rectangle([x1, y1, x2, y2], fill=(255, 0, 0, 80), outline=(255, 0, 0, 220), width=2)

    # 2. Ground zones in semi-transparent Cyan (shallow water, holes, stairs)
    for gz in manifest.get('groundZones', []):
        x1 = gz['x'] * SCALE
        y1 = gz['y'] * SCALE
        x2 = (gz['x'] + gz['w']) * SCALE
        y2 = (gz['y'] + gz['h']) * SCALE
        kind = gz.get('kind', '')
        if kind == 'shallowWater':
            fill_color = (0, 150, 255, 90)
            outline_color = (0, 200, 255, 230)
        elif kind == 'hole':
            fill_color = (120, 0, 180, 100)
            outline_color = (180, 0, 255, 230)
        else: # stairs, etc.
            fill_color = (0, 255, 200, 90)
            outline_color = (0, 255, 200, 230)
        draw.rectangle([x1, y1, x2, y2], fill=fill_color, outline=outline_color, width=2)

    # 3. Warp triggers in semi-transparent Green
    for w in manifest.get('warpTriggers', []):
        tb = w.get('triggerBox', w)
        x1 = tb['x'] * SCALE
        y1 = tb['y'] * SCALE
        x2 = (tb['x'] + tb['w']) * SCALE
        y2 = (tb['y'] + tb['h']) * SCALE
        draw.rectangle([x1, y1, x2, y2], fill=(0, 255, 0, 100), outline=(0, 255, 0, 255), width=3)

    result = Image.alpha_composite(bg, overlay)
    out_path = os.path.join('scratch', f'{room_id}_alignment_check.png')
    result.save(out_path)
    print(f"[OK] Diagnostic overlay saved to: {out_path}")
    return True

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python scripts/verify_bg_alignment.py <room_id>")
        sys.exit(1)
    verify_room(sys.argv[1])
