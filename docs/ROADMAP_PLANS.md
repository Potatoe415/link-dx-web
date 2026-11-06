# Plans de Construction Modulaire — Zelda: Link's Awakening Ghibli Web

Ce document compare les **3 stratégies de construction possibles** pour étendre le prototype actuel (**Slice 01 : Maison de Marine + Extérieur 10x8**) à l'ensemble du jeu en s'appuyant sur :
- Le code et les données brutes de référence : `_ref_repo/` (`Links-Awakening-DX-HD` v1.0.0)
- La base de connaissances complète du jeu : `docs/la_dx_knowledge_base/` (`00_GAME_SYSTEMS_AND_STATE_MACHINE.md` à `06_VIDEO_WALKTHROUGH_INDEX.md`)

---

## 1. Comparaison des 3 approches

### Approche A — « Whitebox Pixel-Art d'abord, Images Ghibli ensuite »
* **Principe :** On reconstruit d'abord un chapitre entier (voire toute une région de l'île) uniquement avec les cartes `.map` et les textures Pixel-Art d'origine (`_ref_repo/Data/Maps/`), toutes les collisions, les ennemis et la logique de jeu. Une fois que le chapitre est 100 % jouable en Pixel-Art, on passe les écrans dans le générateur d'images Ghibli.
* **Avantages :**
  - **Zéro blocage créatif :** On code et on teste la physique, les portes et les quêtes très vite grâce à l'extraction automatique des fichiers `.map`.
  - **Validation géométrique garantie :** On est certain que les collisions sont parfaites avant de générer l'illustration Ghibli.
* **Inconvénients :**
  - Si on attend d'avoir fait 50 écrans avant de générer les images, la passe graphique finale devient une longue tâche répétitive.

### Approche B — « Niveau par Niveau / Écran par Écran (Vertical Slice complet à chaque étape) »
* **Principe :** On suit l'ordre exact de la soluce (`docs/la_dx_knowledge_base/01_COMPLETE_WALKTHROUGH.md`), par petits groupes de **2 à 4 écrans contigus**. Pour chaque étape, on fait la logique + le décor Ghibli + les sprites nécessaires avant de passer aux écrans suivants.
* **Avantages :**
  - **Toujours gratifiant et montrable :** À chaque arrêt du projet, le jeu ressemble à un produit fini Studio Ghibli sur tous les écrans accessibles.
  - **Découpage naturel :** Basé sur les 26 `Game Flags` de `00_GAME_SYSTEMS_AND_STATE_MACHINE.md`.
* **Inconvénients :**
  - Mélanger code moteur et génération d'images dans la même minute peut ralentir le rythme si on veut juste coder une mécanique.

### Approche C — « Objet par Objet / Système par Système »
* **Principe :** On reste dans un petit bac à sable (nos 2 écrans actuels + 1 écran de test) et on implémente tous les objets de Link (`Épée`, `Plume de Roc`, `Bracelet`, `Bottes de Pégase`, `Bombes`, `HUD`) et les ennemis avant d'agrandir la carte.
* **Avantages :**
  - Architecture propre de la machine à états de Link (`src/entities/Player.ts`).
* **Inconvénients :**
  - Déconnecté de la progression réelle de *Link's Awakening* (ex: coder le Grappin alors qu'on n'a pas encore la Plage Coco).

---

## 2. Notre Recommandation : L'Approche Hybride « Micro-Chapitres en 2 Passes »

Puisque notre moteur supporte **déjà** le basculement instantané avec la touche **`G`** entre **Pixel-Art (`*_bg_pixel.png`)** et **Studio Ghibli (`*_bg.png`)**, la méthode la plus simple, modulaire et agréable est de **combiner A et B par petits chapitres de 3 à 5 écrans** :

```
Pour chaque Micro-Chapitre (ex: Aller chercher l'Épée sur la plage) :
  ├─ Passe 1 (Code & Whitebox auto — 20 min) :
  │    Un script Python extrait automatiquement les 3-4 écrans depuis _ref_repo/Data/Maps/,
  │    génère les *_bg_pixel.png et les collisions de base. On code l'objet/PNJ du chapitre.
  │    Le chapitre est immédiatement 100 % jouable en mode Pixel-Art !
  │
  └─ Passe 2 (Art Studio Ghibli — à la demande, écran par écran) :
       Quand tu veux embellir un écran du chapitre, on génère son *_bg.png Ghibli,
       son masque *_fg.png et les nouveaux sprites à partir de la capture Pixel-Art.
```

