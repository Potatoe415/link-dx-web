# Pipeline Graphique & Audio — Du Pixel-Art `.map` au Rendu Studio Ghibli

Ce document décrit la procédure exacte et reproductible pour ajouter un nouvel écran ou de nouveaux sprites dans `zelda-la-web` en conservant la qualité visuelle du prototype initial.

---

## 1. Extraction de la Plaque Pixel-Art de Référence (`160x128` $\rightarrow$ `1280x1024`)

Toutes les cartes originales du jeu se trouvent dans `_ref_repo/Data/Maps/` :
- **Intérieurs :** `house1.map`, etc., utilisant les tilesets dans `_ref_repo/Data/Maps/Tilesets/` (`house.png`, ` indoor.png`, etc.).
- **Extérieur (Île Cocolint 16x16 écrans) :** `_ref_repo/Data/Maps/overworld.map` utilisant `tileset0.png` et `_ref_repo/Data/Map Objects/objects.png` + `objects.atlas`.
  - ⚠️ **Attention au décalage `MapOffsetX = 1` :** La première ligne de `overworld.map` définit `MapOffsetX = 1`. Toutes les coordonnées X des écrans de l'overworld sont décalées de `+1` tuile (`+16` pixels). Par exemple, l'écran de la maison de Marine occupe les colonnes `21..30` et les lignes `80..87` (`X = [336, 496], Y = [1280, 1408]`).
  - ⚠️ **Exclusion des entités animées :** Lors de la génération de la plaque brute (`*_raw_160x128.png` et `*_bg_pixel.png`), exclure les objets qui sont animés dynamiquement par `Prop.ts` (comme `weather_bird` ou `flower_1`) pour éviter qu'ils n'apparaissent en double dans le décor fixe.

---

## 2. Génération du Décor Peint Studio Ghibli (`1280x1024`)

1. **Entrée :** Prendre la plaque de référence `160x128` mise à l'échelle `8x` en Nearest Neighbor (`1280x1024`).
2. **Directive de style (Prompt / Image Generator) :**
   - *Style :* Illustration peinte à la main à la gouache / aquarelle dans le style des décors de **Studio Ghibli (Kazuo Oga — Mon Voisin Totoro, Kiki la Petite Sorcière)**.
   - *Perspective :* Vue **strictement de dessus aux trois-quarts (2D RPG top-down)** fidèle au jeu *Link's Awakening*. Ne jamais basculer en perspective isométrique 45° en losange.
   - *Fidélité géométrique :* Chaque mur, porte, meuble, barrière, arbre et chemin doit conserver **exactement** sa boîte englobante en coordonnées `1280x1024` pour correspondre à la grille de collision `160x128`.
   - *Exclusion :* Aucun personnage (ni Link, ni PNJ, ni ennemis) ne doit être peint dans le décor de fond.
3. **Vérification sur grille :**
   - Superposer une grille `160x128` (tous les `10` ou `16` pixels logiques) sur l'image `1280x1024` générée pour relever au pixel près les boîtes `colliders` et `warpTriggers` dans `src/data/rooms/<region>.ts`.

---

## 3. Création du Calque d'Occlusion Premier Plan (`*_fg.png`)

Pour permettre à Link de passer derrière le haut des toits et la cime des arbres :
1. Créer un masque en niveaux de gris (`L`, `1280x1024`) couvrant uniquement la moitié supérieure des toits et le feuillage haut des arbres.
2. Appliquer un léger flou gaussien (`GaussianBlur(4)`) sur le masque pour adoucir la transition.
3. ⚠️ **Règle anti-halo noir :** Ne **jamais** faire `fg.paste(im_hd, (0, 0), mask)` sur une image noire transparente `(0, 0, 0, 0)` (cela assombrit les bords semi-transparents). Toujours faire :
   ```python
   fg = im_hd.copy()
   fg.putalpha(mask)
   fg.save('public/assets/<room>_fg.png')
   ```

---

## 4. Pipeline Spritesheet (`public/assets/spritesheet.png`)

1. **Fond de génération :** Générer les planches de sprites sur fond vert uni (`#00FF00`) en vue top-down RPG cohérente.
2. **Suppression du fond vert & Despill :**
   - Détecter le fond vert par flood-fill depuis les bords **plus** suppression des poches vertes fermées à l'intérieur des silhouettes (`g > 155` et `g - max(r, b) > 45`).
   - Appliquer un *despill* sur les pixels de bordure (`if g > max(r, b): g = max(r, b)`) pour éliminer toute frange verte autour de Link et des PNJ.
3. **Respect du Ratio d'Aspect (`renderW` & `renderH`) :**
   - Dans `src/data/animations.ts`, toujours renseigner `renderW` et `renderH` proportionnels aux dimensions réelles `(w, h)` du sprite découpé afin qu'aucun personnage ou lit ne soit écrasé dans un carré `16x16`.

---

## 5. Pipeline Audio (`public/assets/audio/`)

- **Bruitages (`.wav`) :** Copiés directement depuis `_ref_repo/Content/SoundEffects/D3*.wav`.
- **Musiques (`.gbs` $\rightarrow$ `.wav`) :** Exportées depuis `_ref_repo/Data/Music/awakening.gbs` via `python scripts/export_gbs_audio.py` qui compile l'émulateur C# `_ref_repo/GbsPlayer/` pour produire les pistes authentiques à 44.1 kHz. Les 3 pistes historiques restent en `.wav` ; les 26 autres (zones, donjons 1-8, boss, hibou, fanfares, générique) sont encodées en Ogg Vorbis via `ffmpeg` (~19 Mo au total au lieu de 112 Mo). La table `MUSIC_FILES` de `src/core/Audio.ts` et `OVERWORLD_MUSIC` de `scripts/build_region.py` font le lien avec les numéros de piste `.gbs`.
