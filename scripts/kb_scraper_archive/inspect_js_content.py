import urllib.request

for js in ["js_txt_1.js", "js_txt_2.js", "js_img_sol.js"]:
    url = f"https://www.palaiszelda.com/linksawakening/{js}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        data = urllib.request.urlopen(req).read().decode("windows-1252", errors="replace")
        print(f"{js}: size={len(data)} chars")
        print("First 300 chars:")
        print(data[:300])
        print("---")
    except Exception as e:
        print(f"Error {js}: {e}")
