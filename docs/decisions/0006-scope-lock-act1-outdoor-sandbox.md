# 0006 — Scope lock on Act 1 Outdoor Sandbox (Village, Plage, Forêt extérieure)

Date: 2026-11-09
Status: Accepted
Decision: Lock the active milestone scope to the 3 core outdoor regions before the first dungeon:
1. **Mabe Village (Village des Mouettes)**: all outdoor screens (`ow_r08..r11, c00..c03`) and 9 village house interiors.
2. **Toronbo Shores (Plage de Toronbo)**: all coastal screens (`ow_r12..r15, c00..c03`) and beach events (Sword L-1, Sea Urchins, Octoroks, Owl cutscene).
3. **Mysterious Forest (Forêt Enchantée) — Extérieur uniquement**: outdoor forest screens only (Toadstool, Witch Hut exterior + brewing interior, Tarin raccoon de-transformation, Tail Key chest, Moblins, Gels). Strictly NO caves, underground passages, or hole interiors (`cave0`, `cave1`, etc.) for now.
4. **Boundary Gate**: Link can collect the Tail Key and reach the Tail Cave exterior door (`ow_r13_c03`), but entering Dungeon 1 or any underground cave is strictly frozen. Advancing beyond this milestone requires explicit confirmation from the user.
Context: The user requested a strict scope freeze to finish 100% of the graphics, colliders, visual affordances, testing, and gameplay polish on the outdoor triad before expanding further.
Rationale: Confining active work to the outdoor sandbox guarantees complete visual fidelity, zero-hallucination backgrounds, flawless collision alignment, and robust testing across all 3 connected zones without scope dilution.
Consequences: Backlog, Master Plan, and active sprints prioritize missing Ghibli backgrounds, sprite animations (Octorok tentacles, Link shield-arm), and playtesting for Village, Beach, and Forest outdoors. Tail Cave and later chapters remain archived in `docs/MASTER_PLAN.md` but are frozen until approved.
Alternatives_Rejected: Expanding into Tail Cave dungeon rooms or underground forest caves before completing the outdoor graphics and tests.
