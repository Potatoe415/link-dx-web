import json
import os

with open("docs/scraped_raw/topics.json", "r", encoding="utf-8") as f:
    topics = json.load(f)

with open("docs/scraped_raw/videos.json", "r", encoding="utf-8") as f:
    videos = json.load(f)

# File 3: Items, Equipment & Economy
doc_3 = f"""# The Legend of Zelda: Link's Awakening DX — Équipement, Objets, Économie & Magasins

Ce document rassemble la totalité des objets, armes, améliorations d'inventaire, magasins, mini-jeux et règles économiques du jeu.

---

## 1. Équipement & Armes (Palais de Zelda)

{topics.get("equipement", {}).get("content", "")}

---

## 2. Objets d'Inventaire & Quête (Palais de Zelda)

{topics.get("objets", {}).get("content", "")}

---

## 3. Mélodies de l'Ocarina

{topics.get("airs_ocarina", {}).get("content", "")}

### Spécifications Mécaniques des Mélodies :
1. **Ballade du Poisson-Rêve (Ballad of the Wind Fish) :**
   - Apprise auprès de Marine sur la place du village des Mouettes (ou au Village des Animaux).
   - Utilisation : Réveille le morse aux Dunes de Yarna, réveille le Poisson-Rêve devant l'Oeuf Sacré sur le Mont Tamaranch une fois les 8 instruments réunis.
2. **Mambo de Manbo :**
   - Apprise auprès de Manbo le poisson-soleil dans la caverne près de l'Abîme du Poisson (Niveau 4).
   - Utilisation : Téléportation instantanée vers l'étang de Manbo (près de la maison de Marine) dans l'overworld, ou retour à l'entrée du donjon lorsqu'elle est jouée à l'intérieur d'un donjon.
3. **Chant des Grenouilles de Mamu (Frog's Song of Soul) :**
   - Apprise auprès du prince grenouille Mamu au sud de la Prairie Oukoukou (coûte 300 rubis).
   - Utilisation : Réveille les êtres pétrifiés et insuffle la vie. Réveille le Coq Volant sous la girouette du village, et réveille le crâne de pierre géant à l'entrée du Roc de la Tortue (Niveau 8).

---

## 4. Améliorations de Capacité (Diablotin / Mad Batter)

{topics.get("augmentation_capacites", {}).get("content", "")}

### Capacités Maximales :
* **Poudre Magique :** 20 unités $\\rightarrow$ **40 unités**.
* **Bombes :** 30 unités $\\rightarrow$ **60 unités**.
* **Flèches :** 30 unités $\\rightarrow$ **60 unités**.

---

## 5. Magasins, Économie, Mini-jeux & Vol à l'Étalage

{topics.get("magasins", {}).get("content", "")}

### Astuces & Économie des Rubis :

{topics.get("rubis", {}).get("content", "")}

### Mécanique du Vol dans le Magasin du Village (Shopkeeper Theft Mechanic) :
1. **Comment voler :** Prends un objet (Pelle à 200 rubis, Arc à 980 rubis), tourne autour du marchand jusqu'à ce qu'il regarde vers le haut/ailleurs, puis franchis la porte de sortie en courant.
2. **Conséquence 1 (Renommage définitif) :** Link est renommé **VOLEUR** (ou **THIEF**) pour tout le reste de la partie ! Tous les PNJ et boîtes de dialogue s'adresseront à lui en l'appelant ainsi.
3. **Conséquence 2 (Vengeance foudroyante) :** Si Link ose retourner dans le magasin après avoir volé, le marchand l'interpelle en disant : *"Je t'avais prévenu !"* et tire un éclair continu à bout portant qui tue Link instantanément, sans échappatoire possible.
4. **Conséquence 3 (Photo DX #11) :** Si Link vole avec la version DX, la photo #11 *"VOLEUR !"* est enregistrée dans l'album photo.
"""

with open("docs/la_dx_knowledge_base/03_ITEMS_EQUIPMENT_ECONOMY.md", "w", encoding="utf-8") as f:
    f.write(doc_3)

print("Created 03_ITEMS_EQUIPMENT_ECONOMY.md")

