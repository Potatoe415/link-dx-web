import urllib.request
import re
from urllib.parse import urljoin, urldefrag

base_domain = "https://www.palaiszelda.com/linksawakening/"
visited = set()
to_visit = [base_domain]
all_pages = set()

while to_visit:
    url = to_visit.pop(0)
    url, _ = urldefrag(url)
    if url in visited:
        continue
    visited.add(url)
    all_pages.add(url)
    
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        resp = urllib.request.urlopen(req, timeout=10)
        html = resp.read().decode("utf-8", errors="replace")
        
        for href in re.findall(r'href=["\']([^"\']+)["\']', html, re.IGNORECASE):
            full = urljoin(url, href)
            full, _ = urldefrag(full)
            if full.startswith("https://www.palaiszelda.com/linksawakening/") or full.startswith("http://www.palaiszelda.com/linksawakening/"):
                # Clean protocol to https
                full = full.replace("http://", "https://")
                # Filter out image files and external
                if not any(full.endswith(ext) for ext in ['.jpg', '.png', '.gif', '.zip', '.pdf']):
                    if full not in visited and full not in to_visit:
                        to_visit.append(full)
    except Exception as e:
        print(f"Failed {url}: {e}")

print(f"Total pages discovered: {len(all_pages)}")
for p in sorted(all_pages):
    print(p)
