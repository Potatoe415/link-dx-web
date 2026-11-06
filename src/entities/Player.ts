import { Input } from '../core/Input';
import { Collision } from '../core/Collision';
import { SoundManager } from '../core/Audio';
import { Rect } from '../data/rooms';
import { ANIMATIONS, AnimationDef, AnimationFrame } from '../data/animations';
import { GameState } from '../core/GameState';

export type PlayerState = 'SLEEPING' | 'WAKING' | 'JUMPING_OUT' | 'IDLE' | 'WALKING' | 'ITEM_GET';

export class Player {
  // Logical position (in 160x128 space, feet anchor)
  public x: number = 56;
  public y: number = 51;
  public z: number = 0; // Vertical height offset for jumping

  // 4-Way Direction: 0: Left, 1: Up, 2: Right, 3: Down
  public direction: number = 3;

  public state: PlayerState = 'SLEEPING';

  // Inventory lives in GameState; the player only reads it
  private readonly game: GameState;
  public isBlocking: boolean = false;
  private itemGetTimer: number = 0;

  // Animation controller
  private currentAnimKey: string = 'link_intro_sleep';
  private animTimer: number = 0;
  private animFrameIndex: number = 0;

  // Jump animation parameters
  private jumpStartX: number = 56;
  private jumpStartY: number = 51;
  private jumpTargetX: number = 68;
  private jumpTargetY: number = 55;
  private jumpProgress: number = 0;
  private readonly jumpDurationMs: number = 350; // Jump duration
  private readonly jumpMaxHeight: number = 10;  // Parabolic peak height

  // Awakening timer
  private wakeTimer: number = 0;
  private readonly wakeDurationMs: number = 700;

  // Movement speed: 1.0 logical pixel per frame at 60 FPS (60.0 px/s)
  public readonly speed: number = 1.0;

  constructor(game: GameState, startX: number = 56, startY: number = 51, initialDirection: number = 3) {
    this.game = game;
    this.x = startX;
    this.y = startY;
    this.direction = initialDirection;
    this.playAnimation('link_intro_sleep');
  }

  public get hasShield(): boolean {
    return this.game.hasItem('shield');
  }

  public teleport(newX: number, newY: number, newDir: number): void {
    this.x = newX;
    this.y = newY;
    this.z = 0;
    this.direction = newDir;
    this.state = 'IDLE';
    this.updateIdleAnimation();
  }

  public startItemGet(): void {
    this.isBlocking = false;
    this.state = 'ITEM_GET';
    this.direction = 3; // Face camera
    this.itemGetTimer = 0;
    this.updateIdleAnimation();
  }

  public finishItemGet(): void {
    if (this.state === 'ITEM_GET') {
      this.state = 'IDLE';
      this.updateIdleAnimation();
    }
  }

  public update(dtMs: number, input: Input, colliders: Rect[], sound?: SoundManager): void {
    switch (this.state) {
      case 'SLEEPING':
        this.updateSleeping(input, sound);
        break;

      case 'WAKING':
        this.updateWaking(dtMs, sound);
        break;

      case 'JUMPING_OUT':
        this.updateJumpingOut(dtMs, sound);
        break;

      case 'ITEM_GET':
        this.itemGetTimer += dtMs;
        break;

      case 'IDLE':
      case 'WALKING':
        this.updateMovement(input, colliders, sound);
        break;
    }

    this.updateAnimation(dtMs);
  }

  private updateSleeping(input: Input, sound?: SoundManager): void {
    // When any movement or action key is pressed, trigger awakening sequence
    if (input.hasAnyActionPressed() || input.getMovement().isMoving) {
      this.state = 'WAKING';
      this.wakeTimer = 0;
      this.playAnimation('link_intro_wake');
      sound?.playSfx('tap', 0.45);
    }
  }

