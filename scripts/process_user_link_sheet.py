#!/usr/bin/env python3
"""
scripts/process_user_link_sheet.py

Processes the 2048x2048 Studio Ghibli 4x4 Link Sword & Shield Sprite Sheet:
- Uses connected component segmentation + chroma keying to preserve Link's green tunic (#16a34a) and cap.
- Extracts each of the 16 combat & interaction sprites into public/assets/characters/link/<id>.png.
- Assembles public/assets/characters/link/link_sword_shield_sheet.png.
- Saves public/assets/characters/link/link_sword_shield_manifest.json.
- Generates an interactive HTML preview for visual inspection.
"""

import os
import sys
import glob
import json
import numpy as np
from PIL import Image
from scipy.ndimage import label, binary_dilation

DEFAULT_SRC_DIR = 'tmp-img-gnerated-ext'
OUT_DIR = os.path.join('public', 'assets', 'characters', 'link')
os.makedirs(OUT_DIR, exist_ok=True)

LINK_ACTIONS_GRID = [
    # Row 0: Sword Down & Shield Guard Down
    [
        ("link_sword_down_windup", "Link Coup d'Épée Bas - Préparation"),
        ("link_sword_down_swing",  "Link Coup d'Épée Bas - Taillade & Arc Argenté"),
        ("link_sword_down_thrust", "Link Coup d'Épée Bas - Estoc / Fente"),
        ("link_shield_block_down", "Link Garde Bouclier Face / Bas")
    ],
    # Row 1: Sword Up & Shield Guard Up
    [
        ("link_sword_up_windup", "Link Coup d'Épée Haut - Préparation Dos"),
        ("link_sword_up_swing",  "Link Coup d'Épée Haut - Arc Tranchant Ascendant"),
        ("link_sword_up_thrust", "Link Coup d'Épée Haut - Épée Levée Victoire/Estoc"),
        ("link_shield_block_up", "Link Garde Bouclier Dos / Haut")
    ],
    # Row 2: Sword Side & Shield Guard Side
    [
        ("link_sword_side_windup", "Link Coup d'Épée Côté - Préparation Profil"),
        ("link_sword_side_swing",  "Link Coup d'Épée Côté - Balayage Horizontal"),
        ("link_sword_side_thrust", "Link Coup d'Épée Côté - Estoc Droit"),
        ("link_shield_block_side", "Link Garde Bouclier Profil Droit")
    ],
    # Row 3: Spin Attack & Special Actions
    [
        ("link_sword_charge",   "Link Charge Tourbillon - Épée Étincelante"),
        ("link_spin_front",      "Link Attaque Tourbillon - Vortex 360° Face"),
        ("link_spin_back",       "Link Attaque Tourbillon - Vortex 360° Dos"),
        ("link_shield_bash",     "Link Coup de Bouclier / Charge Perforante")
    ]
]

