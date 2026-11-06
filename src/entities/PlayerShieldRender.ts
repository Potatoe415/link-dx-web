/**
 * Hand-painted Cocolint shield drawn over Link (carried, raised while blocking, held overhead in ITEM_GET).
 * Extracted from Player.ts; pure drawing in native 160x128 coordinates.
 */
export interface ShieldPose {
  x: number;
  y: number;
  direction: number;
  state: string;
  isBlocking: boolean;
  animFrameIndex: number;
  itemGetTimer: number;
  itemGetSprite?: 'shield' | 'sword';
}

export function renderEquippedShield(ctx: CanvasRenderingContext2D, p: ShieldPose): void {
  const bob = p.state === 'WALKING' && (p.animFrameIndex % 2 === 0) ? -0.6 : 0;

  if (p.direction === 3) {
    // Facing Down: shield on Link's left-viewer side (his right arm), or centered if blocking
    const sx = p.isBlocking ? p.x + 1.0 : p.x - 4.2;
    const sy = (p.isBlocking ? p.y - 6.8 : p.y - 6.2) + bob;
    const scale = p.isBlocking ? 1.08 : 0.9;
    drawCocolintShield(ctx, sx, sy, scale, false);
  } else if (p.direction === 1) {
    // Facing Up: shield on right-viewer side (his right arm)
    const sx = p.isBlocking ? p.x : p.x + 4.2;
    const sy = (p.isBlocking ? p.y - 9.5 : p.y - 6.8) + bob;
    drawCocolintShield(ctx, sx, sy, 0.88, false);
  } else if (p.direction === 0) {
    // Facing Left: shield in profile on the left edge
    const sx = p.isBlocking ? p.x - 5.5 : p.x - 3.8;
    const sy = (p.isBlocking ? p.y - 7.2 : p.y - 6.2) + bob;
    drawCocolintShield(ctx, sx, sy, p.isBlocking ? 0.95 : 0.78, true);
  } else if (p.direction === 2) {
    // Facing Right: shield in profile on the right edge
    const sx = p.isBlocking ? p.x + 5.5 : p.x + 3.8;
    const sy = (p.isBlocking ? p.y - 7.2 : p.y - 6.2) + bob;
    drawCocolintShield(ctx, sx, sy, p.isBlocking ? 0.95 : 0.78, true);
  }
}

export function renderItemGetOverhead(ctx: CanvasRenderingContext2D, p: ShieldPose): void {
  const floatY = Math.sin(p.itemGetTimer * 0.006) * 1.2;
  const cx = p.x;
  const cy = p.y - 22 + floatY;

  ctx.save();

  // Rotating golden Ghibli sunburst behind the shield
  const angle = p.itemGetTimer * 0.0025;
  const numRays = 8;
  for (let i = 0; i < numRays; i++) {
    const a = angle + (i * Math.PI * 2) / numRays;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(a);
    const grad = ctx.createLinearGradient(0, 0, 0, -14);
    grad.addColorStop(0, 'rgba(253, 224, 71, 0.75)');
    grad.addColorStop(1, 'rgba(251, 191, 36, 0.0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-1.8, 0);
    ctx.lineTo(1.8, 0);
    ctx.lineTo(0, -14);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Soft warm glow circle
  const radial = ctx.createRadialGradient(cx, cy, 1, cx, cy, 10);
  radial.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
  radial.addColorStop(0.6, 'rgba(245, 158, 11, 0.35)');
  radial.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = radial;
  ctx.beginPath();
  ctx.arc(cx, cy, 10, 0, Math.PI * 2);
  ctx.fill();

  // Draw the shield large and clear overhead
  if (p.itemGetSprite === 'sword') drawRaisedSword(ctx, cx, cy);
  else drawCocolintShield(ctx, cx, cy, 1.35, false);

  ctx.restore();
}

/**
 * Draws Link's wooden & iron Cocolint Shield in hand-painted style
 */
function drawCocolintShield(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  narrowProfile: boolean
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(narrowProfile ? scale * 0.58 : scale, scale);

  const w = 3.4;
  const h = 4.4;

  // Drop shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  shieldPath(ctx, 0.3, 0.4, w, h);
  ctx.fill();

  // Outer metallic iron/gold rim
  const rimGrad = ctx.createLinearGradient(-w, -h, w, h);
  rimGrad.addColorStop(0, '#fde68a');
  rimGrad.addColorStop(0.5, '#d97706');
  rimGrad.addColorStop(1, '#78350f');
  ctx.fillStyle = rimGrad;
  shieldPath(ctx, 0, 0, w, h);
  ctx.fill();

  ctx.lineWidth = 0.45;
  ctx.strokeStyle = '#451a03';
  ctx.stroke();

  // Inner warm oak wood face
  const woodGrad = ctx.createLinearGradient(0, -h * 0.78, 0, h * 0.78);
  woodGrad.addColorStop(0, '#b45309');
  woodGrad.addColorStop(0.5, '#92400e');
  woodGrad.addColorStop(1, '#572407');
  ctx.fillStyle = woodGrad;
  shieldPath(ctx, 0, 0, w * 0.76, h * 0.76);
  ctx.fill();

  // Central golden Triforce/crest boss emblem
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.moveTo(0, -1.6);
  ctx.lineTo(1.3, 0.4);
  ctx.lineTo(-1.3, 0.4);
  ctx.closePath();
  ctx.fill();

  // Boss highlight
  ctx.fillStyle = '#fef3c7';
  ctx.beginPath();
  ctx.arc(0, 1.3, 0.55, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function shieldPath(ctx: CanvasRenderingContext2D, ox: number, oy: number, w: number, h: number): void {
  ctx.beginPath();
  ctx.moveTo(ox - w, oy - h * 0.85);
  ctx.quadraticCurveTo(ox, oy - h, ox + w, oy - h * 0.85);
  ctx.lineTo(ox + w, oy + h * 0.1);
  ctx.quadraticCurveTo(ox + w * 0.85, oy + h * 0.7, ox, oy + h);
  ctx.quadraticCurveTo(ox - w * 0.85, oy + h * 0.7, ox - w, oy + h * 0.1);
  ctx.closePath();
}

/** Sword held overhead in the ITEM_GET pose: hand-painted blade matching the shield style. */
function drawRaisedSword(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.save();
  ctx.translate(cx, cy);
  // Blade
  const blade = ctx.createLinearGradient(-1, 0, 1, 0);
  blade.addColorStop(0, '#e2e8f0');
  blade.addColorStop(0.5, '#ffffff');
  blade.addColorStop(1, '#94a3b8');
  ctx.fillStyle = blade;
  ctx.beginPath();
  ctx.moveTo(0, -9);
  ctx.lineTo(1.3, -7.5);
  ctx.lineTo(1.3, 3);
  ctx.lineTo(-1.3, 3);
  ctx.lineTo(-1.3, -7.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 0.35;
  ctx.stroke();
  // Guard + grip + pommel
  ctx.fillStyle = '#1d4ed8';
  ctx.fillRect(-3.4, 3, 6.8, 1.4);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-0.9, 4.4, 1.8, 3);
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(0, 8.2, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
