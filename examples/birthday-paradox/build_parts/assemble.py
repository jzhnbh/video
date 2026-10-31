from pathlib import Path

base = Path(__file__).resolve().parent
files = [
    base / 'p1.html',
    base.parent / 'sim_const.js',
    base / 'p2.js',
    base / 'p3.js',
    base / 'p4.js',
    base / 'p5.js',
    base / 'p6.js',
]
text = '\n'.join(f.read_text(encoding='utf-8') for f in files)
(base.parent / 'index.html').write_text(text, encoding='utf-8')
print('wrote', base.parent / 'index.html', len(text), 'chars')
