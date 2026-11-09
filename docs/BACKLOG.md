# BACKLOG

Current work queue (synced with the full 3-level living checklist in `docs/MASTER_PLAN.md` and `docs/plans/STAGE_01_02_MATRIX.md`). Completed work lives in git history and checked `[x]` items in `docs/MASTER_PLAN.md`.

## Done (Recent)
- [x] **Planche 16 Objets & Props Ghibli (Village, Plage, Forêt)** : extraction haute-fidélité, despill chromatique préservant les verts naturels, découpe en 16 PNGs individuels (`public/assets/ui/ghibli_props/`), feuille complète `objects_ghibli.png` et intégration dual-pass dans `Bushes.ts`, `Interactables.ts`, `MoveStone.ts` et `EnemyManager.ts`.
- [x] UI et contrôles : panneau latéral rétractable à gauche, audio muet par défaut, God Mode (`H`), sélecteur de vitesse x1/x2/x4 (défaut x4).
- [x] Décors Ghibli Toronbo Shores : `ow_r13_c02`, `ow_r14_c02`, `ow_r15_c02` (avec stricte affinité géométrique sans faux chemins).
- [x] Bug fix: ledge jumps (`ObjJump`) ported — Link hops over cliff notches instead of being blocked (`src/entities/LedgeJump.ts`, `RoomDef.jumps`, cross-screen landings carried by the scroll).
- [x] `[T-2.4.2-01..04]` Toadstool, Witch's Magic Powder brewing (`witch_hut`), Raccoon Tarin de-transformation (`ow_r05_c01`), Tail Key chest (`ow_r04_c01`) & Owl flight cutscene.
- [x] `[T-2.2.1-02]` / `[T-2.2.2-03]` Studio Ghibli HD backgrounds & occlusion masks (Batch 1 & 2 — 8 rooms):
  - Overworld: `ow_r09_c02` (village square), `ow_r10_c01` (Papahl cottage), `ow_r10_c03` (cultivation field), `ow_r11_c02` (phonebooth crossroads).
  - Interiors: `library`, `shop`, `ulrira`, `phonebooth`.
- [x] `[T-2.2.2-03]` Studio Ghibli HD backgrounds for all 9 Mabe Village interiors (`library`, `shop`, `ulrira`, `phonebooth`, `bowwow_kennel`, `meow_house`, `quadruplets_house_w`, `quadruplets_house_e`, `trendy_game`).
- [x] Engine dual-pass auto-injection: `scripts/build_region.py` detects `fgGhibli`/`fgPixel` and wires them into `RoomDef`.

## Now (Tail Cave / Chapter 2.5)
- [ ] `[T-2.5.1-01]` Tail Cave exterior entrance (`ow_r13_c03`): keyhole interaction consuming `FLAG_TAIL_KEY_OBTAINED` to open the dungeon gate.
- [ ] `[T-2.5.1-02]` Extract all Tail Cave rooms (`d1_r*_c*`) from `_ref_repo/Data/Maps/dungeon1.map`.
- [ ] `[T-2.5.1-03]` Dungeon systems (small keys, locked doors, stone beak, compass, dungeon map, nightmare key).

## Next
- [ ] Mini-Moldorm (`e12`, `EnemyMiniMoldorm.cs`) with the Tal Tal / mountain screens (`ow_r00_c00`, `ow_r00_c04`, `ow_r00_c05`, `ow_r01_c04`).
- [ ] Enemy hole falls (`AiFallState`): Moblins / Gels walking into `hole` zones; enemies currently treat holes as floor.
- [ ] Village mini-systems: shop purchasing flow, Trendy Game crane physics, side-view fishing pond (`pond.map`), stairs/cave doors (`cave_rooster`, `cave0`, `dreamShrine01`).

## Assets & Sprites Backlog
- [ ] **Animation des tentacules / pattes des pieuvres (Octoroks)** : dessiner plusieurs frames pour animer la marche et l'ondulation des tentacules de l'Octorok lors de ses déplacements en 4 directions.
- [ ] **Sprite pour le bras de Link tenant le bouclier** : ajouter un calque/sprite de bras reliant explicitement le corps de Link au bouclier (en posture de garde et pendant la marche) pour éviter l'effet de flottement du bouclier à côté du corps.

## Pipeline & Backgrounds Ghibli
- [ ] Intégration systématique du `scripts/generate_prompt_spec.py` et validation `scripts/verify_bg_alignment.py` pour chaque nouveau décor extérieur.
- [ ] Toronbo Shores corridor : `ow_r12_c02` (fait), `ow_r13_c02` (fait), `ow_r14_c02` (fait), `ow_r15_c02` (en cours de régénération stricte).
- [ ] Forêt Enchantée : `ow_r05_c00`, `ow_r05_c01`, `ow_r04_c01`, `witch_hut`.
