import urllib.request
import re

url = "https://www.palaiszelda.com/linksawakening/solution_video.php?v=4kgZYYqS384"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
raw = urllib.request.urlopen(req).read().decode("windows-1252", errors="replace")

h1_idx = raw.find('<h1')
footer_idx = raw.find('class="jeuFooter"')
if h1_idx != -1 and footer_idx != -1:
    body = raw[h1_idx:footer_idx]
    clean = re.sub(r'<[^>]+>', ' ', body)
    clean = re.sub(r'\s+', ' ', clean).strip()
    print("Video page content:\n", clean)
