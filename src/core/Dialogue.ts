import { PropInstance } from '../entities/Prop';
import { Player } from '../entities/Player';
import { SoundManager } from './Audio';
import { GameState } from './GameState';

export class DialogueSystem {
  private sound?: SoundManager;
  private active: boolean = false;
  private speakerName: string = '';
  private pages: string[] = [];
  private currentPageIndex: number = 0;

  // Typewriter effect state
  private visibleChars: number = 0;
  private readonly charsPerSecond: number = 48;
  private blinkTimer: number = 0;

  // Tracks how many times the player has talked to each NPC id
  private talkCounts: Map<string, number> = new Map();
  private onCloseCallback: (() => void) | null = null;

  private readonly game: GameState;

  constructor(game: GameState, sound?: SoundManager) {
    this.game = game;
    this.sound = sound;
  }

  public isOpen(): boolean {
    return this.active;
  }

  /**
   * Finds the closest talkable NPC within interaction range of Link
   */
  public findNearbyNPC(player: Player, props: PropInstance[]): PropInstance | null {
    if (player.state !== 'IDLE' && player.state !== 'WALKING') {
      return null;
    }

    // Offset slightly in the direction Link is facing to favor NPCs in front of him
    const dirOffsets: Record<number, { dx: number; dy: number }> = {
      0: { dx: -6, dy: 0 }, // Left
      1: { dx: 0, dy: -6 }, // Up
      2: { dx: 6, dy: 0 },  // Right
      3: { dx: 0, dy: 6 }   // Down
    };
    const offset = dirOffsets[player.direction] ?? { dx: 0, dy: 0 };
    const probeX = player.x + offset.dx;
    const probeY = player.y - 3 + offset.dy;

    let bestProp: PropInstance | null = null;
    let bestDist = Infinity;

    for (const prop of props) {
      if (!prop.data.dialogues || prop.data.dialogues.length === 0) continue;

      // Center of the NPC (slightly above their feet anchor)
      const npcX = prop.data.x;
      const npcY = prop.data.y - 4;

      const distFromProbe = Math.hypot(probeX - npcX, probeY - npcY);
      const distFromBody = Math.hypot(player.x - npcX, (player.y - 3) - npcY);
      const effectiveDist = Math.min(distFromProbe, distFromBody);

      if (effectiveDist <= 22 && effectiveDist < bestDist) {
        bestDist = effectiveDist;
        bestProp = prop;
      }
    }

    return bestProp;
  }

  /**
   * Starts a custom dialogue sequence with an optional callback on close
   */
  public startCustomDialogue(
    speakerName: string,
    pages: string[],
    onClose?: () => void
  ): void {
    this.speakerName = speakerName;
    this.pages = pages;
    this.currentPageIndex = 0;
    this.visibleChars = 0;
    this.blinkTimer = 0;
    this.onCloseCallback = onClose ?? null;
    this.active = true;
  }

  /**
   * Starts a conversation with the given NPC prop
   */
  public startDialogue(prop: PropInstance, player: Player): void {
    const dialogues = prop.data.dialogues;
    if (!dialogues || dialogues.length === 0) return;

    const isTarinGivingShield = prop.data.id === 'tarin' && !player.hasShield;

    const count = this.talkCounts.get(prop.data.id) ?? 0;
    const conversation = isTarinGivingShield
      ? dialogues[0]
      : dialogues[Math.min(count, dialogues.length - 1)];
    this.talkCounts.set(prop.data.id, count + 1);

    const isMarinSinging = prop.data.id === 'marin' && count >= 1;
    if (isMarinSinging) {
      this.sound?.playMusic('marin_sing');
    }

    // Make Link face the NPC he is talking to
    const dx = prop.data.x - player.x;
    const dy = (prop.data.y - 4) - (player.y - 3);
    if (Math.abs(dx) > Math.abs(dy)) {
      player.direction = dx < 0 ? 0 : 2;
    } else {
      player.direction = dy < 0 ? 1 : 3;
    }
    player.state = 'IDLE';
    player.syncIdleDirection();

    this.startCustomDialogue(
      prop.data.speakerName || prop.data.name,
      conversation,
      isTarinGivingShield
        ? () => {
            // Trigger iconic Zelda "Item Get" pose with the Shield held overhead + original fanfare!
            this.game.addItem('shield');
            this.game.setFlag('FLAG_SHIELD_OBTAINED');
            player.startItemGet();
            this.sound?.playSfx('item_get', 0.85);
            this.startCustomDialogue(
              '★ Objet Obtenu ★',
              [
                'Vous récupérez votre Bouclier (Niv. 1) ! Maintenez [Shift] ou [X] pour lever votre bouclier et vous protéger !'
              ],
              () => {
                player.finishItemGet();
              }
            );
          }
        : isMarinSinging
        ? () => {
            this.sound?.playMusic('indoor');
          }
        : undefined
    );
  }

