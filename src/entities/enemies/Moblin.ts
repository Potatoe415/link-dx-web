import { Collision } from '../../core/Collision';
import { Rect } from '../../data/rooms';
import { ENEMY_ANIMATORS } from '../../data/enemyAnimations';
import { AnimPlayer } from '../AnimPlayer';
import { EnemyConfig, EnemyHitResult, directionOf } from '../Enemy';
import { AnimatedEnemy, DIR_VEC } from './AnimatedEnemy';

const MOVE_SPEED = 0.5;
const SPEAR_RANGE = 96;
const SPEAR_SPEED = 2;
const SPEAR_OFFSET: Record<number, [number, number]> = { 0: [-8, -1], 1: [0, -3], 2: [8, -1], 3: [0, 2] }; // _shotOffset

/**
 * Spear Moblin, `EnemyMoblin.cs`: stands 300-500 ms, walks 550-850 ms at 0.5 px/f in a random
 * direction (stops when bumping into something) and, on every stop, throws a spear half of the
 * time when Link is within 96 px in the facing direction.
 */
export class Moblin extends AnimatedEnemy {
  private ai: 'init' | 'idle' | 'walking' = 'init';

  constructor(config: EnemyConfig, x: number, y: number, random: () => number = Math.random) {
    super(config, x, y, random);
    this.aiTimer = this.rand(0, 500);
    this.direction = this.randInt(4);
    this.anim.play(`stand_${this.direction}`);
  }

  protected think(dtMs: number, colliders: Rect[]): void {
    this.aiTimer -= dtMs;
    if (this.ai === 'walking') {
      const [dx, dy] = DIR_VEC[this.direction];
      // OnCollision: stop walking
      if (!this.moveBy(dx * MOVE_SPEED, dy * MOVE_SPEED, colliders)) {
        this.toIdle();
        return;
      }
    }
    if (this.aiTimer > 0) return;
    if (this.ai === 'walking') this.toIdle();
    else this.toWalking();
  }

  private toIdle(): void {
    this.ai = 'idle';
    this.aiTimer = this.rand(300, 500);
    this.anim.play(`stand_${this.direction}`);
    this.throwSpear();
  }

  private toWalking(): void {
    this.ai = 'walking';
    this.aiTimer = this.rand(550, 850);
    this.direction = this.randInt(4);
    this.anim.play(`walk_${this.direction}`);
  }

  private throwSpear(): void {
    if (this.randInt(2) === 0) return;
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    if (Math.hypot(dx, dy) >= SPEAR_RANGE || directionOf(dx, dy) !== this.direction) return;
    const [ox, oy] = SPEAR_OFFSET[this.direction];
    const [vx, vy] = DIR_VEC[this.direction];
    this.events.push({ type: 'shot', projectile: 'spear', x: this.x + ox, y: this.y + oy, vx: vx * SPEAR_SPEED, vy: vy * SPEAR_SPEED });
  }
}

const ATTACK_RANGE = 80;
const ATTACK_SPEED = 0.55;
const SWORD_HIT_COOLDOWN_MS = 250;
const SWORD_PUSH = 1.5;

/**
 * Sword-and-shield Moblin, `EnemyMoblinSword.cs` + `EnemyMoblinSwordSword.cs`: wanders like the
 * spear Moblin and charges Link at 0.55 px/f (animation x2) while he is within 80 px. The blade is a
 * separate box taken from `moblin sword sword.ani` (frame collision rectangles): it hurts Link
 * (2 quarters) and parries his sword, pushing the Moblin back at 1.5 px/f and Link back at 1 px/f.
 */
export class MoblinSword extends AnimatedEnemy {
  private ai: 'start' | 'idle' | 'walking' | 'attack' = 'start';
  private readonly sword = new AnimPlayer(ENEMY_ANIMATORS.moblin_sword_sword);
  private swordCooldown = 0;

