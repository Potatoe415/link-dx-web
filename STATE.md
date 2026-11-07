# STATE

Replace on every update. Max 40 lines. History lives in git and `docs/decisions/`.

Status: Stage 1 (engine) complete. Toronbo Shores done: all beach enemies (Octorok + rock, sea urchin, Leever, crab), sword pickup, Owl cutscene. Act I playable from Marin's bed to the Owl.
Focus: Rest of Act I — village interiors/NPCs, then Mysterious Forest.
Level: L1

Context:
- Working_On: `scripts/extract_room.py`, `scripts/build_region.py`, `scripts/regions/*.json`, `src/entities/`
- Relevant_Files: `src/main.ts`, `src/entities/{Player,Sword,Enemy,EnemyManager,OctorokShot,Owl,Bushes,Interactables}.ts`, `src/data/{enemies,owls,uiSprites}.ts`
- Do_Not_Touch: `_ref_repo/`, `docs/la_dx_knowledge_base/`, generated `src/data/rooms/{mabe_village_overworld,toronbo_shores}.ts` and `src/data/swordFrames.ts` (regenerate instead)
- Relevant_Decisions: 0002, 0003, 0004, 0005

Next:
- `[T-2.2.2-01..02]` Village interiors (door warps from manifests) and NPCs.
- `[T-2.4.*]` Mysterious Forest (next Owl `owl_1_1` at the woods entry is in `src/data/owls.ts` format).

Open_Questions:
- `docs/ARCHITECTURE.md` is out of date (rooms split, new core/entities modules, generated data); update proposal awaits user confirmation per AGENTS.md.

Blockers:
- Every `TASK_ROOM_GHIBLI` (`[T-2.2.1-02]`, `[T-2.2.1-03]`, `[T-2.2.2-03]`, ...) needs an image-generation tool; screens ship with the pixel-art fallback.
