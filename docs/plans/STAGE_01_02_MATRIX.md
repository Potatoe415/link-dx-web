# STAGE 01 & 02 — MATRICE ATOMIQUE ÉCRAN PAR ÉCRAN (NIVEAU 5)

> **Sous-plan vivant déplié de `docs/MASTER_PLAN.md` (Étapes 1 & 2).**
> Chaque écran `(row, col)` ou intérieur est découpé en **4 micro-tâches mécaniques invariantes** pour qu’un LLM exécute 1 seule opération à la fois et la coche (`- [x]`).

## Légende des 4 Passes par Écran
1. **`[EXTRACT]`** : Exécuter `python scripts/extract_room.py ...` $\rightarrow$ génère `*_bg_pixel.png`, `*_grid_ruler.png`, `*_manifest.json`.
2. **`[WIRE_WHITEBOX]`** : Déclarer la salle dans `src/data/rooms.ts` avec ses `colliders`, `neighbors` et `bgPixel` $\rightarrow$ jouable immédiatement en mode Pixel-Art (`G`).
3. **`[ENTITIES_DIALOGUES]`** : Câbler les PNJ, ennemis, objets, warps et dialogues français depuis `docs/la_dx_knowledge_base/`.
4. **`[GHIBLI_PAINT]`** : Générer `*_bg.png` (`1280x1024`) calé sur `*_grid_ruler.png` + extraire `*_fg.png` (toits/arbres) par masque alpha pur.

---

## 2.1.1 — Écrans extérieurs du Village des Mouettes (Mabe Village)
*Référence : `docs/la_dx_knowledge_base/04_walkthrough_act1_mabe_to_d3.md#11`*

### `ow_r08_c01` (Overworld Row 8, Col 1) — Puits du Village (Quart de Cœur #1) & Entrée Nord-Ouest
- [ ] `[2.1.1-OW_R08_C01-P1]` **[EXTRACT]** : `python scripts/extract_room.py --overworld-row 8 --overworld-col 1 --out-id ow_r08_c01`
- [ ] `[2.1.1-OW_R08_C01-P2]` **[WIRE_WHITEBOX]** : Ajouter `ow_r08_c01` dans `src/data/rooms.ts` (`colliders`, `neighbors`, `bgPixel`).
- [ ] `[2.1.1-OW_R08_C01-P3]` **[ENTITIES_DIALOGUES]** : Câbler entités, portes et dialogues FR de `ow_r08_c01`.
- [ ] `[2.1.1-OW_R08_C01-P4]` **[GHIBLI_PAINT]** : Peindre `ow_r08_c01_bg.png` (`1280x1024`) + `ow_r08_c01_fg.png` (masque alpha pur).

### `ow_r08_c02` (Overworld Row 8, Col 2) — Maison de Pépé le Ramollo (Grandpa Ulrira) & Cabine Téléphonique
- [ ] `[2.1.1-OW_R08_C02-P1]` **[EXTRACT]** : `python scripts/extract_room.py --overworld-row 8 --overworld-col 2 --out-id ow_r08_c02`
- [ ] `[2.1.1-OW_R08_C02-P2]` **[WIRE_WHITEBOX]** : Ajouter `ow_r08_c02` dans `src/data/rooms.ts` (`colliders`, `neighbors`, `bgPixel`).
- [ ] `[2.1.1-OW_R08_C02-P3]` **[ENTITIES_DIALOGUES]** : Câbler entités, portes et dialogues FR de `ow_r08_c02`.
- [ ] `[2.1.1-OW_R08_C02-P4]` **[GHIBLI_PAINT]** : Peindre `ow_r08_c02_bg.png` (`1280x1024`) + `ow_r08_c02_fg.png` (masque alpha pur).

### `ow_r08_c03` (Overworld Row 8, Col 3) — Sanctuaire des Rêves (Dream Shrine - Lit & Ocarina)
- [ ] `[2.1.1-OW_R08_C03-P1]` **[EXTRACT]** : `python scripts/extract_room.py --overworld-row 8 --overworld-col 3 --out-id ow_r08_c03`
- [ ] `[2.1.1-OW_R08_C03-P2]` **[WIRE_WHITEBOX]** : Ajouter `ow_r08_c03` dans `src/data/rooms.ts` (`colliders`, `neighbors`, `bgPixel`).
- [ ] `[2.1.1-OW_R08_C03-P3]` **[ENTITIES_DIALOGUES]** : Câbler entités, portes et dialogues FR de `ow_r08_c03`.
- [ ] `[2.1.1-OW_R08_C03-P4]` **[GHIBLI_PAINT]** : Peindre `ow_r08_c03_bg.png` (`1280x1024`) + `ow_r08_c03_fg.png` (masque alpha pur).

### `ow_r09_c01` (Overworld Row 9, Col 1) — Maison de Madame MiaouMiaou & Niche de Toutou (BowWow)
- [ ] `[2.1.1-OW_R09_C01-P1]` **[EXTRACT]** : `python scripts/extract_room.py --overworld-row 9 --overworld-col 1 --out-id ow_r09_c01`
- [ ] `[2.1.1-OW_R09_C01-P2]` **[WIRE_WHITEBOX]** : Ajouter `ow_r09_c01` dans `src/data/rooms.ts` (`colliders`, `neighbors`, `bgPixel`).
- [ ] `[2.1.1-OW_R09_C01-P3]` **[ENTITIES_DIALOGUES]** : Câbler entités, portes et dialogues FR de `ow_r09_c01`.
- [ ] `[2.1.1-OW_R09_C01-P4]` **[GHIBLI_PAINT]** : Peindre `ow_r09_c01_bg.png` (`1280x1024`) + `ow_r09_c01_fg.png` (masque alpha pur).

