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

export interface RoomDef {
  id: string;
  name: string;
  width: number;
  height: number;
  bgPixel: string;
  bgGhibli: string;
  fgPixel?: string;
  fgGhibli?: string;
  spawnPoint: { x: number; y: number; direction: number };
  warpTriggers: WarpTrigger[];
  colliders: Rect[];
  props: RoomProp[];
}