# File 4: Collectibles, Sidequests & Trading
doc_4 = f"""# The Legend of Zelda: Link's Awakening DX — Quêtes Secondaires, Objets Cachés & Téléporteurs

Ce document répertorie la chaîne complète des échanges, les 26 coquillages secrets, les 12 quarts de coeur, les 12 photographies DX, ainsi que tous les téléporteurs et fontaines des fées.

---

## 1. Chaîne Complète des Échanges (Trading Sequence)

{topics.get("suite_echanges", {}).get("content", "")}

### Synthèse Chronologique des 14 Objets :
1. **Peluche Yoshi** (Jeu de hasard du village) $\\rightarrow$ Donnée à la Mère des quadruplés dans la maison du nord.
2. **Ruban** $\\rightarrow$ Donné au petit toutou dans la niche à côté de chez Mme Miaou.
3. **Pâtée pour Chien** $\\rightarrow$ Donnée à Sale Gouache (le crocodile peintre) sur la plage de Toronbo.
4. **Bananes** $\\rightarrow$ Données à Kiki le singe près du pont du Château Canulet (qui construit le pont de bois et laisse un bâton).
5. **Bâton** $\\rightarrow$ Donné à Tarin près du nid de frelons dans la Prairie Oukoukou.
6. **Ruche / Rayon de Miel** $\\rightarrow$ Donné à l'Ours cuisinier au Village des Animaux.
7. **Ananas** $\\rightarrow$ Donné à Papahl affamé dans les Monts Tartare.
8. **Hibiscus** $\\rightarrow$ Donné à Christine la chèvre au Village des Animaux.
9. **Lettre d'Amour** $\\rightarrow$ Remise à M. Wright dans sa maison au nord-ouest de la forêt.
10. **Balai** $\\rightarrow$ Donné à Mamie Youpi (Grandma Yahoo) qui cherche un balai (au village ou devant le village des animaux).
11. **Hameçon** $\\rightarrow$ Donné au pêcheur sous le pont de la Baie de Martha (plonger sous le pont).
12. **Collier de Sirène** $\\rightarrow$ Rendu à la Sirène qui nage dans la Baie de Martha.
13. **Écaille de Sirène** $\\rightarrow$ Placée sur la statue de la sirène au sud de la baie, révélant un escalier souterrain.
14. **Loupe Invisible (Magnifying Lens)** $\\rightarrow$ Permet de lire les caractères minuscules du livre de l'oeuf dans la bibliothèque, de voir le Zora secret dans le village des animaux, et de commercer avec Goriya sur la plage pour obtenir le **Boomerang** !

---

## 2. Les 26 Coquillages Secrets (Secret Seashells)

{topics.get("coquillages_1", {}).get("content", "")}

{topics.get("coquillages_2", {}).get("content", "")}

{topics.get("coquillages_3", {}).get("content", "")}

### Paliers de la Maison des Coquillages :
* **5 Coquillages :** 20 Rubis.
* **10 Coquillages :** 30 Rubis.
* **20 Coquillages :** **Épée Cocolint L-2** ! (Tire des rayons d'énergie magique lorsque la barre de santé de Link est pleine).

---

## 3. Les 12 Quarts de Coeur (Pieces of Heart)

{topics.get("coeurs", {}).get("content", "")}

Total de vie maximal possible : **14 Coeurs** (3 de départ + 8 des donjons + 3 coeurs complets via les 12 quarts de coeur).

---

## 4. Les 12 Photographies de l'Album DX (Camera Shop Mouse)

{topics.get("ta_photos", {}).get("content", "")}

---

## 5. Téléporteurs & Fontaines des Fées

### Téléporteurs de l'Île de Cocolint :
{topics.get("teleporteurs", {}).get("content", "")}

### Fontaines des Fées :
{topics.get("fontaines_fees", {}).get("content", "")}
"""

with open("docs/la_dx_knowledge_base/04_COLLECTIBLES_AND_SIDEQUESTS.md", "w", encoding="utf-8") as f:
    f.write(doc_4)

print("Created 04_COLLECTIBLES_AND_SIDEQUESTS.md")

