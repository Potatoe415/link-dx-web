#!/usr/bin/env python3
"""
Deterministic Room Extractor for Zelda: Link's Awakening Ghibli Web.
Reads `_ref_repo/Data/Maps/*.map`, tilesets, `objects.atlas`, and `musicOverworld.data`
to mathematically extract any 10x8 (160x128) screen into:
  1. `<out_id>_bg_pixel.png`   (1280x1024 Nearest-Neighbor 8x reference background)
  2. `<out_id>_grid_ruler.png` (1280x1024 visual coordinate ruler with 160x128 labels)
  3. `<out_id>_manifest.json`  (exact tile matrix, music track ID, and local 160x128 objects/doors/colliders)

Object sprites and colliders come from `_ref_repo/InGame/GameObjects/GameObjectTemplates.cs` (see ref_templates.py).
Turn manifests into TypeScript RoomDefs with `scripts/build_region.py`.

Usage examples:
  # Extract Marin's house outdoor screen (Overworld Row 10, Col 2):
  python scripts/extract_room.py --overworld-row 10 --overworld-col 2 --out-id ow_r10_c02

  # Extract the screen south of Marin's house (Overworld Row 11, Col 2):
  python scripts/extract_room.py --overworld-row 11 --overworld-col 2 --out-id ow_r11_c02

  # Extract an indoor or dungeon room:
  python scripts/extract_room.py --map house1.map --room-row 0 --room-col 0 --out-id indoor_marin
"""

import argparse
import json
import os
from PIL import Image, ImageDraw

from ref_templates import load_object_templates, load_sprite_atlases, LAYER_BOTTOM, LAYER_PLAYER

REF_DIR = '_ref_repo'
MAPS_DIR = os.path.join(REF_DIR, 'Data', 'Maps')
TILESETS_DIR = os.path.join(MAPS_DIR, 'Tilesets')
MUSIC_OW_DATA = os.path.join(REF_DIR, 'Data', 'musicOverworld.data')


def parse_map_file(map_path):
    with open(map_path, encoding='utf-8', errors='ignore') as f:
        lines = [l.rstrip('\r\n') for l in f]

    idx = 0
    version = int(lines[idx]); idx += 1
    offset_x, offset_y = 0, 0
    if version > 2:
        offset_x = int(lines[idx]); idx += 1
        offset_y = int(lines[idx]); idx += 1

    tileset_name = lines[idx].strip(); idx += 1
    width = int(lines[idx]); idx += 1
    height = int(lines[idx]); idx += 1
    depth = int(lines[idx]); idx += 1

    layers = []
    for _z in range(depth):
        layer = []
        for _y in range(height):
            row_str = lines[idx]; idx += 1
            parts = row_str.split(',')
            row = [int(p) if p.strip().lstrip('-').isdigit() else -1 for p in parts[:width]]
            layer.append(row)
        layers.append(layer)

    obj_type_count = int(lines[idx]); idx += 1
    obj_types = []
    for _ in range(obj_type_count):
        obj_types.append(lines[idx].strip()); idx += 1

    obj_instance_count = int(lines[idx]); idx += 1
    objects = []
    for _ in range(obj_instance_count):
        if idx >= len(lines):
            break
        raw = lines[idx]; idx += 1
        parts = raw.split(';')
        if len(parts) >= 3 and parts[0].isdigit():
            t_idx = int(parts[0])
            obj_id = obj_types[t_idx] if t_idx < len(obj_types) else f'unknown_{t_idx}'
            px = int(float(parts[1]))
            py = int(float(parts[2]))
            objects.append({
                'id': obj_id,
                'mapX': px,
                'mapY': py,
                'params': parts[3:],
            })

    return {
        'version': version,
        'offsetX': offset_x,
        'offsetY': offset_y,
        'tileset': tileset_name,
        'width': width,
        'height': height,
        'depth': depth,
        'layers': layers,
        'objects': objects,
    }


def get_overworld_music(tile_col, tile_row):
    if not os.path.exists(MUSIC_OW_DATA):
        return 3
    with open(MUSIC_OW_DATA, encoding='utf-8', errors='ignore') as f:
        lines = [l.strip() for l in f if l.strip()]
    grid_lines = lines[2:]
    if 0 <= tile_row < len(grid_lines):
        cols = grid_lines[tile_row].split(';')
        if 0 <= tile_col < len(cols) and cols[tile_col].lstrip('-').isdigit():
            return int(cols[tile_col])
    return 3


