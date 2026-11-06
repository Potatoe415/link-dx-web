# PRODUCT

Agents propose changes; the user confirms before any edit.

Name: Zelda: Link's Awakening — Studio Ghibli Web Remake (`zelda-la-web`)
Objective: Recreate *The Legend of Zelda: Link's Awakening DX* for the web with hand-painted Studio Ghibli pre-rendered backgrounds (`1280x1024`) layered over exact Game Boy logical physics (`160x128` at 60 FPS), original `.gbs` / `.wav` audio, and instant real-time switching between Studio Ghibli HD and Original Pixel-Art modes.
Problem: Generating isolated `16x16` AI tiles produces visible grid seams and rigid lighting. Painting each `10x8` room (`160x128` logical -> `1280x1024` display) as a cohesive Studio Ghibli illustration while keeping the exact mathematical collision grid and original C# reference data (`Links-Awakening-DX-HD`) preserves authentic gameplay feel with zero tile seams.
User-facing language: French (dialogues, HUD badges) / English (technical controls).

## Target users
- Players and developers experiencing or building a faithful, modular web remake of *Link's Awakening DX* with Studio Ghibli art direction.

## User roles
- Single player (client-side browser game).
- Developer / AI Agent (using debug overlays `C` and render toggle `G` to build and verify rooms).

## Core features (Completed in Vertical Slice 01)
- **Dual-Render Pre-rendered Room Engine**: Instant `G` toggle between Studio Ghibli HD (`1280x1024`) and reconstructed Pixel-Art reference (`160x128` upscaled `8x`).
- **Exact Game Boy Physics & State Machine**: `1.0 px/frame` movement at 60 FPS, `8x8` feet AABB collision box with smooth X/Y wall-sliding, bed awakening sequence (`SLEEPING -> WAKING -> JUMPING_OUT -> IDLE -> WALKING -> ITEM_GET`).
- **Foreground Occlusion Layer (`*_fg.png`)**: Roof and treetop alpha masks allowing Link to walk behind upper structures.
- **Interactive NPC Dialogue System**: Proximity speech indicator (`💬 [Espace] Parler`), typewriter text box, multi-page French dialogues for Marine & Tarkin.
- **Shield Progression Gate & Equipment**: Tarkin blocks exit until talked to, hands over the Level-1 Shield with the classic `ITEM_GET` overhead pose, and unlocks active shield blocking (`Shift` / `X`).
- **Original Audio Engine**: Authentic Game Boy music exported from `awakening.gbs` (`music_indoor.wav`, `music_outdoor.wav`, `music_marin_sing.wav`) and original `.wav` sound effects (`jump`, `land`, `text_letter`, `text_done`, `item_get`, `door`, `shield`).

## Out of scope (for Slice 01)
- Backend server or user accounts (client-only web engine).

## Success criteria
- Every added room or feature works identically in both Pixel-Art reference mode and Studio Ghibli HD mode, with zero collision drift and 60 FPS performance.

## Constraints
- Native logical space per room must remain `160x128` (`10x8` tiles of `16x16`), scaled `8x` to `1280x1024`.
- All sprite animations must preserve their natural aspect ratio (`renderW`, `renderH`).
