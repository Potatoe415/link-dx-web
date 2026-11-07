import { Collision } from '../../core/Collision';
import { Rect } from '../../data/rooms';
import { EnemyConfig, EnemyHitResult } from '../Enemy';
import { AnimatedEnemy } from './AnimatedEnemy';

const MOVE_SPEED = 0.33;
export const SHOCK_MS = 550;
const POST_SHOCK_MS = 350;
const SHOCK_DAMAGE = 4; // ObjLink.ShockPlayer -> InflictDamage(4)

/**
 * Buzz Blob, `EnemyBuzzBlob.cs`: drifts at 0.33 px/f in one of 8 directions, changing every
 * 0.5-1 s. The sword never hurts it: every slash or spin electrocutes Link instead (550 ms freeze,
 * screen shake and shock palette, 4 quarters of damage, D378-28-1C), then it rests 350 ms.
 * Only other weapons (double damage, 4 lives) and the Magic Powder (Cukeman, not ported yet) work.
 */
export class BuzzBlob extends AnimatedEnemy {
  private ai: 'walking' | 'shocking' | 'postShock' = 'walking';

  constructor(config: EnemyConfig, x: number, y: number, random: () => number = Math.random) {
    super(config, x, y, random);
    this.toWalking();
  }

  protected think(dtMs: number, colliders: Rect[]): void {
    this.aiTimer -= dtMs;
    if (this.ai === 'walking') {
      this.moveBy(this.vx, this.vy, colliders);
      if (this.aiTimer <= 0) this.toWalking();
      return;
    }
    if (this.aiTimer > 0) return;
    if (this.ai === 'shocking') {
      this.ai = 'postShock';
      this.aiTimer = POST_SHOCK_MS;
    } else this.toWalking();
  }

  private toWalking(): void {
    this.ai = 'walking';
    this.aiTimer = this.rand(500, 1000);
    this.anim.play('walk');
    const radius = (this.randInt(8) / 4) * Math.PI;
    this.vx = Math.sin(radius) * MOVE_SPEED;
    this.vy = Math.cos(radius) * MOVE_SPEED;
  }

  /** Sword hit: StartShock instead of damage. */
  public hitBy(area: Rect, _damage: number, _fromX: number, _fromY: number): EnemyHitResult {
    if (!Collision.intersects(area, this.hittableBox) || this.state === 'DYING') return 'ignored';
    if (this.ai === 'shocking') return 'absorbed';
    this.ai = 'shocking';
    this.aiTimer = SHOCK_MS;
    this.vx = 0;
    this.vy = 0;
    this.anim.play('shock', true);
    this.events.push({ type: 'shock', ms: SHOCK_MS, damage: SHOCK_DAMAGE });
    return 'absorbed';
  }

  /** Raised shield: PushableComponent impact pushes it back at twice the push speed, no blink. */
  public shieldBounce(dirX: number, dirY: number): void {
    this.knockBack(dirX, dirY, 2);
  }
}
