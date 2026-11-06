import { Input } from './core/Input';
import { Camera, ScrollDirection } from './core/Camera';
import { Collision } from './core/Collision';
import { DialogueSystem } from './core/Dialogue';
import { SoundManager } from './core/Audio';
import { GameState } from './core/GameState';
import { ImageCache } from './core/Images';
import { RoomRenderer } from './core/RoomRenderer';
import { renderCollidersDebug, updateStatsUI } from './core/DebugOverlay';
import { ROOMS, RoomDef, Rect, RoomNeighbors } from './data/rooms';
import { Player } from './entities/Player';
import { PropInstance, ParticleSystem } from './entities/Prop';

const NEIGHBOR_KEYS: Record<ScrollDirection, keyof RoomNeighbors> = { 0: 'west', 1: 'north', 2: 'east', 3: 'south' };
const SCROLL_DURATION_MS = 350;
const SCROLL_PUSH_PX = 8; // Link walks this far into the new screen during the scroll, like on Game Boy

interface PendingScroll {
  direction: ScrollDirection;
  nextKey: string;
  nextProps: PropInstance[];
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private input = new Input();
  private camera = new Camera();
  public sound = new SoundManager();
  public readonly game = new GameState();
  private dialogue: DialogueSystem;
  private player: Player;
  private particles = new ParticleSystem();
  private images = new ImageCache();
  private roomRenderer = new RoomRenderer(this.images);

  private currentRoomKey = 'indoor';
  private currentRoom: RoomDef;
  private props: PropInstance[] = [];
  private scroll: PendingScroll | null = null;

  // Render mode: true = Pre-rendered Ghibli HD, false = Original Pixel-Art Whitebox
  public useGhibliMode = true;
  public showColliders = false;

  // Fixed timestep loop (60 FPS: 16.666 ms per tick)
  private readonly fixedStepMs = 1000 / 60;
  private accumulatorMs = 0;
  private lastTime = 0;
  public fps = 60;
  private frameCount = 0;
  private fpsTimer = 0;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not get 2D canvas context');
    this.ctx = context;

    this.game.load((roomId) => roomId in ROOMS);
    this.dialogue = new DialogueSystem(this.game, this.sound);

    this.currentRoom = ROOMS[this.currentRoomKey];
    const spawn = this.currentRoom.spawnPoint;
    this.player = new Player(this.game, spawn.x, spawn.y, spawn.direction);

    // A saved game resumes awake at the last door crossed; a new game starts in Marin's bed.
    const respawn = this.game.respawn;
    if (respawn) {
      this.player.teleport(respawn.x, respawn.y, respawn.direction);
      this.initRoom(respawn.room);
    } else {
      this.initRoom(this.currentRoomKey);
    }
    this.game.onChange(() => this.refreshStats());

