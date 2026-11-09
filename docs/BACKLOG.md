# BACKLOG

Current work queue. Synced with `docs/decisions/0006-scope-lock-act1-outdoor-sandbox.md` and `docs/MASTER_PLAN.md`.

> [!IMPORTANT]
> **SCOPE LOCK (Milestone Act 1 Outdoor Sandbox)** :
> Le périmètre actif du projet est strictement verrouillé aux 3 zones extérieures avant le premier donjon :
> 1. **Le Village des Mouettes** (tous les extérieurs + 9 intérieurs).
> 2. **La Plage de Toronbo** (tous les écrans côtiers + quête de l'épée).
> 3. **La Forêt Enchantée (Extérieur uniquement)** : chemins, champignon, sorcière, raton-laveur, coffre de la clé. **Strictement aucune entrée dans les grottes**.
> 
> Tout développement au-delà de cette frontière (Donjon 1 / Cave Flagello, grottes souterraines, Prairie Oukoukou) est **GELÉ** et nécessite une confirmation explicite de l'utilisateur.

---

## 1. Scope Actif : Finition 100% Graphismes & Tests (Village + Plage + Forêt ext.)

### A. Décors Ghibli Extérieurs — Village des Mouettes
- [ ] `ow_r11_c01` (Bibliothèque du village — avec chemin de terre fidèle aux colliders)
- [ ] `ow_r08_c01`, `ow_r08_c02`, `ow_r08_c03` (Rangée nord du village / mare / chenil)
- [ ] `ow_r09_c01`, `ow_r09_c03` (Bordures ouest et est du village)
- [ ] `ow_r10_c00`, `ow_r11_c03` (Puits ouest et prairie aux trous est)

### B. Décors Ghibli Extérieurs — Plage de Toronbo
- [x] Corridor principal : `ow_r12_c02`, `ow_r13_c02`, `ow_r14_c02`, `ow_r15_c02` (Plage de l'Épée).
- [ ] Écrans côtiers ouest et est : `ow_r12_c01`, `ow_r13_c01`, `ow_r14_c01`, `ow_r15_c00`, `ow_r15_c01`, `ow_r15_c03`.

### C. Décors Ghibli Extérieurs — Forêt Enchantée (Extérieur uniquement)
- [ ] `ow_r05_c00` (Clairière du Champignon Magique)
- [ ] `ow_r05_c01` (Clairière de Tarin / Raton-Laveur brumeux)
- [ ] `ow_r04_c01` (Arbre creux & Coffre de la Clé Flagello)
- [ ] `ow_r05_c02` / `ow_r06_c02` (Extérieur de la Hutte de la Sorcière)
- [ ] `ow_r06_c01`, `ow_r07_c01`, `ow_r07_c02` (Chemins de ronde sud de la forêt)

### D. Sprites, Animations & Polish Visuel
- [x] Planche 16 Objets & Props Studio Ghibli HD (Village, Plage, Forêt) intégrée en dual-pass (`G`).
- [x] Planche 16 Personnages & Sprites Studio Ghibli HD (Village, Plage, Forêt) : détourage avec préservation des tuniques vertes, découpe en 16 PNGs individuels (`public/assets/ui/ghibli_characters/`), feuille unifiée `characters_ghibli.png` et manifeste.
- [x] **Sprite pour le bras de Link tenant le bouclier** : posture de garde avec bras relié (`link_guard.png`) et pose victoire (`link_item_get.png`).
- [ ] **Animation des tentacules / pattes des pieuvres (Octoroks)** : frames de marche 4 directions.

### E. Tests, Collisions & Affordance
- [ ] Vérification systématique via `scripts/verify_bg_alignment.py` pour chaque décor (zéro faux chemin, murs végétaux hermétiques).
- [ ] Tests complets de la boucle de quête : Réveil -> Bouclier -> Épée -> Champignon -> Poudre -> Raton-laveur -> Clé Flagello.

---

## 2. GELÉ — Hors Scope (Nécessite Confirmation Utilisateur)

> Les tâches suivantes restent archivées dans `docs/MASTER_PLAN.md` et ne seront entamées qu'après validation explicite :

- [ ] **Cave Flagello (Donjon 1)** : extraction des salles de `dungeon1.map`, portes verrouillées, boussole, carte, Boss Moldorm.
- [ ] **Grottes intérieures de la forêt** : `cave0`, `cave1` (salles souterraines).
- [ ] **Régions suivantes** : Prairie Oukoukou, Marais Goponga, Montagne Tal Tal, Donjons 2 à 8.
