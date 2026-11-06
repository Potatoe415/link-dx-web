import { GroundKind, GroundZone } from '../data/rooms';

/**
 * Special ground under Link's feet, ported from `_ref_repo/InGame/GameObjects/ObjLink.cs`:
 *  - grass:        walk speed x0.8, legs hidden by the grass mask
 *  - shallowWater: walk speed x0.8, splash sound every 250 ms
 *  - deepWater:    swim (x0.5) with flippers, otherwise drown: 650 ms sink, 500 ms hidden,
 *                  respawn at the last safe spot with 2 quarter-hearts damage
 *  - stairs:       walk speed x0.5 (ObjSlow 0.5f)
 *  - hole:         fall for 350 ms, then respawn at the last safe spot with 2 quarter-hearts damage
 */
export const GROUND_SPEED: Record<GroundKind, number> = {
  grass: 0.8,
  shallowWater: 0.8,
  deepWater: 0.5,
  stairs: 0.5,
  hole: 1.0
};

export const DROWN_SINK_MS = 650;
export const DROWN_HIDDEN_MS = 500;
export const HOLE_FALL_MS = 350;
export const HAZARD_DAMAGE_QUARTERS = 2;
export const WADE_SOUND_INTERVAL_MS = 250;

// Hazards fire on the body centre (ObjLink uses bodyCenter for field state), others on any overlap of the feet
const PRIORITY: GroundKind[] = ['hole', 'deepWater', 'shallowWater', 'stairs', 'grass'];

/** Returns the ground Link stands on, judged at the centre of his 8x8 feet box (x, y - 4). */
export function groundAt(zones: GroundZone[] | undefined, x: number, y: number): GroundKind | null {
  if (!zones || zones.length === 0) return null;
  const cx = x;
  const cy = y - 4;
  let best: GroundKind | null = null;
  for (const z of zones) {
    if (cx >= z.x && cx < z.x + z.w && cy >= z.y && cy < z.y + z.h) {
      if (best === null || PRIORITY.indexOf(z.kind) < PRIORITY.indexOf(best)) best = z.kind;
    }
  }
  return best;
}

/** Ground kinds that are safe to respawn on after a hazard. */
export function isSafeGround(kind: GroundKind | null): boolean {
  return kind !== 'hole' && kind !== 'deepWater';
}

/** Draws the tall-grass blades over Link's feet (the original hides the lower legs in grass). */
export function renderGrassMask(ctx: CanvasRenderingContext2D, x: number, y: number, animFrame: number): void {
  ctx.save();
  ctx.fillStyle = 'rgba(56, 142, 60, 0.92)';
  ctx.strokeStyle = 'rgba(27, 94, 32, 0.95)';
  ctx.lineWidth = 0.6;
  const sway = animFrame % 2 === 0 ? 0.4 : -0.4;
  for (let i = -2; i <= 2; i++) {
    const bx = x + i * 1.8;
    ctx.beginPath();
    ctx.moveTo(bx - 1, y + 0.5);
    ctx.lineTo(bx + sway, y - 3.4 + Math.abs(i) * 0.4);
    ctx.lineTo(bx + 1, y + 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

/** Expanding ripple rings drawn at Link's feet while wading, swimming or sinking. */
export function renderRipple(ctx: CanvasRenderingContext2D, x: number, y: number, timeMs: number): void {
  ctx.save();
  const phase = (timeMs % 600) / 600;
  ctx.strokeStyle = `rgba(224, 242, 254, ${(0.85 * (1 - phase)).toFixed(3)})`;
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.ellipse(x, y, 3 + phase * 3.5, 1.2 + phase * 1.4, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
