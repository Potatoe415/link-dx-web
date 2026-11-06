# 0003 — Single GameState with validated localStorage autosave

Date: 2026-11-06
Status: Accepted
Decision: All progression (26 story flags, opened chests, dungeon keys, counters, hearts, inventory, A/B equipment, instruments, respawn door) lives in one `GameState` (`src/core/GameState.ts`) that autosaves to `localStorage["zelda_la_save_v1"]` on every mutation.
Context: `Player.hasShield` was the only progression state and was lost on reload; upcoming tasks (chests, HUD, inventory, game over) all need shared, persistent state.
Rationale: One owner avoids drift between entities; save-on-mutate needs no save points or menu; loaded data is untrusted, so every field is type-checked, whitelisted (flags, items, known rooms) and clamped before use.
Consequences: Entities read state through `GameState` (e.g. `Player.hasShield` is a getter on `hasItem('shield')`). Schema changes must bump `version` and the key suffix. A saved game resumes awake at the last door crossed.
Alternatives_Rejected: IndexedDB (async, overkill for <2 KB), explicit save slots/menu (not needed yet), per-entity persistence (scattered, hard to reset).