**Pourquoi c'est idéal pour reprendre à tout moment :**
1. Tu peux faire une session « 100 % Code / Gameplay » sans générer une seule image (le jeu tourne avec `*_bg_pixel.png`).
2. Tu peux faire une session « 100 % Direction Artistique Ghibli » où on peint uniquement 1 ou 2 écrans déjà jouables.
3. Chaque étape correspond à un chapitre précis de `docs/la_dx_knowledge_base/01_COMPLETE_WALKTHROUGH.md`.

---

## 3. Découpage en Étapes (Feuille de Route Modulaire)

Chaque étape ci-dessous est indépendante, testable en moins d'une session, et peut être arrêtée/reprise à tout moment :

### ✅ Étape 1 — Réveil chez Marine & Obtention du Bouclier (TERMINÉ)
* **Référence Walkthrough :** Chapitre 1.1 (`FLAG_SHIELD_OBTAINED`).
* **Écrans :** `indoor` (Maison de Marine) + `outdoor` (Carré `10x8` devant la maison).
* **Contenu validé :** Réveil au lit, saut parabolique, dialogues Marine & Tarkin, remise du Bouclier L-1, garde active (`Shift`/`X`), musiques `.gbs` & bruitages `.wav` originaux, décors et sprites Studio Ghibli HD.

---

### 🔜 Étape 2 — Système d'État Global (`GameFlags`) & HUD Classique
* **Objectif :** Préparer le moteur à retenir la progression du joueur et afficher le bandeau d'interface.
* **Sous-étapes :**
  - `2.1` Créer `src/core/GameState.ts` gérant les drapeaux de `00_GAME_SYSTEMS_AND_STATE_MACHINE.md` (`FLAG_SHIELD_OBTAINED`, `FLAG_SWORD_OBTAINED`, etc.), les points de vie (3 coeurs) et la sauvegarde `localStorage`.
  - `2.2` Ajouter le bandeau HUD (`Bouton A`, `Bouton B`, `Rubis`, `Coeurs`) activable/désactivable.
  - `2.3` Créer le script `scripts/extract_room.py` qui prend des coordonnées `(col, row)` dans `overworld.map` et génère automatiquement `<room>_bg_pixel.png` + le squelette de collisions pour `src/data/rooms/<region>.ts`.

---

### 🔜 Étape 3 — Le Village des Mouettes & Le Chemin vers la Plage (4 écrans)
* **Référence Walkthrough :** Chapitre 1.2 (Descente vers la Plage Coco).
* **Écrans à ajouter :**
  1. Sortie sud du village (enfants qui jouent à la balle, cabine téléphonique de Pépé le Ramollo).
  2. Sentier côtier avec les premiers oursins (*Sea Urchins*) à pousser avec le **Bouclier** !
  3. Plage Coco ouest & Épave de l'Épée.
* **Mécaniques ajoutées :**
  - Transition par les 4 bords de l'écran (`North`, `South`, `East`, `West`) entre écrans adjacents de la grille `16x16`.
  - Poussée des oursins avec le Bouclier (`D360-62-3E.wav`).

---

### 🔜 Étape 4 — L'Épée sur la Plage Coco & Le Hibou (`FLAG_SWORD_OBTAINED`)
* **Référence Walkthrough :** Chapitre 1.3 (`01_COMPLETE_WALKTHROUGH.md`).
* **Contenu :**
  - Ramassage de l'Épée L-1 sur le sable -> Fanfare de l'Épée (Piste #14 de `awakening.gbs`).
  - Arrivée du Hibou (`ObjOwl`) qui explique que la Clé Flagello se trouve dans la Forêt Enchantée au nord.
  - Ajout de l'état `SWORD_SLASH` dans `src/entities/Player.ts` : coup d'épée, coupe des buissons/herbes et combat contre les Octoroks sur la plage.

---

### 🔜 Étape 5 — La Forêt Enchantée, le Champignon & la Clé Flagello (`FLAG_TAIL_KEY_OBTAINED`)
* **Référence Walkthrough :** Chapitre 1.4 (`01_COMPLETE_WALKTHROUGH.md`).
* **Contenu :**
  - Écrans de la Forêt Enchantée (`overworld.map` région A4-E7) + musique de la forêt.
  - Champignon du sommeil -> Cabane de la Sorcière -> Poudre Magique -> Tarkin raton-laveur -> Coffre de la **Clé Flagello**.

---

### 🔜 Étape 6 — Niveau 1 : La Cave Flagello (*Tail Cave*) & la Plume de Roc
* **Référence Walkthrough :** Chapitre 2 (`01_COMPLETE_WALKTHROUGH.md` & `02_DUNGEONS_AND_BOSSES.md`).
* **Contenu :**
  - Extraction des salles de `dungeon1.map` depuis `_ref_repo/Data/Maps/`.
  - Obtention de la **Plume de Roc** (saut libre au-dessus des trous), Boss **Moldorm**, et 1er Instrument des Sirènes (*Violon des Vagues*).
