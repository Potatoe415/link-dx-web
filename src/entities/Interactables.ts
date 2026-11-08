import { ChestDef, GroundItemDef, InteractableDef, QuestKey, Rect, SignDef } from '../data/rooms';
import { GameFlag, GameState, ITEM_IDS, ItemId } from '../core/GameState';
import { SoundManager } from '../core/Audio';
import { DialogueSystem } from '../core/Dialogue';
import { ImageCache } from '../core/Images';
import { Player } from './Player';
import { ITEM_NAMES_FR, ITEM_SPRITES, TOADSTOOL_MAP_SPRITE, UI_SHEETS, UiSprite } from '../data/uiSprites';

const OBJECTS_SHEET = '/assets/ui/objects.png';

// Geometry from `_ref_repo` (ObjSignpost.cs / ObjChest.cs + objects.atlas), relative to the object origin
const SIGN_SPRITES: Record<'signpost_0' | 'signpost_1', { x: number; y: number }> = {
  signpost_0: { x: 395, y: 52 },
  signpost_1: { x: 412, y: 52 }
};
const CHEST_BACK = { x: 259, y: 51, w: 16, h: 7 };
const CHEST_FRONT = { x: 259, y: 58, w: 16, h: 9 };
const CHEST_OPEN_DX = 16; // opened lid frame is the next 16 px on the sheet
const CHEST_RISE_MS = 250; // ObjChest.MoveTime: item rises out of the chest
const HEART_PIECE_SPRITE = { x: 174, y: 73, w: 16, h: 15 }; // items.atlas heartMeter

// dialog_eng.lng dkey1..dkey5, French adaptation
const QUEST_KEYS: Record<QuestKey, { flag: GameFlag; text: string }> = {
  tail: { flag: 'FLAG_TAIL_KEY_OBTAINED', text: 'Vous obtenez la Clé Flagello ! Elle ouvre la grille de la Cave Flagello !' },
  slime: { flag: 'FLAG_SLIME_KEY_OBTAINED', text: 'Vous obtenez la Clé Gluante ! Elle ouvre la grille de la Prairie Ukuku !' },
  angler: { flag: 'FLAG_ANGLER_KEY_OBTAINED', text: 'Vous obtenez la Clé Poisson !' },
  face: { flag: 'FLAG_FACE_KEY_OBTAINED', text: 'Vous obtenez la Clé Visage !' },
  bird: { flag: 'FLAG_BIRD_KEY_OBTAINED', text: 'Vous obtenez la Clé Oiseau !' }
};

/** Logical-space collider of each interactable (walls for Link). */
export function interactableCollider(def: InteractableDef): Rect | null {
  if (def.kind === 'item') return null;
  if (def.kind === 'chest') return { x: def.x, y: def.y + 3, w: 16, h: 11 };
  return def.sprite ? { x: def.x, y: def.y + 4, w: 16, h: 12 } : null;
}

/** Box Link's facing probe must touch to interact. */
function interactBox(def: InteractableDef): Rect {
  if (def.kind === 'item') return { x: def.x + 3, y: def.y + 2, w: 10, h: 14 };
  if (def.kind === 'chest') return { x: def.x + 4, y: def.y + 3, w: 8, h: 13 };
  return def.sprite ? { x: def.x, y: def.y + 4, w: 16, h: 12 } : { x: def.x, y: def.y, w: 16, h: 16 };
}

const DIR_PROBE: Record<number, [number, number]> = { 0: [-6, -4], 1: [0, -11], 2: [6, -4], 3: [0, 3] };

/**
 * Signposts and treasure chests of the current room: draws them, blocks Link, and handles the
 * action key (reading, opening). Opened chests persist through GameState.openedChests.
 */
export class InteractableSystem {
  private defs: InteractableDef[] = [];
  private roomId = '';
  private rising: { chest: ChestDef; timer: number } | null = null;