COLLIDER_SHAPES = {
    'c1': [(0, 0, 16, 16)],
    'c1PushIgnore': [(0, 0, 16, 16)],
    'lowCollider16': [(0, 0, 16, 16)],
    'lowerLevelCollider': [(0, 0, 16, 16)],
    'colliderLevel1': [(0, 0, 16, 16)],
    'c2': [(0, 8, 16, 8)],
    'lowCollider0': [(0, 8, 16, 8)],
    'lowerLevelCollider1': [(0, 8, 16, 8)],
    'c3': [(0, 0, 8, 16)],
    'lowCollider2': [(0, 0, 8, 16)],
    'lowerLevelCollider2': [(0, 0, 8, 16)],
    'c4': [(8, 0, 8, 16)],
    'lowCollider3': [(8, 0, 8, 16)],
    'c5': [(0, 0, 16, 8)],
    'lowCollider1': [(0, 0, 16, 8)],
    'c6': [(8, 0, 8, 8)],
    'c7': [(0, 8, 8, 8)],
    'c8': [(8, 8, 8, 8)],
    'c13': [(0, 0, 8, 8)],
    'c9': [(0, 0, 16, 8), (0, 8, 8, 8)],
    'colliderL0': [(0, 0, 16, 8), (0, 8, 8, 8)],
    'c10': [(0, 0, 16, 8), (8, 8, 8, 8)],
    'colliderL1': [(0, 0, 16, 8), (8, 8, 8, 8)],
    'c11': [(0, 0, 8, 8), (0, 8, 16, 8)],
    'colliderL2': [(0, 0, 8, 8), (0, 8, 16, 8)],
    'c12': [(8, 0, 8, 8), (0, 8, 16, 8)],
    'colliderL3': [(8, 0, 8, 8), (0, 8, 16, 8)],
    'tree0': [(0, 4, 32, 28)],
    'tree1': [(0, 4, 32, 28)],
    'tree2': [(0, 4, 32, 28)],
    'tree3': [(0, 4, 32, 28)],
    'tree4': [(0, 4, 32, 28)],
    'tree5': [(0, 4, 32, 28)],
    'treeWoods': [(0, 4, 32, 28)],
    'treeWoods2': [(0, 4, 32, 27)],
    'tree9': [(0, 4, 32, 28)],
    'stree': [(0, 16, 16, 16)],
    'phonehouse': [(0, 4, 48, 12)],
    'seashell_house': [(0, 4, 48, 12)],
    'strandplant': [(0, 4, 15, 12)],
    'pot_1': [(1, 2, 14, 13)],
    'stone_1': [(1, 2, 14, 13)],
}


FENCE_BITMASKS = {
    'fence': 15,
    'fenceUL': 14,
    'fenceU': 12,
    'fenceUR': 13,
    'fenceL': 10,
    'fenceR': 5,
    'fenceDL': 11,
    'fenceD': 3,
    'fenceDR': 7,
    'fenceTR': 4,
    'fenceTL': 8,
    'fenceBR': 1,
    'fenceBL': 2,
}