# File 5: Secrets, Glitches & Differences
doc_5 = f"""# The Legend of Zelda: Link's Awakening DX — Secrets, Glitches & Différences GB / DX

Ce document recense les spécificités propres à la version DX, les secrets cachés par Nintendo, les easter eggs et les glitchs célèbres.

---

## 1. Différences Majeures entre Link's Awakening (GB 1993) et DX (GBC 1998)

{topics.get("differences_gb_gbcolor", {}).get("content", "")}

---

## 2. Secrets, Easter Eggs & Glitchs (Palais de Zelda)

{topics.get("encore_plus", {}).get("content", "")}

---

## 3. Synthèse des Secrets Incontournables pour la Recréation du Moteur

1. **Combo Flèche-Bombe :**
   - Équiper l'Arc sur un bouton et les Bombes sur l'autre bouton.
   - Appuyer simultanément sur les deux boutons déclenche le tir d'une **Flèche explosive** ultra-puissante qui explose à l'impact (détruit la plupart des monstres en un seul coup).
2. **Vengeance des Poules (Cucco Revenge Squad) :**
   - Frapper une poule à plusieurs reprises avec l'épée fait retentir un cri strident. Une nuée infinie de poules volantes traverse l'écran et attaque Link jusqu'à ce qu'il quitte la zone.
3. **Chanson Totakeke dans la Villa de Richard :**
   - Dans la villa de Richard, rester immobile et attendre sans toucher aux commandes pendant **2 minutes et 30 secondes**. La musique change soudainement pour jouer le thème culte de Totakeke (K.K. Slider) !
4. **Easter Egg du Nom du Joueur :**
   - Nommer la sauvegarde **ZELDA** remplace la musique du menu de sélection par un arrangement spécial du thème principal de Zelda.
5. **Comportement secret de Marine :**
   - Lorsque Marine accompagne Link (avant d'aller réveiller le morse) :
     * Tomber dans un puits : Marine atterrit sur Link et s'excuse.
     * Casser des pots dans les maisons : Marine réprimande Link.
     * Frapper des poules : Marine supplie d'arrêter, puis dit d'un ton inquiétant : *"Vas-y, fais-lui mal !"*.
     * Jouer de l'Ocarina : Marine commente les talents musicaux de Link.
"""

with open("docs/la_dx_knowledge_base/05_SECRETS_GLITCHES_DX_DIFFERENCES.md", "w", encoding="utf-8") as f:
    f.write(doc_5)

print("Created 05_SECRETS_GLITCHES_DX_DIFFERENCES.md")

