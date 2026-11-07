import { Collision } from '../core/Collision';
import { Rect } from '../data/rooms';

/**
 * Octorok rock, ported from `_ref_repo/InGame/GameObjects/Enemies/EnemyOctorokShot.cs`:
 * flies straight at 2 px/f for 950 ms, then drops and fades. Hitting a wall, Link, his raised
 * shield or his sword makes it bounce back and fade (D360-07-07) over 750 ms.
 */
const LIFE_MS = 950;
const DESPAWN_MS = 750;
const SPRITE = { x: 143, y: 45, w: 10, h: 10 }; // octorok shot.ani "idle" on enemies.png

export class OctorokShot {
  public despawning = false;
  public dead = false;
  private life = LIFE_MS;
  private despawnTimer = 0;
  private z = 2; // EntityPosition z = 2
  private vz = 0;

  constructor(
    public x: number,
    public y: number,
    private vx: number,
    private vy: number
  ) {}

  /** BodyComponent(-4, -8, 8, 8). */
  public get body(): Rect {
    return { x: this.x - 4, y: this.y - 8, w: 8, h: 8 };
  }

  /** DamageFieldComponent CBox(-5, -10, 10, 10); inactive while despawning. */
  public get damageBox(): Rect | null {
    return this.despawning ? null : { x: this.x - 5, y: this.y - 10, w: 10, h: 10 };
  }

  public get velocity(): [number, number] {
    return [this.vx, this.vy];
  }

  /** EnemyOctorokShot constructor: aborts the spawn inside a wall. */
  public static spawn(x: number, y: number, vx: number, vy: number, colliders: Rect[]): OctorokShot | null {
    const shot = new OctorokShot(x, y, vx, vy);
    return Collision.collidesWithAny(shot.body, colliders) ? null : shot;
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

  /** Returns true the frame the rock breaks against a wall (so the caller can play the sound). */
  public update(dtMs: number, colliders: Rect[]): boolean {
    if (this.despawning) {
      this.despawnTimer += dtMs;
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.9;
      this.vy *= 0.9;
      this.vz -= 0.125; // gravity
      this.z = Math.max(0, this.z + this.vz);
      if (this.despawnTimer >= DESPAWN_MS) this.dead = true;
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
    const next = { x: nx - 4, y: ny - 8, w: 8, h: 8 };
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

  public render(ctx: CanvasRenderingContext2D, sheet: HTMLImageElement | undefined): void {
    if (!sheet) return;
    // Despawn: full opacity for the first 2/3, then fades out (Despawn(time / (750 / 3)))
    const remaining = DESPAWN_MS - this.despawnTimer;
    const alpha = this.despawning ? Math.max(0, Math.min(1, remaining / (DESPAWN_MS / 3))) : 1;
    ctx.save();
    ctx.globalAlpha = alpha * 0.28;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y - 1, 3.5, 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = alpha;
    // AnimationComponent offset (-5, -10)
    ctx.drawImage(sheet, SPRITE.x, SPRITE.y, SPRITE.w, SPRITE.h, Math.round(this.x - 5), Math.round(this.y - 10 - this.z), SPRITE.w, SPRITE.h);
    ctx.restore();
  }
}