  protected think(dtMs: number, colliders: Rect[]): void {
    this.aiTimer -= dtMs;
    switch (this.ai) {
      case 'start':
        // Init: face Link and attack right away when he arrives close, else start idle or walking
        if (this.linkDistance < ATTACK_RANGE) this.toAttack();
        else {
          this.direction = this.randInt(4);
          if (this.randInt(2) === 0) this.toWalking();
          else this.toIdle();
        }
        return;
      case 'idle':
        if (this.aiTimer <= 0) {
          if (this.linkDistance < ATTACK_RANGE) this.toAttack();
          else this.toWalking();
        }
        return;
      case 'walking': {
        const [dx, dy] = DIR_VEC[this.direction];
        if (!this.moveBy(dx * MOVE_SPEED, dy * MOVE_SPEED, colliders) || this.aiTimer <= 0) this.toIdle();
        return;
      }
      case 'attack': {
        // aims a little ahead of Link in the facing direction
        const [fx, fy] = DIR_VEC[this.direction];
        const dx = this.targetX + fx * 3 - this.x;
        const dy = this.targetY + fy * 3 - this.y;
        const len = Math.hypot(dx, dy);
        if (len > ATTACK_RANGE) {
          this.toIdle();
          return;
        }
        if (len > 0) this.moveBy((dx / len) * ATTACK_SPEED, (dy / len) * ATTACK_SPEED, colliders);
        this.face(directionOf(dx, dy));
        return;
      }
    }
  }

  public update(dtMs: number, colliders: Rect[], targetX: number, targetY: number, world?: Parameters<AnimatedEnemy['update']>[4]): void {
    this.swordCooldown = Math.max(0, this.swordCooldown - dtMs);
    if (this.state !== 'DYING') this.sword.update(dtMs);
    super.update(dtMs, colliders, targetX, targetY, world);
  }

  private play(id: string): void {
    this.anim.play(id);
    this.sword.play(id);
  }

  private face(direction: number): void {
    this.direction = direction;
    this.play(`walk_${direction}`);
  }

  private toIdle(): void {
    this.ai = 'idle';
    this.aiTimer = this.rand(300, 500);
    this.play(`stand_${this.direction}`);
  }

  private toWalking(): void {
    this.ai = 'walking';
    this.aiTimer = this.rand(550, 850);
    this.direction = this.randInt(4);
    this.play(`walk_${this.direction}`);
  }

  private toAttack(): void {
    this.ai = 'attack';
    this.anim.speed = 2;
    this.sword.speed = 2;
    this.face(directionOf(this.targetX - this.x, this.targetY - this.y));
  }

  /** The blade: EntityPosition (x, y - 1) + offset (-8, -15) + the frame collision rectangle. */
  public get swordBox(): Rect | null {
    const col = this.sword.frameDef.col;
    if (!col || this.state === 'DYING') return null;
    return { x: this.x - 8 + col.x, y: this.y - 1 - 15 + col.y, w: col.w, h: col.h };
  }

  public damageBoxes(): Rect[] {
    const blade = this.swordBox;
    return blade ? [this.damageBox, blade] : [this.damageBox];
  }

  /** Link's sword: the blade parries (RepellingParticle), the body takes the hit (multi-damage). */
  public hitBy(area: Rect, damage: number, fromX: number, fromY: number): EnemyHitResult {
    let parried = false;
    const blade = this.swordBox;
    if (blade && this.swordCooldown <= 0 && Collision.intersects(area, blade)) {
      this.swordCooldown = SWORD_HIT_COOLDOWN_MS;
      this.knockBack(this.x - fromX, this.y - fromY, SWORD_PUSH);
      parried = true;
    }
    const body = super.hitBy(area, damage, fromX, fromY);
    if (body === 'hit' || body === 'killed') return body;
    return parried ? 'repelled' : body;
  }

  /** Shield block: EnemyMoblinSwordSword.OnPush pushes the Moblin back at 1.5 px/f. */
  public shieldBounce(dirX: number, dirY: number): void {
    this.knockBack(dirX, dirY, SWORD_PUSH);
  }

  protected renderBody(ctx: CanvasRenderingContext2D, sheet: HTMLImageElement): void {
    // The blade sits 1 px higher, so it Y-sorts (draws) before the body
    this.sword.draw(ctx, sheet, this.x - 8, this.y - 1 - 15);
    super.renderBody(ctx, sheet);
  }
}
