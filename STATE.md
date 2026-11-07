# STATE

Replace on every update. Max 40 lines. History lives in git and `docs/decisions/`.

Status: Stage 1 (engine) complete. Mabe Village done in pixel art (13 outdoor screens, 9 interiors, NPCs). Toronbo Shores done (enemies, sword, Owl). Mysterious Forest extracted (24 rooms) with its enemies ported: spear / sword Moblins, Red Zol + Gels, Green Zol, Keese, Buzz Blob, enemy-only walls and push blocks.
Focus: Mysterious Forest quest (`[T-2.4.2-*]`).
Level: L1

Context:
- Working_On: `src/entities/`, `src/data/`, `scripts/regions/mysterious_forest.json`
- Relevant_Files: `src/main.ts`, `src/entities/{Enemy,EnemyManager,Projectile,MoveStone,Interactables,NpcSystem}.ts`, `src/entities/enemies/*`, `src/data/{enemies,npcs}.ts`
- Do_Not_Touch: `_ref_repo/`, `docs/la_dx_knowledge_base/`, generated `src/data/rooms/{mabe_village_overworld,mabe_village_interiors,toronbo_shores,mysterious_forest}.ts`, `src/data/{swordFrames,npcAnimations,enemyAnimations}.ts` (regenerate instead)
- Relevant_Decisions: 0002, 0003, 0004, 0005

Next:
- `[T-2.4.2-01]` Toadstool pickup (`objectSpawner spawn_toadstool` -> `item toadstool` in `ow_r05_c00`).
- `[T-2.4.2-02..04]` Witch's Magic Powder, raccoon (`ow_r05_c01`), Tail Key chest + Owl. Powder also turns the Buzz Blob into a Cukeman (`EnemyBuzzBlob.OnHit` MagicPowder).
- Village leftovers (not in a task yet): shop buying, Trendy Game crane, fishing, BowWow quest states, library books on shelves (Pegasus Boots), stairs/cave doors (`cave_rooster`, `cave0`, `dreamShrine01`).

Open_Questions:
- `docs/ARCHITECTURE.md` is out of date (rooms split, generated data, `Npc`/`NpcSystem`, now `AnimPlayer`, `Projectile`, `MoveStone`, `enemies/` subclasses); update proposal awaits user confirmation per AGENTS.md.
- Decision 0005 says custom enemies subclass `Enemy`; `[T-2.4.1-02]` did that via `behavior: 'custom'` + `AnimatedEnemy`. Consistent with 0005, so no new decision logged.

Blockers:
- Every `TASK_ROOM_GHIBLI` (`[T-2.2.1-02]`, `[T-2.2.1-03]`, `[T-2.2.2-03]`, ...) needs an image-generation tool; screens ship with the pixel-art fallback.
