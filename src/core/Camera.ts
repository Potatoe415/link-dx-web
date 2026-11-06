export type TransitionState = 'NONE' | 'FADING_OUT' | 'FADING_IN';

export class Camera {
  private fadeAlpha: number = 0;
  private transitionState: TransitionState = 'NONE';
  private transitionDuration: number = 300; // 300ms fade transition
  private transitionTimer: number = 0;
  private onMidTransitionCallback: (() => void) | null = null;

  public isTransitioning(): boolean {
    return this.transitionState !== 'NONE';
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
   * Update transition timers each frame (dt in milliseconds)
   */
  public update(dtMs: number): void {
    if (this.transitionState === 'NONE') return;

    this.transitionTimer += dtMs;
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
