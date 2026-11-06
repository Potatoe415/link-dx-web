#!/usr/bin/env python3
"""
Generates deterministic Level-5 Room-by-Room Matrix Checklists (`docs/plans/STAGE_*.md`)
so any LLM can execute thousands of micro-tasks one screen and one pass at a time
without overflowing `docs/MASTER_PLAN.md`.
"""

import os

STAGE_02_ZONES = [
    {
        'code': '2.1.1',
        'title': 'Écrans extérieurs du Village des Mouettes (Mabe Village)',
        'kb_ref': 'docs/la_dx_knowledge_base/04_walkthrough_act1_mabe_to_d3.md#11',
        'screens': [
            ('ow_r08_c01', 8, 1, 'Puits du Village (Quart de Cœur #1) & Entrée Nord-Ouest'),
            ('ow_r08_c02', 8, 2, 'Maison de Pépé le Ramollo (Grandpa Ulrira) & Cabine Téléphonique'),
            ('ow_r08_c03', 8, 3, 'Sanctuaire des Rêves (Dream Shrine - Lit & Ocarina)'),
            ('ow_r09_c01', 9, 1, 'Maison de Madame MiaouMiaou & Niche de Toutou (BowWow)'),
            ('ow_r09_c02', 9, 2, 'Place Centrale du Village & Girouette (Marine qui chante)'),
            ('ow_r09_c03', 9, 3, 'Boutique du Village (Shop : Pelle 200R, Arc 980R, Bombes)'),
            ('ow_r10_c01', 10, 1, 'Maison des Quadruplés & Famille Papahl'),
            ('ow_r10_c02', 10, 2, 'Extérieur Maison de Marine & Tarkin (Vertical Slice 01)'),
            ('ow_r10_c03', 10, 3, 'Jeu de Hasard (Trendy Game - Peluche Yoshi)'),
            ('ow_r11_c01', 11, 1, 'Bibliothèque du Village & Panneau Sud-Ouest'),
            ('ow_r11_c02', 11, 2, 'Étang de Pêche (Fishing Pond) & Sortie Sud vers la Plage'),
            ('ow_r11_c03', 11, 3, 'Prairie Sud-Est du Village vers la Cave aux Clés (D1)'),
        ],
    },
    {
        'code': '2.1.2',
        'title': 'Intérieurs du Village des Mouettes (Mabe Village Indoors)',
        'kb_ref': 'docs/la_dx_knowledge_base/04_walkthrough_act1_mabe_to_d3.md#11',
        'indoors': [
            ('indoor_marin', 'house2.map', 0, 0, 'Maison de Marine & Tarkin (Vertical Slice 01)'),
            ('indoor_bowwow', 'house1.map', 0, 0, 'Maison de Madame MiaouMiaou (Mme MeowMeow)'),
            ('indoor_quadruplets', 'house3m.map', 0, 0, 'Maison des Quadruplés & Maman (Échange Peluche Yoshi -> Ruban)'),
            ('indoor_ulrira', 'house4.map', 0, 0, 'Maison de Pépé le Ramollo (Grandpa Ulrira)'),
            ('indoor_phone_mabe', 'helphouse1.map', 0, 0, 'Cabine Téléphonique du Village des Mouettes'),
            ('indoor_library', 'library.map', 0, 0, 'Bibliothèque du Village (8 Livres d’Aide & Livre Sombre)'),
            ('indoor_shop', 'shop1.map', 0, 0, 'Boutique d’Objets (Pelle, Bombes, Arc, Cœurs)'),
            ('indoor_trendy', 'shop2.map', 0, 0, 'Salle du Jeu de Grue (Trendy Game - Peluche Yoshi & Quart de Cœur)'),
            ('indoor_fishing', 'pond.map', 0, 0, 'Étang de Pêche (Mini-jeu 2D Vue de Côté)'),
            ('indoor_well', 'cave0.map', 0, 0, 'Fond du Puits du Village (Quart de Cœur #1)'),
            ('indoor_dream_shrine_1', 'dreamShrine01.map', 0, 0, 'Sanctuaire des Rêves — Salle du Lit'),
            ('indoor_dream_shrine_2', 'dreamShrine02.map', 0, 0, 'Sanctuaire des Rêves — Parcours Bottes de Pégase & Ocarina'),
        ],
    },
    {
        'code': '2.2.1',
        'title': 'Plage Coco (Toronbo Shores) — Récupération de l’Épée',
        'kb_ref': 'docs/la_dx_knowledge_base/04_walkthrough_act1_mabe_to_d3.md#11',
        'screens': [
            ('ow_r12_c01', 12, 1, 'Descente Ouest vers la Plage Coco (Arbres & Rochers)'),
            ('ow_r12_c02', 12, 2, 'Sentier Sud du Village vers la Plage (Octoroks)'),
            ('ow_r13_c01', 13, 1, 'Falaise Ouest de la Plage & Passage'),
            ('ow_r13_c02', 13, 2, 'Accès Nord de la Plage (Oursins à pousser au Bouclier)'),
            ('ow_r14_c01', 14, 1, 'Cabane de Sale (Maison des Bananes)'),
            ('ow_r14_c02', 14, 2, 'Rivage Ouest de la Plage (Oursins & Crabes)'),
            ('ow_r15_c01', 15, 1, 'Pointe Sud-Ouest de la Plage Coco (Boomerang Cave)'),
            ('ow_r15_c02', 15, 2, 'Sable de l’Épée Échouée (`FLAG_SWORD_OBTAINED`) & Cinématique du Hibou'),
            ('ow_r15_c03', 15, 3, 'Plage Centrale (Rondin de Bois & Marin Acte IV)'),
            ('ow_r15_c04', 15, 4, 'Cap Est de la Plage Coco'),
        ],
    },
    {
        'code': '2.3.1',
        'title': 'Forêt Enchantée (Mysterious Woods) & Cabane de la Sorcière',
        'kb_ref': 'docs/la_dx_knowledge_base/04_walkthrough_act1_mabe_to_d3.md#12',
        'screens': [
            ('ow_r07_c00', 7, 0, 'Entrée Sud-Ouest de la Forêt Enchantée & Hibou'),
            ('ow_r07_c01', 7, 1, 'Clairière Sud de la Forêt (Moblins Épéistes)'),
            ('ow_r06_c00', 6, 0, 'Tronc Creux Sud-Ouest (Entrée Grotte aux Rochers)'),
            ('ow_r06_c01', 6, 1, 'Sentier Central de la Forêt Enchantée'),
            ('ow_r05_c00', 5, 0, 'Sortie Nord du Tronc Creux & Champignon Somnifère (`FLAG_TOADSTOOL`)'),
            ('ow_r05_c01', 5, 1, 'Raton Laveur farceur (Tarkin ensorcelé) — Labyrinthe Infini'),
            ('ow_r04_c01', 4, 1, 'Coffre de la Clé Caverne (`FLAG_TAIL_KEY`) & Hibou'),
            ('ow_r05_c04', 5, 4, 'Cimetière Nord-Est & Passage vers la Sorcière'),
            ('ow_r05_c05', 5, 5, 'Extérieur Cabane de la Sorcière Syrup (Koholint Prairie)'),
            ('ow_r13_c03', 13, 3, 'Serrure de la Cave aux Clés (Entrée Donjon 1 - Tail Cave)'),
        ],
    },
]


