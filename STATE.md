# STATE

Replace on every update. Max 40 lines. History lives in git and `docs/decisions/`.

Status: All 9 Mabe Village interiors ([T-2.2.2-03]) + ow_r12_c02 Studio Ghibli backgrounds generated & wired. Quota resets at 22:44 UTC.
Focus: Tail Cave dungeon entrance & extraction ([T-2.5.1-*]).
Level: L1

Context:
- Working_On: `src/data/rooms/`, `public/assets/rooms/`, `docs/`
- Relevant_Files: `src/data/rooms/mabe_village_interiors.ts`, `src/data/rooms/toronbo_shores.ts`, `docs/MASTER_PLAN.md`, `docs/BACKLOG.md`
- Do_Not_Touch: `_ref_repo/`, `docs/la_dx_knowledge_base/`
- Relevant_Decisions: 0002, 0003, 0004, 0005

Next:
- `[T-2.5.1-01]` Tail Cave exterior entrance (`ow_r13_c03`): keyhole interaction opening the dungeon gate.
- `[T-2.5.1-02]` Extract Tail Cave rooms from `_ref_repo/Data/Maps/dungeon1.map`.
- At 22:44 UTC / 23:44 CET: Resume Studio Ghibli generation (`ow_r13_c02` corniche -> beach sequence).

Open_Questions:
- None.

Blockers:
- Studio Ghibli image generation API throttled until 22:44 UTC (pixel fallbacks active).
