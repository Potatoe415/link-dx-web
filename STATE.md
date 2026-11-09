# STATE

Replace on every update. Max 40 lines. History lives in git and `docs/decisions/`.

Status: 16-character Studio Ghibli sheet extracted, despilled, sliced and manifest saved.
Focus: Décors Ghibli extérieurs Village & Forêt + intégration dual-pass PNJ.
Level: L1

Context:
- Working_On: `public/assets/ui/ghibli_characters/`, `docs/BACKLOG.md`
- Relevant_Files: `characters_ghibli.png`, `ghibli_characters_manifest.json`, `NpcSystem.ts`
- Do_Not_Touch: `_ref_repo/`, `docs/la_dx_knowledge_base/`
- Relevant_Decisions: 0002, 0003, 0004, 0005, 0006

Next:
- Décors Ghibli Village extérieurs restants (`ow_r11_c01` Bibliothèque avec chemin fidèle, `ow_r08_c01..c03`).
- Décors Ghibli Forêt extérieure (`ow_r05_c00` Champignon, `ow_r05_c01` Tarin, `ow_r04_c01` Clé).
- Câbler le rendu dual-pass des PNJ Ghibli dans `NpcSystem.ts` et `Owl.ts`.
- Validation des tests de quêtes et affordance des colliders.

Open_Questions:
- None.

Blockers:
- Dungeons & caves frozen until explicit user confirmation.