### `ow_r09_c02` (Overworld Row 9, Col 2) — Place Centrale du Village & Girouette (Marine qui chante)
- [ ] `[2.1.1-OW_R09_C02-P1]` **[EXTRACT]** : `python scripts/extract_room.py --overworld-row 9 --overworld-col 2 --out-id ow_r09_c02`
- [ ] `[2.1.1-OW_R09_C02-P2]` **[WIRE_WHITEBOX]** : Ajouter `ow_r09_c02` dans `src/data/rooms.ts` (`colliders`, `neighbors`, `bgPixel`).
- [ ] `[2.1.1-OW_R09_C02-P3]` **[ENTITIES_DIALOGUES]** : Câbler entités, portes et dialogues FR de `ow_r09_c02`.
- [ ] `[2.1.1-OW_R09_C02-P4]` **[GHIBLI_PAINT]** : Peindre `ow_r09_c02_bg.png` (`1280x1024`) + `ow_r09_c02_fg.png` (masque alpha pur).

### `ow_r09_c03` (Overworld Row 9, Col 3) — Boutique du Village (Shop : Pelle 200R, Arc 980R, Bombes)
- [ ] `[2.1.1-OW_R09_C03-P1]` **[EXTRACT]** : `python scripts/extract_room.py --overworld-row 9 --overworld-col 3 --out-id ow_r09_c03`
- [ ] `[2.1.1-OW_R09_C03-P2]` **[WIRE_WHITEBOX]** : Ajouter `ow_r09_c03` dans `src/data/rooms.ts` (`colliders`, `neighbors`, `bgPixel`).
- [ ] `[2.1.1-OW_R09_C03-P3]` **[ENTITIES_DIALOGUES]** : Câbler entités, portes et dialogues FR de `ow_r09_c03`.
- [ ] `[2.1.1-OW_R09_C03-P4]` **[GHIBLI_PAINT]** : Peindre `ow_r09_c03_bg.png` (`1280x1024`) + `ow_r09_c03_fg.png` (masque alpha pur).

### `ow_r10_c01` (Overworld Row 10, Col 1) — Maison des Quadruplés & Famille Papahl
- [ ] `[2.1.1-OW_R10_C01-P1]` **[EXTRACT]** : `python scripts/extract_room.py --overworld-row 10 --overworld-col 1 --out-id ow_r10_c01`
- [ ] `[2.1.1-OW_R10_C01-P2]` **[WIRE_WHITEBOX]** : Ajouter `ow_r10_c01` dans `src/data/rooms.ts` (`colliders`, `neighbors`, `bgPixel`).
- [ ] `[2.1.1-OW_R10_C01-P3]` **[ENTITIES_DIALOGUES]** : Câbler entités, portes et dialogues FR de `ow_r10_c01`.
- [ ] `[2.1.1-OW_R10_C01-P4]` **[GHIBLI_PAINT]** : Peindre `ow_r10_c01_bg.png` (`1280x1024`) + `ow_r10_c01_fg.png` (masque alpha pur).

### `ow_r10_c02` (Overworld Row 10, Col 2) — Extérieur Maison de Marine & Tarkin (Vertical Slice 01)
- [x] `[2.1.1-OW_R10_C02-P1]` **[EXTRACT]** : `python scripts/extract_room.py --overworld-row 10 --overworld-col 2 --out-id ow_r10_c02`
- [x] `[2.1.1-OW_R10_C02-P2]` **[WIRE_WHITEBOX]** : Ajouter `ow_r10_c02` dans `src/data/rooms.ts` (`colliders`, `neighbors`, `bgPixel`).
- [x] `[2.1.1-OW_R10_C02-P3]` **[ENTITIES_DIALOGUES]** : Câbler entités, portes et dialogues FR de `ow_r10_c02`.
- [x] `[2.1.1-OW_R10_C02-P4]` **[GHIBLI_PAINT]** : Peindre `ow_r10_c02_bg.png` (`1280x1024`) + `ow_r10_c02_fg.png` (masque alpha pur).

### `ow_r10_c03` (Overworld Row 10, Col 3) — Jeu de Hasard (Trendy Game - Peluche Yoshi)
- [ ] `[2.1.1-OW_R10_C03-P1]` **[EXTRACT]** : `python scripts/extract_room.py --overworld-row 10 --overworld-col 3 --out-id ow_r10_c03`
- [ ] `[2.1.1-OW_R10_C03-P2]` **[WIRE_WHITEBOX]** : Ajouter `ow_r10_c03` dans `src/data/rooms.ts` (`colliders`, `neighbors`, `bgPixel`).
- [ ] `[2.1.1-OW_R10_C03-P3]` **[ENTITIES_DIALOGUES]** : Câbler entités, portes et dialogues FR de `ow_r10_c03`.
- [ ] `[2.1.1-OW_R10_C03-P4]` **[GHIBLI_PAINT]** : Peindre `ow_r10_c03_bg.png` (`1280x1024`) + `ow_r10_c03_fg.png` (masque alpha pur).

### `ow_r11_c01` (Overworld Row 11, Col 1) — Bibliothèque du Village & Panneau Sud-Ouest
- [ ] `[2.1.1-OW_R11_C01-P1]` **[EXTRACT]** : `python scripts/extract_room.py --overworld-row 11 --overworld-col 1 --out-id ow_r11_c01`
- [ ] `[2.1.1-OW_R11_C01-P2]` **[WIRE_WHITEBOX]** : Ajouter `ow_r11_c01` dans `src/data/rooms.ts` (`colliders`, `neighbors`, `bgPixel`).
- [ ] `[2.1.1-OW_R11_C01-P3]` **[ENTITIES_DIALOGUES]** : Câbler entités, portes et dialogues FR de `ow_r11_c01`.
- [ ] `[2.1.1-OW_R11_C01-P4]` **[GHIBLI_PAINT]** : Peindre `ow_r11_c01_bg.png` (`1280x1024`) + `ow_r11_c01_fg.png` (masque alpha pur).

