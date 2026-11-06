import urllib.request
import re
from urllib.parse import urljoin

pages = [
    "https://www.palaiszelda.com/linksawakening/trucs.php",
    "https://www.palaiszelda.com/linksawakening/coeurs.php",
    "https://www.palaiszelda.com/linksawakening/coquillages.php",
    "https://www.palaiszelda.com/linksawakening/equipement.php",
    "https://www.palaiszelda.com/linksawakening/objets.php",
    "https://www.palaiszelda.com/linksawakening/suite_echanges.php",
    "https://www.palaiszelda.com/linksawakening/ta_photos.php",
    "https://www.palaiszelda.com/linksawakening/guideboss.php",
    "https://www.palaiszelda.com/linksawakening/encore_plus.php",
    "https://www.palaiszelda.com/linksawakening/magasins.php",
    "https://www.palaiszelda.com/linksawakening/rubis.php",
    "https://www.palaiszelda.com/linksawakening/differences_gb_gbcolor.php",
    "https://www.palaiszelda.com/linksawakening/airs_ocarina.php",
    "https://www.palaiszelda.com/linksawakening/augmentation_capacites.php",
    "https://www.palaiszelda.com/linksawakening/teleporteurs.php",
    "https://www.palaiszelda.com/linksawakening/fontaines_fees.php"
]

all_scripts = set()
for p in pages:
    try:
        req = urllib.request.Request(p, headers={"User-Agent": "Mozilla/5.0"})
        raw = urllib.request.urlopen(req).read().decode("windows-1252", errors="replace")
        for s in re.findall(r'<script[^>]*src=["\']([^"\']+)["\']', raw):
            full = urljoin(p, s)
            if "palaiszelda.com/linksawakening" in full:
                all_scripts.add(full)
    except Exception as e:
        print(f"Error {p}: {e}")

print("All JS scripts found in LA section:")
for s in sorted(all_scripts):
    print(s)
