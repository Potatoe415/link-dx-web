# STATE

Replace on every update. Max 40 lines. History lives in git and `docs/decisions/`.

Status: Toronbo Shores corridor ow_r13_c02 & ow_r14_c02 Ghibli backgrounds generated & wired. Subagent generating ow_r15_c02 (Sword Beach).
Focus: Toronbo Shores full corridor Ghibli assets & testing validation.
Level: L1

Context:
- Working_On: `src/data/rooms/toronbo_shores.ts`, `public/assets/rooms/`, `public/assets/ui/`
- Relevant_Files: `src/entities/Enemy.ts`, `src/entities/EnemyManager.ts`, `src/data/enemies.ts`, `src/main.ts`
- Do_Not_Touch: `_ref_repo/`, `docs/la_dx_knowledge_base/`
- Relevant_Decisions: 0002, 0003, 0004, 0005

Next:
- Integrate `ow_r15_c02_bg.png` once subagent finishes, wire into `src/data/rooms/toronbo_shores.ts`.
- Push complete beach corridor to git (`ow_r12_c02` -> `ow_r13_c02` -> `ow_r14_c02` -> `ow_r15_c02`).
- `[T-2.5.1-*]` Tail Cave exterior entrance (`ow_r13_c03`) & extraction from `_ref_repo/Data/Maps/dungeon1.map`.

Open_Questions:
- None.

Blockers:
- None.
