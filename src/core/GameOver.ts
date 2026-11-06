import { ImageCache } from './Images';
import { Input } from './Input';
import { UI_GAME_OVER, UI_SHEETS } from '../data/uiSprites';

/**
 * GAME OVER flow from `_ref_repo/InGame/GameSystems/GameOverSystem.cs` + `Pages/GameOverPage.cs`:
 * Link spins for 850 ms, the screen dims over 500 ms (DyingTime), then the GAME OVER banner shows
 * until the player presses the action key to continue (respawn at the last door crossed).
 */
const SPIN_MS = 850;
const DIM_MS = 500;

export class GameOverScreen {
  private active = false;
  private timer = 0;

  constructor(private readonly images: ImageCache) {}

  public isActive(): boolean {
    return this.active;
  }

  public start(): void {
    this.active = true;
    this.timer = 0;
  }

  /** Returns true on the frame the player chooses to continue. */
  public update(dtMs: number, input: Input): boolean {
    if (!this.active) return false;
    this.timer += dtMs;
    if (this.timer >= SPIN_MS + DIM_MS && input.wasInteractJustPressed()) {
      this.active = false;
      return true;
    }
    return false;
  }

  /** Dims the room (drawn before Link so he stays visible on top, like DrawPlayerOnTopPercentage). */
  public renderDim(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    if (!this.active) return;
    const t = Math.min(1, Math.max(0, (this.timer - SPIN_MS) / DIM_MS));
    if (t <= 0) return;
    ctx.fillStyle = `rgba(0, 0, 0, ${(0.85 * t).toFixed(3)})`;
    ctx.fillRect(0, 0, w, h);
  }

  /** Banner + prompt in 1280x1024 screen space. */
  public renderBanner(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    if (!this.active || this.timer < SPIN_MS + DIM_MS) return;
    const img = this.images.get(UI_SHEETS.ui);
    const s = UI_GAME_OVER;
    const scale = 8;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    if (img) {
      ctx.drawImage(img, s.x, s.y, s.w, s.h, Math.round(w / 2 - (s.w * scale) / 2), Math.round(h * 0.32), s.w * scale, s.h * scale);
    }
    ctx.fillStyle = '#fef3c7';
    ctx.font = 'bold 34px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Appuyez sur [Espace] pour continuer', w / 2, h * 0.32 + s.h * scale + 80);
    ctx.restore();
  }
}
