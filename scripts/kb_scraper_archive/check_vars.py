import urllib.request
import re

for js_name in ["js_txt_1.js", "js_txt_2.js"]:
    url = f"https://www.palaiszelda.com/linksawakening/{js_name}"
    raw = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})).read().decode("windows-1252", errors="replace")
    vars_found = re.findall(r'var\s+([a-zA-Z0-9_]+)\s*;', raw)
    print(f"{js_name} variables: {vars_found}")
