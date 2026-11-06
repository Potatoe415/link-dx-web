import { Rect, WarpTrigger } from '../data/rooms';

export class Collision {
  /**
   * Check if two AABB rectangles overlap
   */
  public static intersects(a: Rect, b: Rect): boolean {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  /**
   * Check if a given bounding box collides with any collider in the list
   */
  public static collidesWithAny(box: Rect, colliders: Rect[]): boolean {
    for (const c of colliders) {
      if (this.intersects(box, c)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Calculate total overlap area with colliders (used for unsticking)
   */
  public static getOverlapArea(box: Rect, colliders: Rect[]): number {
    let totalArea = 0;
    for (const c of colliders) {
      const xOverlap = Math.max(0, Math.min(box.x + box.w, c.x + c.w) - Math.max(box.x, c.x));
      const yOverlap = Math.max(0, Math.min(box.y + box.h, c.y + c.h) - Math.max(box.y, c.y));
      totalArea += xOverlap * yOverlap;
    }
    return totalArea;
  }

  /**
   * Link's feet collision box at logical position (x, y).
   * Position (x, y) is the bottom-center anchor of Link's sprite.
   * Collision box is 8px wide by 8px high: [x - 4, y - 8, 8, 8].
   */
  public static getPlayerCollisionBox(x: number, y: number): Rect {
    return {
      x: x - 4,
      y: y - 8,
      w: 8,
      h: 8
    };
  }

  /**
   * Resolves player movement with smooth sliding along walls on individual X and Y axes.
   * If player is slightly stuck in an obstacle, allows movement that decreases overlap.
   */
  public static moveWithSlide(
    currentX: number,
    currentY: number,
    dx: number,
    dy: number,
    colliders: Rect[]
  ): { newX: number; newY: number } {
    let newX = currentX;
    let newY = currentY;

    const currentBox = this.getPlayerCollisionBox(currentX, currentY);
    const initialOverlap = this.getOverlapArea(currentBox, colliders);

    // 1. Try moving on X axis
    if (dx !== 0) {
      const targetX = currentX + dx;
      const testBoxX = this.getPlayerCollisionBox(targetX, newY);
      const overlapX = this.getOverlapArea(testBoxX, colliders);

      // Allow move if either no collision OR movement is helping unstick
      if (overlapX === 0 || (initialOverlap > 0 && overlapX < initialOverlap)) {
        newX = targetX;
      }
    }

    // 2. Try moving on Y axis
    if (dy !== 0) {
      const targetY = currentY + dy;
      const testBoxY = this.getPlayerCollisionBox(newX, targetY);
      const overlapY = this.getOverlapArea(testBoxY, colliders);

      // Allow move if either no collision OR movement is helping unstick
      if (overlapY === 0 || (initialOverlap > 0 && overlapY < initialOverlap)) {
        newY = targetY;
      }
    }

    return { newX, newY };
  }

  /**
   * Check if Link is inside any warp trigger zone (e.g. house door)
   */
  public static checkWarpTriggers(
    x: number,
    y: number,
    direction: number,
    triggers: WarpTrigger[]
  ): WarpTrigger | null {
    const playerBox = this.getPlayerCollisionBox(x, y);
    for (const trigger of triggers) {
      if (
        trigger.requiredDirection !== undefined &&
        trigger.requiredDirection !== direction
      ) {
        continue;
      }
      if (this.intersects(playerBox, trigger.triggerBox)) {
        return trigger;
      }
    }
    return null;
  }
}
