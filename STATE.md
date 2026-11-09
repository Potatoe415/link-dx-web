# STATE

Replace on every update. Max 40 lines. History lives in git and `docs/decisions/`.

Status: 16-item Ghibli props sheet & slicer scripted. Image API quota resets at 13:18 UTC / 14:18 CET.
Focus: Asset sheet & Tail Cave dungeon entrance.
Level: L1

Context:
- Working_On: `docs/BACKLOG.md`, `scripts/pack_object_sprites.py`, `public/assets/ui/`
- Relevant_Files: `scripts/pack_object_sprites.py`, `docs/BACKLOG.md`
- Do_Not_Touch: `_ref_repo/`, `docs/la_dx_knowledge_base/`
- Relevant_Decisions: 0002, 0003, 0004, 0005

Next:
- Generate 16-item Ghibli props board (prompt & slicer ready) upon API quota reset at 13:18 UTC / 14:18 CET.
- `[T-2.5.1-*]` Tail Cave exterior entrance (`ow_r13_c03`) & extraction from `_ref_repo/Data/Maps/dungeon1.map`.
- Octopus tentacles animation & Link shield-arm sprite.

Open_Questions:
- None.

Blockers:
- Image generation API throttled until 13:18 UTC / 14:18 CET (pixel-art fallbacks active).
