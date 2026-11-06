/**
 * Global progression state: the 26 story flags of
 * docs/la_dx_knowledge_base/00_GAME_SYSTEMS_AND_STATE_MACHINE.md, opened chests,
 * dungeon keys, counters and inventory. Persisted to localStorage on every change.
 */

export const GAME_FLAGS = [
  'FLAG_SHIELD_OBTAINED',
  'FLAG_SWORD_OBTAINED',
  'FLAG_TAIL_KEY_OBTAINED',
  'FLAG_DUNGEON_1_COMPLETED',
  'FLAG_BOWWOW_KIDNAPPED',
  'FLAG_BOWWOW_RESCUED',
  'FLAG_DUNGEON_2_COMPLETED',
  'FLAG_RICHARD_LEAVES_OBTAINED',
  'FLAG_SLIME_KEY_OBTAINED',
  'FLAG_DUNGEON_3_COMPLETED',
  'FLAG_OCARINA_OBTAINED',
  'FLAG_WALRUS_AWAKENED',
  'FLAG_ANGLER_KEY_OBTAINED',
  'FLAG_DUNGEON_4_COMPLETED',
  'FLAG_GHOST_ESCORT_COMPLETED',
  'FLAG_DUNGEON_5_COMPLETED',
  'FLAG_COLOR_DUNGEON_COMPLETED',
  'FLAG_FACE_KEY_OBTAINED',
  'FLAG_DUNGEON_6_COMPLETED',
  'FLAG_FLYING_ROOSTER_REVIVED',
  'FLAG_BIRD_KEY_OBTAINED',
  'FLAG_DUNGEON_7_COMPLETED',
  'FLAG_TURTLE_ROCK_AWAKENED',
  'FLAG_DUNGEON_8_COMPLETED',
  'FLAG_EGG_OPENED',
  'FLAG_NIGHTMARES_DEFEATED'
] as const;
export type GameFlag = (typeof GAME_FLAGS)[number];

export const ITEM_IDS = [
  'shield',
  'sword',
  'powder',
  'feather',
  'bracelet',
  'bombs',
  'bow',
  'hookshot',
  'ocarina',
  'rod',
  'boomerang',
  'boots',
  'shovel',
  'flippers'
] as const;
export type ItemId = (typeof ITEM_IDS)[number];

export const INSTRUMENT_COUNT = 8;
export const MIN_MAX_HEARTS = 3;
export const MAX_MAX_HEARTS = 14;
export const MAX_RUPEES = 999;

/** Where Link respawns after loading or GAME OVER (last door crossed). */
export interface RespawnPoint {
  room: string;
  x: number;
  y: number;
  direction: number;
}

interface SaveData {
  version: 1;
  flags: GameFlag[];
  openedChests: string[];
  dungeonKeys: Record<string, number>;
  rupees: number;
  seashells: number;
  heartPieces: number;
  goldenLeaves: number;
  maxHearts: number;
  healthQuarters: number;
  inventory: ItemId[];
  equippedA: ItemId | null;
  equippedB: ItemId | null;
  instruments: number;
  respawn: RespawnPoint | null;
}

export const SAVE_KEY = 'zelda_la_save_v1';

