import { Rect, RoomDef } from '../data/rooms';
import { PropInstance } from '../entities/Prop';
import { Collision } from './Collision';

/**
 * AABB debug view (key C): red = static walls and push blocks, orange dashed = enemy-only walls,
 * violet = NPC colliders, cyan = warps, green = Link's feet; ground zones underneath.
 */
export function renderCollidersDebug(
  ctx: CanvasRenderingContext2D,
  room: RoomDef,
  props: PropInstance[],
  playerX: number,
  playerY: number,
  dynamicWalls: Rect[] = []
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

  // Ground zones first (under walls): grass green, water blue, stairs amber, holes black
  const zoneColors: Record<string, [string, string]> = {
    grass: ['rgba(132, 204, 22, 0.25)', '#65a30d'],
    shallowWater: ['rgba(56, 189, 248, 0.3)', '#0ea5e9'],
    deepWater: ['rgba(30, 64, 175, 0.45)', '#1e40af'],
    stairs: ['rgba(245, 158, 11, 0.35)', '#d97706'],
    hole: ['rgba(0, 0, 0, 0.6)', '#000000']
  };
  for (const [kind, [fill, stroke]] of Object.entries(zoneColors)) {
    drawBoxes(fill, stroke, (room.groundZones ?? []).filter((z) => z.kind === kind));
  }
  drawBoxes('rgba(239, 68, 68, 0.45)', '#ef4444', [...room.colliders, ...dynamicWalls]);
  ctx.setLineDash([1, 1]);
  drawBoxes('rgba(249, 115, 22, 0.15)', '#f97316', room.enemyWalls ?? []);
  ctx.setLineDash([]);
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
  godMode: boolean;
  gameSpeed: number;
}

const setText = (id: string, text: string, className?: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  if (className !== undefined) el.className = className;
};

/** Refreshes the HTML debug dashboard and left sidebar. */
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

  // God Mode button text & active status in sidebar
  const godBtn = document.getElementById('btn-toggle-god');
  if (godBtn) {
    godBtn.innerHTML = s.godMode
      ? `<span>🛡️ Mode God : <strong class="text-emerald-400">ON (Traversée)</strong></span>`
      : `<span>🛡️ Mode God : <span class="text-slate-400">OFF</span></span>`;
    if (s.godMode) godBtn.classList.add('active-god');
    else godBtn.classList.remove('active-god');
  }

  // Speed buttons active styling (x1, x2, x4)
  for (const spd of [1, 2, 4]) {
    const spdBtn = document.getElementById(`btn-speed-${spd}`);
    if (spdBtn) {
      if (s.gameSpeed === spd) {
        spdBtn.classList.add('active-speed');
      } else {
        spdBtn.classList.remove('active-speed');
      }
    }
  }
}
