import { Input } from './core/Input';
import { Camera } from './core/Camera';
import { Collision } from './core/Collision';
import { DialogueSystem } from './core/Dialogue';
import { SoundManager } from './core/Audio';
import { GameState } from './core/GameState';
import { ImageCache } from './core/Images';
import { RoomRenderer } from './core/RoomRenderer';
import { renderCollidersDebug, updateStatsUI } from './core/DebugOverlay';
import { HUD } from './core/HUD';
import { InventoryMenu } from './core/Inventory';
import { ScreenScroll } from './core/ScreenScroll';
import { ROOMS, RoomDef, Rect } from './data/rooms';
import { Player } from './entities/Player';
import { PropInstance, ParticleSystem } from './entities/Prop';
import { InteractableSystem } from './entities/Interactables';
import { EnemyManager } from './entities/EnemyManager';
import { BushSystem } from './entities/Bushes';
import { GameOverScreen } from './core/GameOver';

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
  private scroller: ScreenScroll;
  private hud: HUD;
  private inventory: InventoryMenu;
  private interactables: InteractableSystem;
  private enemies: EnemyManager;
  private bushes: BushSystem;
  private gameOver: GameOverScreen;

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
    this.hud = new HUD(this.game, this.images);
    this.inventory = new InventoryMenu(this.game, this.images, this.sound);
    this.interactables = new InteractableSystem(this.game, this.images, this.sound, this.dialogue);
    this.enemies = new EnemyManager(this.game, this.images, this.sound);
    this.bushes = new BushSystem(this.images, this.sound);
    this.gameOver = new GameOverScreen(this.images);
    this.scroller = new ScreenScroll(this.camera, (key, props, x, y) => {
      this.initRoom(key, props);
      this.player.x = x;
      this.player.y = y;
    });

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
    await Promise.all([
      this.images.load('/assets/spritesheet.png'),
      this.roomRenderer.prefetch(this.currentRoom),
      this.hud.preload()
    ]);
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  private initRoom(roomKey: string, props?: PropInstance[]): void {
    const previous = this.currentRoom;
    this.currentRoomKey = roomKey;
    this.currentRoom = ROOMS[roomKey];
    this.props = props ?? this.currentRoom.props.map((p) => new PropInstance(p));
    this.interactables?.setRoom(roomKey, this.currentRoom.interactables);
    this.enemies?.setRoom(this.currentRoom.enemies);
    this.bushes?.setRoom(this.currentRoom.cuttables);
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
      this.scroller.update(dtMs, this.currentRoom, this.player);
      return;
    }
    // If screen is fading during warp, pause player input
    if (this.camera.isTransitioning()) return;

    this.hud.update(dtMs);
    if (this.updateOverlays(dtMs)) return;
    this.updateWorld(dtMs);
  }

  /** Game over, inventory and dialogue pause the world. Returns true when one of them is active. */
  private updateOverlays(dtMs: number): boolean {
    if (this.player.state === 'DYING') {
      this.player.update(dtMs, this.input, [], this.sound);
      if (this.gameOver.update(dtMs, this.input)) this.continueAfterGameOver();
      return true;
    }

    // Inventory sub-menu (not available while sleeping or mid-dialogue)
    const canOpenMenu = !this.dialogue.isOpen() && (this.player.state === 'IDLE' || this.player.state === 'WALKING');
    if (this.input.wasMenuJustPressed() && (this.inventory.isOpen() || canOpenMenu)) {
      this.inventory.toggle();
      return true;
    }
    if (this.inventory.isOpen()) {
      this.inventory.update(this.input);
      return true;
    }

    // Animated props & particles keep running during dialogue
    for (const prop of this.props) prop.update(dtMs);
    this.particles.update(dtMs, this.currentRoom.ambience);

    if (this.dialogue.isOpen()) {
      if (this.player.state === 'ITEM_GET') this.player.update(dtMs, this.input, [], this.sound);
      if (this.input.wasInteractJustPressed()) {
        this.dialogue.onInteractPressed();
        this.refreshStats();
      }
      return true;
    }

    this.interactables.update(dtMs);
    return this.interactables.isBusy();
  }

  /** Link, enemies, interactions and room exits for one fixed step. */
  private updateWorld(dtMs: number): void {
    // Solid obstacles: room static colliders + prop collisions + signposts / chests
    const allColliders: Rect[] = [
      ...this.currentRoom.colliders,
      ...this.interactables.colliders(),
      ...this.bushes.colliders()
    ];
    for (const prop of this.props) {
      if (prop.data.collision) allColliders.push(prop.data.collision);
    }

    if (this.input.wasInteractJustPressed() && this.tryAction()) return;

    const ground = [...(this.currentRoom.groundZones ?? []), ...this.bushes.grassZones()];
    // Sea urchins block Link but not the other enemies' movement checks
    const playerColliders = [...allColliders, ...this.enemies.solidColliders()];
    this.player.update(dtMs, this.input, playerColliders, this.sound, ground);
    const swordHit = this.player.sword.hit(this.player.x, this.player.y);
    if (swordHit) {
      this.enemies.hitArea(swordHit.area, swordHit.damage, this.player.x, this.player.y);
      for (const d of this.bushes.cut(swordHit.area).drops) this.enemies.addPickup(d.kind, d.x, d.y);
    }
    this.bushes.update(dtMs);
    this.enemies.update(dtMs, allColliders, this.player, ground);
    const picked = this.interactables.checkPickups(this.player);
    if (picked?.item === 'sword') {
      this.giveSword();
      return;
    }
    if (this.game.healthQuarters <= 0) {
      this.startGameOver();
      return;
    }

    const canLeave = this.player.state === 'IDLE' || this.player.state === 'WALKING' || this.player.state === 'SWIMMING';
    if (!canLeave) return;
    if (this.scroller.checkEdges(this.currentRoom, this.player)) {
      void this.roomRenderer.prefetch(ROOMS[this.scroller.pending!.nextKey]);
      return;
    }
    this.checkWarps();
  }

  /** Action key: talk to the nearest NPC, else read / open what Link faces. */
  private tryAction(): boolean {
    const nearbyNPC = this.dialogue.findNearbyNPC(this.player, this.props);
    if (nearbyNPC) {
      this.dialogue.startDialogue(nearbyNPC, this.player);
      this.refreshStats();
      return true;
    }
    const canAct = this.player.state === 'IDLE' || this.player.state === 'WALKING';
    return canAct && this.interactables.tryInteract(this.player);
  }

  /** Beach sword (ObjItem sword1): fanfare, ITEM_GET pose, FLAG_SWORD_OBTAINED, auto-equipped. */
  private giveSword(): void {
    this.game.addItem('sword');
    this.game.setFlag('FLAG_SWORD_OBTAINED');
    if (this.game.equippedA !== 'sword' && this.game.equippedB !== 'sword') this.game.equip('A', 'sword');
    this.player.startItemGet('sword');
    this.sound.playJingle('sword_get', this.currentRoom.music);
    this.dialogue.startCustomDialogue(
      '★ Objet Obtenu ★',
      ["Vous avez retrouvé votre Épée ! Elle doit bien être à vous : votre nom est gravé dessus !",
        'Appuyez sur [Espace] ou [J] pour frapper. Maintenez la touche puis relâchez-la pour une Attaque Tournoyante !'],
      () => this.player.finishItemGet()
    );
  }

  /** ObjLink.OnDeath: stop music, death jingle, spin, then the GAME OVER screen. */
  private startGameOver(): void {
    this.sound.stopMusic();
    this.sound.playSfx('link_die', 0.8);
    this.player.startDying();
    this.gameOver.start();
  }

  /** GameOverPage "Continue": respawn at the last door crossed (or the room spawn) with refilled hearts. */
  private continueAfterGameOver(): void {
    const r = this.game.respawn;
    const room = r?.room ?? this.currentRoomKey;
    const spawn = r ?? { ...ROOMS[room].spawnPoint };
    this.camera.startTransition(() => {
      this.initRoom(room);
      this.player.respawnAfterGameOver(spawn.x, spawn.y, spawn.direction);
    }, 320);
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

    const swordSheet = this.images.get('/assets/ui/link0.png');
    const playerRenderable = { y: this.player.y, render: () => this.player.render(ctx, spritesheet, swordSheet) };

    if (this.scroller.pending) {
      const next = ROOMS[this.scroller.pending.nextKey];
      const off = this.camera.getScrollOffsets(room.width, room.height);
      this.roomRenderer.renderRoom(ctx, room, this.props, spritesheet, this.useGhibliMode, off.current.x, off.current.y);
      this.roomRenderer.renderRoom(ctx, next, this.scroller.pending.nextProps, spritesheet, this.useGhibliMode, off.next.x, off.next.y);
      ctx.imageSmoothingEnabled = this.useGhibliMode;
      playerRenderable.render(); // Link travels with the scroll, drawn over both screens
    } else {
      const dying = this.gameOver.isActive();
      this.roomRenderer.renderRoom(ctx, room, this.props, spritesheet, this.useGhibliMode, 0, 0, [
        ...(dying ? [] : [playerRenderable]),
        ...this.interactables.renderables(ctx),
        ...this.enemies.renderables(ctx),
        ...this.bushes.renderables(ctx)
      ], () => this.bushes.renderGround(ctx));
      if (dying) {
        // Dim the world, keep Link on top (GameOverSystem.DrawPlayerOnTopPercentage)
        this.gameOver.renderDim(ctx, room.width, room.height);
        ctx.imageSmoothingEnabled = this.useGhibliMode;
        playerRenderable.render();
      }
      this.particles.render(ctx);
      if (this.showColliders) renderCollidersDebug(ctx, room, this.props, this.player.x, this.player.y);
    }
    // HUD over the room; hidden during the wake-up cutscene like the original intro
    const hideHud = this.player.state === 'SLEEPING' || this.player.state === 'WAKING' || this.gameOver.isActive();
    if (!hideHud) this.hud.render(ctx, room.width, room.height);
    ctx.restore();

    // NPC proximity indicator & dialogue box (1280x1024 screen space)
    if (!this.scroller.pending) {
      const nearbyNPC = this.dialogue.findNearbyNPC(this.player, this.props);
      this.dialogue.renderProximityIndicator(ctx, nearbyNPC, scale);
    }
    this.dialogue.renderDialogueBox(ctx, canvas.width, canvas.height);
    this.inventory.render(ctx, canvas.width, canvas.height);
    this.gameOver.renderBanner(ctx, canvas.width, canvas.height);
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
