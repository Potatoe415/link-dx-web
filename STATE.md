# STATE

Replace on every update. Max 40 lines. History lives in git and `docs/decisions/`.

Status: Stage 1 (engine) complete. Mabe Village done in pixel art: 13 outdoor screens, 9 interiors with generated door warps (library, Ulrira, phone booth, Madam MeowMeow, BowWow kennel, quadruplets x2, shop, Trendy Game) and the village NPCs. Toronbo Shores done (enemies, sword, Owl). Mysterious Forest extracted (24 rooms incl. witch hut + forest cave), no forest enemies yet.
Focus: Mysterious Forest (`[T-2.4.*]`).
Level: L1

Context:
- Working_On: `scripts/extract_room.py`, `scripts/build_region.py`, `scripts/regions/*.json`, `src/entities/`
- Relevant_Files: `src/main.ts`, `src/entities/{Npc,NpcSystem,Enemy,EnemyManager,Owl,Interactables}.ts`, `src/data/{npcs,enemies,owls}.ts`
- Do_Not_Touch: `_ref_repo/`, `docs/la_dx_knowledge_base/`, generated `src/data/rooms/{mabe_village_overworld,mabe_village_interiors,toronbo_shores,mysterious_forest}.ts`, `src/data/swordFrames.ts`, `src/data/npcAnimations.ts` (regenerate instead)
- Relevant_Decisions: 0002, 0003, 0004, 0005

Next:
- `[T-2.4.1-02]` Port forest enemies: `e5`, `e15`, `e17`, `moblinSword` (see `build_region.py` "not ported" list), Keese, `moveStoneCave` push blocks (forest cave).
- `[T-2.4.2-*]` Toadstool, witch's powder, raccoon, Tail Key (chest already in `ow_r04_c01`).
- Village leftovers (not in a task yet): shop buying, Trendy Game crane, fishing, BowWow quest states, library books on shelves (Pegasus Boots), stairs/cave doors (`cave_rooster`, `cave0`, `dreamShrine01`).

Open_Questions:
- `docs/ARCHITECTURE.md` is out of date (rooms split, generated data, new core/entities modules incl. `Npc`/`NpcSystem`); update proposal awaits user confirmation per AGENTS.md.

Blockers:
- Every `TASK_ROOM_GHIBLI` (`[T-2.2.1-02]`, `[T-2.2.1-03]`, `[T-2.2.2-03]`, ...) needs an image-generation tool; screens ship with the pixel-art fallback.
