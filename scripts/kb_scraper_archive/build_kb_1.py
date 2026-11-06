import json
import re

with open("docs/scraped_raw/walkthrough.json", "r", encoding="utf-8") as f:
    walkthrough = json.load(f)

doc_lines = [
    "# The Legend of Zelda: Link's Awakening DX — Solution Complète Détaillée (18 Chapitres)",
    "",
    "Ce document regroupe l'intégralité du cheminement pas à pas de *Link's Awakening DX*, extrait de la référence francophone de référence (*Le Palais de Zelda*), enrichi des données mécaniques précises nécessaires à la recréation du jeu.",
    "",
    "---",
    ""
]

chapter_names = {
    1: "Chapitre 1 : Village des Mouettes, Plage Coco & Forêt Enchantée",
    2: "Chapitre 2 : Niveau 1 — Cave Flagello (Tail Cave)",
    3: "Chapitre 3 : Sauvetage de Toutou & Marais des Anémones",
    4: "Chapitre 4 : Niveau 2 — Grotte du Génie (Bottle Grotto)",
    5: "Chapitre 5 : Château Canulet & Feuilles d'Or de Richard",
    6: "Chapitre 6 : Niveau 3 — Cave aux Clés (Key Cavern)",
    7: "Chapitre 7 : Prairie Oukoukou, Village des Animaux & Dunes de Yarna",
    8: "Chapitre 8 : Niveau 4 — Abîme du Poisson (Angler's Tunnel)",
    9: "Chapitre 9 : Promenade avec le Fantôme & Baie de Martha",
    10: "Chapitre 10 : Niveau 5 — Temple du Poisson-Chat (Catfish's Maw)",
    11: "Chapitre 11 : Suite et Fin de la Séquence des Échanges & Boomerang",
    12: "Chapitre 12 : Donjon Bonus DX — Temple des Couleurs (Color Dungeon)",
    13: "Chapitre 13 : Région des Temples, Ancien Sanctuaire & Clé Masque",
    14: "Chapitre 14 : Niveau 6 — Temple du Masque (Face Shrine)",
    15: "Chapitre 15 : Dédale des Panneaux, Mamu & Réveil du Coq Volant",
    16: "Chapitre 16 : Niveau 7 — Tour du Vautour (Eagle's Tower)",
    17: "Chapitre 17 : Roc de la Tortue (Turtle Rock)",
    18: "Chapitre 18 : Mont Tamaranch, L'Oeuf Sacré & Les Formes du Cauchemar"
}

for ch_id in range(1, 19):
    data = walkthrough.get(str(ch_id))
    if not data:
        continue
    title = chapter_names.get(ch_id, f"Chapitre {ch_id}")
    raw_text = data["text"]
    
    # Clean up navigation words from scraped page if any
    clean_text = raw_text.replace("Index de la Solution", "").replace("Trucs et Astuces", "").strip()
    
    doc_lines.append(f"## 🗺️ {title}")
    doc_lines.append("")
    doc_lines.append(clean_text)
    doc_lines.append("")
    doc_lines.append("---")
    doc_lines.append("")

with open("docs/la_dx_knowledge_base/01_COMPLETE_WALKTHROUGH.md", "w", encoding="utf-8") as f:
    f.write("\n".join(doc_lines))

print("Created 01_COMPLETE_WALKTHROUGH.md successfully!")
