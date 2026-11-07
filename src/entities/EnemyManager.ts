import { Collision } from '../core/Collision';
import { SoundManager } from '../core/Audio';
import { GameState } from '../core/GameState';
import { ImageCache } from '../core/Images';
import { GroundZone, Rect } from '../data/rooms';
import { ENEMIES } from '../data/enemies';
import { Enemy, EnemyWorld, LootDrop, directionOf, rollLoot } from './Enemy';
import { OctorokShot } from './OctorokShot';
import { Player } from './Player';
import { LOW_HEALTH_BEEP_MS, LOW_HEALTH_QUARTERS } from './Damage';
import { groundAt } from './Ground';

export interface EnemySpawn {
  kind: string;
  x: number; // feet anchor, logical px
  y: number;
}

interface Pickup {
  kind: Exclude<LootDrop, null>;
  x: number;
  y: number;
  ageMs: number;
}

const PICKUP_LIFETIME_MS = 8000; // dropped items blink then vanish (ObjItem)
const PICKUP_BOX = 8;
const ITEMS_SHEET = '/assets/ui/items.png';
const ENEMIES_SHEET = '/assets/ui/enemies.png';
const SHOT_DAMAGE = 2; // EnemyOctorokShot DamageFieldComponent
const URCHIN_PUSH_SFX_MS = 75; // EnemySeaUrchin._soundCounter
const DIR_VEC: Record<number, [number, number]> = { 0: [-1, 0], 1: [0, -1], 2: [1, 0], 3: [0, 1] };

/**
 * Enemies + their loot for the current room: AI updates, contact damage on Link, deaths with
 * loot drops (rupee / heart) and pickups, and the low-health beep.
 */
export class EnemyManager {
  public enemies: Enemy[] = [];
  public shots: OctorokShot[] = [];
  private pickups: Pickup[] = [];
  private beepTimer = 0;
  private pushSfxTimer = 0;

  constructor(
    private readonly game: GameState,
    private readonly images: ImageCache,
    private readonly sound: SoundManager
  ) {}

  public setRoom(spawns: EnemySpawn[] | undefined): void {
    this.enemies = (spawns ?? []).flatMap((s) => {
      const cfg = ENEMIES[s.kind];
      return cfg ? [new Enemy(cfg, s.x, s.y)] : [];
    });
    this.pickups = [];
    this.shots = [];
    for (const e of this.enemies) void this.images.load(e.config.sprite.sheet);
  }

  /** Bodies of solid enemies (sea urchins) that block Link. */
  public solidColliders(): Rect[] {
    return this.enemies.filter((e) => e.isSolid).map((e) => e.bodyBox);
  }

  /** Returns true when Link just took damage. */
  public update(dtMs: number, colliders: Rect[], player: Player, zones?: GroundZone[]): boolean {
    const world: EnemyWorld = {
      isWater: (x, y) => {
        const g = groundAt(zones, x, y);
        return g === 'shallowWater' || g === 'deepWater';
      }
    };
    for (const e of this.enemies) {
      e.update(dtMs, colliders, player.x, player.y, world);
      if (e.pendingShot) {
        const r = e.pendingShot;
        e.pendingShot = null;
        const shot = OctorokShot.spawn(r.x, r.y, r.vx, r.vy, colliders);
        if (shot) this.shots.push(shot);
      }
    }

    for (const e of this.enemies) {
      if (e.dead) this.dropLoot(e);
    }
    this.enemies = this.enemies.filter((e) => !e.dead);

    let hurt = false;
    const feet = Collision.getPlayerCollisionBox(player.x, player.y);
    this.pushSfxTimer = Math.max(0, this.pushSfxTimer - dtMs);
    for (const e of this.enemies) {
      if (!e.isHarmful || !Collision.intersects(feet, e.damageBox)) continue;
      // EnemySeaUrchin.OnPush: the raised shield facing the urchin pushes it instead of getting hurt
      if (e.isSolid && player.isBlocking && directionOf(e.x - player.x, e.y - player.y) === player.direction) {
        const [dx, dy] = DIR_VEC[player.direction];
        if (e.push(dx * e.config.speed, dy * e.config.speed, colliders) && this.pushSfxTimer <= 0) {
          this.sound.playSfx('urchin_push', 0.5);
          this.pushSfxTimer = URCHIN_PUSH_SFX_MS;
        }
        continue;
      }
      // Knock Link away from the enemy's centre (ObjLink.HitPlayer(box) direction)
      const result = player.takeHit(e.config.contactDamage, player.x - e.x, player.y - e.y, true);
      if (result === 'hit') {
        this.sound.playSfx('link_hurt', 0.75);
        hurt = true;
      } else if (result === 'blocked') {
        this.sound.playSfx('shield', 0.6);
        e.takeHit(0, e.x - player.x, e.y - player.y); // bounce off the shield
      }
    }

    if (this.updateShots(dtMs, colliders, player)) hurt = true;
    this.updatePickups(dtMs, player);
    this.updateLowHealthBeep(dtMs, player);
    return hurt;
  }

