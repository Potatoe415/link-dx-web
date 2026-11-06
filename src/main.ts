import { Input } from './core/Input';
import { Camera } from './core/Camera';
import { Collision } from './core/Collision';
import { DialogueSystem } from './core/Dialogue';
import { SoundManager } from './core/Audio';
import { GameState } from './core/GameState';
import { ROOMS, RoomDef, Rect } from './data/rooms';
import { Player } from './entities/Player';
import { PropInstance, ParticleSystem } from './entities/Prop';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private input: Input;
  private camera: Camera;
  public sound: SoundManager;
  public readonly game: GameState;
  private dialogue: DialogueSystem;
  private player: Player;
  private particles: ParticleSystem;

  private currentRoomKey: string = 'indoor';
  private currentRoom: RoomDef;
  private props: PropInstance[] = [];

  // Asset image cache
  private images: Map<string, HTMLImageElement> = new Map();
  private assetsLoaded: boolean = false;

  // Render mode: true = Pre-rendered Ghibli HD, false = Original Pixel-Art Whitebox
  public useGhibliMode: boolean = true;
  public showColliders: boolean = false;

  // Fixed timestep loop (60 FPS: 16.666 ms per tick)
  private readonly fixedStepMs: number = 1000 / 60;
  private accumulatorMs: number = 0;
  private lastTime: number = 0;

  // Performance stats
  public fps: number = 60;
  private frameCount: number = 0;
  private fpsTimer: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not get 2D canvas context');
    this.ctx = context;

    this.input = new Input();
    this.camera = new Camera();
    this.sound = new SoundManager();
    this.game = new GameState();
    this.game.load((roomId) => roomId in ROOMS);
    this.dialogue = new DialogueSystem(this.game, this.sound);
    this.particles = new ParticleSystem();

    this.currentRoom = ROOMS[this.currentRoomKey];
    this.player = new Player(
      this.game,
      this.currentRoom.spawnPoint.x,
      this.currentRoom.spawnPoint.y,
      this.currentRoom.spawnPoint.direction
    );

    // A saved game resumes awake at the last door crossed; a new game starts in Marin's bed.
    const respawn = this.game.respawn;
    if (respawn) {
      this.player.teleport(respawn.x, respawn.y, respawn.direction);
      this.initRoom(respawn.room);
    } else {
      this.initRoom(this.currentRoomKey);
    }
    this.game.onChange(() => this.updateStatsUI());

    // Allow clicking on canvas to interact / advance dialogue
    this.canvas.addEventListener('click', () => {
      if (this.camera.isTransitioning()) return;
      if (this.dialogue.isOpen()) {
        this.dialogue.onInteractPressed();
      } else {
        const nearby = this.dialogue.findNearbyNPC(this.player, this.props);
        if (nearby) {
          this.dialogue.startDialogue(nearby, this.player);
        }
      }
    });
  }

  public async init(): Promise<void> {
    await this.preloadAssets();
    this.assetsLoaded = true;
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  private async preloadAssets(): Promise<void> {
    const urls = [
      '/assets/spritesheet.png',
      '/assets/indoor_bg.png',
      '/assets/indoor_bg_pixel.png',
      '/assets/outdoor_bg.png',
      '/assets/outdoor_bg_pixel.png',
      '/assets/outdoor_fg.png',
      '/assets/outdoor_fg_pixel.png'
    ];

    const promises = urls.map(
      (url) =>
        new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.src = url;
          img.onload = () => {
            this.images.set(url, img);
            resolve();
          };
          img.onerror = () => {
            console.warn(`Could not load asset: ${url}, fallback will be used`);
            resolve();
          };
        })
    );

    await Promise.all(promises);
  }

  private initRoom(roomKey: string): void {
    this.currentRoomKey = roomKey;
    this.currentRoom = ROOMS[roomKey];
    this.props = this.currentRoom.props.map((p) => new PropInstance(p));
    this.sound.playMusic(roomKey === 'outdoor' ? 'outdoor' : 'indoor');
  }

  private switchRoom(targetKey: string, spawnX: number, spawnY: number, spawnDir: number): void {
    this.sound.playSfx('door', 0.7);
    this.camera.startTransition(() => {
      this.initRoom(targetKey);
      this.player.teleport(spawnX, spawnY, spawnDir);
      this.game.setRespawn({ room: targetKey, x: spawnX, y: spawnY, direction: spawnDir });
    }, 320);
  }

  private gameLoop(currentTime: number): void {
    const elapsed = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Cap excessive delta time (e.g. tab switched away)
    this.accumulatorMs += Math.min(elapsed, 250);

    // Fixed timestep physics updates
    while (this.accumulatorMs >= this.fixedStepMs) {
      this.update(this.fixedStepMs);
      this.accumulatorMs -= this.fixedStepMs;
    }

    // Render frame
    this.render();

    // FPS calculation
    this.frameCount++;
    this.fpsTimer += elapsed;
    if (this.fpsTimer >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsTimer = 0;
      this.updateStatsUI();
    }

    this.input.endFrame();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  private update(dtMs: number): void {
    // Toggle Ghibli HD / Pixel Art mode on key 'G'
    if (this.input.wasJustPressed('KeyG')) {
      this.useGhibliMode = !this.useGhibliMode;
      this.updateStatsUI();
    }

    // Toggle Colliders debug overlay on key 'C'
    if (this.input.wasJustPressed('KeyC')) {
      this.showColliders = !this.showColliders;
      this.updateStatsUI();
    }

    // Toggle Audio Mute on key 'M'
    if (this.input.wasJustPressed('KeyM')) {
      this.sound.toggleMute();
      this.updateStatsUI();
    }

    this.sound.update(dtMs);
    this.camera.update(dtMs);
    this.dialogue.update(dtMs);

    // If screen is fading during warp, pause player input
    if (this.camera.isTransitioning()) return;

    // Update animated Props & Particles even during dialogue
    for (const prop of this.props) {
      prop.update(dtMs);
    }
    this.particles.update(dtMs, this.currentRoomKey as 'indoor' | 'outdoor');

    // If a dialogue box is open, Space / Enter / E advances or closes the dialogue
    if (this.dialogue.isOpen()) {
      if (this.player.state === 'ITEM_GET') {
        this.player.update(dtMs, this.input, [], this.sound);
      }
      if (this.input.wasInteractJustPressed()) {
        this.dialogue.onInteractPressed();
        this.updateStatsUI();
      }
      return;
    }

    // Build list of solid obstacle colliders (room static colliders + props collisions)
    const allColliders: Rect[] = [...this.currentRoom.colliders];
    for (const prop of this.props) {
      if (prop.data.collision) {
        allColliders.push(prop.data.collision);
      }
    }

    // Check if player presses action key to talk to a nearby NPC
    const nearbyNPC = this.dialogue.findNearbyNPC(this.player, this.props);
    if (nearbyNPC && this.input.wasInteractJustPressed()) {
      this.dialogue.startDialogue(nearbyNPC, this.player);
      this.updateStatsUI();
      return;
    }

    // Update Player
    this.player.update(dtMs, this.input, allColliders, this.sound);

    // Check Warp Triggers (doors)
    if (this.player.state === 'IDLE' || this.player.state === 'WALKING') {
      const warp = Collision.checkWarpTriggers(
        this.player.x,
        this.player.y,
        this.player.direction,
        this.currentRoom.warpTriggers
      );
      if (warp) {
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
    }
  }

  private render(): void {
    const { ctx, canvas } = this;
    const spritesheet = this.images.get('/assets/spritesheet.png');
    if (!spritesheet) return;

    // 1. Draw Background
    const bgUrl = this.useGhibliMode ? this.currentRoom.bgGhibli : this.currentRoom.bgPixel;
    const bgImg = this.images.get(bgUrl);

    ctx.save();
    if (bgImg) {
      ctx.imageSmoothingEnabled = this.useGhibliMode;
      // Draw background scaled to fit full canvas 1280x1024
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.restore();

    // 2. Setup 8x scaling transform for native 160x128 entities & props
    ctx.save();
    const scale = canvas.width / this.currentRoom.width; // 1280 / 160 = 8.0
    ctx.scale(scale, scale);
    ctx.imageSmoothingEnabled = this.useGhibliMode; // smooth hand-drawn art in Ghibli mode, crisp in Pixel mode

    // 2a. Props with zIndex < 10 (flowers, ground decor)
    for (const prop of this.props) {
      if ((prop.data.zIndex ?? 10) < 10) {
        prop.render(ctx, spritesheet);
      }
    }

    // 2b. Entities sorted by Y (Player + NPCs at level 10)
    // Create render list for Y-sorting
    interface Renderable {
      y: number;
      render: () => void;
    }

    const renderList: Renderable[] = [];

    // Add player
    renderList.push({
      y: this.player.y,
      render: () => this.player.render(ctx, spritesheet)
    });

    // Add mid-level props (Marin, Tarin)
    for (const prop of this.props) {
      const z = prop.data.zIndex ?? 10;
      if (z >= 10 && z < 20) {
        renderList.push({
          y: prop.data.y,
          render: () => prop.render(ctx, spritesheet)
        });
      }
    }

    // Sort by Y ascending (higher Y is drawn in front)
    renderList.sort((a, b) => a.y - b.y);
    for (const item of renderList) {
      item.render();
    }

    // 2c. Props with zIndex >= 20 (roof items like weathercock)
    for (const prop of this.props) {
      if ((prop.data.zIndex ?? 10) >= 20) {
        prop.render(ctx, spritesheet);
      }
    }

    // 3. Foreground Occlusion Mask (Roof / Tree tops)
    const fgUrl = this.useGhibliMode ? this.currentRoom.fgGhibli : this.currentRoom.fgPixel;
    if (fgUrl) {
      const fgImg = this.images.get(fgUrl);
      if (fgImg) {
        // Draw FG mask in native coords
        ctx.drawImage(fgImg, 0, 0, this.currentRoom.width, this.currentRoom.height);
      }
    }

    // 4. Atmospheric Particles
    this.particles.render(ctx);

    // 5. Debug Colliders & Triggers Overlay (if enabled)
    if (this.showColliders) {
      this.renderCollidersDebug(ctx);
    }

    ctx.restore();

    // 6. NPC Proximity Indicator & Dialogue Box Overlay (in 1280x1024 screen coordinates)
    const nearbyNPC = this.dialogue.findNearbyNPC(this.player, this.props);
    this.dialogue.renderProximityIndicator(ctx, nearbyNPC, scale);
    this.dialogue.renderDialogueBox(ctx, canvas.width, canvas.height);

    // 7. Camera Fade Transition Overlay
    this.camera.renderFade(ctx, canvas.width, canvas.height);
  }

  private renderCollidersDebug(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Static room colliders in orange
    ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 0.5;
    for (const c of this.currentRoom.colliders) {
      ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.strokeRect(c.x, c.y, c.w, c.h);
    }

    // Prop colliders in violet
    ctx.fillStyle = 'rgba(168, 85, 247, 0.45)';
    ctx.strokeStyle = '#a855f7';
    for (const prop of this.props) {
      if (prop.data.collision) {
        const c = prop.data.collision;
        ctx.fillRect(c.x, c.y, c.w, c.h);
        ctx.strokeRect(c.x, c.y, c.w, c.h);
      }
    }

    // Warp Triggers in bright cyan
    ctx.fillStyle = 'rgba(6, 182, 212, 0.45)';
    ctx.strokeStyle = '#06b6d4';
    for (const w of this.currentRoom.warpTriggers) {
      const c = w.triggerBox;
      ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.strokeRect(c.x, c.y, c.w, c.h);
    }

    // Player collision box in lime green
    const playerBox = Collision.getPlayerCollisionBox(this.player.x, this.player.y);
    ctx.fillStyle = 'rgba(34, 197, 94, 0.6)';
    ctx.strokeStyle = '#22c55e';
    ctx.fillRect(playerBox.x, playerBox.y, playerBox.w, playerBox.h);
    ctx.strokeRect(playerBox.x, playerBox.y, playerBox.w, playerBox.h);

    ctx.restore();
  }

  /** Debug: wipe the save and restart a new game in Marin's bed. */
  public resetSave(): void {
    this.game.reset();
    window.location.reload();
  }

  public getPlayerInfo(): { state: string; x: number; y: number; room: string } {
    return {
      state: this.player.state,
      x: Math.round(this.player.x),
      y: Math.round(this.player.y),
      room: this.currentRoom.name
    };
  }

  private updateStatsUI(): void {
    const roomEl = document.getElementById('stat-room');
    const stateEl = document.getElementById('stat-state');
    const shieldEl = document.getElementById('stat-shield');
    const audioEl = document.getElementById('stat-audio');
    const posEl = document.getElementById('stat-pos');
    const modeEl = document.getElementById('stat-mode');
    const collEl = document.getElementById('stat-coll');
    const fpsEl = document.getElementById('stat-fps');

    if (roomEl) roomEl.textContent = this.currentRoom.name;
    if (stateEl) stateEl.textContent = this.player.state;
    if (shieldEl) {
      shieldEl.textContent = this.player.hasShield ? '🛡️ Bouclier (Niv.1)' : 'Mains nues';
      shieldEl.className = this.player.hasShield
        ? 'text-amber-400 font-bold'
        : 'text-slate-400';
    }
    if (audioEl) {
      audioEl.textContent = this.sound.muted ? '🔇 Muet' : '🔊 GBS + SFX';
      audioEl.className = this.sound.muted ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold';
    }
    if (posEl) posEl.textContent = `(${Math.round(this.player.x)}, ${Math.round(this.player.y)})`;
    if (modeEl) {
      modeEl.textContent = this.useGhibliMode ? 'Studio Ghibli HD' : 'Original Pixel-Art';
      modeEl.className = this.useGhibliMode ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold';
    }
    if (collEl) {
      collEl.textContent = this.showColliders ? 'Visible (ON)' : 'Hidden (OFF)';
      collEl.className = this.showColliders ? 'text-rose-400 font-bold' : 'text-slate-400';
    }
    if (fpsEl) fpsEl.textContent = `${this.fps} FPS`;
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

  // Attach interactive UI buttons
  const toggleModeBtn = document.getElementById('btn-toggle-mode');
  if (toggleModeBtn) {
    toggleModeBtn.addEventListener('click', () => {
      engine.useGhibliMode = !engine.useGhibliMode;
      const modeEl = document.getElementById('stat-mode');
      if (modeEl) {
        modeEl.textContent = engine.useGhibliMode ? 'Studio Ghibli HD' : 'Original Pixel-Art';
        modeEl.className = engine.useGhibliMode ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold';
      }
    });
  }

  const toggleCollBtn = document.getElementById('btn-toggle-coll');
  if (toggleCollBtn) {
    toggleCollBtn.addEventListener('click', () => {
      engine.showColliders = !engine.showColliders;
      const collEl = document.getElementById('stat-coll');
      if (collEl) {
        collEl.textContent = engine.showColliders ? 'Visible (ON)' : 'Hidden (OFF)';
        collEl.className = engine.showColliders ? 'text-rose-400 font-bold' : 'text-slate-400';
      }
    });
  }

  const resetSaveBtn = document.getElementById('btn-reset-save');
  if (resetSaveBtn) {
    resetSaveBtn.addEventListener('click', () => {
      if (window.confirm('Effacer la sauvegarde et recommencer une nouvelle partie ?')) {
        engine.resetSave();
      }
    });
  }

  const toggleAudioBtn = document.getElementById('btn-toggle-audio');
  if (toggleAudioBtn) {
    toggleAudioBtn.addEventListener('click', () => {
      const muted = engine.sound.toggleMute();
      const audioEl = document.getElementById('stat-audio');
      if (audioEl) {
        audioEl.textContent = muted ? '🔇 Muet' : '🔊 GBS + SFX';
        audioEl.className = muted ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold';
      }
    });
  }
});
