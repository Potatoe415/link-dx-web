# RUNBOOK

Detailed procedures. Everyday commands live in `AGENTS.md`.

## 1. Setup & Local Development
```powershell
npm install
npm run dev
```
Open `http://127.0.0.1:5173/` in Chrome/Edge/Firefox.

## 2. Typecheck & Production Build (`check`)
```powershell
npm run build
```
Runs `tsc` (strict TypeScript typechecking) followed by `vite build` (outputs production bundle to `dist/`).

## 3. Regenerating Original Audio (`awakening.gbs` + `.wav` SFX)
If you need to export additional tracks from `_ref_repo/Data/Music/awakening.gbs` or copy additional sound effects from `_ref_repo/Content/SoundEffects/`:
1. Edit track numbers or durations in `scripts/export_gbs_audio.py`.
2. Run:
   ```powershell
   python scripts/export_gbs_audio.py
   ```
   This compiles `_ref_repo/GbsPlayer/` with the built-in Windows .NET Framework C# compiler (`csc.exe`) and writes 44.1 kHz 16-bit PCM `.wav` files into `public/assets/audio/`. Every track except `music_indoor`, `music_outdoor` and `music_marin_sing` is then encoded to Ogg Vorbis with `ffmpeg` (must be on `PATH`; otherwise the `.wav` is kept and `MUSIC_FILES` in `src/core/Audio.ts` must point to it).

## 4. Adding a New Room (Step-by-Step)
See `docs/ASSET_PIPELINE.md` for the complete workflow:
1. Extract the `160x128` pixel-art reference (`<room>_bg_pixel.png`) from `_ref_repo/Data/Maps/`.
2. Generate the `1280x1024` Studio Ghibli background (`<room>_bg.png`) and optional foreground occlusion mask (`<room>_fg.png`).
3. Register the room's `colliders`, `warpTriggers`, and `props` in `src/data/rooms/<region>.ts`.
4. Verify in-game using `G` (Pixel/Ghibli toggle) and `C` (Collider overlay).
