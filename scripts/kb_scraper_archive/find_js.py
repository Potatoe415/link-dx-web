import urllib.request
import re

req = urllib.request.Request("https://www.palaiszelda.com/linksawakening/soluce.php?p=1", headers={"User-Agent": "Mozilla/5.0"})
raw = urllib.request.urlopen(req).read().decode("windows-1252", errors="replace")

scripts = re.findall(r'<script[^>]*src=["\']([^"\']+)["\']', raw)
print("External scripts found:")
for s in scripts:
    print(s)

# Also check inline script defining variables
inline = re.findall(r'<script[^>]*>(.*?)</script>', raw, re.DOTALL)
print("\nInline scripts found:", len(inline))
for i, s in enumerate(inline):
    if "z4" in s:
        print(f"Script {i} contains z4:\n{s[:300]}")
