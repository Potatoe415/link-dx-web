# DEBUGGING

How visual alignment, collisions, audio, and build errors are diagnosed and fixed fast.

## Visual & Physics Debugging Tools (Built into the Engine)

1. **Toggle Render Mode (`G` key or `🎨 Switch Render` button)**:
   - Switches instantly between `Studio Ghibli HD` (`*_bg.png`) and `Original Pixel-Art` (`*_bg_pixel.png`).
   - Use this to verify whether a visual issue comes from the Ghibli illustration or from the underlying `.map` layout.
2. **Toggle Collision Grid (`C` key or `📐 Toggle Colliders` button)**:
   - Draws all logical `160x128` boxes directly over the room:
     - **Red/Orange**: Static room colliders (`room.colliders`) — walls, beds, furniture, fences, trees.
     - **Purple**: Solid NPC colliders (`prop.data.collision`) — Marine, Tarkin.
     - **Cyan**: Warp triggers (`room.warpTriggers`) — doorways/transitions.
     - **Lime Green**: Link's `8x8` feet collision box (`[x - 4, y - 8, 8, 8]`).
3. **Toggle Audio (`M` key or `🔊 Toggle Audio` button)**:
   - Mutes/unmutes `.gbs` background music and `.wav` sound effects.

## Common Gotchas & Solutions

| Issue | Root Cause | Fix |
|---|---|---|
| Link cannot move after spawning or jumping | Link's `8x8` feet box `[x-4, y-8, 8, 8]` overlaps a nearby collider | Press `C` to see the green box vs red colliders; adjust spawn/target coordinates in `src/data/rooms/<region>.ts` or `Player.ts`. |
| Exiting a door immediately re-enters the previous room | Target spawn point overlaps the destination room's doorway `triggerBox` | Leave at least `4px` margin between `spawnPoint` feet box `[y-8, y]` and `triggerBox`, and set `requiredDirection` on the `WarpTrigger`. |
| Dark halo ring around foreground mask (`*_fg.png`) | Pasting with a blurred mask onto a black `(0,0,0,0)` RGBA image premultiplies edges with black | Copy the RGB image directly (`fg = im_hd.copy()`) and apply the alpha mask with `fg.putalpha(mask)`. |
| Sprites look squashed or stretched | Forcing non-square sprites into `16x16` | Set `renderW` and `renderH` proportional to the cropped pixel dimensions (`w`, `h`) in `src/data/animations.ts`. |
| `overworld.map` room coordinates shifted by 1 tile | `overworld.map` has `MapOffsetX = 1` on line 1 | Always add `+1` tile (`+16px`) to X when extracting rooms from `_ref_repo/Data/Maps/overworld.map`. |

## Error Catalog

| Code | Scope | Meaning |
|---|---|---|
| `E_ENGINE_001` | `main.ts` | Canvas `#game-canvas` or 2D context unavailable |
| `E_ASSET_001` | `main.ts` | Image asset failed to load (falls back gracefully with warning) |
| `E_AUDIO_001` | `Audio.ts` | Browser blocked audio autoplay prior to first user interaction |

## Bug Workflow

1. Reproduce in the browser (`http://127.0.0.1:5173/`) with `C` (colliders) and `G` (render mode) active.
2. Locate the exact coordinate or state in `src/data/rooms/<region>.ts`, `src/data/animations.ts`, or `src/entities/Player.ts`.
3. Fix the root cause, not the symptom.
4. Run `npm run build` (`tsc && vite build`) to verify zero TypeScript or bundler errors.
