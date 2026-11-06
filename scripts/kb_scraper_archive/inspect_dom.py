import urllib.request
import re

req = urllib.request.Request("https://www.palaiszelda.com/linksawakening/soluce.php?p=1", headers={"User-Agent": "Mozilla/5.0"})
raw = urllib.request.urlopen(req).read().decode("windows-1252", errors="replace")

# Let's inspect where the article/content starts
print("Matches for h1, main, article, or content div:")
for match in re.finditer(r'<h1[^>]*>(.*?)</h1>', raw, re.DOTALL):
    print("H1:", match.group(1))

# Check id or class attributes
print("\nIDs and classes found:")
for match in re.findall(r'(id|class)=["\']([^"\']+)["\']', raw)[:25]:
    print(match)
