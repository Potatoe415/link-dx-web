# MASTER PLAN VIVANT — Zelda: Link's Awakening DX (Studio Ghibli Web)

> **Règle d'Or pour les Agents LLM :**
> Ce document est la **feuille de route vivante et canonique** du projet.
> 1. Avant de commencer une session, lire `STATE.md` puis repérer dans ce fichier la première tâche non cochée `- [ ]` de la sous-sous-étape en cours.
> 2. Exécuter la tâche selon le protocole déterministe de [`docs/AGENT_FACTORY_PROTOCOL.md`](file:///m:/Users/admin/Documents/DEV/dev-projects/zelda-la-web/docs/AGENT_FACTORY_PROTOCOL.md).
> 3. Vérifier avec `npm run build` (`0` erreur).
> 4. Cocher la case `- [x]` dans ce fichier (`docs/MASTER_PLAN.md`) et mettre à jour `STATE.md`.

---

## Structure Hiérarchique du Plan (4 Niveaux + Matrice Niveau 5)

* **Niveau 1 (`# ÉTAPE N`)** : Macro-Phase du projet (Moteur ou Acte narratif majeur du jeu).
* **Niveau 2 (`## N.M — Sous-Étape`)** : Sous-système technique, région géographique ou donjon complet.
* **Niveau 3 (`### N.M.K — Sous-Sous-Étape`)** : Briques fonctionnelles, groupe d'écrans contigus `(row, col)` ou mécanique précise.
* **Niveau 4 (`- [ ] [T-N.M.K-XX]`)** : Tâche atomique exécutable et vérifiable en une seule passe par un LLM.
* **Niveau 5 ([`docs/plans/STAGE_01_02_MATRIX.md`](file:///m:/Users/admin/Documents/DEV/dev-projects/zelda-la-web/docs/plans/STAGE_01_02_MATRIX.md))** : Dépliage matriciel écran par écran (`EXTRACT` $\rightarrow$ `WIRE_WHITEBOX` $\rightarrow$ `ENTITIES_DIALOGUES` $\rightarrow$ `GHIBLI_PAINT`) généré via [`scripts/generate_stage_matrix.py`](file:///m:/Users/admin/Documents/DEV/dev-projects/zelda-la-web/scripts/generate_stage_matrix.py).

---

# ÉTAPE 1 : SOCLE MOTEUR, PIPELINE & SYSTÈMES TRANSVERSES

## 1.1 — Boucle Moteur, Rendu Dual & Physique de Base
### 1.1.1 — Boucle 60 FPS, Canvas HD (`1280x1024`) & Espace Logique (`160x128`)
- [x] **[T-1.1.1-01]** Initialiser le projet Vite + TypeScript strict (`tsconfig.json`, `package.json`).
- [x] **[T-1.1.1-02]** Implémenter la boucle à pas de temps fixe `60 FPS` (`16.666 ms`) dans `src/main.ts`.
- [x] **[T-1.1.1-03]** Implémenter le rendu Dual-Pass (`useGhibliMode` sur touche `G`) : bascule instantanée entre `*_bg.png` (Studio Ghibli HD) et `*_bg_pixel.png` (Pixel-Art natif x8).
- [x] **[T-1.1.1-04]** Implémenter le calque d'occlusion premier plan (`*_fg.png` / `*_fg_pixel.png`) pour faire passer Link derrière les toits et la cime des arbres.
- [x] **[T-1.1.1-05]** Implémenter le tri vertical (`Y-Sorting`) entre Link et les PNJ/entités de niveau `zIndex = 10`.

### 1.1.2 — Collisions AABB, Glissement Mural & Transitions de Salles
- [x] **[T-1.1.2-01]** Implémenter la boîte de collision des pieds de Link (`8x8` en `[x-4, y-8, 8, 8]`) dans `src/core/Collision.ts`.
- [x] **[T-1.1.2-02]** Implémenter le glissement mural indépendant sur les axes X et Y (`moveWithSlide`) + logique de dégagement anti-blocage (`getOverlapArea`).
- [x] **[T-1.1.2-03]** Implémenter la vue de débogage des collisions (`showColliders` sur touche `C`) : murs en rouge, PNJ en violet, warps en cyan, Link en vert.
- [x] **[T-1.1.2-04]** Implémenter les zones de téléportation (`WarpTrigger`) avec `requiredDirection` et fondu au noir `Camera.ts` (`320 ms`).
- [x] **[T-1.1.2-05]** Ajouter dans `Camera.ts` et `main.ts` la transition par **scrolling directionnel continu** (`160 px` horizontal ou `128 px` vertical en `350 ms`) lorsque Link franchit le bord `North`, `South`, `East` ou `West` d'un écran d'Overworld ou de Donjon vers son voisin (`neighbors.north/south/east/west`).
- [ ] **[T-1.1.2-06]** Gérer les types de tuiles spéciales au sol (`FieldStates` depuis `_ref_repo/InGame/Map/MapStates.cs`) : herbes hautes (ralentissement léger + masque bas des jambes), eau peu profonde (éclaboussures), eau profonde (`SWIMMING` ou noyade), trous (`FALLING_PIT`), escaliers (`stairs` ralentissement `0.5x`).

---

## 1.2 — Outillage Déterministe d'Extraction & Pipeline Audio
### 1.2.1 — Extracteur Mathématique de Cartes (`.map` $\rightarrow$ PNG + JSON)
- [x] **[T-1.2.1-01]** Créer `scripts/extract_room.py` lisant `_ref_repo/Data/Maps/*.map`, `objects.atlas` et `musicOverworld.data` (Overworld, maisons intérieures, grottes et donjons via `--map-file` et `--offset-x`/`--offset-y`).
- [x] **[T-1.2.1-02]** Extraire automatiquement les boîtes de collision `c1..c13`, `lowCollider*`, `colliderL*`, `fence*` (bitmasks `1..15`) et `tree0..9` dans `<id>_manifest.json` et `<id>_grid_ruler.png`.
- [x] **[T-1.2.1-03]** Enrichir `scripts/extract_room.py` pour générer directement le bloc de code TypeScript `RoomDef` (`<id>_room.ts`) prêt à être importé dans `src/data/rooms/`.
- [x] **[T-1.2.1-04]** Découper `src/data/rooms.ts` en sous-fichiers modulaires par région (`src/data/rooms/mabe_village.ts`, `src/data/rooms/toronbo_shores.ts`, `src/data/rooms/mysterious_forest.ts`, `src/data/rooms/dungeon1.ts`, etc.) ré-exportés par `src/data/rooms/index.ts` pour respecter la limite de ~300 lignes par fichier (`AGENTS.md`).

### 1.2.2 — Moteur Audio Original (`.gbs` & `.wav`)
- [x] **[T-1.2.2-01]** Créer `scripts/export_gbs_audio.py` compilant l'émulateur C# `_ref_repo/GbsPlayer/` pour exporter les pistes de `_ref_repo/Data/Music/awakening.gbs` en `.wav` 44.1 kHz.
- [x] **[T-1.2.2-02]** Créer `src/core/Audio.ts` (`SoundManager`) avec lecture des musiques `.gbs`, atténuation automatique (*ducking*) lors des fanfares, clonage des bruitages `.wav` et touche Mute `M`.
- [ ] **[T-1.2.2-03]** Étendre `scripts/export_gbs_audio.py` pour exporter l'ensemble des pistes musicales majeures de `awakening.gbs` (Plage/Overworld avec Épée, Forêt Enchantée, Boutique, Mini-Jeux, Cavernes, Donjons 1 à 8, Combat de Boss, Oeuf Sacré, Générique).

---

## 1.3 — État Global (`GameState`), Inventaire, HUD & Sauvegarde
### 1.3.1 — Gestionnaire de Drapeaux (`GameFlags`) & Progression
- [x] **[T-1.3.1-01]** Créer `src/core/GameState.ts` contenant les **26 drapeaux booléens** de `docs/la_dx_knowledge_base/00_GAME_SYSTEMS_AND_STATE_MACHINE.md` (`FLAG_SHIELD_OBTAINED` à `FLAG_NIGHTMARES_DEFEATED`), l'état des coffres ouverts par salle (`openedChests: Set<string>`), les clés de donjon et les compteurs (Rubis, Coquillages, Quarts de Coeur, Feuilles d'Or).
- [x] **[T-1.3.1-02]** Implémenter la sauvegarde et le chargement automatiques dans `localStorage` (`zelda_la_save_v1`) + bouton de réinitialisation de sauvegarde dans le dashboard de debug.

### 1.3.2 — Bandeau HUD Game Boy (`160x16` logique / `1280x128` HD) & Menu Inventaire
- [ ] **[T-1.3.2-01]** Créer `src/core/HUD.ts` affichant en haut ou en bas du Canvas le bandeau classique : Slot Bouton `B`, Slot Bouton `A`, Compteur de Rubis (3 chiffres `000..999`) et Jauge de Coeurs (de `3` à `14` coeurs par quarts).
- [ ] **[T-1.3.2-02]** Créer l'écran de sous-menu d'inventaire (touche `Tab` ou `I`, son `D360-10-0A.wav`) permettant d'assigner n'importe quel objet possédé (`Bouclier`, `Épée`, `Poudre`, `Plume`, `Bracelet`, `Bombes`, `Arc`, `Grappin`, `Ocarina`, `Bâton de Feu`, `Boomerang`) aux boutons `A` (`Space`/`J`) et `B` (`Shift`/`X`/`K`), et de visualiser les 8 Instruments des Sirènes.

---

## 1.4 — Système d'Entités, Combat, Dégâts & Objets Ramassables
### 1.4.1 — Architecture Générique des Entités & Ennemis (`src/entities/`)
- [ ] **[T-1.4.1-01]** Créer la classe de base `src/entities/Enemy.ts` gérant : points de vie (`hp`), boîte de collision (`hitbox`), états d'IA (`IDLE`, `WANDER`, `CHASE`, `STUNNED`, `KNOCKBACK`, `DYING`), clignotement d'invulnérabilité après coup (`D360-07-07.wav`), explosion de mort (`D378-04-04.wav`) et largage aléatoire de butin (`Coeur`, `Rubis 1`, `Rubis 5`).
- [ ] **[T-1.4.1-02]** Implémenter la prise de dégâts sur Link (`Player.takeDamage`) : recul (*knockback*), clignotement, son de blessure (`D370-03-03.wav`), bip d'alerte à 1 coeur restant, et séquence de `GAME OVER` avec réapparition à la dernière porte franchie.

### 1.4.2 — Objets Interactifs du Monde (Buissons, Pierres, Pots, Coffres, Pancartes)
- [ ] **[T-1.4.2-01]** Implémenter les **Buissons & Herbes coupables** (`bush_0`, `gras` depuis `ObjBush.cs`) : coupés d'un coup d'épée (animation de feuilles éparpillées + son `D378-05-05.wav`), révélant parfois un rubis, un coeur ou un passage secret.
- [ ] **[T-1.4.2-02]** Implémenter les **Pancartes & Statues de Hibou** (`signpost`, `owl_statue`) : lecture du texte en appuyant sur `Espace` face au panneau.
- [ ] **[T-1.4.2-03]** Implémenter les **Coffres au Trésor** (`chest` depuis `ObjChest.cs`) : ouverture avec `Espace` par le bas -> son d'ouverture (`D378-01-01.wav`) -> état `ITEM_GET` avec fanfare (`D368-16-10.wav`) -> enregistrement dans `GameState.openedChests`.

---

# ÉTAPE 2 : ACTE I — DU RÉVEIL À LA CAVE FLAGELLO (CHAPITRES 1 & 2)

## 2.1 — Chapitre 1.1 : Maison de Marine & Remise du Bouclier (`FLAG_SHIELD_OBTAINED`)
### 2.1.1 — Intérieur de la Maison de Marine (`house1.map` / `indoor`)
- [x] **[T-2.1.1-01]** `TASK_ROOM_EXTRACT(indoor)` : Extraire `house1.map`, reconstruire `indoor_bg_pixel.png` et définir les 13 boîtes de collision (murs, lits, pots, commode, malles, table, tabourets).
- [x] **[T-2.1.1-02]** `TASK_ROOM_GHIBLI(indoor)` : Générer le décor peint Studio Ghibli `indoor_bg.png` (`1280x1024`) calé sur la géométrie exacte.
- [x] **[T-2.1.1-03]** Implémenter la séquence cinématique de réveil (`SLEEPING -> WAKING -> JUMPING_OUT -> IDLE`) avec frames top-down du lit (`bed_sleep`, `bed_wake`) et saut parabolique.
- [x] **[T-2.1.1-04]** `TASK_QUEST_WIRE(FLAG_SHIELD_OBTAINED)` : Dialogues français de Marine et Tarkin, blocage de la porte tant que le Bouclier n'est pas récupéré, séquence `ITEM_GET` du Bouclier L-1 et garde active (`Shift`/`X`).

### 2.1.2 — Carré Extérieur Devant la Maison (`ow_r10_c02`)
- [x] **[T-2.1.2-01]** `TASK_ROOM_EXTRACT(ow_r10_c02)` : Extraire l'écran `(row=10, col=2)` de `overworld.map` (`outdoor_bg_pixel.png`) + collisions de la maison, de l'arbre et des barrières.
- [x] **[T-2.1.2-02]** `TASK_ROOM_GHIBLI(ow_r10_c02)` : Générer `outdoor_bg.png` et le masque d'occlusion `outdoor_fg.png` (toit + cime de l'arbre).
- [x] **[T-2.1.2-03]** Animer la girouette (`weathercock`) et les fleurs (`flower`) sur `ow_r10_c02`.

---

## 2.2 — Chapitre 1.2 : Le Village des Mouettes Complet (Grille `r08..r11, c00..c03`)
### 2.2.1 — Écrans Extérieurs du Village des Mouettes (`overworld.map`)
- [x] **[T-2.2.1-01]** `TASK_ROOM_EXTRACT` sur les 11 autres écrans du Village des Mouettes :
  - `ow_r08_c01` (Puits & haut du village), `ow_r08_c02` (Maison de Mme Miaou & Toutou), `ow_r08_c03` (Boutique d'outils)
  - `ow_r09_c01` (Maison des quadruplés), `ow_r09_c02` (Place centrale & girouette nord), `ow_r09_c03` (Étang de pêche)
  - `ow_r10_c00` (Entrée ouest), `ow_r10_c01` (Enfants jouant à la balle), `ow_r10_c03` (Jeu de hasard *Trendy Game*)
  - `ow_r11_c01` (Bibliothèque du village), `ow_r11_c02` (Maison de Pépé le Ramollo & Cabine téléphonique), `ow_r11_c03` (Prairie aux trous).
- [ ] **[T-2.2.1-02]** `TASK_ROOM_GHIBLI` sur `ow_r10_c01`, `ow_r11_c01`, `ow_r11_c02`, `ow_r11_c03` (zone sud du village).
- [ ] **[T-2.2.1-03]** `TASK_ROOM_GHIBLI` sur `ow_r08_c01`, `ow_r08_c02`, `ow_r08_c03`, `ow_r09_c01`, `ow_r09_c02`, `ow_r09_c03`, `ow_r10_c03` (zone nord et est du village).

### 2.2.2 — Intérieurs & Habitants du Village des Mouettes
- [ ] **[T-2.2.2-01]** Extraire et câbler les intérieurs du village depuis `_ref_repo/Data/Maps/` : Bibliothèque (`library`), Maison de Pépé le Ramollo (`ulrira`), Cabine téléphonique (`phonebooth`), Maison de Mme Miaou (`meow_house`), Boutique (`shop`), Jeu de hasard (`trendy_game`).
- [ ] **[T-2.2.2-02]** `TASK_ENTITY_PORT` : Porter les PNJ du village (`ObjBallChildren`, `ObjBowWow` enchaîné devant sa niche, `ObjUlrira`, `ObjShopKeeper`, `ObjTrendy`, `ObjCucco` poules).
- [ ] **[T-2.2.2-03]** Générer les décors Studio Ghibli des intérieurs principaux du village.

---

## 2.3 — Chapitre 1.3 : Descente vers la Plage Coco & Obtention de l'Épée (`FLAG_SWORD_OBTAINED`)
### 2.3.1 — Sentier Côtier & Oursins (`ow_r12_c01` à `ow_r15_c03`)
- [ ] **[T-2.3.1-01]** `TASK_ROOM_EXTRACT` sur les écrans de la Plage Coco (*Toronbo Shores*) : `ow_r12_c01`, `ow_r12_c02`, `ow_r13_c01`, `ow_r13_c02`, `ow_r14_c01`, `ow_r14_c02`, `ow_r15_c00`, `ow_r15_c01`, `ow_r15_c02` (écran de l'Épée), `ow_r15_c03`.
- [ ] **[T-2.3.1-02]** `TASK_ENTITY_PORT(sea_urchin)` : Porter `ObjSeaUrchin.cs` (les oursins piquants qui bloquent le chemin et que Link doit **repousser avec son Bouclier levé** + son `D360-62-3E.wav`).
- [ ] **[T-2.3.1-03]** `TASK_ENTITY_PORT(octorok)` : Porter `EnemyOctorok.cs` (marche 4 directions + tir de rocher que le Bouclier L-1 dévie avec `D360-11-0B.wav`).
- [ ] **[T-2.3.1-04]** `TASK_ROOM_GHIBLI` sur la séquence d'écrans menant à la plage (`ow_r12_c02` $\rightarrow$ `ow_r15_c02`) avec vagues animées (`wave1`, `wave2`).

### 2.3.2 — Ramassage de l'Épée, Hibou & Attaque à l'Épée (`SWORD_SLASH`)
- [ ] **[T-2.3.2-01]** `TASK_ENTITY_PORT(sword_beach)` : Porter `ObjSwordSpawner.cs` sur `ow_r15_c02`. Quand Link touche l'épée échouée dans le sable : joue la fanfare de l'Épée (Piste #14 de `awakening.gbs`), active `FLAG_SWORD_OBTAINED`, affiche la pose `ITEM_GET` de l'Épée.
- [ ] **[T-2.3.2-02]** `TASK_ENTITY_PORT(owl)` : Porter `ObjOwl.cs` (arrivée en vol du Hibou sur `ow_r15_c02` juste après le ramassage de l'Épée, dialogue français indiquant la Forêt Enchantée et la Cave Flagello, puis envol).
- [ ] **[T-2.3.2-03]** Implémenter l'état `SWORD_SLASH` et `SWORD_CHARGING` / `SPIN_ATTACK` dans `src/entities/Player.ts` :
  - Coup d'épée en arc 180° (`D378-02-02.wav`),
  - Maintien de la touche d'épée (`Space`/`J`) -> charge (`D360-04-04.wav`) -> Attaque Tournoyante 360° (`D378-03-03.wav`),
  - Découpe des buissons, herbes et élimination des Octoroks et Oursins.

---

## 2.4 — Chapitre 1.4 : La Forêt Enchantée, la Sorcière & la Clé Flagello (`FLAG_TAIL_KEY_OBTAINED`)
### 2.4.1 — Écrans de la Forêt Enchantée & Plaine Koholint (`ow_r04_c00` à `ow_r07_c05`)
- [ ] **[T-2.4.1-01]** `TASK_ROOM_EXTRACT` sur les écrans de la Forêt Enchantée (`ow_r04_c00..c03`, `ow_r05_c00..c03`, `ow_r06_c00..c03`, `ow_r07_c00..c03`) + grotte du tronc creux (`forest_cave.map`) + Plaine Koholint & Cabane de la Sorcière (`ow_r05_c04`, `ow_r06_c04`, `witch_hut.map`).
- [ ] **[T-2.4.1-02]** `TASK_ENTITY_PORT` : Porter `EnemyMoblin.cs` (Moblins à lance et à épée/bouclier), `EnemyMiniMoldorm.cs` et `EnemyKeese.cs` (chauves-souris de la grotte) + rochers poussables (`ObjMoveStone.cs`).
- [ ] **[T-2.4.1-03]** `TASK_ROOM_GHIBLI` sur les écrans de la Forêt Enchantée (avec brume légère et arbres géants Ghibli) et la Cabane de la Sorcière.

### 2.4.2 — Quête du Champignon, Poudre Magique, Raton-Laveur & Clé Flagello
- [ ] **[T-2.4.2-01]** `TASK_ENTITY_PORT(sleepy_toadstool)` : Ramassage du **Champignon** (`toadstool`) au sortir de la grotte de la forêt (`ow_r05_c00`).
- [ ] **[T-2.4.2-02]** `TASK_QUEST_WIRE(witch_magic_powder)` : Remettre le Champignon à la Sorcière Syrup (`witch_hut`) -> animation de brassage du chaudron -> obtention de la **Poudre Magique** (`powder`) équipable.
- [ ] **[T-2.4.2-03]** `TASK_ENTITY_PORT(raccoon_tarin)` : Porter `ObjRaccoon.cs` sur `ow_r05_c01` (le raton-laveur farceur qui téléporte Link dans une boucle tant qu'on monte sans lui jeter de Poudre Magique).
- [ ] **[T-2.4.2-04]** `TASK_QUEST_WIRE(FLAG_TAIL_KEY_OBTAINED)` : Utiliser la Poudre Magique sur le raton-laveur -> transformation en Tarkin -> accès au coffre au nord (`ow_r04_c01`) -> obtention de la **Clé Flagello** (`tail_key`) + intervention du Hibou.

---

## 2.5 — Chapitre 2 : Niveau 1 — La Cave Flagello (*Tail Cave* / `FLAG_DUNGEON_1_COMPLETED`)
### 2.5.1 — Entrée & Salles de la Cave Flagello (`dungeon1.map`)
- [ ] **[T-2.5.1-01]** `TASK_ROOM_EXTRACT` sur l'entrée extérieure de la Cave Flagello (`ow_r13_c03`) : serrure de la Clé Flagello qui ouvre la grille du donjon.
- [ ] **[T-2.5.1-02]** `TASK_ROOM_EXTRACT` sur toutes les salles de `_ref_repo/Data/Maps/dungeon1.map` (`d1_r*_c*`) + salle de passage souterrain 2D (`2d` side-scrolling vers la Plume de Roc).
- [ ] **[T-2.5.1-03]** Implémenter les mécaniques de donjon de base (`src/entities/DungeonProps.ts`) :
  - Portes verrouillées (`smallkey`), portes fermées s'ouvrant à l'élimination des ennemis, portes à bouton au sol (`ObjButton`),
  - Carte, Boussole, Bec de Pierre (`stonebeak`) + indices sur les statues de hibou, Clé du Boss (`nightmarekey`),
  - Pièges à lames (`EnemyBladeTrap.cs`), Stalfos (`EnemyStalfos.cs`), Gels/Zols (`EnemyGel.cs`), Spiked Beetles (`EnemySpinyBeetle.cs` retournables avec le Bouclier !), Trois-de-Coeur (`EnemyCardBoy.cs`).
- [ ] **[T-2.5.1-04]** `TASK_ROOM_GHIBLI` sur les salles de la Cave Flagello (`dungeon1.map`).

### 2.5.2 — La Plume de Roc, Mini-Boss *Rolling Bones* & Boss *Moldorm*
- [ ] **[T-2.5.2-01]** `TASK_ENTITY_PORT(rocs_feather)` : Obtention de la **Plume de Roc** (`feather`) -> débloque l'état `JUMPING` à tout moment pour sauter par-dessus les trous et les ennemis (`D360-13-0D.wav`).
- [ ] **[T-2.5.2-02]** `TASK_ENTITY_PORT(mboss_rolling_bones)` : Porter `_ref_repo/InGame/GameObjects/MidBoss/MBossRollingBones.cs` (sauter par-dessus son rouleau à pointes avec la Plume de Roc) + portail de téléportation mid-donjon.
- [ ] **[T-2.5.2-03]** `TASK_ENTITY_PORT(boss_moldorm)` : Porter `_ref_repo/InGame/GameObjects/Bosses/BossMoldorm.cs` (ver géant accélérant quand on frappe le bout de sa queue, avec rebond vers la fosse en contrebas si Link tombe).
- [ ] **[T-2.5.2-04]** `TASK_QUEST_WIRE(FLAG_DUNGEON_1_COMPLETED)` : Réceptacle de Coeur (+1 coeur max) + Salle de l'Instrument -> obtention du **Violon des Vagues** (*Full Moon Cello*, 1/8) avec la mélodie originale de `awakening.gbs`.

---

# ÉTAPE 3 : ACTE II — TOUTOU, LE MARAIS & LA GROTTE DU GÉNIE (CHAPITRE 3)

## 3.1 — Enlèvement & Sauvetage de Toutou (`FLAG_BOWWOW_RESCUED`)
### 3.1.1 — Repaire des Moblins dans les Montagnes (`moblin_cave.map`)
- [ ] **[T-3.1.1-01]** `TASK_QUEST_WIRE(FLAG_BOWWOW_KIDNAPPED)` : Au retour au village après le Donjon 1, les enfants annoncent l'enlèvement de Toutou par les Moblins.
- [ ] **[T-3.1.1-02]** `TASK_ROOM_EXTRACT` & `TASK_ROOM_GHIBLI` sur le Plateau Tartare ouest (`ow_r02_c03`, `ow_r02_c04`) et la Grotte des Moblins (`moblin_cave`).
- [ ] **[T-3.1.1-03]** `TASK_ENTITY_PORT(mboss_king_moblin)` : Porter `MBossKingMoblin.cs` (charges contre le mur où il s'assomme).
- [ ] **[T-3.1.1-04]** `TASK_QUEST_WIRE(FLAG_BOWWOW_RESCUED)` : Libérer Toutou (`ObjBowWow.cs` en mode compagnon qui suit Link au bout de sa chaîne et dévore les ennemis et les fleurs Goponga).

## 3.2 — Niveau 2 : Marais des Anémones & Grotte du Génie (`FLAG_DUNGEON_2_COMPLETED`)
### 3.2.1 — Traversée du Marais (`ow_r02_c02` à `ow_r03_c04`) & Salles de `dungeon2.map`
- [ ] **[T-3.2.1-01]** `TASK_ROOM_EXTRACT` & `TASK_ROOM_GHIBLI` sur le Marais des Anémones (*Goponga Swamp*) ; Toutou mange les fleurs géantes (`goponga_flower`) pour dégager l'entrée de la Grotte du Génie.
- [ ] **[T-3.2.1-02]** `TASK_ROOM_EXTRACT` & `TASK_ROOM_GHIBLI` sur toutes les salles de `_ref_repo/Data/Maps/dungeon2.map`.
- [ ] **[T-3.2.1-03]** Porter les ennemis spécifiques du Donjon 2 : `EnemyBooBuddy.cs` (fantômes sensibles aux torches allumées), `EnemyMaskMimic.cs` (Shy Guy qui imite les mouvements inversés de Link), `EnemyPolsVoice.cs` et l'énigme des 3 monstres dans l'ordre (`Lapin -> Chauve-souris -> Squelette`).

### 3.2.2 — Bracelet de Force L-1, Mini-Boss *Hinox* & Boss *Génie*
- [ ] **[T-3.2.2-01]** `TASK_ENTITY_PORT(power_bracelet)` : Obtention du **Bracelet de Force L-1** (`stonelifter`) -> débloque les états `LIFTING` / `CARRYING` / `THROWING` dans `Player.ts` pour soulever et lancer les jarres et les crânes (`D370-02-02.wav` / `D360-08-08.wav`).
- [ ] **[T-3.2.2-02]** `TASK_ENTITY_PORT(mboss_hinox)` & `TASK_ENTITY_PORT(boss_genie)` : Porter `MBossHinox.cs` et `BossGenie.cs` (fracasser la jarre du Génie contre le mur en la soulevant avec le Bracelet de Force).
- [ ] **[T-3.2.2-03]** `TASK_QUEST_WIRE(FLAG_DUNGEON_2_COMPLETED)` : Obtention du **Cor du Conque** (*Conch Horn*, 2/8) + retour de Toutou chez Mme Miaou (récompense : baiser de Mme Miaou).

---

# ÉTAPE 4 : ACTE III — PRAIRIE OUKOUKOU, CHÂTEAU CANULET & CAVE AUX CLÉS (CHAPITRE 4)

## 4.1 — La Prairie Oukoukou, la Villa de Richard & le Château Canulet (`FLAG_RICHARD_LEAVES_OBTAINED`)
### 4.1.1 — Écrans de la Prairie Oukoukou & Villa de Richard
- [ ] **[T-4.1.1-01]** `TASK_ROOM_EXTRACT` & `TASK_ROOM_GHIBLI` sur la Prairie Oukoukou (`ow_r08_c04..c08` à `ow_r13_c04..c08`) et la Villa des Grenouilles de Richard (`richard_house`).
- [ ] **[T-4.1.1-02]** `TASK_ENTITY_PORT(banana_kiki)` : Quête du singe Kiki devant les douves du Château Canulet (lui donner les bananes issues de la chaîne d'échanges -> les singes construisent le pont et laissent un bâton).

### 4.1.2 — Le Château Canulet (`castle.map`) & les 5 Feuilles d'Or (`FLAG_SLIME_KEY_OBTAINED`)
- [ ] **[T-4.1.2-01]** `TASK_ROOM_EXTRACT` & `TASK_ROOM_GHIBLI` sur les cours extérieures et les salles intérieures de `_ref_repo/Data/Maps/castle.map`.
- [ ] **[T-4.1.2-02]** Porter les 5 épreuves des **Feuilles d'Or** (`goldLeaf` 1 à 5) : corbeau perché, bombardier des trous, soldats de la cour, portes peintes piégées, et Chevalier au Fléau (`MBossBallAndChain.cs`).
- [ ] **[T-4.1.2-03]** `TASK_QUEST_WIRE(FLAG_SLIME_KEY_OBTAINED)` : Remettre les 5 Feuilles d'Or à Richard -> pousser la statue de grenouille -> traverser le souterrain et le champ de pièges -> creuser avec la **Pelle** (`shovel`) devant la statue de hibou pour déterrer la **Clé Slime**.

## 4.2 — Niveau 3 : La Cave aux Clés (*Key Cavern* / `FLAG_DUNGEON_3_COMPLETED`)
### 4.2.1 — Salles de `dungeon3.map`, Bottes de Pégase & Boss *Slime Eye*
- [ ] **[T-4.2.1-01]** `TASK_ROOM_EXTRACT` & `TASK_ROOM_GHIBLI` sur toutes les salles de `_ref_repo/Data/Maps/dungeon3.map`.
- [ ] **[T-4.2.1-02]** `TASK_ENTITY_PORT(pegasus_boots)` : Obtention des **Bottes de Pégase** (`pegasusBoots`) -> débloque l'état `DASHING` dans `Player.ts` (course d'élan qui brise les cristaux noirs et permet des sauts longs de 3 tuiles en la combinant avec la Plume de Roc !).
- [ ] **[T-4.2.1-03]** `TASK_ENTITY_PORT(mboss_dodongo)` & `TASK_ENTITY_PORT(boss_slime_eye)` : Porter `MBossDodongoSnake.cs` (lui jeter des bombes dans la gueule) et `BossSlimeEye.cs` (séparer les deux yeux géants d'une charge aux Bottes de Pégase).
- [ ] **[T-4.2.1-04]** `TASK_QUEST_WIRE(FLAG_DUNGEON_3_COMPLETED)` : Obtention de la **Cloche des Algues** (*Sea Lily's Bell*, 3/8).

---

# ÉTAPE 5 : ACTE IV — OCARINA, DÉSERT DE YARNA & ABÎME DU POISSON (CHAPITRE 5)

## 5.1 — Grotte des Rêves, Ocarina, Chant de Marine & Désert de Yarna (`FLAG_ANGLER_KEY_OBTAINED`)
### 5.1.1 — L'Ocarina & la Ballade du Poisson-Rêve (`FLAG_OCARINA_OBTAINED` & `FLAG_WALRUS_AWAKENED`)
- [ ] **[T-5.1.1-01]** `TASK_ROOM_EXTRACT` & `TASK_ROOM_GHIBLI` sur le Sanctuaire du Rêve (`dream_shrine.map` au village des Mouettes) -> endormir Link dans le lit -> vaincre les Armos avec les Bottes de Pégase -> obtenir l'**Ocarina** (`FLAG_OCARINA_OBTAINED`).
- [ ] **[T-5.1.1-02]** Retrouver Marine sur la plage (`ow_r15_c04`) -> dialogue sur la falaise face à la mer -> apprendre la **Ballade du Poisson-Rêve** (1ère mélodie de l'Ocarina) et escorter Marine jusqu'au Morse endormi (`ObjWalrus.cs` sur `ow_r12_c11` -> `FLAG_WALRUS_AWAKENED`).

### 5.1.2 — Village des Animaux, Dunes de Yarna & Boss *Lanmola*
- [ ] **[T-5.1.2-01]** `TASK_ROOM_EXTRACT` & `TASK_ROOM_GHIBLI` sur le Village des Animaux (`ow_r08_c11..c13` à `ow_r11_c11..c13`) et les Dunes de Yarna (`ow_r12_c12..c15` à `ow_r15_c12..c15`, sables mouvants `quicksand`).
- [ ] **[T-5.1.2-02]** `TASK_ENTITY_PORT(boss_lanmola)` : Porter `MBossDesertLanmola.cs` dans l'arène de sable mouvant -> obtention de la **Clé Poisson** (`FLAG_ANGLER_KEY_OBTAINED`).

## 5.2 — Niveau 4 : L'Abîme du Poisson (*Angler's Tunnel* / `FLAG_DUNGEON_4_COMPLETED`)
### 5.2.1 — Cascade des Montagnes, Salles de `dungeon4.map`, Palmes & Boss *Angler Fish*
- [ ] **[T-5.2.1-01]** `TASK_ROOM_EXTRACT` & `TASK_ROOM_GHIBLI` sur le pied des Monts Tartare (`ow_r02_c10..c12`) : insérer la Clé Poisson pour assécher la cascade devant le Donjon 4.
- [ ] **[T-5.2.1-02]** `TASK_ROOM_EXTRACT` & `TASK_ROOM_GHIBLI` sur toutes les salles de `_ref_repo/Data/Maps/dungeon4.map`.
- [ ] **[T-5.2.1-03]** `TASK_ENTITY_PORT(flippers)` : Obtention des **Palmes** (`flippers`) -> débloque les états `SWIMMING` et `DIVING` dans toutes les eaux profondes du jeu !
- [ ] **[T-5.2.1-04]** `TASK_ENTITY_PORT(mboss_cue_ball)` & `TASK_ENTITY_PORT(boss_angler_fish)` : Porter `MBossCueBall.cs` et `BossAnglerFish.cs` (combat sous-marin en vue 2D latérale) -> obtention de la **Harpe du Reflux** (*Surf Harp*, 4/8 -> `FLAG_DUNGEON_4_COMPLETED`).

---

# ÉTAPE 6 : ACTE V — LE FANTÔME, LA BAIE DE MARTHA & LE POISSON-CHAT (CHAPITRE 6)

## 6.1 — L'Escorte du Fantôme (`FLAG_GHOST_ESCORT_COMPLETED`)
### 6.1.1 — Maison au Bord de la Baie & Tombe du Cimetière
- [ ] **[T-6.1.1-01]** `TASK_ENTITY_PORT(ghost)` : Porter `ObjGhost.cs` qui rejoint Link après le Donjon 4, l'accompagner à sa maison abandonnée de la Baie de Martha (`ow_r14_c06`), puis à sa tombe fleurie près du cimetière (`ow_r07_c05`) -> `FLAG_GHOST_ESCORT_COMPLETED`.

## 6.2 — Niveau 5 : Le Poisson-Chat (*Catfish's Maw* / `FLAG_DUNGEON_5_COMPLETED`)
### 6.2.1 — Salles de `dungeon5.map`, Grappin (*Hookshot*), *Master Stalfos* & *Slime Eel*
- [ ] **[T-6.2.1-01]** `TASK_ROOM_EXTRACT` & `TASK_ROOM_GHIBLI` sur la Baie de Martha (`ow_r12_c08..c11` à `ow_r15_c08..c11`, plongée sous-marine pour entrer dans la gueule de pierre) et toutes les salles de `_ref_repo/Data/Maps/dungeon5.map`.
- [ ] **[T-6.2.1-02]** `TASK_ENTITY_PORT(mboss_master_stalfos)` & `TASK_ENTITY_PORT(hookshot)` : Porter `MBossMasterStalfos.cs` (4 affrontements successifs dans le donjon) -> obtention du **Grappin** (`hookshot`) et de l'état `HOOKSHOTTING` dans `Player.ts`.
- [ ] **[T-6.2.1-03]** `TASK_ENTITY_PORT(mboss_gohma)` & `TASK_ENTITY_PORT(boss_slime_eel)` : Porter `MBossGohma.cs` et `BossSlimeEel.cs` (tirer le coeur de la murène hors de son trou avec le Grappin) -> obtention du **Marimba du Vent** (*Wind Marimba*, 5/8 -> `FLAG_DUNGEON_5_COMPLETED`).

---

# ÉTAPE 7 : ACTE VI — RUINES ANTIQUES & TEMPLE DU MASQUE (CHAPITRE 7)

## 7.1 — Sanctuaire du Sud & Clé Masque (`FLAG_FACE_KEY_OBTAINED`)
### 7.1.1 — Labyrinthe d'Armos & Chevalier Armos (`armos_temple.map`)
- [ ] **[T-7.1.1-01]** `TASK_ROOM_EXTRACT` & `TASK_ROOM_GHIBLI` sur les Ruines Antiques (`ow_r10_c11..c14` à `ow_r12_c11..c14`) et le Sanctuaire du Sud (`armos_temple`).
- [ ] **[T-7.1.1-02]** `TASK_ENTITY_PORT(mboss_armos_knight)` : Porter `MBossArmosKnight.cs` -> obtention de la **Clé Masque** (`FLAG_FACE_KEY_OBTAINED`) et lecture de la stèle révélant la vérité sur l'Île Cocolint.

## 7.2 — Niveau 6 : Le Temple du Masque (*Face Shrine* / `FLAG_DUNGEON_6_COMPLETED`)
### 7.2.1 — Salles de `dungeon6.map`, Bracelet L-2 & Boss *Façade*
- [ ] **[T-7.2.1-01]** `TASK_ROOM_EXTRACT` & `TASK_ROOM_GHIBLI` sur toutes les salles de `_ref_repo/Data/Maps/dungeon6.map`.
- [ ] **[T-7.2.1-02]** `TASK_ENTITY_PORT(power_bracelet_l2)` : Obtention du **Bracelet de Force L-2** (`stonelifter2`, permet de soulever les statues d'éléphant géantes et les gros rochers).
- [ ] **[T-7.2.1-03]** `TASK_ENTITY_PORT(mboss_smasher)` & `TASK_ENTITY_PORT(boss_facade)` : Porter `MBossSmasher.cs` et `BossFacade.cs` (visage au sol vaincu aux bombes) -> obtention du **Triangle de Corail** (*Coral Triangle*, 6/8 -> `FLAG_DUNGEON_6_COMPLETED`).

---

# ÉTAPE 8 : ACTE VII — LE COQ VOLANT & LA TOUR DU VAUTOUR (CHAPITRE 8)

## 8.1 — Le Chant des Grenouilles, le Coq Volant & la Clé Oiseau (`FLAG_BIRD_KEY_OBTAINED`)
### 8.1.1 — Concert de Mamu, Réveil du Coq Volant (`FLAG_FLYING_ROOSTER_REVIVED`) & Monts Tartare Est
- [ ] **[T-8.1.1-01]** `TASK_QUEST_WIRE(frog_song_of_soul)` : Entrer sous les buissons d'Ukuku avec le Grappin (`mamu_cave`) -> payer 300 rubis à Mamu (`ObjMamu.cs`) -> apprendre le **Chant des Grenouilles de l'Âme** (3e mélodie de l'Ocarina).
- [ ] **[T-8.1.1-02]** `TASK_ENTITY_PORT(flying_rooster)` : Pousser la girouette du village (`ow_r09_c02`), descendre dans le tombeau du coq et jouer le Chant des Grenouilles -> le **Coq Volant** (`ObjCock.cs`) permet à Link de voler au-dessus des gouffres (`FLAG_FLYING_ROOSTER_REVIVED`).
- [ ] **[T-8.1.1-03]** `TASK_ROOM_EXTRACT` & `TASK_ROOM_GHIBLI` sur les Monts Tartare Est (`ow_r00_c08..c15`, `ow_r01_c08..c15`) -> sauver Marine sur le pont suspendu + traverser la grotte de la montagne avec le Coq Volant pour récupérer la **Clé Oiseau** (`FLAG_BIRD_KEY_OBTAINED`).

## 8.2 — Niveau 7 : La Tour du Vautour (*Eagle's Tower* / `FLAG_DUNGEON_7_COMPLETED`)
### 8.2.1 — Les 4 Piliers, Bouclier Miroir & Boss *Grand Vautour* (`dungeon7.map`)
- [ ] **[T-8.2.1-01]** `TASK_ROOM_EXTRACT` & `TASK_ROOM_GHIBLI` sur les 4 étages de `_ref_repo/Data/Maps/dungeon7.map`.
- [ ] **[T-8.2.1-02]** Implémenter la mécanique de la **Boule d'Acier** (`ObjSteelBall.cs`) et la destruction des **4 Piliers** qui fait s'effondrer le 4e étage sur le 3e étage.
- [ ] **[T-8.2.1-03]** `TASK_ENTITY_PORT(mirror_shield)` : Obtention du **Bouclier Miroir L-2** (`mirrorShield`, repousse les flammes et les rayons laser).
- [ ] **[T-8.2.1-04]** `TASK_ENTITY_PORT(mboss_grim_creeper)` & `TASK_ENTITY_PORT(boss_evil_eagle)` : Porter `MBossGrimCreeper.cs` et `BossEvilEagle.cs` (combat au sommet de la tour en vue 2D) -> obtention de l'**Orgue de l'Embellie** (*Organ of Evening Calm*, 7/8 -> `FLAG_DUNGEON_7_COMPLETED`).

---

# ÉTAPE 9 : ACTE VIII — MONTAGNES OUEST & ROC DE LA TORTUE (CHAPITRE 9)

## 9.1 — Réveil de la Tortue de Pierre (`FLAG_TURTLE_ROCK_AWAKENED`)
### 9.1.1 — Monts Tartare Ouest (`ow_r00_c00..c07`, `ow_r01_c00..c07`)
- [ ] **[T-9.1.1-01]** `TASK_ROOM_EXTRACT` & `TASK_ROOM_GHIBLI` sur les Monts Tartare Ouest (bouclier miroir contre le lance-flammes, sauvetage de Marine sur le pont).
- [ ] **[T-9.1.1-02]** `TASK_ENTITY_PORT(boss_turtle_rock)` : Jouer le Chant des Grenouilles devant la Tortue de Pierre (`ow_r00_c00`) -> vaincre la tête animée pour ouvrir l'entrée du Donjon 8 (`FLAG_TURTLE_ROCK_AWAKENED`).

## 9.2 — Niveau 8 : Le Roc de la Tortue (*Turtle Rock* / `FLAG_DUNGEON_8_COMPLETED`)
### 9.2.1 — Salles de `dungeon8.map`, Bâton de Feu (*Magic Rod*) & Boss *Hot Head*
- [ ] **[T-9.2.1-01]** `TASK_ROOM_EXTRACT` & `TASK_ROOM_GHIBLI` sur toutes les salles de `_ref_repo/Data/Maps/dungeon8.map` + machine paveuse de lave (`ObjLavaFiller.cs`).
- [ ] **[T-9.2.1-02]** `TASK_ENTITY_PORT(magic_rod)` : Vaincre le mini-boss boxeur `MBossBlaino.cs` -> obtention du **Bâton de Feu** (`magicRod`, tire des boules de feu qui font fondre les blocs de glace).
- [ ] **[T-9.2.1-03]** `TASK_ENTITY_PORT(boss_hot_head)` : Porter `BossHotHead.cs` (vaincu avec le Bâton de Feu) -> obtention du **Tambour des Marées** (*Thunder Drum*, 8/8 -> `FLAG_DUNGEON_8_COMPLETED`).

---

# ÉTAPE 10 : ACTE FINAL — L'OEUF SACRÉ, LES CAUCHEMARS & L'ÉVEIL (CHAPITRE 10)

## 10.1 — Ouverture de l'Oeuf Sacré & Labyrinthe (`FLAG_EGG_OPENED`)
### 10.1.1 — Concert des 8 Instruments devant l'Oeuf (`ow_r00_c06`) & Labyrinthe (`egg.map`)
- [ ] **[T-10.1.1-01]** `TASK_QUEST_WIRE(FLAG_EGG_OPENED)` : Monter au sommet du Mont Tamaranch (`ow_r00_c06`), jouer la Ballade du Poisson-Rêve entouré des 8 Instruments des Sirènes -> ouverture de l'Oeuf Sacré (`ObjDoorEgg.cs`).
- [ ] **[T-10.1.1-02]** `TASK_ROOM_EXTRACT` & `TASK_ROOM_GHIBLI` sur `_ref_repo/Data/Maps/egg.map` (labyrinthe sans fin dont la séquence de directions est donnée par le livre secret de la bibliothèque du village avec la Loupe).

## 10.2 — Les 6 Formes des Cauchemars & Fin du Jeu (`FLAG_NIGHTMARES_DEFEATED`)
### 10.2.1 — Boss Final (`BossFinal.cs`) & Séquence du Poisson-Rêve (`EndingScreen.cs`)
- [ ] **[T-10.2.1-01]** `TASK_ENTITY_PORT(boss_nightmare)` : Porter `_ref_repo/InGame/GameObjects/Bosses/BossFinal.cs` avec ses **6 phases consécutives** :
  1. *Giant Buzz Blob* (Poudre Magique),
  2. *Agahnim's Shadow* (renvoi des sphères d'énergie à l'Épée),
  3. *Moldorm's Shadow* (coups dans la queue),
  4. *Ganon's Shadow* (esquive des chauves-souris de feu + attaque tournoyante),
  5. *Lanmola's Shadow* (un coup d'épée ou de grappin),
  6. *DethI* (sauter par-dessus ses deux bras oscillants avec la Plume et tirer dans son oeil ouvert à l'Arc ou au Boomerang).
- [ ] **[T-10.2.1-02]** `TASK_QUEST_WIRE(FLAG_NIGHTMARES_DEFEATED)` : Escalier céleste vers le **Poisson-Rêve** (`ObjWindfish.cs`) et l'écran de fin Studio Ghibli (`EndingScreen`).

---

# ÉTAPE 11 : QUÊTES ANNEXES, DONJON DX & COMPLÉTION 100 %

## 11.1 — Le Temple des Couleurs DX (`FLAG_COLOR_DUNGEON_COMPLETED`)
### 11.1.1 — Énigme du Cimetière, `dungeon_color.map` & Tuniques Rouge / Bleue
- [ ] **[T-11.1.1-01]** Énigme des 5 pierres tombales dans le cimetière (`ow_r07_c07`, ordre `Bas, Gauche, Haut, Droite, Haut`).
- [ ] **[T-11.1.1-02]** `TASK_ROOM_EXTRACT` & `TASK_ROOM_GHIBLI` sur `_ref_repo/Data/Maps/dungeon color.map` + énigmes chromatiques + Boss *Hardhit Beetle* (`BossHardhitBeetle.cs`).
- [ ] **[T-11.1.1-03]** Reine des Fées : choix entre la **Tunique Rouge** (attaque `x2`) et la **Tunique Bleue** (défense `x2`) -> `FLAG_COLOR_DUNGEON_COMPLETED`.

## 11.2 — Chaîne des 14 Échanges, 26 Coquillages & 12 Quarts de Coeur
### 11.2.1 — La Séquence des 14 Échanges (`trade0` à `trade13` + Boomerang & Loupe)
- [ ] **[T-11.2.1-01]** Implémenter les 14 étapes d'échange de [`docs/la_dx_knowledge_base/04_COLLECTIBLES_AND_SIDEQUESTS.md`](file:///m:/Users/admin/Documents/DEV/dev-projects/zelda-la-web/docs/la_dx_knowledge_base/04_COLLECTIBLES_AND_SIDEQUESTS.md) : *Peluche Yoshi $\rightarrow$ Ruban $\rightarrow$ Pâtée pour chien $\rightarrow$ Bananes $\rightarrow$ Bâton $\rightarrow$ Rayon de miel $\rightarrow$ Ananas $\rightarrow$ Hibiscus $\rightarrow$ Lettre $\rightarrow$ Balai $\rightarrow$ Hameçon $\rightarrow$ Collier $\rightarrow$ Écaille de Sirène $\rightarrow$ Loupe Magique* + échange final du **Boomerang** dans la grotte de la plage (`ow_r15_c04`).

### 11.2.2 — Les 26 Coquillages Secrets, l'Épée L-2 & les 12 Quarts de Coeur
- [ ] **[T-11.2.2-01]** Placer les 26 Coquillages Secrets (`shell`) selon `04_COLLECTIBLES_AND_SIDEQUESTS.md` et câbler la Maison aux Coquillages (`ow_r10_c10`, `ObjShellHouse.cs`) qui forge l'**Épée de Cocolint L-2** (`sword2`, puissance doublée + rayons laser à pleine vie) à 20 coquillages.
- [ ] **[T-11.2.2-02]** Placer les 12 Quarts de Coeur (`heartMeter`) dans les grottes, fossés et mini-jeux (Pêche et Jeu de Hasard).