# File 6: Video Walkthrough Index
doc_6 = """# The Legend of Zelda: Link's Awakening DX — Index de la Solution Vidéo (Palais de Zelda)

Cette section référence les 15 épisodes de la solution vidéo officielle de *Le Palais de Zelda* (réalisée par RikuuGaming) pour *Link's Awakening DX* couleur.

Chaque vidéo correspond à une phase clé du cheminement et détaille la résolution des énigmes, le placement des coffres, l'obtention des objets et les affrontements de boss.

---

## Liste Complète des 15 Épisodes Vidéo

| Épisode | Titre de la Section | URL Palais de Zelda | ID Vidéo |
|---|---|---|---|
| **01** | **Village des Mouettes, Plage Coco et Forêt Enchantée** | [solution_video.php?v=4kgZYYqS384](https://www.palaiszelda.com/linksawakening/solution_video.php?v=4kgZYYqS384) | `4kgZYYqS384` |
| **02** | **Cave Flagello (Niveau 1)** | [solution_video.php?v=cqNj0zbBs7I](https://www.palaiszelda.com/linksawakening/solution_video.php?v=cqNj0zbBs7I) | `cqNj0zbBs7I` |
| **03** | **Village des Mouettes et Marais des Anémones** | [solution_video.php?v=FJ-baqT4vtA](https://www.palaiszelda.com/linksawakening/solution_video.php?v=FJ-baqT4vtA) | `FJ-baqT4vtA` |
| **04** | **Grotte du Génie (Niveau 2)** | [solution_video.php?v=e85gTNds8no](https://www.palaiszelda.com/linksawakening/solution_video.php?v=e85gTNds8no) | `e85gTNds8no` |
| **05** | **Village des Mouettes, Prairie et Château Canulet** | [solution_video.php?v=y7SVM_PGf_A](https://www.palaiszelda.com/linksawakening/solution_video.php?v=y7SVM_PGf_A) | `y7SVM_PGf_A` |
| **06** | **Cave aux Clés (Niveau 3)** | [solution_video.php?v=x1psvkSXs54](https://www.palaiszelda.com/linksawakening/solution_video.php?v=x1psvkSXs54) | `x1psvkSXs54` |
| **07** | **Prairie, Village des Animaux, Dunes de Yarna et Plateau Tartare Est** | [solution_video.php?v=iIcAyDLtQoE](https://www.palaiszelda.com/linksawakening/solution_video.php?v=iIcAyDLtQoE) | `iIcAyDLtQoE` |
| **08** | **Abîme du Poisson (Niveau 4) et Promenade avec un fantôme** | [solution_video.php?v=NI_b0uGJzDM](https://www.palaiszelda.com/linksawakening/solution_video.php?v=NI_b0uGJzDM) | `NI_b0uGJzDM` |
| **09** | **Temple du Poisson-Chat (Niveau 5)** | [solution_video.php?v=0tB3FIJz6t8](https://www.palaiszelda.com/linksawakening/solution_video.php?v=0tB3FIJz6t8) | `0tB3FIJz6t8` |
| **10** | **Suite et fin des échanges** | [solution_video.php?v=fx9eXUbgT-0](https://www.palaiszelda.com/linksawakening/solution_video.php?v=fx9eXUbgT-0) | `fx9eXUbgT-0` |
| **11** | **Temple des Couleurs (Spécifique DX) et Région des Temples** | [solution_video.php?v=CCVIBpET1dI](https://www.palaiszelda.com/linksawakening/solution_video.php?v=CCVIBpET1dI) | `CCVIBpET1dI` |
| **12** | **Temple du Masque (Niveau 6), Coq Volant et Dédale des Panneaux** | [solution_video.php?v=5bNP41TJYhM](https://www.palaiszelda.com/linksawakening/solution_video.php?v=5bNP41TJYhM) | `5bNP41TJYhM` |
| **13** | **Tour du Vautour (Niveau 7) et Plateau Tartare Ouest** | [solution_video.php?v=tq_Vmy_DkFI](https://www.palaiszelda.com/linksawakening/solution_video.php?v=tq_Vmy_DkFI) | `tq_Vmy_DkFI` |
| **14** | **Roc de la Tortue (Niveau 8)** | [solution_video.php?v=zlp09ih5CdY](https://www.palaiszelda.com/linksawakening/solution_video.php?v=zlp09ih5CdY) | `zlp09ih5CdY` |
| **15** | **Oeuf Sacré (Labyrinthe & Boss Final Cauchemars)** | [solution_video.php?v=qFufiljn3Tg](https://www.palaiszelda.com/linksawakening/solution_video.php?v=qFufiljn3Tg) | `qFufiljn3Tg` |

---

## Épisode 1 en Focus : `4kgZYYqS384`

Cet épisode couvre l'introduction intégrale du jeu :
* Réveil de Link chez Marine et Tarin au Village des Mouettes (obtention du Bouclier).
* Descente vers la Plage Coco au sud, repousser les Octoroks avec le bouclier et récupération de l'Épée dans les vagues.
* Première apparition du Hibou messager expliquant le réveil du Poisson-Rêve.
* Exploration de la Forêt Enchantée : esquiver les Moblins, trouver le Champignon magique.
* Visite à la Sorcière dans les Marais pour concocter la Poudre Magique.
* Utilisation de la Poudre Magique sur le raton-laveur (Tarin) pour briser son enchantement.
* Récupération de la Clé Flagello (Tail Key) dans le coffre du fond de la forêt pour ouvrir la Cave Flagello.
"""

with open("docs/la_dx_knowledge_base/06_VIDEO_WALKTHROUGH_INDEX.md", "w", encoding="utf-8") as f:
    f.write(doc_6)

print("Created 06_VIDEO_WALKTHROUGH_INDEX.md")
