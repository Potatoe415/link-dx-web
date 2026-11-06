import urllib.request
import re

req = urllib.request.Request("https://www.palaiszelda.com/linksawakening/soluce.php?p=1", headers={"User-Agent": "Mozilla/5.0"})
raw = urllib.request.urlopen(req).read()
try:
    text_cp1252 = raw.decode("windows-1252")
    print("Decoded as windows-1252 successfully!")
    print(text_cp1252[:400])
except Exception as e:
    print(e)
