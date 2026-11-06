import { RoomDef } from '../data/rooms';
import { PropInstance } from '../entities/Prop';
import { Collision } from './Collision';

/** AABB debug view (key C): red = static walls, violet = NPC colliders, cyan = warps, green = Link's feet. */
export function renderCollidersDebug(
  ctx: CanvasRenderingContext2D,
  room: RoomDef,
  props: PropInstance[],
  playerX: number,
  playerY: number
): void {
  ctx.save();
  ctx.lineWidth = 0.5;

  const drawBoxes = (fill: string, stroke: string, boxes: { x: number; y: number; w: number; h: number }[]) => {
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    for (const c of boxes) {
      ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.strokeRect(c.x, c.y, c.w, c.h);
    }
  };

  drawBoxes('rgba(239, 68, 68, 0.45)', '#ef4444', room.colliders);
  drawBoxes(
    'rgba(168, 85, 247, 0.45)',
    '#a855f7',
    props.flatMap((p) => (p.data.collision ? [p.data.collision] : []))
  );
  drawBoxes('rgba(6, 182, 212, 0.45)', '#06b6d4', room.warpTriggers.map((w) => w.triggerBox));
  drawBoxes('rgba(34, 197, 94, 0.6)', '#22c55e', [Collision.getPlayerCollisionBox(playerX, playerY)]);

  ctx.restore();
}

export interface StatsSnapshot {
  roomName: string;
  playerState: string;
  hasShield: boolean;
  muted: boolean;
  x: number;
  y: number;
  ghibli: boolean;
  colliders: boolean;
  fps: number;
}

const setText = (id: string, text: string, className?: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  if (className !== undefined) el.className = className;
};

/** Refreshes the HTML debug dashboard under the canvas. */
export function updateStatsUI(s: StatsSnapshot): void {
  setText('stat-room', s.roomName);
  setText('stat-state', s.playerState);
  setText(
    'stat-shield',
    s.hasShield ? '🛡️ Bouclier (Niv.1)' : 'Mains nues',
    s.hasShield ? 'text-amber-400 font-bold' : 'text-slate-400'
  );
  setText(
    'stat-audio',
    s.muted ? '🔇 Muet' : '🔊 GBS + SFX',
    s.muted ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'
  );
  setText('stat-pos', `(${Math.round(s.x)}, ${Math.round(s.y)})`);
  setText(
    'stat-mode',
    s.ghibli ? 'Studio Ghibli HD' : 'Original Pixel-Art',
    s.ghibli ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'
  );
  setText(
    'stat-coll',
    s.colliders ? 'Visible (ON)' : 'Hidden (OFF)',
    s.colliders ? 'text-rose-400 font-bold' : 'text-slate-400'
  );
  setText('stat-fps', `${s.fps} FPS`);
}
