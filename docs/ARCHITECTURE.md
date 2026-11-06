# ARCHITECTURE

Agents propose changes; the user confirms before any edit.
Every stack choice also gets a decision in `docs/decisions/`.

## Stack

| Layer | Choice |
|---|---|
| Frontend | Vanilla TypeScript + HTML5 Canvas 2D (`1280x1024` display / `160x128` logical) |
| Backend | None (Static Client-Side SPA) |
| Database | In-memory state (future: `localStorage` save slots) |
| Runtime | Modern Web Browser (ES2020+) + Python 3 (offline asset/audio pipeline scripts) |
| Build & Dev Server | Vite 5 + TypeScript 5.5 (`tsc && vite build`) |
| Package manager | `npm` |
| Audio | HTML5 Audio (`SoundManager`) playing original `.wav` SFX & `.gbs`-rendered tracks |
| Reference Sources | `_ref_repo/` (`Links-Awakening-DX-HD` v1.0.0 C# data) & `docs/la_dx_knowledge_base/` |

## Repository Hierarchy

```text
zelda-la-web/
├── AGENTS.md                        # Canonical instructions & invariants for AI agents & devs
├── STATE.md                         # Current project state, focus, and next steps (<40 lines)
├── README.md                        # Quickstart guide & overview for developers
├── index.html                       # Canvas viewport (1280x1024) + debug dashboard UI
├── package.json                     # Zero-bloat dependencies (TypeScript + Vite only)
├── tsconfig.json                    # Strict TypeScript configuration
├── public/
│   └── assets/
│       ├── indoor_bg.png            # 1280x1024 Studio Ghibli painted Marin's House
│       ├── indoor_bg_pixel.png      # 1280x1024 Pixel-perfect reconstructed house1.map
│       ├── outdoor_bg.png           # 1280x1024 Studio Ghibli painted Mabe Village 10x8
│       ├── outdoor_bg_pixel.png     # 1280x1024 Pixel-perfect reconstructed overworld.map
│       ├── outdoor_fg.png           # 1280x1024 Ghibli foreground occlusion (roof & tree top)
│       ├── outdoor_fg_pixel.png     # 1280x1024 Pixel-Art foreground occlusion
│       ├── spritesheet.png          # 1024x1024 RGBA top-down Ghibli spritesheet
│       └── audio/                   # Original WAV sound effects & GBS music tracks
├── src/
│   ├── main.ts                      # GameEngine: 60 FPS fixed-timestep loop, Y-sorted render, UI
│   ├── core/
│   │   ├── Audio.ts                 # SoundManager: GBS music playback, ducking, WAV SFX cloning
│   │   ├── Camera.ts                # Fade-out / Fade-in room transition controller
│   │   ├── Collision.ts             # AABB intersection, X/Y wall-sliding, unstick, warp checks
│   │   ├── Dialogue.ts              # Proximity detection, typewriter box, Item-Get callback
│   │   └── Input.ts                 # Keyboard state (WASD/ZQSD/Arrows, Space/Enter/E, Shift/X)
│   ├── data/
│   │   ├── animations.ts            # Sprite frame rects, origins, renderW/renderH, frame timings
│   │   └── rooms.ts                 # Declarative room definitions (colliders, warps, props, dialogues)
│   └── entities/
│       ├── Player.ts                # Link state machine, movement, shield rendering, Item-Get pose
│       └── Prop.ts                  # Animated NPCs/props (Marin, Tarin, Weathercock, Flowers) + Particles
├── docs/
│   ├── PRODUCT.md                   # Product scope, features, and constraints
│   ├── ARCHITECTURE.md              # Stack, folder hierarchy, module map, and engine rules
│   ├── ROADMAP_PLANS.md             # Modular step-by-step plans & expansion strategies
│   ├── ASSET_PIPELINE.md            # How to extract maps, generate Ghibli art, and slice sprites
│   ├── BACKLOG.md                   # Prioritized Now / Next / Later tasks
│   ├── DEBUGGING.md                 # Visual collider/render debugging & error catalog
│   ├── SECURITY.md                  # Security & dependency baseline
│   ├── RUNBOOK.md                   # Setup, build, and asset regeneration procedures
│   ├── decisions/                   # Architectural Decision Records (ADRs)
│   ├── _templates/                  # Bootstrap v10.1 templates
│   └── la_dx_knowledge_base/        # Complete 7-part Link's Awakening DX walkthrough & systems spec
├── scripts/
│   ├── export_gbs_audio.py          # Compiles GbsPlayer and exports original .gbs tracks to .wav
│   └── kb_scraper_archive/          # Archived one-off scripts used to build la_dx_knowledge_base
└── _ref_repo/                       # Cloned Links-Awakening-DX-HD v1.0.0 C# source & raw assets (gitignored)
```

## Module Map (Current Engine Structure)

| Module / File | Purpose | Owns data | May depend on |
|---|---|---|---|
| `src/core/Input.ts` | Keyboard & action state tracking per frame | `keysDown`, `keysJustPressed` | None |
| `src/core/Camera.ts` | Screen fade-out / fade-in transitions | `fadeAlpha`, `transitionState` | None |
| `src/core/Audio.ts` | Original `.wav` SFX & `.gbs` music playback + ducking | `sfxBuffers`, `musicElements` | None |
| `src/core/Collision.ts` | Pure AABB math, wall-sliding, warp trigger checks | Stateless | `src/data/rooms.ts` (types) |
| `src/core/Dialogue.ts` | NPC proximity prompt, typewriter dialogue box, callbacks | `talkCounts`, active page state | `Audio`, `Player`, `Prop` |
| `src/data/animations.ts` | Sprite atlas coordinates, origins, aspect ratios, timings | `ANIMATIONS` | None |
| `src/data/rooms.ts` | Declarative room definitions (`indoor`, `outdoor`, etc.) | `ROOMS` | None |
| `src/entities/Prop.ts` | Looping animated NPCs/props & ambient particle system | `PropInstance`, `ParticleSystem` | `rooms.ts`, `animations.ts` |
| `src/entities/Player.ts` | Link state machine, movement, shield & Item-Get rendering | Position, state, equipment flags | `Input`, `Collision`, `Audio`, `animations` |
| `src/main.ts` | Fixed 60 FPS game loop, Y-sorting renderer, debug HUD | `GameEngine` | All above |

## Conventions

- **Coordinate Space**: Always author room colliders, warp triggers, and prop positions in native `160x128` coordinates. Never hardcode `1280x1024` coordinates in game logic (except screen-space UI overlays in `Dialogue.ts`).
- **Adding a Room**: Adding a new screen requires only adding its entry to `src/data/rooms.ts` and placing its background images in `public/assets/`. No engine changes required.
- **Verification**: Always run `npm run build` (`tsc && vite build`) after any code change.
