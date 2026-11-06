import urllib.request
import re
from html.parser import HTMLParser

class HTMLTextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text_parts = []
        self.in_script = False
        self.in_style = False

    def handle_starttag(self, tag, attrs):
        if tag.lower() in ['script', 'style']:
            self.in_script = True
        elif tag.lower() in ['p', 'div', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'tr']:
            self.text_parts.append('\n')

    def handle_endtag(self, tag):
        if tag.lower() in ['script', 'style']:
            self.in_script = False
        elif tag.lower() in ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'tr']:
            self.text_parts.append('\n')

    def handle_data(self, data):
        if not self.in_script and not self.in_style:
            self.text_parts.append(data)

    def get_text(self):
        text = "".join(self.text_parts)
        # Normalize whitespace while preserving paragraphs
        lines = [re.sub(r'[ \t]+', ' ', line).strip() for line in text.split('\n')]
        clean_lines = []
        blank = False
        for l in lines:
            if l:
                clean_lines.append(l)
                blank = False
            elif not blank:
                clean_lines.append('')
                blank = True
        return '\n'.join(clean_lines).strip()

req = urllib.request.Request("https://www.palaiszelda.com/linksawakening/soluce.php?p=1", headers={"User-Agent": "Mozilla/5.0"})
html = urllib.request.urlopen(req).read().decode("utf-8", errors="replace")
extractor = HTMLTextExtractor()
extractor.feed(html)
text = extractor.get_text()

# Find main content
print("Length:", len(text))
print("Sample:\n", text[:1000])
