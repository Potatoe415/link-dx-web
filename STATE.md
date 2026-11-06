# STATE

Replace on every update. Max 40 lines. History lives in git and `docs/decisions/`.

Status: Aligned with Bootstrap v10.1 on 2026-11-06. `docs/MASTER_PLAN.md` + `docs/plans/STAGE_01_02_MATRIX.md` + `scripts/extract_room.py` (`[T-1.2.1-03]`) complete.
Focus: Execute next atomic tasks in `docs/MASTER_PLAN.md` (`[T-1.1.2-05]` 4-Direction Screen Scrolling, `[T-1.2.1-04]` Modular `src/data/rooms/`, or `[T-1.3.1-01]` `GameState.ts`).
Level: L1

Context:
- Working_On: `docs/MASTER_PLAN.md`, `docs/plans/STAGE_01_02_MATRIX.md`, `scripts/extract_room.py`, `scripts/generate_stage_matrix.py`
- Relevant_Files: `src/main.ts`, `src/data/rooms.ts`, `src/core/Camera.ts`, `src/entities/Player.ts`, `src/core/Dialogue.ts`, `src/core/Audio.ts`
- Do_Not_Touch: `_ref_repo/`, `docs/la_dx_knowledge_base/`
- Relevant_Decisions: 0001, 0002

Next:
- `[T-1.1.2-05]` Add 4-direction continuous screen scrolling (`neighbors.north/south/east/west`) in `Camera.ts` and `main.ts`.
- `[T-1.2.1-04]` Split `src/data/rooms.ts` into modular regional files (`src/data/rooms/mabe_village.ts`, etc.).
- `[T-1.3.1-01]` Create `src/core/GameState.ts` (`flags`, `openedChests`, `inventory`, `localStorage`).

Open_Questions:
- None.

Blockers:
- None.
