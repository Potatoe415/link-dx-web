# BACKLOG

Current work queue (synced with the full 3-level living checklist in `docs/MASTER_PLAN.md`). Completed work lives in git history and checked `[x]` items in `docs/MASTER_PLAN.md`.

## Now (Étape 1 — Usine Déterministe & Moteur Fondamental)
- [ ] `[T-1.1.2-05]` Add `--map-file` + `--offset-x`/`--offset-y` to `scripts/extract_room.py` for indoor houses, caves, and dungeon rooms.
- [ ] `[T-1.2.1-01]` Create `src/core/GameState.ts` (`flags`, `inventory`, `equippedA`, `equippedB`, `rupees`, `hearts`, `maxHearts`, `keys`, `instruments`).
- [ ] `[T-1.2.1-02]` Migrate `player.hasShield` to `GameState.hasFlag('FLAG_SHIELD_OBTAINED')` with `localStorage` persistence.
- [ ] `[T-1.2.2-01]` Add `neighbors?: { north?: string; south?: string; east?: string; west?: string }` to `RoomData` and implement 4-direction screen scrolling/flip transitions.
- [ ] `[T-1.3.1-01]` Render classic Game Boy bottom HUD (`160x16` logical / `1280x128` display) for A/B slots, Rupees, and Hearts.

## Next (Étape 2 — Acte I : Village des Mouettes, Plage Coco & Forêt Enchantée)
- [ ] `[T-2.1.1-01..06]` Extract and wire the 12 outdoor screens of Mabe Village (`ow_r08_c01` to `ow_r11_c03`).
- [ ] `[T-2.2.1-01..03]` Extract and wire the Toronbo Shores beach screens (`ow_r12_c01` to `ow_r15_c04`) and Sword retrieval (`FLAG_SWORD_OBTAINED`).
- [ ] `[T-2.3.1-01..04]` Extract and wire Mysterious Woods (`ow_r04_c00` to `ow_r07_c03`), Sleepy Toadstool, Witch's Hut, and Tail Key (`FLAG_TAIL_KEY`).

## Blocked
- None.
