import urllib.request
import re

for js_name in ["js_txt_1.js", "js_txt_2.js"]:
    url = f"https://www.palaiszelda.com/linksawakening/{js_name}"
    raw = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})).read().decode("windows-1252", errors="replace")
    for m in re.finditer(r'(z4sol\d+)\s*=\s*"(.*?)"\s*;', raw, re.DOTALL):
        var_name = m.group(1)
        val = m.group(2)
        titre = re.search(r'<h2[^>]*>(.*?)</h2>', val)
        t_text = titre.group(1) if titre else "No title"
        print(f"{var_name}: {t_text} (length {len(val)})")
