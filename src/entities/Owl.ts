import { SoundManager } from '../core/Audio';
import { ImageCache } from '../core/Images';
import { Rect } from '../data/rooms';
import { directionOf } from './Enemy';

/**
 * The Owl (Hibou), ported from `_ref_repo/InGame/GameObjects/NPCs/ObjOwl.cs` (mode 0: leave after
 * talking). When Link enters the trigger rectangle and the owl script key matches, the owl glides
 * in from the top-left over 2 s (landing bezier, fade-in, D378-45-2D every 500 ms), talks while Link
 * is frozen, then flies off to the top-right with the leaving bezier.
 */
export const NPCS_SHEET = '/assets/ui/npcs.png'; // copied from `_ref_repo/Data/Map Objects/npcs.png`
const GHIBLI_OWL = '/assets/ui/ghibli_characters/owl.png';
const ENTER_MS = 2000; // ObjOwl._enterTime
const FLY_SFX_MS = 500;
const LEAVE_SFX_MS = 175;

type Frame = { ms: number; x: number; y: number; w: number; h: number; ox: number; oy: number };
// NPCs/owl.ani
const ANIMS: Record<'idle' | 'fly', Frame[]> = {
  idle: [
    { ms: 1000, x: 314, y: 259, w: 14, h: 16, ox: -7, oy: -16 },
    { ms: 200, x: 330, y: 259, w: 14, h: 16, ox: -7, oy: -16 },
    { ms: 317, x: 314, y: 259, w: 14, h: 16, ox: -7, oy: -16 },
    { ms: 200, x: 330, y: 259, w: 14, h: 16, ox: -7, oy: -16 }
  ],
  fly: [
    { ms: 133, x: 346, y: 259, w: 24, h: 16, ox: -12, oy: -16 },
    { ms: 133, x: 314, y: 259, w: 14, h: 16, ox: -7, oy: -16 }
  ]
};

/** CubicBezier(…, p1, p2) from (0,0) to (1,1), solved for y at a given x like CubicBezier.EvaluateX. */
function bezierY(x: number, p1: [number, number], p2: [number, number]): number {
  const coord = (t: number, a: number, b: number) => 3 * (1 - t) * (1 - t) * t * a + 3 * (1 - t) * t * t * b + t * t * t;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (coord(mid, p1[0], p2[0]) < x) lo = mid;
    else hi = mid;
  }
  return coord((lo + hi) / 2, p1[1], p2[1]);
}
const LANDING: [[number, number], [number, number]] = [[0.35, 1], [0.8, 1]];
const LEAVING: [[number, number], [number, number]] = [[0.25, 0.04], [0.35, 0.11]];

export interface OwlDef {
  x: number; // map object origin (16x16 cell top-left)
  y: number;
  trigger: Rect; // relative to (x + 8, y + 8) like ObjOwl's enterRectangle
  pages: string[];
}

type OwlState = 'wait' | 'enter' | 'talk' | 'leave' | 'gone';
type Vec3 = { x: number; y: number; z: number };

export class Owl {
  public state: OwlState = 'wait';
  private timer = 0;
  private sfxTimer = 0;
  private animTimer = 0;
  private anim: 'idle' | 'fly' = 'fly';
  private animSpeed = 1;
  private pos: Vec3;
  private readonly start: Vec3;
  private readonly land: Vec3;
  private readonly leaveTo: Vec3;
  private alpha = 0;

  constructor(
    private readonly def: OwlDef,
    private readonly images: ImageCache,
    private readonly sound: SoundManager
  ) {
    const ox = def.x + 8;
    const oy = def.y + 16;
    this.start = { x: ox - 64, y: oy - 64, z: 64 };
    this.land = { x: ox, y: oy, z: 0 };
    this.leaveTo = { x: ox + 64, y: oy - 64, z: 64 };
    this.pos = { ...this.start };
    void images.load(NPCS_SHEET);
    void images.load(GHIBLI_OWL);
  }

  /** True while the owl freezes Link (ObjLink.FreezePlayer during enter / talk / leave). */
  public get freezesPlayer(): boolean {
    return this.state === 'enter' || this.state === 'talk';
  }

  public get active(): boolean {
    return this.state !== 'wait' && this.state !== 'gone';
  }

