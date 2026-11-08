import { SoundManager } from '../core/Audio';
import { DialogueSystem } from '../core/Dialogue';
import { GameState } from '../core/GameState';
import { ImageCache } from '../core/Images';
import { Renderable } from '../core/RoomRenderer';
import { NPCS } from '../data/npcs';
import { Rect } from '../data/rooms';
import { Collision } from '../core/Collision';
import { Npc, faceToward } from './Npc';
import { NPCS_SHEET } from './Owl';
import { Player } from './Player';

const TALK_RANGE = 22; // same reach as DialogueSystem.findNearbyNPC
const DIR_PROBE: Record<number, [number, number]> = { 0: [-6, 0], 1: [0, -6], 2: [6, 0], 3: [0, 6] };

/**
 * NPCs of the current room (src/data/npcs.ts): updates, draws, blocks Link and starts their
 * conversations. Conversations cycle per NPC (or per shared `talkKey`) for the session, like the
 * `[set:n]` chains of scripts.zScript.
 */
export class NpcSystem {
  private npcs: Npc[] = [];
  private readonly talkCounts = new Map<string, number>();

  constructor(
    private readonly game: GameState,
    private readonly images: ImageCache,
    private readonly sound: SoundManager,
    private readonly dialogue: DialogueSystem
  ) {}

  public setRoom(roomId: string): void {
    this.npcs = (NPCS[roomId] ?? []).filter((d) => !d.requires || this.game.hasFlag(d.requires)).map((d) => new Npc(d));
    if (this.npcs.length) void this.images.load(NPCS_SHEET);
  }

  public colliders(): Rect[] {
    return this.npcs.flatMap((n) => n.colliders());
  }

  public update(dtMs: number, player: Player, walls: Rect[]): void {
    // Link's feet box counts as a wall so hopping dogs never walk into him
    const blocking = [...walls, Collision.getPlayerCollisionBox(player.x, player.y)];
    for (const npc of this.npcs) npc.update(dtMs, player, blocking);
  }

  public renderables(ctx: CanvasRenderingContext2D): Renderable[] {
    const sheet = this.images.get(NPCS_SHEET);
    if (!sheet) return [];
    return this.npcs.map((npc) => ({ y: npc.y, render: () => npc.render(ctx, sheet) }));
  }

  /** Talk anchor of the NPC Link would speak to (for the proximity badge), if any. */
  public nearby(player: Player): { x: number; y: number } | null {
    const hit = this.find(player);
    return hit ? hit.point : null;
  }

  /** Action key: starts the closest NPC's next conversation. */
  public tryTalk(player: Player): boolean {
    const hit = this.find(player);
    if (!hit) return false;
    const { npc, point } = hit;
    faceToward(player, point.x, point.y);
    player.state = 'IDLE';
    player.syncIdleDirection();
    if (npc.def.sfx) this.sound.playSfx(npc.def.sfx, 0.7);
    if (npc.def.onTalk) {
      return npc.def.onTalk({ game: this.game, npc, player, dialogue: this.dialogue, sound: this.sound });
    }
    const pages = npc.def.pages ?? [];
    if (!pages.length) return false;
    const key = npc.def.talkKey ?? npc.def.id;
    const count = this.talkCounts.get(key) ?? 0;
    this.talkCounts.set(key, count + 1);
    const conversation = pages[count % pages.length];
    this.dialogue.startCustomDialogue(npc.def.speaker ?? '', conversation);
    return true;
  }

  private find(player: Player): { npc: Npc; point: { x: number; y: number } } | null {
    if (player.state !== 'IDLE' && player.state !== 'WALKING') return null;
    const [ox, oy] = DIR_PROBE[player.direction] ?? [0, 0];
    let best: { npc: Npc; point: { x: number; y: number } } | null = null;
    let bestDist = TALK_RANGE;
    for (const npc of this.npcs) {
      if (!npc.def.pages?.length && !npc.def.onTalk) continue;
      const point = npc.talkPoint(player.x);
      const nx = point.x;
      const ny = point.y - 4;
      const d = Math.min(Math.hypot(player.x + ox - nx, player.y - 3 + oy - ny), Math.hypot(player.x - nx, player.y - 3 - ny));
      if (d <= bestDist) {
        bestDist = d;
        best = { npc, point };
      }
    }
    return best;
  }
}
