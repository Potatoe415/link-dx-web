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
  | 'fall';

export type MusicTrack = 'indoor' | 'outdoor' | 'marin_sing';

export class SoundManager {
  private sfxBuffers: Map<SfxName, HTMLAudioElement> = new Map();
  private musicElements: Map<MusicTrack, HTMLAudioElement> = new Map();

  private currentMusic: MusicTrack | null = null;
  private desiredMusic: MusicTrack = 'indoor';
  private unlocked: boolean = false;
  public muted: boolean = false;

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
      fall: '/assets/audio/sfx_fall.wav' // D370-12-0C (falling into a hole)
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
    if (name === 'item_get') {
      this.duckMusic(2800);
    }
  }

  public playMusic(track: MusicTrack): void {
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
      if (track !== this.desiredMusic || this.muted || !this.unlocked) {
        audio.pause();
      }
    }

    if (this.muted || !this.unlocked) {
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
