export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WarpTrigger {
  triggerBox: Rect;
  targetRoom: string;
  targetX: number;
  targetY: number;
  targetDirection: number; // 0: Left, 1: Up, 2: Right, 3: Down
  requiredDirection?: number; // If set, Link must be facing this direction to trigger the warp
}

export interface RoomProp {
  id: string;
  name: string;
  x: number;
  y: number;
  animation: string;
  collision?: Rect;
  zIndex?: number; // 0: ground, 10: player level, 20: above player
  speakerName?: string;
  dialogues?: string[][]; // Array of conversations (each conversation is an array of pages)
}

/** Special ground (MapStates.FieldStates + ObjSlow/ObjHole in `_ref_repo`). */
export type GroundKind = 'grass' | 'shallowWater' | 'deepWater' | 'stairs' | 'hole';

export interface GroundZone extends Rect {
  kind: GroundKind;
}

/** Readable signpost (ObjSignpost): text shown when Link faces it and presses the action key. */
export interface SignDef {
  kind: 'sign';
  id: string;
  x: number; // map object origin (top-left of the 16x16 cell), logical px
  y: number;
  pages: string[]; // French copy
  requiredDirection?: number; // ObjSignpost direction (1 = must face Up); undefined = any
  sprite?: 'signpost_0' | 'signpost_1'; // undefined = invisible text trigger ("sign" objects)
}

/** Treasure chest (ObjChest): opened from below, item recorded in GameState.openedChests. */
export interface ChestDef {
  kind: 'chest';
  id: string;
  x: number;
  y: number;
  contents: ChestContents;
}

export type ChestContents =
  | { type: 'rupees'; amount: number }
  | { type: 'item'; item: string }
  | { type: 'key'; dungeon: string }
  | { type: 'questKey'; key: QuestKey }
  | { type: 'heartPiece' };

/** Overworld keys that open a dungeon (ItemManager.cs dkey1..dkey5). */
export type QuestKey = 'tail' | 'slime' | 'angler' | 'face' | 'bird';

/** Item lying on the ground (ObjItem), picked up on touch; `saveKey` keeps it collected. */
export interface GroundItemDef {
  kind: 'item';
  id: string;
  x: number; // map object origin (16x16 cell top-left)
  y: number;
  item: 'sword' | 'heartPiece' | 'toadstool'; // extend as more ground items are ported
}

export type InteractableDef = SignDef | ChestDef | GroundItemDef;

/** Cuttable bush (solid) or tall grass (walkable) from ObjBush; regrows when the room is re-entered. */
export interface CuttableDef {
  kind: 'bush' | 'grass';
  x: number; // map object origin (16x16 cell top-left)
  y: number;
  sprite: string; // objects.atlas sprite id
}

/**
 * Ledge jump field (ObjJump): walking into the rect in the offset's direction hops Link over the
 * ledge collider by (offsetX, offsetY). height / speed are ObjJump multipliers (default 1).
 */
export interface JumpDef extends Rect {
  offsetX: number;
  offsetY: number;
  height?: number;
  speed?: number;
  ignoreCollision?: boolean; // land even if the goal overlaps a wall
}

/** Push block (ObjMoveStone): solid 16x16 cell Link can slide one tile at a time. */
export interface MoveStoneDef {
  x: number; // map object origin (16x16 cell top-left)
  y: number;
  sprite: string; // objects.atlas sprite id (movestone_0..3)
  directions: number; // allowed push directions bitmask (bit 0 left, 1 up, 2 right, 3 down); -1 = any
}

/** Music track key understood by SoundManager.playMusic. */
import type { MusicTrack } from '../../core/Audio';
export type RoomMusic = MusicTrack;
/** Ambient particle style (ParticleSystem). */
export type RoomAmbience = 'indoor' | 'outdoor' | 'none';

/** Rooms reached by walking off each screen edge (continuous scroll transition). */
export interface RoomNeighbors {
  north?: string;
  south?: string;
  east?: string;
  west?: string;
}

export interface RoomDef {
  id: string;
  name: string;
  width: number;
  height: number;
  bgPixel: string;
  bgGhibli: string;
  fgPixel?: string;
  fgGhibli?: string;
  music: RoomMusic;
  ambience: RoomAmbience;
  // Edges without a registered neighbor act as walls.
  neighbors?: RoomNeighbors;
  spawnPoint: { x: number; y: number; direction: number };
  warpTriggers: WarpTrigger[];
  colliders: Rect[];
  groundZones?: GroundZone[];
  interactables?: InteractableDef[];
  cuttables?: CuttableDef[];
  // Enemies spawned each time the room is entered (feet anchor, logical px); kinds in src/data/enemies.ts
  enemies?: { kind: string; x: number; y: number }[];
  // Walls that only enemies respect (ObjCollider NPCWall, `enemyWall`)
  enemyWalls?: Rect[];
  // Push blocks (ObjMoveStone), reset when the room is re-entered
  moveStones?: MoveStoneDef[];
  // Ledge jump fields (ObjJump)
  jumps?: JumpDef[];
  props: RoomProp[];
}
