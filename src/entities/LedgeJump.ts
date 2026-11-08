import { Collision } from '../core/Collision';
import { JumpDef, Rect } from '../data/rooms';

// ObjLink body (BodyComponent(-4, -10, 8, 10)): goal positions use the original body size
const BODY_W = 8;
const BODY_H = 10;
const FRAME_MS = 1000 / 60;

/** AnimationHelper.GetDirection: 0 Left, 1 Up, 2 Right, 3 Down. */
function directionOf(dx: number, dy: number): number {
  let degree = (Math.atan2(dy, dx) + Math.PI * 1.25) * (180 / Math.PI);
  while (degree >= 360) degree -= 360;
  return Math.floor(degree / 90);
}

/**
 * Ledge hop (ObjJump.OnPush + ObjLink.StartRailJump / UpdateJump): walking into a jump field in its
 * direction hops Link over the ledge collider to the field's offset, ignoring walls while airborne.
 */
export class LedgeJump {
  public targetX = 0;
  public targetY = 0;
  private startX = 0;
  private startY = 0;
  private height = 12;
  private speed = 0.045;
  private progress = 0;

  /** Returns true when Link (feet at x, y, moving by dx, dy) pushes into a jump field and the hop starts. */
  public tryStart(jumps: JumpDef[] | undefined, x: number, y: number, dx: number, dy: number, colliders: Rect[], roomW: number, roomH: number): boolean {
    if (!jumps?.length || (dx === 0 && dy === 0)) return false;
    const pushDir = directionOf(dx, dy);
    const step = [[-1, 0], [0, -1], [1, 0], [0, 1]][pushDir];
    // The blocked step may stop Link short of the wall: probe as far as he tried to move
    const reach = Math.max(1, Math.abs(pushDir % 2 === 0 ? dx : dy));
    const probe = Collision.getPlayerCollisionBox(x + step[0] * reach, y + step[1] * reach);
    for (const j of jumps) {
      if (directionOf(j.offsetX, j.offsetY) !== pushDir || !Collision.intersects(probe, j)) continue;
      let gx = x;
      let gy = y;
      if (pushDir === 0) gx = j.x + j.w + j.offsetX - BODY_W / 2;
      else if (pushDir === 2) gx = j.x + j.offsetX + BODY_W / 2;
      else if (pushDir === 1) gy = j.y + j.h + j.offsetY;
      else gy = j.y + j.offsetY + BODY_H;
      if (pushDir % 2 !== 0) gx += j.offsetX;
      else gy += j.offsetY;

      // Do not jump into a wall; landings past the screen edge are resolved by the scroll
      const inside = gx >= 0 && gx <= roomW && gy >= 0 && gy <= roomH;
      if (!j.ignoreCollision && inside && Collision.collidesWithAny(Collision.getPlayerCollisionBox(gx, gy), colliders)) return false;

      const length = Math.hypot(j.offsetX, j.offsetY);
      let jumpMult = length > 16 ? 1 + (length - 16) / 32 : 1;
      if (j.offsetY < -4) jumpMult *= 0.75;
      const speedMult = length > 16 ? 1 - (length - 16) / 80 : 1;

      this.startX = x;
      this.startY = y;
      this.targetX = gx;
      this.targetY = gy;
      this.height = 12 * jumpMult * (j.height ?? 1);
      this.speed = 0.045 * speedMult * (j.speed ?? 1);
      this.progress = 0;
      return true;
    }
    return false;
  }

  /** Advances the arc; returns the new feet position and height, `done` once landed. */
  public step(dtMs: number): { x: number; y: number; z: number; done: boolean } {
    this.progress = Math.min(1, this.progress + (dtMs / FRAME_MS) * this.speed);
    const p = this.progress;
    const amount = Math.sin(p * Math.PI * 0.3) / Math.sin(Math.PI * 0.3);
    return {
      x: this.startX + (this.targetX - this.startX) * amount,
      y: this.startY + (this.targetY - this.startY) * amount,
      z: Math.sin(p * Math.PI) * this.height,
      done: p >= 1
    };
  }
}
