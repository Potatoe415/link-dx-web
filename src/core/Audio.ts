export type SfxName =
  | 'jump'
  | 'land'
  | 'text_letter'
  | 'text_done'
  | 'item_get'
  | 'door'
  | 'shield'
  | 'tap'
  | 'cursor'
  | 'menu_open'
  | 'menu_close'
  | 'menu_select'
  | 'splash'
  | 'drown'
  | 'fall'
  | 'chest_open'
  | 'treasure'
  | 'link_hurt'
  | 'link_die'
  | 'enemy_hit'
  | 'enemy_die'
  | 'rupee'
  | 'heart'
  | 'low_health';

export type MusicTrack = 'indoor' | 'outdoor' | 'marin_sing';

export class SoundManager {
  private sfxBuffers: Map<SfxName, HTMLAudioElement> = new Map();
  private musicElements: Map<MusicTrack, HTMLAudioElement> = new Map();

  private currentMusic: MusicTrack | null = null;
  private desiredMusic: MusicTrack = 'indoor';
  private unlocked: boolean = false;
  public muted: boolean = false;
  private stopped: boolean = false;

  private musicVolume: number = 0.42;
  private duckTimer: number = 0;

  constructor() {
    this.preloadAudio();
    this.setupUnlockListeners();
  }

  private preloadAudio(): void {
    const sfxFiles: Record<SfxName, string> = {
      jump: '/assets/audio/sfx_jump.wav',
      land: '/assets/audio/sfx_land.wav',
      text_letter: '/assets/audio/sfx_text_letter.wav',
      text_done: '/assets/audio/sfx_text_done.wav',
      item_get: '/assets/audio/sfx_item_get.wav',
      door: '/assets/audio/sfx_door.wav',
      shield: '/assets/audio/sfx_shield.wav',
      tap: '/assets/audio/sfx_tap.wav',
      cursor: '/assets/audio/sfx_cursor.wav',
      menu_open: '/assets/audio/sfx_menu_open.wav', // D360-17-11
      menu_close: '/assets/audio/sfx_menu_close.wav', // D360-18-12
      menu_select: '/assets/audio/sfx_menu_select.wav', // D360-19-13
      splash: '/assets/audio/sfx_splash.wav', // D360-14-0E (wading / swimming)
      drown: '/assets/audio/sfx_drown.wav', // D370-03-03
      fall: '/assets/audio/sfx_fall.wav', // D370-12-0C (falling into a hole)
      chest_open: '/assets/audio/sfx_chest_open.wav', // D378-04-04
      treasure: '/assets/audio/sfx_treasure.wav', // D360-01-01 (rupee treasure jingle, ducks music)
      link_hurt: '/assets/audio/sfx_link_hurt.wav', // D370-03-03 (ObjLink.HitPlayer)
      link_die: '/assets/audio/sfx_link_die.wav', // D370-08-08 (ObjLink.OnDeath)
      enemy_hit: '/assets/audio/sfx_enemy_hit.wav', // D360-03-03 (AiDamageState hit)
      enemy_die: '/assets/audio/sfx_enemy_die.wav', // D378-19-13 (AiDamageState death)
      rupee: '/assets/audio/sfx_rupee.wav', // D370-05-05
      heart: '/assets/audio/sfx_heart.wav', // D370-06-06
      low_health: '/assets/audio/sfx_low_health.wav' // D370-04-04 (HD remake leaves the warning empty)
    };

    for (const [key, url] of Object.entries(sfxFiles) as [SfxName, string][]) {
      const audio = new Audio(url);
      audio.preload = 'auto';
      this.sfxBuffers.set(key, audio);
    }

    const musicFiles: Record<MusicTrack, string> = {
      indoor: '/assets/audio/music_indoor.wav',
      outdoor: '/assets/audio/music_outdoor.wav',
      marin_sing: '/assets/audio/music_marin_sing.wav'
    };

    for (const [key, url] of Object.entries(musicFiles) as [MusicTrack, string][]) {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.loop = true;
      audio.volume = this.musicVolume;
      this.musicElements.set(key, audio);
    }
  }

  private setupUnlockListeners(): void {
    const unlock = () => {
      if (this.unlocked) return;
      this.unlocked = true;
      this.syncMusicPlayback();
    };

    window.addEventListener('keydown', unlock, { passive: true });
    window.addEventListener('pointerdown', unlock, { passive: true });
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    this.syncMusicPlayback();
    return this.muted;
  }

  public playSfx(name: SfxName, volume: number = 0.65): void {
    if (this.muted) return;

    const base = this.sfxBuffers.get(name);
    if (!base) return;

    try {
      const clone = base.cloneNode() as HTMLAudioElement;
      clone.volume = Math.max(0, Math.min(1, volume));
      clone.play().catch(() => {
        // Ignore autoplay restrictions before first interaction
      });
    } catch {
      // Ignore audio errors
    }

    // Duck background music during the Item Get fanfare, just like TurnDownMusic in Link's Awakening
    if (name === 'item_get' || name === 'treasure') {
      this.duckMusic(2800);
    }
  }

  /** Silences music until the next playMusic (GAME OVER). */
  public stopMusic(): void {
    this.stopped = true;
    this.syncMusicPlayback();
  }

  public playMusic(track: MusicTrack): void {
    if (this.stopped) {
      this.stopped = false;
      this.currentMusic = null; // force restart
    }
    this.desiredMusic = track;
    if (this.currentMusic === track) return;
    this.syncMusicPlayback();
  }

  public duckMusic(durationMs: number): void {
    this.duckTimer = durationMs;
    const active = this.currentMusic ? this.musicElements.get(this.currentMusic) : null;
    if (active) {
      active.volume = 0.05;
    }
  }

  public update(dtMs: number): void {
    if (this.duckTimer > 0) {
      this.duckTimer -= dtMs;
      if (this.duckTimer <= 0) {
        this.duckTimer = 0;
        const active = this.currentMusic ? this.musicElements.get(this.currentMusic) : null;
        if (active && !this.muted) {
          active.volume = this.musicVolume;
        }
      }
    }
  }

  private syncMusicPlayback(): void {
    for (const [track, audio] of this.musicElements.entries()) {
      if (track !== this.desiredMusic || this.muted || !this.unlocked || this.stopped) {
        audio.pause();
      }
    }

    if (this.muted || !this.unlocked || this.stopped) {
      this.currentMusic = null;
      return;
    }

    const nextAudio = this.musicElements.get(this.desiredMusic);
    if (nextAudio) {
      if (this.currentMusic !== this.desiredMusic) {
        nextAudio.currentTime = 0;
      }
      nextAudio.volume = this.duckTimer > 0 ? 0.05 : this.musicVolume;
      nextAudio.play().catch(() => {
        // Autoplay still blocked
      });
      this.currentMusic = this.desiredMusic;
    }
  }
}
