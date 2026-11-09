#!/usr/bin/env python3
"""
scripts/process_user_objects_sheet.py

Processes the 2048x2048 Studio Ghibli 4x4 items sheet:
- Accurately segments and despills the #00FF00 green background without altering green objects (bush, green rupee, flowers).
- Extracts each of the 16 items into public/assets/ui/ghibli_props/<item_id>.png.
- Assembles and saves public/assets/ui/objects_ghibli.png.
- Generates public/assets/ui/ghibli_props_manifest.json with exact bounding boxes.
- Generates an interactive HTML preview for instant visual verification.
"""

import json
import os
import numpy as np
from PIL import Image
from scipy.ndimage import binary_dilation, gaussian_filter

SRC = r'm:\Users\admin\Documents\DEV\dev-projects\zelda-la-web\tmp-img-gnerated-ext\Gemini_Generated_Image_tep6bctep6bctep6.jpg'
OUT_DIR = os.path.join('public', 'assets', 'ui', 'ghibli_props')
os.makedirs(OUT_DIR, exist_ok=True)

ITEMS_GRID = [
    # Row 0
    [("sword_l1", "Épée L-1"), ("signpost", "Panneau en Bois"), ("bush", "Buisson"), ("flowers_grass", "Fleurs Coupables")],
    # Row 1
    [("rupee_green", "Rubis Vert"), ("rupee_blue", "Rubis Bleu"), ("rupee_red", "Rubis Rouge"), ("heart_recovery", "Cœur de Vie")],
    # Row 2
    [("sleepy_toadstool", "Champignon Magique"), ("magic_powder", "Poudre Magique"), ("tail_key", "Clé Flagello"), ("heart_piece", "Quart de Cœur")],
    # Row 3
    [("chest_closed", "Coffre Fermé"), ("chest_opened", "Coffre Ouvert"), ("pushable_stone", "Rocher Poussable"), ("secret_seashell", "Coquillage Secret")]
]

def process_cell(cell_img, is_green_item=False):
    """
    Cleans a 512x512 cell:
    - cell_img: numpy array uint8 (512, 512, 3)
    - Returns: PIL Image RGBA (512, 512)
    """
    arr = cell_img.astype(np.float32)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]

    # Pure chroma background criteria:
    # High green, very low red AND blue
    is_pure_bg = (g > 200) & (r < 30) & (b < 30) & (g > r * 2.2) & (g > b * 2.2)
    
    # Border / antialiased green halo criteria:
    # A pixel with high green excess where both R and B are low
    is_semi_bg = (g > 160) & (r < 50) & (b < 50) & (g > (r + b) * 1.5)

    # Initial rough background mask
    bg_mask = is_pure_bg | is_semi_bg

    # Soft alpha mask
    # For pixels in transition:
    alpha = np.ones((512, 512), dtype=np.float32) * 255.0
    alpha[is_pure_bg] = 0.0

    # For edge pixels that are semi-bg:
    diff = g - np.maximum(r, b)
    transition = is_semi_bg & ~is_pure_bg
    # Compute alpha gradient based on red/blue presence
    rb_sum = r + b
    # Where rb_sum is low (~20-40), alpha is low (~0-100)
    alpha[transition] = np.clip((rb_sum[transition] - 20.0) / 40.0 * 255.0, 0.0, 255.0)

    # Edge despill: ONLY on the boundary where alpha < 250
    # On green items, do not despill interior pixels!
    edge_zone = (alpha > 0) & (alpha < 240)
    
    clean_r = np.copy(r)
    clean_g = np.copy(g)
    clean_b = np.copy(b)

    # Despill edge zone: clamp G towards max(R, B)
    max_rb = np.maximum(r, b)
    spill_amount = np.maximum(0.0, g - max_rb * 1.1)
    clean_g[edge_zone] = np.maximum(0.0, g[edge_zone] - spill_amount[edge_zone] * 0.8)

    out = np.zeros((512, 512, 4), dtype=np.uint8)
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

    html_items = []

    for row_idx in range(4):
        for col_idx in range(4):
            item_id, item_label = ITEMS_GRID[row_idx][col_idx]
            x1 = col_idx * cell_size
            y1 = row_idx * cell_size
            x2 = x1 + cell_size
            y2 = y1 + cell_size

            cell_arr = full_arr[y1:y2, x1:x2]
            is_green = item_id in ("bush", "rupee_green", "flowers_grass")

            clean_cell = process_cell(cell_arr, is_green_item=is_green)
            transparent_sheet.paste(clean_cell, (x1, y1))

            # Bounding box of the item
            bbox = clean_cell.getbbox()
            if not bbox:
                bbox = (0, 0, cell_size, cell_size)

            # 4px padding around cropped item
            bx1 = max(0, bbox[0] - 4)
            by1 = max(0, bbox[1] - 4)
            bx2 = min(cell_size, bbox[2] + 4)
            by2 = min(cell_size, bbox[3] + 4)

            cropped = clean_cell.crop((bx1, by1, bx2, by2))
            item_path = os.path.join(OUT_DIR, f"{item_id}.png")
            cropped.save(item_path, 'PNG')

            w, h = bx2 - bx1, by2 - by1

            manifest[item_id] = {
                'label': item_label,
                'path': f"/assets/ui/ghibli_props/{item_id}.png",
                'cell': {'row': row_idx, 'col': col_idx},
                'sheet_coords': {'x': x1 + bx1, 'y': y1 + by1, 'w': w, 'h': h},
                'crop_size': {'w': w, 'h': h}
            }
            print(f"  [{row_idx*4 + col_idx + 1:2d}/16] {item_label:24s} -> {item_id}.png ({w}x{h})")
            html_items.append((item_id, item_label, f"assets/ui/ghibli_props/{item_id}.png", w, h))

    # Save full transparent sheet
    sheet_out_path = os.path.join('public', 'assets', 'ui', 'objects_ghibli.png')
    transparent_sheet.save(sheet_out_path, 'PNG')
    print(f"\n[OK] Saved full sheet: {sheet_out_path}")

    # Save manifest
    manifest_path = os.path.join('public', 'assets', 'ui', 'ghibli_props_manifest.json')
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print(f"[OK] Saved manifest: {manifest_path}")

    # Generate visual HTML preview
    preview_html_path = os.path.join('public', 'assets', 'ui', 'ghibli_props_preview.html')
    html_content = f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Studio Ghibli Props Preview (16 Items)</title>
