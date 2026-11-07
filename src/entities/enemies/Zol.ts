import { Collision } from '../../core/Collision';
import { Rect } from '../../data/rooms';
import { EnemyConfig, EnemyHitResult } from '../Enemy';
import { AnimatedEnemy } from './AnimatedEnemy';

const ZOL_GRAVITY = 0.15; // BodyComponent.Gravity = -0.15f
const ZOL_SPRITE_X = -6; // AnimationComponent offset X, wobbled while shaking

/**
 * Red Zol, `EnemyRedZol.cs`: waits 200 ms, then (Link within 80 px) creeps towards him at 0.4 px/f
 * for 132 ms, or 1 time in 10 shakes for 1 s and leaps at him (1.25 px/f, vz 1.5). A plain sword hit
 * (1 damage) splits it into two Gels without loot or puff; a spin attack (2 damage) kills it.
 */
export class RedZol extends AnimatedEnemy {
  private ai: 'waiting' | 'walking' | 'shaking' | 'jumping' = 'waiting';
  private split = false;

  constructor(config: EnemyConfig, x: number, y: number, random: () => number = Math.random) {
    super(config, x, y, random);
    this.gravity = ZOL_GRAVITY;
    this.toWaiting();
  }

  protected think(dtMs: number, colliders: Rect[]): void {
    this.aiTimer -= dtMs;
    switch (this.ai) {
      case 'waiting':
        if (this.aiTimer > 0) return;
        this.aiTimer = 200;
        if (this.linkDistance > 80) return;
        if (this.randInt(10) === 0) {
          this.ai = 'shaking';
          this.aiTimer = 1000;
        } else {
          this.ai = 'walking';
          this.aiTimer = 132;
          this.anim.play('walk');
        }
        return;
      case 'walking': {
        const [dx, dy] = this.towardLink();
        this.moveBy(dx * 0.4, dy * 0.4, colliders);
        if (this.aiTimer <= 0) this.toWaiting();
        return;
      }
      case 'shaking':
        this.shakeX = Math.sin(Math.max(0, this.aiTimer) / 25);
        if (this.aiTimer > 0) return;
        this.shakeX = 0;
        this.ai = 'jumping';
        this.anim.play('walk');
        [this.vx, this.vy] = this.towardLink().map((v) => v * 1.25) as [number, number];
        this.launch(1.5);
        return;
      case 'jumping':
        this.moveBy(this.vx, this.vy, colliders);
        if (this.justLanded) this.toWaiting();
        return;
    }
  }

  private toWaiting(): void {
    this.ai = 'waiting';
    this.aiTimer = 200;
    this.anim.play('idle');
  }

  public takeHit(damage: number, dirX: number, dirY: number): EnemyHitResult {
    this.split = damage <= 1;
    return super.takeHit(damage, dirX, dirY);
  }

  protected onDeath(): void {
    if (!this.split) return;
    // DeathAnimation = false, SpawnItems = false: vanishes and drops two Gels inside its body
    this.lootless = true;
    this.dead = true;
    const vz = 2; // EnemyGel.InitSpawn
    this.events.push({ type: 'spawn', kind: 'gel', x: this.x - 1.9 - this.randInt(2), y: this.y - this.randInt(2), vz });
    this.events.push({ type: 'spawn', kind: 'gel', x: this.x + 2.9 + this.randInt(2), y: this.y - this.randInt(2), vz });
  }
}

const GEL_GRAB_COOLDOWN_MS = 2000;

/**
 * Gel, `EnemyGel.cs` (the small halves of a Red Zol): hops towards Link when he is within 50 px
 * (0.5 px/f for 100-150 ms, then 200 ms rest, 1 in 10 shakes and leaps). It never hurts on contact:
 * it sticks to Link for 1.5-2.5 s, halving his speed and blocking his items, then jumps off and
 * cannot grab again for 2 s.
 */
export class Gel extends AnimatedEnemy {
  private ai: 'idle' | 'walking' | 'shaking' | 'jumping' | 'grabbing' | 'release' = 'idle';
  private side = 1; // _dir: -1 left of Link, 1 right
  private grabCooldown = 0;
  private wobbleClock: number;
  private readonly grabX: number;
  private readonly grabY: number;

  constructor(config: EnemyConfig, x: number, y: number, random: () => number = Math.random) {
    super(config, x, y, random);
    this.gravity = 0.2;
    this.wobbleClock = this.rand(0, 1000);
    this.grabX = this.rand(90, 110);
    this.grabY = this.rand(25, 40);
    this.toIdle();
  }

  public get isHarmful(): boolean {
    return false; // no DamageFieldComponent
  }

  public get holdsLink(): boolean {
    return this.ai === 'grabbing' && this.state !== 'DYING';
  }

  public get sortY(): number {
    return this.holdsLink ? Infinity : this.y; // LayerTop while grabbing
  }

