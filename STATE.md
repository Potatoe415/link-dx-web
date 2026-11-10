# STATE

Replace on every update. Max 40 lines. History lives in git and `docs/decisions/`.

Status: Planches Game Boy 1 & 2 HD générées et validées comme référence exacte.
Focus: Prêt pour génération Planche 1 Ghibli Personnages dès rétablissement de l'API Image.
Level: L1

Context:
- Working_On: Référence Planche 1 (`public/assets/planche_1_village_et_link_hd.png`)
- Specification: Générer les équivalents Studio Ghibli des personnages du Village (Planche 1) en conservant le Link actuel.
- Relevant_Files: `scripts/generate_split_sheets.py`, `public/assets/planche_gameboy.html`
- Do_Not_Touch: `_ref_repo/`, `docs/la_dx_knowledge_base/`
- Relevant_Decisions: 0002, 0003, 0004, 0005, 0006

Next:
- Dès rétablissement API Image : générer la Planche 1 Ghibli adaptée au jeu (Marine, Tarkin, Ulrira, MeowMeow, Toutou, gamins, marchands, etc., Link conservé).
- Décor final du Village des Mouettes : `ow_r08_c03` (Sanctuaire des Rêves).
- Clôture complète des extérieurs du Village des Mouettes (100% Ghibli HD).
- Poursuite du bac à sable extérieur Acte 1 (Plage & Forêt).

Open_Questions:
- None.

Blockers:
- Dungeons & caves frozen until explicit user confirmation.