    // Allow clicking on canvas to interact / advance dialogue
    this.canvas.addEventListener('click', () => {
      if (this.camera.isTransitioning()) return;
      if (this.dialogue.isOpen()) {
        this.dialogue.onInteractPressed();
      } else {
        const nearby = this.dialogue.findNearbyNPC(this.player, this.props);
        if (nearby) this.dialogue.startDialogue(nearby, this.player);
      }
    });
  }

  public async init(): Promise<void> {
    await Promise.all([this.images.load('/assets/spritesheet.png'), this.roomRenderer.prefetch(this.currentRoom)]);
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  private initRoom(roomKey: string, props?: PropInstance[]): void {
    const previous = this.currentRoom;
    this.currentRoomKey = roomKey;
    this.currentRoom = ROOMS[roomKey];
    this.props = props ?? this.currentRoom.props.map((p) => new PropInstance(p));
    if (previous && previous.ambience !== this.currentRoom.ambience) this.particles.clear();
    this.sound.playMusic(this.currentRoom.music);
    for (const key of Object.values(this.currentRoom.neighbors ?? {})) {
      void this.roomRenderer.prefetch(ROOMS[key]);
    }
    this.refreshStats();
  }

  private switchRoom(targetKey: string, spawnX: number, spawnY: number, spawnDir: number): void {
    this.sound.playSfx('door', 0.7);
    void this.roomRenderer.prefetch(ROOMS[targetKey]);
    this.camera.startTransition(() => {
      this.initRoom(targetKey);
      this.player.teleport(spawnX, spawnY, spawnDir);
      this.game.setRespawn({ room: targetKey, x: spawnX, y: spawnY, direction: spawnDir });
    }, 320);
  }

  /**
   * Screen edges: walking past an edge scrolls to the registered neighbor; edges without one act as walls.
   * Link's 8x8 feet box must stay within [0, 160] x [0, 128].
   */
  private checkScreenEdges(): void {
    const { width, height } = this.currentRoom;
    const p = this.player;
    let direction: ScrollDirection | null = null;
    if (p.x < 4) direction = 0;
    else if (p.x > width - 4) direction = 2;
    else if (p.y < 8) direction = 1;
    else if (p.y > height) direction = 3;
    if (direction === null) return;

    const nextKey = this.currentRoom.neighbors?.[NEIGHBOR_KEYS[direction]];
    if (!nextKey || !ROOMS[nextKey]) {
      p.x = Math.max(4, Math.min(width - 4, p.x));
      p.y = Math.max(8, Math.min(height, p.y));
      return;
    }
    this.startScroll(direction, nextKey);
  }

  private startScroll(direction: ScrollDirection, nextKey: string): void {
    const next = ROOMS[nextKey];
    const p = this.player;
    // World-continuous position in the next room, pushed a few pixels inward
    let toX = Math.max(4, Math.min(next.width - 4, p.x));
    let toY = Math.max(8, Math.min(next.height, p.y));
    if (direction === 0) toX = p.x + next.width - SCROLL_PUSH_PX;
    if (direction === 2) toX = p.x - this.currentRoom.width + SCROLL_PUSH_PX;
    if (direction === 1) toY = p.y + next.height - SCROLL_PUSH_PX;
    if (direction === 3) toY = p.y - this.currentRoom.height + SCROLL_PUSH_PX;

    this.scroll = {
      direction,
      nextKey,
      nextProps: next.props.map((pr) => new PropInstance(pr)),
      fromX: p.x,
      fromY: p.y,
      toX,
      toY
    };
    void this.roomRenderer.prefetch(next);
    this.camera.startScroll(direction, () => this.finishScroll(), SCROLL_DURATION_MS);
  }

  private finishScroll(): void {
    const s = this.scroll;
    if (!s) return;
    this.scroll = null;
    this.initRoom(s.nextKey, s.nextProps);
    this.player.x = s.toX;
    this.player.y = s.toY;
  }

  /**
   * During a scroll Link is drawn over both screens in current-room coordinates: he moves from his
   * exit point to where his entry point will appear once the next room has slid fully into view.
   */
  private updateScroll(dtMs: number): void {
    const s = this.scroll;
    if (!s) return;
    const t = this.camera.getScrollProgress();
    const room = this.currentRoom;
    const endX = s.direction === 0 ? s.toX - room.width : s.direction === 2 ? s.toX + room.width : s.toX;
    const endY = s.direction === 1 ? s.toY - room.height : s.direction === 3 ? s.toY + room.height : s.toY;
    const off = this.camera.getScrollOffsets(room.width, room.height);
    this.player.x = s.fromX + (endX - s.fromX) * t + off.current.x;
    this.player.y = s.fromY + (endY - s.fromY) * t + off.current.y;
    this.player.animateWalk(dtMs, s.direction);
  }

  private gameLoop(currentTime: number): void {
    const elapsed = currentTime - this.lastTime;
    this.lastTime = currentTime;
    this.accumulatorMs += Math.min(elapsed, 250); // Cap excessive delta time (e.g. tab switched away)

    while (this.accumulatorMs >= this.fixedStepMs) {
      this.update(this.fixedStepMs);
      this.accumulatorMs -= this.fixedStepMs;
    }
    this.render();

    this.frameCount++;
    this.fpsTimer += elapsed;
    if (this.fpsTimer >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsTimer = 0;
      this.refreshStats();
    }

    this.input.endFrame();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  private update(dtMs: number): void {
    if (this.input.wasJustPressed('KeyG')) this.toggleGhibli();
    if (this.input.wasJustPressed('KeyC')) this.toggleColliders();
    if (this.input.wasJustPressed('KeyM')) this.toggleMute();

    this.sound.update(dtMs);
    this.camera.update(dtMs);
    this.dialogue.update(dtMs);

    if (this.camera.isScrolling()) {
      this.updateScroll(dtMs);
      return;
    }
    // If screen is fading during warp, pause player input
    if (this.camera.isTransitioning()) return;

    // Update animated Props & Particles even during dialogue
    for (const prop of this.props) prop.update(dtMs);
    this.particles.update(dtMs, this.currentRoom.ambience);

    // If a dialogue box is open, Space / Enter / E advances or closes the dialogue
    if (this.dialogue.isOpen()) {
      if (this.player.state === 'ITEM_GET') this.player.update(dtMs, this.input, [], this.sound);
      if (this.input.wasInteractJustPressed()) {
        this.dialogue.onInteractPressed();
        this.refreshStats();
      }
      return;
    }

    // Solid obstacles: room static colliders + prop collisions
    const allColliders: Rect[] = [...this.currentRoom.colliders];
    for (const prop of this.props) {
      if (prop.data.collision) allColliders.push(prop.data.collision);
    }

    const nearbyNPC = this.dialogue.findNearbyNPC(this.player, this.props);
    if (nearbyNPC && this.input.wasInteractJustPressed()) {
      this.dialogue.startDialogue(nearbyNPC, this.player);
      this.refreshStats();
      return;
    }

    this.player.update(dtMs, this.input, allColliders, this.sound);

    if (this.player.state === 'IDLE' || this.player.state === 'WALKING') {
      this.checkScreenEdges();
      if (this.camera.isScrolling()) return;
      this.checkWarps();
    }
  }

  private checkWarps(): void {
    const warp = Collision.checkWarpTriggers(this.player.x, this.player.y, this.player.direction, this.currentRoom.warpTriggers);
    if (!warp) return;

    if (this.currentRoomKey === 'indoor' && !this.player.hasShield) {
      // Just like in Link's Awakening, Tarin stops Link if he tries to leave without his shield
      this.player.y = 109;
      this.player.direction = 1; // Turn back toward Tarkin
      this.player.state = 'IDLE';
      this.player.syncIdleDirection();
      this.dialogue.startCustomDialogue('Tarkin', [
        "Hé, p'tit gars ! Attends ! N'oublie pas ton bouclier avant de sortir ! Viens me voir près de la table !"
      ]);
    } else {
      this.switchRoom(warp.targetRoom, warp.targetX, warp.targetY, warp.targetDirection);
    }
  }

  private render(): void {
    const { ctx, canvas } = this;
    const spritesheet = this.images.get('/assets/spritesheet.png');
    if (!spritesheet) return;

    const room = this.currentRoom;
    const scale = canvas.width / room.width; // 1280 / 160 = 8.0
    ctx.save();
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scale, scale);

    const playerRenderable = { y: this.player.y, render: () => this.player.render(ctx, spritesheet) };

    if (this.scroll) {
      const next = ROOMS[this.scroll.nextKey];
      const off = this.camera.getScrollOffsets(room.width, room.height);
      this.roomRenderer.renderRoom(ctx, room, this.props, spritesheet, this.useGhibliMode, off.current.x, off.current.y);
      this.roomRenderer.renderRoom(ctx, next, this.scroll.nextProps, spritesheet, this.useGhibliMode, off.next.x, off.next.y);
      ctx.imageSmoothingEnabled = this.useGhibliMode;
      playerRenderable.render(); // Link travels with the scroll, drawn over both screens
    } else {
      this.roomRenderer.renderRoom(ctx, room, this.props, spritesheet, this.useGhibliMode, 0, 0, [playerRenderable]);
      this.particles.render(ctx);
      if (this.showColliders) renderCollidersDebug(ctx, room, this.props, this.player.x, this.player.y);
    }
    ctx.restore();

    // NPC proximity indicator & dialogue box (1280x1024 screen space)
    if (!this.scroll) {
      const nearbyNPC = this.dialogue.findNearbyNPC(this.player, this.props);
      this.dialogue.renderProximityIndicator(ctx, nearbyNPC, scale);
    }
    this.dialogue.renderDialogueBox(ctx, canvas.width, canvas.height);
    this.camera.renderFade(ctx, canvas.width, canvas.height);
  }

  public toggleGhibli(): void {
    this.useGhibliMode = !this.useGhibliMode;
    this.refreshStats();
  }

  public toggleColliders(): void {
    this.showColliders = !this.showColliders;
    this.refreshStats();
  }

  public toggleMute(): void {
    this.sound.toggleMute();
    this.refreshStats();
  }

  /** Debug: wipe the save and restart a new game in Marin's bed. */
  public resetSave(): void {
    this.game.reset();
    window.location.reload();
  }

  public getPlayerInfo(): { state: string; x: number; y: number; room: string } {
    return { state: this.player.state, x: Math.round(this.player.x), y: Math.round(this.player.y), room: this.currentRoom.name };
  }

  private refreshStats(): void {
    if (!this.player) return; // called during construction before Link exists
    updateStatsUI({
      roomName: this.currentRoom.name,
      playerState: this.player.state,
      hasShield: this.player.hasShield,
      muted: this.sound.muted,
      x: this.player.x,
      y: this.player.y,
      ghibli: this.useGhibliMode,
      colliders: this.showColliders,
      fps: this.fps
    });
  }
}

// Bootstrap application on window load
window.addEventListener('DOMContentLoaded', async () => {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas #game-canvas not found!');
    return;
  }

  const engine = new GameEngine(canvas);
  await engine.init();
  if (import.meta.env.DEV) (window as unknown as { engine: GameEngine }).engine = engine; // dev-only console/test hook

  document.getElementById('btn-toggle-mode')?.addEventListener('click', () => engine.toggleGhibli());
  document.getElementById('btn-toggle-coll')?.addEventListener('click', () => engine.toggleColliders());
  document.getElementById('btn-toggle-audio')?.addEventListener('click', () => engine.toggleMute());
  document.getElementById('btn-reset-save')?.addEventListener('click', () => {
    if (window.confirm('Effacer la sauvegarde et recommencer une nouvelle partie ?')) engine.resetSave();
  });
});