  /**
   * Advances typewriter or moves to the next dialogue page
   */
  public onInteractPressed(): void {
    if (!this.active) return;

    const currentText = this.pages[this.currentPageIndex] || '';
    if (this.visibleChars < currentText.length) {
      // Instantly reveal the rest of the current page
      this.visibleChars = currentText.length;
      this.sound?.playSfx('text_done', 0.55);
      return;
    }

    // Advance to next page or close dialogue
    if (this.currentPageIndex + 1 < this.pages.length) {
      this.currentPageIndex++;
      this.visibleChars = 0;
      this.sound?.playSfx('cursor', 0.55);
    } else {
      this.active = false;
      this.sound?.playSfx('cursor', 0.55);
      if (this.onCloseCallback) {
        const cb = this.onCloseCallback;
        this.onCloseCallback = null;
        cb();
      }
    }
  }

  public update(dtMs: number): void {
    this.blinkTimer += dtMs;
    if (!this.active) return;

    const currentText = this.pages[this.currentPageIndex] || '';
    if (this.visibleChars < currentText.length) {
      const prevChars = this.visibleChars;
      this.visibleChars = Math.min(
        currentText.length,
        this.visibleChars + (dtMs / 1000) * this.charsPerSecond
      );
      if (Math.floor(this.visibleChars / 4) > Math.floor(prevChars / 4)) {
        this.sound?.playSfx('text_letter', 0.42);
      }
      if (prevChars < currentText.length && this.visibleChars >= currentText.length) {
        this.sound?.playSfx('text_done', 0.55);
      }
    }
  }

  /**
   * Renders a floating speech bubble prompt above an NPC when Link is close enough to talk
   * (Called inside the 1280x1024 screen-space pass for crisp UI rendering)
   */
  public renderProximityIndicator(
    ctx: CanvasRenderingContext2D,
    npc: PropInstance | null,
    scale: number
  ): void {
    if (this.active || !npc) return;

    const bobOffset = Math.sin(this.blinkTimer * 0.006) * 4;
    const screenX = npc.data.x * scale;
    const screenY = (npc.data.y - 24) * scale + bobOffset;

    ctx.save();

    // Draw pill badge above NPC head
    const badgeW = 136;
    const badgeH = 32;
    const bx = screenX - badgeW / 2;
    const by = screenY - badgeH;

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    this.roundRect(ctx, bx + 2, by + 3, badgeW, badgeH, 10);
    ctx.fill();

    // Main dark-slate background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    this.roundRect(ctx, bx, by, badgeW, badgeH, 10);
    ctx.fill();

    // Gold border
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fbbf24';
    this.roundRect(ctx, bx, by, badgeW, badgeH, 10);
    ctx.stroke();

    // Pointer triangle at bottom center of badge
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(screenX - 6, by + badgeH);
    ctx.lineTo(screenX + 6, by + badgeH);
    ctx.lineTo(screenX, by + badgeH + 7);
    ctx.closePath();
    ctx.fill();

    // Text label
    ctx.fillStyle = '#fef3c7';
    ctx.font = 'bold 15px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💬 [Espace] Parler', screenX, by + badgeH / 2);

