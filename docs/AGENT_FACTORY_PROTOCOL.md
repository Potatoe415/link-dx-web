# Protocole Usine à Agents (LLM Vibe-Coding Factory Protocol)

Ce document définit le **protocole mathématique, déterministe et atomique** permettant à un LLM (ou une flotte de sous-agents en parallèle) d'exécuter des centaines ou des milliers de micro-tâches pour reconstruire l'intégralité de *The Legend of Zelda: Link's Awakening DX* sans dérive, sans hallucination de coordonnées et sans erreur d'échelle.

---

## 1. Lois Mathématiques & Adressage Déterministe

Aucun agent ne doit jamais « deviner » une coordonnée, une taille de boîte de collision ou un numéro de piste audio. Tout est régi par les équations de conversion suivantes à partir de `_ref_repo/` :

### 1.1. Adressage Universel des Écrans (`roomId`)
* **Overworld (Matrice $16 \times 16 = 256$ écrans) :**
  $$\text{roomId} = \texttt{ow\_r\{RR\}\_c\{CC\}} \quad \text{avec } RR \in [00..15], \; CC \in [00..15]$$
  *(Exemple : l'extérieur de la maison de Marine est `ow_r10_c02`.)*
* **Intérieurs & Grottes :**
  $$\text{roomId} = \texttt{\{mapName\}\_r\{RR\}\_c\{CC\}} \quad (\text{ex: } \texttt{house1\_r00\_c00})$$
* **Donjons (1 à 8 + Donjon des Couleurs) :**
  $$\text{roomId} = \texttt{d\{N\}\_r\{RR\}\_c\{CC\}} \quad (\text{ex: } \texttt{d1\_r07\_c03})$$

### 1.2. Formules de Conversion Spatiale Exactes
Dans `_ref_repo/Data/Maps/overworld.map`, l'en-tête définit $\text{MapOffsetX} = 1$ et $\text{MapOffsetY} = 0$.
Pour tout écran $(CC, RR)$ :
1. **Origine en tuiles ($16\times 16$) dans `.map` :**
   $$\text{TileCol}_0 = 10 \cdot CC + \text{MapOffsetX}, \qquad \text{TileRow}_0 = 8 \cdot RR + \text{MapOffsetY}$$
2. **Origine en pixels monde dans `.map` :**
   $$X_{\text{world}} = 16 \cdot \text{TileCol}_0, \qquad Y_{\text{world}} = 16 \cdot \text{TileRow}_0$$
3. **Coordonnées logiques locales dans la salle ($160 \times 128$) :**
   $$x_{\text{local}} = X_{\text{obj}} - X_{\text{world}} \in [0, 160), \qquad y_{\text{local}} = Y_{\text{obj}} - Y_{\text{world}} \in [0, 128)$$
4. **Coordonnées d'affichage Canvas HD ($1280 \times 1024$, facteur $\times 8$) :**
   $$X_{\text{canvas}} = 8 \cdot x_{\text{local}} \in [0, 1280), \qquad Y_{\text{canvas}} = 8 \cdot y_{\text{local}} \in [0, 1024)$$
5. **Boîte de collision des pieds de Link ($8 \times 8$ centrée en bas sur $(x, y)$) :**
   $$\text{PlayerBox}(x, y) = [x - 4, \; y - 8, \; 8, \; 8]$$
6. **Règle anti-boucle sur les `WarpTrigger` :**
   Tout point d'arrivée `(targetX, targetY)` après une transition de porte doit vérifier :
   $$\text{PlayerBox}(\text{targetX}, \text{targetY}) \cap \text{triggerBox}_{\text{retour}} = \emptyset \quad (\text{marge minimale } \ge 4\text{ px})$$
   et chaque `WarpTrigger` de porte doit spécifier `requiredDirection` (`1` = Haut pour entrer, `3` = Bas pour sortir).

---

## 2. Les 4 Types de Tâches Atomiques pour LLM

Toute la construction du jeu se décompose en **4 opérateurs atomiques**. Un agent reçoit un opérateur et un identifiant, exécute la recette mécanique et valide la sortie avec `npm run build`.

---

### Opérateur A : `TASK_ROOM_EXTRACT(roomId, map, col, row)`
**But :** Extraire mathématiquement un écran `10x8` depuis `_ref_repo` et le rendre 100 % jouable en mode Whitebox Pixel-Art.

1. **Exécuter la commande déterministe :**
   ```powershell
   python scripts/extract_room.py --overworld-row <RR> --overworld-col <CC> --out-id <roomId>
   ```
   *(ou `--map <file.map> --room-row <RR> --room-col <CC> --out-id <roomId>` pour un intérieur/donjon).*
2. **Lire le fichier généré `public/assets/rooms/<roomId>_manifest.json` :**
   - Copier le tableau `colliders` (généré automatiquement depuis `c1..c13`, `fence*`, `tree*`, `pot_1`, etc. dans `GameObjectTemplates.cs`).
   - Copier `neighbors` (`north`, `south`, `east`, `west`) et les `warp` (`door`, `stairs`).
   - Copier `musicTrackId`. Si la piste `.gbs` n'est pas encore exportée dans `public/assets/audio/`, l'ajouter dans `scripts/export_gbs_audio.py` et l'exécuter.
3. **Ajouter l'entrée dans `src/data/rooms.ts` :**
   - `bgPixel: '/assets/rooms/<roomId>_bg_pixel.png'`
   - `bgGhibli: '/assets/rooms/<roomId>_bg_pixel.png'` *(fallback temporaire tant que l'Opérateur B n'a pas été lancé sur cet écran).*
4. **Critère de validation (`Gate A`) :** `npm run build` passe à `0` erreur + les boîtes rouges en mode `C` correspondent à `<roomId>_grid_ruler.png`.

---

### Opérateur B : `TASK_ROOM_GHIBLI(roomId)`
**But :** Transformer un écran déjà extrait en illustration peinte Studio Ghibli `1280x1024` parfaitement calée sur la grille de collision.

1. **Lire `public/assets/rooms/<roomId>_bg_pixel.png` et `<roomId>_grid_ruler.png`**.
2. **Invoquer `image-generator` avec le contrat de prompt invariant :**
   - *Référence géométrique :* `public/assets/rooms/<roomId>_bg_pixel.png`.
   - *Style :* Peinture gouache / aquarelle Studio Ghibli (Kazuo Oga), lumière naturelle cohérente, vue RPG top-down aux trois-quarts stricte (jamais d'isométrique 45°).
   - *Contrainte géométrique stricte :* Chaque mur, falaise, arbre, barrière, porte et meuble doit occuper **exactement** les mêmes coordonnées `[X0..X1, Y0..Y1]` en `1280x1024` que sur `<roomId>_bg_pixel.png`. Aucun personnage ni ennemi peint dans le décor.
3. **Sauvegarder en `public/assets/rooms/<roomId>_bg.png` (`1280x1024`)**.
4. **Générer le masque d'occlusion premier plan `<roomId>_fg.png` (si toit ou arbre présent) :**
   ```python
   fg = im_hd.copy()
   fg.putalpha(mask_blurred) # JAMAIS de paste() sur fond noir (0,0,0,0)
   fg.save(f'public/assets/rooms/{room_id}_fg.png')
   ```
5. **Brancher `bgGhibli` et `fgGhibli` dans `src/data/rooms.ts`**.
6. **Critère de validation (`Gate B`) :** Basculer `G` + `C` : alignement 1:1 entre les boîtes rouges (`colliders`) et le décor peint Ghibli.

---

### Opérateur C : `TASK_ENTITY_PORT(entityId)`
**But :** Porter mécaniquement un objet, PNJ ou ennemi depuis le code C# de `_ref_repo` vers TypeScript + Spritesheet Ghibli.

1. **Lire la classe C# dans `_ref_repo/InGame/GameObjects/`** (ex: `ObjSeaUrchin.cs`, `ObjOctorok.cs`, `ObjSword.cs`) et son fichier `.ani` dans `_ref_repo/Data/Animations/`.
2. **Extraire la fiche mathématique exacte :**
   - `Hitbox / CollisionBox` : `(offsetX, offsetY, width, height)` en pixels logiques `160x128`.
   - `Speed` : en pixels/frame à 60 FPS.
   - `FrameTimings` : durée de chaque frame en millisecondes depuis `.ani`.
   - `SoundEffects` : tous les identifiants `"D3xx-xx-xx"` appelés par `PlaySoundEffect(...)` $\rightarrow$ copier les `.wav` correspondants depuis `_ref_repo/Content/SoundEffects/` vers `public/assets/audio/`.
3. **Générer & Détourer les frames Ghibli :**
   - Fond `#00FF00` $\rightarrow$ flood-fill + suppression des poches vertes fermées + *despill* des contours.
   - Renseigner `w`, `h`, `originX`, `originY`, et calculer obligatoirement :
     $$\text{renderW} = \text{round}\left(\text{targetH} \times \frac{w}{h}, 1\right), \qquad \text{renderH} = \text{targetH}$$
     dans `src/data/animations.ts` pour interdire tout écrasement d'aspect ratio.
4. **Critère de validation (`Gate C`) :** `npm run build` passe à `0` erreur.

---

### Opérateur D : `TASK_QUEST_WIRE(flagId)`
**But :** Câbler l'un des 26 drapeaux de progression de `docs/la_dx_knowledge_base/00_GAME_SYSTEMS_AND_STATE_MACHINE.md`.

1. **Lire le script original dans `_ref_repo/Data/scripts.zScript`** et le chapitre correspondant dans `docs/la_dx_knowledge_base/01_COMPLETE_WALKTHROUGH.md`.
2. **Ajouter la condition de drapeau dans `GameState.ts` / `Dialogue.ts` / `rooms.ts`** avec les dialogues français officiels.
3. **Critère de validation (`Gate D`) :** Le drapeau se déclenche exactement selon la condition du walkthrough et débloque l'étape suivante.

---

## 3. Matrice Séquentielle d'Exécution à Grande Échelle

Grâce aux 4 opérateurs ci-dessus, un orchestrateur LLM peut exécuter le jeu complet comme une **suite d'appels de fonctions atomiques** :

| Lot (Batch) | Tâches Atomiques à Exécuter (Parallélisables par Sous-Agents) | Drapeau Cible (`00_GAME_SYSTEMS`) |
|---|---|---|
| **Lot 01 (Fait ✅)** | `TASK_ROOM_EXTRACT(indoor)` + `TASK_ROOM_GHIBLI(indoor)` + `TASK_ROOM_EXTRACT(ow_r10_c02)` + `TASK_ROOM_GHIBLI(ow_r10_c02)` + `TASK_QUEST_WIRE(FLAG_SHIELD_OBTAINED)` | `1. FLAG_SHIELD_OBTAINED` |
| **Lot 02 (Village des Mouettes)** | `TASK_ROOM_EXTRACT` & `TASK_ROOM_GHIBLI` sur `ow_r09_c02`, `ow_r10_c01`, `ow_r10_c03`, `ow_r11_c02`, `ow_r11_c03` + Transition scrolling 4 directions | Exploration Village (`B8-F11`) |
| **Lot 03 (Descente Plage & Épée)** | `TASK_ROOM_EXTRACT` & `TASK_ROOM_GHIBLI` sur `ow_r12_c02`, `ow_r13_c02`, `ow_r14_c02`, `ow_r15_c02`, `ow_r15_c03` + `TASK_ENTITY_PORT(sea_urchin)` + `TASK_ENTITY_PORT(octorok)` + `TASK_ENTITY_PORT(owl)` + `TASK_QUEST_WIRE(FLAG_SWORD_OBTAINED)` | `2. FLAG_SWORD_OBTAINED` |
| **Lot 04 (Forêt Enchantée & Clé Flagello)** | `TASK_ROOM_EXTRACT` & `TASK_ROOM_GHIBLI` sur la grille Forêt (`ow_r04_c01` à `ow_r07_c04` + `witch_hut` + `forest_cave`) + `TASK_ENTITY_PORT(moblin)` + `TASK_ENTITY_PORT(sleepy_toadstool)` + `TASK_ENTITY_PORT(magic_powder)` + `TASK_QUEST_WIRE(FLAG_TAIL_KEY_OBTAINED)` | `3. FLAG_TAIL_KEY_OBTAINED` |
| **Lot 05 (Donjon 1 : Cave Flagello)** | `TASK_ROOM_EXTRACT` & `TASK_ROOM_GHIBLI` sur `dungeon1.map` (toutes les salles `d1_r*_c*`) + `TASK_ENTITY_PORT(rocs_feather)` + `TASK_ENTITY_PORT(boss_moldorm)` + `TASK_QUEST_WIRE(FLAG_DUNGEON_1_COMPLETED)` | `4. FLAG_DUNGEON_1_COMPLETED` |
| **Lots 06 à 26** | Exécution itérative de la même boucle `EXTRACT -> GHIBLI -> ENTITY -> QUEST` pour les drapeaux `5` à `26` de `00_GAME_SYSTEMS_AND_STATE_MACHINE.md`. | `5..26` jusqu'à `FLAG_NIGHTMARES_DEFEATED` |
