import urllib.request
import re
import html
import os
import json

BASE_URL = "https://www.palaiszelda.com/linksawakening/"

def fetch_url(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    data = urllib.request.urlopen(req, timeout=15).read()
    try:
        return data.decode("windows-1252")
    except:
        return data.decode("utf-8", errors="replace")

def clean_html(text):
    # Convert <br>, <p>, <li>, <tr> to newlines
    text = re.sub(r'<br\s*/?>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'</p>', '\n\n', text, flags=re.IGNORECASE)
    text = re.sub(r'</li>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'</tr>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<h[1-6][^>]*>(.*?)</h[1-6]>', r'\n\n### \1\n\n', text, flags=re.IGNORECASE | re.DOTALL)
    # Strip remaining tags
    text = re.sub(r'<[^>]+>', ' ', text)
    # Decode entities
    text = html.unescape(text)
    # Normalize whitespace
    lines = [re.sub(r'[ \t]+', ' ', line).strip() for line in text.split('\n')]
    clean = []
    blank = False
    for l in lines:
        if l:
            clean.append(l)
            blank = False
        elif not blank:
            clean.append('')
            blank = True
    return '\n'.join(clean).strip()

print("Scraper utility ready.")