### `ow_r11_c02` (Overworld Row 11, Col 2) — Étang de Pêche (Fishing Pond) & Sortie Sud vers la Plage
- [ ] `[2.1.1-OW_R11_C02-P1]` **[EXTRACT]** : `python scripts/extract_room.py --overworld-row 11 --overworld-col 2 --out-id ow_r11_c02`
- [ ] `[2.1.1-OW_R11_C02-P2]` **[WIRE_WHITEBOX]** : Ajouter `ow_r11_c02` dans `src/data/rooms.ts` (`colliders`, `neighbors`, `bgPixel`).
- [ ] `[2.1.1-OW_R11_C02-P3]` **[ENTITIES_DIALOGUES]** : Câbler entités, portes et dialogues FR de `ow_r11_c02`.
- [ ] `[2.1.1-OW_R11_C02-P4]` **[GHIBLI_PAINT]** : Peindre `ow_r11_c02_bg.png` (`1280x1024`) + `ow_r11_c02_fg.png` (masque alpha pur).

### `ow_r11_c03` (Overworld Row 11, Col 3) — Prairie Sud-Est du Village vers la Cave aux Clés (D1)
- [ ] `[2.1.1-OW_R11_C03-P1]` **[EXTRACT]** : `python scripts/extract_room.py --overworld-row 11 --overworld-col 3 --out-id ow_r11_c03`
- [ ] `[2.1.1-OW_R11_C03-P2]` **[WIRE_WHITEBOX]** : Ajouter `ow_r11_c03` dans `src/data/rooms.ts` (`colliders`, `neighbors`, `bgPixel`).
- [ ] `[2.1.1-OW_R11_C03-P3]` **[ENTITIES_DIALOGUES]** : Câbler entités, portes et dialogues FR de `ow_r11_c03`.
- [ ] `[2.1.1-OW_R11_C03-P4]` **[GHIBLI_PAINT]** : Peindre `ow_r11_c03_bg.png` (`1280x1024`) + `ow_r11_c03_fg.png` (masque alpha pur).

## 2.1.2 — Intérieurs du Village des Mouettes (Mabe Village Indoors)
*Référence : `docs/la_dx_knowledge_base/04_walkthrough_act1_mabe_to_d3.md#11`*

### `indoor_marin` (`house2.map`, Room 0,0) — Maison de Marine & Tarkin (Vertical Slice 01)
- [x] `[2.1.2-INDOOR_MARIN-P1]` **[EXTRACT]** : `python scripts/extract_room.py --map-file house2.map --room-row 0 --room-col 0 --out-id indoor_marin`
- [x] `[2.1.2-INDOOR_MARIN-P2]` **[WIRE_WHITEBOX]** : Ajouter `indoor_marin` dans `src/data/rooms.ts` (`colliders`, `warps`, `bgPixel`).
- [x] `[2.1.2-INDOOR_MARIN-P3]` **[ENTITIES_DIALOGUES]** : Câbler PNJ, événements et dialogues FR de `indoor_marin`.
- [x] `[2.1.2-INDOOR_MARIN-P4]` **[GHIBLI_PAINT]** : Peindre `indoor_marin_bg.png` (`1280x1024`).

### `indoor_bowwow` (`house1.map`, Room 0,0) — Maison de Madame MiaouMiaou (Mme MeowMeow)
- [ ] `[2.1.2-INDOOR_BOWWOW-P1]` **[EXTRACT]** : `python scripts/extract_room.py --map-file house1.map --room-row 0 --room-col 0 --out-id indoor_bowwow`
- [ ] `[2.1.2-INDOOR_BOWWOW-P2]` **[WIRE_WHITEBOX]** : Ajouter `indoor_bowwow` dans `src/data/rooms.ts` (`colliders`, `warps`, `bgPixel`).
- [ ] `[2.1.2-INDOOR_BOWWOW-P3]` **[ENTITIES_DIALOGUES]** : Câbler PNJ, événements et dialogues FR de `indoor_bowwow`.
- [ ] `[2.1.2-INDOOR_BOWWOW-P4]` **[GHIBLI_PAINT]** : Peindre `indoor_bowwow_bg.png` (`1280x1024`).

### `indoor_quadruplets` (`house3m.map`, Room 0,0) — Maison des Quadruplés & Maman (Échange Peluche Yoshi -> Ruban)
- [ ] `[2.1.2-INDOOR_QUADRUPLETS-P1]` **[EXTRACT]** : `python scripts/extract_room.py --map-file house3m.map --room-row 0 --room-col 0 --out-id indoor_quadruplets`
- [ ] `[2.1.2-INDOOR_QUADRUPLETS-P2]` **[WIRE_WHITEBOX]** : Ajouter `indoor_quadruplets` dans `src/data/rooms.ts` (`colliders`, `warps`, `bgPixel`).
- [ ] `[2.1.2-INDOOR_QUADRUPLETS-P3]` **[ENTITIES_DIALOGUES]** : Câbler PNJ, événements et dialogues FR de `indoor_quadruplets`.
- [ ] `[2.1.2-INDOOR_QUADRUPLETS-P4]` **[GHIBLI_PAINT]** : Peindre `indoor_quadruplets_bg.png` (`1280x1024`).

### `indoor_ulrira` (`house4.map`, Room 0,0) — Maison de Pépé le Ramollo (Grandpa Ulrira)
- [ ] `[2.1.2-INDOOR_ULRIRA-P1]` **[EXTRACT]** : `python scripts/extract_room.py --map-file house4.map --room-row 0 --room-col 0 --out-id indoor_ulrira`
- [ ] `[2.1.2-INDOOR_ULRIRA-P2]` **[WIRE_WHITEBOX]** : Ajouter `indoor_ulrira` dans `src/data/rooms.ts` (`colliders`, `warps`, `bgPixel`).
- [ ] `[2.1.2-INDOOR_ULRIRA-P3]` **[ENTITIES_DIALOGUES]** : Câbler PNJ, événements et dialogues FR de `indoor_ulrira`.
- [ ] `[2.1.2-INDOOR_ULRIRA-P4]` **[GHIBLI_PAINT]** : Peindre `indoor_ulrira_bg.png` (`1280x1024`).

