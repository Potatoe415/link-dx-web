"""
Sprite + collider geometry for map objects, read from the original C# sources in `_ref_repo/`.

`GameObjectTemplates.cs` maps every map object id (e.g. `tree0`, `bush`, `signpost`) to a C# class
and its constructor arguments. For the classes that draw a static sprite this module reproduces the
constructor maths so the extractor can composite the sprite and emit its collider in local 160x128
coordinates:

  ObjSprite        draw = pos + offset - origin            collider = pos + offset + rect
  ObjBush          draw = pos + (8, 8) - origin            collider = pos + (0, 1, 16, 14) if hasCollider
  ObjStone         draw = pos + (8 - w/2, 16 - h)          collider = pos + (8 - w/2, 3, w, 11)
  ObjSignpost      draw = pos + (8, 16) - origin           collider = pos + interactionRect
  ObjAnimatedTile  draw = pos (frame 0, origin ignored)    no collider
"""

import os
import re

REF_DIR = '_ref_repo'
TEMPLATES_CS = os.path.join(REF_DIR, 'InGame', 'GameObjects', 'GameObjectTemplates.cs')
MAP_OBJECTS_DIR = os.path.join(REF_DIR, 'Data', 'Map Objects')

LAYER_BOTTOM, LAYER_PLAYER, LAYER_TOP = 1, 2, 3
_LAYERS = {'Values.LayerBackground': 0, 'Values.LayerBottom': 1, 'Values.LayerPlayer': 2, 'Values.LayerTop': 3}

_TEMPLATE_RE = re.compile(
    r'ObjectTemplates\.Add\("([^"]+)",\s*new GameObjectTemplate\(typeof\((\w+)\),\s*new object\[\]\s*\{(.*?)\}\s*\)\s*\);',
    re.S,
)
_VEC_RE = re.compile(r'new Vector2\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)|Vector2\.Zero')
_RECT_RE = re.compile(r'new Rectangle\(\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*\)')
_STR_RE = re.compile(r'"([^"]*)"|\bnull\b')


def load_sprite_atlases():
    """Returns {spriteId: {'png', 'x', 'y', 'w', 'h', 'ox', 'oy'}} over every atlas in Map Objects/."""
    sprites = {}
    if not os.path.isdir(MAP_OBJECTS_DIR):
        return sprites
    for name in sorted(os.listdir(MAP_OBJECTS_DIR)):
        if not name.endswith('.atlas'):
            continue
        png = os.path.join(MAP_OBJECTS_DIR, name[:-len('.atlas')] + '.png')
        if not os.path.exists(png):
            continue
        with open(os.path.join(MAP_OBJECTS_DIR, name), encoding='utf-8', errors='ignore') as f:
            lines = [l.strip() for l in f]
        for line in lines[2:]:  # line 0 = version, line 1 = scale (always 1 here)
            if ':' not in line:
                continue
            sid, data = line.rsplit(':', 1)
            vals = [int(v) for v in data.split(',') if v.strip().lstrip('-').isdigit()]
            if not sid or len(vals) < 4 or vals[2] <= 0 or vals[3] <= 0:
                continue
            ox, oy = (vals[4], vals[5]) if len(vals) >= 6 else (0, 0)
            sprites.setdefault(sid, {'png': png, 'x': vals[0], 'y': vals[1], 'w': vals[2], 'h': vals[3], 'ox': ox, 'oy': oy})
    return sprites


def _first_str(args, index):
    found = [m.group(1) for m in _STR_RE.finditer(args)]
    return found[index] if index < len(found) else None


def _layer(args, default):
    for key, val in _LAYERS.items():
        if key in args:
            return val
    return default


def load_object_templates(sprites):
    """Returns {objectId: {'cls', 'sprite', 'draw': (dx, dy), 'collider': (x, y, w, h) | None, 'layer'}}."""
    if not os.path.exists(TEMPLATES_CS):
        return {}
    with open(TEMPLATES_CS, encoding='utf-8-sig', errors='ignore') as f:
        src = f.read()

    templates = {}
    for m in _TEMPLATE_RE.finditer(src):
        obj_id, cls, args = m.group(1), m.group(2), m.group(3)
        t = _build(cls, args, sprites)
        if t:
            t['cls'] = cls
            templates.setdefault(obj_id, t)
    return templates


def _build(cls, args, sprites):
    if cls == 'ObjSprite':
        sid = _first_str(args, 0)
        s = sprites.get(sid)
        vec = _VEC_RE.search(args)
        if not s or not vec:
            return None
        ox, oy = (int(vec.group(1)), int(vec.group(2))) if vec.group(1) else (0, 0)
        rect = _RECT_RE.search(args)
        collider = None
        if rect and 'CollisionTypes.Normal' in args:
            rx, ry, rw, rh = (int(v) for v in rect.groups())
            collider = (ox + rx, oy + ry, rw, rh)
        return {'sprite': sid, 'draw': (ox - s['ox'], oy - s['oy']), 'collider': collider, 'layer': _layer(args, LAYER_PLAYER)}

    if cls == 'ObjBush':
        sid = _first_str(args, 1)  # args: spawnItem(null), spriteId, hasCollider, ...
        s = sprites.get(sid)
        if not s:
            return None
        flags = re.findall(r'\b(true|false)\b', args)
        has_collider = bool(flags) and flags[0] == 'true'
        return {'sprite': sid, 'draw': (8 - s['ox'], 8 - s['oy']),
                'collider': (0, 1, 16, 14) if has_collider else None, 'layer': _layer(args, LAYER_PLAYER)}

    if cls == 'ObjStone':
        sid = _first_str(args, 0)
        s = sprites.get(sid)
        if not s:
            return None
        w, h = s['w'], s['h']
        return {'sprite': sid, 'draw': (8 - w // 2 - s['ox'], 16 - h - s['oy']),
                'collider': (8 - w // 2, 3, w, 11), 'layer': LAYER_PLAYER}

    if cls == 'ObjSignpost':
        sid = _first_str(args, 1)  # args: signText(null), spriteId, interactionRect, direction
        s = sprites.get(sid)
        rect = _RECT_RE.search(args)
        if not s:
            return None
        collider = tuple(int(v) for v in rect.groups()) if rect else (0, 4, 16, 12)
        return {'sprite': sid, 'draw': (8 - s['ox'], 16 - s['oy']), 'collider': collider, 'layer': LAYER_PLAYER}

    if cls == 'ObjAnimatedTile':
        sid = _first_str(args, 0)
        if sid not in sprites:
            return None
        return {'sprite': sid, 'draw': (0, 0), 'collider': None, 'layer': _layer(args, LAYER_BOTTOM)}

    return None
