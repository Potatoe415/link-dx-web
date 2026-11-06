import urllib.request
import re

for page in ["coeurs.php", "ta_photos.php", "encore_plus.php", "differences_gb_gbcolor.php"]:
    url = f"https://www.palaiszelda.com/linksawakening/{page}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    raw = urllib.request.urlopen(req).read().decode("windows-1252", errors="replace")
    m = re.search(r'<article[^>]*>(.*?)</article>', raw, re.DOTALL | re.IGNORECASE)
    if m:
        text = re.sub(r'<[^>]+>', ' ', m.group(1))
        text = re.sub(r'\s+', ' ', text).strip()
        print(f"=== {page} (len {len(text)}) ===")
        print(text[:200])
    else:
        print(f"{page}: No article tag found")