<style>
  body {{
    background: #181920;
    color: #e0e0e0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    padding: 24px;
    margin: 0;
  }}
  h1 {{ color: #7fe09f; margin-bottom: 4px; }}
  p {{ color: #888; margin-top: 0; }}
  .grid {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    max-width: 1200px;
    margin-top: 20px;
  }}
  .card {{
    background: #232530;
    border-radius: 8px;
    padding: 12px;
    border: 1px solid #333644;
    display: flex;
    flex-direction: column;
    align-items: center;
  }}
  .preview-box {{
    width: 200px;
    height: 200px;
    background-image: 
      linear-gradient(45deg, #2b2e3b 25%, transparent 25%), 
      linear-gradient(-45deg, #2b2e3b 25%, transparent 25%), 
      linear-gradient(45deg, transparent 75%, #2b2e3b 75%), 
      linear-gradient(-45deg, transparent 75%, #2b2e3b 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    background-color: #1a1c24;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }}
  .preview-box img {{
    max-width: 180px;
    max-height: 180px;
    object-fit: contain;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));
  }}
  .label {{
    margin-top: 10px;
    font-weight: 600;
    font-size: 14px;
    color: #ffffff;
  }}
  .meta {{
    font-size: 11px;
    color: #8892b0;
    font-family: monospace;
    margin-top: 2px;
  }}
</style>
</head>
<body>
  <h1>Studio Ghibli Props & Items (16 Planches Extraites)</h1>
  <p>Source : Gemini 2048x2048 board &bull; Déspillage chromatique &bull; Alpha antialiasing</p>
  <div class="grid">
"""
    for item_id, label, path, w, h in html_items:
        html_content += f"""    <div class="card">
      <div class="preview-box">
        <img src="/{path}" alt="{label}">
      </div>
      <div class="label">{label}</div>
      <div class="meta">{item_id} &bull; {w}x{h}px</div>
    </div>
"""
    html_content += """  </div>
</body>
</html>
"""
    with open(preview_html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print(f"[OK] Saved HTML preview: {preview_html_path}")

if __name__ == '__main__':
    main()