  private updateWaking(dtMs: number, sound?: SoundManager): void {
    this.wakeTimer += dtMs;

    if (this.wakeTimer >= this.wakeDurationMs) {
      // Start parabolic jump out of the bed
      this.state = 'JUMPING_OUT';
      this.jumpProgress = 0;
      this.jumpStartX = this.x;
      this.jumpStartY = this.y;
      this.jumpTargetX = 82; // jump out to x=82 onto the clear red rug area (right of bed x=73)
      this.jumpTargetY = 56; // y=56 comfortably below Marin
      this.direction = 2; // Face right
      this.playAnimation('link_jump');
      sound?.playSfx('jump', 0.7);
    }
  }

  private updateJumpingOut(dtMs: number, sound?: SoundManager): void {
    this.jumpProgress += dtMs / this.jumpDurationMs;

    if (this.jumpProgress >= 1.0) {
      // Landing finished
      this.x = this.jumpTargetX;
      this.y = this.jumpTargetY;
      this.z = 0;
      this.state = 'IDLE';
      this.direction = 3; // Face down once landed
      this.updateIdleAnimation();
      sound?.playSfx('land', 0.7);
    } else {
      const t = this.jumpProgress;
      // Linear lerp for ground X and Y
      this.x = this.jumpStartX + (this.jumpTargetX - this.jumpStartX) * t;
      this.y = this.jumpStartY + (this.jumpTargetY - this.jumpStartY) * t;
      // Parabolic curve: 4 * H * t * (1 - t)
      this.z = 4 * this.jumpMaxHeight * t * (1 - t);
    }
  }

  private updateMovement(input: Input, colliders: Rect[], sound?: SoundManager): void {
    const wasBlocking = this.isBlocking;
    this.isBlocking = this.hasShield && input.isShieldHeld();
    if (!wasBlocking && this.isBlocking) {
      sound?.playSfx('shield', 0.65);
    }
    const move = input.getMovement();

    if (move.isMoving) {
      this.state = 'WALKING';
      // When holding the shield up, Link locks his facing direction (strafe) unless not blocking
      if (move.direction !== -1 && !this.isBlocking) {
        this.direction = move.direction;
      }

      // Normalized movement vector to ensure consistent speed
      let vx = move.dx;
      let vy = move.dy;
      if (vx !== 0 && vy !== 0) {
        // Diagonal movement on Game Boy is slightly slower or normalized
        const invSqrt2 = 0.70710678;
        vx *= invSqrt2;
        vy *= invSqrt2;
      }

      const blockSpeedFactor = this.isBlocking ? 0.75 : 1.0;
      const dx = vx * this.speed * blockSpeedFactor;
      const dy = vy * this.speed * blockSpeedFactor;

      const { newX, newY } = Collision.moveWithSlide(this.x, this.y, dx, dy, colliders);
      this.x = newX;
      this.y = newY;

      this.updateWalkAnimation();
    } else {
      this.state = 'IDLE';
      this.updateIdleAnimation();
    }
  }

  public syncIdleDirection(): void {
    this.updateIdleAnimation();
  }

  private updateIdleAnimation(): void {
    const anims: Record<number, string> = {
      0: 'link_idle_left',
      1: 'link_idle_up',
      2: 'link_idle_right',
      3: 'link_idle_down'
    };
    const key = anims[this.direction] || 'link_idle_down';
    if (this.currentAnimKey !== key) {
      this.playAnimation(key);
    }
  }

  private updateWalkAnimation(): void {
    const anims: Record<number, string> = {
      0: 'link_walk_left',
      1: 'link_walk_up',
      2: 'link_walk_right',
      3: 'link_walk_down'
    };
    const key = anims[this.direction] || 'link_walk_down';
    if (this.currentAnimKey !== key) {
      this.playAnimation(key);
    }
  }

  public playAnimation(key: string): void {
    if (ANIMATIONS[key]) {
      this.currentAnimKey = key;
      this.animTimer = 0;
      this.animFrameIndex = 0;
    }
  }

