import { Collision } from '../core/Collision';
import { SoundManager } from '../core/Audio';
import { GameState } from '../core/GameState';
import { ImageCache } from '../core/Images';
import { GroundZone, Rect } from '../data/rooms';
import { ENEMIES } from '../data/enemies';
import { ENEMIES_SHEET, ENEMIES_GHIBLI_SHEET, Enemy, EnemyEvent, EnemyWorld, LootDrop, directionOf, rollLoot } from './Enemy';
import { Gel, createEnemy } from './enemies';
import { AnimatedEnemy } from './enemies/AnimatedEnemy';
import { Projectile } from './Projectile';
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
const SHOT_DAMAGE = 2; // EnemyOctorokShot / EnemySpear DamageFieldComponent
const REPEL_SPEED = 1; // ObjLink.RepelPlayer multiplier when the sword clashes with a weapon
const URCHIN_PUSH_SFX_MS = 75; // EnemySeaUrchin._soundCounter
const DIR_VEC: Record<number, [number, number]> = { 0: [-1, 0], 1: [0, -1], 2: [1, 0], 3: [0, 1] };

/**
 * Enemies + their loot for the current room: AI updates, contact damage on Link, deaths with
 * loot drops (rupee / heart) and pickups, and the low-health beep.
 */
export class EnemyManager {
  public enemies: Enemy[] = [];
  public shots: Projectile[] = [];
  /** Link stuck under a Gel this frame (EnemyGel.UpdateGrabbing: half speed, no items). */
  public linkGrabbed = false;
  /** Pending ObjLink.ShockPlayer from a Buzz Blob, consumed by the engine. */
  public pendingShock: { ms: number; damage: number } | null = null;
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
      return cfg ? [createEnemy(cfg, s.x, s.y)] : [];
    });
    this.pickups = [];
    this.shots = [];
    this.linkGrabbed = false;
    this.pendingShock = null;
    if (this.enemies.length) {
      void this.images.load(ENEMIES_SHEET);
      void this.images.load(ENEMIES_GHIBLI_SHEET);
    }
  }

  /** Bodies of solid enemies (sea urchins) that block Link. */
  public solidColliders(): Rect[] {
    return this.enemies.filter((e) => e.isSolid).map((e) => e.bodyBox);
  }

  /**
   * Returns true when Link just took damage. `enemyWalls` (NPCWall colliders) only block enemies;
   * projectiles fly over them.
   */
  public update(dtMs: number, colliders: Rect[], player: Player, zones?: GroundZone[], enemyWalls: Rect[] = [], godMode: boolean = false): boolean {
    const world: EnemyWorld = {
      isWater: (x, y) => {
        const g = groundAt(zones, x, y);
        return g === 'shallowWater' || g === 'deepWater';
      }
    };
    const enemyColliders = enemyWalls.length ? [...colliders, ...enemyWalls] : colliders;
    const spawned: Enemy[] = [];
    for (const e of this.enemies) {
      e.update(dtMs, enemyColliders, player.x, player.y, world);
      for (const ev of e.events.splice(0)) this.handleEvent(ev, colliders, spawned, godMode);
    }

    for (const e of this.enemies) {
      if (e.dead && !e.lootless) this.dropLoot(e);
    }
    this.enemies = [...this.enemies.filter((e) => !e.dead), ...spawned];
    this.linkGrabbed = godMode ? false : this.enemies.some((e) => e instanceof Gel && e.holdsLink);

    let hurt = false;
    const feet = Collision.getPlayerCollisionBox(player.x, player.y);
    this.pushSfxTimer = Math.max(0, this.pushSfxTimer - dtMs);
    if (!godMode) {
      for (const e of this.enemies) {
        if (!e.isHarmful || !e.damageBoxes().some((b) => Collision.intersects(feet, b))) continue;
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
          e.shieldBounce(e.x - player.x, e.y - player.y);
        }
      }

      if (this.updateShots(dtMs, colliders, player)) hurt = true;
    }
    this.updatePickups(dtMs, player);
    if (!godMode) this.updateLowHealthBeep(dtMs, player);
    return hurt;
  }

  private handleEvent(ev: EnemyEvent, colliders: Rect[], spawned: Enemy[], godMode: boolean = false): void {
    switch (ev.type) {
      case 'shot': {
        const shot = Projectile.spawn(ev.projectile, ev.x, ev.y, ev.vx, ev.vy, colliders);
        if (!shot) return;
        this.shots.push(shot);
        if (ev.projectile === 'spear') this.sound.playSfx('spear_throw', 0.6);
        return;
      }
      case 'spawn': {
        const cfg = ENEMIES[ev.kind];
        if (!cfg) return;
        const child = createEnemy(cfg, ev.x, ev.y);
        if (child instanceof AnimatedEnemy) child.launch(ev.vz);
        spawned.push(child);
        return;
      }
      case 'shock':
        if (!godMode) {
          this.pendingShock = { ms: ev.ms, damage: ev.damage };
          this.sound.playSfx('shock', 0.75);
        }
        return;
      case 'sfx':
        this.sound.playSfx(ev.name, 0.5);
        return;
    }
  }

  /** Rocks and spears: walls, Link (blockable by the shield) and their fade-out. Returns true if Link got hurt. */
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

  /**
   * Hit every enemy whose hittable box overlaps `area` (sword arcs, items). Returns the number of
   * hits and, when the blow clashed with a weapon (sword Moblin), the push to apply to Link.
   */
  public hitArea(area: Rect, damage: number, fromX: number, fromY: number): { hits: number; repel: [number, number] | null } {
    let hits = 0;
    let repel: [number, number] | null = null;
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
      const r = e.hitBy(area, damage, fromX, fromY);
      if (r === 'ignored') continue;
      hits++;
      if (r === 'repelled') {
        this.sound.playSfx('shot_break', 0.6); // SwordPoke D360-07-07
        const len = Math.hypot(e.x - fromX, e.y - fromY) || 1;
        repel = [((fromX - e.x) / len) * REPEL_SPEED, ((fromY - e.y) / len) * REPEL_SPEED];
      } else if (r !== 'absorbed') this.sound.playSfx(r === 'killed' ? 'enemy_die' : 'enemy_hit', 0.7);
    }
    return { hits, repel };
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

  public renderables(ctx: CanvasRenderingContext2D, useGhibli = false): { y: number; render: () => void }[] {
    const enemySheet = this.images.get(ENEMIES_SHEET);
    const ghibliSheet = useGhibli ? this.images.get(ENEMIES_GHIBLI_SHEET) : undefined;
    const out = this.enemies.map((e) => ({
      y: e.sortY,
      render: () => e.render(ctx, enemySheet, ghibliSheet, useGhibli)
    }));
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