### `indoor_phone_mabe` (`helphouse1.map`, Room 0,0) — Cabine Téléphonique du Village des Mouettes
- [ ] `[2.1.2-INDOOR_PHONE_MABE-P1]` **[EXTRACT]** : `python scripts/extract_room.py --map-file helphouse1.map --room-row 0 --room-col 0 --out-id indoor_phone_mabe`
- [ ] `[2.1.2-INDOOR_PHONE_MABE-P2]` **[WIRE_WHITEBOX]** : Ajouter `indoor_phone_mabe` dans `src/data/rooms.ts` (`colliders`, `warps`, `bgPixel`).
- [ ] `[2.1.2-INDOOR_PHONE_MABE-P3]` **[ENTITIES_DIALOGUES]** : Câbler PNJ, événements et dialogues FR de `indoor_phone_mabe`.
- [ ] `[2.1.2-INDOOR_PHONE_MABE-P4]` **[GHIBLI_PAINT]** : Peindre `indoor_phone_mabe_bg.png` (`1280x1024`).

### `indoor_library` (`library.map`, Room 0,0) — Bibliothèque du Village (8 Livres d’Aide & Livre Sombre)
- [ ] `[2.1.2-INDOOR_LIBRARY-P1]` **[EXTRACT]** : `python scripts/extract_room.py --map-file library.map --room-row 0 --room-col 0 --out-id indoor_library`
- [ ] `[2.1.2-INDOOR_LIBRARY-P2]` **[WIRE_WHITEBOX]** : Ajouter `indoor_library` dans `src/data/rooms.ts` (`colliders`, `warps`, `bgPixel`).
- [ ] `[2.1.2-INDOOR_LIBRARY-P3]` **[ENTITIES_DIALOGUES]** : Câbler PNJ, événements et dialogues FR de `indoor_library`.
- [ ] `[2.1.2-INDOOR_LIBRARY-P4]` **[GHIBLI_PAINT]** : Peindre `indoor_library_bg.png` (`1280x1024`).

### `indoor_shop` (`shop1.map`, Room 0,0) — Boutique d’Objets (Pelle, Bombes, Arc, Cœurs)
- [ ] `[2.1.2-INDOOR_SHOP-P1]` **[EXTRACT]** : `python scripts/extract_room.py --map-file shop1.map --room-row 0 --room-col 0 --out-id indoor_shop`
- [ ] `[2.1.2-INDOOR_SHOP-P2]` **[WIRE_WHITEBOX]** : Ajouter `indoor_shop` dans `src/data/rooms.ts` (`colliders`, `warps`, `bgPixel`).
- [ ] `[2.1.2-INDOOR_SHOP-P3]` **[ENTITIES_DIALOGUES]** : Câbler PNJ, événements et dialogues FR de `indoor_shop`.
- [ ] `[2.1.2-INDOOR_SHOP-P4]` **[GHIBLI_PAINT]** : Peindre `indoor_shop_bg.png` (`1280x1024`).

### `indoor_trendy` (`shop2.map`, Room 0,0) — Salle du Jeu de Grue (Trendy Game - Peluche Yoshi & Quart de Cœur)
- [ ] `[2.1.2-INDOOR_TRENDY-P1]` **[EXTRACT]** : `python scripts/extract_room.py --map-file shop2.map --room-row 0 --room-col 0 --out-id indoor_trendy`
- [ ] `[2.1.2-INDOOR_TRENDY-P2]` **[WIRE_WHITEBOX]** : Ajouter `indoor_trendy` dans `src/data/rooms.ts` (`colliders`, `warps`, `bgPixel`).
- [ ] `[2.1.2-INDOOR_TRENDY-P3]` **[ENTITIES_DIALOGUES]** : Câbler PNJ, événements et dialogues FR de `indoor_trendy`.
- [ ] `[2.1.2-INDOOR_TRENDY-P4]` **[GHIBLI_PAINT]** : Peindre `indoor_trendy_bg.png` (`1280x1024`).

### `indoor_fishing` (`pond.map`, Room 0,0) — Étang de Pêche (Mini-jeu 2D Vue de Côté)
- [ ] `[2.1.2-INDOOR_FISHING-P1]` **[EXTRACT]** : `python scripts/extract_room.py --map-file pond.map --room-row 0 --room-col 0 --out-id indoor_fishing`
- [ ] `[2.1.2-INDOOR_FISHING-P2]` **[WIRE_WHITEBOX]** : Ajouter `indoor_fishing` dans `src/data/rooms.ts` (`colliders`, `warps`, `bgPixel`).
- [ ] `[2.1.2-INDOOR_FISHING-P3]` **[ENTITIES_DIALOGUES]** : Câbler PNJ, événements et dialogues FR de `indoor_fishing`.
- [ ] `[2.1.2-INDOOR_FISHING-P4]` **[GHIBLI_PAINT]** : Peindre `indoor_fishing_bg.png` (`1280x1024`).

