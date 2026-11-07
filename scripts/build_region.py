#!/usr/bin/env python3
"""
Turns extracted room manifests into a TypeScript region module for `src/data/rooms/`.

  python scripts/build_region.py scripts/regions/mabe_village_overworld.json

The region config lists room ids (whose `public/assets/rooms/<id>_manifest.json` must exist,
see `scripts/extract_room.py`) with their display names, plus the shared music/ambience.
Colliders are merged into larger rectangles to keep the generated file readable; neighbors are
copied verbatim (the engine ignores neighbors that are not registered in ROOMS).
"""

import argparse
import glob
import json
import os
import sys

ROOMS_DIR = os.path.join('public', 'assets', 'rooms')
REGIONS_DIR = os.path.join('scripts', 'regions')
TEXT_FR = os.path.join(REGIONS_DIR, 'text_fr.json')

# Overworld zone song numbers (musicOverworld.data, read by extract_room.py) -> MusicTrack keys in src/core/Audio.ts
OVERWORLD_MUSIC = {3: 'outdoor', 4: 'overworld', 5: 'mountain', 7: 'animal_village', 8: 'forest', 10: 'desert'}
# Indoor/dungeon ObjMusic song numbers -> MusicTrack keys (song list in scripts/export_gbs_audio.py)
MAP_MUSIC = {1: 'minigame', 6: 'shop', 9: 'house', 37: 'cave', 50: 'helphouse'}

# Original chest item ids (ItemManager.cs) -> ChestContents
CHEST_RUPEES = {'ruby5': 5, 'ruby10': 10, 'ruby20': 20, 'ruby30': 30, 'ruby50': 50, 'ruby100': 100, 'ruby200': 200}
CHEST_ITEMS = {'sword1': 'sword', 'shield': 'shield', 'powder': 'powder', 'feather': 'feather', 'stonelifter': 'bracelet',
               'bomb': 'bombs', 'bow': 'bow', 'hookshot': 'hookshot', 'ocarina': 'ocarina', 'magicRod': 'rod',
               'boomerang': 'boomerang', 'pegasusBoots': 'boots', 'shovel': 'shovel', 'flippers': 'flippers'}
# dkey1..dkey5 are the overworld dungeon keys (Tail, Slime, Angler, Face, Bird), not small keys
QUEST_KEYS = {'dkey1': 'tail', 'dkey2': 'slime', 'dkey3': 'angler', 'dkey4': 'face', 'dkey5': 'bird'}


def chest_contents(item, region_dungeon):
    if item in CHEST_RUPEES:
        return f"{{ type: 'rupees', amount: {CHEST_RUPEES[item]} }}"
    if item in CHEST_ITEMS:
        return f"{{ type: 'item', item: '{CHEST_ITEMS[item]}' }}"
    if item in QUEST_KEYS:
        return f"{{ type: 'questKey', key: '{QUEST_KEYS[item]}' }}"
    if item == 'smallkey':
        return f"{{ type: 'key', dungeon: '{region_dungeon}' }}"
    if item == 'heartPiece':
        return "{ type: 'heartPiece' }"
    return None


def build_interactables(m, cfg, texts):
    out = []
    for it in m.get('interactables') or []:
        if it['kind'] == 'sign':
            key = it.get('textKey') or ''
            if key not in texts:
                sys.exit(f"{m['roomId']}: no French text for sign key '{key}' in {TEXT_FR}")
            pages = ', '.join(ts_string(p) for p in texts[key])
            extra = ''
            if it.get('sprite'):
                extra += f", sprite: '{it['sprite']}'"
            if it.get('requiredDirection') is not None:
                extra += f", requiredDirection: {it['requiredDirection']}"
            out.append(f"      {{ kind: 'sign', id: {ts_string(it['id'])}, x: {it['x']}, y: {it['y']}, pages: [{pages}]{extra} }},")
        elif it['kind'] == 'item':
            out.append(f"      {{ kind: 'item', id: {ts_string(it['id'])}, x: {it['x']}, y: {it['y']}, item: '{it['item']}' }},")
        else:
            contents = chest_contents(it.get('item') or '', cfg.get('dungeon', ''))
            if contents is None:
                print(f"  ! {m['roomId']}: skipping chest {it['id']} with unsupported item '{it.get('item')}'")
                continue
            out.append(f"      {{ kind: 'chest', id: {ts_string(it['id'])}, x: {it['x']}, y: {it['y']}, contents: {contents} }},")
    return out


