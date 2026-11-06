import { Input } from '../core/Input';
import { Collision } from '../core/Collision';
import { SoundManager } from '../core/Audio';
import { GroundKind, GroundZone, Rect } from '../data/rooms';
import { ANIMATIONS, AnimationDef, AnimationFrame } from '../data/animations';
import { renderEquippedShield, renderItemGetOverhead, ShieldPose } from './PlayerShieldRender';
import { GameState } from '../core/GameState';
import {
  DROWN_HIDDEN_MS,
  DROWN_SINK_MS,
  GROUND_SPEED,
  HAZARD_DAMAGE_QUARTERS,
  HOLE_FALL_MS,
  WADE_SOUND_INTERVAL_MS,
  groundAt,
  isSafeGround,
  renderGrassMask,
  renderRipple
} from './Ground';

export type PlayerState =
  | 'SLEEPING'
  | 'WAKING'
  | 'JUMPING_OUT'
  | 'IDLE'
  | 'WALKING'
  | 'ITEM_GET'
  | 'SWIMMING'
  | 'DROWNING'
  | 'FALLING_PIT';

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

  // Special ground (grass, water, stairs, holes) — see Ground.ts
  public ground: GroundKind | null = null;
  private hazardTimer: number = 0;
  private wadeTimer: number = 0;
  private groundTime: number = 0;
  private safeX: number = 56;
  private safeY: number = 51;

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
    this.safeX = newX;
    this.safeY = newY;
    this.ground = null;
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

  /** Hidden while drowned (between sinking and respawn), like the original. */
  public get isVisible(): boolean {
    return !(this.state === 'DROWNING' && this.hazardTimer >= DROWN_SINK_MS);
  }

  public update(
    dtMs: number,
    input: Input,
    colliders: Rect[],
    sound?: SoundManager,
    groundZones?: GroundZone[]
  ): void {
    this.groundTime += dtMs;
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
      case 'SWIMMING':
        this.updateMovement(input, colliders, sound, GROUND_SPEED[this.ground ?? 'hole']);
        this.updateGround(dtMs, groundZones, sound);
        break;

      case 'DROWNING':
      case 'FALLING_PIT':
        this.updateHazard(dtMs);
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

  /** Applies the ground Link stands on after moving (ObjLink.UpdateSwimming / OnHoleAbsorb). */
  private updateGround(dtMs: number, zones: GroundZone[] | undefined, sound?: SoundManager): void {
    const previous = this.ground;
    this.ground = groundAt(zones, this.x, this.y);

    if (this.ground === 'hole') {
      this.state = 'FALLING_PIT';
      this.hazardTimer = 0;
      this.isBlocking = false;
      sound?.playSfx('fall', 0.7);
      return;
    }

    if (this.ground === 'deepWater') {
      if (this.game.hasItem('flippers')) {
        if (this.state !== 'SWIMMING') sound?.playSfx('splash', 0.6);
        this.state = 'SWIMMING';
      } else {
        this.state = 'DROWNING';
        this.hazardTimer = 0;
        this.isBlocking = false;
        sound?.playSfx('drown', 0.7);
      }
      return;
    }
    if (this.state === 'SWIMMING') this.state = 'IDLE';

    if (this.ground === 'shallowWater' && this.state === 'WALKING') {
      this.wadeTimer += dtMs;
      if (this.wadeTimer >= WADE_SOUND_INTERVAL_MS || previous !== 'shallowWater') {
        this.wadeTimer = 0;
        sound?.playSfx('splash', 0.35);
      }
    }

    if (isSafeGround(this.ground)) {
      this.safeX = this.x;
      this.safeY = this.y;
    }
  }

  /** Drowning / falling: play out, then respawn at the last safe spot with 2 quarter-hearts damage. */
  private updateHazard(dtMs: number): void {
    this.hazardTimer += dtMs;
    const total = this.state === 'DROWNING' ? DROWN_SINK_MS + DROWN_HIDDEN_MS : HOLE_FALL_MS;
    if (this.hazardTimer < total) return;

    this.game.changeHealth(-HAZARD_DAMAGE_QUARTERS);
    this.x = this.safeX;
    this.y = this.safeY;
    this.ground = null;
    this.state = 'IDLE';
    this.updateIdleAnimation();
  }

  private updateMovement(input: Input, colliders: Rect[], sound?: SoundManager, groundSpeed: number = 1): void {
    const wasBlocking = this.isBlocking;
    this.isBlocking = this.hasShield && this.state !== 'SWIMMING' && input.isShieldHeld();
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
      const dx = vx * this.speed * blockSpeedFactor * groundSpeed;
      const dy = vy * this.speed * blockSpeedFactor * groundSpeed;

      const { newX, newY } = Collision.moveWithSlide(this.x, this.y, dx, dy, colliders);
      this.x = newX;
      this.y = newY;

      this.updateWalkAnimation();
    } else {
      this.state = 'IDLE';
      this.updateIdleAnimation();
    }
  }

  /** Keeps Link's walk cycle running while the engine moves him (screen scroll transitions). */
  public animateWalk(dtMs: number, direction: number): void {
    this.direction = direction;
    this.state = 'WALKING';
    this.isBlocking = false;
    this.updateWalkAnimation();
    this.updateAnimation(dtMs);
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
    if (!frame || !this.isVisible) return;

    if (this.state === 'FALLING_PIT' || this.state === 'DROWNING' || this.state === 'SWIMMING') {
      this.renderInHazard(ctx, spritesheet, frame);
      return;
    }

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
      renderEquippedShield(ctx, this.pose());
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
      renderEquippedShield(ctx, this.pose());
    }

    // If in ITEM_GET celebration pose, draw radiant golden rays + Shield held overhead
    if (this.state === 'ITEM_GET') {
      renderItemGetOverhead(ctx, this.pose());
    }

    if (this.ground === 'grass') renderGrassMask(ctx, this.x, this.y, this.animFrameIndex);
    if (this.ground === 'shallowWater') renderRipple(ctx, this.x, this.y, this.groundTime);
  }

  private pose(): ShieldPose {
    return {
      x: this.x,
      y: this.y,
      direction: this.direction,
      state: this.state,
      isBlocking: this.isBlocking,
      animFrameIndex: this.animFrameIndex,
      itemGetTimer: this.itemGetTimer
    };
  }

  /**
   * TEMP: the Ghibli spritesheet has no fall/drown/swim frames yet, so these states reuse the
   * current frame: shrink + fade into the pit, sink with ripples, or waist-deep while swimming.
   */
  private renderInHazard(ctx: CanvasRenderingContext2D, spritesheet: HTMLImageElement, frame: AnimationFrame): void {
    const renderW = frame.renderW ?? frame.w;
    const renderH = frame.renderH ?? frame.h;
    ctx.save();

    if (this.state === 'FALLING_PIT') {
      const t = Math.min(1, this.hazardTimer / HOLE_FALL_MS);
      const scale = 1 - 0.85 * t;
      ctx.globalAlpha = 1 - t * 0.8;
      ctx.translate(this.x, this.y - 4);
      ctx.scale(scale, scale);
      ctx.drawImage(spritesheet, frame.x, frame.y, frame.w, frame.h, -frame.originX, -frame.originY + 4, renderW, renderH);
      ctx.restore();
      return;
    }

    // Water: show the sprite above the waterline only (sinks while drowning)
    const sink = this.state === 'DROWNING' ? Math.min(1, this.hazardTimer / DROWN_SINK_MS) : 0;
    const visibleH = renderH * (this.state === 'SWIMMING' ? 0.62 : 0.62 * (1 - sink));
    const srcH = (visibleH / renderH) * frame.h;
    // The waterline stays at 62% of the sprite height; sinking slides the sprite down behind it
    const drawY = this.y - frame.originY + renderH * 0.62 * sink;
    if (visibleH > 0.5) {
      ctx.drawImage(spritesheet, frame.x, frame.y, frame.w, srcH, this.x - frame.originX, drawY, renderW, visibleH);
    }
    renderRipple(ctx, this.x, this.y - 2, this.groundTime);
    ctx.restore();
  }

}