### `indoor_well` (`cave0.map`, Room 0,0) — Fond du Puits du Village (Quart de Cœur #1)
- [ ] `[2.1.2-INDOOR_WELL-P1]` **[EXTRACT]** : `python scripts/extract_room.py --map-file cave0.map --room-row 0 --room-col 0 --out-id indoor_well`
- [ ] `[2.1.2-INDOOR_WELL-P2]` **[WIRE_WHITEBOX]** : Ajouter `indoor_well` dans `src/data/rooms.ts` (`colliders`, `warps`, `bgPixel`).
- [ ] `[2.1.2-INDOOR_WELL-P3]` **[ENTITIES_DIALOGUES]** : Câbler PNJ, événements et dialogues FR de `indoor_well`.
- [ ] `[2.1.2-INDOOR_WELL-P4]` **[GHIBLI_PAINT]** : Peindre `indoor_well_bg.png` (`1280x1024`).

### `indoor_dream_shrine_1` (`dreamShrine01.map`, Room 0,0) — Sanctuaire des Rêves — Salle du Lit
- [ ] `[2.1.2-INDOOR_DREAM_SHRINE_1-P1]` **[EXTRACT]** : `python scripts/extract_room.py --map-file dreamShrine01.map --room-row 0 --room-col 0 --out-id indoor_dream_shrine_1`
- [ ] `[2.1.2-INDOOR_DREAM_SHRINE_1-P2]` **[WIRE_WHITEBOX]** : Ajouter `indoor_dream_shrine_1` dans `src/data/rooms.ts` (`colliders`, `warps`, `bgPixel`).
- [ ] `[2.1.2-INDOOR_DREAM_SHRINE_1-P3]` **[ENTITIES_DIALOGUES]** : Câbler PNJ, événements et dialogues FR de `indoor_dream_shrine_1`.
- [ ] `[2.1.2-INDOOR_DREAM_SHRINE_1-P4]` **[GHIBLI_PAINT]** : Peindre `indoor_dream_shrine_1_bg.png` (`1280x1024`).

### `indoor_dream_shrine_2` (`dreamShrine02.map`, Room 0,0) — Sanctuaire des Rêves — Parcours Bottes de Pégase & Ocarina
- [ ] `[2.1.2-INDOOR_DREAM_SHRINE_2-P1]` **[EXTRACT]** : `python scripts/extract_room.py --map-file dreamShrine02.map --room-row 0 --room-col 0 --out-id indoor_dream_shrine_2`
- [ ] `[2.1.2-INDOOR_DREAM_SHRINE_2-P2]` **[WIRE_WHITEBOX]** : Ajouter `indoor_dream_shrine_2` dans `src/data/rooms.ts` (`colliders`, `warps`, `bgPixel`).
- [ ] `[2.1.2-INDOOR_DREAM_SHRINE_2-P3]` **[ENTITIES_DIALOGUES]** : Câbler PNJ, événements et dialogues FR de `indoor_dream_shrine_2`.
- [ ] `[2.1.2-INDOOR_DREAM_SHRINE_2-P4]` **[GHIBLI_PAINT]** : Peindre `indoor_dream_shrine_2_bg.png` (`1280x1024`).

## 2.2.1 — Plage Coco (Toronbo Shores) — Récupération de l’Épée
*Référence : `docs/la_dx_knowledge_base/04_walkthrough_act1_mabe_to_d3.md#11`*

### `ow_r12_c01` (Overworld Row 12, Col 1) — Descente Ouest vers la Plage Coco (Arbres & Rochers)
- [ ] `[2.2.1-OW_R12_C01-P1]` **[EXTRACT]** : `python scripts/extract_room.py --overworld-row 12 --overworld-col 1 --out-id ow_r12_c01`
- [ ] `[2.2.1-OW_R12_C01-P2]` **[WIRE_WHITEBOX]** : Ajouter `ow_r12_c01` dans `src/data/rooms.ts` (`colliders`, `neighbors`, `bgPixel`).
- [ ] `[2.2.1-OW_R12_C01-P3]` **[ENTITIES_DIALOGUES]** : Câbler entités, portes et dialogues FR de `ow_r12_c01`.
- [ ] `[2.2.1-OW_R12_C01-P4]` **[GHIBLI_PAINT]** : Peindre `ow_r12_c01_bg.png` (`1280x1024`) + `ow_r12_c01_fg.png` (masque alpha pur).

### `ow_r12_c02` (Overworld Row 12, Col 2) — Sentier Sud du Village vers la Plage (Octoroks)
- [ ] `[2.2.1-OW_R12_C02-P1]` **[EXTRACT]** : `python scripts/extract_room.py --overworld-row 12 --overworld-col 2 --out-id ow_r12_c02`
- [ ] `[2.2.1-OW_R12_C02-P2]` **[WIRE_WHITEBOX]** : Ajouter `ow_r12_c02` dans `src/data/rooms.ts` (`colliders`, `neighbors`, `bgPixel`).
- [ ] `[2.2.1-OW_R12_C02-P3]` **[ENTITIES_DIALOGUES]** : Câbler entités, portes et dialogues FR de `ow_r12_c02`.
- [ ] `[2.2.1-OW_R12_C02-P4]` **[GHIBLI_PAINT]** : Peindre `ow_r12_c02_bg.png` (`1280x1024`) + `ow_r12_c02_fg.png` (masque alpha pur).

### `ow_r13_c01` (Overworld Row 13, Col 1) — Falaise Ouest de la Plage & Passage
- [ ] `[2.2.1-OW_R13_C01-P1]` **[EXTRACT]** : `python scripts/extract_room.py --overworld-row 13 --overworld-col 1 --out-id ow_r13_c01`
- [ ] `[2.2.1-OW_R13_C01-P2]` **[WIRE_WHITEBOX]** : Ajouter `ow_r13_c01` dans `src/data/rooms.ts` (`colliders`, `neighbors`, `bgPixel`).
- [ ] `[2.2.1-OW_R13_C01-P3]` **[ENTITIES_DIALOGUES]** : Câbler entités, portes et dialogues FR de `ow_r13_c01`.
- [ ] `[2.2.1-OW_R13_C01-P4]` **[GHIBLI_PAINT]** : Peindre `ow_r13_c01_bg.png` (`1280x1024`) + `ow_r13_c01_fg.png` (masque alpha pur).

