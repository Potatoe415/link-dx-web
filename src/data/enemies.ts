import { EnemyConfig } from '../entities/Enemy';

const ENEMIES_SHEET = '/assets/ui/enemies.png'; // copied from `_ref_repo/Data/Map Objects/enemies.png`

/**
 * Enemy definitions. Numbers come from the C# classes in `_ref_repo/InGame/GameObjects/Enemies/`
 * (BodyComponent / DamageFieldComponent / HittableComponent boxes, walk speed, AI timers) and their
 * `.ani` files in `_ref_repo/Data/Animations/Enemies/` (frame rects, frame times, mirrored flags).
 * Sprites are drawn at feet - (8, 16) like AnimationComponent(..., new Vector2(-8, -16)), except the
 * Octorok whose frames are 15 px high.
 */
export const ENEMIES: Record<string, EnemyConfig> = {
  // EnemyOctorok.cs + octorok.ani; rock shot: ToIdle, range 80, speed 2, _shotOffset
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
    shot: { range: 80, speed: 2, offsets: { 0: [-8, -1], 1: [0, -6], 2: [8, -1], 3: [0, 11] } },
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
  },

  // EnemySeaUrchin.cs + sea urchin.ani: 1 life, solid, shield pushes it at 0.25 px/f, 2 quarter damage
  urchin: {
    kind: 'urchin',
    hp: 1,
    speed: 0.25,
    contactDamage: 2,
    body: { x: -8, y: -14, w: 16, h: 14 },
    damageBox: { x: -9, y: -15, w: 18, h: 16 }, // touching the solid body (PushableComponent -> HitPlayer)
    hittableBox: { x: -8, y: -16, w: 16, h: 16 },
    wanderMs: [0, 0],
    idleMs: [0, 0],
    behavior: 'static',
    solid: true,
    sprite: {
      sheet: ENEMIES_SHEET,
      frameMs: 250,
      originX: 8,
      originY: 16,
      frames: {
        3: [
          { x: 0, y: 0, w: 16, h: 16 },
          { x: 16, y: 0, w: 16, h: 16 },
          { x: 32, y: 0, w: 16, h: 16 },
          { x: 48, y: 0, w: 16, h: 16 }
        ]
      }
    }
  },

  // EnemyLeever.cs + leever.ani: 2 lives, chases at 0.5 px/f, surfaces near Link
  leever: {
    kind: 'leever',
    hp: 2,
    speed: 0.5,
    contactDamage: 2,
    body: { x: -7, y: -12, w: 14, h: 12 },
    damageBox: { x: -8, y: -13, w: 16, h: 14 },
    hittableBox: { x: -7, y: -14, w: 14, h: 14 },
    wanderMs: [0, 0],
    idleMs: [0, 0],
    behavior: 'leever',
    sprite: {
      sheet: ENEMIES_SHEET,
      frameMs: 116,
      originX: 8,
      originY: 16,
      frames: {
        3: [
          { x: 32, y: 64, w: 16, h: 16 },
          { x: 48, y: 64, w: 16, h: 16 }
        ]
      },
      anims: {
        spawn: [
          { x: 0, y: 64, w: 16, h: 16 },
          { x: 16, y: 64, w: 16, h: 16 },
          { x: 32, y: 64, w: 16, h: 16 }
        ],
        leave: [
          { x: 32, y: 64, w: 16, h: 16 },
          { x: 16, y: 64, w: 16, h: 16 },
          { x: 0, y: 64, w: 16, h: 16 }
        ]
      }
    }
  },

  // EnemyCrab.cs + crab.ani: 2 lives, scuttles sideways
  crab: {
    kind: 'crab',
    hp: 2,
    speed: 1,
    contactDamage: 2,
    body: { x: -7, y: -10, w: 14, h: 10 },
    damageBox: { x: -8, y: -11, w: 16, h: 11 },
    hittableBox: { x: -8, y: -15, w: 16, h: 15 },
    wanderMs: [0, 0],
    idleMs: [0, 0],
    behavior: 'crab',
    sprite: {
      sheet: ENEMIES_SHEET,
      frameMs: 133,
      originX: 8,
      originY: 16,
      frames: {
        3: [
          { x: 0, y: 80, w: 16, h: 16 },
          { x: 16, y: 80, w: 16, h: 16 }
        ]
      }
    }
  }
};

/** Map object id in `.map` files -> enemy kind. Extend as enemies are ported ([T-*] TASK_ENTITY_PORT). */
export const MAP_ENEMY_IDS: Record<string, string> = {
  octorok: 'octorok',
  e1: 'urchin',
  e2: 'octorok',
  e3: 'leever',
  e4: 'crab'
};
