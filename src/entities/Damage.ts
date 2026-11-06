import { Collision } from '../core/Collision';
import { Rect } from '../data/rooms';

/**
 * Link's damage model, ported from ObjLink.HitPlayer / UpdateWalking:
 *  - after a hit Link is invulnerable for CooldownTime = BlinkTime * 16 = 1056 ms and blinks every 66 ms
 *  - the hit pushes him back (hitVelocity = direction * 1.75) and decays by 0.05..0.10 px/frame
 *  - a raised shield blocks hits coming from the direction Link faces
 */
export const BLINK_MS = 66;
export const INVULNERABLE_MS = BLINK_MS * 16;
export const KNOCKBACK_PUSH = 1.75;
export const LOW_HEALTH_QUARTERS = 4; // ObjLink.UpdateHeartWarningSound threshold (one heart)
export const LOW_HEALTH_BEEP_MS = 520;

export class Knockback {
  public vx = 0;
  public vy = 0;
  public invulnerableMs = 0;

  public get active(): boolean {
    return this.invulnerableMs > 0;
  }

  /** Blink phase: hidden on odd 66 ms windows while invulnerable. */
  public get blinkHidden(): boolean {
    return this.invulnerableMs > 0 && Math.floor(this.invulnerableMs / BLINK_MS) % 2 === 1;
  }

  public start(dirX: number, dirY: number): void {
    const len = Math.hypot(dirX, dirY) || 1;
    this.vx = (dirX / len) * KNOCKBACK_PUSH;
    this.vy = (dirY / len) * KNOCKBACK_PUSH;
    this.invulnerableMs = INVULNERABLE_MS;
  }

  public reset(): void {
    this.vx = 0;
    this.vy = 0;
    this.invulnerableMs = 0;
  }

  /** Advances one fixed step; moves (x, y) with wall sliding and returns the new position. */
  public step(dtMs: number, x: number, y: number, colliders: Rect[]): { x: number; y: number } {
    this.invulnerableMs = Math.max(0, this.invulnerableMs - dtMs);
    const speed = Math.hypot(this.vx, this.vy);
    if (speed <= 0.05) {
      this.vx = 0;
      this.vy = 0;
      return { x, y };
    }
    const moved = Collision.moveWithSlide(x, y, this.vx, this.vy, colliders);
    const slow = 0.05 + Math.min(speed / 25, 0.05);
    this.vx -= (this.vx / speed) * slow;
    this.vy -= (this.vy / speed) * slow;
    return { x: moved.newX, y: moved.newY };
  }
}

/** Direction (0 Left, 1 Up, 2 Right, 3 Down) Link must face to block a hit travelling along (dx, dy). */
export function blockingDirectionFor(dx: number, dy: number): number {
  // The attack comes from the opposite of its travel direction
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 0 : 2;
  return dy > 0 ? 1 : 3;
}
