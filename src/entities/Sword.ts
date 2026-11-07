import { Rect } from '../data/rooms';
import { SWORD_FRAMES, SwordFrame } from '../data/swordFrames';

/**
 * Sword attack ported from ObjLink.UseSword / UpdateAttacking / StartSwordSpin:
 *  - slash: `attack_<dir>` (50 + 50 + 83 ms), random slash SFX
 *  - holding the button after the slash keeps the sword out (`stand_<dir>`) and charges for 500 ms
 *    (SwordChargeTime), then plays D360-04-04
 *  - releasing a charged sword spins 360° (`swing_<dir>`, D378-03-03) with double damage
 * The weapon sprite is drawn at (feetX - 7, feetY - 16) + frame offset like AnimatorWeapons.
 */
export type SwordPhase = 'none' | 'slash' | 'hold' | 'spin';

export const SWORD_CHARGE_MS = 500;
const SHEET = '/assets/ui/link0.png';

export interface SwordHit {
  area: Rect;
  damage: number;
}

export class Sword {
  public phase: SwordPhase = 'none';
  private direction = 3;
  private timer = 0;
  private charge = 0;
  private chargedNotified = false;

  public get active(): boolean {
    return this.phase !== 'none';
  }

  public get isCharged(): boolean {
    return this.phase === 'hold' && this.charge >= SWORD_CHARGE_MS;
  }

  public start(direction: number): void {
    this.direction = direction;
    this.phase = 'slash';
    this.timer = 0;
    this.charge = 0;
    this.chargedNotified = false;
  }

  public cancel(): void {
    this.phase = 'none';
  }

  /**
   * Advances the attack. Returns 'charged' on the frame the charge completes and 'spin' when the
   * spin starts, so the caller can play the matching sounds.
   */
  public update(dtMs: number, held: boolean): 'charged' | 'spin' | null {
    if (this.phase === 'none') return null;
    this.timer += dtMs;

    if (this.phase === 'slash') {
      if (this.timer < this.duration(`attack_${this.direction}`)) return null;
      this.phase = held ? 'hold' : 'none';
      this.timer = 0;
      return null;
    }

    if (this.phase === 'hold') {
      if (!held) {
        if (this.charge >= SWORD_CHARGE_MS) {
          this.phase = 'spin';
          this.timer = 0;
          return 'spin';
        }
        this.phase = 'none';
        return null;
      }
      this.charge += dtMs;
      if (this.charge >= SWORD_CHARGE_MS && !this.chargedNotified) {
        this.chargedNotified = true;
        return 'charged';
      }
      return null;
    }

    // spin
    if (this.timer >= this.duration(`swing_${this.direction}`)) this.phase = 'none';
    return null;
  }

  private animKey(): string {
    if (this.phase === 'slash') return `attack_${this.direction}`;
    if (this.phase === 'spin') return `swing_${this.direction}`;
    return `stand_${this.direction}`;
  }

  private duration(key: string): number {
    return (SWORD_FRAMES[key] ?? []).reduce((t, f) => t + f.ms, 0);
  }

  private currentFrame(): SwordFrame | null {
    const frames = SWORD_FRAMES[this.animKey()];
    if (!frames || frames.length === 0) return null;
    if (this.phase === 'hold') return frames[0];
    let t = this.timer;
    for (const f of frames) {
      if (t < f.ms) return f;
      t -= f.ms;
    }
    return frames[frames.length - 1];
  }

  /** Current damaging area in logical space (null on wind-up frames with an empty hit rect). */
  public hit(feetX: number, feetY: number): SwordHit | null {
    // No attack running: the idle `stand_` frame must not deal damage
    if (this.phase === 'none') return null;
    const f = this.currentFrame();
    if (!f || f.hit[2] === 0 || f.hit[3] === 0) return null;
    const baseX = feetX - 7 + f.ox;
    const baseY = feetY - 16 + f.oy;
    // Mirroring flips the collision rect inside the sprite too
    const hx = f.flipH ? f.w - f.hit[0] - f.hit[2] : f.hit[0];
    const hy = f.flipV ? f.h - f.hit[1] - f.hit[3] : f.hit[1];
    // Sword L-1 deals 1, the spin doubles it (ObjLink damage calc)
    return {
      area: { x: baseX + hx, y: baseY + hy, w: f.hit[2], h: f.hit[3] },
      damage: this.phase === 'spin' ? 2 : 1
    };
  }

  /** True when the sword should be drawn behind Link (pointing up). */
  public get behindLink(): boolean {
    const f = this.currentFrame();
    return !!f && f.oy < -8;
  }

  public render(ctx: CanvasRenderingContext2D, sheet: HTMLImageElement | undefined, feetX: number, feetY: number, z: number): void {
    const f = this.currentFrame();
    if (!f || !sheet) return;
    const x = Math.round(feetX - 7 + f.ox);
    const y = Math.round(feetY - 16 - z + f.oy);
    ctx.save();
    ctx.translate(x + (f.flipH ? f.w : 0), y + (f.flipV ? f.h : 0));
    ctx.scale(f.flipH ? -1 : 1, f.flipV ? -1 : 1);
    // Charged sword blinks like the original colour flash
    if (this.isCharged && Math.floor(this.charge / 66) % 2 === 0) ctx.filter = 'brightness(1.8)';
    ctx.drawImage(sheet, f.sx, f.sy, f.w, f.h, 0, 0, f.w, f.h);
    ctx.restore();
  }

  public static readonly SHEET = SHEET;
}
