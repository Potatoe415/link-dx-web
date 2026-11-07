import { Collision } from '../core/Collision';
import { Rect } from '../data/rooms';

/**
 * Generic enemy base, ported from `_ref_repo/InGame/GameObjects/Base/Components/AI/AiDamageState.cs`
 * and the per-enemy AI classes. Positions are the feet anchor in 160x128 logical space; boxes are
 * offsets from that anchor like the C# CBox(EntityPosition, ox, oy, w, h).
 */
export type EnemyState =
  | 'IDLE'
  | 'WANDER'
  | 'CHASE'
  | 'STUNNED'
  | 'KNOCKBACK'
  | 'DYING'
  // Leever burrow cycle (EnemyLeever.cs)
  | 'HIDDEN'
  | 'SPAWNING'
  | 'MOVING'
  | 'LEAVING'
  | 'WAITING';

/**
 * AI per enemy class:
 *  - wander: EnemyOctorok (walk 750-1000 ms / idle 250-500 ms, optional rock shot on idle)
 *  - static: EnemySeaUrchin (never moves on its own, solid, pushed by the raised shield)
 *  - leever: EnemyLeever (surfaces on a random free cell, chases Link 2-3 s, burrows, waits 1-2 s)
 *  - crab: EnemyCrab (fast sideways 1.0 px/f for 1-1.5 s, slow up/down 0.33 px/f for 0.25-0.75 s)
 */
export type EnemyBehavior = 'wander' | 'static' | 'leever' | 'crab';

type Frame = { x: number; y: number; w: number; h: number; flip?: boolean };

export interface EnemySprite {
  sheet: string; // public URL
  frames: Record<number, Frame[]>; // per direction (direction 3 is the fallback for 1-direction enemies)
  anims?: Partial<Record<'spawn' | 'leave', Frame[]>>; // one-shot 200 ms/frame animations (Leever)
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
  behavior?: EnemyBehavior; // default 'wander'
  solid?: boolean; // blocks Link (sea urchin BodyCollisionComponent)
  shot?: { range: number; speed: number; offsets: Record<number, [number, number]> }; // EnemyOctorok rock
  sprite: EnemySprite;
}

/** Projectile requested by an enemy this frame, consumed by EnemyManager. */
export interface ShotRequest {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/** Room info the Leever needs to pick a surfacing cell. */
export interface EnemyWorld {
  isWater: (x: number, y: number) => boolean;
}

const BLINK_MS = 66; // AiDamageState.BlinkTime
const HIT_COOLDOWN_MS = BLINK_MS * 6; // AiDamageState.CooldownTime
const HIT_PUSH = 5; // AiDamageState.HitMultiplierX/Y (velocity on hit, then body drag)
const DEATH_MS = 300; // explosion puffs (UpdateDeath spawns one every 100 ms)
const DIR_VEC: Record<number, [number, number]> = { 0: [-1, 0], 1: [0, -1], 2: [1, 0], 3: [0, 1] };
const ONE_SHOT_FRAME_MS = 200;
const LEEVER_SPAWN_MS = 600; // spawn: 3 x 200 ms
const LEEVER_LEAVE_MS = 600; // leave: 3 x 200 ms
const LEEVER_TRIGGER = 50; // spawnRectangle: EntitySize (-50, -58, 100, 100) around the map position
const LEEVER_MIN_PLAYER_DIST = 24;

export type LootDrop = 'rupee' | 'heart' | null;

/** AiDamageState loot table: 33% rupee, 7% heart, else nothing. */
export function rollLoot(random: () => number = Math.random): LootDrop {
  const r = random() * 100;
  if (r < 33) return 'rupee';
  if (r < 40) return 'heart';
  return null;
}

/** AnimationHelper.GetDirection: dominant axis of a vector -> 0 left, 1 up, 2 right, 3 down. */
export function directionOf(dx: number, dy: number): number {
  return Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 0 : 2) : dy < 0 ? 1 : 3;
}

export class Enemy {
  public state: EnemyState = 'IDLE';
  public direction: number;
  public hp: number;
  public dead = false; // removed by the engine once the death puffs end
  public pendingShot: ShotRequest | null = null;
  private stateTimer = 0;
  private stateDuration = 0;
  private hitCooldown = 0;
  private vx = 0;
  private vy = 0;
  private crabVx = 0;
  private crabVy = 0;
  private animTimer = 0;
  private targetX = 0;
  private targetY = 0;
  private readonly homeX: number;
  private readonly homeY: number;

  constructor(
    public readonly config: EnemyConfig,
    public x: number,
    public y: number,
    private readonly random: () => number = Math.random
  ) {
    this.hp = config.hp;
    this.homeX = x;
    this.homeY = y;
    this.direction = Math.floor(random() * 4);
    switch (this.behavior) {
      case 'static':
        this.state = 'IDLE';
        this.animTimer = random() * 1000; // randomized start frame
        break;
      case 'leever':
        // "init" waits 750-1500 ms underground, then "hidden" until Link enters the area
        this.state = 'WAITING';
        this.stateDuration = 750 + random() * 750;
        break;
      case 'crab':
        this.startCrabWalk();
        break;
      default:
        this.enter(random() < 0.5 ? 'IDLE' : 'WANDER');
    }
  }

