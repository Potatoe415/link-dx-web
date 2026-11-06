# Zelda: Link's Awakening — Studio Ghibli Web Remake

Recréation web modulaire de **The Legend of Zelda: Link's Awakening DX** utilisant l'architecture **Pre-rendered Studio Ghibli Background + 160x128 Collision Grid** en **Vanilla TypeScript + Vite + HTML5 Canvas 2D**.

---

## 📌 Points d'Entrée pour Développeurs & Agents IA

Ce dépôt est structuré selon **Bootstrap v10.1** pour pouvoir être repris à tout moment, étape par étape, par un humain ou un agent IA :

1. **[AGENTS.md](file:///m:/Users/admin/Documents/DEV/dev-projects/zelda-la-web/AGENTS.md)** — Règles canoniques d'implémentation, commandes, table de chargement de contexte et invariants du moteur.
2. **[STATE.md](file:///m:/Users/admin/Documents/DEV/dev-projects/zelda-la-web/STATE.md)** — État courant du projet, focus actuel et prochaines actions immédiates.
3. **[docs/ROADMAP_PLANS.md](file:///m:/Users/admin/Documents/DEV/dev-projects/zelda-la-web/docs/ROADMAP_PLANS.md)** — Stratégie de découpage en micro-chapitres modulaires (2 passes : *Whitebox Pixel-Art* $\rightarrow$ *Rendu Studio Ghibli*).
4. **[docs/ARCHITECTURE.md](file:///m:/Users/admin/Documents/DEV/dev-projects/zelda-la-web/docs/ARCHITECTURE.md)** — Arborescence complète du projet, rôle de chaque fichier TypeScript et conventions spatiales (`160x128` logique $\rightarrow$ `1280x1024` affichage).
5. **[docs/ASSET_PIPELINE.md](file:///m:/Users/admin/Documents/DEV/dev-projects/zelda-la-web/docs/ASSET_PIPELINE.md)** — Pipeline complet : extraction des cartes `.map` depuis `_ref_repo/`, génération des décors Ghibli, détourage des sprites et export audio `.gbs` / `.wav`.
6. **[docs/la_dx_knowledge_base/README.md](file:///m:/Users/admin/Documents/DEV/dev-projects/zelda-la-web/docs/la_dx_knowledge_base/README.md)** — Base de connaissances intégrale du jeu (26 Game Flags, 18 chapitres de soluce, donjons, boss, objets et secrets).

---

## 🎮 Démarrage Rapide

```bash
npm install
npm run dev
```

Pour vérifier la compilation TypeScript et le build de production :
```bash
npm run build
```

---

## 🕹️ Commandes en Jeu

* **Déplacement :** <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>, <kbd>Z</kbd><kbd>Q</kbd><kbd>S</kbd><kbd>D</kbd> ou Flèches directionnelles (`1.0 px/frame` à 60 FPS).
* **Réveil / Parler aux PNJ / Valider :** <kbd>Espace</kbd>, <kbd>Entrée</kbd>, <kbd>E</kbd> ou clic souris.
* **Lever le Bouclier (une fois remis par Tarkin) :** Maintenir <kbd>Shift</kbd> ou <kbd>X</kbd>.
* **Bouton A / B (objet équipé) :** A = <kbd>Espace</kbd> / <kbd>J</kbd>, B = <kbd>Shift</kbd> / <kbd>X</kbd> / <kbd>K</kbd>. L'Épée (plage, au sud du village) frappe ; maintenir puis relâcher pour l'Attaque Tournoyante.
* **Inventaire (<kbd>Tab</kbd> / <kbd>I</kbd>) :** Assigner un objet aux boutons A / B, voir les Instruments des Sirènes.
* **Lire un panneau / Ouvrir un coffre :** Face au panneau ou par le bas du coffre, <kbd>Espace</kbd>.
* **Sauvegarde :** Automatique (`localStorage`). Bouton « Reset Save » sous le jeu pour recommencer.
* **Basculer le rendu (<kbd>G</kbd>) :** Alterne en temps réel entre **Studio Ghibli HD (`1280x1024`)** et **Pixel-Art Original (`160x128` x8)**.
* **Afficher la grille de collision (<kbd>C</kbd>) :** Affiche les boîtes AABB des murs (rouge), des PNJ (violet), des portes (cyan) et des pieds de Link (vert).
* **Couper / Activer l'audio (<kbd>M</kbd>) :** Active ou coupe les musiques `.gbs` et bruitages `.wav` originaux.

---

## 🏛️ Arborescence du Projet

```text
zelda-la-web/
├── AGENTS.md                        # Instructions & invariants pour les agents IA
├── STATE.md                         # État d'avancement (<40 lignes)
├── docs/
│   ├── PRODUCT.md                   # Périmètre produit & fonctionnalités validées
│   ├── ARCHITECTURE.md              # Architecture technique & carte des modules
│   ├── ROADMAP_PLANS.md             # Plans de construction étape par étape
│   ├── ASSET_PIPELINE.md            # Guide de création des décors Ghibli, sprites & sons
│   ├── BACKLOG.md                   # Liste des tâches (Now / Next)
│   ├── DEBUGGING.md                 # Guide de débogage visuel et catalogue d'erreurs
│   ├── SECURITY.md                  # Règles de sécurité & dépendances
│   ├── RUNBOOK.md                   # Procédures d'exécution et de build
│   ├── decisions/                   # Journal des décisions d'architecture (ADR)
│   ├── _templates/                  # Modèles Bootstrap v10.1
│   └── la_dx_knowledge_base/        # Spécification complète de Link's Awakening DX (00 à 06)
├── public/assets/                   # Décors Ghibli & Pixel-Art, spritesheet RGBA, audio GBS/WAV
├── src/
│   ├── main.ts                      # Boucle 60 FPS, rendu Y-sorted, bascule Ghibli/Pixel
│   ├── core/                        # Input, Camera, Collision, Dialogue, Audio
│   ├── data/                        # rooms.ts (salles, collisions, dialogues), animations.ts
│   └── entities/                    # Player.ts (Link + Bouclier), Prop.ts (PNJ + Particules)
├── scripts/
│   ├── export_gbs_audio.py          # Exporteur C#/.NET des musiques originales awakening.gbs
│   └── kb_scraper_archive/          # Scripts archivés d'extraction de la base de connaissances
└── _ref_repo/                       # Code source & assets bruts Links-Awakening-DX-HD v1.0.0
```
