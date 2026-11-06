import urllib.request
import re

req = urllib.request.Request("https://www.palaiszelda.com/linksawakening/soluce.php?p=1", headers={"User-Agent": "Mozilla/5.0"})
raw = urllib.request.urlopen(req).read().decode("windows-1252", errors="replace")

m = re.search(r'<main\s+id=["\']partiePrincipale["\']>(.*?)</main>', raw, re.DOTALL | re.IGNORECASE)
if m:
    content = m.group(1)
    # remove mobile menu
    content = re.sub(r'<nav\s+id=["\']menuMobileHoriz["\'].*?</nav>', '', content, flags=re.DOTALL)
    print("Main content length:", len(content))
    print("Main content snippet:\n", content[:1500])
else:
    print("Not found")