### `ow_r13_c02` (Overworld Row 13, Col 2) — Accès Nord de la Plage (Oursins à pousser au Bouclier)
- [ ] `[2.2.1-OW_R13_C02-P1]` **[EXTRACT]** : `python scripts/extract_room.py --overworld-row 13 --overworld-col 2 --out-id ow_r13_c02`
- [ ] `[2.2.1-OW_R13_C02-P2]` **[WIRE_WHITEBOX]** : Ajouter `ow_r13_c02` dans `src/data/rooms.ts` (`colliders`, `neighbors`, `bgPixel`).
- [ ] `[2.2.1-OW_R13_C02-P3]` **[ENTITIES_DIALOGUES]** : Câbler entités, portes et dialogues FR de `ow_r13_c02`.
- [ ] `[2.2.1-OW_R13_C02-P4]` **[GHIBLI_PAINT]** : Peindre `ow_r13_c02_bg.png` (`1280x1024`) + `ow_r13_c02_fg.png` (masque alpha pur).

### `ow_r14_c01` (Overworld Row 14, Col 1) — Cabane de Sale (Maison des Bananes)
- [ ] `[2.2.1-OW_R14_C01-P1]` **[EXTRACT]** : `python scripts/extract_room.py --overworld-row 14 --overworld-col 1 --out-id ow_r14_c01`
- [ ] `[2.2.1-OW_R14_C01-P2]` **[WIRE_WHITEBOX]** : Ajouter `ow_r14_c01` dans `src/data/rooms.ts` (`colliders`, `neighbors`, `bgPixel`).
- [ ] `[2.2.1-OW_R14_C01-P3]` **[ENTITIES_DIALOGUES]** : Câbler entités, portes et dialogues FR de `ow_r14_c01`.
- [ ] `[2.2.1-OW_R14_C01-P4]` **[GHIBLI_PAINT]** : Peindre `ow_r14_c01_bg.png` (`1280x1024`) + `ow_r14_c01_fg.png` (masque alpha pur).

### `ow_r14_c02` (Overworld Row 14, Col 2) — Rivage Ouest de la Plage (Oursins & Crabes)
- [ ] `[2.2.1-OW_R14_C02-P1]` **[EXTRACT]** : `python scripts/extract_room.py --overworld-row 14 --overworld-col 2 --out-id ow_r14_c02`
- [ ] `[2.2.1-OW_R14_C02-P2]` **[WIRE_WHITEBOX]** : Ajouter `ow_r14_c02` dans `src/data/rooms.ts` (`colliders`, `neighbors`, `bgPixel`).
- [ ] `[2.2.1-OW_R14_C02-P3]` **[ENTITIES_DIALOGUES]** : Câbler entités, portes et dialogues FR de `ow_r14_c02`.
- [ ] `[2.2.1-OW_R14_C02-P4]` **[GHIBLI_PAINT]** : Peindre `ow_r14_c02_bg.png` (`1280x1024`) + `ow_r14_c02_fg.png` (masque alpha pur).

### `ow_r15_c01` (Overworld Row 15, Col 1) — Pointe Sud-Ouest de la Plage Coco (Boomerang Cave)
- [ ] `[2.2.1-OW_R15_C01-P1]` **[EXTRACT]** : `python scripts/extract_room.py --overworld-row 15 --overworld-col 1 --out-id ow_r15_c01`
- [ ] `[2.2.1-OW_R15_C01-P2]` **[WIRE_WHITEBOX]** : Ajouter `ow_r15_c01` dans `src/data/rooms.ts` (`colliders`, `neighbors`, `bgPixel`).
- [ ] `[2.2.1-OW_R15_C01-P3]` **[ENTITIES_DIALOGUES]** : Câbler entités, portes et dialogues FR de `ow_r15_c01`.
- [ ] `[2.2.1-OW_R15_C01-P4]` **[GHIBLI_PAINT]** : Peindre `ow_r15_c01_bg.png` (`1280x1024`) + `ow_r15_c01_fg.png` (masque alpha pur).

### `ow_r15_c02` (Overworld Row 15, Col 2) — Sable de l’Épée Échouée (`FLAG_SWORD_OBTAINED`) & Cinématique du Hibou
- [ ] `[2.2.1-OW_R15_C02-P1]` **[EXTRACT]** : `python scripts/extract_room.py --overworld-row 15 --overworld-col 2 --out-id ow_r15_c02`
- [ ] `[2.2.1-OW_R15_C02-P2]` **[WIRE_WHITEBOX]** : Ajouter `ow_r15_c02` dans `src/data/rooms.ts` (`colliders`, `neighbors`, `bgPixel`).
- [ ] `[2.2.1-OW_R15_C02-P3]` **[ENTITIES_DIALOGUES]** : Câbler entités, portes et dialogues FR de `ow_r15_c02`.
- [ ] `[2.2.1-OW_R15_C02-P4]` **[GHIBLI_PAINT]** : Peindre `ow_r15_c02_bg.png` (`1280x1024`) + `ow_r15_c02_fg.png` (masque alpha pur).

### `ow_r15_c03` (Overworld Row 15, Col 3) — Plage Centrale (Rondin de Bois & Marin Acte IV)
- [ ] `[2.2.1-OW_R15_C03-P1]` **[EXTRACT]** : `python scripts/extract_room.py --overworld-row 15 --overworld-col 3 --out-id ow_r15_c03`
- [ ] `[2.2.1-OW_R15_C03-P2]` **[WIRE_WHITEBOX]** : Ajouter `ow_r15_c03` dans `src/data/rooms.ts` (`colliders`, `neighbors`, `bgPixel`).
- [ ] `[2.2.1-OW_R15_C03-P3]` **[ENTITIES_DIALOGUES]** : Câbler entités, portes et dialogues FR de `ow_r15_c03`.
- [ ] `[2.2.1-OW_R15_C03-P4]` **[GHIBLI_PAINT]** : Peindre `ow_r15_c03_bg.png` (`1280x1024`) + `ow_r15_c03_fg.png` (masque alpha pur).

