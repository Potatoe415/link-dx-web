import urllib.request
import re

req = urllib.request.Request("https://www.palaiszelda.com/linksawakening/soluce.php?p=1", headers={"User-Agent": "Mozilla/5.0"})
raw = urllib.request.urlopen(req).read().decode("windows-1252", errors="replace")

idx = raw.find('</nav>')
if idx != -1:
    print("Content after </nav>:")
    print(raw[idx:idx+2000])
