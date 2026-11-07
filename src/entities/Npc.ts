import { Collision } from '../core/Collision';
import { Rect } from '../data/rooms';
import { NpcDef } from '../data/npcs';
import { NPC_ANIMATORS, NpcAnimation, NpcAnimator } from '../data/npcAnimations';
import { directionOf } from './Enemy';

const LOOK_RANGE = 32; // ObjPerson / ObjPersonNew `_lookRange`
const CHAIN_RADIUS = 46; // ObjBowWow.UpdatePosition chain limit
const CHAIN_LINKS = 5; // ObjChain: ChainCount - 1 visible links
const CHAIN_SPRITE = { x: 310, y: 91, w: 6, h: 6, ox: 3, oy: 6 }; // npcs.png "bowwow chain"
const BALL_SPRITE = { x: 338, y: 10, w: 6, h: 6 }; // ObjBallGame source rectangle

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** AnimationHelper.GetDirection: 0 left, 1 up, 2 right, 3 down. */
function lookDirection(dx: number, dy: number): number {
  const deg = ((Math.atan2(dy, dx) + Math.PI * 1.25) * 180) / Math.PI;
  return Math.floor((((deg % 360) + 360) % 360) / 90);
}

/** Plays one NpcAnimator (Animator.cs subset: looping, `next` chaining, hold last frame). */
class AnimPlayer {
  public current = '';
  private frame = 0;
  private timer = 0;

  constructor(private readonly animator: NpcAnimator) {
    this.play(animator.first);
  }

  public has(id: string): boolean {
    return id in this.animator.anims;
  }

  public play(id: string): void {
    if (!this.has(id) || id === this.current) return;
    this.current = id;
    this.frame = 0;
    this.timer = 0;
  }

