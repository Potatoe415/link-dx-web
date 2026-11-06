import { Collision } from '../core/Collision';
import { Rect } from '../data/rooms';

/**
 * Generic enemy base, ported from `_ref_repo/InGame/GameObjects/Base/Components/AI/AiDamageState.cs`
 * and the per-enemy AI classes. Positions are the feet anchor in 160x128 logical space; boxes are
 * offsets from that anchor like the C# CBox(EntityPosition, ox, oy, w, h).
 */
export type EnemyState = 'IDLE' | 'WANDER' | 'CHASE' | 'STUNNED' | 'KNOCKBACK' | 'DYING';

export interface EnemySprite {
  sheet: string; // public URL
  frames: Record<number, { x: number; y: number; w: number; h: number; flip?: boolean }[]>; // per direction
  frameMs: number;
  originX: number;
  originY: number;
}

export interface EnemyConfig {
  kind: string;
  hp: number;
  speed: number; // logical px per 60 FPS frame
  contactDamage: number; // quarter hearts (DamageFieldComponent)
  body: Rect; // collision with walls (BodyComponent)
  damageBox: Rect; // hurts Link on contact (DamageFieldComponent)
  hittableBox: Rect; // takes sword hits (HittableComponent)
  wanderMs: [number, number]; // AiTriggerRandomTime walking
  idleMs: [number, number]; // AiTriggerRandomTime idle
  chaseRange?: number; // switch to CHASE when Link is this close (0 = never)
  sprite: EnemySprite;
}

const BLINK_MS = 66; // AiDamageState.BlinkTime
const HIT_COOLDOWN_MS = BLINK_MS * 6; // AiDamageState.CooldownTime
const HIT_PUSH = 5; // AiDamageState.HitMultiplierX/Y (velocity on hit, then body drag)
const DEATH_MS = 300; // explosion puffs (UpdateDeath spawns one every 100 ms)
const DIR_VEC: Record<number, [number, number]> = { 0: [-1, 0], 1: [0, -1], 2: [1, 0], 3: [0, 1] };

export type LootDrop = 'rupee' | 'heart' | null;

/** AiDamageState loot table: 33% rupee, 7% heart, else nothing. */
export function rollLoot(random: () => number = Math.random): LootDrop {
  const r = random() * 100;
  if (r < 33) return 'rupee';
  if (r < 40) return 'heart';
  return null;
}

export class Enemy {
  public state: EnemyState = 'IDLE';
  public direction: number;
  public hp: number;
  private stateTimer = 0;
  private stateDuration = 0;
  private hitCooldown = 0;
  private vx = 0;
  private vy = 0;
  private animTimer = 0;
  public dead = false; // removed by the engine once the death puffs end

  constructor(
    public readonly config: EnemyConfig,
    public x: number,
    public y: number,
    private readonly random: () => number = Math.random
  ) {
    this.hp = config.hp;
    this.direction = Math.floor(random() * 4);
    this.enter(random() < 0.5 ? 'IDLE' : 'WANDER');
  }

  private box(r: Rect): Rect {
    return { x: this.x + r.x, y: this.y + r.y, w: r.w, h: r.h };
  }

  public get damageBox(): Rect {
    return this.box(this.config.damageBox);
  }

  public get hittableBox(): Rect {
    return this.box(this.config.hittableBox);
  }

  public get isHarmful(): boolean {
    return this.state !== 'DYING';
  }

  private enter(state: EnemyState): void {
    this.state = state;
    this.stateTimer = 0;
    const [a, b] = state === 'WANDER' ? this.config.wanderMs : this.config.idleMs;
    this.stateDuration = a + this.random() * (b - a);
    if (state === 'WANDER') this.direction = Math.floor(this.random() * 4);
  }

  public update(dtMs: number, colliders: Rect[], targetX: number, targetY: number): void {
    this.stateTimer += dtMs;
    this.animTimer += dtMs;
    this.hitCooldown = Math.max(0, this.hitCooldown - dtMs);

    switch (this.state) {
      case 'DYING':
        if (this.stateTimer >= DEATH_MS) this.dead = true;
        return;
      case 'KNOCKBACK':
        this.moveBy(this.vx, this.vy, colliders);
        this.vx *= 0.8; // BodyComponent drag
        this.vy *= 0.8;
        if (Math.hypot(this.vx, this.vy) < 0.1) this.enter('IDLE');
        return;
      case 'STUNNED':
        if (this.stateTimer >= this.stateDuration) this.enter('IDLE');
        return;
    }

    const range = this.config.chaseRange ?? 0;
    if (range > 0 && Math.hypot(targetX - this.x, targetY - this.y) < range) this.state = 'CHASE';

    if (this.state === 'CHASE') {
      const dx = targetX - this.x;
      const dy = targetY - this.y;
      this.direction = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 0 : 2) : dy < 0 ? 1 : 3;
      const len = Math.hypot(dx, dy) || 1;
      this.moveBy((dx / len) * this.config.speed, (dy / len) * this.config.speed, colliders);
      if (Math.hypot(dx, dy) > range * 1.5) this.enter('IDLE');
      return;
    }