  private updateAnimation(dtMs: number): void {
    const def = ANIMATIONS[this.currentAnimKey];
    if (!def || def.frames.length <= 1) return;

    this.animTimer += dtMs;
    if (this.animTimer >= def.frameTime) {
      this.animTimer -= def.frameTime;
      if (this.animFrameIndex + 1 < def.frames.length) {
        this.animFrameIndex++;
      } else if (def.loop) {
        this.animFrameIndex = 0;
      }
    }
  }

  public getCurrentFrame(): AnimationFrame | null {
    const def = ANIMATIONS[this.currentAnimKey];
    if (!def || !def.frames[this.animFrameIndex]) return null;
    return def.frames[this.animFrameIndex];
  }

  /**
   * Render Link and his soft contact shadow
   */
  public render(ctx: CanvasRenderingContext2D, spritesheet: HTMLImageElement): void {
    const frame = this.getCurrentFrame();
    if (!frame) return;

    // In sleeping state, Link is rendered inside the bed frame without drop shadow
    const drawShadow = this.state !== 'SLEEPING' && this.state !== 'WAKING';

    if (drawShadow) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.beginPath();
      // Elliptical shadow at player's ground feet position
      ctx.ellipse(
        this.x,
        this.y,
        4.5,
        2.2,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
    }

    // Sprite position with vertical jump offset z (sub-pixel smooth on 1280x1024 canvas)
    const drawX = this.x - frame.originX;
    const drawY = this.y - frame.originY - this.z;

    const renderW = frame.renderW ?? frame.w;
    const renderH = frame.renderH ?? frame.h;

    // If facing UP (direction === 1) and carrying shield, draw shield behind Link's body
    if (this.hasShield && this.state !== 'ITEM_GET' && drawShadow && this.direction === 1) {
      this.renderEquippedShield(ctx);
    }

    ctx.drawImage(
      spritesheet,
      frame.x,
      frame.y,
      frame.w,
      frame.h,
      drawX,
      drawY,
      renderW,
      renderH
    );

    // If facing Left/Right/Down and carrying shield, draw shield in front of Link
    if (this.hasShield && this.state !== 'ITEM_GET' && drawShadow && this.direction !== 1) {
      this.renderEquippedShield(ctx);
    }

    // If in ITEM_GET celebration pose, draw radiant golden rays + Shield held overhead
    if (this.state === 'ITEM_GET') {
      this.renderItemGetOverhead(ctx);
    }
  }

  private renderEquippedShield(ctx: CanvasRenderingContext2D): void {
    const bob = this.state === 'WALKING' && (this.animFrameIndex % 2 === 0) ? -0.6 : 0;

    if (this.direction === 3) {
      // Facing Down: shield on Link's left-viewer side (his right arm), or centered if blocking
      const sx = this.isBlocking ? this.x + 1.0 : this.x - 4.2;
      const sy = (this.isBlocking ? this.y - 6.8 : this.y - 6.2) + bob;
      const scale = this.isBlocking ? 1.08 : 0.9;
      this.drawCocolintShield(ctx, sx, sy, scale, false);
    } else if (this.direction === 1) {
      // Facing Up: shield on right-viewer side (his right arm)
      const sx = this.isBlocking ? this.x : this.x + 4.2;
      const sy = (this.isBlocking ? this.y - 9.5 : this.y - 6.8) + bob;
      this.drawCocolintShield(ctx, sx, sy, 0.88, false);
    } else if (this.direction === 0) {
      // Facing Left: shield in profile on the left edge
      const sx = this.isBlocking ? this.x - 5.5 : this.x - 3.8;
      const sy = (this.isBlocking ? this.y - 7.2 : this.y - 6.2) + bob;
      this.drawCocolintShield(ctx, sx, sy, this.isBlocking ? 0.95 : 0.78, true);
    } else if (this.direction === 2) {
      // Facing Right: shield in profile on the right edge
      const sx = this.isBlocking ? this.x + 5.5 : this.x + 3.8;
      const sy = (this.isBlocking ? this.y - 7.2 : this.y - 6.2) + bob;
      this.drawCocolintShield(ctx, sx, sy, this.isBlocking ? 0.95 : 0.78, true);
    }
  }