def fence_posts(obj_id, params):
    """ObjFence.cs: bit 3 (0x08) = top-left post, bit 2 = top-right, bit 1 = bottom-left, bit 0 = bottom-right.
    Yields each post's anchor offset (4 + col*8, 5 + row*8) relative to the object position."""
    placement = int(params[0]) if (len(params) >= 1 and params[0].isdigit()) else FENCE_BITMASKS[obj_id]
    for i in range(4):
        if placement & (0x08 >> i):
            yield 4 + (i % 2) * 8, 5 + (i // 2) * 8


# Ground zones (MapStates.FieldStates + ObjSlow/ObjHole), one entry per object -> logical rect.
# water/waterDeep: AddFieldState(tile); grass is emitted as `cuttables` (ObjBush with setGrassField);
# stairs: ObjSlow ObjectCollisionComponent Rectangle(x, y, 16, 12); hole: ObjHole CBox(x + 1, y + 1, 14, 14).
GROUND_ZONES = {
    'water': ('shallowWater', (0, 0, 16, 16)),
    'waterDeep': ('deepWater', (0, 0, 16, 16)),
    'stairs': ('stairs', (0, 0, 16, 12)),
    'hole': ('hole', (1, 1, 14, 14)),
}


def compute_ground_zone(obj_id, lx, ly):
    if obj_id in GROUND_ZONES:  # grass comes from runtime cuttables (src/entities/Bushes.ts)
        kind, (ox, oy, w, h) = GROUND_ZONES[obj_id]
    else:
        return None
    x0, y0 = max(0, lx + ox), max(0, ly + oy)
    x1, y1 = min(160, lx + ox + w), min(128, ly + oy + h)
    if x1 <= x0 or y1 <= y0:
        return None
    return {'kind': kind, 'x': x0, 'y': y0, 'w': x1 - x0, 'h': y1 - y0}


# Interactables: ObjSignpost (`signpost`, `signpostWoods`, `sign`) and ObjChest (`chest`).
# Params follow GameObjectTemplates.cs: sign = [signText, spriteId, rect, direction], chest = [item, spawn, saveKey, spriteType].
SIGN_SPRITES = {'signpost': 'signpost_0', 'signpostWoods': 'signpost_1', 'sign': None}
SIGN_DIRECTION = {'signpost': 1, 'signpostWoods': 1, 'sign': None}
GROUND_ITEMS = {'sword1': 'sword'}
# Cuttable ObjBush objects (template id -> (kind, spriteId)); drawn + cut at runtime (src/entities/Bushes.ts)
CUTTABLE = {'bush': ('bush', 'bush_0'), 'bushForest': ('bush', 'bush_1'),
            'gras': ('grass', 'grass_0'), 'gras0': ('grass', 'grass_0_0'), 'gras1': ('grass', 'grass_0_1'),
            'gras2': ('grass', 'grass_0_2'), 'gras3': ('grass', 'grass_0_3')}  # ObjItem params: [?, saveKey, itemId, ...]
RUNTIME_OBJECTS = set(SIGN_SPRITES) | {'chest', 'item'} | set(CUTTABLE)  # drawn + collided by src/entities/Interactables.ts


def compute_interactable(obj, lx, ly):
    if not (0 <= lx < 160 and 0 <= ly < 128):
        return None
    params = obj['params']
    if obj['id'] in SIGN_SPRITES:
        return {'kind': 'sign', 'id': f"{obj['id']}_{lx}_{ly}", 'x': lx, 'y': ly,
                'textKey': params[0] if params else '', 'sprite': SIGN_SPRITES[obj['id']],
                'requiredDirection': SIGN_DIRECTION[obj['id']]}
    if obj['id'] == 'item' and len(params) > 2 and params[2] in GROUND_ITEMS:
        return {'kind': 'item', 'id': params[1] or f'item_{lx}_{ly}', 'x': lx, 'y': ly, 'item': GROUND_ITEMS[params[2]]}
    if obj['id'] == 'chest':
        return {'kind': 'chest', 'id': (params[2] if len(params) > 2 and params[2] else f'chest_{lx}_{ly}'),
                'x': lx, 'y': ly, 'item': params[0] if params else ''}
    return None


# Enemy spawns: `enemy_respawner` objects (param 0 = template id) and directly placed enemy ids.
# Template id -> (enemy kind in src/data/enemies.ts, feet anchor offset from the object origin).
ENEMY_TEMPLATES = {
    'e1': ('urchin', (8, 16)),  # EnemySeaUrchin: EntityPosition = (posX + 8, posY + 16)
    'e2': ('octorok', (8, 12)),  # EnemyOctorok: EntityPosition = (posX + 8, posY + 12)
    'e3': ('leever', (8, 16)),  # EnemyLeever
    'e4': ('crab', (8, 16)),  # EnemyCrab
}


def compute_enemy_spawn(obj, lx, ly):
    if not (0 <= lx < 160 and 0 <= ly < 128):
        return None
    tid = obj['params'][0] if obj['id'] == 'enemy_respawner' and obj['params'] else obj['id']
    if tid not in ENEMY_TEMPLATES:
        return None
    kind, (ox, oy) = ENEMY_TEMPLATES[tid]
    return {'kind': kind, 'x': lx + ox, 'y': ly + oy}


def compute_object_colliders(obj_id, lx, ly, params, templates):
    rects = []
    if obj_id in COLLIDER_SHAPES:
        for ox, oy, w, h in COLLIDER_SHAPES[obj_id]:
            rects.append({'x': lx + ox, 'y': ly + oy, 'w': w, 'h': h, 'source': obj_id})
    elif obj_id in FENCE_BITMASKS:
        # Each post is an ObjSprite with collision Rectangle(-3, -5, 6, 6) around its anchor
        for ax, ay in fence_posts(obj_id, params):
            rects.append({'x': lx + ax - 3, 'y': ly + ay - 5, 'w': 6, 'h': 6, 'source': obj_id})
    elif obj_id in templates and templates[obj_id]['collider'] and obj_id not in RUNTIME_OBJECTS:
        cx, cy, cw, ch = templates[obj_id]['collider']
        rects.append({'x': lx + cx, 'y': ly + cy, 'w': cw, 'h': ch, 'source': obj_id})
    return rects


def classify_object(obj_id):
    if obj_id in COLLIDER_SHAPES and (obj_id.startswith('c') or 'Collider' in obj_id or 'collider' in obj_id):
        return 'collider'
    if 'door' in obj_id or 'stairs' in obj_id or 'entry' in obj_id:
        return 'warp'
    if obj_id in ('weather_bird', 'bird', 'flower', 'flower_1', 'flower_2', 'flower2', 'flower3', 'flowerforest', 'flowerforest2'):
        return 'animated_prop'
    if obj_id.startswith('npc') or obj_id in ('maria', 'tarin', 'owl', 'bowwow', 'shopkeeper', 'trendy'):
        return 'npc'
    if obj_id.startswith('e_') or obj_id.startswith('e1') or obj_id.startswith('e2') or 'moblin' in obj_id or 'octorok' in obj_id or 'urchin' in obj_id:
        return 'enemy'
    if obj_id in FENCE_BITMASKS or obj_id in ('tree0', 'tree1', 'tree2', 'tree3', 'tree4', 'tree5', 'treeWoods', 'treeWoods2', 'stree', 'phonehouse', 'seashell_house', 'stone_1', 'pot_1', 'signpost', 'bush_0', 'grass', 'gras', 'gras1', 'gras2', 'gras3'):
        return 'static_decor'
    return 'other'


def extract_room(map_name, screen_col, screen_row, out_id, out_dir, offset_px_x=None, offset_px_y=None):
    os.makedirs(out_dir, exist_ok=True)
    map_path = os.path.join(MAPS_DIR, map_name)
    parsed = parse_map_file(map_path)

    is_overworld = map_name.lower() == 'overworld.map'
    if offset_px_x is not None and offset_px_y is not None:
        world_px_x = offset_px_x
        world_px_y = offset_px_y
        tile_col_start = world_px_x // 16
        tile_row_start = world_px_y // 16
    else:
        tile_col_start = screen_col * 10 + parsed['offsetX']
        tile_row_start = screen_row * 8 + parsed['offsetY']
        world_px_x = tile_col_start * 16
        world_px_y = tile_row_start * 16

    tileset_path = os.path.join(TILESETS_DIR, parsed['tileset'])
    tileset_img = Image.open(tileset_path).convert('RGBA')
    ts_cols = tileset_img.width // 16

    room_native = Image.new('RGBA', (160, 128), (0, 0, 0, 255))
    top_layer_img = Image.new('RGBA', (160, 128), (0, 0, 0, 0)) if parsed['depth'] > 1 else None
    room_tiles = []

    for z in range(parsed['depth']):
        target = top_layer_img if (top_layer_img is not None and z == parsed['depth'] - 1) else room_native
        layer_slice = []
        for ry in range(8):
            row_indices = []
            ty = tile_row_start + ry
            for rx in range(10):
                tx = tile_col_start + rx
                t_idx = -1
                if 0 <= ty < parsed['height'] and 0 <= tx < parsed['width']:
                    t_idx = parsed['layers'][z][ty][tx]
                row_indices.append(t_idx)
                if t_idx >= 0:
                    sx = (t_idx % ts_cols) * 16
                    sy = (t_idx // ts_cols) * 16
                    tile_crop = tileset_img.crop((sx, sy, sx + 16, sy + 16))
                    target.alpha_composite(tile_crop, (rx * 16, ry * 16))
            layer_slice.append(row_indices)
        room_tiles.append(layer_slice)

    # Filter objects inside or overlapping this 160x128 screen
    sprites = load_sprite_atlases()
    templates = load_object_templates(sprites)
    sheets = {}
    draws = []  # (layer, sortY, spriteId, x, y)

    local_objects = []
    extracted_colliders = []
    ground_zones = []
    interactables = []
    enemy_spawns = []
    cuttables = []
    unported_enemies = set()
    for obj in parsed['objects']:
        lx = obj['mapX'] - world_px_x
        ly = obj['mapY'] - world_px_y
        if -32 <= lx < 176 and -32 <= ly < 144:
            category = classify_object(obj['id'])
            entry = {
                'id': obj['id'],
                'category': category,
                'localX': lx,
                'localY': ly,
                'params': obj['params'],
            }
            local_objects.append(entry)

            if obj['id'] in CUTTABLE and 0 <= lx < 160 and 0 <= ly < 128:
                kind, sprite_id = CUTTABLE[obj['id']]
                cuttables.append({'kind': kind, 'x': lx, 'y': ly, 'sprite': sprite_id})

            spawn = compute_enemy_spawn(obj, lx, ly)
            if spawn:
                enemy_spawns.append(spawn)
            elif obj['id'] == 'enemy_respawner' and obj['params'] and 0 <= lx < 160 and 0 <= ly < 128:
                unported_enemies.add(obj['params'][0])

            inter = compute_interactable(obj, lx, ly)
            if inter:
                interactables.append(inter)

            zone = compute_ground_zone(obj['id'], lx, ly)
            if zone:
                ground_zones.append(zone)

            for r in compute_object_colliders(obj['id'], lx, ly, obj['params'], templates):
                # Clip collider to [0..160, 0..128] screen bounds
                cx0 = max(0, r['x'])
                cy0 = max(0, r['y'])
                cx1 = min(160, r['x'] + r['w'])
                cy1 = min(128, r['y'] + r['h'])
                if cx1 > cx0 and cy1 > cy0:
                    extracted_colliders.append({
                        'x': cx0,
                        'y': cy0,
                        'w': cx1 - cx0,
                        'h': cy1 - cy0,
                        'source': r['source'],
                    })

            # Queue the object's static sprite for compositing (same maths as the C# constructors)
            if obj['id'] in FENCE_BITMASKS and 'fence' in sprites:
                for ax, ay in fence_posts(obj['id'], obj['params']):
                    f = sprites['fence']
                    draws.append((LAYER_PLAYER, ly + ay, 'fence', lx + ax - f['ox'], ly + ay - f['oy']))
            elif obj['id'] in templates and not inter and obj['id'] not in CUTTABLE:  # runtime objects
                t = templates[obj['id']]
                sprite_id = obj['params'][0] if (t['cls'] == 'ObjSprite' and obj['params'] and obj['params'][0] in sprites) else t['sprite']
                dx, dy = t['draw']
                draws.append((t['layer'], ly + dy + sprites[sprite_id]['h'], sprite_id, lx + dx, ly + dy))

    # Composite in the original draw order: bottom-layer objects (grass, flowers, water) under the
    # top tile layer, then player-level objects (trees, bushes, fences) Y-sorted, then top objects.
    def paste_sprite(sprite_id, x, y):
        sp = sprites[sprite_id]
        if sp['png'] not in sheets:
            sheets[sp['png']] = Image.open(sp['png']).convert('RGBA')
        crop = sheets[sp['png']].crop((sp['x'], sp['y'], sp['x'] + sp['w'], sp['y'] + sp['h']))
        # Clip to the screen: alpha_composite rejects negative destinations
        sx0, sy0 = max(0, -x), max(0, -y)
        if sx0 >= sp['w'] or sy0 >= sp['h'] or x >= 160 or y >= 128:
            return
        room_native.alpha_composite(crop.crop((sx0, sy0, sp['w'], sp['h'])), (x + sx0, y + sy0))

    for layer, _sy, sid, x, y in sorted(draws, key=lambda d: (d[0], d[1])):
        if layer <= LAYER_BOTTOM:
            paste_sprite(sid, x, y)
    if top_layer_img is not None:
        room_native.alpha_composite(top_layer_img)
    for layer, _sy, sid, x, y in sorted(draws, key=lambda d: (d[0], d[1])):
        if layer > LAYER_BOTTOM:
            paste_sprite(sid, x, y)

    # 1. Save 1280x1024 Nearest Neighbor Pixel-Art Reference
    bg_pixel = room_native.resize((1280, 1024), Image.Resampling.NEAREST)
    bg_pixel_path = os.path.join(out_dir, f'{out_id}_bg_pixel.png')
    bg_pixel.save(bg_pixel_path)

    # 2. Save 1280x1024 Coordinate Grid Ruler Overlay + Collider Boxes
    ruler = bg_pixel.copy()
    overlay = Image.new('RGBA', (1280, 1024), (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)
    for c in extracted_colliders:
        rx0, ry0 = c['x'] * 8, c['y'] * 8
        rx1, ry1 = (c['x'] + c['w']) * 8, (c['y'] + c['h']) * 8
        odraw.rectangle([rx0, ry0, rx1, ry1], fill=(239, 68, 68, 95), outline=(239, 68, 68, 230), width=2)
    ruler = Image.alpha_composite(ruler, overlay)

    draw = ImageDraw.Draw(ruler)
    for x in range(0, 161, 16):
        sx = x * 8
        draw.line([(sx, 0), (sx, 1024)], fill=(0, 255, 255, 160), width=2)
        if x < 160:
            draw.text((sx + 4, 4), f'x={x}', fill=(255, 255, 0, 255))
    for y in range(0, 129, 16):
        sy = y * 8
        draw.line([(0, sy), (1280, sy)], fill=(0, 255, 255, 160), width=2)
        if y < 128:
            draw.text((4, sy + 4), f'y={y}', fill=(255, 255, 0, 255))

    ruler_path = os.path.join(out_dir, f'{out_id}_grid_ruler.png')
    ruler.save(ruler_path)

    # 3. Save deterministic JSON manifest
    music_track = get_overworld_music(tile_col_start + 5, tile_row_start + 4) if is_overworld else parsed['version']
    manifest = {
        'roomId': out_id,
        'sourceMap': map_name,
        'screenCol': screen_col,
        'screenRow': screen_row,
        'tileOrigin': {'col': tile_col_start, 'row': tile_row_start},
        'worldPixelOrigin': {'x': world_px_x, 'y': world_px_y},
        'logicalSize': {'w': 160, 'h': 128},
        'displaySize': {'w': 1280, 'h': 1024},
        'musicTrackId': music_track,
        'neighbors': {
            'north': f'ow_r{screen_row - 1:02d}_c{screen_col:02d}' if is_overworld and screen_row > 0 else None,
            'south': f'ow_r{screen_row + 1:02d}_c{screen_col:02d}' if is_overworld and screen_row < 15 else None,
            'west': f'ow_r{screen_row:02d}_c{screen_col - 1:02d}' if is_overworld and screen_col > 0 else None,
            'east': f'ow_r{screen_row:02d}_c{screen_col + 1:02d}' if is_overworld and screen_col < 15 else None,
        },
        'colliders': extracted_colliders,
        'groundZones': ground_zones,
        'interactables': interactables,
        'enemies': enemy_spawns,
        'cuttables': cuttables,
        'unportedEnemies': sorted(unported_enemies),
        'objects': [o for o in local_objects if o['category'] != 'collider'],
        'tiles': room_tiles,
    }
    manifest_path = os.path.join(out_dir, f'{out_id}_manifest.json')
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2)

    print(f'[OK] Extracted {out_id}:')
    print(f'  -> Pixel BG   : {bg_pixel_path}')
    print(f'  -> Grid Ruler : {ruler_path}')
    print(f'  -> Manifest   : {manifest_path} ({len(extracted_colliders)} colliders, {len(manifest["objects"])} entities/props)')
    print('  -> Wire it  : python scripts/build_region.py (see docs/AGENT_FACTORY_PROTOCOL.md)')


def main():
    parser = argparse.ArgumentParser(description='Deterministic Room Extractor')
    parser.add_argument('--map', '--map-file', dest='map', default='overworld.map', help='Map filename in _ref_repo/Data/Maps/')
    parser.add_argument('--overworld-col', type=int, default=None, help='Overworld screen column (0..15)')
    parser.add_argument('--overworld-row', type=int, default=None, help='Overworld screen row (0..15)')
    parser.add_argument('--room-col', type=int, default=0, help='Indoor/Dungeon room column (10-tile grid)')
    parser.add_argument('--room-row', type=int, default=0, help='Indoor/Dungeon room row (8-tile grid)')
    parser.add_argument('--offset-x', type=int, default=None, help='Explicit world pixel X offset override')
    parser.add_argument('--offset-y', type=int, default=None, help='Explicit world pixel Y offset override')
    parser.add_argument('--out-id', required=True, help='Output room identifier (e.g. ow_r10_c02 or indoor_marin)')
    parser.add_argument('--out-dir', default='public/assets/rooms', help='Output directory')
    args = parser.parse_args()

    if args.overworld_col is not None and args.overworld_row is not None:
        extract_room('overworld.map', args.overworld_col, args.overworld_row, args.out_id, args.out_dir, args.offset_x, args.offset_y)
    else:
        extract_room(args.map, args.room_col, args.room_row, args.out_id, args.out_dir, args.offset_x, args.offset_y)


if __name__ == '__main__':
    main()
