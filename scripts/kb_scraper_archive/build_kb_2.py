import json
import os

with open("docs/scraped_raw/topics.json", "r", encoding="utf-8") as f:
    topics = json.load(f)

guideboss_content = topics.get("guideboss", {}).get("content", "")

doc_2 = """# The Legend of Zelda: Link's Awakening DX — Donjons & Guide Complet des Boss

Ce document détaille les donjons, leurs instruments des sirènes, leurs objets majeurs et les stratégies complètes pour chaque boss et mini-boss.

---

## Synthèse des Donjons & Instruments des Sirènes

| Donjon | Nom Français | Nom Anglais | Instrument Obtenu | Objet Majeur Trouvé | Boss de Fin |
|---|---|---|---|---|---|
| Niveau 1 | Cave Flagello | Tail Cave | **Violon des Vagues** (Full Moon Cello) | **Plume de Roc** (Roc's Feather) | Moldorm |
| Niveau 2 | Grotte du Génie | Bottle Grotto | **Cor du Conque** (Conch Horn) | **Bracelet de Force L-1** (Power Bracelet) | Le Génie (Genie) |
| Niveau 3 | Cave aux Clés | Key Cavern | **Cloche des Algues** (Sea Lily's Bell) | **Bottes de Pégase** (Pegasus Boots) | Yeux d'Or (Slime Eye) |
| Niveau 4 | Abîme du Poisson | Angler's Tunnel | **Harpe du Reflux** (Surf Harp) | **Palmes** (Flippers) | Poisson Angler (Angler Fish) |
| Niveau 5 | Temple du Poisson-Chat | Catfish's Maw | **Marimba du Vent** (Wind Marimba) | **Grappin** (Hookshot) | Serpent Poisson (Slime Eel) |
| Niveau 6 | Temple du Masque | Face Shrine | **Triangle de Corail** (Coral Triangle) | **Bracelet de Force L-2** (Power Bracelet L-2) | Le Masque (Façade) |
| Niveau 7 | Tour du Vautour | Eagle's Tower | **Orgue de l'Embellie** (Organ of Evening Calm) | **Bouclier Miroir L-3** (Mirror Shield) | Grand Vautour (Evil Eagle) |
| Niveau 8 | Roc de la Tortue | Turtle Rock | **Tambour des Marées** (Thunder Drum) | **Bâton de Feu** (Magic Rod) | Tête Enflammée (Hot Head) |
| DX Exclusif | Temple des Couleurs | Color Dungeon | *(Aucun - Donjon optionnel)* | **Tunique Bleue ou Tunique Rouge** | Hardhit Beetle & D. Phantom |
| Final | Oeuf Sacré | Wind Fish's Egg | *(Éveil du Poisson-Rêve)* | *(Fin du Jeu)* | Cauchemars / DethI (6 phases) |

---

## Guide Détaillé des Boss (Palais de Zelda)

""" + guideboss_content + """

---

## Règles Mécaniques Spéciales par Donjon

### 1. Cave Flagello (Niveau 1)
* **Mini-boss Rolling Bones :** Saute par-dessus le rouleau épineux avec la Plume de Roc, puis frappe le boss par derrière avec l'épée.
* **Boss Moldorm :** Chenille géante qui rebondit sur les murs. Son point faible est le bout rouge de sa queue. Link doit éviter de tomber dans les fossés extérieurs (sinon le combat recommence avec sa vie réinitialisée). 4 coups d'épée (ou attaque tournoyante).

### 2. Grotte du Génie (Niveau 2)
* **Énigme des monstres ordonnés :** Tuer en premier le Pols Voice (lapin) avec un pot, puis la Chauve-souris (Keese), puis le Stalfos (squelette) pour faire apparaître le coffre.
* **Boss Le Génie :**
  - Phase 1 : Esquive ses boules de feu en tournant. Lorsqu'il rentre dans sa jarre, donne un coup d'épée sur la jarre, soulève-la avec le Bracelet de Force et lance-la contre les murs. Répète 3 fois pour briser la jarre.
  - Phase 2 : Le génie vole sans sa jarre en lançant des projectiles magiques. Frappe-le à l'épée quand il s'arrête.

### 3. Cave aux Clés (Niveau 3)
* **Mécanique des dalles étoiles :** Marcher sur les dalles modifie l'agencement des blocs de couleur rouge/bleu.
* **Mini-boss Dodongo Snakes :** Leur faire avaler 3 bombes chacun.
* **Boss Slime Eye (Yeux d'Or) :** Un slime géant au plafond. Fonce dedans avec les Bottes de Pégase pour étirer sa matière au maximum, puis donne un coup d'épée au centre pour le couper en deux petits slimes indépendants. Finis-les à l'épée.

### 4. Abîme du Poisson (Niveau 4)
* **Mécanique des cascades et dalles d'eau :** Nécessite de nager sous l'eau avec les Palmes.
* **Boss Poisson Angler :** Combat en vue 2D profil sous-marin ! Évite les éboulements de rochers et frappe l'antenne lumineuse de sa tête à l'épée. Peut être vaincu en quelques secondes avec des attaques tournoyantes ou des flèches.

### 5. Temple du Poisson-Chat (Niveau 5)
* **Mini-boss Master Stalfos :** Doit être combattu 4 fois dans 4 salles différentes. Fais-le s'écrouler d'un coup d'épée puis pose une bombe sur ses ossements. Au 4e affrontement, il abandonne le Grappin.
* **Boss Serpent Poisson (Slime Eel) :** 4 trous dans les murs. Le boss sort la tête de l'un d'eux ou sort sa queue épineuse au centre. Tire sa tête hors du trou avec le Grappin pour révéler son coeur rouge vulnérable et frappe-le à l'épée.

### 6. Temple du Masque (Niveau 6)
* **Mécanique des pots volants et dalles murales :** Utilise le Bracelet de Force L-2 pour soulever les statues éléphants massives.
* **Boss Façade :** Un visage apparaît sur le plancher et fait s'écrouler des trous tout en lançant des dalles et des pots de feu. Pose des bombes directement sur son visage quand il ouvre les yeux.

### 7. Tour du Vautour (Niveau 7)
* **Mécanique de la boule d'acier (Wrecking Ball) :** Prends la lourde sphère métallique noire et détruis les **4 piliers de soutien** disséminés dans les étages 1 et 2. Une fois les 4 piliers détruits, l'étage supérieur s'effondre, ouvrant l'accès au toit !
* **Mini-boss Grim Creeper :** Envoie des vagues de chauves-souris en formation. Élimine toute la volée sans en manquer une seule.
* **Boss Grand Vautour (Evil Eagle) :** Combat sur le toit en vue 2D profil. Utilise le Bouclier Miroir pour parer les plumes et le vent soufflé par le rapace (qui cherche à pousser Link dans le vide), et frappe son bec avec l'épée ou le Grappin / Flèches.

### 8. Roc de la Tortue (Niveau 8)
* **Mécanique de la machine à dalles de lave :** Contrôle un bloc magique qui tisse un sol au-dessus du magma selon les directions entrées par le joueur.
* **Boss Tête Enflammée (Hot Head) :** Surgit de la lave sous forme d'une boule de feu. Tire-lui dessus avec le Bâton de Feu (Magic Rod). La lave refroidit et révèle son visage vulnérable.

### 9. Donjon des Couleurs (Color Dungeon - Spécifique DX)
* **Accès :** Dans la bibliothèque du village, fonce dans la bibliothèque du fond avec les Bottes de Pégase pour faire tomber le livre "Les Secrets de l'Île". Il donne la séquence des 5 pierres tombales du cimetière :
  1. Bas (South)
  2. Gauche (West)
  3. Haut (North)
  4. Droite (East)
  5. Haut (North)
* **Énigme des dalles de couleur :** Frapper les dalles pour harmoniser leur couleur (bleu -> jaune -> rouge).
* **Boss D. Phantom & Hardhit Beetle :** Vaincs les monstres de couleur pour rencontrer la Reine des fées.
* **Récompense :**
  - **Tunique Rouge :** Double la puissance d'attaque de l'épée.
  - **Tunique Bleue :** Divise par deux les dégâts subis par Link.

### 10. Oeuf Sacré (Le Combat Final des Cauchemars)
* **Labyrinthe de l'Oeuf :** Le chemin exact est aléatoire selon la cartouche/sauvegarde mais est inscrit dans le livre de la bibliothèque (visible grâce à la Loupe). Ex: Gauche, Gauche, Haut, Droite, Droite, Haut, Gauche, Haut.
* **Forme 1 : Ombre Géante de Zol :** Vulnérable à 3 jets de Poudre Magique.
* **Forme 2 : Ombre d'Agahnim :** Renvoie ses boules magiques non-lumineuses avec un coup d'épée (exactement comme dans A Link to the Past).
* **Forme 3 : Ombre de Moldorm :** Frappe le bout de sa queue rouge avec l'épée.
* **Forme 4 : Ombre de Ganon :** Évite ses chauves-souris enflammées et frappe-le avec une attaque tournoyante ou une flèche quand il lève sa lance.
* **Forme 5 : Ombre de Lanmola / Vers de feu :** Fonce dessus avec les Bottes de Pégase ou le Bâton de Feu.
* **Forme 6 : DethI (L'oeil géant aux bras tentaculaires) :** Saute par-dessus ses deux immenses bras rotatifs avec la Plume de Roc. Dès que son oeil s'ouvre, tire une Flèche (ou une Bombe-Flèche) en plein dans son iris. 16 flèches suffisent à le détruire !
"""

with open("docs/la_dx_knowledge_base/02_DUNGEONS_AND_BOSSES.md", "w", encoding="utf-8") as f:
    f.write(doc_2)

print("Created 02_DUNGEONS_AND_BOSSES.md successfully!")
