import json
import os
import re

os.makedirs("docs/la_dx_knowledge_base", exist_ok=True)

with open("docs/scraped_raw/walkthrough.json", "r", encoding="utf-8") as f:
    walkthrough = json.load(f)

with open("docs/scraped_raw/topics.json", "r", encoding="utf-8") as f:
    topics = json.load(f)

with open("docs/scraped_raw/videos.json", "r", encoding="utf-8") as f:
    videos = json.load(f)

print("Building Knowledge Base files...")

# File 0: Systems, Engine Architecture, State Machine & Grid Coordinates
doc_0 = """# Zelda: Link's Awakening DX — Systèmes, Moteur, Grille & State Machine

Ce document synthétise les règles fondamentales du moteur de jeu de **The Legend of Zelda: Link's Awakening DX** (Game Boy Color), son découpage spatial, ses drapeaux de progression (Game Flags) et sa machine à états, afin de servir de spécification technique pour la recréation du jeu par un LLM ou un développeur.

---

## 1. Caractéristiques Techniques & Espace Logique

* **Résolution d'affichage GB/GBC :** 160 x 144 pixels.
* **Fenêtre de jeu active (Gameplay Viewport) :** 160 x 128 pixels (10 tuiles de large x 8 tuiles de haut, chaque tuile mesurant 16x16 pixels).
* **Bandeau d'interface (HUD) :** 160 x 16 pixels au bas de l'écran (affiche Bouton B, Bouton A, Compteur de Rubis, Coeurs de vie).
* **Fréquence d'images native :** 59.73 Hz (~60 FPS).
* **Défilement (Scrolling) :** Écrans discrets ("Flip-screen" ou transitions par scrolling de 160x128 pixels lors du franchissement de la bordure d'écran).
* **Système de tuiles :** Chaque écran d'overworld et d'underworld est composé de 10 x 8 métatuiles de 16x16 pixels.

---

## 2. Grille de l'Île de Cocolint (Overworld Grid 16x16)

L'overworld complet de Cocolint est une matrice de **16 colonnes (A à P ou 0 à 15)** par **16 lignes (1 à 16 ou 0 à 15)**, soit **256 écrans uniques** de 160x128 pixels.

### Principales Régions géographiques :
* **(A1 - P3) Chaîne des Monts Tartare (Tal Tal Heights / Mountain Range) :**
  - Ouest : Roc de la Tortue (Niveau 8), Chutes d'eau, Maisons des montagnards.
  - Centre : Mont Tamaranch & L'Oeuf Sacré du Poisson-Rêve.
  - Est : Tour du Vautour (Niveau 7), Poulailler du coq volant, Papahl perdu.
* **(A4 - E7) Forêt Enchantée (Mysterious Forest) :**
  - Arbres denses, brume, ratons-laveurs farceurs, champignons lumineux, tronc creux.
* **(F4 - I6) Marais des Anémones (Goponga Swamp) :**
  - Fleurs carnivores géantes bloquant l'accès au Niveau 2 (nécessite Toutou / BowWow).
* **(B8 - F11) Village des Mouettes (Mabe Village) :**
  - Maison de Marine et Tarin, Cabine téléphonique d'Ulrira, Magasin d'outils, Jeu de hasard (Trendy Game), Pêcherie, Chenil de Toutou, Bibliothèque, Atelier photo (DX).
* **(A9 - E16) Plage Coco (Toronbo Shores) :**
  - Épave du navire de Link, épée échouée, falaises de bord de mer, singe farceur.
* **(F7 - K11) Prairie Oukoukou & Champ de Pièges :**
  - Maison de Richard, souterrain vers la Clé Slime, Puits aux rubis, ruines.
* **(L8 - P11) Village des Animaux & Dunes de Yarna :**
  - Village des animaux parlants, Morse endormi bloquant l'accès au désert, Lanmola du désert géant tenant la Clé Poisson.
* **(F12 - K16) Baie de Martha & Maison des Coquillages :**
  - Baie lacustre, statue de la sirène, ponts, temple sous-marin du poisson-chat.
* **(L12 - P16) Région des Temples (Ancient Ruins & Face Shrine) :**
  - Labyrinthe d'Armos, sanctuaire avec fresque du Poisson-Rêve, entrée du Temple du Masque.

---

## 3. Machine à États du Joueur (Link State Machine)

L'automate d'états de Link gère les modes de contrôle suivants :
1. `SLEEPING` : Début du jeu, allongé dans le lit de Marine.
2. `WAKING` : Transition cinématique, Link s'assied et saute hors du lit.
3. `IDLE` : À l'arrêt, 4 directions cardinales (Up, Down, Left, Right).
4. `WALKING` : Vitesse de déplacement standard = 1.0 px/frame (glissement le long des obstacles diagonaux / wall sliding).
5. `SHIELD_BLOCKING` : Bouclier levé (dévie les flèches, rochers, repousse les Spiked Beetles).
6. `SWORD_SLASH` : Coup d'épée rapide (arc de cercle avant 180°).
7. `SWORD_CHARGING` / `SPIN_ATTACK` : Maintenir l'épée -> charge sonore -> relâchement pour attaque tournoyante 360°.
8. `JUMPING` (Roc's Feather) : Saut parabolique $z(t)$, permet de sauter au-dessus des trous de 1 tuile, d'éviter les pièges tranchants et d'aborder des plates-formes surélevées.
9. `DASHING` (Pegasus Boots) : Accélération après 1 seconde de charge, pulvérise les cristaux et arbres, franchit des fossés de 2 tuiles avec la Plume.
10. `LIFTING` / `CARRYING` / `THROWING` (Power Bracelet) : Saisie de pots, pierres, crânes ou bombes, déplacement à vitesse réduite, lancer linéaire.
11. `SWIMMING` / `DIVING` (Flippers) : Nage dans l'eau profonde, bouton B pour nager plus vite, bouton A pour plonger 2 secondes (esquive et objets sous-marins).
12. `HOOKSHOTTING` : Projection de la chaîne harpon, s'accroche aux coffres, rochers, poteaux en bois.
13. `FALLING_PIT` : Chute dans un trou -> animation de Link rétrécissant -> réapparition sur la dernière tuile sûre avec pénalité d'un demi-coeur.
14. `FROZEN_DIALOGUE` : Contrôles désactivés pendant l'affichage des boîtes de dialogue des PNJ ou des statues du hibou.

---

## 4. Drapeaux de Progression Globale (Game Progression Flags)

Pour réimplémenter fidèlement la boucle de jeu, le moteur doit suivre les flags booléens ordonnés suivants :

1. `FLAG_SHIELD_OBTAINED` : Tarin donne le Bouclier de Link au réveil.
2. `FLAG_SWORD_OBTAINED` : Récupération de l'Épée L-1 sur la plage de Toronbo (débloque l'apparition du Hibou).
3. `FLAG_TAIL_KEY_OBTAINED` : Récupération du Chignon/Champignon magique -> Poudre magique chez la Sorcière -> Dissipation du sort de Tarin en raton-laveur -> Clé Flagello dans le coffre.
4. `FLAG_DUNGEON_1_COMPLETED` : Boss Moldorm vaincu, obtention du Violon des Vagues (Full Moon Cello).
5. `FLAG_BOWWOW_KIDNAPPED` : Les Moblins ont kidnappé le Toutou de Mme Miaou.
6. `FLAG_BOWWOW_RESCUED` : Repaire des Moblins nettoyé, Toutou accompagne Link (avale les fleurs du Marais).
7. `FLAG_DUNGEON_2_COMPLETED` : Boss Génie vaincu, obtention du Bracelet de Force L-1 et du Cor du Conque. Toutou ramené à Mme Miaou.
8. `FLAG_RICHARD_LEAVES_OBTAINED` : 5 feuilles d'or récupérées au Château Canulet -> Richard libère l'accès au champ de pièges.
9. `FLAG_SLIME_KEY_OBTAINED` : Clé Slime déterrée devant la statue hibou.
10. `FLAG_DUNGEON_3_COMPLETED` : Boss Yeux d'Or (Slime Eye) vaincu, obtention des Bottes de Pégase et de la Cloche des Algues.
11. `FLAG_OCARINA_OBTAINED` : Sanctuaire du sommeil terminé dans le village (nécessite Bottes de Pégase + Plume).
12. `FLAG_WALRUS_AWAKENED` : Marine chante la Ballade du Poisson-Rêve pour réveiller le Morse bloquant l'accès aux Dunes de Yarna.
13. `FLAG_ANGLER_KEY_OBTAINED` : Lanmola géant vaincu dans le désert de Yarna.
14. `FLAG_DUNGEON_4_COMPLETED` : Boss Angler Fish vaincu, obtention des Palmes et de la Harpe du Reflux.
15. `FLAG_GHOST_ESCORT_COMPLETED` : Le fantôme rose est raccompagné à sa maison abandonnée puis à sa tombe fleurie.
16. `FLAG_DUNGEON_5_COMPLETED` : Mini-boss Master Stalfos vaincu 4 fois, Grappin obtenu, Boss Slime Eel vaincu, Marimba du Vent obtenu.
17. `FLAG_COLOR_DUNGEON_COMPLETED` (DX exclusif) : Énigme des 5 tombes résolue, Donjon des Couleurs terminé, Link choisit la Tunique Rouge (+attaque) ou Bleue (+défense).
18. `FLAG_FACE_KEY_OBTAINED` : Chevalier Armos terrassé dans les ruines antiques, stèle du Poisson-Rêve découverte.
19. `FLAG_DUNGEON_6_COMPLETED` : Boss Façade vaincu, Bracelet de Force L-2 obtenu, Triangle de Corail obtenu.
20. `FLAG_FLYING_ROOSTER_REVIVED` : Chant des grenouilles de Mamu joué sous la girouette du village -> Le Coq Volant rejoint Link.
21. `FLAG_BIRD_KEY_OBTAINED` : Traversée des gouffres de la montagne avec le coq volant.
22. `FLAG_DUNGEON_7_COMPLETED` : 4 piliers de la Tour du Vautour écroulés par la boule d'acier, Boss Grand Vautour vaincu, Bouclier Miroir obtenu, Orgue de l'Embellie obtenu.
23. `FLAG_TURTLE_ROCK_AWAKENED` : Chant des grenouilles joué devant le crâne de pierre au Roc de la Tortue.
24. `FLAG_DUNGEON_8_COMPLETED` : Boss Hot Head détruit au Bâton de Feu (Magic Rod), Tambour des Marées obtenu (les 8 Instruments sont réunis !).
25. `FLAG_EGG_OPENED` : Ballade du Poisson-Rêve jouée à l'Ocarina devant l'Oeuf Sacré au Mont Tamaranch.
26. `FLAG_NIGHTMARES_DEFEATED` : Labyrinthe intérieur franchi selon la formule de la bibliothèque -> 6 formes de cauchemars vaincues -> Fin du jeu.
"""

with open("docs/la_dx_knowledge_base/00_GAME_SYSTEMS_AND_STATE_MACHINE.md", "w", encoding="utf-8") as f:
    f.write(doc_0)

print("Created 00_GAME_SYSTEMS_AND_STATE_MACHINE.md")
