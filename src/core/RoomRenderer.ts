import { RoomDef } from '../data/rooms';
import { PropInstance } from '../entities/Prop';
import { ImageCache } from './Images';

/** Something drawn in the Y-sorted player layer (Link, NPCs). */
export interface Renderable {
  y: number;
  render: () => void;
}

/**
 * Draws one room (background, props, Y-sorted entities, foreground mask) in native 160x128 space.
 * The caller sets up the 8x scale transform; `offsetX/offsetY` (logical px) let the scroll
 * transition draw two rooms side by side.
 */
export class RoomRenderer {
  constructor(private readonly images: ImageCache) {}

  public renderRoom(
    ctx: CanvasRenderingContext2D,
    room: RoomDef,
    props: PropInstance[],
    spritesheet: HTMLImageElement,
    useGhibli: boolean,
    offsetX: number,
    offsetY: number,
    entities: Renderable[] = []
  ): void {
    ctx.save();
    ctx.translate(offsetX, offsetY);
    // Clip so a room never paints over its neighbor during a scroll
    ctx.beginPath();
    ctx.rect(0, 0, room.width, room.height);
    ctx.clip();

    // 1. Background (fallback: pixel art, then flat colour)
    const bg = this.images.get(useGhibli ? room.bgGhibli : room.bgPixel) ?? this.images.get(room.bgPixel);
    ctx.imageSmoothingEnabled = useGhibli;
    if (bg) {
      ctx.drawImage(bg, 0, 0, room.width, room.height);
    } else {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, room.width, room.height);
    }

    // 2a. Ground props (zIndex < 10: flowers, ground decor)
    for (const prop of props) {
      if ((prop.data.zIndex ?? 10) < 10) prop.render(ctx, spritesheet);
    }

    // 2b. Player-level entities and props, Y-sorted (higher Y is drawn in front)
    const renderList: Renderable[] = [...entities];
    for (const prop of props) {
      const z = prop.data.zIndex ?? 10;
      if (z >= 10 && z < 20) renderList.push({ y: prop.data.y, render: () => prop.render(ctx, spritesheet) });
    }
    renderList.sort((a, b) => a.y - b.y);
    for (const item of renderList) item.render();

    // 2c. Props above the player (zIndex >= 20: roof items like the weathercock)
    for (const prop of props) {
      if ((prop.data.zIndex ?? 10) >= 20) prop.render(ctx, spritesheet);
    }

    // 3. Foreground occlusion mask (roof / tree tops)
    const fg = this.images.get(useGhibli ? room.fgGhibli : room.fgPixel);
    if (fg) ctx.drawImage(fg, 0, 0, room.width, room.height);

    ctx.restore();
  }

  /** Prefetch the images a room needs (called for the current room and its neighbors). */
  public prefetch(room: RoomDef | undefined): Promise<void> {
    if (!room) return Promise.resolve();
    return this.images.loadAll([room.bgPixel, room.bgGhibli, room.fgPixel, room.fgGhibli]);
  }
}
