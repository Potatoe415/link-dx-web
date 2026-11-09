import { EnemyConfig } from '../entities/Enemy';

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
      frameMs: 200,
      originX: 8,
      originY: 15,
      frames: {
        0: [{ x: 2, y: 43, w: 15, h: 16 }, { x: 19, y: 44, w: 15, h: 15 }],
        3: [{ x: 54, y: 44, w: 16, h: 15 }, { x: 36, y: 44, w: 16, h: 15 }],
        1: [{ x: 72, y: 44, w: 16, h: 15 }, { x: 90, y: 44, w: 16, h: 15 }],
        2: [{ x: 125, y: 43, w: 15, h: 16 }, { x: 108, y: 44, w: 15, h: 15 }]
      }
    },
    ghibliSprite: {
      frameMs: 200,
      originX: 8,
      originY: 15,
      frames: {
        0: [{ x: 659, y: 253, w: 252, h: 248, flip: true, renderW: 16, renderH: 16 }],
        3: [{ x: 27, y: 255, w: 247, h: 239, renderW: 16, renderH: 16 }],
        1: [{ x: 349, y: 255, w: 241, h: 240, renderW: 16, renderH: 16 }],
        2: [{ x: 659, y: 253, w: 252, h: 248, renderW: 16, renderH: 16 }]
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
    },
    ghibliSprite: {
      frameMs: 300,
      originX: 8,
      originY: 15,
      frames: {
        3: [
          { x: 12, y: 15, w: 238, h: 213, renderW: 16, renderH: 15 },
          { x: 280, y: 14, w: 239, h: 216, renderW: 16, renderH: 15 }
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
    },
    ghibliSprite: {
      frameMs: 150,
      originX: 8,
      originY: 15,
      frames: {
        3: [
          { x: 48, y: 522, w: 209, h: 240, renderW: 15, renderH: 16 }
        ]
      },
      anims: {
        spawn: [
          { x: 342, y: 522, w: 249, h: 239, renderW: 16, renderH: 16 },
          { x: 48, y: 522, w: 209, h: 240, renderW: 15, renderH: 16 }
        ],
        leave: [
          { x: 48, y: 522, w: 209, h: 240, renderW: 15, renderH: 16 },
          { x: 342, y: 522, w: 249, h: 239, renderW: 16, renderH: 16 }
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
      frameMs: 133,
      originX: 8,
      originY: 16,
      frames: {
        3: [
          { x: 0, y: 80, w: 16, h: 16 },
          { x: 16, y: 80, w: 16, h: 16 }
        ]
      }
    },
    ghibliSprite: {
      frameMs: 150,
      originX: 9,
      originY: 15,
      frames: {
        3: [
          { x: 15, y: 788, w: 280, h: 224, renderW: 18, renderH: 15 },
          { x: 330, y: 787, w: 278, h: 220, renderW: 18, renderH: 15 }
        ]
      }
    }
  },

  // ---- Animator-driven enemies (src/entities/enemies/, frames in src/data/enemyAnimations.ts) ----

  // EnemyMoblin.cs: 2 lives, walks 0.5 px/f, throws spears (EnemySpear)
  moblin: {
    kind: 'moblin',
    hp: 2,
    speed: 0.5,
    contactDamage: 2,
    body: { x: -6, y: -10, w: 12, h: 10 },
    damageBox: { x: -8, y: -12, w: 16, h: 12 },
    hittableBox: { x: -7, y: -15, w: 14, h: 15 },
    wanderMs: [0, 0],
    idleMs: [0, 0],
    behavior: 'custom',
    ai: 'moblin',
    animator: { id: 'moblin', offsetX: -8, offsetY: -16 }
  },

  // EnemyMoblinSword.cs + EnemyMoblinSwordSword.cs: 2 lives, charges Link, parrying blade
  moblinSword: {
    kind: 'moblinSword',
    hp: 2,
    speed: 0.5,
    contactDamage: 2,
    body: { x: -6, y: -10, w: 12, h: 10 },
    damageBox: { x: -8, y: -12, w: 16, h: 12 },
    hittableBox: { x: -7, y: -15, w: 14, h: 15 },
    wanderMs: [0, 0],
    idleMs: [0, 0],
    behavior: 'custom',
    ai: 'moblinSword',
    animator: { id: 'moblin_sword', offsetX: -8, offsetY: -16 }
  },

  // EnemyRedZol.cs: 1 life, splits into two Gels on a 1-damage hit
  redZol: {
    kind: 'redZol',
    hp: 1,
    speed: 0.4,
    contactDamage: 2,
    body: { x: -6, y: -10, w: 12, h: 10 },
    damageBox: { x: -6, y: -11, w: 12, h: 11 },
    hittableBox: { x: -6, y: -11, w: 12, h: 11 },
    wanderMs: [0, 0],
    idleMs: [0, 0],
    behavior: 'custom',
    ai: 'redZol',
    animator: { id: 'red_zol', offsetX: -6, offsetY: -16 }
  },

  // EnemyGel.cs: 1 life, harmless, sticks to Link
  gel: {
    kind: 'gel',
    hp: 1,
    speed: 0.5,
    contactDamage: 0,
    body: { x: -4, y: -7, w: 7, h: 7 },
    damageBox: { x: 0, y: 0, w: 0, h: 0 },
    hittableBox: { x: -4, y: -7, w: 7, h: 7 },
    wanderMs: [0, 0],
    idleMs: [0, 0],
    behavior: 'custom',
    ai: 'gel',
    animator: { id: 'gel', offsetX: -4, offsetY: -7 }
  },

  // EnemyGreenZol.cs: 1 life, pops out of the floor near Link
  greenZol: {
    kind: 'greenZol',
    hp: 1,
    speed: 0.75,
    contactDamage: 2,
    body: { x: -6, y: -10, w: 12, h: 10 },
    damageBox: { x: -6, y: -11, w: 12, h: 11 },
    hittableBox: { x: -6, y: -11, w: 12, h: 11 },
    wanderMs: [0, 0],
    idleMs: [0, 0],
    behavior: 'custom',
    ai: 'greenZol',
    animator: { id: 'green_zol', offsetX: -6, offsetY: -16 }
  },

  // EnemyKeese.cs: 1 life, flies over walls; boxes are 20 px above the feet anchor (flying height)
  keese: {
    kind: 'keese',
    hp: 1,
    speed: 0.75,
    contactDamage: 2,
    body: { x: -6, y: -20, w: 12, h: 8 },
    damageBox: { x: -5, y: -20, w: 10, h: 8 },
    hittableBox: { x: -6, y: -20, w: 12, h: 8 },
    wanderMs: [0, 0],
    idleMs: [0, 0],
    behavior: 'custom',
    ai: 'keese',
    animator: { id: 'keese', offsetX: -8, offsetY: -21 }
  },

  // EnemyBuzzBlob.cs: 4 lives, immune to the sword (shocks Link instead)
  buzzBlob: {
    kind: 'buzzBlob',
    hp: 4,
    speed: 0.33,
    contactDamage: 2,
    body: { x: -4, y: -10, w: 8, h: 10 },
    damageBox: { x: -5, y: -12, w: 10, h: 12 },
    hittableBox: { x: -6, y: -14, w: 12, h: 14 },
    wanderMs: [0, 0],
    idleMs: [0, 0],
    behavior: 'custom',
    ai: 'buzzBlob',
    animator: { id: 'buzzblob', offsetX: -6, offsetY: -16 }
  }
};

/** Map object id in `.map` files -> enemy kind. Extend as enemies are ported ([T-*] TASK_ENTITY_PORT). */
export const MAP_ENEMY_IDS: Record<string, string> = {
  octorok: 'octorok',
  e1: 'urchin',
  e2: 'octorok',
  e3: 'leever',
  e4: 'crab',
  e5: 'moblin',
  moblinSword: 'moblinSword',
  e9: 'greenZol',
  e10: 'keese',
  e15: 'redZol',
  e17: 'buzzBlob'
};
