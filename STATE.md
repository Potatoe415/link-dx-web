# STATE

Replace on every update. Max 40 lines. History lives in git and `docs/decisions/`.

Status: Stage 1 (engine) complete. Act I playable from Marin's bed to the sword beach: 28 overworld screens (Mabe Village + Toronbo Shores), 4-way scrolling, HUD, inventory, autosave, ground tiles, signs/chests, cuttable bushes, Octoroks, sword slash/spin, damage, GAME OVER, 29 GBS tracks.
Focus: Rest of Act I — beach enemies, Owl, village interiors/NPCs, then Mysterious Forest.
Level: L1

Context:
- Working_On: `scripts/extract_room.py`, `scripts/build_region.py`, `scripts/regions/*.json`, `src/entities/`
- Relevant_Files: `src/main.ts`, `src/entities/{Player,Sword,Enemy,EnemyManager,Bushes,Interactables}.ts`, `src/data/{enemies,uiSprites}.ts`
- Do_Not_Touch: `_ref_repo/`, `docs/la_dx_knowledge_base/`, generated `src/data/rooms/{mabe_village_overworld,toronbo_shores}.ts` and `src/data/swordFrames.ts` (regenerate instead)
- Relevant_Decisions: 0002, 0003, 0004, 0005

Next:
- `[T-2.3.1-02]` Sea urchin (`e1`), plus `e3` Leever and `e4` crab flagged by `build_region.py`.
- `[T-2.3.1-03]` Octorok rock shot (shield deflects).
- `[T-2.3.2-02]` Owl on `ow_r15_c02` after the sword (`music_owl`).
- `[T-2.2.2-01..02]` Village interiors (door warps from manifests) and NPCs.

Open_Questions:
- `docs/ARCHITECTURE.md` is out of date (rooms split, new core/entities modules, generated data); update proposal awaits user confirmation per AGENTS.md.

Blockers:
- Every `TASK_ROOM_GHIBLI` (`[T-2.2.1-02]`, `[T-2.2.1-03]`, `[T-2.2.2-03]`, ...) needs an image-generation tool; screens ship with the pixel-art fallback.