    ctx.restore();
  }

  /**
   * Renders the Link's Awakening / Studio Ghibli dialogue box at the bottom of the 1280x1024 canvas
   */
  public renderDialogueBox(ctx: CanvasRenderingContext2D, canvasW: number, canvasH: number): void {
    if (!this.active) return;

    const boxW = 1040;
    const boxH = 190;
    const boxX = (canvasW - boxW) / 2;
    const boxY = canvasH - boxH - 36;

    ctx.save();

    // Outer shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.roundRect(ctx, boxX + 6, boxY + 8, boxW, boxH, 16);
    ctx.fill();

    // Main dialogue window background (deep Link's Awakening DX navy/charcoal)
    const grad = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxH);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
    grad.addColorStop(1, 'rgba(9, 13, 28, 0.97)');
    ctx.fillStyle = grad;
    this.roundRect(ctx, boxX, boxY, boxW, boxH, 16);
    ctx.fill();

    // Outer warm gold frame
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#f59e0b';
    this.roundRect(ctx, boxX, boxY, boxW, boxH, 16);
    ctx.stroke();

    // Inner ivory hairline border
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(254, 243, 199, 0.45)';
    this.roundRect(ctx, boxX + 7, boxY + 7, boxW - 14, boxH - 14, 11);
    ctx.stroke();

    // Speaker Nameplate Pill
    if (this.speakerName) {
      ctx.font = 'bold 21px "Segoe UI", system-ui, sans-serif';
      const measuredW = ctx.measureText(this.speakerName).width;
      const plateW = Math.max(180, measuredW + 44);
      const plateH = 40;
      const plateX = boxX + 32;
      const plateY = boxY - plateH / 2;

      ctx.fillStyle = '#1e293b';
      this.roundRect(ctx, plateX, plateY, plateW, plateH, 10);
      ctx.fill();

      ctx.lineWidth = 3;
      ctx.strokeStyle = '#fbbf24';
      this.roundRect(ctx, plateX, plateY, plateW, plateH, 10);
      ctx.stroke();

      ctx.fillStyle = '#fde68a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.speakerName, plateX + plateW / 2, plateY + plateH / 2 + 1);
    }

    // Dialogue Body Text (Typewriter substring + word wrap)
    const fullText = this.pages[this.currentPageIndex] || '';
    const shownText = fullText.slice(0, Math.floor(this.visibleChars));

    ctx.fillStyle = '#f8fafc';
    ctx.font = '500 26px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const textX = boxX + 42;
    const textY = boxY + 42;
    const maxTextW = boxW - 84;
    const lineHeight = 38;

    this.drawWrappedText(ctx, shownText, textX, textY, maxTextW, lineHeight);

    // Bottom-right prompt / blinking advance cursor when page typing is finished
    const isPageComplete = this.visibleChars >= fullText.length;
    if (isPageComplete) {
      const bounce = Math.sin(this.blinkTimer * 0.008) * 4;
      const cursorX = boxX + boxW - 42;
      const cursorY = boxY + boxH - 32 + bounce;

      // Bouncing golden triangle
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(cursorX - 10, cursorY - 8);
      ctx.lineTo(cursorX + 10, cursorY - 8);
      ctx.lineTo(cursorX, cursorY + 6);
      ctx.closePath();
      ctx.fill();

      // Page indicator & key hint
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 16px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const pageLabel = `${this.currentPageIndex + 1}/${this.pages.length} · [Espace / Entrée]`;
      ctx.fillText(pageLabel, cursorX - 22, boxY + boxH - 28);
    }

    ctx.restore();
  }

  private drawWrappedText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ): void {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let i = 0; i < words.length; i++) {
      const testLine = line ? `${line} ${words[i]}` : words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line) {
        ctx.fillText(line, x, currentY);
        line = words[i];
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line) {
      ctx.fillText(line, x, currentY);
    }
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}