def merge_rects(rects):
    """Merge exact-adjacent rectangles: first horizontal runs, then identical vertical stacks."""
    cells = sorted({(r['x'], r['y'], r['w'], r['h']) for r in rects}, key=lambda r: (r[1], r[3], r[0]))
    rows = []
    for x, y, w, h in cells:
        last = rows[-1] if rows else None
        if last and last[1] == y and last[3] == h and last[0] + last[2] == x:
            rows[-1] = (last[0], y, last[2] + w, h)
        elif last and last[1] == y and last[3] == h and last[0] <= x < last[0] + last[2]:
            rows[-1] = (last[0], y, max(last[2], x + w - last[0]), h)
        else:
            rows.append((x, y, w, h))

    merged = []
    for x, y, w, h in sorted(rows, key=lambda r: (r[0], r[2], r[1])):
        last = merged[-1] if merged else None
        if last and last[0] == x and last[2] == w and last[1] + last[3] == y:
            merged[-1] = (x, last[1], w, last[3] + h)
        else:
            merged.append((x, y, w, h))
    return sorted(merged, key=lambda r: (r[1], r[0]))


def merge_zones(zones):
    """Merge ground zones per kind with the same rectangle merging as colliders."""
    out = []
    for kind in sorted({z['kind'] for z in zones}):
        out += [(kind, *r) for r in merge_rects([z for z in zones if z['kind'] == kind])]
    return sorted(out, key=lambda z: (z[2], z[1], z[0]))


def room_music(m, cfg):
    """Region config `music` wins; otherwise overworld screens use their musicOverworld.data zone and
    other maps their ObjMusic song."""
    if cfg.get('music'):
        return cfg['music']
    table = OVERWORLD_MUSIC if m.get('sourceMap') == 'overworld.map' else MAP_MUSIC
    track = table.get(m.get('musicTrackId'))
    if not track:
        sys.exit(f"{m['roomId']}: no music (set `music` in the region config or map song {m.get('musicTrackId')})")
    return track


def load_door_index():
    """(sourceMap, entryId) -> (roomId, door) over every room listed in a region config, so door warps
    only target rooms that are actually registered (hand-tuned rooms wire their doors by hand)."""
    index = {}
    for path in glob.glob(os.path.join(REGIONS_DIR, '*.json')):
        if os.path.abspath(path) == os.path.abspath(TEXT_FR):
            continue
        with open(path, encoding='utf-8') as f:
            rooms = json.load(f)['rooms']
        for room_id in rooms:
            mpath = os.path.join(ROOMS_DIR, f'{room_id}_manifest.json')
            if not os.path.exists(mpath):
                continue
            with open(mpath, encoding='utf-8') as f:
                m = json.load(f)
            for door in m.get('doors') or []:
                if door['entryId']:
                    index[(m['sourceMap'], door['entryId'])] = (room_id, door)
    return index


def door_arrival(door):
    """ObjDoor.PlacePlayer (mode 0): Link is placed just outside the door rectangle on its `direction`
    side. There is no walk-in animation here, so he stands 4 px clear of the return trigger
    (AGENT_FACTORY_PROTOCOL anti-loop rule). Returns (x, y, facing) in feet-anchor coordinates."""
    x, y, w, h, d = door['x'], door['y'], door['w'], door['h'], door['direction']
    if d == 1:  # interior doors in the bottom wall: Link walks in facing Up
        return x + w / 2, y - 4, 1
    if d == 3:  # overworld house doors: Link steps out facing Down (8 px feet box + 4 px margin)
        return x + w / 2, y + h + 12, 3
    if d == 0:
        return x - 8, y + h / 2 + 4, 0
    return x + w + 8, y + h / 2 + 4, 2


def build_warps(m, door_index):
    out = []
    for door in m.get('doors') or []:
        if door['mode'] != 0 or not door['nextMap'] or not door['exitId']:
            continue  # stairs / falls / swim doors: not ported yet
        target = door_index.get((door['nextMap'], door['exitId']))
        if not target:
            print(f"  ! {m['roomId']}: door '{door['entryId']}' -> {door['nextMap']}#{door['exitId']} has no registered room")
            continue
        target_id, target_door = target
        tx, ty, tdir = door_arrival(target_door)
        # Link must walk into the door, i.e. face away from the side he is placed on when arriving
        required = (door['direction'] + 2) % 4
        box = f"{{ x: {door['x']}, y: {door['y']}, w: {door['w']}, h: {door['h']} }}"
        out.append(f"      {{ triggerBox: {box}, targetRoom: {ts_string(target_id)}, targetX: {tx:g}, targetY: {ty:g}, "
                   f"targetDirection: {tdir}, requiredDirection: {required} }},")
    return out


def ts_string(s):
    # JSON string syntax is a valid TS string literal (escapes quotes, backslashes and newlines)
    return json.dumps(s, ensure_ascii=False)


