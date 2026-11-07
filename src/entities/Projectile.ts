import { Collision } from '../core/Collision';
import { Rect } from '../data/rooms';
import { ENEMY_ANIMATORS } from '../data/enemyAnimations';
import { AnimFrame, drawFrame } from './AnimPlayer';
import { directionOf } from './Enemy';

/**
 * Enemy projectiles flying straight until they hit a wall, Link, his raised shield or his sword,
 * then bounce back and fade (D360-07-07):
 *  - rock: `EnemyOctorokShot.cs` — 2 px/f for 950 ms then drops; body (-4, -8, 8, 8), damage (-5, -10, 10, 10),
 *    fades over the last third of 750 ms
 *  - spear: `EnemySpear.cs` (Moblin) — 2 px/f until it hits something, body 12x4 / 4x12 centred on the
 *    position, damage (-5, -5, 10, 10), spins (`rotate`) and fades over the last half of 500 ms
 * Positions are logical 160x128 pixels; the spear's position is its centre, the rock's is its feet.
 */
export type ProjectileKind = 'rock' | 'spear';

interface ProjectileSpec {
  lifeMs: number; // Infinity: flies until it collides
  despawnMs: number;
  fadeFraction: number; // share of despawnMs spent fading out at the end
  z: number;
  body: (dir: number) => Rect; // offsets from the position
  damage: Rect;
}

const SPEAR_BODY: Record<number, [number, number]> = { 0: [12, 4], 1: [4, 12], 2: [12, 4], 3: [4, 12] };

const SPECS: Record<ProjectileKind, ProjectileSpec> = {
  rock: {
    lifeMs: 950,
    despawnMs: 750,
    fadeFraction: 1 / 3,
    z: 2,
    body: () => ({ x: -4, y: -8, w: 8, h: 8 }),
    damage: { x: -5, y: -10, w: 10, h: 10 }
  },
  spear: {
    lifeMs: Infinity,
    despawnMs: 500,
    fadeFraction: 1 / 2,
    z: 0, // EntityPosition z = 3 already folded into the spawn offset (_shotOffset)
    body: (dir) => {
      const [w, h] = SPEAR_BODY[dir];
      return { x: -w / 2, y: -h / 2, w, h };
    },
    damage: { x: -5, y: -5, w: 10, h: 10 }
  }
};

const ROCK_SPRITE = { x: 143, y: 45, w: 10, h: 10 }; // octorok shot.ani "idle" on enemies.png

export class Projectile {
  public despawning = false;
  public dead = false;
  private readonly spec: ProjectileSpec;
  private readonly dir: number;
  private life: number;
  private despawnTimer = 0;
  private z: number;
  private vz = 0;

  constructor(
    public readonly kind: ProjectileKind,
    public x: number,
    public y: number,
    private vx: number,
    private vy: number
  ) {
    this.spec = SPECS[kind];
    this.dir = directionOf(vx, vy);
    this.life = this.spec.lifeMs;
    this.z = this.spec.z;
  }

  public get body(): Rect {
    const b = this.spec.body(this.dir);
    return { x: this.x + b.x, y: this.y + b.y, w: b.w, h: b.h };
  }

  /** DamageFieldComponent; inactive while despawning. */
  public get damageBox(): Rect | null {
    const d = this.spec.damage;
    return this.despawning ? null : { x: this.x + d.x, y: this.y + d.y, w: d.w, h: d.h };
  }

  public get velocity(): [number, number] {
    return [this.vx, this.vy];
  }

  /** EnemyOctorokShot / EnemyMoblin.ThrowSpear: no projectile when the spawn point is inside a wall. */
  public static spawn(kind: ProjectileKind, x: number, y: number, vx: number, vy: number, colliders: Rect[]): Projectile | null {
    const p = new Projectile(kind, x, y, vx, vy);
    const check = kind === 'spear' ? { x: x - 4, y: y - 4, w: 8, h: 8 } : p.body;
    return Collision.collidesWithAny(check, colliders) ? null : p;
  }

  /** Bounce back and fade (OnCollision / OnDamage / OnPush / OnHit). */
  public breakOff(dirX?: number, dirY?: number): boolean {
    if (this.despawning) return false;
    this.despawning = true;
    if (dirX !== undefined && dirY !== undefined) {
      this.vx = dirX * 0.25;
      this.vy = dirY * 0.25;
    } else {
      this.vx = -this.vx * 0.25;
      this.vy = -this.vy * 0.25;
    }
    this.vz = 1.5;
    return true;
  }

  /** Returns true the frame the projectile breaks against a wall (so the caller can play the sound). */
  public update(dtMs: number, colliders: Rect[]): boolean {
    if (this.despawning) {
      this.despawnTimer += dtMs;
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.9;
      this.vy *= 0.9;
      this.vz -= 0.125; // gravity
      this.z = Math.max(0, this.z + this.vz);
      if (this.despawnTimer >= this.spec.despawnMs) this.dead = true;
      return false;
    }

    this.life -= dtMs;
    if (this.life < 0) {
      // runs out of steam: drops to the ground and fades without a bounce
      this.despawning = true;
      this.vz = 0;
      return false;
    }

    const nx = this.x + this.vx;
    const ny = this.y + this.vy;
    const b = this.spec.body(this.dir);
    const next = { x: nx + b.x, y: ny + b.y, w: b.w, h: b.h };
    const outside = next.x < -8 || next.y < -8 || next.x > 160 || next.y > 136;
    if (outside) {
      this.dead = true;
      return false;
    }
    if (Collision.collidesWithAny(next, colliders)) {
      this.breakOff();
      return true;
    }
    this.x = nx;
    this.y = ny;
    return false;
  }

  private spearFrame(): AnimFrame {
    const anims = ENEMY_ANIMATORS.spear.anims;
    if (!this.despawning) return anims[String(this.dir)].frames[0];
    // InitDespawn: `rotate` from frame (dir + 1) % 4, 100 ms per frame
    const frames = anims.rotate.frames;
    return frames[(this.dir + 1 + Math.floor(this.despawnTimer / 100)) % frames.length];
  }

  public render(ctx: CanvasRenderingContext2D, sheet: HTMLImageElement | undefined): void {
    if (!sheet) return;
    const remaining = this.spec.despawnMs - this.despawnTimer;
    const fadeMs = this.spec.despawnMs * this.spec.fadeFraction;
    const alpha = this.despawning ? Math.max(0, Math.min(1, remaining / fadeMs)) : 1;
    ctx.save();
    ctx.globalAlpha = alpha * 0.28;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    const shadowY = this.kind === 'rock' ? this.y - 1 : this.y + 3;
    ctx.ellipse(this.x, shadowY, 3.5, 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = alpha;
    if (this.kind === 'spear') {
      drawFrame(ctx, sheet, this.spearFrame(), this.x, this.y - this.z);
    } else {
      // AnimationComponent offset (-5, -10)
      const s = ROCK_SPRITE;
      ctx.drawImage(sheet, s.x, s.y, s.w, s.h, Math.round(this.x - 5), Math.round(this.y - 10 - this.z), s.w, s.h);
    }
    ctx.restore();
  }
}
