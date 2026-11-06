# 0002 — Pre-rendered Studio Ghibli background + 160x128 collision grid

Date: 2026-11-06
Status: Accepted
Decision: Render each `10x8` room (`160x128` logical space) as a single pre-rendered `1280x1024` Studio Ghibli illustration (`*_bg.png`) paired with its exact `1280x1024` Pixel-Art reference (`*_bg_pixel.png`) and an AABB collision grid in native `160x128` coordinates, in Vanilla TypeScript + HTML5 Canvas 2D.
Context: Generating isolated `16x16` AI tiles produces visible seams and rigid lighting. Full game engine frameworks or C#-to-WASM transpilation add unnecessary complexity for discrete `160x128` Game Boy screens.
Rationale: Pre-rendered room paintings (like *Ni no Kuni* DS or PS1 RPGs) yield cohesive lighting and brushwork with zero tile seams, while running physics in native `160x128` coordinates guarantees authentic `1.0 px/frame` Game Boy feel and instant `G` toggle verification against the original `.map` layout.
Consequences: Each room entry in `src/data/rooms.ts` specifies `bgPixel`, `bgGhibli`, optional `fgPixel`/`fgGhibli` occlusion masks, and `160x128` AABB colliders.
Alternatives_Rejected: AI-generated `16x16` tileset engine (visible grid seams), heavy 2D/3D web frameworks (unnecessary overhead).