### `ow_r15_c04` (Overworld Row 15, Col 4) — Cap Est de la Plage Coco
- [ ] `[2.2.1-OW_R15_C04-P1]` **[EXTRACT]** : `python scripts/extract_room.py --overworld-row 15 --overworld-col 4 --out-id ow_r15_c04`
- [ ] `[2.2.1-OW_R15_C04-P2]` **[WIRE_WHITEBOX]** : Ajouter `ow_r15_c04` dans `src/data/rooms.ts` (`colliders`, `neighbors`, `bgPixel`).
- [ ] `[2.2.1-OW_R15_C04-P3]` **[ENTITIES_DIALOGUES]** : Câbler entités, portes et dialogues FR de `ow_r15_c04`.
- [ ] `[2.2.1-OW_R15_C04-P4]` **[GHIBLI_PAINT]** : Peindre `ow_r15_c04_bg.png` (`1280x1024`) + `ow_r15_c04_fg.png` (masque alpha pur).

## 2.3.1 — Forêt Enchantée (Mysterious Woods) & Cabane de la Sorcière
*Référence : `docs/la_dx_knowledge_base/04_walkthrough_act1_mabe_to_d3.md#12`*

### `ow_r07_c00` (Overworld Row 7, Col 0) — Entrée Sud-Ouest de la Forêt Enchantée & Hibou
- [ ] `[2.3.1-OW_R07_C00-P1]` **[EXTRACT]** : `python scripts/extract_room.py --overworld-row 7 --overworld-col 0 --out-id ow_r07_c00`
- [ ] `[2.3.1-OW_R07_C00-P2]` **[WIRE_WHITEBOX]** : Ajouter `ow_r07_c00` dans `src/data/rooms.ts` (`colliders`, `neighbors`, `bgPixel`).
- [ ] `[2.3.1-OW_R07_C00-P3]` **[ENTITIES_DIALOGUES]** : Câbler entités, portes et dialogues FR de `ow_r07_c00`.
- [ ] `[2.3.1-OW_R07_C00-P4]` **[GHIBLI_PAINT]** : Peindre `ow_r07_c00_bg.png` (`1280x1024`) + `ow_r07_c00_fg.png` (masque alpha pur).

### `ow_r07_c01` (Overworld Row 7, Col 1) — Clairière Sud de la Forêt (Moblins Épéistes)
- [ ] `[2.3.1-OW_R07_C01-P1]` **[EXTRACT]** : `python scripts/extract_room.py --overworld-row 7 --overworld-col 1 --out-id ow_r07_c01`
- [ ] `[2.3.1-OW_R07_C01-P2]` **[WIRE_WHITEBOX]** : Ajouter `ow_r07_c01` dans `src/data/rooms.ts` (`colliders`, `neighbors`, `bgPixel`).
- [ ] `[2.3.1-OW_R07_C01-P3]` **[ENTITIES_DIALOGUES]** : Câbler entités, portes et dialogues FR de `ow_r07_c01`.
- [ ] `[2.3.1-OW_R07_C01-P4]` **[GHIBLI_PAINT]** : Peindre `ow_r07_c01_bg.png` (`1280x1024`) + `ow_r07_c01_fg.png` (masque alpha pur).

### `ow_r06_c00` (Overworld Row 6, Col 0) — Tronc Creux Sud-Ouest (Entrée Grotte aux Rochers)
- [ ] `[2.3.1-OW_R06_C00-P1]` **[EXTRACT]** : `python scripts/extract_room.py --overworld-row 6 --overworld-col 0 --out-id ow_r06_c00`
- [ ] `[2.3.1-OW_R06_C00-P2]` **[WIRE_WHITEBOX]** : Ajouter `ow_r06_c00` dans `src/data/rooms.ts` (`colliders`, `neighbors`, `bgPixel`).
- [ ] `[2.3.1-OW_R06_C00-P3]` **[ENTITIES_DIALOGUES]** : Câbler entités, portes et dialogues FR de `ow_r06_c00`.
- [ ] `[2.3.1-OW_R06_C00-P4]` **[GHIBLI_PAINT]** : Peindre `ow_r06_c00_bg.png` (`1280x1024`) + `ow_r06_c00_fg.png` (masque alpha pur).

### `ow_r06_c01` (Overworld Row 6, Col 1) — Sentier Central de la Forêt Enchantée
- [ ] `[2.3.1-OW_R06_C01-P1]` **[EXTRACT]** : `python scripts/extract_room.py --overworld-row 6 --overworld-col 1 --out-id ow_r06_c01`
- [ ] `[2.3.1-OW_R06_C01-P2]` **[WIRE_WHITEBOX]** : Ajouter `ow_r06_c01` dans `src/data/rooms.ts` (`colliders`, `neighbors`, `bgPixel`).
- [ ] `[2.3.1-OW_R06_C01-P3]` **[ENTITIES_DIALOGUES]** : Câbler entités, portes et dialogues FR de `ow_r06_c01`.
- [ ] `[2.3.1-OW_R06_C01-P4]` **[GHIBLI_PAINT]** : Peindre `ow_r06_c01_bg.png` (`1280x1024`) + `ow_r06_c01_fg.png` (masque alpha pur).