const clampInt = (v: unknown, min: number, max: number, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.max(min, Math.min(max, Math.floor(v))) : fallback;

const clampNum = (v: unknown, min: number, max: number, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.max(min, Math.min(max, v)) : fallback;

const isItem = (v: unknown): v is ItemId => typeof v === 'string' && (ITEM_IDS as readonly string[]).includes(v);
const isFlag = (v: unknown): v is GameFlag => typeof v === 'string' && (GAME_FLAGS as readonly string[]).includes(v);

export class GameState {
  private flags = new Set<GameFlag>();
  private openedChests = new Set<string>();
  private dungeonKeys = new Map<string, number>();
  private inventory = new Set<ItemId>();

  public rupees = 0;
  public seashells = 0;
  public heartPieces = 0; // 0..3, a 4th piece converts into +1 max heart
  public goldenLeaves = 0;
  public maxHearts = MIN_MAX_HEARTS;
  public healthQuarters = MIN_MAX_HEARTS * 4;
  public equippedA: ItemId | null = null;
  public equippedB: ItemId | null = null;
  public instruments = 0; // bitmask of the 8 Siren Instruments
  public respawn: RespawnPoint | null = null;

  private listeners: (() => void)[] = [];
  private readonly storage: Storage | null;

  constructor(storage: Storage | null = GameState.defaultStorage()) {
    this.storage = storage;
  }

  private static defaultStorage(): Storage | null {
    try {
      return typeof localStorage !== 'undefined' ? localStorage : null;
    } catch {
      return null; // Storage disabled (privacy mode / sandboxed iframe)
    }
  }

  public onChange(listener: () => void): void {
    this.listeners.push(listener);
  }

  // --- Flags ---------------------------------------------------------------
  public hasFlag(flag: GameFlag): boolean {
    return this.flags.has(flag);
  }

  public setFlag(flag: GameFlag): void {
    if (this.flags.has(flag)) return;
    this.flags.add(flag);
    this.commit();
  }

  // --- Chests (key = `${roomId}:${chestId}`) --------------------------------
  public isChestOpened(roomId: string, chestId: string): boolean {
    return this.openedChests.has(`${roomId}:${chestId}`);
  }

  public markChestOpened(roomId: string, chestId: string): void {
    this.openedChests.add(`${roomId}:${chestId}`);
    this.commit();
  }

  // --- Dungeon small keys ---------------------------------------------------
  public getKeys(dungeonId: string): number {
    return this.dungeonKeys.get(dungeonId) ?? 0;
  }

  public addKey(dungeonId: string, delta: number = 1): void {
    this.dungeonKeys.set(dungeonId, Math.max(0, this.getKeys(dungeonId) + delta));
    this.commit();
  }

  // --- Counters -------------------------------------------------------------
  public addRupees(delta: number): void {
    this.rupees = Math.max(0, Math.min(MAX_RUPEES, this.rupees + delta));
    this.commit();
  }

  public addHeartPiece(): void {
    this.heartPieces++;
    if (this.heartPieces >= 4) {
      this.heartPieces = 0;
      this.addHeartContainer();
      return;
    }
    this.commit();
  }

  public addHeartContainer(): void {
    this.maxHearts = Math.min(MAX_MAX_HEARTS, this.maxHearts + 1);
    this.healthQuarters = this.maxHearts * 4;
    this.commit();
  }

  /** Positive heals, negative damages. Returns the remaining health in quarters. */
  public changeHealth(deltaQuarters: number): number {
    this.healthQuarters = Math.max(0, Math.min(this.maxHearts * 4, this.healthQuarters + deltaQuarters));
    this.commit();
    return this.healthQuarters;
  }

  public setRespawn(point: RespawnPoint): void {
    this.respawn = { ...point };
    this.commit();
  }

  // --- Inventory --------------------------------------------------------------
  public hasItem(item: ItemId): boolean {
    return this.inventory.has(item);
  }

  public getItems(): ItemId[] {
    return ITEM_IDS.filter((id) => this.inventory.has(id));
  }

  /** Adds an item and auto-equips it to the first free button (B first, like the original). */
  public addItem(item: ItemId): void {
    const isNew = !this.inventory.has(item);
    this.inventory.add(item);
    if (isNew) {
      if (!this.equippedB) this.equippedB = item;
      else if (!this.equippedA) this.equippedA = item;
    }
    this.commit();
  }

  /** Assigns an owned item to A or B; swaps if it is already on the other button. */
  public equip(button: 'A' | 'B', item: ItemId): void {
    if (!this.inventory.has(item)) return;
    const other = button === 'A' ? this.equippedB : this.equippedA;
    const current = button === 'A' ? this.equippedA : this.equippedB;
    if (other === item) {
      if (button === 'A') this.equippedB = current;
      else this.equippedA = current;
    }
    if (button === 'A') this.equippedA = item;
    else this.equippedB = item;
    this.commit();
  }

  public hasInstrument(index: number): boolean {
    return (this.instruments & (1 << index)) !== 0;
  }

  public addInstrument(index: number): void {
    if (index < 0 || index >= INSTRUMENT_COUNT) return;
    this.instruments |= 1 << index;
    this.commit();
  }

  // --- Persistence --------------------------------------------------------------
  private commit(): void {
    this.save();
    for (const l of this.listeners) l();
  }

  public toJSON(): SaveData {
    return {
      version: 1,
      flags: [...this.flags],
      openedChests: [...this.openedChests],
      dungeonKeys: Object.fromEntries(this.dungeonKeys),
      rupees: this.rupees,
      seashells: this.seashells,
      heartPieces: this.heartPieces,
      goldenLeaves: this.goldenLeaves,
      maxHearts: this.maxHearts,
      healthQuarters: this.healthQuarters,
      inventory: [...this.inventory],
      equippedA: this.equippedA,
      equippedB: this.equippedB,
      instruments: this.instruments,
      respawn: this.respawn
    };
  }

  public save(): void {
    if (!this.storage) return;
    try {
      this.storage.setItem(SAVE_KEY, JSON.stringify(this.toJSON()));
    } catch (e) {
      console.warn('Save failed (storage full or unavailable)', e);
    }
  }

  /** Loads the save if present and valid. Returns true when a save was restored. */
  public load(isKnownRoom: (roomId: string) => boolean): boolean {
    if (!this.storage) return false;
    let raw: unknown;
    try {
      const text = this.storage.getItem(SAVE_KEY);
      if (!text) return false;
      raw = JSON.parse(text);
    } catch {
      console.warn('Corrupted save ignored');
      return false;
    }
    if (!raw || typeof raw !== 'object' || (raw as { version?: unknown }).version !== 1) return false;
    this.applySave(raw as Record<string, unknown>, isKnownRoom);
    for (const l of this.listeners) l();
    return true;
  }

  /** Copies only validated fields from untrusted save data. */
  private applySave(d: Record<string, unknown>, isKnownRoom: (roomId: string) => boolean): void {
    const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
    this.flags = new Set(arr(d.flags).filter(isFlag));
    this.openedChests = new Set(
      arr(d.openedChests).filter((c): c is string => typeof c === 'string' && c.length <= 128)
    );
    this.dungeonKeys = new Map();
    if (d.dungeonKeys && typeof d.dungeonKeys === 'object') {
      for (const [k, v] of Object.entries(d.dungeonKeys as Record<string, unknown>)) {
        if (k.length <= 32) this.dungeonKeys.set(k, clampInt(v, 0, 99, 0));
      }
    }
    this.rupees = clampInt(d.rupees, 0, MAX_RUPEES, 0);
    this.seashells = clampInt(d.seashells, 0, 99, 0);
    this.heartPieces = clampInt(d.heartPieces, 0, 3, 0);
    this.goldenLeaves = clampInt(d.goldenLeaves, 0, 5, 0);
    this.maxHearts = clampInt(d.maxHearts, MIN_MAX_HEARTS, MAX_MAX_HEARTS, MIN_MAX_HEARTS);
    this.healthQuarters = clampInt(d.healthQuarters, 1, this.maxHearts * 4, this.maxHearts * 4);
    this.inventory = new Set(arr(d.inventory).filter(isItem));
    this.equippedA = isItem(d.equippedA) && this.inventory.has(d.equippedA) ? d.equippedA : null;
    this.equippedB = isItem(d.equippedB) && this.inventory.has(d.equippedB) ? d.equippedB : null;
    this.instruments = clampInt(d.instruments, 0, (1 << INSTRUMENT_COUNT) - 1, 0);

    const r = d.respawn as Partial<RespawnPoint> | null | undefined;
    this.respawn =
      r && typeof r.room === 'string' && isKnownRoom(r.room)
        ? {
            room: r.room,
            x: clampNum(r.x, 0, 160, 80),
            y: clampNum(r.y, 8, 128, 64),
            direction: clampInt(r.direction, 0, 3, 3)
          }
        : null;
  }

  /** Wipes the save and resets every field to a new game. */
  public reset(): void {
    try {
      this.storage?.removeItem(SAVE_KEY);
    } catch {
      // ignore
    }
    this.applySave({}, () => false);
    for (const l of this.listeners) l();
  }
}
