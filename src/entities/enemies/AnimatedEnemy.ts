import { Rect } from '../../data/rooms';
import { ENEMY_ANIMATORS } from '../../data/enemyAnimations';
import { AnimPlayer } from '../AnimPlayer';
import { Enemy, EnemyConfig } from '../Enemy';

export const DIR_VEC: Record<number, [number, number]> = { 0: [-1, 0], 1: [0, -1], 2: [1, 0], 3: [0, 1] };

/**
 * Base of the enemies ported with their generated `.ani` animator (src/data/enemyAnimations.ts):
 * an AnimPlayer drawn at the AnimationComponent offset, a jump height `z` with per-enemy gravity
 * (BodyComponent.Gravity, px/frame²) and helpers for the AiTriggerRandomTime timers.
 */
export abstract class AnimatedEnemy extends Enemy {
  protected readonly anim: AnimPlayer;
  protected shakeX = 0; // AnimationComponent.SpriteOffset wobble
  protected shakeY = 0;
  protected vz = 0;
  protected gravity = 0.25; // BodyComponent default
  protected aiTimer = 0;
  protected justLanded = false; // set by update() on the frame the enemy touches the ground

  constructor(config: EnemyConfig, x: number, y: number, random: () => number = Math.random) {
    super(config, x, y, random);
    this.anim = new AnimPlayer(ENEMY_ANIMATORS[config.animator!.id]);
  }

  /** Random duration in [min, max) like Game1.RandomNumber.Next(min, max). */
  protected rand(min: number, max: number): number {
    return min + this.random() * (max - min);
  }

  protected randInt(max: number): number {
    return Math.floor(this.random() * max);
  }

  /** Unit vector from the enemy to Link (zero when on top of him). */
  protected towardLink(): [number, number] {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const len = Math.hypot(dx, dy);
    return len > 0 ? [dx / len, dy / len] : [0, 0];
  }

  protected get linkDistance(): number {
    return Math.hypot(this.targetX - this.x, this.targetY - this.y);
  }

  /** Thrown up in the air (EnemyGel.InitSpawn). */
  public launch(vz: number): void {
    this.vz = vz;
    this.z = Math.max(this.z, 0.01);
  }

  /** Applies gravity; returns true on the frame the enemy lands. */
  private stepZ(): boolean {
    if (this.z <= 0 && this.vz <= 0) return false;
    this.vz -= this.gravity;
    this.z += this.vz;
    if (this.z > 0) return false;
    this.z = 0;
    this.vz = 0;
    return true;
  }

  public update(dtMs: number, colliders: Rect[], targetX: number, targetY: number, world?: Parameters<Enemy['update']>[4]): void {
    if (this.state !== 'DYING') {
      this.anim.update(dtMs);
      this.justLanded = this.stepZ(); // gravity runs in every AI state, knockback included
    }
    super.update(dtMs, colliders, targetX, targetY, world);
  }

  protected renderBody(ctx: CanvasRenderingContext2D, sheet: HTMLImageElement): void {
    const o = this.config.animator!;
    if (this.z > 0) {
      ctx.save();
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(this.x, this.y - 1, 4, 1.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    this.anim.draw(ctx, sheet, this.x + o.offsetX + this.shakeX, this.y + o.offsetY + this.shakeY - this.z);
  }
}
