import urllib.request
import re
import html
import os
import json

BASE_URL = "https://www.palaiszelda.com/linksawakening/"

def fetch_url(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    data = urllib.request.urlopen(req, timeout=15).read()
    try:
        return data.decode("windows-1252")
    except:
        return data.decode("utf-8", errors="replace")

def clean_html(text):
    text = re.sub(r'<br\s*/?>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'</p>', '\n\n', text, flags=re.IGNORECASE)
    text = re.sub(r'</li>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'</tr>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<h[1-6][^>]*>(.*?)</h[1-6]>', r'\n\n### \1\n\n', text, flags=re.IGNORECASE | re.DOTALL)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = html.unescape(text)
    lines = [re.sub(r'[ \t]+', ' ', line).strip() for line in text.split('\n')]
    clean = []
    blank = False
    for l in lines:
        if l:
            clean.append(l)
            blank = False
        elif not blank:
            clean.append('')
            blank = True
    return '\n'.join(clean).strip()

def extract_body(raw):
    h1_idx = raw.find('<h1')
    if h1_idx == -1:
        h1_idx = raw.find('<main')
    footer_idx = raw.find('class="jeuFooter"')
    if footer_idx == -1:
        footer_idx = raw.find('</main>')
    if h1_idx != -1 and footer_idx != -1:
        section = raw[h1_idx:footer_idx]
        return clean_html(section)
    return clean_html(raw)

# 1. Fetch walkthrough chapters
print("Fetching walkthrough chapters from js_txt_1.js and js_txt_2.js...")
walkthrough = {}
for js_name in ["js_txt_1.js", "js_txt_2.js"]:
    url = f"{BASE_URL}{js_name}"
    raw = fetch_url(url)
    for m in re.finditer(r'(z4sol\d+)\s*=\s*"(.*?)"\s*;', raw, re.DOTALL):
        var_name = m.group(1)
        val = m.group(2)
        # unescape escaped quotes and newlines
        val = val.replace('\\"', '"').replace('\\n', '\n').replace('\\/', '/')
        chapter_num = int(var_name.replace('z4sol', ''))
        walkthrough[chapter_num] = {
            "var": var_name,
            "html": val,
            "text": clean_html(val)
        }
print(f"Loaded {len(walkthrough)} walkthrough chapters.")

# 2. Fetch specific topic pages
topics = [
    ("introduction", "introduction.php"),
    ("differences_gb_gbcolor", "differences_gb_gbcolor.php"),
    ("coeurs", "coeurs.php"),
    ("coquillages_1", "coquillages.php"),
    ("coquillages_2", "coquillages_2.php"),
    ("coquillages_3", "coquillages_3.php"),
    ("equipement", "equipement.php"),
    ("objets", "objets.php"),
    ("suite_echanges", "suite_echanges.php"),
    ("ta_photos", "ta_photos.php"),
    ("guideboss", "guideboss.php"),
    ("encore_plus", "encore_plus.php"),
    ("magasins", "magasins.php"),
    ("rubis", "rubis.php"),
    ("airs_ocarina", "airs_ocarina.php"),
    ("augmentation_capacites", "augmentation_capacites.php"),
    ("teleporteurs", "teleporteurs.php"),
    ("fontaines_fees", "fontaines_fees.php"),
    ("plans", "plans.php")
]

topic_data = {}
for key, filename in topics:
    url = f"{BASE_URL}{filename}"
    try:
        raw = fetch_url(url)
        content = extract_body(raw)
        topic_data[key] = {
            "url": url,
            "content": content
        }
        print(f"Fetched {key}: {len(content)} chars")
    except Exception as e:
        print(f"Error fetching {key} ({url}): {e}")

# 3. Fetch video guide list
videos = [
    ("Ch 1 - Village des Mouettes, Plage Coco et Foret Enchantee", "4kgZYYqS384"),
    ("Ch 2 - Cave Flagello", "cqNj0zbBs7I"),
    ("Ch 3 - Village des Mouettes et Marais des Anemones", "FJ-baqT4vtA"),
    ("Ch 4 - Grotte du Genie (Bottle Grotto)", "e85gTNds8no"),
    ("Ch 5 - Village des Mouettes, Prairie et Chateau Canulet", "y7SVM_PGf_A"),
    ("Ch 6 - Cave aux Cles", "x1psvkSXs54"),
    ("Ch 7 - Prairie, Village des Animaux, Dunes de Yarna et Plateau Tartare Est", "iIcAyDLtQoE"),
    ("Ch 8 - Abime du Poisson et Promenade avec un fantome", "NI_b0uGJzDM"),
    ("Ch 9 - Temple du Poisson-Chat", "0tB3FIJz6t8"),
    ("Ch 10 - Suite et fin des echanges", "fx9eXUbgT-0"),
    ("Ch 11 - Temple des Couleurs (DX) et Region des Temples", "CCVIBpET1dI"),
    ("Ch 12 - Temple du Masque, Promenade avec un coq et Dedale des Panneaux", "5bNP41TJYhM"),
    ("Ch 13 - Tour du Vautour et Plateau Tartare Ouest", "tq_Vmy_DkFI"),
    ("Ch 14 - Roc de la Tortue", "zlp09ih5CdY"),
    ("Ch 15 - Oeuf Sacre (Final)", "qFufiljn3Tg")
]

os.makedirs("docs/scraped_raw", exist_ok=True)
with open("docs/scraped_raw/walkthrough.json", "w", encoding="utf-8") as f:
    json.dump(walkthrough, f, ensure_ascii=False, indent=2)

with open("docs/scraped_raw/topics.json", "w", encoding="utf-8") as f:
    json.dump(topic_data, f, ensure_ascii=False, indent=2)

with open("docs/scraped_raw/videos.json", "w", encoding="utf-8") as f:
    json.dump(videos, f, ensure_ascii=False, indent=2)

print("Saved all raw data to docs/scraped_raw/")
