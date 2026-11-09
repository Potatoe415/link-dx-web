#!/usr/bin/env python3
"""
scripts/process_user_characters_sheet.py

Processes the 2048x2048 Studio Ghibli 4x4 characters sheet:
- Uses connected component segmentation + chroma keying to preserve green tunics (Link) and foliage.
- Extracts each of the 16 characters into public/assets/ui/ghibli_characters/<id>.png.
- Assembles public/assets/ui/characters_ghibli.png.
- Saves public/assets/ui/ghibli_characters_manifest.json.
- Generates an interactive HTML preview for verification.
"""

import json
import os
import numpy as np
from PIL import Image
from scipy.ndimage import label, binary_dilation

SRC = r'm:\Users\admin\Documents\DEV\dev-projects\zelda-la-web\tmp-img-gnerated-ext\Gemini_Generated_Image_oaso0koaso0koaso.jpg'
OUT_DIR = os.path.join('public', 'assets', 'ui', 'ghibli_characters')
os.makedirs(OUT_DIR, exist_ok=True)

CHARACTERS_GRID = [
    # Row 0
    [
        ("link_guard", "Link (Posture de Garde & Bouclier)"),
        ("link_item_get", "Link (Pose Victoire Item Get)"),
        ("marin", "Marine (Village des Mouettes)"),
        ("tarin", "Tarkin (Père de Marine)")
    ],
    # Row 1
    [
        ("owl", "Le Grand Hibou Sage"),
        ("raccoon_tarin", "Tarin Raton-Laveur (Forêt)"),
        ("witch_syrup", "Sorcière Syrup (Chaudron)"),
        ("ulrira", "Pépé le Ramollo (Téléphone)")
    ],
    # Row 2
    [
        ("grandma_ulrira", "Mamie Youpi (Balai)"),
        ("madam_meowmeow", "Mme Miaou (Dame Coquette)"),
        ("bowwow", "Toutou (Chain Chomp & Piquet)"),
        ("baby_bowwow", "Petit Toutou (Chomp & Ruban)")
    ],
    # Row 3
    [
        ("shopkeeper", "Le Marchand du Bazar"),
        ("trendy_owner", "Le Gérant du Jeu de Hasard"),
        ("fisherman", "Le Pêcheur du Village"),
        ("village_kids", "Les Gamins Jouant au Ballon")
    ]
]

def process_cell(cell_arr):
    h, w, _ = cell_arr.shape
    arr = cell_arr.astype(np.float32)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]

    # Chroma green threshold for background:
    # High green, very low red AND blue
    is_chroma = (g > 200) & (r < 28) & (b < 28)

    # Label connected components of chroma background
    lbl, num_features = label(is_chroma)
    
    # Outer background connects to the top-left corner
    outer_bg_mask = (lbl == lbl[0, 0])
    
    # Also find any background connected to other 3 corners
    for cy, cx in [(0, w - 1), (h - 1, 0), (h - 1, w - 1)]:
        if is_chroma[cy, cx]:
            outer_bg_mask |= (lbl == lbl[cy, cx])

    # Semi-background transition zone at the borders:
    # Pixels where g is high, r and b are low, and connected or adjacent to outer_bg
    dilated_bg = binary_dilation(outer_bg_mask, iterations=2)
    edge_transition = dilated_bg & ~outer_bg_mask & (g > 150) & (r < 50) & (b < 50) & (g > (r + b) * 1.4)

    # Build alpha
    alpha = np.ones((h, w), dtype=np.float32) * 255.0
    alpha[outer_bg_mask] = 0.0

    if np.any(edge_transition):
        rb_sum = r + b
        # Soft alpha on transition edge
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
    if not os.path.exists(SRC):
        print(f"ERROR: Source file not found: {SRC}")
        return

    im = Image.open(SRC).convert('RGB')
    full_arr = np.array(im)
    print(f"Loaded image: {SRC} ({im.size})")

    cell_size = 512
    manifest = {}
    transparent_sheet = Image.new('RGBA', (2048, 2048), (0, 0, 0, 0))
    items_info = []

    for row_idx in range(4):
        for col_idx in range(4):
            char_id, char_label = CHARACTERS_GRID[row_idx][col_idx]
            x1 = col_idx * cell_size
            y1 = row_idx * cell_size
            x2 = x1 + cell_size
            y2 = y1 + cell_size

            cell_arr = full_arr[y1:y2, x1:x2]
            clean_cell = process_cell(cell_arr)
            transparent_sheet.paste(clean_cell, (x1, y1))

            bbox = clean_cell.getbbox()
            if not bbox:
                bbox = (0, 0, cell_size, cell_size)

            # 4px padding
            bx1 = max(0, bbox[0] - 4)
            by1 = max(0, bbox[1] - 4)
            bx2 = min(cell_size, bbox[2] + 4)
            by2 = min(cell_size, bbox[3] + 4)

            cropped = clean_cell.crop((bx1, by1, bx2, by2))
            out_path = os.path.join(OUT_DIR, f"{char_id}.png")
            cropped.save(out_path, 'PNG')

            w = bx2 - bx1
            h = by2 - by1

            manifest[char_id] = {
                'label': char_label,
                'path': f"/assets/ui/ghibli_characters/{char_id}.png",
                'cell': {'row': row_idx, 'col': col_idx},
                'sheet_coords': {'x': x1 + bx1, 'y': y1 + by1, 'w': w, 'h': h},
                'crop_size': {'w': w, 'h': h}
            }
            print(f"  [{row_idx*4 + col_idx + 1:2d}/16] {char_label:36s} -> {char_id}.png ({w}x{h})")
            items_info.append((char_id, char_label, f"assets/ui/ghibli_characters/{char_id}.png", w, h))

    # Save full sheet
    sheet_out_path = os.path.join('public', 'assets', 'ui', 'characters_ghibli.png')
    transparent_sheet.save(sheet_out_path, 'PNG')
    print(f"\n[OK] Saved unified sheet: {sheet_out_path}")

    # Save manifest
    manifest_path = os.path.join('public', 'assets', 'ui', 'ghibli_characters_manifest.json')
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print(f"[OK] Saved manifest: {manifest_path}")

    # Generate preview HTML
    preview_html_path = os.path.join('public', 'assets', 'ui', 'ghibli_characters_preview.html')
    html = f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Studio Ghibli Characters Preview (16 PNJ)</title>
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
  <h1>Studio Ghibli Characters & Sprites (16 Personnages Extraits)</h1>
  <p>Source : Gemini 2048x2048 &bull; Village des Mouettes, Plage & Forêt &bull; Détourage sans altération des tuniques vertes</p>
  <div class="grid">
"""
    for char_id, label_txt, path, w, h in items_info:
        html += f"""    <div class="card">
      <div class="preview-box">
        <img src="/{path}" alt="{label_txt}">
      </div>
      <div class="label">{label_txt}</div>
      <div class="meta">{char_id}.png &bull; {w}x{h}px</div>
    </div>\n"""

    html += """  </div>
</body>
</html>
"""
    with open(preview_html_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"[OK] Saved HTML preview: {preview_html_path}")

if __name__ == '__main__':
    main()