  protected think(dtMs: number, colliders: Rect[]): void {
    this.aiTimer -= dtMs;
    this.wobbleClock += dtMs;
    this.grabCooldown = Math.max(0, this.grabCooldown - dtMs);
    if (this.ai !== 'grabbing' && this.ai !== 'release' && this.grabCooldown <= 0 && this.touchesLink()) {
      this.ai = 'grabbing';
      this.aiTimer = this.rand(1500, 2500);
      this.z = 0;
      this.vz = 0;
    }
    switch (this.ai) {
      case 'idle':
        if (this.aiTimer > 0) return;
        if (this.linkDistance > 50) this.aiTimer = 200;
        else {
          this.ai = 'walking';
          this.aiTimer = this.rand(100, 150);
        }
        return;
      case 'walking': {
        const [dx, dy] = this.towardLink();
        this.side = dx < 0 ? -1 : 1;
        this.anim.play(String(-this.side));
        this.moveBy(dx * 0.5, dy * 0.5, colliders);
        if (this.aiTimer > 0) return;
        if (this.randInt(10) === 0) {
          this.ai = 'shaking';
          this.aiTimer = 1000;
        } else this.toIdle();
        return;
      }
      case 'shaking':
        this.shakeX = Math.sin(this.wobbleClock / 25);
        if (this.aiTimer > 0) return;
        this.shakeX = 0;
        this.ai = 'jumping';
        [this.vx, this.vy] = this.towardLink().map((v) => v * 1.25) as [number, number];
        this.launch(1.25);
        return;
      case 'jumping':
      case 'release':
        this.moveBy(this.vx, this.vy, colliders);
        if (this.z <= 0) this.toIdle();
        return;
      case 'grabbing':
        this.x = this.targetX;
        this.y = this.targetY;
        this.anim.play(String(this.side));
        this.shakeX = Math.sin(this.wobbleClock / this.grabX) * 3.5;
        this.shakeY = -2 + Math.sin(this.wobbleClock / this.grabY) * 1.5;
        if (this.aiTimer > 0) return;
        // EndGrabbing: jump off upwards in a random direction within ±90°
        {
          const angle = (this.rand(-100, 100) / 200) * Math.PI;
          this.vx = Math.sin(angle);
          this.vy = -Math.cos(angle);
        }
        this.shakeX = 0;
        this.shakeY = 0;
        this.ai = 'release';
        this.grabCooldown = GEL_GRAB_COOLDOWN_MS;
        this.launch(1.5);
        return;
    }
  }

  /** ObjectCollisionComponent CRectangle(-4, -7, 7, 12) against Link's body. */
  private touchesLink(): boolean {
    if (this.z > 0) return false;
    return Collision.intersects(this.box({ x: -4, y: -7, w: 7, h: 12 }), Collision.getPlayerCollisionBox(this.targetX, this.targetY));
  }

  private toIdle(): void {
    this.ai = 'idle';
    this.aiTimer = 200;
    this.vx = 0;
    this.vy = 0;
    this.anim.play(String(this.side));
  }
}

/**
 * Green Zol, `EnemyGreenZol.cs` (forest cave): hidden in the floor until Link comes within 32 px,
 * then pops out (spawn animation), drops from 5 px, shakes 500 ms and makes 3-4 hops towards him
 * (0.75 px/f, vz 1.5, 750-1250 ms apart, D360-36-24) before sinking back for at least 2 s.
 * Only harmful and hittable while out.
 */
export class GreenZol extends AnimatedEnemy {
  private ai: 'init' | 'notSpawned' | 'spawning' | 'falling' | 'shaking' | 'waiting' | 'jumping' | 'despawning' | 'hidden' = 'init';
  private jumpsLeft = 0;

  constructor(config: EnemyConfig, x: number, y: number, random: () => number = Math.random) {
    super(config, x, y, random);
    this.gravity = ZOL_GRAVITY;
    this.aiTimer = 450; // small delay so a Zol right at the door does not pop out at once
  }

  private get out(): boolean {
    return this.ai !== 'init' && this.ai !== 'notSpawned' && this.ai !== 'spawning' && this.ai !== 'despawning' && this.ai !== 'hidden';
  }

  public get isHarmful(): boolean {
    return this.out && super.isHarmful;
  }

  public get isHittable(): boolean {
    return this.out && super.isHittable;
  }

  protected get hiddenThisFrame(): boolean {
    const invisible = this.ai === 'init' || this.ai === 'notSpawned' || this.ai === 'hidden';
    return invisible || super.hiddenThisFrame;
  }

  protected think(dtMs: number, colliders: Rect[]): void {
    this.aiTimer -= dtMs;
    switch (this.ai) {
      case 'init':
      case 'hidden':
        if (this.aiTimer <= 0) this.ai = 'notSpawned';
        return;
      case 'notSpawned':
        if (this.linkDistance >= 32) return;
        this.jumpsLeft = 3 + this.randInt(2);
        this.ai = 'spawning';
        this.anim.play('spawn', true);
        return;
      case 'spawning':
        if (this.anim.playing) return;
        this.events.push({ type: 'sfx', name: 'zol_jump' });
        this.ai = 'falling';
        this.anim.play('idle');
        this.z = 5;
        return;
      case 'falling':
        if (!this.justLanded) return;
        this.ai = 'shaking';
        this.aiTimer = 500;
        return;
      case 'shaking':
        this.shakeX = Math.sin(Math.max(0, this.aiTimer) / 25);
        if (this.aiTimer > 0) return;
        this.shakeX = 0;
        this.toWaiting();
        return;
      case 'waiting':
        if (this.aiTimer > 0) return;
        if (this.jumpsLeft <= 0) {
          this.ai = 'despawning';
          this.anim.play('despawn', true);
          return;
        }
        this.jumpsLeft--;
        this.ai = 'jumping';
        this.anim.play('jump');
        this.events.push({ type: 'sfx', name: 'zol_jump' });
        [this.vx, this.vy] = this.towardLink().map((v) => v * 0.75) as [number, number];
        this.launch(1.5);
        return;
      case 'jumping':
        this.moveBy(this.vx, this.vy, colliders);
        if (this.justLanded) this.toWaiting();
        return;
      case 'despawning':
        if (this.anim.playing) return;
        this.ai = 'hidden';
        this.aiTimer = 2000;
        return;
    }
  }

  private toWaiting(): void {
    this.ai = 'waiting';
    this.aiTimer = this.rand(750, 1250);
    this.vx = 0;
    this.vy = 0;
    this.anim.play('idle');
  }
}