  /** ObjectCollisionComponent: Link's feet inside the trigger rectangle. */
  public checkTrigger(px: number, py: number): boolean {
    if (this.state !== 'wait') return false;
    const t = this.def.trigger;
    const rx = this.def.x + 8 + t.x;
    const ry = this.def.y + 8 + t.y;
    if (px < rx || px >= rx + t.w || py < ry || py >= ry + t.h) return false;
    this.state = 'enter';
    this.timer = 0;
    this.sfxTimer = 0;
    this.anim = 'fly';
    return true;
  }

  /** Advances the cutscene. `onLanded` fires once when the owl starts talking. */
  public update(dtMs: number, playerX: number, playerY: number, onLanded: () => void): { faceDirection?: number } {
    this.animTimer += dtMs * this.animSpeed;
    if (this.state === 'enter') {
      this.timer = Math.min(ENTER_MS, this.timer + dtMs);
      this.sfxTimer -= dtMs;
      if (this.sfxTimer < 0) {
        this.sfxTimer = FLY_SFX_MS;
        this.sound.playSfx('owl_fly', 0.55);
      }
      const t = this.timer / ENTER_MS;
      this.pos = lerp3(this.start, this.land, bezierY(t, ...LANDING));
      if (t > 0.9) this.anim = 'idle';
      this.alpha = t <= 0.1 ? t / 0.1 : 1;
      const out: { faceDirection?: number } = {};
      // Link turns to look at the owl during the last second
      if (this.timer > ENTER_MS - 1000) out.faceDirection = directionOf(this.pos.x - playerX, this.pos.y - playerY);
      if (this.timer >= ENTER_MS) {
        this.pos = { ...this.land };
        this.anim = 'idle';
        this.state = 'talk';
        onLanded();
      }
      return out;
    }
    if (this.state === 'leave') {
      this.sfxTimer -= dtMs;
      if (this.sfxTimer < 0) {
        this.sfxTimer = LEAVE_SFX_MS;
        this.sound.playSfx('bush_cut', 0.35); // ObjOwl.UpdateLeave plays D378-05-05 (wing flaps)
      }
      this.timer = Math.min(ENTER_MS, this.timer + dtMs);
      const t = this.timer / ENTER_MS;
      this.pos = lerp3(this.land, this.leaveTo, bezierY(t, ...LEAVING));
      this.alpha = t >= 0.9 ? (1 - t) / 0.1 : 1;
      if (this.timer >= ENTER_MS) this.state = 'gone';
    }
    return {};
  }

  /** Dialogue closed: InitLeave. */
  public leave(): void {
    if (this.state !== 'talk') return;
    this.state = 'leave';
    this.timer = 0;
    this.sfxTimer = 0;
    this.anim = 'fly';
    this.animSpeed = 1.5;
  }

  public renderable(ctx: CanvasRenderingContext2D, useGhibli = false): { y: number; render: () => void } | null {
    if (!this.active) return null;
    // Drawn above everything while airborne, Y-sorted once landed
    const y = this.pos.z > 4 ? 999 : this.pos.y;
    return { y, render: () => this.render(ctx, useGhibli) };
  }

  private render(ctx: CanvasRenderingContext2D, useGhibli = false): void {
    const sheet = this.images.get(NPCS_SHEET);
    const ghibliOwl = useGhibli ? this.images.get(GHIBLI_OWL) : undefined;
    if (!sheet && !ghibliOwl) return;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
    // BodyDrawShadowComponent: shadow at the ground position, shrinking as the owl rises (1 - z / 10)
    const shadowScale = Math.max(0.3, 1 - this.pos.z / 10);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(this.pos.x, this.pos.y - 1, 5 * shadowScale, 2 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    if (useGhibli && ghibliOwl) {
      const ow = 14;
      const oh = 20;
      const ox = Math.round(this.pos.x - ow / 2);
      const oy = Math.round(this.pos.y - this.pos.z - oh);
      ctx.drawImage(ghibliOwl, ox, oy, ow, oh);
    } else if (sheet) {
      const frames = ANIMS[this.anim];
      const total = frames.reduce((t, f) => t + f.ms, 0);
      let t = this.animTimer % total;
      let f = frames[0];
      for (const fr of frames) {
        if (t < fr.ms) {
          f = fr;
          break;
        }
        t -= fr.ms;
      }
      // CSprite draws at (x, y - z) + frame offset
      const dy = Math.round(this.pos.y - this.pos.z + f.oy);
      ctx.drawImage(sheet, f.x, f.y, f.w, f.h, Math.round(this.pos.x + f.ox), dy, f.w, f.h);
    }
    ctx.restore();
  }
}

function lerp3(a: Vec3, b: Vec3, t: number): Vec3 {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t };
}
