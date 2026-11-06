import { GameState, ItemId } from './GameState';
import { ImageCache } from './Images';
import {
  ITEM_SPRITES,
  UI_HEART,
  UI_HEART_STRIDE,
  UI_LETTER,
  UI_LETTER_STRIDE,
  UI_RUPEE,
  UI_SHEETS,
  UiSprite
} from '../data/uiSprites';

// Layout in native 160x128 logical pixels, mirroring `_ref_repo/InGame/Overlay/HUDOverlay.cs` of the HD
// remake: translucent cream boxes overlaid on the room (hearts top-left, rupees top-right, B/A slots bottom-left).
const MARGIN = 3;
const PAD = 2;
const HEARTS_PER_ROW = 7;
const BOX_COLOR = 'rgba(255, 255, 190, 0.55)';
const SLOT_W = 15;
const SLOT_H = 18;

/** Draws the classic heart meter, rupee counter and B/A item slots. Call inside the 8x scaled transform. */
export class HUD {
  // Hearts shown lag behind real health so damage/heal ticks quarter by quarter, like the original
  private shownQuarters = -1;
  private tickTimer = 0;

  constructor(
    private readonly game: GameState,
    private readonly images: ImageCache
  ) {}

  public preload(): Promise<void> {
    return this.images.loadAll([UI_SHEETS.ui, UI_SHEETS.items]);
  }

  public update(dtMs: number): void {
    if (this.shownQuarters < 0) this.shownQuarters = this.game.healthQuarters;
    this.tickTimer += dtMs;
    if (this.tickTimer < 40) return;
    this.tickTimer = 0;
    if (this.shownQuarters < this.game.healthQuarters) this.shownQuarters++;
    else if (this.shownQuarters > this.game.healthQuarters) this.shownQuarters--;
  }

  public render(ctx: CanvasRenderingContext2D, roomW: number, roomH: number): void {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    this.renderHearts(ctx);
    this.renderRupees(ctx, roomW);
    this.renderSlots(ctx, roomH);
    ctx.restore();
  }

  private renderHearts(ctx: CanvasRenderingContext2D): void {
    const max = this.game.maxHearts;
    const cols = Math.min(max, HEARTS_PER_ROW);
    const rows = Math.ceil(max / HEARTS_PER_ROW);
    const quarters = this.shownQuarters < 0 ? this.game.healthQuarters : this.shownQuarters;
    this.box(ctx, MARGIN, MARGIN, cols * (UI_HEART.w + 1) - 1 + PAD * 2, rows * (UI_HEART.h + 1) - 1 + PAD * 2);

    for (let i = 0; i < max; i++) {
      // Frame 0 = full ... 4 = empty (ItemDrawHelper.DrawHearts)
      const value = quarters - i * 4;
      const frame = value <= 0 ? 4 : value <= 3 ? 4 - value : 0;
      const x = MARGIN + PAD + (i % HEARTS_PER_ROW) * (UI_HEART.w + 1);
      const y = MARGIN + PAD + Math.floor(i / HEARTS_PER_ROW) * (UI_HEART.h + 1);
      this.sprite(ctx, UI_HEART, x, y, frame * UI_HEART_STRIDE);
    }
  }

  private renderRupees(ctx: CanvasRenderingContext2D, roomW: number): void {
    const w = UI_RUPEE.w + 1 + 3 * (UI_LETTER.w + 1) - 1 + PAD * 2;
    const x = roomW - MARGIN - w;
    this.box(ctx, x, MARGIN, w, UI_RUPEE.h + PAD * 2);
    this.sprite(ctx, UI_RUPEE, x + PAD, MARGIN + PAD);
    this.number(ctx, this.game.rupees, 3, x + PAD + UI_RUPEE.w + 1, MARGIN + PAD + 1);
  }

  private renderSlots(ctx: CanvasRenderingContext2D, roomH: number): void {
    const y = roomH - MARGIN - SLOT_H;
    this.slot(ctx, MARGIN, y, 'B', this.game.equippedB);
    this.slot(ctx, MARGIN + SLOT_W + 2, y, 'A', this.game.equippedA);
  }

  private slot(ctx: CanvasRenderingContext2D, x: number, y: number, label: string, item: ItemId | null): void {
    this.box(ctx, x, y, SLOT_W, SLOT_H);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.font = 'bold 5px monospace';
    ctx.textBaseline = 'top';
    ctx.fillText(label, x + 1.5, y + 1);
    if (!item) return;
    const s = ITEM_SPRITES[item];
    this.sprite(ctx, s, x + Math.round((SLOT_W - s.w) / 2) + 2, y + Math.round((SLOT_H - s.h) / 2));
  }

  /** Digits from the original "ui letter" strip (index 0 = "L-", 1..10 = 0..9), zero-padded. */
  private number(ctx: CanvasRenderingContext2D, value: number, length: number, x: number, y: number): void {
    const text = String(Math.max(0, Math.floor(value))).padStart(length, '0').slice(-length);
    for (let i = 0; i < text.length; i++) {
      const glyph = Number(text[i]) + 1;
      this.sprite(ctx, UI_LETTER, x + i * (UI_LETTER.w + 1), y, glyph * UI_LETTER_STRIDE, 'rgba(0,0,0,1)');
    }
  }

  private box(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
    ctx.fillStyle = BOX_COLOR;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 2);
    ctx.fill();
  }

  /** Draws a sprite; with `tint`, the sprite is recoloured (the original draws white digits tinted black). */
  private sprite(ctx: CanvasRenderingContext2D, s: UiSprite, x: number, y: number, offsetX = 0, tint?: string): void {
    const img = this.images.get(UI_SHEETS[s.sheet]);
    if (!img) return;
    if (!tint) {
      ctx.drawImage(img, s.x + offsetX, s.y, s.w, s.h, x, y, s.w, s.h);
      return;
    }
    const tinted = this.tinted(img, s, offsetX, tint);
    ctx.drawImage(tinted, x, y);
  }

  private tintCache = new Map<string, HTMLCanvasElement>();

  private tinted(img: HTMLImageElement, s: UiSprite, offsetX: number, tint: string): HTMLCanvasElement {
    const key = `${s.sheet}:${s.x + offsetX}:${s.y}:${tint}`;
    let c = this.tintCache.get(key);
    if (c) return c;
    c = document.createElement('canvas');
    c.width = s.w;
    c.height = s.h;
    const g = c.getContext('2d')!;
    g.drawImage(img, s.x + offsetX, s.y, s.w, s.h, 0, 0, s.w, s.h);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = tint;
    g.fillRect(0, 0, s.w, s.h);
    this.tintCache.set(key, c);
    return c;
  }
}
