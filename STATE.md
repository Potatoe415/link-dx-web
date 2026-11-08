# STATE

Replace on every update. Max 40 lines. History lives in git and `docs/decisions/`.

Status: Stage 1 & 2.4 complete. Toadstool & Magic Powder quest fully functional, Tail Key acquired. 8 Studio Ghibli backgrounds + 4 occlusion masks integrated. Task tracking fully updated across MASTER_PLAN, MATRIX, and BACKLOG.
Focus: Tail Cave dungeon entrance & extraction (`[T-2.5.1-*]`).
Level: L1

Context:
- Working_On: `src/core/`, `src/entities/`, `src/data/`, `docs/`
- Relevant_Files: `src/main.ts`, `src/data/npcs.ts`, `src/data/owls.ts`, `src/core/GameState.ts`, `docs/MASTER_PLAN.md`
- Do_Not_Touch: `_ref_repo/`, `docs/la_dx_knowledge_base/`
- Relevant_Decisions: 0002, 0003, 0004, 0005

Next:
- `[T-2.5.1-01]` Tail Cave exterior entrance (`ow_r13_c03`): keyhole interaction opening the dungeon gate.
- `[T-2.5.1-02]` Extract Tail Cave rooms from `_ref_repo/Data/Maps/dungeon1.map`.
- At 17:44 UTC / 18:44 CET: Resume Studio Ghibli generation (Interiors batch remainder -> Toronbo Shores corridor).

Open_Questions:
- None.

Blockers:
- Studio Ghibli image generation API throttled until 17:44 UTC (pixel fallbacks active).
