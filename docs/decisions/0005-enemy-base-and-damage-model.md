# 0005 — Data-driven enemies + ported damage model

Date: 2026-11-06
Status: Accepted
Decision: Enemies are one `Enemy` class (`src/entities/Enemy.ts`) driven by per-kind `EnemyConfig` data in `src/data/enemies.ts` (boxes, speed, AI timers, sprite frames from `_ref_repo`), managed per room by `EnemyManager`; Link's damage, knockback, invulnerability, hazards and GAME OVER reuse the HD remake's constants (`ObjLink.cs`, `AiDamageState.cs`, `GameOverSystem.cs`).
Context: Stage 2+ ports dozens of enemies; each original C# enemy is a bespoke class with mostly the same damage/blink/loot behaviour.
Rationale: Shared state machine (IDLE / WANDER / CHASE / STUNNED / KNOCKBACK / DYING), loot table (33% rupee, 7% heart) and blink timings stay identical across enemies; per-enemy differences start as config, and an enemy that needs custom behaviour (shots, bosses) subclasses `Enemy`.
Consequences: Health is the single source of truth in `GameState.healthQuarters`; anything that hurts Link calls `Player.takeHit` (shield blocking included). GAME OVER respawns at `GameState.respawn` (last door crossed) with the 3/5/7/10-heart refill. The HD remake's low-health beep is empty, so `D370-04-04` is used.
Alternatives_Rejected: One TypeScript class per original enemy up front (duplicated damage code), an ECS (heavier than needed for 160x128 screens).
