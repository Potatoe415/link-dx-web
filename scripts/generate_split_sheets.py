#!/usr/bin/env python3
"""
Generate two high-resolution sprite sheets ("planches") on pure white background:
- Planche 1: Le Village des Mouettes & Link (Héros, Habitants, PNJ, Décors du village)
- Planche 2: La Mer, La Forêt, Les Ennemis & Les Objets (Alliés, Ennemis plage & forêt, Quêtes, Props)

Uses 6x nearest-neighbor scaling for ultra-crisp authentic Game Boy pixels at modern HD resolution.
"""

import os
from PIL import Image, ImageDraw, ImageFont

REF_REPO = r"m:\Users\admin\Documents\DEV\dev-projects\zelda-la-web\_ref_repo\Data\Map Objects"
OUT_DIR = r"m:\Users\admin\Documents\DEV\dev-projects\zelda-la-web\public\assets"

SHEETS = {
    'link': Image.open(os.path.join(REF_REPO, 'link0.png')).convert('RGBA'),
    'npcs': Image.open(os.path.join(REF_REPO, 'npcs.png')).convert('RGBA'),
    'enemies': Image.open(os.path.join(REF_REPO, 'enemies.png')).convert('RGBA'),
    'items': Image.open(os.path.join(REF_REPO, 'items.png')).convert('RGBA'),
    'objects': Image.open(os.path.join(REF_REPO, 'objects.png')).convert('RGBA'),
    'anim_obj': Image.open(os.path.join(REF_REPO, 'objects animated.png')).convert('RGBA'),
}

# --- PLANCHE 1 DATA ---
PLANCHE_1 = {
    "title": "PLANCHE 1 : LE VILLAGE DES MOUETTES & LINK",
    "subtitle": "Sprites authentiques Game Boy — Héros Link, Habitants de Cocolint & Décors du Village",
    "filename": "planche_1_village_et_link_hd.png",
    "sections": [
        {
            "title": "1. LINK — ÉTATS & ACTIONS DU HÉROS",
            "color": "#1B5E20",
            "items": [
                ("Link au lit (Dormant)", "link", (385, 175, 16, 15), False, "Maison de Marine"),
                ("Link assis (Réveil)", "link", (368, 175, 16, 15), False, "Maison de Marine"),
                ("Link debout (Face)", "link", (31, 0, 13, 16), False, "Sans équipement"),
                ("Link debout (Profil)", "link", (0, 0, 14, 16), False, "Profil droit"),
                ("Link debout (Dos)", "link", (61, 0, 12, 16), False, "Vue arrière"),
                ("Link avec Bouclier", "link", (126, 45, 14, 16), False, "Bouclier équipé"),
                ("Link Épée & Bouclier", "link", (21, 46, 14, 15), False, "Équipement complet"),
                ("Link coup d'épée", "link", (72, 96, 14, 16), False, "Attaque tranchante"),
                ("Link brandit à 1 main", "link", (443, 135, 16, 16), False, "Obtention Épée"),
                ("Link brandit à 2 mains", "link", (443, 153, 16, 16), False, "Obtention Clé"),
            ]
        },
        {
            "title": "2. HABITANTS & PNJ DU VILLAGE DES MOUETTES (MABE VILLAGE)",
            "color": "#0D47A1",
            "items": [
                ("Marine (Debout)", "npcs", (62, 181, 16, 16), False, "Maison & Extérieur"),
                ("Marine (Chantant)", "npcs", (144, 181, 16, 16), False, "Ballade Poisson-Rêve"),
                ("Marine (Assise à la mer)", "npcs", (96, 181, 14, 16), False, "Plage du sud"),
                ("Tarkin (Debout)", "npcs", (39, 205, 14, 16), False, "Père de Marine"),
                ("Tarkin (Endormi au lit)", "npcs", (192, 205, 15, 16), False, "Lit de la maison"),
                ("Mamie Youpi (Balai G)", "npcs", (392, 63, 16, 16), False, "Mamie Ulrira"),
                ("Mamie Youpi (Balai D)", "npcs", (392, 63, 16, 16), True, "Balayant le village"),
                ("Pépé le Ramollo", "npcs", (313, 57, 15, 20), False, "Ulrira timide"),
                ("Mme Miaou", "npcs", (37, 3, 16, 16), False, "Maîtresse de Toutou"),
                ("Toutou (BowWow face)", "npcs", (353, 86, 16, 16), False, "Chomp enchaîné"),
                ("Toutou (BowWow profil)", "npcs", (318, 86, 16, 16), False, "Niche extérieure"),
                ("Chaîne de Toutou", "npcs", (310, 91, 6, 6), False, "Maillon d'attache"),
                ("Petit Toutou (Choupette)", "npcs", (474, 91, 10, 10), False, "Maison & Niche"),
                ("Petit Toutou (Saut)", "npcs", (442, 86, 14, 15), False, "Sautillant gaiement"),
                ("Mère des quadruplés", "npcs", (213, 2, 19, 16), False, "Maison est"),
                ("Gamin gauche (Ballon)", "npcs", (311, 6, 11, 14), False, "Jeu de balle"),
                ("Gamin droite (Ballon)", "npcs", (360, 6, 11, 14), False, "Jeu de balle"),
                ("Ballon de jeu", "objects", (366, 94, 14, 15), False, "Balle qui vole"),
                ("Gamin au béret vert", "npcs", (388, 6, 13, 14), False, "Conseils de jeu"),
                ("Chien du village", "npcs", (507, 3, 16, 15), False, "Place & Boutique"),
                ("Pêcheur à la ligne", "npcs", (294, 144, 29, 16), False, "Étang de pêche"),
                ("Marchand du bazar", "npcs", (363, 118, 15, 16), False, "Boutique d'objets"),
                ("Gérant jeu de hasard", "npcs", (181, 134, 15, 16), False, "Trendy Game"),
                ("Grue du jeu de hasard", "objects", (490, 67, 16, 16), False, "Pince articulée"),
                ("Peluche Yoshi", "items", (16, 2, 16, 14), False, "Prix du jeu"),
                ("Girouette Coq Volant", "anim_obj", (32, 208, 16, 32), False, "Toit de Marine"),
                ("Statue Coq Volant", "npcs", (304, 176, 16, 16), False, "Place du village"),
            ]
        },
        {
            "title": "3. DÉCORS & INTERVENTIONS DU VILLAGE DES MOUETTES",
            "color": "#37474F",
            "items": [
                ("Jarre en terre cuite", "objects", (408, 34, 15, 16), False, "Soulevable / Cassable"),
                ("Téléphone d'Ulrira", "objects", (67, 95, 16, 20), False, "Cabine d'appel"),
                ("Livre Bibliothèque", "objects", (489, 85, 8, 11), False, "Astuces de jeu"),
                ("Buisson du village", "objects", (361, 1, 14, 14), False, "Tranchable à l'épée"),
                ("Hautes herbes vertes", "objects", (513, 145, 20, 20), False, "Herbe coupable"),
                ("Fleurs décoratives", "objects", (129, 116, 16, 16), False, "Jardin de Marine"),
            ]
        }
    ]
}

