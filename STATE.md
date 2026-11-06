# STATE

Replace on every update. Max 40 lines. History lives in git and `docs/decisions/`.

Status: Stage 1 engine complete except `[T-1.4.2-01]` (bushes need the sword). 14 Mabe Village screens playable with 4-way scrolling, HUD, inventory, save, ground tiles, signs/chests, enemy + damage + GAME OVER, 29 GBS tracks.
Focus: Act I gameplay — Toronbo Shores extraction `[T-2.3.1-01]`, sword pickup + slash `[T-2.3.2-01]` `[T-2.3.2-03]`, then bushes `[T-1.4.2-01]`.
Level: L1

Context:
- Working_On: `scripts/extract_room.py`, `scripts/build_region.py`, `src/entities/`
- Relevant_Files: `src/main.ts`, `src/entities/Player.ts`, `src/entities/Enemy.ts`, `src/data/rooms/`, `scripts/regions/*.json`
- Do_Not_Touch: `_ref_repo/`, `docs/la_dx_knowledge_base/`, generated `src/data/rooms/mabe_village_overworld.ts` (regenerate instead)
- Relevant_Decisions: 0002, 0003, 0004, 0005

Next:
- `[T-2.3.1-01]` Extract Toronbo Shores screens into `scripts/regions/toronbo_shores.json`.
- `[T-2.3.2-01]` + `[T-2.3.2-03]` Sword on the beach, `SWORD_SLASH` / spin attack hitting `EnemyManager.hitArea`.
- `[T-1.4.2-01]` Cuttable bushes/grass (runtime objects instead of baked into `bg_pixel`).
- `[T-2.2.1-02]` / `[T-2.2.1-03]` Ghibli paintings: needs an image generator (not available to the last agent session).

Open_Questions:
- `docs/ARCHITECTURE.md` is out of date (rooms split, new core modules); proposed update awaits user confirmation per AGENTS.md.

Blockers:
- `TASK_ROOM_GHIBLI` tasks need an image-generation tool.
