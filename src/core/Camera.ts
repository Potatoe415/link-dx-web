export type TransitionState = 'NONE' | 'FADING_OUT' | 'FADING_IN' | 'SCROLLING';

/** Screen edge crossed during a scroll: 0: West (Left), 1: North (Up), 2: East (Right), 3: South (Down). */
export type ScrollDirection = 0 | 1 | 2 | 3;

export class Camera {
  private fadeAlpha: number = 0;
  private transitionState: TransitionState = 'NONE';
  private transitionDuration: number = 300; // 300ms fade transition
  private transitionTimer: number = 0;
  private onMidTransitionCallback: (() => void) | null = null;

  // Scroll transition state
  private scrollDirection: ScrollDirection = 0;
  private scrollProgress: number = 0;
  private onScrollEndCallback: (() => void) | null = null;

  public isTransitioning(): boolean {
    return this.transitionState !== 'NONE';
  }

  public isScrolling(): boolean {
    return this.transitionState === 'SCROLLING';
  }

  public getFadeAlpha(): number {
    return this.fadeAlpha;
  }

  /**
   * Start a smooth fade-to-black and fade-in transition
   */
  public startTransition(onMidTransition: () => void, durationMs: number = 300): void {
    if (this.isTransitioning()) return;

    this.transitionDuration = durationMs;
    this.transitionTimer = 0;
    this.transitionState = 'FADING_OUT';
    this.onMidTransitionCallback = onMidTransition;
  }

  /**
   * Start a continuous Game Boy style screen scroll toward a neighbor room.
   * The caller renders both rooms using getScrollOffsets() until onEnd fires.
   */
  public startScroll(direction: ScrollDirection, onEnd: () => void, durationMs: number = 350): void {
    if (this.isTransitioning()) return;

    this.scrollDirection = direction;
    this.scrollProgress = 0;
    this.transitionDuration = durationMs;
    this.transitionTimer = 0;
    this.transitionState = 'SCROLLING';
    this.onScrollEndCallback = onEnd;
  }

  public getScrollDirection(): ScrollDirection {
    return this.scrollDirection;
  }

  /** Scroll progress in [0, 1]. */
  public getScrollProgress(): number {
    return this.scrollProgress;
  }

  /**
   * Logical (160x128) offsets of the current and next room for the current scroll progress.
   * The current room slides out the crossed edge while the next one slides in from the opposite edge.
   */
  public getScrollOffsets(roomW: number, roomH: number): { current: { x: number; y: number }; next: { x: number; y: number } } {
    const t = this.scrollProgress;
    const dx = this.scrollDirection === 0 ? 1 : this.scrollDirection === 2 ? -1 : 0;
    const dy = this.scrollDirection === 1 ? 1 : this.scrollDirection === 3 ? -1 : 0;
    // Snap to whole logical pixels like the Game Boy, avoiding sub-pixel seams between the two screens
    const cx = Math.round(dx * roomW * t);
    const cy = Math.round(dy * roomH * t);
    return {
      current: { x: cx, y: cy },
      next: { x: cx - dx * roomW, y: cy - dy * roomH }
    };
  }

  /**
   * Update transition timers each frame (dt in milliseconds)
   */
  public update(dtMs: number): void {
    if (this.transitionState === 'NONE') return;

    this.transitionTimer += dtMs;

    if (this.transitionState === 'SCROLLING') {
      this.scrollProgress = Math.min(1.0, this.transitionTimer / this.transitionDuration);
      if (this.scrollProgress >= 1.0) {
        this.transitionState = 'NONE';
        const cb = this.onScrollEndCallback;
        this.onScrollEndCallback = null;
        cb?.();
      }
      return;
    }

    const halfDuration = this.transitionDuration / 2;

    if (this.transitionState === 'FADING_OUT') {
      const progress = Math.min(1.0, this.transitionTimer / halfDuration);
      this.fadeAlpha = progress;

      if (progress >= 1.0) {
        // Blackout reached: execute teleportation callback
        if (this.onMidTransitionCallback) {
          this.onMidTransitionCallback();
          this.onMidTransitionCallback = null;
        }
        // Switch to fading back in
        this.transitionState = 'FADING_IN';
        this.transitionTimer = 0;
      }
    } else if (this.transitionState === 'FADING_IN') {
      const progress = Math.min(1.0, this.transitionTimer / halfDuration);
      this.fadeAlpha = 1.0 - progress;

      if (progress >= 1.0) {
        this.fadeAlpha = 0;
        this.transitionState = 'NONE';
      }
    }
  }

  /**
   * Draw the black fade overlay onto the canvas
   */
  public renderFade(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    if (this.fadeAlpha > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeAlpha.toFixed(3)})`;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }
  }
}
