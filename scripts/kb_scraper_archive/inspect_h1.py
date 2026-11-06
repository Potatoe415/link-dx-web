import urllib.request
import re

req = urllib.request.Request("https://www.palaiszelda.com/linksawakening/soluce.php?p=1", headers={"User-Agent": "Mozilla/5.0"})
raw = urllib.request.urlopen(req).read().decode("windows-1252", errors="replace")

m = re.search(r'<main\s+id=["\']partiePrincipale["\']>(.*?)</main>', raw, re.DOTALL | re.IGNORECASE)
if m:
    content = m.group(1)
    # look for h1
    h1_idx = content.find('<h1')
    if h1_idx != -1:
        print("From H1 to end:\n")
        print(content[h1_idx:h1_idx+3000])