  private renderItemGetOverhead(ctx: CanvasRenderingContext2D): void {
    const floatY = Math.sin(this.itemGetTimer * 0.006) * 1.2;
    const cx = this.x;
    const cy = this.y - 22 + floatY;

    ctx.save();

    // Rotating golden Ghibli sunburst behind the shield
    const angle = this.itemGetTimer * 0.0025;
    const numRays = 8;
    for (let i = 0; i < numRays; i++) {
      const a = angle + (i * Math.PI * 2) / numRays;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(a);
      const grad = ctx.createLinearGradient(0, 0, 0, -14);
      grad.addColorStop(0, 'rgba(253, 224, 71, 0.75)');
      grad.addColorStop(1, 'rgba(251, 191, 36, 0.0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(-1.8, 0);
      ctx.lineTo(1.8, 0);
      ctx.lineTo(0, -14);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Soft warm glow circle
    const radial = ctx.createRadialGradient(cx, cy, 1, cx, cy, 10);
    radial.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
    radial.addColorStop(0.6, 'rgba(245, 158, 11, 0.35)');
    radial.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = radial;
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fill();

    // Draw the shield large and clear overhead
    this.drawCocolintShield(ctx, cx, cy, 1.35, false);

    ctx.restore();
  }

  /**
   * Draws Link's wooden & iron Cocolint Shield in hand-painted style
   */
  private drawCocolintShield(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    scale: number,
    narrowProfile: boolean
  ): void {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(narrowProfile ? scale * 0.58 : scale, scale);

    const w = 3.4;
    const h = 4.4;

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    this.shieldPath(ctx, 0.3, 0.4, w, h);
    ctx.fill();

    // Outer metallic iron/gold rim
    const rimGrad = ctx.createLinearGradient(-w, -h, w, h);
    rimGrad.addColorStop(0, '#fde68a');
    rimGrad.addColorStop(0.5, '#d97706');
    rimGrad.addColorStop(1, '#78350f');
    ctx.fillStyle = rimGrad;
    this.shieldPath(ctx, 0, 0, w, h);
    ctx.fill();

    ctx.lineWidth = 0.45;
    ctx.strokeStyle = '#451a03';
    ctx.stroke();

    // Inner warm oak wood face
    const woodGrad = ctx.createLinearGradient(0, -h * 0.78, 0, h * 0.78);
    woodGrad.addColorStop(0, '#b45309');
    woodGrad.addColorStop(0.5, '#92400e');
    woodGrad.addColorStop(1, '#572407');
    ctx.fillStyle = woodGrad;
    this.shieldPath(ctx, 0, 0, w * 0.76, h * 0.76);
    ctx.fill();

    // Central golden Triforce/crest boss emblem
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(0, -1.6);
    ctx.lineTo(1.3, 0.4);
    ctx.lineTo(-1.3, 0.4);
    ctx.closePath();
    ctx.fill();

    // Boss highlight
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(0, 1.3, 0.55, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private shieldPath(ctx: CanvasRenderingContext2D, ox: number, oy: number, w: number, h: number): void {
    ctx.beginPath();
    ctx.moveTo(ox - w, oy - h * 0.85);
    ctx.quadraticCurveTo(ox, oy - h, ox + w, oy - h * 0.85);
    ctx.lineTo(ox + w, oy + h * 0.1);
    ctx.quadraticCurveTo(ox + w * 0.85, oy + h * 0.7, ox, oy + h);
    ctx.quadraticCurveTo(ox - w * 0.85, oy + h * 0.7, ox - w, oy + h * 0.1);
    ctx.closePath();
  }
}
