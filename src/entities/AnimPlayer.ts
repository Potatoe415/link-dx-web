import { Rect } from '../data/rooms';

/** One frame of a generated `.ani` animator (src/data/npcAnimations.ts, src/data/enemyAnimations.ts). */
export interface AnimFrame {
  ms: number;
  x: number; // source rectangle on the sprite sheet
  y: number;
  w: number;
  h: number;
  dx: number; // draw offset from the sprite origin (animation offset + frame offset)
  dy: number;
  flip: boolean; // mirrored horizontally
  flipV?: boolean; // mirrored vertically
  col?: Rect; // Animator.GetCollisionBox relative to the sprite origin (only when the frame defines one)
}

export interface AnimDef {
  next: string; // played when a non-looping animation ends ("" = hold the last frame)
  loop: boolean;
  repeat?: number; // extra plays before stopping (.ani loopCount > 0)
  frames: AnimFrame[];
}

export interface AnimatorDef {
  first: string; // Animator default animation (index 0)
  anims: Record<string, AnimDef>;
}

/** Draws one frame with its offset and mirror flags (Animator.Draw). */
export function drawFrame(ctx: CanvasRenderingContext2D, sheet: HTMLImageElement, f: AnimFrame, x: number, y: number): void {
  const dx = Math.round(x + f.dx);
  const dy = Math.round(y + f.dy);
  if (!f.flip && !f.flipV) {
    ctx.drawImage(sheet, f.x, f.y, f.w, f.h, dx, dy, f.w, f.h);
    return;
  }
  ctx.save();
  ctx.translate(dx + (f.flip ? f.w : 0), dy + (f.flipV ? f.h : 0));
  ctx.scale(f.flip ? -1 : 1, f.flipV ? -1 : 1);
  ctx.drawImage(sheet, f.x, f.y, f.w, f.h, 0, 0, f.w, f.h);
  ctx.restore();
}

/** Plays one animator (Animator.cs subset: looping, loop counts, `next` chaining, speed, hold last frame). */
export class AnimPlayer {
  public current = '';
  public frame = 0;
  public playing = true;
  public speed = 1; // Animator.SpeedMultiplier
  private timer = 0;
  private loops = 0;

  constructor(private readonly animator: AnimatorDef) {
    this.play(animator.first);
  }

  public has(id: string): boolean {
    return id in this.animator.anims;
  }

  /** Switches animation; the same id keeps running unless `restart` is set. */
  public play(id: string, restart = false): void {
    if (!this.has(id) || (id === this.current && !restart)) return;
    this.current = id;
    this.frame = 0;
    this.timer = 0;
    this.loops = 0;
    this.playing = true;
  }

  public get frameDef(): AnimFrame {
    return this.anim().frames[this.frame];
  }

  public update(dtMs: number): void {
    if (!this.playing) return;
    const anim = this.anim();
    this.timer += dtMs * this.speed;
    while (this.timer >= anim.frames[this.frame].ms) {
      this.timer -= anim.frames[this.frame].ms;
      if (this.frame + 1 < anim.frames.length) this.frame++;
      else if (anim.loop || this.loops < (anim.repeat ?? 0)) {
        this.frame = 0;
        this.loops++;
      } else {
        this.timer = 0;
        this.playing = false;
        if (anim.next) this.play(anim.next);
        return;
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D, sheet: HTMLImageElement, x: number, y: number): void {
    drawFrame(ctx, sheet, this.frameDef, x, y);
  }

  private anim(): AnimDef {
    return this.animator.anims[this.current];
  }
}