def build_room(room_id, name, cfg, texts, door_index):
    path = os.path.join(ROOMS_DIR, f'{room_id}_manifest.json')
    with open(path, encoding='utf-8') as f:
        m = json.load(f)

    neighbors = {k: v for k, v in (m.get('neighbors') or {}).items() if v}
    neighbors.update((cfg.get('neighbors') or {}).get(room_id, {}))  # multi-screen interiors
    colliders = merge_rects(m['colliders'])
    bg = f'/assets/rooms/{room_id}_bg_pixel.png'
    ghibli = f'/assets/rooms/{room_id}_bg.png'
    has_ghibli = os.path.exists(os.path.join('public', ghibli.lstrip('/')))

    lines = [
        f'  {room_id}: {{',
        f'    id: {ts_string(room_id)},',
        f'    name: {ts_string(name)},',
        '    width: 160,',
        '    height: 128,',
        f'    bgPixel: {ts_string(bg)},',
        f'    bgGhibli: {ts_string(ghibli if has_ghibli else bg)},{"" if has_ghibli else " // TEMP: pixel fallback until TASK_ROOM_GHIBLI"}',
        f'    music: {ts_string(room_music(m, cfg))},',
    ]
    ambience = cfg.get('ambience')
    if isinstance(ambience, dict):  # per-room overrides: { "default": ..., "<roomId>": ... }
        ambience = ambience.get(room_id, ambience.get('default'))
    if ambience:
        lines.append(f'    ambience: {ts_string(ambience)},')
    lines.append('    neighbors: { ' + ', '.join(f'{k}: {ts_string(v)}' for k, v in neighbors.items()) + ' },')
    warps = build_warps(m, door_index)
    own_door = next((d for d in m.get('doors') or [] if d['mode'] == 0 and d['nextMap']), None)
    spawn = door_arrival(own_door) if own_door and m.get('sourceMap') != 'overworld.map' else (80, 72, 3)
    lines.append(f'    spawnPoint: {{ x: {spawn[0]:g}, y: {spawn[1]:g}, direction: {spawn[2]} }},')
    if warps:
        lines.append('    warpTriggers: [')
        lines += warps
        lines.append('    ],')
    else:
        lines.append('    warpTriggers: [],')
    lines.append('    colliders: [')
    lines += [f'      {{ x: {x}, y: {y}, w: {w}, h: {h} }},' for x, y, w, h in colliders]
    lines.append('    ],')
    zones = merge_zones(m.get('groundZones') or [])
    if zones:
        lines.append('    groundZones: [')
        lines += [f"      {{ kind: '{k}', x: {x}, y: {y}, w: {w}, h: {h} }}," for k, x, y, w, h in zones]
        lines.append('    ],')
    if m.get('cuttables'):
        lines.append('    cuttables: [')
        lines += [f"      {{ kind: '{c['kind']}', x: {c['x']}, y: {c['y']}, sprite: '{c['sprite']}' }}," for c in m['cuttables']]
        lines.append('    ],')
    if m.get('enemies'):
        lines.append('    enemies: [')
        lines += [f"      {{ kind: '{e['kind']}', x: {e['x']}, y: {e['y']} }}," for e in m['enemies']]
        lines.append('    ],')
    if m.get('unportedEnemies'):
        print(f"  ! {room_id}: enemies not ported yet: {', '.join(m['unportedEnemies'])}")
    inter = build_interactables(m, cfg, texts)
    if inter:
        lines.append('    interactables: [')
        lines += inter
        lines.append('    ],')
    lines += ['    props: []', '  }']
    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(description='Build a TypeScript region module from room manifests')
    parser.add_argument('config', help='Region config JSON (scripts/regions/*.json)')
    args = parser.parse_args()

    with open(args.config, encoding='utf-8') as f:
        cfg = json.load(f)

    missing = [r for r in cfg['rooms'] if not os.path.exists(os.path.join(ROOMS_DIR, f'{r}_manifest.json'))]
    if missing:
        sys.exit(f'Missing manifests (run scripts/extract_room.py first): {", ".join(missing)}')

    with open(TEXT_FR, encoding='utf-8') as f:
        texts = {k: v for k, v in json.load(f).items() if not k.startswith('_')}
    door_index = load_door_index()
    blocks = [build_room(rid, name, cfg, texts, door_index) for rid, name in cfg['rooms'].items()]
    out = '\n'.join([
        f'// AUTO-GENERATED by scripts/build_region.py from {args.config.replace(os.sep, "/")} — do not edit by hand.',
        f'// {cfg.get("comment", "")}',
        '// Generated data: exceeds the ~300 line guideline on purpose (one collider per line).',
        "import { RoomDef } from './types';",
        '',
        f'export const {cfg["export"]}: Record<string, RoomDef> = {{',
        ',\n\n'.join(blocks),
        '};',
        '',
    ])
    with open(cfg['out'], 'w', encoding='utf-8', newline='\n') as f:
        f.write(out)
    print(f'[OK] {cfg["out"]}: {len(blocks)} rooms')


if __name__ == '__main__':
    main()