  public get behavior(): EnemyBehavior {
    return this.config.behavior ?? 'wander';
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

  public get bodyBox(): Rect {
    return this.box(this.config.body);
  }

  /** Underground Leevers are invisible, harmless and cannot be hit. */
  private get surfaced(): boolean {
    return this.state !== 'HIDDEN' && this.state !== 'WAITING';
  }

  public get isHarmful(): boolean {
    if (this.state === 'DYING' || !this.surfaced) return false;
    // Leever damage field is only active once fully out (Activate / Deactivate)
    if (this.behavior === 'leever') return this.state === 'MOVING' || this.state === 'KNOCKBACK';
    return true;
  }

  public get isHittable(): boolean {
    if (this.state === 'DYING' || !this.surfaced) return false;
    // Leever _damageState is active after the 1st spawn frame and until the 2nd leave frame
    if (this.state === 'SPAWNING') return this.stateTimer >= ONE_SHOT_FRAME_MS;
    if (this.state === 'LEAVING') return this.stateTimer < ONE_SHOT_FRAME_MS * 2;
    return true;
  }

  public get isSolid(): boolean {
    return !!this.config.solid && this.state !== 'DYING';
  }

  private enter(state: EnemyState): void {
    this.state = state;
    this.stateTimer = 0;
    const [a, b] = state === 'WANDER' ? this.config.wanderMs : this.config.idleMs;
    this.stateDuration = a + this.random() * (b - a);
    if (state === 'WANDER') this.direction = Math.floor(this.random() * 4);
    if (state === 'IDLE') this.tryShoot();
  }

  /** EnemyOctorok.ToIdle: shoot when Link is within range and in the facing direction. */
  private tryShoot(): void {
    const shot = this.config.shot;
    if (!shot) return;
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    if (Math.hypot(dx, dy) >= shot.range || directionOf(dx, dy) !== this.direction) return;
    const [ox, oy] = shot.offsets[this.direction];
    const [vx, vy] = DIR_VEC[this.direction];
    this.pendingShot = { x: this.x + ox, y: this.y + oy, vx: vx * shot.speed, vy: vy * shot.speed };
  }

  /** State to go back to after a knockback / stun. */
  private resume(): void {
    switch (this.behavior) {
      case 'leever':
        this.state = 'MOVING';
        return;
      case 'crab':
        this.startCrabWalk();
        return;
      case 'static':
        this.state = 'IDLE';
        return;
      default:
        this.enter('IDLE');
    }
  }

  /** EnemyCrab.ToWalking: random direction, fast sideways, slow up/down. */
  private startCrabWalk(): void {
    this.direction = Math.floor(this.random() * 4);
    const horizontal = this.direction % 2 === 0;
    const speed = horizontal ? 1.0 : 0.33;
    const [dx, dy] = DIR_VEC[this.direction];
    this.crabVx = dx * speed;
    this.crabVy = dy * speed;
    this.state = 'WANDER';
    this.stateTimer = 0;
    const [a, b] = horizontal ? [1000, 1500] : [250, 750];
    this.stateDuration = a + this.random() * (b - a);
  }

  /** Pushed by Link's raised shield (EnemySeaUrchin.OnPush). Returns true if it moved. */
  public push(dx: number, dy: number, colliders: Rect[]): boolean {
    if (this.state === 'DYING') return false;
    const bx = this.x;
    const by = this.y;
    this.moveBy(dx, dy, colliders);
    return this.x !== bx || this.y !== by;
  }

  public update(dtMs: number, colliders: Rect[], targetX: number, targetY: number, world?: EnemyWorld): void {
    this.stateTimer += dtMs;
    this.animTimer += dtMs;
    this.hitCooldown = Math.max(0, this.hitCooldown - dtMs);
    this.targetX = targetX;
    this.targetY = targetY;

    switch (this.state) {
      case 'DYING':
        if (this.stateTimer >= DEATH_MS) this.dead = true;
        return;
      case 'KNOCKBACK':
        this.moveBy(this.vx, this.vy, colliders);
        this.vx *= 0.8; // BodyComponent drag
        this.vy *= 0.8;
        if (Math.hypot(this.vx, this.vy) < 0.1) this.resume();
        return;
      case 'STUNNED':
        if (this.stateTimer >= this.stateDuration) this.resume();
        return;
    }

    if (this.behavior === 'static') return;
    if (this.behavior === 'leever') {
      this.updateLeever(colliders, world);
      return;
    }
    if (this.behavior === 'crab') {
      // EnemyCrab.OnCollision: bounce back at half speed
      if (this.crabVx !== 0 && !this.moveBy(this.crabVx, 0, colliders)) this.crabVx = -this.crabVx * 0.5;
      if (this.crabVy !== 0 && !this.moveBy(0, this.crabVy, colliders)) this.crabVy = -this.crabVy * 0.5;
      if (this.stateTimer >= this.stateDuration) this.startCrabWalk();
      return;
    }

    const range = this.config.chaseRange ?? 0;
    if (range > 0 && Math.hypot(targetX - this.x, targetY - this.y) < range) this.state = 'CHASE';

    if (this.state === 'CHASE') {
      const dx = targetX - this.x;
      const dy = targetY - this.y;
      this.direction = directionOf(dx, dy);
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

  private updateLeever(colliders: Rect[], world?: EnemyWorld): void {
    switch (this.state) {
      case 'WAITING':
        if (this.stateTimer < this.stateDuration) return;
        this.state = 'HIDDEN';
        this.stateTimer = 0;
        this.stateDuration = 0; // 0: wait for Link to come close; > 0: resurface on its own
        return;
      case 'HIDDEN': {
        const near =
          Math.abs(this.targetX - this.homeX) < LEEVER_TRIGGER &&
          Math.abs(this.targetY - (this.homeY - 8)) < LEEVER_TRIGGER;
        const timedOut = this.stateDuration > 0 && this.stateTimer >= this.stateDuration;
        if (near || timedOut) this.trySurface(colliders, world);
        return;
      }
      case 'SPAWNING':
        if (this.stateTimer < LEEVER_SPAWN_MS) return;
        this.state = 'MOVING';
        this.stateTimer = 0;
        this.stateDuration = 2000 + this.random() * 1000;
        return;
      case 'MOVING': {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const len = Math.hypot(dx, dy) || 1;
        this.moveBy((dx / len) * this.config.speed, (dy / len) * this.config.speed, colliders);
        if (this.stateTimer < this.stateDuration) return;
        this.state = 'LEAVING';
        this.stateTimer = 0;
        return;
      }
      case 'LEAVING':
        if (this.stateTimer < LEEVER_LEAVE_MS) return;
        // ToWaiting: underground for 1-2 s, then Spawn() (retried every frame until a cell is free)
        this.state = 'HIDDEN';
        this.stateTimer = 0;
        this.stateDuration = 1000 + this.random() * 1000;
        return;
    }
  }

  /** EnemyLeever.Spawn: random 16x16 cell of the screen, dry, free, not right next to Link. */
  private trySurface(colliders: Rect[], world?: EnemyWorld): void {
    const cx = Math.floor(this.random() * 10) * 16;
    const cy = Math.floor(this.random() * 8) * 16;
    const fx = cx + 8;
    const fy = cy + 16;
    if (Math.hypot(this.targetX - fx, this.targetY - fy) < LEEVER_MIN_PLAYER_DIST) return;
    if (world?.isWater(cx + 8, cy + 8)) return;
    if (Collision.collidesWithAny({ x: cx, y: cy, w: 16, h: 16 }, colliders)) return;
    this.x = fx;
    this.y = fy;
    this.state = 'SPAWNING';
    this.stateTimer = 0;
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

  /** Sword / item hit coming along (dirX, dirY). */
  public takeHit(damage: number, dirX: number, dirY: number): 'hit' | 'killed' | 'ignored' {
    if (!this.isHittable || this.hitCooldown > 0) return 'ignored';
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
    if (this.state === 'DYING' || !this.surfaced) return;
    this.state = 'STUNNED';
    this.stateTimer = 0;
    this.stateDuration = ms;
  }

  private currentFrame(): Frame | undefined {
    const s = this.config.sprite;
    if (this.state === 'SPAWNING' || this.state === 'LEAVING') {
      const anim = s.anims?.[this.state === 'SPAWNING' ? 'spawn' : 'leave'];
      if (anim) return anim[Math.min(anim.length - 1, Math.floor(this.stateTimer / ONE_SHOT_FRAME_MS))];
    }
    const frames = s.frames[this.direction] ?? s.frames[3];
    // Octoroks only animate while walking; urchins, Leevers and crabs loop all the time
    const animated = this.behavior !== 'wander' || this.state === 'WANDER' || this.state === 'CHASE';
    return frames[animated ? Math.floor(this.animTimer / s.frameMs) % frames.length : 0];
  }

  public render(ctx: CanvasRenderingContext2D, sheet: HTMLImageElement | undefined): void {
    if (this.state === 'DYING') {
      this.renderDeathPuff(ctx);
      return;
    }
    // AiDamageState blink: the HD remake swaps to a white shader; we skip every other 66 ms window
    if (this.hitCooldown > 0 && Math.floor(this.hitCooldown / BLINK_MS) % 2 === 1) return;
    if (!sheet || !this.surfaced) return;
    const f = this.currentFrame();
    if (!f) return;
    const s = this.config.sprite;
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
