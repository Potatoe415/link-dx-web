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
  | 'low_health'
  | 'sword_slash1'
  | 'sword_slash2'
  | 'sword_slash3'
  | 'sword_slash4'
  | 'sword_charged'
  | 'sword_spin'
  | 'bush_cut'
  | 'shot_break'
  | 'urchin_push'
  | 'owl_fly'
  | 'bowwow_yip';

/**
 * Music tracks rendered from awakening.gbs by scripts/export_gbs_audio.py (song numbers in that script).
 * Elements are created lazily on first play so startup only fetches what is heard.
 */
export const MUSIC_FILES = {
  indoor: '/assets/audio/music_indoor.wav',
  outdoor: '/assets/audio/music_outdoor.wav',
  marin_sing: '/assets/audio/music_marin_sing.wav',
  overworld: '/assets/audio/music_overworld.ogg',
  forest: '/assets/audio/music_forest.ogg',
  mountain: '/assets/audio/music_mountain.ogg',
  animal_village: '/assets/audio/music_animal_village.ogg',
  desert: '/assets/audio/music_desert.ogg',
  house: '/assets/audio/music_house.ogg',
  shop: '/assets/audio/music_shop.ogg',
  minigame: '/assets/audio/music_minigame.ogg',
  cave: '/assets/audio/music_cave.ogg',
  helphouse: '/assets/audio/music_helphouse.ogg',
  dungeon1: '/assets/audio/music_dungeon1.ogg',
  dungeon2: '/assets/audio/music_dungeon2.ogg',
  dungeon3: '/assets/audio/music_dungeon3.ogg',
  dungeon4: '/assets/audio/music_dungeon4.ogg',
  dungeon5: '/assets/audio/music_dungeon5.ogg',
  dungeon6: '/assets/audio/music_dungeon6.ogg',
  dungeon7: '/assets/audio/music_dungeon7.ogg',
  dungeon8: '/assets/audio/music_dungeon8.ogg',
  dungeon_color: '/assets/audio/music_dungeon_color.ogg',
  sidescroll: '/assets/audio/music_sidescroll.ogg',
  boss: '/assets/audio/music_boss.ogg',
  egg: '/assets/audio/music_egg.ogg',
  owl: '/assets/audio/music_owl.ogg',
  sword_get: '/assets/audio/music_sword_get.ogg',
  game_over: '/assets/audio/music_game_over.ogg',
  ending: '/assets/audio/music_ending.ogg'
} as const;

export type MusicTrack = keyof typeof MUSIC_FILES;

/** Overworld zone music from `_ref_repo/Data/musicOverworld.data` (song number -> track). */
export const OVERWORLD_MUSIC: Record<number, MusicTrack> = {
  3: 'outdoor', // Mabe Village
  4: 'overworld',
  5: 'mountain',
  7: 'animal_village',
  8: 'forest',
  10: 'desert'
};

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
      low_health: '/assets/audio/sfx_low_health.wav', // D370-04-04 (HD remake leaves the warning empty)
      sword_slash1: '/assets/audio/sfx_sword_slash1.wav', // D378-02-02 (UseSword picks one of 4 at random)
      sword_slash2: '/assets/audio/sfx_sword_slash2.wav', // D378-20-14
      sword_slash3: '/assets/audio/sfx_sword_slash3.wav', // D378-21-15
      sword_slash4: '/assets/audio/sfx_sword_slash4.wav', // D378-24-18
      sword_charged: '/assets/audio/sfx_sword_charged.wav', // D360-04-04
      sword_spin: '/assets/audio/sfx_sword_spin.wav', // D378-03-03
      bush_cut: '/assets/audio/sfx_bush_cut.wav', // D378-05-05
      shot_break: '/assets/audio/sfx_shot_break.wav', // D360-07-07 (EnemyOctorokShot despawn)
      urchin_push: '/assets/audio/sfx_urchin_push.wav', // D360-62-3E (EnemySeaUrchin pushed by the shield)
      owl_fly: '/assets/audio/sfx_owl_fly.wav', // D378-45-2D (ObjOwl gliding in)
      bowwow_yip: '/assets/audio/sfx_bowwow_yip.wav' // D370-24-18 (ObjBowWowSmall / ObjBowWow bark)
    };

    for (const [key, url] of Object.entries(sfxFiles) as [SfxName, string][]) {
      const audio = new Audio(url);
      audio.preload = 'auto';
      this.sfxBuffers.set(key, audio);
    }

  }

  private getMusicElement(track: MusicTrack): HTMLAudioElement {
    let audio = this.musicElements.get(track);
    if (!audio) {
      audio = new Audio(MUSIC_FILES[track]);
      audio.preload = 'auto';
      audio.loop = true;
      audio.volume = this.musicVolume;
      this.musicElements.set(track, audio);
    }
    return audio;
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

  /**
   * Plays a one-shot jingle track (sword fanfare, owl...) and resumes `thenTrack` when it ends,
   * like SetMusic(nr, 2) on the higher-priority channel in GameManager.
   */
  public playJingle(track: MusicTrack, thenTrack: MusicTrack): void {
    this.playMusic(track);
    const audio = this.getMusicElement(track);
    audio.loop = false;
    audio.onended = () => {
      audio.onended = null;
      audio.loop = true;
      if (this.desiredMusic === track) this.playMusic(thenTrack);
    };
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

    const nextAudio = this.getMusicElement(this.desiredMusic);
    {
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
