#!/usr/bin/env python3
"""
scripts/process_user_enemies_sheet.py

Processes the 2400x1792 Studio Ghibli 4x4 Beach Octoroks & Forest Moblins Sprite Sheet:
- Segmented via connected components and chroma keying on #00FF00.
- Extracts each of the 16 enemy animation frames into public/assets/characters/enemies/<id>.png.
- Assembles a unified transparent sprite sheet public/assets/characters/enemies/enemies_ghibli_sheet.png.
- Generates JSON manifest public/assets/characters/enemies/enemies_ghibli_manifest.json.
- Generates interactive HTML preview for instant verification.
"""

import os
import sys
import glob
import json
import numpy as np
from PIL import Image
from scipy.ndimage import label, binary_dilation

DEFAULT_SRC_DIR = 'tmp-img-gnerated-ext'
OUT_DIR = os.path.join('public', 'assets', 'characters', 'enemies')
os.makedirs(OUT_DIR, exist_ok=True)

ENEMIES_GRID = [
    # Row 0: Octorok Face & Attack
    [
        ("octorok_down_walk1",      "Octorok Plage - Marche Face 1"),
        ("octorok_down_walk2",      "Octorok Plage - Marche Face 2"),
        ("octorok_down_shoot",      "Octorok Plage - Tir Joues Gonflées"),
        ("octorok_rock_projectile", "Octorok Plage - Projectile Pierre")
    ],
    # Row 1: Octorok Up & Side
    [
        ("octorok_up_walk",         "Octorok Plage - Marche Dos"),
        ("octorok_up_shoot",        "Octorok Plage - Tir Haut"),
        ("octorok_side_walk",       "Octorok Plage - Marche Profil"),
        ("octorok_side_shoot",      "Octorok Plage - Tir Profil")
    ],
    # Row 2: Spear Moblin (Cochon Lance Forêt)
    [
        ("moblin_spear_down_walk",   "Moblin Cochon Lance - Patrouille Face"),
        ("moblin_spear_down_attack", "Moblin Cochon Lance - Coup de Lance"),
        ("moblin_spear_up_walk",     "Moblin Cochon Lance - Marche Dos"),
        ("moblin_spear_side_throw",  "Moblin Cochon Lance - Lancer Profil")
    ],
    # Row 3: Sword Moblin & Combat (Cochon Épée Forêt)
    [
        ("moblin_sword_down_guard",  "Moblin Cochon Épée - Garde & Bouclier"),
        ("moblin_sword_down_slash",  "Moblin Cochon Épée - Taillade"),
        ("moblin_sword_side_charge", "Moblin Cochon Épée - Charge Profil"),
        ("moblin_hurt_stun",         "Moblin Cochon - Recul / Touché")
    ]
]