    if (this.state === 'WANDER') {
      const [dx, dy] = DIR_VEC[this.direction];
      const blocked = !this.moveBy(dx * this.config.speed, dy * this.config.speed, colliders);
      if (blocked) this.direction = (this.direction + 2) % 4; // turn around at walls / screen edges
    }
    if (this.stateTimer >= this.stateDuration) this.enter(this.state === 'IDLE' ? 'WANDER' : 'IDLE');
  }

  /** Moves the body with wall sliding inside the 160x128 screen. Returns false if fully blocked. */
  private moveBy(dx: number, dy: number, colliders: Rect[]): boolean {
    const b = this.config.body;
    let moved = false;
    const tryAxis = (nx: number, ny: number) => {
      const box = { x: nx + b.x, y: ny + b.y, w: b.w, h: b.h };
      const inside = box.x >= 0 && box.y >= 0 && box.x + box.w <= 160 && box.y + box.h <= 128;
      if (inside && !Collision.collidesWithAny(box, colliders)) {
        this.x = nx;
        this.y = ny;
        moved = true;
      }
    };
    if (dx !== 0) tryAxis(this.x + dx, this.y);
    if (dy !== 0) tryAxis(this.x, this.y + dy);
    return moved;
  }

  /** Sword / item hit coming along (dirX, dirY). Returns true when the enemy dies from it. */
  public takeHit(damage: number, dirX: number, dirY: number): 'hit' | 'killed' | 'ignored' {
    if (this.state === 'DYING' || this.hitCooldown > 0) return 'ignored';
    this.hp -= damage;
    this.hitCooldown = HIT_COOLDOWN_MS;
    if (this.hp <= 0) {
      this.state = 'DYING';
      this.stateTimer = 0;
      return 'killed';
    }
    const len = Math.hypot(dirX, dirY) || 1;
    this.vx = (dirX / len) * HIT_PUSH * 0.5;
    this.vy = (dirY / len) * HIT_PUSH * 0.5;
    this.state = 'KNOCKBACK';
    this.stateTimer = 0;
    return 'hit';
  }

  /** Stun (e.g. boomerang / hookshot later): frozen for `ms`. */
  public stun(ms: number): void {
    if (this.state === 'DYING') return;
    this.state = 'STUNNED';
    this.stateTimer = 0;
    this.stateDuration = ms;
  }

  public render(ctx: CanvasRenderingContext2D, sheet: HTMLImageElement | undefined): void {
    if (this.state === 'DYING') {
      this.renderDeathPuff(ctx);
      return;
    }
    // AiDamageState blink: the HD remake swaps to a white shader; we skip every other 66 ms window
    if (this.hitCooldown > 0 && Math.floor(this.hitCooldown / BLINK_MS) % 2 === 1) return;
    if (!sheet) return;
    const s = this.config.sprite;
    const frames = s.frames[this.direction] ?? s.frames[3];
    const moving = this.state === 'WANDER' || this.state === 'CHASE';
    const f = frames[moving ? Math.floor(this.animTimer / s.frameMs) % frames.length : 0];
    const dx = Math.round(this.x - s.originX);
    const dy = Math.round(this.y - s.originY);
    ctx.save();
    if (f.flip) {
      ctx.translate(dx + f.w, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(sheet, f.x, f.y, f.w, f.h, 0, 0, f.w, f.h);
    } else {
      ctx.drawImage(sheet, f.x, f.y, f.w, f.h, dx, dy, f.w, f.h);
    }
    ctx.restore();
  }

  private renderDeathPuff(ctx: CanvasRenderingContext2D): void {
    const t = Math.min(1, this.stateTimer / DEATH_MS);
    ctx.save();
    ctx.fillStyle = `rgba(255, 255, 255, ${(1 - t).toFixed(3)})`;
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + t * 2;
      ctx.beginPath();
      ctx.arc(this.x + Math.cos(a) * 6 * t, this.y - 6 + Math.sin(a) * 6 * t, 2.5 * (1 - t) + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
