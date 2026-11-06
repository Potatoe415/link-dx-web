import { GameState, ITEM_IDS, ItemId, INSTRUMENT_COUNT } from './GameState';
import { ImageCache } from './Images';
import { Input } from './Input';
import { SoundManager } from './Audio';
import {
  INSTRUMENT_NAMES_FR,
  INSTRUMENT_SPRITE,
  ITEM_NAMES_FR,
  ITEM_SPRITES,
  UI_SHEETS,
  UiSprite
} from '../data/uiSprites';

const COLS = 4;
const ROWS = Math.ceil(ITEM_IDS.length / COLS);

/**
 * Inventory sub-menu (Tab / I): grid of every item slot, owned items can be assigned to A (Space / J)
 * or B (Shift / X / K), plus the 8 Siren Instruments. Pauses the game while open.
 * Drawn in 1280x1024 screen space so French text stays crisp.
 */
export class InventoryMenu {
  private open = false;
  private cursor = 0;

  constructor(
    private readonly game: GameState,
    private readonly images: ImageCache,
    private readonly sound: SoundManager
  ) {}

  public isOpen(): boolean {
    return this.open;
  }

  public toggle(): void {
    this.open = !this.open;
    this.sound.playSfx(this.open ? 'menu_open' : 'menu_close', 0.6);
  }

  public update(input: Input): void {
    if (!this.open) return;

    const dir = input.getDirectionJustPressed();
    if (dir !== -1) {
      const col = this.cursor % COLS;
      const row = Math.floor(this.cursor / COLS);
      const nc = dir === 0 ? (col + COLS - 1) % COLS : dir === 2 ? (col + 1) % COLS : col;
      const nr = dir === 1 ? (row + ROWS - 1) % ROWS : dir === 3 ? (row + 1) % ROWS : row;
      this.cursor = Math.min(ITEM_IDS.length - 1, nr * COLS + nc);
      this.sound.playSfx('cursor', 0.45);
    }

    const item = ITEM_IDS[this.cursor];
    const button = input.wasButtonAJustPressed() ? 'A' : input.wasButtonBJustPressed() ? 'B' : null;
    if (button && this.game.hasItem(item)) {
      this.game.equip(button, item);
      this.sound.playSfx('menu_select', 0.6);
    }
  }

  public render(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    if (!this.open) return;
    const S = 8; // logical -> screen scale
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // Backdrop + parchment panel
    ctx.fillStyle = 'rgba(8, 10, 24, 0.72)';
    ctx.fillRect(0, 0, w, h);
    const px = 80;
    const py = 64;
    const pw = w - px * 2;
    const ph = h - py * 2;
    ctx.fillStyle = 'rgba(255, 248, 220, 0.96)';
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(px, py, pw, ph, 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#451a03';
    ctx.textBaseline = 'top';
    ctx.font = 'bold 44px Georgia, serif';
    ctx.fillText('Inventaire', px + 48, py + 32);

    // Equipped slots (top right)
    this.renderEquipped(ctx, px + 48 + 2 * 150, py + 24); // above grid columns 3-4

    // Item grid
    const cell = 150;
    const gx = px + 48;
    const gy = py + 130;
    ITEM_IDS.forEach((id, i) => {
      const cx = gx + (i % COLS) * cell;
      const cy = gy + Math.floor(i / COLS) * cell;
      const owned = this.game.hasItem(id);
      ctx.fillStyle = owned ? 'rgba(180, 83, 9, 0.12)' : 'rgba(0, 0, 0, 0.05)';
      ctx.beginPath();
      ctx.roundRect(cx, cy, cell - 16, cell - 16, 14);
      ctx.fill();
      if (owned) this.drawSprite(ctx, ITEM_SPRITES[id], cx + (cell - 16) / 2, cy + (cell - 16) / 2, S);
      if (this.game.equippedA === id || this.game.equippedB === id) {
        ctx.fillStyle = '#b45309';
        ctx.font = 'bold 26px monospace';
        ctx.fillText(this.game.equippedA === id ? 'A' : 'B', cx + 10, cy + 8);
      }
      if (i === this.cursor) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.roundRect(cx - 4, cy - 4, cell - 8, cell - 8, 16);
        ctx.stroke();
      }
    });

    // Selected item name + help
    const sel = ITEM_IDS[this.cursor];
    ctx.fillStyle = '#451a03';
    ctx.font = 'bold 32px Georgia, serif';
    const label = this.game.hasItem(sel) ? ITEM_NAMES_FR[sel] : '— (pas encore obtenu)';
    ctx.fillText(label, gx, gy + ROWS * cell + 4);
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#78350f';
    ctx.fillText('[Espace]/[J] : bouton A   ·   [Maj]/[X]/[K] : bouton B   ·   [Tab]/[I] : fermer', gx, gy + ROWS * cell + 48);

    // Instruments column
    this.renderInstruments(ctx, gx + COLS * cell + 40, gy);
    ctx.restore();
  }

  private renderEquipped(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    (['B', 'A'] as const).forEach((btn, i) => {
      const bx = x + i * 150;
      ctx.fillStyle = 'rgba(180, 83, 9, 0.15)';
      ctx.beginPath();
      ctx.roundRect(bx, y, 130, 90, 14);
      ctx.fill();
      ctx.fillStyle = '#451a03';
      ctx.font = 'bold 30px monospace';
      ctx.fillText(btn, bx + 12, y + 10);
      const item: ItemId | null = btn === 'A' ? this.game.equippedA : this.game.equippedB;
      if (item) this.drawSprite(ctx, ITEM_SPRITES[item], bx + 82, y + 45, 5);
    });
  }

  private renderInstruments(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = '#451a03';
    ctx.font = 'bold 28px Georgia, serif';
    ctx.fillText('Instruments des Sirènes', x, y - 46);
    for (let i = 0; i < INSTRUMENT_COUNT; i++) {
      const cx = x + (i % 2) * 150;
      const cy = y + Math.floor(i / 2) * 150;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.beginPath();
      ctx.arc(cx + 64, cy + 64, 60, 0, Math.PI * 2);
      ctx.fill();
      if (this.game.hasInstrument(i)) {
        this.drawSprite(ctx, INSTRUMENT_SPRITE(i), cx + 64, cy + 64, 6);
      } else {
        ctx.fillStyle = 'rgba(69, 26, 3, 0.35)';
        ctx.font = 'bold 40px Georgia, serif';
        ctx.fillText(String(i + 1), cx + 52, cy + 42);
      }
    }
    const owned = INSTRUMENT_NAMES_FR.filter((_, i) => this.game.hasInstrument(i));
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#78350f';
    ctx.fillText(`${owned.length} / ${INSTRUMENT_COUNT}`, x, y + 4 * 150 + 4);
  }

  /** Draws a sprite centred on (cx, cy) at an integer scale. */
  private drawSprite(ctx: CanvasRenderingContext2D, s: UiSprite, cx: number, cy: number, scale: number): void {
    const img = this.images.get(UI_SHEETS[s.sheet]);
    if (!img) return;
    ctx.drawImage(img, s.x, s.y, s.w, s.h, Math.round(cx - (s.w * scale) / 2), Math.round(cy - (s.h * scale) / 2), s.w * scale, s.h * scale);
  }
}