# --- PLANCHE 2 DATA ---
PLANCHE_2 = {
    "title": "PLANCHE 2 : LA MER, LA FORÊT, LES ENNEMIS & LES OBJETS",
    "subtitle": "Sprites authentiques Game Boy — Alliés, Monstres, Quêtes & Éléments de Plage et Forêt",
    "filename": "planche_2_mer_foret_ennemis_objets_hd.png",
    "sections": [
        {
            "title": "1. PERSONNAGES & ALLIÉS DE LA MER & DE LA FORÊT",
            "color": "#E65100",
            "items": [
                ("Le Hibou (Perché)", "npcs", (314, 259, 14, 16), False, "Guide mystique"),
                ("Le Hibou (Ailes déployées)", "npcs", (346, 259, 24, 16), False, "Arrivée en vol"),
                ("Le Hibou (En vol plané)", "npcs", (372, 257, 20, 18), False, "Messager ailé"),
                ("Raton-Laveur (Tarin)", "npcs", (125, 205, 16, 16), False, "Ensorcelé en forêt"),
                ("Raton-Laveur (Riant)", "npcs", (143, 205, 16, 16), False, "Bloque le passage"),
                ("Raton-Laveur (Toupie)", "npcs", (89, 205, 16, 16), False, "Sous la poudre"),
                ("Sorcière Syrup", "npcs", (27, 264, 16, 30), False, "Hutte de la sorcière"),
                ("Syrup touillant potion", "npcs", (9, 265, 16, 29), False, "Préparation poudre"),
            ]
        },
        {
            "title": "2. ENNEMIS DE LA MER & PLAGE COCO (TORONBO SHORES)",
            "color": "#006064",
            "items": [
                ("Oursin (Sea Urchin 1)", "enemies", (0, 0, 16, 16), False, "Piquant sur le sable"),
                ("Oursin (Sea Urchin 2)", "enemies", (16, 0, 16, 16), False, "Poussable au bouclier"),
                ("Octorok rouge (Face)", "enemies", (54, 44, 16, 15), False, "Poulpe tireur"),
                ("Octorok rouge (Profil)", "enemies", (2, 43, 15, 16), False, "Marche côtière"),
                ("Octorok rouge (Dos)", "enemies", (72, 44, 16, 15), False, "Vue arrière"),
                ("Tir de pierre Octorok", "enemies", (143, 45, 10, 10), False, "Projectile renvoyable"),
                ("Leever (Émergeant)", "enemies", (0, 64, 16, 16), False, "Surgit du sable"),
                ("Leever (Tournoyant)", "enemies", (32, 64, 16, 16), False, "Attaque tourbillon"),
                ("Crabe de plage (Frame 1)", "enemies", (0, 80, 16, 16), False, "Scuttle latéral"),
                ("Crabe de plage (Frame 2)", "enemies", (16, 80, 16, 16), False, "Marche en crabe"),
            ]
        },
        {
            "title": "3. ENNEMIS DE LA FORÊT ENCHANTÉE (MYSTERIOUS FOREST)",
            "color": "#4A148C",
            "items": [
                ("Moblin lance (Face)", "enemies", (64, 96, 16, 16), False, "Garde de la forêt"),
                ("Moblin lance (Profil)", "enemies", (0, 96, 16, 16), False, "Patrouille boisée"),
                ("Moblin lance (Dos)", "enemies", (32, 96, 16, 16), False, "Vue arrière"),
                ("Lance volante Moblin", "enemies", (256, 104, 16, 8), False, "Javelot ennemi"),
                ("Moblin épée (Face)", "enemies", (168, 208, 18, 16), False, "Moblin cuirassé"),
                ("Moblin épée (Garde)", "enemies", (112, 209, 29, 15), False, "Bouclier parant"),
                ("Chauve-souris Keese 1", "enemies", (48, 21, 16, 8), False, "Ailes déployées"),
                ("Chauve-souris Keese 2", "enemies", (36, 19, 8, 10), False, "Ailes repliées"),
                ("Slime Rouge (Red Zol)", "enemies", (66, 133, 12, 11), False, "Au sol, se divise"),
                ("Slime Rouge bondissant", "enemies", (81, 128, 8, 16), False, "Étiré en saut"),
                ("Petit Gel", "enemies", (9, 132, 7, 7), False, "S'accroche à Link"),
                ("Slime Vert (Green Zol 1)", "enemies", (16, 132, 7, 7), False, "Émerge du sol"),
                ("Slime Vert bondissant", "enemies", (35, 128, 10, 16), False, "Saut surprise"),
                ("Slime Vert au sol", "enemies", (50, 133, 12, 11), False, "Forme normale"),
                ("BuzzBlob ondulant", "enemies", (62, 175, 12, 16), False, "Blob électrifié"),
                ("BuzzBlob électrisé", "enemies", (93, 192, 13, 16), False, "Choc à l'épée"),
            ]
        },
        {
            "title": "4. OBJETS, QUÊTE & COLLECTIBLES (MER, FORÊT, VILLAGE)",
            "color": "#B71C1C",
            "items": [
                ("Bouclier de Link", "items", (40, 127, 8, 10), False, "Échoué sur plage"),
                ("Épée L-1 sur la plage", "items", (154, 140, 10, 24), False, "Plantée dans l'écume"),
                ("Épée L-1 (Inventaire)", "items", (176, 148, 8, 16), False, "Épée du héros"),
                ("Champignon (En forêt)", "items", (90, 40, 10, 11), False, "Champignon sommeil"),
                ("Champignon (Inventaire)", "items", (101, 40, 8, 11), False, "À donner à Syrup"),
                ("Poudre Magique", "items", (49, 123, 8, 14), False, "Désenchante Tarin"),
                ("Clé Flagello (Tail Key)", "items", (1, 19, 8, 15), False, "Coffre de la forêt"),
                ("Coquillage Secret", "items", (128, 20, 8, 14), False, "Sous les buissons"),
                ("Coffre au trésor fermé", "objects", (259, 51, 16, 16), False, "Contient la Clé"),
                ("Rubis Vert (1)", "items", (64, 144, 7, 14), False, "Monnaie de base"),
                ("Rubis Bleu (5)", "items", (126, 38, 7, 14), False, "Valeur 5 rubis"),
                ("Rubis Rouge (20)", "items", (135, 38, 7, 14), False, "Valeur 20 rubis"),
                ("Cœur de récupération", "items", (143, 45, 7, 7), False, "Restaure 1 cœur"),
                ("Quart de Cœur", "items", (174, 73, 16, 15), False, "4 pour 1 réceptacle"),
            ]
        },
        {
            "title": "5. DÉCORS & PROPS DE LA MER & DE LA FORÊT",
            "color": "#424242",
            "items": [
                ("Buisson forêt sombre", "objects", (376, 1, 14, 14), False, "Feuillage forêt"),
                ("Rocher déplaçable", "objects", (378, 17, 16, 16), False, "Pierre poussable"),
                ("Petits cailloux", "objects", (348, 74, 16, 16), False, "Obstacles au sol"),
                ("Pancarte en bois", "objects", (395, 52, 16, 15), False, "Lisible / Tranchable"),
                ("Trou / Gouffre", "objects", (456, 17, 16, 16), False, "Chute de falaise"),
            ]
        }
    ]
}