  /** Rocks: walls, Link (blockable by the shield) and their fade-out. Returns true if Link got hurt. */
  private updateShots(dtMs: number, colliders: Rect[], player: Player): boolean {
    let hurt = false;
    const feet = Collision.getPlayerCollisionBox(player.x, player.y);
    for (const shot of this.shots) {
      if (shot.update(dtMs, colliders)) this.sound.playSfx('shot_break', 0.5);
      const box = shot.damageBox;
      if (!box || !Collision.intersects(feet, box)) continue;
      const [vx, vy] = shot.velocity;
      const result = player.takeHit(SHOT_DAMAGE, vx, vy, true);
      if (result === 'ignored') continue;
      if (result === 'hit') {
        this.sound.playSfx('link_hurt', 0.75);
        hurt = true;
      } else {
        this.sound.playSfx('shield', 0.6);
      }
      shot.breakOff();
      this.sound.playSfx('shot_break', 0.5);
    }
    this.shots = this.shots.filter((s) => !s.dead);
    return hurt;
  }

  /** Hit every enemy whose hittable box overlaps `area` (sword arcs, items). */
  public hitArea(area: Rect, damage: number, fromX: number, fromY: number): number {
    let hits = 0;
    for (const shot of this.shots) {
      if (shot.despawning || !Collision.intersects(area, shot.body)) continue;
      // EnemyOctorokShot.OnHit: knocked away along the hit direction
      const dx = shot.x - fromX;
      const dy = shot.y - fromY;
      const len = Math.hypot(dx, dy) || 1;
      if (shot.breakOff(dx / len, dy / len)) {
        this.sound.playSfx('shot_break', 0.5);
        hits++;
      }
    }
    for (const e of this.enemies) {
      if (!Collision.intersects(area, e.hittableBox)) continue;
      const r = e.takeHit(damage, e.x - fromX, e.y - fromY);
      if (r === 'ignored') continue;
      hits++;
      this.sound.playSfx(r === 'killed' ? 'enemy_die' : 'enemy_hit', 0.7);
    }
    return hits;
  }

  /** Spawns a rupee / heart pickup (bushes, chests later). */
  public addPickup(kind: 'rupee' | 'heart', x: number, y: number): void {
    this.pickups.push({ kind, x, y, ageMs: 0 });
  }

  private dropLoot(e: Enemy): void {
    const loot = rollLoot();
    if (loot) this.pickups.push({ kind: loot, x: e.x, y: e.y - 4, ageMs: 0 });
  }

  private updatePickups(dtMs: number, player: Player): void {
    const feet = Collision.getPlayerCollisionBox(player.x, player.y);
    this.pickups = this.pickups.filter((p) => {
      p.ageMs += dtMs;
      const box = { x: p.x - PICKUP_BOX / 2, y: p.y - PICKUP_BOX / 2, w: PICKUP_BOX, h: PICKUP_BOX };
      if (Collision.intersects(feet, box)) {
        if (p.kind === 'rupee') {
          this.game.addRupees(1);
          this.sound.playSfx('rupee', 0.6);
        } else {
          this.game.changeHealth(4);
          this.sound.playSfx('heart', 0.6);
        }
        return false;
      }
      return p.ageMs < PICKUP_LIFETIME_MS;
    });
  }

  private updateLowHealthBeep(dtMs: number, player: Player): void {
    const low = this.game.healthQuarters > 0 && this.game.healthQuarters <= LOW_HEALTH_QUARTERS && player.state !== 'DYING';
    if (!low) {
      this.beepTimer = 0;
      return;
    }
    this.beepTimer -= dtMs;
    if (this.beepTimer <= 0) {
      this.beepTimer = LOW_HEALTH_BEEP_MS;
      this.sound.playSfx('low_health', 0.35);
    }
  }

  public renderables(ctx: CanvasRenderingContext2D): { y: number; render: () => void }[] {
    const out = this.enemies.map((e) => ({
      y: e.y,
      render: () => e.render(ctx, this.images.get(e.config.sprite.sheet))
    }));
    const enemySheet = this.images.get(ENEMIES_SHEET);
    for (const shot of this.shots) out.push({ y: shot.y, render: () => shot.render(ctx, enemySheet) });
    const items = this.images.get(ITEMS_SHEET);
    for (const p of this.pickups) {
      // Blink during the last 2 s before vanishing
      if (p.ageMs > PICKUP_LIFETIME_MS - 2000 && Math.floor(p.ageMs / 100) % 2 === 1) continue;
      out.push({
        y: p.y,
        render: () => {
          if (!items) return;
          if (p.kind === 'rupee') ctx.drawImage(items, 64, 144, 7, 14, Math.round(p.x - 3.5), Math.round(p.y - 10), 7, 14); // rubyGreen
          else ctx.drawImage(items, 143, 45, 7, 7, Math.round(p.x - 3.5), Math.round(p.y - 5), 7, 7); // heart
        }
      });
    }
    return out;
  }
}
