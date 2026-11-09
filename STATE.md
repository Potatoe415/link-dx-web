# STATE

Replace on every update. Max 40 lines. History lives in git and `docs/decisions/`.

Status: Décor Ghibli HD ow_r11_c01 intégré et vérifié (mur sud infranchissable & sentier est fidèle).
Focus: Décors Ghibli extérieurs Village (ow_r11_c00 Bibliothèque ext.) & Forêt extérieure.
Level: L1

Context:
- Working_On: `public/assets/rooms/ow_r11_c00_bg.png`, `src/data/rooms/`
- Relevant_Files: `ow_r11_c01_bg.png`, `mabe_village_overworld.ts`, `toronbo_shores.ts`
- Do_Not_Touch: `_ref_repo/`, `docs/la_dx_knowledge_base/`
- Relevant_Decisions: 0002, 0003, 0004, 0005, 0006

Next:
- Génération & intégration de `ow_r11_c00_bg.png` (Bibliothèque extérieur & falaise côtière ouest).
- Poursuivre les écrans nord du Village (`ow_r08_c01..c03`, `ow_r09_c01`, `ow_r09_c03`).
- Décors Ghibli Forêt extérieure (`ow_r05_c00` Champignon, `ow_r05_c01` Tarin, `ow_r04_c01` Clé).
- Validation des tests de quêtes et affordance des colliders.

Open_Questions:
- None.

Blockers:
- Dungeons & caves frozen until explicit user confirmation.
