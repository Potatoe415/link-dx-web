# 0004 — Generated region modules + neighbor-based screen scrolling

Date: 2026-11-06
Status: Accepted
Decision: Overworld/dungeon screens are generated into `src/data/rooms/<region>.ts` by `scripts/build_region.py` from extractor manifests, and screens connect through `RoomDef.neighbors` with a 350 ms continuous scroll (`Camera.startScroll`) instead of warp triggers.
Context: Hand-copying 20-50 colliders per screen does not scale to ~400 screens, and the original game links overworld screens by edge scrolling, not doors.
Rationale: The extractor reproduces the C# constructor maths (`ObjSprite`, `ObjBush`, `ObjStone`, `ObjFence`, `ObjSignpost`, `ObjCollider`) from `GameObjectTemplates.cs`, so colliders and the pixel-art reference are deterministic; regenerating is cheaper and safer than editing. An edge with no registered neighbor acts as a wall, so partially-built regions stay playable. Backgrounds load lazily (current room + neighbors prefetched) so the preload list does not grow with the world.
Consequences: Generated files are never edited by hand and may exceed the ~300 line guideline. Hand-tuned rooms (custom colliders for Ghibli paintings, NPCs, doors) live in manual modules and are removed from the region JSON. The legacy `outdoor` room id became `ow_r10_c02` (saves pointing to `outdoor` fall back to a new game). `RoomDef` gained required `music` and `ambience`.
Alternatives_Rejected: One continuous world canvas with a free camera (diverges from the 160x128 per-room invariant), loading manifests at runtime via fetch (loses type checking and build-time validation).
