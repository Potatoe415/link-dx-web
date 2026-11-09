import { Collision } from '../core/Collision';
import { SoundManager } from '../core/Audio';
import { ImageCache } from '../core/Images';
import { CuttableDef, GroundZone, Rect } from '../data/rooms';

const OBJECTS_SHEET = '/assets/ui/objects.png';
const GHIBLI_BUSH = '/assets/ui/ghibli_props/bush.png';
const GHIBLI_FLOWERS = '/assets/ui/ghibli_props/flowers_grass.png';

// objects.atlas: id -> source rect + origin (ObjBush draws at (x + 8, y + 8) - origin)
const SPRITES: Record<string, { x: number; y: number; w: number; h: number; ox: number; oy: number }> = {
  bush_0: { x: 361, y: 1, w: 14, h: 14, ox: 7, oy: 7 },
  bush_1: { x: 376, y: 1, w: 14, h: 14, ox: 7, oy: 7 },
  grass_0: { x: 513, y: 145, w: 20, h: 20, ox: 10, oy: 10 },
  grass_0_0: { x: 515, y: 145, w: 16, h: 18, ox: 8, oy: 10 },
  grass_0_1: { x: 515, y: 145, w: 18, h: 20, ox: 8, oy: 10 },
  grass_0_2: { x: 513, y: 145, w: 18, h: 20, ox: 10, oy: 10 },
  grass_0_3: { x: 513, y: 145, w: 20, h: 18, ox: 10, oy: 10 }
};
const LEAF = { x: 331, y: 91, w: 8, h: 6 };
const LEAF_MS = 450;
// ObjBush: rupee 6 %, heart 3 % (other drops come from map-defined spawn items, not ported yet)
const DROP_RUPEE = 6;
const DROP_HEART = 9;
// ObjBush._hittableBoxSmall is 8x8 centred; a sword hit needs >= 16 px² of overlap on solid bushes
const MIN_SWORD_OVERLAP = 16;

interface LeafBurst {
  x: number;
  y: number;
  t: number;
}

export interface CutResult {
  drops: { kind: 'rupee' | 'heart'; x: number; y: number }[];
}

/**
 * Cuttable bushes and tall grass of the current room (ObjBush): drawn at runtime, bushes are solid,
 * grass is a `grass` ground zone, the sword cuts both (D378-05-05 + scattered leaves) and they
 * grow back when the room is re-entered (ObjBushRespawner).
 */
export class BushSystem {
  private items: CuttableDef[] = [];
  private bursts: LeafBurst[] = [];

  constructor(
    private readonly images: ImageCache,
    private readonly sound: SoundManager
  ) {}

  public setRoom(defs: CuttableDef[] | undefined): void {
    this.items = [...(defs ?? [])];
    this.bursts = [];
    void this.images.load(OBJECTS_SHEET);
    void this.images.load(GHIBLI_BUSH);
    void this.images.load(GHIBLI_FLOWERS);
  }

  /** Solid collider of each standing bush (ObjBush collisionBox CBox(-8, -7, 16, 14) at (x+8, y+8)). */
  public colliders(): Rect[] {
    return this.items.filter((b) => b.kind === 'bush').map((b) => ({ x: b.x, y: b.y + 1, w: 16, h: 14 }));
  }

  /** Grass ground zones still standing (removed when cut, like RemoveFieldState). */
  public grassZones(): GroundZone[] {
    return this.items.filter((b) => b.kind === 'grass').map((b) => ({ kind: 'grass', x: b.x, y: b.y, w: 16, h: 16 }));
  }

  /** Cuts every bush / grass tuft the sword area touches. */
  public cut(area: Rect, random: () => number = Math.random): CutResult {
    const drops: CutResult['drops'] = [];
    this.items = this.items.filter((b) => {
      const small = { x: b.x + 4, y: b.y + 4, w: 8, h: 8 };
      const ox = Math.min(area.x + area.w, small.x + small.w) - Math.max(area.x, small.x);
      const oy = Math.min(area.y + area.h, small.y + small.h) - Math.max(area.y, small.y);
      const overlap = Math.max(0, ox) * Math.max(0, oy);
      const hit = b.kind === 'bush' ? overlap >= MIN_SWORD_OVERLAP : Collision.intersects(area, { x: b.x, y: b.y, w: 16, h: 16 });
      if (!hit) return true;

      this.sound.playSfx('bush_cut', 0.6);
      this.bursts.push({ x: b.x + 8, y: b.y + 8, t: 0 });
      const r = random() * 100;
      if (r < DROP_RUPEE) drops.push({ kind: 'rupee', x: b.x + 8, y: b.y + 12 });
      else if (r < DROP_HEART) drops.push({ kind: 'heart', x: b.x + 8, y: b.y + 12 });
      return false;
    });
    return { drops };
  }

  public update(dtMs: number): void {
    for (const b of this.bursts) b.t += dtMs;
    this.bursts = this.bursts.filter((b) => b.t < LEAF_MS);
  }

  /** Grass draws flat under everything; bushes Y-sort with Link and enemies. */
  public renderGround(ctx: CanvasRenderingContext2D, useGhibli = false): void {
    if (useGhibli) {
      const ghibliImg = this.images.get(GHIBLI_FLOWERS);
      if (ghibliImg) {
        for (const b of this.items) {
          if (b.kind === 'grass') {
            ctx.drawImage(ghibliImg, b.x - 1, b.y - 1, 18, 18);
          }
        }
        return;
      }
    }
    const img = this.images.get(OBJECTS_SHEET);
    if (!img) return;
    for (const b of this.items) if (b.kind === 'grass') this.draw(ctx, img, b);
  }

  public renderables(ctx: CanvasRenderingContext2D, useGhibli = false): { y: number; render: () => void }[] {
    const img = this.images.get(OBJECTS_SHEET);
    const ghibliBush = useGhibli ? this.images.get(GHIBLI_BUSH) : null;
    const out: { y: number; render: () => void }[] = [];
    for (const b of this.items) {
      if (b.kind !== 'bush') continue;
      out.push({
        y: b.y + 15,
        render: () => {
          if (useGhibli && ghibliBush) {
            ctx.drawImage(ghibliBush, b.x - 1, b.y - 1, 18, 17);
          } else if (img) {
            this.draw(ctx, img, b);
          }
        }
      });
    }
    if (img) {
      for (const burst of this.bursts) out.push({ y: 999, render: () => this.drawLeaves(ctx, img, burst) });
    }
    return out;
  }

  private draw(ctx: CanvasRenderingContext2D, img: HTMLImageElement, b: CuttableDef): void {
    const s = SPRITES[b.sprite] ?? SPRITES.bush_0;
    ctx.drawImage(img, s.x, s.y, s.w, s.h, b.x + 8 - s.ox, b.y + 8 - s.oy, s.w, s.h);
  }

  /** 4 leaves flying outward and fading (the original spawns leaf particles on DestroyBush). */
  private drawLeaves(ctx: CanvasRenderingContext2D, img: HTMLImageElement, burst: LeafBurst): void {
    const t = burst.t / LEAF_MS;
    ctx.save();
    ctx.globalAlpha = 1 - t;
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + (i * Math.PI) / 2;
      const d = 3 + t * 10;
      const x = burst.x + Math.cos(a) * d - LEAF.w / 2;
      const y = burst.y + Math.sin(a) * d - LEAF.h / 2 - Math.sin(t * Math.PI) * 4;
      ctx.drawImage(img, LEAF.x, LEAF.y, LEAF.w, LEAF.h, Math.round(x), Math.round(y), LEAF.w, LEAF.h);
    }
    ctx.restore();
  }
}