  public update(dtMs: number): void {
    const anim = this.anim();
    this.timer += dtMs;
    while (this.timer >= anim.frames[this.frame].ms) {
      this.timer -= anim.frames[this.frame].ms;
      if (this.frame + 1 < anim.frames.length) this.frame++;
      else if (anim.loop) this.frame = 0;
      else {
        if (anim.next) this.play(anim.next);
        else this.timer = 0;
        return;
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D, sheet: HTMLImageElement, x: number, y: number): void {
    const f = this.anim().frames[this.frame];
    const dx = Math.round(x + f.dx);
    const dy = Math.round(y + f.dy);
    if (f.flip) {
      ctx.save();
      ctx.translate(dx + f.w, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(sheet, f.x, f.y, f.w, f.h, 0, 0, f.w, f.h);
      ctx.restore();
    } else {
      ctx.drawImage(sheet, f.x, f.y, f.w, f.h, dx, dy, f.w, f.h);
    }
  }

  private anim(): NpcAnimation {
    return this.animator.anims[this.current];
  }
}

/**
 * One village NPC (src/data/npcs.ts). Position is the feet anchor in 160x128 logical space; `z` is
 * the hop height. Talking is handled by DialogueSystem through `speaker` / `pages`.
 */
export class Npc {
  public x: number;
  public y: number;
  private z = 0;
  private vz = 0;
  private vx = 0;
  private vy = 0;
  private readonly anim: AnimPlayer;
  private readonly spriteOffset: { x: number; y: number };
  private readonly stake: { x: number; y: number } | null = null;
  private state: 'idle' | 'walk' = 'idle';
  private stateTimer = rand(500, 1500);
  private lookTimer = 0;
  private lastDir = -2;
  private side = -1; // ObjGrandmother starts on stand_-1
  private hopDir = 0;
  private partner: AnimPlayer | null = null;
  private ball = { t: 0, dir: 1, time: 650, height: 12, pause: 0, jumper: 0 };

  constructor(public readonly def: NpcDef) {
    const animator = NPC_ANIMATORS[def.animator];
    this.anim = new AnimPlayer(animator);
    if (def.behavior === 'chained') {
      // ObjBowWow: EntityPosition (x, y + 16), stake at (x + 8, y + 8)
      this.x = def.x;
      this.y = def.y + 16;
      this.stake = { x: def.x + 8, y: def.y + 8 };
    } else {
      this.x = def.x + 8;
      this.y = def.y + 16;
    }
    // ObjPerson centres the first animation; ObjBowWow / ObjShopkeeper use (-8, -16); the other ported
    // classes draw from the feet anchor (offsets baked into their .ani frames).
    if (def.behavior === 'chained' || def.animator === 'shopkeeper') this.spriteOffset = { x: -8, y: -16 };
    else if (def.animator === 'npc07' || def.animator === 'npc04') {
      this.spriteOffset = { x: -animator.bounds.w / 2, y: -animator.bounds.h };
    } else this.spriteOffset = { x: 0, y: 0 };

    if (def.behavior === 'ballGame') {
      // ObjBallGame: left child at (x, y), right child at (x + 48, y); ball between them
      this.partner = new AnimPlayer(NPC_ANIMATORS.npc_boy_right);
    }
    this.anim.play(def.animation ?? this.defaultAnimation());
  }

  /** Solid boxes for Link (NPCs never move Link; he slides around them). */
  public colliders(): Rect[] {
    const b = this.def.body;
    const boxes = [{ x: this.x + b.x, y: this.y + b.y, w: b.w, h: b.h }];
    if (this.def.behavior === 'ballGame') boxes.push({ ...boxes[0], x: boxes[0].x + 48 });
    return boxes;
  }

  /** Talk anchor (DialogueSystem.findNearbyNPC): feet of the closest ball-game child. */
  public talkPoint(px: number): { x: number; y: number } {
    if (this.def.behavior === 'ballGame' && px > this.x + 24) return { x: this.x + 48, y: this.y };
    return { x: this.x, y: this.y };
  }

  public update(dtMs: number, link: { x: number; y: number }, walls: Rect[]): void {
    this.anim.update(dtMs);
    this.partner?.update(dtMs);
    switch (this.def.behavior) {
      case 'look':
        this.updateLook(link, 0);
        break;
      case 'lookRandom':
        this.updateLook(link, dtMs);
        break;
      case 'lookSide':
        this.updateLookSide(link);
        break;
      case 'hop':
      case 'chained':
        this.updateHop(dtMs, walls);
        break;
      case 'ballGame':
        this.updateBall(dtMs);
        break;
      default:
        break;
    }
  }

  public render(ctx: CanvasRenderingContext2D, sheet: HTMLImageElement): void {
    if (this.stake) this.renderChain(ctx, sheet);
    this.renderShadow(ctx, this.x, this.y);
    const z = this.partner && this.ball.jumper !== 0 ? 0 : this.z;
    this.anim.draw(ctx, sheet, this.x + this.spriteOffset.x, this.y + this.spriteOffset.y - z);
    if (this.partner) {
      this.renderShadow(ctx, this.x + 48, this.y);
      this.partner.draw(ctx, sheet, this.x + 48, this.y - (this.ball.jumper === 1 ? this.z : 0));
      this.renderBall(ctx, sheet);
    }
  }

  private defaultAnimation(): string {
    switch (this.def.behavior) {
      case 'look':
      case 'lookRandom':
        return 'stand_3';
      case 'lookSide':
        return 'stand_-1';
      case 'hop':
        return this.anim.has('idle_0') ? 'idle_0' : 'walk_0';
      case 'chained':
        return 'walk_3';
      case 'ballGame':
        return 'idle';
      default:
        return NPC_ANIMATORS[this.def.animator].first;
    }
  }

  /** ObjPerson(New).UpdateLookAnimation (+ ObjShopkeeper's random delay when dtMs > 0). */
  private updateLook(link: { x: number; y: number }, dtMs: number): void {
    if (this.def.animation) return; // fixed animation (ObjPersonNew animationName)
    const dx = link.x - this.x;
    const dy = link.y - (this.y - 4);
    const dir = Math.hypot(dx, dy) < LOOK_RANGE || dtMs > 0 ? lookDirection(dx, dy) : 3;
    if (dir === this.lastDir) return;
    if (dtMs > 0) {
      this.lookTimer -= dtMs;
      if (this.lookTimer > 0) return;
      this.lookTimer = Math.random() < 0.5 ? rand(0, 250) : rand(1500, 2500);
    }
    const id = this.anim.has(`stand_${dir}`) ? `stand_${dir}` : `stand_${dy < 0 ? 1 : 3}`;
    this.anim.play(id);
    this.lastDir = dir;
  }

  /** ObjGrandmother.Update: turns toward Link when he stands in the 16x48 box on her facing side. */
  private updateLookSide(link: { x: number; y: number }): void {
    const box = { x: this.x - 16 * this.side - 8, y: this.y - 32, w: 16, h: 48 };
    if (Collision.intersects(Collision.getPlayerCollisionBox(link.x, link.y), box)) {
      this.side = this.x < link.x ? 1 : -1;
      this.anim.play(`stand_${this.side}`);
    }
  }

  /** ObjBowWowSmall / ObjDog / ObjBowWow idle-walk loop with hops (gravity -0.15 / -0.175 per frame). */
  private updateHop(dtMs: number, walls: Rect[]): void {
    const steps = dtMs / (1000 / 60);
    const chained = this.stake !== null;
    this.stateTimer -= dtMs;
    if (this.stateTimer <= 0) {
      if (this.state === 'idle') this.startWalk();
      else this.stopWalk();
    }

    // vertical hop
    if (this.state === 'walk' && this.z <= 0) this.vz = chained ? 1.25 : 0.85;
    this.z = Math.max(0, this.z + this.vz * steps);
    this.vz -= (chained ? 0.175 : 0.15) * steps;
    if (this.z <= 0) this.vz = 0;

    // horizontal move, bouncing off walls (OnCollision halves and reverses the velocity)
    const b = this.def.body;
    const box = (x: number, y: number) => ({ x: x + b.x, y: y + b.y, w: b.w, h: b.h });
    const nx = this.x + this.vx * steps;
    if (!Collision.collidesWithAny(box(nx, this.y), walls) && nx > 4 && nx < 156) this.x = nx;
    else if (this.vx !== 0) {
      this.vx = -this.vx * 0.5;
      this.playWalk();
    }
    const ny = this.y + this.vy * steps;
    if (!Collision.collidesWithAny(box(this.x, ny), walls) && ny > 12 && ny < 126) this.y = ny;
    else this.vy = -this.vy * 0.5;

    if (this.stake) this.applyChain();
  }

  private startWalk(): void {
    this.state = 'walk';
    const chained = this.stake !== null;
    const rotation = rand(0, Math.PI * 2);
    // ObjBowWow: 1..1.6 px/frame for 500-1000 ms; ObjDog 0.4-0.55; ObjBowWowSmall 0.5-0.8
    const speed = chained ? rand(25, 40) / 25 : this.def.animator === 'dog' ? rand(0.4, 0.55) : rand(25, 40) / 50;
    this.vx = Math.cos(rotation) * speed;
    this.vy = Math.sin(rotation) * speed;
    this.stateTimer = chained ? rand(500, 1000) : rand(750, 1500);
    this.playWalk();
  }

  private stopWalk(): void {
    this.state = 'idle';
    this.vx = 0;
    this.vy = 0;
    this.stateTimer = rand(500, 1500);
    if (this.anim.has(`idle_${this.hopDir}`)) this.anim.play(`idle_${this.hopDir}`);
  }

  private playWalk(): void {
    if (this.stake) {
      this.hopDir = lookDirection(this.vx, this.vy);
      this.anim.play(`walk_${this.hopDir}`);
      return;
    }
    // ObjBowWowSmall walk_0 / walk_1 and ObjDog idle_0 / idle_1 face left / right
    this.hopDir = this.vx < 0 ? 0 : 1;
    this.anim.play(this.anim.has('walk_0') ? `walk_${this.hopDir}` : `idle_${this.hopDir}`);
  }

  /** ObjBowWow.UpdatePosition: past 46 px from the stake the chain pulls BowWow back. */
  private applyChain(): void {
    const s = this.stake!;
    const dx = this.x - s.x;
    const dy = this.y - 4 - s.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= CHAIN_RADIUS) return;
    this.x = s.x + (dx / dist) * CHAIN_RADIUS;
    this.y = s.y + (dy / dist) * CHAIN_RADIUS + 4;
    this.vx = -this.vx * 0.5;
    this.vy = -this.vy * 0.5;
  }

  private renderChain(ctx: CanvasRenderingContext2D, sheet: HTMLImageElement): void {
    // ObjChain: links spread evenly between the stake and BowWow's neck, sagging with his hop height
    const s = this.stake!;
    for (let i = 1; i <= CHAIN_LINKS; i++) {
      const t = i / (CHAIN_LINKS + 1);
      const lx = s.x + (this.x - s.x) * t;
      const ly = s.y + (this.y - 4 - s.y) * t - this.z * t;
      ctx.drawImage(sheet, CHAIN_SPRITE.x, CHAIN_SPRITE.y, CHAIN_SPRITE.w, CHAIN_SPRITE.h,
        Math.round(lx - CHAIN_SPRITE.ox), Math.round(ly - CHAIN_SPRITE.oy), CHAIN_SPRITE.w, CHAIN_SPRITE.h);
    }
  }

  /** ObjBallGame: the ball flies between the children; the receiver hops and throws it back. */
  private updateBall(dtMs: number): void {
    const b = this.ball;
    const steps = dtMs / (1000 / 60);
    if (this.z > 0 || this.vz > 0) {
      this.z = Math.max(0, this.z + this.vz * steps);
      this.vz -= 0.15 * steps;
    }
    if (b.pause > 0) {
      b.pause -= dtMs;
      if (b.pause <= 0) {
        // ToThrowJump: the catcher throws, new random arc (StartThrow)
        const r = rand(1, 2);
        b.time = r * 300;
        b.height = r * 6;
        b.dir = -b.dir;
        (b.dir > 0 ? this.anim : this.partner!).play('throw');
      }
      return;
    }
    b.t += (dtMs / b.time) * b.dir;
    if (b.t >= 1 || b.t <= 0) {
      b.t = Math.min(1, Math.max(0, b.t));
      // UpdateJump: the child the ball goes back to hops while the holder winds up (Velocity.Z = 1)
      b.jumper = b.t >= 1 ? 0 : 1;
      this.vz = 1;
      b.pause = rand(100, 200) + rand(500, 750);
    }
  }

  private renderBall(ctx: CanvasRenderingContext2D, sheet: HTMLImageElement): void {
    const b = this.ball;
    // ObjBallGame: _ballStart (x + 13, y + 15) -> _ballEnd (x + 51, y + 15), height 3 + sin * throwHeight
    const bx = this.def.x + 13 + 38 * b.t;
    const by = this.def.y + 15;
    const h = 3 + Math.sin(b.t * Math.PI) * b.height;
    this.renderShadow(ctx, bx, by, 2);
    // sprite offset (-w/2, -h) above the ground point
    ctx.drawImage(sheet, BALL_SPRITE.x, BALL_SPRITE.y, BALL_SPRITE.w, BALL_SPRITE.h,
      Math.round(bx - 3), Math.round(by - 6 - h), BALL_SPRITE.w, BALL_SPRITE.h);
  }

  private renderShadow(ctx: CanvasRenderingContext2D, x: number, y: number, rx = 4.5): void {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(Math.round(x), Math.round(y), rx, rx / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/** Faces Link toward a point (used before an NPC conversation). */
export function faceToward(player: { x: number; y: number; direction: number }, x: number, y: number): void {
  player.direction = directionOf(x - player.x, y - 4 - (player.y - 3));
}