def extract_sprite(sheet_key, rect, flip_h):
    x, y, w, h = rect
    sheet = SHEETS[sheet_key]
    crop = sheet.crop((x, y, x + w, y + h))
    if flip_h:
        crop = crop.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    return crop


def render_board(planche_data, scale=6, cols=6):
    """
    Renders one high-resolution planche on pure white.
    scale=6 makes 16x16 Game Boy sprites render at 96x96 px (huge, crisp, crystal clear).
    """
    card_w = 230
    card_h = 220
    pad_x = 20
    pad_y = 20
    margin_x = 40
    margin_top = 110
    margin_bottom = 50
    section_header_h = 52

    width = margin_x * 2 + cols * card_w + (cols - 1) * pad_x

    # Compute height
    total_h = margin_top
    for sec in planche_data["sections"]:
        total_h += section_header_h + 15
        rows = (len(sec["items"]) + cols - 1) // cols
        total_h += rows * (card_h + pad_y) + 25
    total_h += margin_bottom

    # Pure white background (#FFFFFF)
    board = Image.new("RGBA", (width, total_h), (255, 255, 255, 255))
    draw = ImageDraw.Draw(board)

    # High-resolution fonts
    font_main_title = ImageFont.truetype("segoeui.ttf", 32)
    font_sub_title = ImageFont.truetype("segoeui.ttf", 16)
    font_sec = ImageFont.truetype("segoeui.ttf", 19)
    font_name = ImageFont.truetype("segoeui.ttf", 14)
    font_note = ImageFont.truetype("segoeui.ttf", 12)

    # Header
    draw.text((margin_x, 24), planche_data["title"], fill=(15, 23, 42), font=font_main_title)
    draw.text((margin_x, 66), planche_data["subtitle"], fill=(100, 116, 139), font=font_sub_title)
    draw.line([(margin_x, 96), (width - margin_x, 96)], fill=(226, 232, 240), width=3)

    y_cursor = margin_top

    for sec in planche_data["sections"]:
        # Section header banner
        draw.rectangle([(margin_x, y_cursor), (width - margin_x, y_cursor + 38)], fill=sec["color"])
        draw.text((margin_x + 16, y_cursor + 6), sec["title"], fill=(255, 255, 255), font=font_sec)
        y_cursor += 50

        items = sec["items"]
        for idx, (name, sheet_key, rect, flip_h, note) in enumerate(items):
            col = idx % cols
            row = idx // cols
            cx = margin_x + col * (card_w + pad_x)
            cy = y_cursor + row * (card_h + pad_y)

            # Card background
            draw.rectangle([(cx, cy), (cx + card_w, cy + card_h)], fill=(250, 250, 252), outline=(226, 232, 240), width=2)

            # Sprite box in upper section
            spr = extract_sprite(sheet_key, rect, flip_h)
            spr_scaled = spr.resize((spr.width * scale, spr.height * scale), Image.Resampling.NEAREST)

            box_cx = cx + card_w // 2
            box_cy = cy + 76
            sx = box_cx - spr_scaled.width // 2
            sy = box_cy - spr_scaled.height // 2

            board.paste(spr_scaled, (sx, sy), spr_scaled)

            # Text labels
            # Draw subtle separator line inside card
            draw.line([(cx + 12, cy + 152), (cx + card_w - 12, cy + 152)], fill=(235, 238, 243), width=1)
            draw.text((cx + 12, cy + 160), name, fill=(15, 23, 42), font=font_name)
            draw.text((cx + 12, cy + 184), note, fill=(100, 116, 139), font=font_note)

        rows = (len(items) + cols - 1) // cols
        y_cursor += rows * (card_h + pad_y) + 25

    out_path = os.path.join(OUT_DIR, planche_data["filename"])
    board.save(out_path, "PNG")
    print(f"Generated {planche_data['filename']}: {width}x{total_h} at {scale}x resolution")


if __name__ == "__main__":
    render_board(PLANCHE_1, scale=6, cols=6)
    render_board(PLANCHE_2, scale=6, cols=6)