def find_latest_image():
    if len(sys.argv) > 1 and os.path.exists(sys.argv[1]):
        return sys.argv[1]
    
    candidates = glob.glob(os.path.join(DEFAULT_SRC_DIR, '*.*')) + glob.glob('M:/Users/admin/Downloads/Gemini_Generated_Image_*.*')
    candidates = [f for f in candidates if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
    if not candidates:
        return None
    candidates.sort(key=lambda p: os.path.getmtime(p), reverse=True)
    return candidates[0]

def process_cell(cell_arr):
    h, w, _ = cell_arr.shape
    arr = cell_arr.astype(np.float32)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]

    # Chroma green threshold
    is_chroma = (g > 175) & (r < 80) & (b < 80) & (g > (r + b) * 1.25)

    lbl, _ = label(is_chroma)
    outer_mask = np.zeros((h, w), dtype=bool)
    for cy, cx in [(0, 0), (0, w - 1), (h - 1, 0), (h - 1, w - 1), (0, w // 2), (h - 1, w // 2)]:
        if is_chroma[cy, cx]:
            outer_mask |= (lbl == lbl[cy, cx])

    dilated = binary_dilation(outer_mask, iterations=2)
    edge_trans = dilated & ~outer_mask & (g > 125) & (r < 100) & (b < 100) & (g > (r + b) * 1.15)

    alpha = np.ones((h, w), dtype=np.float32) * 255.0
    alpha[outer_mask] = 0.0
    if np.any(edge_trans):
        rb_sum = r + b
        alpha[edge_trans] = np.clip((rb_sum[edge_trans] - 15.0) / 45.0 * 255.0, 0.0, 255.0)

    clean_r = np.copy(r)
    clean_g = np.copy(g)
    clean_b = np.copy(b)

    edge_zone = (alpha > 0) & (alpha < 248)
    max_rb = np.maximum(r, b)
    spill = np.maximum(0.0, g - max_rb * 1.15)
    clean_g[edge_zone] = np.maximum(0.0, g[edge_zone] - spill[edge_zone] * 0.85)

    out = np.zeros((h, w, 4), dtype=np.uint8)
    out[:, :, 0] = np.clip(clean_r, 0, 255).astype(np.uint8)
    out[:, :, 1] = np.clip(clean_g, 0, 255).astype(np.uint8)
    out[:, :, 2] = np.clip(clean_b, 0, 255).astype(np.uint8)
    out[:, :, 3] = np.clip(alpha, 0, 255).astype(np.uint8)

    return Image.fromarray(out, 'RGBA')

def main():
    src_path = find_latest_image()
    if not src_path:
        print("No image found!")
        return 1

    print(f"Processing Enemies Sprite Sheet: {src_path}")
    im = Image.open(src_path).convert('RGB')
    full_arr = np.array(im)
    img_w, img_h = im.size
    print(f"Image dimensions: {img_w}x{img_h}")

    cell_w = img_w // 4
    cell_h = img_h // 4
    manifest = {}
    transparent_sheet = Image.new('RGBA', (img_w, img_h), (0, 0, 0, 0))
    items_info = []

    for row_idx in range(4):
        for col_idx in range(4):
            enemy_id, enemy_label = ENEMIES_GRID[row_idx][col_idx]
            x1 = col_idx * cell_w
            y1 = row_idx * cell_h
            x2 = x1 + cell_w
            y2 = y1 + cell_h

            cell = full_arr[y1:y2, x1:x2]
            clean_cell = process_cell(cell)
            transparent_sheet.paste(clean_cell, (x1, y1))

            bbox = clean_cell.getbbox()
            if not bbox:
                bbox = (0, 0, cell_w, cell_h)

            bx1 = max(0, bbox[0] - 6)
            by1 = max(0, bbox[1] - 6)
            bx2 = min(cell_w, bbox[2] + 6)
            by2 = min(cell_h, bbox[3] + 6)

            cropped = clean_cell.crop((bx1, by1, bx2, by2))
            out_path = os.path.join(OUT_DIR, f"{enemy_id}.png")
            cropped.save(out_path, 'PNG')

            w = bx2 - bx1
            h = by2 - by1

            manifest[enemy_id] = {
                'label': enemy_label,
                'path': f"/assets/characters/enemies/{enemy_id}.png",
                'cell': {'row': row_idx, 'col': col_idx},
                'crop_size': {'w': w, 'h': h}
            }
            print(f"  [{row_idx * 4 + col_idx + 1:2d}/16] {enemy_label:40s} -> {enemy_id}.png ({w}x{h})")
            items_info.append((enemy_id, enemy_label, f"assets/characters/enemies/{enemy_id}.png", w, h))

    # Save sheet and manifest
    sheet_out_path = os.path.join(OUT_DIR, 'enemies_ghibli_sheet.png')
    transparent_sheet.save(sheet_out_path, 'PNG')
    print(f"\n[OK] Saved unified sheet: {sheet_out_path}")

    manifest_path = os.path.join(OUT_DIR, 'enemies_ghibli_manifest.json')
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print(f"[OK] Saved manifest: {manifest_path}")

    # Preview HTML
    preview_html_path = os.path.join(OUT_DIR, 'enemies_preview.html')
    html = f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Aperçu Sprites Ennemis Ghibli (Octorok & Moblins)</title>
<style>
  body {{ background: #0f111a; color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; margin: 0; }}
  h1 {{ color: #34d399; margin-bottom: 6px; }}
  p {{ color: #94a3b8; margin-top: 0; }}
  .grid {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; max-width: 1200px; margin-top: 24px; }}
  .card {{ background: #181c2b; border-radius: 8px; border: 1px solid #2a3147; padding: 12px; display: flex; flex-direction: column; align-items: center; }}
  .box {{ width: 220px; height: 220px; background: #12141f; border-radius: 6px; display: flex; align-items: center; justify-content: center; background-image: linear-gradient(45deg, #1e2436 25%, transparent 25%), linear-gradient(-45deg, #1e2436 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e2436 75%), linear-gradient(-45deg, transparent 75%, #1e2436 75%); background-size: 16px 16px; background-position: 0 0, 0 8px, 8px -8px, -8px 0px; }}
  .box img {{ max-width: 200px; max-height: 200px; object-fit: contain; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5)); }}
  .title {{ margin-top: 10px; font-weight: 600; font-size: 13px; color: #f1f5f9; text-align: center; }}
  .meta {{ font-size: 11px; color: #64748b; font-family: monospace; margin-top: 4px; }}
</style>
</head>
<body>
  <h1>Ennemis Studio Ghibli : Octoroks (Plage) & Moblins Cochons (Forêt)</h1>
  <p>16 sprites extraits &bull; Fond pur chroma #00FF00 &bull; Compatible dual-pass moteur</p>
  <div class="grid">
"""
    for eid, elabel, epath, ew, eh in items_info:
        html += f"""    <div class="card">
      <div class="box"><img src="/{epath}" alt="{elabel}"></div>
      <div class="title">{elabel}</div>
      <div class="meta">{eid}.png &bull; {ew}x{eh}px</div>
    </div>\n"""
    html += """  </div>
</body>
</html>
"""
    with open(preview_html_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"[OK] Saved preview HTML: {preview_html_path}")
    return 0

if __name__ == '__main__':
    sys.exit(main())
