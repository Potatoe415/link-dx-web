import { Rect } from '../../data/rooms';
import { EnemyConfig } from '../Enemy';
import { AnimatedEnemy } from './AnimatedEnemy';

const FIELD_MARGIN = 8; // map.GetField(posX, posY, 8)
const FLY_SPEED = 0.75;

/**
 * Keese, `EnemyKeese.cs` (forest cave bats): rests 1-2 s, then, once Link is within 60 px, flies
 * for 1-2 s along a slowly turning curve (0.02-0.03 rad/frame, clockwise or not) at 0.75 px/f.
 * It ignores walls and holes; only the screen inset by 8 px bounces it back (half turn).
 */
export class Keese extends AnimatedEnemy {
  private ai: 'cooldown' | 'idle' | 'flying' = 'cooldown';
  private readonly turnSpeed: number;
  private flyState: number;
  private turn: number;

  constructor(config: EnemyConfig, x: number, y: number, random: () => number = Math.random) {
    super(config, x, y, random);
    this.turnSpeed = this.rand(20, 30) / 1000;
    this.flyState = (Math.PI / 2) * this.randInt(4);
    this.turn = this.randInt(2) * 2 - 1;
    this.aiTimer = this.rand(1000, 2000);
  }

  protected think(dtMs: number, _colliders: Rect[]): void {
    this.aiTimer -= dtMs;
    switch (this.ai) {
      case 'cooldown':
        if (this.aiTimer <= 0) this.ai = 'idle';
        return;
      case 'idle':
        // distance to (Link.x, Link.y + 16), as in the original
        if (Math.hypot(this.x - this.targetX, this.y - (this.targetY + 16)) >= 60) return;
        this.ai = 'flying';
        this.aiTimer = this.rand(1000, 2000);
        this.turn = this.randInt(2) * 2 - 1;
        this.anim.play('fly');
        return;
      case 'flying':
        this.flyState += this.turn * this.turnSpeed * (dtMs / (1000 / 60));
        this.fly(Math.sin(this.flyState) * FLY_SPEED, Math.cos(this.flyState) * FLY_SPEED);
        if (this.aiTimer > 0) return;
        this.ai = 'cooldown';
        this.aiTimer = this.rand(1000, 2000);
        this.anim.play('idle');
        return;
    }
  }

  /** Free flight inside the field rectangle; leaving it turns the Keese around (OnCollision). */
  private fly(dx: number, dy: number): void {
    const b = this.config.body;
    const nx = this.x + dx;
    const ny = this.y + dy;
    const inside =
      nx + b.x >= FIELD_MARGIN && nx + b.x + b.w <= 160 - FIELD_MARGIN &&
      ny + b.y >= FIELD_MARGIN && ny + b.y + b.h <= 128 - FIELD_MARGIN;
    if (!inside) {
      this.flyState += Math.PI;
      return;
    }
    this.x = nx;
    this.y = ny;
  }
}
