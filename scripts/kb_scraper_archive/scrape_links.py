import urllib.request
import re
from urllib.parse import urljoin

base_url = "https://www.palaiszelda.com/linksawakening/"
req = urllib.request.Request(base_url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
try:
    html = urllib.request.urlopen(req).read().decode("utf-8", errors="replace")
except Exception as e:
    req = urllib.request.Request(base_url, headers={"User-Agent": "Mozilla/5.0"})
    html = urllib.request.urlopen(req).read().decode("iso-8859-1", errors="replace")

matches = re.findall(r'<a\s+[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', html, re.IGNORECASE | re.DOTALL)
print(f"Total links found: {len(matches)}")
seen = set()
for href, text in matches:
    clean_text = re.sub(r'<[^>]+>', '', text).strip()
    full_url = urljoin(base_url, href)
    if "palaiszelda.com/linksawakening" in full_url:
        if full_url not in seen:
            seen.add(full_url)
            print(f"{clean_text} -> {full_url}")
