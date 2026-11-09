import { RoomProp, RoomAmbience } from '../data/rooms';
import { ImageCache } from '../core/Images';
import { ANIMATIONS, AnimationFrame } from '../data/animations';

export class PropInstance {
  public data: RoomProp;
  private animTimer: number = 0;
  private animFrameIndex: number = 0;

  constructor(data: RoomProp) {
    this.data = data;
  }

  public update(dtMs: number): void {
    const def = ANIMATIONS[this.data.animation];
    if (!def || def.frames.length <= 1) return;

    this.animTimer += dtMs;
    if (this.animTimer >= def.frameTime) {
      this.animTimer -= def.frameTime;
      this.animFrameIndex = (this.animFrameIndex + 1) % def.frames.length;
    }
  }

  public getCurrentFrame(): AnimationFrame | null {
    const def = ANIMATIONS[this.data.animation];
    if (!def || !def.frames[this.animFrameIndex]) return null;
    return def.frames[this.animFrameIndex];
  }

  public render(
    ctx: CanvasRenderingContext2D,
    spritesheet: HTMLImageElement,
    useGhibli = false,
    images?: ImageCache
  ): void {
    // Contact shadow for NPCs
    const isNPC = this.data.id === 'marin' || this.data.id === 'tarin';
    if (isNPC) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(
        Math.round(this.data.x),
        Math.round(this.data.y),
        4.5,
        2.2,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
    }

    if (useGhibli && images && isNPC) {
      const ghibliPath = this.data.id === 'marin' ? '/assets/ui/ghibli_characters/marin.png' : '/assets/ui/ghibli_characters/tarin.png';
      const ghibliImg = images.get(ghibliPath);
      if (ghibliImg) {
        if (this.data.id === 'marin') {
          ctx.drawImage(ghibliImg, Math.round(this.data.x - 5), Math.round(this.data.y - 20), 10, 20);
        } else {
          ctx.drawImage(ghibliImg, Math.round(this.data.x - 7.5), Math.round(this.data.y - 20), 15, 20);
        }
        return;
      }
    }

    const frame = this.getCurrentFrame();
    if (!frame) return;

    const drawX = this.data.x - frame.originX;
    const drawY = this.data.y - frame.originY;

    const renderW = frame.renderW ?? frame.w;
    const renderH = frame.renderH ?? frame.h;

    ctx.drawImage(
      spritesheet,
      frame.x,
      frame.y,
      frame.w,
      frame.h,
      drawX,
      drawY,
      renderW,
      renderH
    );
  }
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
  color: string;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private spawnTimer: number = 0;

  public clear(): void {
    this.particles = [];
    this.spawnTimer = 0;
  }

  public update(dtMs: number, roomType: RoomAmbience): void {
    this.spawnTimer += dtMs;
    if (roomType === 'none') this.spawnTimer = 0;

    // Spawn rate
    const spawnInterval = roomType === 'indoor' ? 120 : 80;
    if (this.spawnTimer >= spawnInterval) {
      this.spawnTimer = 0;
      if (this.particles.length < 35) {
        if (roomType === 'indoor') {
          // Floating golden sun dust in window beams
          this.particles.push({
            x: 20 + Math.random() * 120,
            y: 20 + Math.random() * 90,
            vx: (Math.random() - 0.4) * 0.08,
            vy: -0.04 - Math.random() * 0.06,
            radius: 0.6 + Math.random() * 0.8,
            alpha: 0,
            life: 0,
            maxLife: 2500 + Math.random() * 2000,
            color: '255, 235, 170'
          });
        } else {
          // Gentle floating flower petal or leaf in outdoor breeze
          this.particles.push({
            x: Math.random() * 160,
            y: -5,
            vx: 0.15 + Math.random() * 0.25,
            vy: 0.1 + Math.random() * 0.15,
            radius: 0.8 + Math.random() * 0.9,
            alpha: 0,
            life: 0,
            maxLife: 4000 + Math.random() * 2000,
            color: '255, 185, 205'
          });
        }
      }
    }

    // Update existing particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dtMs;
      p.x += p.vx;
      p.y += p.vy;

      // Soft fadeIn and fadeOut alpha curve
      const half = p.maxLife / 2;
      if (p.life < half) {
        p.alpha = Math.min(0.65, (p.life / half) * 0.65);
      } else {
        p.alpha = Math.max(0, (1.0 - (p.life - half) / half) * 0.65);
      }

      if (p.life >= p.maxLife || p.x > 170 || p.y > 140) {
        this.particles.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this.particles.length === 0) return;

    ctx.save();
    for (const p of this.particles) {
      if (p.alpha <= 0.01) continue;
      ctx.fillStyle = `rgba(${p.color}, ${p.alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
