import urllib.request
import re
from urllib.parse import urljoin

urls_to_check = [
    "https://www.palaiszelda.com/linksawakening/",
    "https://www.palaiszelda.com/linksawakening/solution.php",
    "https://www.palaiszelda.com/linksawakening/trucs.php",
    "https://www.palaiszelda.com/linksawakening/guideboss.php",
    "https://www.palaiszelda.com/linksawakening/plans.php",
    "https://www.palaiszelda.com/linksawakening/differences_versions.php",
    "https://www.palaiszelda.com/linksawakening/solution_video.php"
]

all_links = set()

for u in urls_to_check:
    try:
        req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"})
        content = urllib.request.urlopen(req).read().decode("utf-8", errors="replace")
        for href in re.findall(r'href=["\']([^"\'#]+)["\']', content, re.IGNORECASE):
            full = urljoin(u, href)
            if "palaiszelda.com/linksawakening" in full:
                all_links.add(full)
    except Exception as e:
        print(f"Error {u}: {e}")

print("Discovered links:")
for l in sorted(all_links):
    print(l)
