import urllib.request
import re

req = urllib.request.Request("https://www.palaiszelda.com/linksawakening/soluce.php?p=1", headers={"User-Agent": "Mozilla/5.0"})
raw = urllib.request.urlopen(req).read().decode("windows-1252", errors="replace")

match = re.search(r'<div[^>]*id=["\']corpsPage["\'][^>]*>(.*?)</div>\s*<!--\s*fin corpsPage', raw, re.DOTALL | re.IGNORECASE)
if not match:
    # let's see how corpsPage is closed or what elements are inside
    idx = raw.find('id="corpsPage"')
    print("Found corpsPage at:", idx)
    print(raw[idx:idx+2500])
else:
    print("Matched corpsPage!")