def generate_stage_01_02():
    os.makedirs('docs/plans', exist_ok=True)
    lines = [
        '# STAGE 01 & 02 — MATRICE ATOMIQUE ÉCRAN PAR ÉCRAN (NIVEAU 5)',
        '',
        '> **Sous-plan vivant déplié de `docs/MASTER_PLAN.md` (Étapes 1 & 2).**',
        '> Chaque écran `(row, col)` ou intérieur est découpé en **4 micro-tâches mécaniques invariantes** pour qu’un LLM exécute 1 seule opération à la fois et la coche (`- [x]`).',
        '',
        '## Légende des 4 Passes par Écran',
        '1. **`[EXTRACT]`** : Exécuter `python scripts/extract_room.py ...` $\\rightarrow$ génère `*_bg_pixel.png`, `*_grid_ruler.png`, `*_manifest.json`.',
        '2. **`[WIRE_WHITEBOX]`** : Déclarer la salle dans `src/data/rooms.ts` avec ses `colliders`, `neighbors` et `bgPixel` $\\rightarrow$ jouable immédiatement en mode Pixel-Art (`G`).',
        '3. **`[ENTITIES_DIALOGUES]`** : Câbler les PNJ, ennemis, objets, warps et dialogues français depuis `docs/la_dx_knowledge_base/`.',
        '4. **`[GHIBLI_PAINT]`** : Générer `*_bg.png` (`1280x1024`) calé sur `*_grid_ruler.png` + extraire `*_fg.png` (toits/arbres) par masque alpha pur.',
        '',
        '---',
        '',
    ]

    for zone in STAGE_02_ZONES:
        lines.append(f"## {zone['code']} — {zone['title']}")
        lines.append(f"*Référence : `{zone['kb_ref']}`*")
        lines.append('')

        if 'screens' in zone:
            for room_id, r, c, desc in zone['screens']:
                done_slice1 = room_id == 'ow_r10_c02'
                chk = 'x' if done_slice1 else ' '
                lines.append(f"### `{room_id}` (Overworld Row {r}, Col {c}) — {desc}")
                lines.append(
                    f"- [{chk}] `[{zone['code']}-{room_id.upper()}-P1]` **[EXTRACT]** : `python scripts/extract_room.py --overworld-row {r} --overworld-col {c} --out-id {room_id}`"
                )
                lines.append(
                    f"- [{chk}] `[{zone['code']}-{room_id.upper()}-P2]` **[WIRE_WHITEBOX]** : Ajouter `{room_id}` dans `src/data/rooms.ts` (`colliders`, `neighbors`, `bgPixel`)."
                )
                lines.append(
                    f"- [{chk}] `[{zone['code']}-{room_id.upper()}-P3]` **[ENTITIES_DIALOGUES]** : Câbler entités, portes et dialogues FR de `{room_id}`."
                )
                lines.append(
                    f"- [{chk}] `[{zone['code']}-{room_id.upper()}-P4]` **[GHIBLI_PAINT]** : Peindre `{room_id}_bg.png` (`1280x1024`) + `{room_id}_fg.png` (masque alpha pur)."
                )
                lines.append('')

        if 'indoors' in zone:
            for room_id, map_file, r, c, desc in zone['indoors']:
                done_slice1 = room_id == 'indoor_marin'
                chk = 'x' if done_slice1 else ' '
                lines.append(f"### `{room_id}` (`{map_file}`, Room {r},{c}) — {desc}")
                lines.append(
                    f"- [{chk}] `[{zone['code']}-{room_id.upper()}-P1]` **[EXTRACT]** : `python scripts/extract_room.py --map-file {map_file} --room-row {r} --room-col {c} --out-id {room_id}`"
                )
                lines.append(
                    f"- [{chk}] `[{zone['code']}-{room_id.upper()}-P2]` **[WIRE_WHITEBOX]** : Ajouter `{room_id}` dans `src/data/rooms.ts` (`colliders`, `warps`, `bgPixel`)."
                )
                lines.append(
                    f"- [{chk}] `[{zone['code']}-{room_id.upper()}-P3]` **[ENTITIES_DIALOGUES]** : Câbler PNJ, événements et dialogues FR de `{room_id}`."
                )
                lines.append(
                    f"- [{chk}] `[{zone['code']}-{room_id.upper()}-P4]` **[GHIBLI_PAINT]** : Peindre `{room_id}_bg.png` (`1280x1024`)."
                )
                lines.append('')

    out_path = 'docs/plans/STAGE_01_02_MATRIX.md'
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print(f'[OK] Generated {out_path} ({len(lines)} lines)')


if __name__ == '__main__':
    generate_stage_01_02()
