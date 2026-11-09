#!/usr/bin/env python3
"""
scripts/generate_prompt_spec.py

Generates a strict, tile-by-tile 10x8 layout specification from a room's
*_manifest.json and *_bg_pixel.png to feed directly into Ghibli background art prompts.

Prevents AI hallucinations:
- Explicit walkable vs blocked status for every single 128x128 tile.
- Exact border connectivity (North, South, East, West).
- Exact path, water, cliff, and building bounding boxes.

Usage:
  python scripts/generate_prompt_spec.py <room_id>
"""

import json
import os
import sys
from PIL import Image

def analyze_room(room_id):
    manifest_path = os.path.join('public', 'assets', 'rooms', f'{room_id}_manifest.json')
    pixel_path = os.path.join('public', 'assets', 'rooms', f'{room_id}_bg_pixel.png')

    if not os.path.exists(manifest_path):
        print(f"Error: {manifest_path} not found")
        return None

    with open(manifest_path, 'r', encoding='utf-8') as f:
        manifest = json.load(f)

    colliders = manifest.get('colliders', [])
    ground_zones = manifest.get('groundZones', [])
    neighbors = manifest.get('neighbors', {})

    pixel_im = Image.open(pixel_path).convert('RGB') if os.path.exists(pixel_path) else None

    # 10 columns (X: 0..9), 8 rows (Y: 0..7) in 16x16 logical tiles (128x128 display)
    grid = []
    for ty in range(8):
        row = []
        for tx in range(10):
            tile_lx = tx * 16
            tile_ly = ty * 16

            # Check collider collision
            has_collider = False
            col_source = ''
            for c in colliders:
                # AABB overlap with tile 16x16
                if (c['x'] < tile_lx + 16 and c['x'] + c['w'] > tile_lx and
                    c['y'] < tile_ly + 16 and c['y'] + c['h'] > tile_ly):
                    has_collider = True
                    col_source = c.get('source', 'wall')
                    break

            # Check ground zones
            gz_kind = ''
            for gz in ground_zones:
                if (gz['x'] < tile_lx + 16 and gz['x'] + gz['w'] > tile_lx and
                    gz['y'] < tile_ly + 16 and gz['y'] + gz['h'] > tile_ly):
                    gz_kind = gz.get('kind', '')
                    break

            # Color heuristic from pixel art
            tile_type = 'GROUND'
            if has_collider:
                if 'tree' in col_source:
                    tile_type = 'SOLID_TREE'
                elif 'house' in col_source or 'phone' in col_source or 'building' in col_source:
                    tile_type = 'SOLID_BUILDING'
                elif tile_ly >= 96 and gz_kind == 'shallowWater':
                    tile_type = 'SOLID_DEEP_WATER'
                else:
                    tile_type = 'SOLID_CLIFF'
            else:
                if gz_kind == 'shallowWater':
                    tile_type = 'WALKABLE_TIDE_WATER'
                elif gz_kind == 'hole':
                    tile_type = 'HOLE_HAZARD'
                elif gz_kind == 'stairs':
                    tile_type = 'WALKABLE_STAIRS'
                elif pixel_im:
                    # Sample center of tile
                    px = tx * 128 + 64
                    py = ty * 128 + 64
                    r, g, b = pixel_im.getpixel((px, py))[:3]
                    if r > 140 and g > 110 and b < 100:
                        tile_type = 'WALKABLE_DIRT_PATH'
                    elif r > 180 and g > 160 and b > 100:
                        tile_type = 'WALKABLE_BEACH_SAND'
                    elif g > r + 15 and g > b + 15:
                        tile_type = 'WALKABLE_GRASS'
                    else:
                        tile_type = 'WALKABLE_GROUND'

            row.append(tile_type)
        grid.append(row)

    # Border summary
    borders = {'NORTH': [], 'SOUTH': [], 'WEST': [], 'EAST': []}
    for tx in range(10):
        borders['NORTH'].append('BLOCKED' if 'SOLID' in grid[0][tx] else 'OPEN')
        borders['SOUTH'].append('BLOCKED' if 'SOLID' in grid[7][tx] else 'OPEN')
    for ty in range(8):
        borders['WEST'].append('BLOCKED' if 'SOLID' in grid[ty][0] else 'OPEN')
        borders['EAST'].append('BLOCKED' if 'SOLID' in grid[ty][9] else 'OPEN')

    # Output formatted report
    print(f"=== STRICT GEOMETRIC SPECIFICATION: {room_id} ===")
    print(f"Room Name: {manifest.get('roomName', room_id)}")
    print("\n--- BORDER PASSABILITY RULES (MANDATORY) ---")
    print(f"NORTH (Row 0): {' '.join(borders['NORTH'])} -> Neighbors: {neighbors.get('north')}")
    print(f"SOUTH (Row 7): {' '.join(borders['SOUTH'])} -> Neighbors: {neighbors.get('south')}")
    print(f"WEST  (Col 0): {' '.join(borders['WEST'])} -> Neighbors: {neighbors.get('west')}")
    print(f"EAST  (Col 9): {' '.join(borders['EAST'])} -> Neighbors: {neighbors.get('east')}")

    print("\n--- 10x8 TILE GRID GROUND TRUTH ---")
    for ty in range(8):
        line = f"Row {ty} (y={ty*128:4d}..{(ty+1)*128:4d}): "
        line += " | ".join(f"{t[:12]:12s}" for t in grid[ty])
        print(line)

    print("\n--- STRICT MANDATORY PROMPT DIRECTIVES ---")
    print("1. ZERO OBSTACLES ON WALKABLE TILES:")
    print("   Never paint any rocks, trees, fences, cliffs or barriers on WALKABLE tiles.")
    print("2. ZERO PATHS / OPENINGS ON BLOCKED TILES:")
    print("   Every BLOCKED tile must be painted with continuous solid barrier matching its type.")
    print("3. PATHS & WATERLINE FIDELITY:")
    print("   Follow the exact tile coordinates above for all dirt paths, sand, and waterlines.")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python scripts/generate_prompt_spec.py <room_id>")
        sys.exit(1)
    analyze_room(sys.argv[1])