def find_latest_image():
    if len(sys.argv) > 1 and os.path.exists(sys.argv[1]):
        return sys.argv[1]
    
    candidates = glob.glob(os.path.join(DEFAULT_SRC_DIR, '*.*'))
    candidates = [f for f in candidates if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
    if not candidates:
        return None
    # Sort by modification time descending
    candidates.sort(key=lambda p: os.path.getmtime(p), reverse=True)
    return candidates[0]

def process_cell(cell_arr):
    h, w, _ = cell_arr.shape
    arr = cell_arr.astype(np.float32)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]

    # Chroma green threshold for background:
    # High green, very low red AND blue
    is_chroma = (g > 190) & (r < 35) & (b < 35)

    # Label connected components of chroma background
    lbl, _ = label(is_chroma)
    
    # Outer background connects to the top-left corner
    outer_bg_mask = (lbl == lbl[0, 0])
    
    # Also find any background connected to other 3 corners
    for cy, cx in [(0, w - 1), (h - 1, 0), (h - 1, w - 1)]:
        if is_chroma[cy, cx]:
            outer_bg_mask |= (lbl == lbl[cy, cx])

    # Semi-background transition zone at the borders:
    dilated_bg = binary_dilation(outer_bg_mask, iterations=2)
    edge_transition = dilated_bg & ~outer_bg_mask & (g > 140) & (r < 60) & (b < 60) & (g > (r + b) * 1.35)

    # Build alpha
    alpha = np.ones((h, w), dtype=np.float32) * 255.0
    alpha[outer_bg_mask] = 0.0

    if np.any(edge_transition):
        rb_sum = r + b
        alpha[edge_transition] = np.clip((rb_sum[edge_transition] - 15.0) / 45.0 * 255.0, 0.0, 255.0)

    # Despill edge zone ONLY (where alpha is semi-transparent)
    edge_zone = (alpha > 0) & (alpha < 245)
    
    clean_r = np.copy(r)
    clean_g = np.copy(g)
    clean_b = np.copy(b)

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
        print(f"Usage: python scripts/process_user_link_sheet.py [path_to_image]")
        print(f"No image found in {DEFAULT_SRC_DIR}/")
        return 1

    print(f"Processing Link Sprite Sheet: {src_path}")
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
            action_id, action_label = LINK_ACTIONS_GRID[row_idx][col_idx]
            x1 = col_idx * cell_w
            y1 = row_idx * cell_h
            x2 = x1 + cell_w
            y2 = y1 + cell_h

            cell_arr = full_arr[y1:y2, x1:x2]
            clean_cell = process_cell(cell_arr)
            transparent_sheet.paste(clean_cell, (x1, y1))

            bbox = clean_cell.getbbox()
            if not bbox:
                bbox = (0, 0, cell_w, cell_h)

            # 4px padding
            bx1 = max(0, bbox[0] - 4)
            by1 = max(0, bbox[1] - 4)
            bx2 = min(cell_w, bbox[2] + 4)
            by2 = min(cell_h, bbox[3] + 4)

            cropped = clean_cell.crop((bx1, by1, bx2, by2))
            out_path = os.path.join(OUT_DIR, f"{action_id}.png")
            cropped.save(out_path, 'PNG')

            w = bx2 - bx1
            h = by2 - by1

            manifest[action_id] = {
                'label': action_label,
                'path': f"/assets/characters/link/{action_id}.png",
                'cell': {'row': row_idx, 'col': col_idx},
                'sheet_coords': {'x': x1 + bx1, 'y': y1 + by1, 'w': w, 'h': h},
                'crop_size': {'w': w, 'h': h}
            }
            print(f"  [{row_idx*4 + col_idx + 1:2d}/16] {action_label:44s} -> {action_id}.png ({w}x{h})")
            items_info.append((action_id, action_label, f"assets/characters/link/{action_id}.png", w, h))

    # Save full transparent sheet
    sheet_out_path = os.path.join(OUT_DIR, 'link_sword_shield_sheet.png')
    transparent_sheet.save(sheet_out_path, 'PNG')
    print(f"\n[OK] Saved unified sheet: {sheet_out_path}")

    # Save manifest
    manifest_path = os.path.join(OUT_DIR, 'link_sword_shield_manifest.json')
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print(f"[OK] Saved manifest: {manifest_path}")

    # Generate preview HTML
    preview_html_path = os.path.join(OUT_DIR, 'link_preview.html')
    html = f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Studio Ghibli Link Sword & Shield Sprites Preview</title>
<style>
  body {{
    background: #14161f;
    color: #e0e4f0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    padding: 28px;
    margin: 0;
  }}
  h1 {{ color: #7fe09f; margin-bottom: 6px; }}
  p {{ color: #94a3b8; margin-top: 0; }}
  .grid {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    max-width: 1200px;
    margin-top: 24px;
  }}
  .card {{
    background: #1e2230;
    border-radius: 10px;
    padding: 14px;
    border: 1px solid #2e364f;
    display: flex;
    flex-direction: column;
    align-items: center;
  }}
  .preview-box {{
    width: 220px;
    height: 220px;
    background-image: 
      linear-gradient(45deg, #262b3d 25%, transparent 25%), 
      linear-gradient(-45deg, #262b3d 25%, transparent 25%), 
      linear-gradient(45deg, transparent 75%, #262b3d 75%), 
      linear-gradient(-45deg, transparent 75%, #262b3d 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    background-color: #191c28;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }}
  .preview-box img {{
    max-width: 200px;
    max-height: 200px;
    object-fit: contain;
    filter: drop-shadow(0 6px 12px rgba(0,0,0,0.5));
  }}
  .label {{
    margin-top: 12px;
    font-weight: 600;
    font-size: 14px;
    color: #ffffff;
    text-align: center;
  }}
  .meta {{
    font-size: 11px;
    color: #64748b;
    font-family: monospace;
    margin-top: 4px;
  }}
</style>
</head>
<body>
  <h1>Studio Ghibli Link - Actions Épée & Bouclier (16 Sprites)</h1>
  <p>Détourage haute précision &bull; Préservation intégrale de la tunique verte de Link &bull; Compatible Dual-Pass</p>
  <div class="grid">
"""
    for action_id, label_txt, path, w, h in items_info:
        html += f"""    <div class="card">
      <div class="preview-box">
        <img src="/{path}" alt="{label_txt}">
      </div>
      <div class="label">{label_txt}</div>
      <div class="meta">{action_id}.png &bull; {w}x{h}px</div>
    </div>\n"""

    html += """  </div>
</body>
</html>
"""
    with open(preview_html_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"[OK] Saved HTML preview: {preview_html_path}")
    return 0

if __name__ == '__main__':
    sys.exit(main())
