import { Camera, ScrollDirection } from './Camera';
import { ROOMS, RoomDef, RoomNeighbors } from '../data/rooms';
import { Player } from '../entities/Player';
import { PropInstance } from '../entities/Prop';

const NEIGHBOR_KEYS: Record<ScrollDirection, keyof RoomNeighbors> = { 0: 'west', 1: 'north', 2: 'east', 3: 'south' };
const SCROLL_DURATION_MS = 350;
const SCROLL_PUSH_PX = 8; // Link walks this far into the new screen during the scroll, like on Game Boy

export interface PendingScroll {
  direction: ScrollDirection;
  nextKey: string;
  nextProps: PropInstance[];
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

/**
 * Edge-of-screen transitions between overworld/dungeon neighbors (RoomDef.neighbors).
 * Walking past an edge scrolls to the registered neighbor; edges without one act as walls.
 */
export class ScreenScroll {
  public pending: PendingScroll | null = null;

  constructor(
    private readonly camera: Camera,
    private readonly onArrive: (roomKey: string, props: PropInstance[], x: number, y: number) => void
  ) {}

  /** Link's 8x8 feet box must stay within [0, width] x [0, height]. Returns true when a scroll started. */
  public checkEdges(room: RoomDef, player: Player): boolean {
    const { width, height } = room;
    let direction: ScrollDirection | null = null;
    if (player.x < 4) direction = 0;
    else if (player.x > width - 4) direction = 2;
    else if (player.y < 8) direction = 1;
    else if (player.y > height) direction = 3;
    if (direction === null) return false;

    const nextKey = room.neighbors?.[NEIGHBOR_KEYS[direction]];
    if (!nextKey || !ROOMS[nextKey]) {
      player.x = Math.max(4, Math.min(width - 4, player.x));
      player.y = Math.max(8, Math.min(height, player.y));
      return false;
    }
    this.start(room, player, direction, nextKey);
    return true;
  }

  private start(room: RoomDef, player: Player, direction: ScrollDirection, nextKey: string): void {
    const next = ROOMS[nextKey];
    // World-continuous position in the next room, pushed a few pixels inward
    let toX = Math.max(4, Math.min(next.width - 4, player.x));
    let toY = Math.max(8, Math.min(next.height, player.y));
    if (direction === 0) toX = player.x + next.width - SCROLL_PUSH_PX;
    if (direction === 2) toX = player.x - room.width + SCROLL_PUSH_PX;
    if (direction === 1) toY = player.y + next.height - SCROLL_PUSH_PX;
    if (direction === 3) toY = player.y - room.height + SCROLL_PUSH_PX;
    if (player.state === 'JUMPING') {
      // Mid ledge hop: arrive exactly on the jump goal, carried over into the next room
      const { targetX, targetY } = player.ledge;
      toX = direction === 0 ? targetX + next.width : direction === 2 ? targetX - room.width : targetX;
      toY = direction === 1 ? targetY + next.height : direction === 3 ? targetY - room.height : targetY;
    }

    this.pending = {
      direction,
      nextKey,
      nextProps: next.props.map((pr) => new PropInstance(pr)),
      fromX: player.x,
      fromY: player.y,
      toX,
      toY
    };
    this.camera.startScroll(direction, () => this.finish(), SCROLL_DURATION_MS);
  }

  private finish(): void {
    const s = this.pending;
    if (!s) return;
    this.pending = null;
    this.onArrive(s.nextKey, s.nextProps, s.toX, s.toY);
  }

  /**
   * During a scroll Link is drawn over both screens in current-room coordinates: he moves from his
   * exit point to where his entry point will appear once the next room has slid fully into view.
   */
  public update(dtMs: number, room: RoomDef, player: Player): void {
    const s = this.pending;
    if (!s) return;
    const t = this.camera.getScrollProgress();
    const endX = s.direction === 0 ? s.toX - room.width : s.direction === 2 ? s.toX + room.width : s.toX;
    const endY = s.direction === 1 ? s.toY - room.height : s.direction === 3 ? s.toY + room.height : s.toY;
    const off = this.camera.getScrollOffsets(room.width, room.height);
    player.x = s.fromX + (endX - s.fromX) * t + off.current.x;
    player.y = s.fromY + (endY - s.fromY) * t + off.current.y;
    if (player.state === 'JUMPING') player.animateLedgeJump(dtMs);
    else player.animateWalk(dtMs, s.direction);
  }
}