### `ow_r05_c00` (Overworld Row 5, Col 0) — Sortie Nord du Tronc Creux & Champignon Somnifère (`FLAG_TOADSTOOL`)
- [ ] `[2.3.1-OW_R05_C00-P1]` **[EXTRACT]** : `python scripts/extract_room.py --overworld-row 5 --overworld-col 0 --out-id ow_r05_c00`
- [ ] `[2.3.1-OW_R05_C00-P2]` **[WIRE_WHITEBOX]** : Ajouter `ow_r05_c00` dans `src/data/rooms.ts` (`colliders`, `neighbors`, `bgPixel`).
- [ ] `[2.3.1-OW_R05_C00-P3]` **[ENTITIES_DIALOGUES]** : Câbler entités, portes et dialogues FR de `ow_r05_c00`.
- [ ] `[2.3.1-OW_R05_C00-P4]` **[GHIBLI_PAINT]** : Peindre `ow_r05_c00_bg.png` (`1280x1024`) + `ow_r05_c00_fg.png` (masque alpha pur).

### `ow_r05_c01` (Overworld Row 5, Col 1) — Raton Laveur farceur (Tarkin ensorcelé) — Labyrinthe Infini
- [ ] `[2.3.1-OW_R05_C01-P1]` **[EXTRACT]** : `python scripts/extract_room.py --overworld-row 5 --overworld-col 1 --out-id ow_r05_c01`
- [ ] `[2.3.1-OW_R05_C01-P2]` **[WIRE_WHITEBOX]** : Ajouter `ow_r05_c01` dans `src/data/rooms.ts` (`colliders`, `neighbors`, `bgPixel`).
- [ ] `[2.3.1-OW_R05_C01-P3]` **[ENTITIES_DIALOGUES]** : Câbler entités, portes et dialogues FR de `ow_r05_c01`.
- [ ] `[2.3.1-OW_R05_C01-P4]` **[GHIBLI_PAINT]** : Peindre `ow_r05_c01_bg.png` (`1280x1024`) + `ow_r05_c01_fg.png` (masque alpha pur).

### `ow_r04_c01` (Overworld Row 4, Col 1) — Coffre de la Clé Caverne (`FLAG_TAIL_KEY`) & Hibou
- [ ] `[2.3.1-OW_R04_C01-P1]` **[EXTRACT]** : `python scripts/extract_room.py --overworld-row 4 --overworld-col 1 --out-id ow_r04_c01`
- [ ] `[2.3.1-OW_R04_C01-P2]` **[WIRE_WHITEBOX]** : Ajouter `ow_r04_c01` dans `src/data/rooms.ts` (`colliders`, `neighbors`, `bgPixel`).
- [ ] `[2.3.1-OW_R04_C01-P3]` **[ENTITIES_DIALOGUES]** : Câbler entités, portes et dialogues FR de `ow_r04_c01`.
- [ ] `[2.3.1-OW_R04_C01-P4]` **[GHIBLI_PAINT]** : Peindre `ow_r04_c01_bg.png` (`1280x1024`) + `ow_r04_c01_fg.png` (masque alpha pur).

### `ow_r05_c04` (Overworld Row 5, Col 4) — Cimetière Nord-Est & Passage vers la Sorcière
- [ ] `[2.3.1-OW_R05_C04-P1]` **[EXTRACT]** : `python scripts/extract_room.py --overworld-row 5 --overworld-col 4 --out-id ow_r05_c04`
- [ ] `[2.3.1-OW_R05_C04-P2]` **[WIRE_WHITEBOX]** : Ajouter `ow_r05_c04` dans `src/data/rooms.ts` (`colliders`, `neighbors`, `bgPixel`).
- [ ] `[2.3.1-OW_R05_C04-P3]` **[ENTITIES_DIALOGUES]** : Câbler entités, portes et dialogues FR de `ow_r05_c04`.
- [ ] `[2.3.1-OW_R05_C04-P4]` **[GHIBLI_PAINT]** : Peindre `ow_r05_c04_bg.png` (`1280x1024`) + `ow_r05_c04_fg.png` (masque alpha pur).

### `ow_r05_c05` (Overworld Row 5, Col 5) — Extérieur Cabane de la Sorcière Syrup (Koholint Prairie)
- [ ] `[2.3.1-OW_R05_C05-P1]` **[EXTRACT]** : `python scripts/extract_room.py --overworld-row 5 --overworld-col 5 --out-id ow_r05_c05`
- [ ] `[2.3.1-OW_R05_C05-P2]` **[WIRE_WHITEBOX]** : Ajouter `ow_r05_c05` dans `src/data/rooms.ts` (`colliders`, `neighbors`, `bgPixel`).
- [ ] `[2.3.1-OW_R05_C05-P3]` **[ENTITIES_DIALOGUES]** : Câbler entités, portes et dialogues FR de `ow_r05_c05`.
- [ ] `[2.3.1-OW_R05_C05-P4]` **[GHIBLI_PAINT]** : Peindre `ow_r05_c05_bg.png` (`1280x1024`) + `ow_r05_c05_fg.png` (masque alpha pur).

### `ow_r13_c03` (Overworld Row 13, Col 3) — Serrure de la Cave aux Clés (Entrée Donjon 1 - Tail Cave)
- [ ] `[2.3.1-OW_R13_C03-P1]` **[EXTRACT]** : `python scripts/extract_room.py --overworld-row 13 --overworld-col 3 --out-id ow_r13_c03`
- [ ] `[2.3.1-OW_R13_C03-P2]` **[WIRE_WHITEBOX]** : Ajouter `ow_r13_c03` dans `src/data/rooms.ts` (`colliders`, `neighbors`, `bgPixel`).
- [ ] `[2.3.1-OW_R13_C03-P3]` **[ENTITIES_DIALOGUES]** : Câbler entités, portes et dialogues FR de `ow_r13_c03`.
- [ ] `[2.3.1-OW_R13_C03-P4]` **[GHIBLI_PAINT]** : Peindre `ow_r13_c03_bg.png` (`1280x1024`) + `ow_r13_c03_fg.png` (masque alpha pur).