  constructor(
    private readonly game: GameState,
    private readonly images: ImageCache,
    private readonly sound: SoundManager,
    private readonly dialogue: DialogueSystem
  ) {}

  public setRoom(roomId: string, defs: InteractableDef[] | undefined): void {
    this.roomId = roomId;
    this.defs = defs ?? [];
    this.rising = null;
    void this.images.load(OBJECTS_SHEET);
  }

  public colliders(): Rect[] {
    return this.defs.flatMap((d) => {
      const c = interactableCollider(d);
      return c ? [c] : [];
    });
  }

  /** True while a chest item is rising (Link is frozen like FreezePlayer in ObjChest). */
  public isBusy(): boolean {
    return this.rising !== null;
  }

  public update(dtMs: number): void {
    if (!this.rising) return;
    this.rising.timer += dtMs;
    if (this.rising.timer >= CHEST_RISE_MS) {
      const chest = this.rising.chest;
      this.rising = null;
      this.grant(chest);
    }
  }

  /** Called when the action key is pressed; returns true if something consumed it. */
  public tryInteract(player: Player): boolean {
    const [ox, oy] = DIR_PROBE[player.direction] ?? [0, 0];
    const px = player.x + ox;
    const py = player.y + oy;
    for (const def of this.defs) {
      const b = interactBox(def);
      if (px < b.x || px >= b.x + b.w || py < b.y || py >= b.y + b.h) continue;
      if (def.kind === 'sign') return this.read(def, player);
      if (def.kind === 'chest') return this.open(def, player);
    }
    return false;
  }

  /**
   * Ground items are picked up by walking onto them (ObjItem). Returns the item granted this frame so
   * the engine can run the ITEM_GET pose + fanfare.
   */
  public checkPickups(player: Player): GroundItemDef | null {
    const feet = { x: player.x - 4, y: player.y - 8, w: 8, h: 8 };
    for (const def of this.defs) {
      if (def.kind !== 'item' || this.game.isChestOpened(this.roomId, def.id)) continue;
      const b = interactBox(def);
      if (feet.x < b.x + b.w && feet.x + feet.w > b.x && feet.y < b.y + b.h && feet.y + feet.h > b.y) {
        this.game.markChestOpened(this.roomId, def.id); // shared "collected" set keyed by room + id
        return def;
      }
    }
    return null;
  }

  private read(sign: SignDef, player: Player): boolean {
    if (sign.requiredDirection !== undefined && player.direction !== sign.requiredDirection) return false;
    this.dialogue.startCustomDialogue('', sign.pages);
    return true;
  }

  private open(chest: ChestDef, player: Player): boolean {
    // Chests open from below only (Link facing Up), like the original
    if (player.direction !== 1 || this.isOpened(chest)) return false;
    this.game.markChestOpened(this.roomId, chest.id);
    this.sound.playSfx('chest_open', 0.7);
    this.rising = { chest, timer: 0 };
    return true;
  }

  private isOpened(chest: ChestDef): boolean {
    return this.game.isChestOpened(this.roomId, chest.id);
  }

  private grant(chest: ChestDef): void {
    const c = chest.contents;
    if (c.type === 'rupees') {
      this.game.addRupees(c.amount);
      this.sound.playSfx('treasure', 0.75);
      this.dialogue.startCustomDialogue('', [`Vous obtenez ${c.amount} Rubis !`]);
    } else if (c.type === 'key') {
      this.game.addKey(c.dungeon);
      this.sound.playSfx('treasure', 0.75);
      this.dialogue.startCustomDialogue('', ['Vous obtenez une Petite Clé ! Elle ouvre une porte verrouillée.']);
    } else if (c.type === 'questKey') {
      // ItemManager dkeyN: D368-16-10 fanfare (item_get) + key flag
      const key = QUEST_KEYS[c.key];
      this.game.setFlag(key.flag);
      this.sound.playSfx('item_get', 0.85);
      this.dialogue.startCustomDialogue('★ Objet Obtenu ★', [key.text]);
    } else if (c.type === 'heartPiece') {
      this.game.addHeartPiece();
      this.sound.playSfx('item_get', 0.85);
      this.dialogue.startCustomDialogue('', ["Vous obtenez un Quart de Cœur ! Réunissez-en 4 pour gagner un cœur."]);
    } else if ((ITEM_IDS as readonly string[]).includes(c.item)) {
      const item = c.item as ItemId;
      this.game.addItem(item);
      this.sound.playSfx('item_get', 0.85);
      this.dialogue.startCustomDialogue('★ Objet Obtenu ★', [`Vous obtenez : ${ITEM_NAMES_FR[item]} !`]);
    }
  }

