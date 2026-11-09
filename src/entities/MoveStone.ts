import { Collision } from '../core/Collision';
import { SoundManager } from '../core/Audio';
import { ImageCache } from '../core/Images';
import { MoveStoneDef, Rect } from '../data/rooms';

const OBJECTS_SHEET = '/assets/ui/objects.png';
const GHIBLI_STONE = '/assets/ui/ghibli_props/pushable_stone.png';
const MOVE_MS = 450; // ObjMoveStone._moveTime
const INERTIA_MS = 450; // PushableComponent.InertiaTime: push this long before the stone budges
const DIR_VEC: Record<number, [number, number]> = { 0: [-1, 0], 1: [0, -1], 2: [1, 0], 3: [0, 1] };
// objects.atlas
const SPRITES: Record<string, { x: number; y: number; w: number; h: number }> = {
  movestone_0: { x: 378, y: 17, w: 16, h: 16 },
  movestone_1: { x: 395, y: 17, w: 16, h: 16 },
  movestone_2: { x: 412, y: 17, w: 16, h: 16 },
  movestone_3: { x: 429, y: 17, w: 16, h: 16 }
};

interface Stone {
  def: MoveStoneDef;
  x: number; // top-left of the 16x16 cell, logical px
  y: number;
  moving: { fromX: number; fromY: number; toX: number; toY: number; t: number } | null;
  moved: boolean; // ObjMoveStone "moved" state: pushed once, stays put until the room reloads
}

/**
 * Push blocks of the current room, ported from `_ref_repo/InGame/GameObjects/Things/ObjMoveStone.cs`:
 * a solid 16x16 block that Link slides one tile by walking into it for 450 ms in an allowed
 * direction (bitmask param 0, 15 = any), if the target cell is free. The slide eases out over
 * 450 ms (sin) with D378-17-11; the block then stays until the room is re-entered.
 */
export class MoveStoneSystem {
  private stones: Stone[] = [];
  private pushMs = 0;
  private pushDir = -1;

  constructor(
    private readonly images: ImageCache,
    private readonly sound: SoundManager
  ) {}

  public setRoom(defs: MoveStoneDef[] | undefined): void {
    this.stones = (defs ?? []).map((def) => ({ def, x: def.x, y: def.y, moving: null, moved: false }));
    this.pushMs = 0;
    this.pushDir = -1;
    if (this.stones.length) {
      void this.images.load(OBJECTS_SHEET);
      void this.images.load(GHIBLI_STONE);
    }
  }

  /** CBox(0, -16, 16, 16) from EntityPosition (x, y + 16): the whole cell. */
  public colliders(): Rect[] {
    return this.stones.map((s) => ({ x: s.x, y: s.y, w: 16, h: 16 }));
  }

  /**
   * Link walking against a stone: `feet` is his collision box after the blocked move, `direction`
   * the way he walks (-1 when not walking). `walls` are the other obstacles.
   */
  public update(dtMs: number, feet: Rect, direction: number, walls: Rect[]): void {
    for (const s of this.stones) {
      if (!s.moving) continue;
      s.moving.t = Math.min(1, s.moving.t + dtMs / MOVE_MS);
      const k = Math.sin((s.moving.t * Math.PI) / 2); // fast start, slow end
      s.x = s.moving.fromX + (s.moving.toX - s.moving.fromX) * k;
      s.y = s.moving.fromY + (s.moving.toY - s.moving.fromY) * k;
      if (s.moving.t >= 1) {
        s.x = s.moving.toX;
        s.y = s.moving.toY;
        s.moving = null;
        s.moved = true;
      }
    }

    const stone = direction < 0 ? undefined : this.stoneAhead(feet, direction);
    if (!stone || direction !== this.pushDir) {
      this.pushMs = 0;
      this.pushDir = direction;
      if (!stone) return;
    }
    this.pushMs += dtMs;
    if (this.pushMs < INERTIA_MS) return;
    this.pushMs = 0;
    this.tryPush(stone, direction, walls);
  }

  /** The idle stone right in front of Link's feet (1 px probe in the walking direction). */
  private stoneAhead(feet: Rect, direction: number): Stone | undefined {
    const [dx, dy] = DIR_VEC[direction];
    const probe = { x: feet.x + dx, y: feet.y + dy, w: feet.w, h: feet.h };
    return this.stones.find((s) => !s.moving && !s.moved && Collision.intersects(probe, { x: s.x, y: s.y, w: 16, h: 16 }));
  }

  private tryPush(s: Stone, direction: number, walls: Rect[]): void {
    const mask = s.def.directions;
    if (mask !== -1 && (mask & (1 << direction)) === 0) return;
    const [dx, dy] = DIR_VEC[direction];
    const target = { x: s.x + dx * 16, y: s.y + dy * 16, w: 16, h: 16 };
    const inside = target.x >= 0 && target.y >= 0 && target.x + 16 <= 160 && target.y + 16 <= 128;
    const others = this.stones.filter((o) => o !== s).map((o) => ({ x: o.x, y: o.y, w: 16, h: 16 }));
    if (!inside || Collision.collidesWithAny(target, [...walls, ...others])) return;
    s.moving = { fromX: s.x, fromY: s.y, toX: target.x, toY: target.y, t: 0 };
    this.sound.playSfx('stone_push', 0.6);
  }

  /** LayerBottom: drawn flat under Link and the enemies. */
  public renderGround(ctx: CanvasRenderingContext2D, useGhibli = false): void {
    if (useGhibli) {
      const ghibliStone = this.images.get(GHIBLI_STONE);
      if (ghibliStone) {
        for (const s of this.stones) {
          ctx.drawImage(ghibliStone, Math.round(s.x), Math.round(s.y), 16, 16);
        }
        return;
      }
    }
    const img = this.images.get(OBJECTS_SHEET);
    if (!img) return;
    for (const s of this.stones) {
      const sp = SPRITES[s.def.sprite] ?? SPRITES.movestone_0;
      ctx.drawImage(img, sp.x, sp.y, sp.w, sp.h, Math.round(s.x), Math.round(s.y), sp.w, sp.h);
    }
  }
}
