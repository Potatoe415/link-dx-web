import { EnemyConfig } from '../entities/Enemy';

const ENEMIES_SHEET = '/assets/ui/enemies.png'; // copied from `_ref_repo/Data/Map Objects/enemies.png`

/**
 * Enemy definitions. Numbers come from the C# classes in `_ref_repo/InGame/GameObjects/Enemies/`
 * (BodyComponent / DamageFieldComponent / HittableComponent boxes, walk speed, AI timers) and their
 * `.ani` files in `_ref_repo/Data/Animations/Enemies/` (frame rects, 200 ms frames, mirrored flags).
 */
export const ENEMIES: Record<string, EnemyConfig> = {
  // EnemyOctorok.cs + octorok.ani (rock shot is part of [T-2.3.1-03])
  octorok: {
    kind: 'octorok',
    hp: 1,
    speed: 0.5,
    contactDamage: 2,
    body: { x: -7, y: -12, w: 14, h: 12 },
    damageBox: { x: -8, y: -13, w: 16, h: 13 },
    hittableBox: { x: -7, y: -15, w: 14, h: 15 },
    wanderMs: [750, 1000],
    idleMs: [250, 500],
    sprite: {
      sheet: ENEMIES_SHEET,
      frameMs: 200,
      originX: 8,
      originY: 15,
      frames: {
        0: [{ x: 2, y: 43, w: 15, h: 16 }, { x: 19, y: 44, w: 15, h: 15 }],
        3: [{ x: 54, y: 44, w: 16, h: 15 }, { x: 36, y: 44, w: 16, h: 15 }],
        1: [{ x: 72, y: 44, w: 16, h: 15 }, { x: 90, y: 44, w: 16, h: 15 }],
        2: [{ x: 125, y: 43, w: 15, h: 16 }, { x: 108, y: 44, w: 15, h: 15 }]
      }
    }
  }
};

/** Map object id in `.map` files -> enemy kind. Extend as enemies are ported ([T-*] TASK_ENTITY_PORT). */
export const MAP_ENEMY_IDS: Record<string, string> = {
  octorok: 'octorok'
};