  /** Draws the back of chests / signposts (before Link) — call in the Y-sorted pass. */
  public renderables(ctx: CanvasRenderingContext2D): { y: number; render: () => void }[] {
    const img = this.images.get(OBJECTS_SHEET);
    if (!img) return [];
    const out: { y: number; render: () => void }[] = [];
    for (const def of this.defs) {
      if (def.kind === 'item') {
        if (this.game.isChestOpened(this.roomId, def.id)) continue;
        // The beach sword lies in the sand, tip down (sword1 sprite); heart pieces use heartMeter (items.atlas)
        const s = def.item === 'sword' ? ITEM_SPRITES.sword : def.item === 'toadstool' ? TOADSTOOL_MAP_SPRITE : HEART_PIECE_SPRITE;
        const items = this.images.get(UI_SHEETS.items);
        const dx = 8 - s.w / 2;
        out.push({ y: def.y + 14, render: () => items && ctx.drawImage(items, s.x, s.y, s.w, s.h, def.x + dx, def.y + 16 - s.h, s.w, s.h) });
        continue;
      }
      if (def.kind === 'sign') {
        const sprite = def.sprite;
        if (!sprite) continue;
        const s = SIGN_SPRITES[sprite];
        // ObjSignpost: sprite origin (8, 15) anchored at (x + 8, y + 16)
        out.push({ y: def.y + 16, render: () => ctx.drawImage(img, s.x, s.y, 16, 15, def.x, def.y + 1, 16, 15) });
        continue;
      }
      const dx = this.isOpened(def) ? CHEST_OPEN_DX : 0;
      out.push({
        y: def.y + 13,
        render: () => {
          ctx.drawImage(img, CHEST_BACK.x + dx, CHEST_BACK.y, CHEST_BACK.w, CHEST_BACK.h, def.x, def.y, CHEST_BACK.w, CHEST_BACK.h);
          ctx.drawImage(img, CHEST_FRONT.x + dx, CHEST_FRONT.y, CHEST_FRONT.w, CHEST_FRONT.h, def.x, def.y + 7, CHEST_FRONT.w, CHEST_FRONT.h);
          if (this.rising?.chest === def) this.renderRisingItem(ctx, def);
        }
      });
    }
    return out;
  }

  private renderRisingItem(ctx: CanvasRenderingContext2D, chest: ChestDef): void {
    const t = Math.min(1, (this.rising?.timer ?? 0) / CHEST_RISE_MS);
    const lift = Math.sin((t * Math.PI) / 1.55) * 10; // ObjChest.OpeningTick
    const c = chest.contents;
    const sprite: UiSprite =
      c.type === 'item' && (ITEM_IDS as readonly string[]).includes(c.item)
        ? ITEM_SPRITES[c.item as ItemId]
        : { sheet: 'items', x: 126, y: 38, w: 7, h: 14 }; // rubyBlue (rupees / keys / heart piece placeholder)
    const img = this.images.get(UI_SHEETS[sprite.sheet]);
    if (!img) return;
    ctx.drawImage(img, sprite.x, sprite.y, sprite.w, sprite.h, chest.x + 8 - sprite.w / 2, chest.y - lift - sprite.h + 8, sprite.w, sprite.h);
  }
}
