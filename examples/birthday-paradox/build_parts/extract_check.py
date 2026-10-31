from pathlib import Path
import re
p = Path(__file__).resolve().parent.parent / 'index.html'
s = p.read_text(encoding='utf-8')
m = re.search(r'<script>(.*)</script>', s, re.S)
out = Path(__file__).resolve().parent / 'combined_check.js'
out.write_text(m.group(1), encoding='utf-8')
print('script chars', len(m.group(1)))
