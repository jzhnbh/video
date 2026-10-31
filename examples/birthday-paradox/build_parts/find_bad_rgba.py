import re, pathlib
root = pathlib.Path(r"c:/Users/Administrator/Documents/vibe-knowledge-video/examples/birthday-paradox/build_parts")
call = re.compile(r"rgba\(")
num3 = re.compile(r"rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[0-9.]+\s*\)")
for f in sorted(root.glob("p*.js")) + [root / "p1.html"]:
    text = f.read_text(encoding="utf-8")
    for m in call.finditer(text):
        # 找前一个非空白字符，判断是否在字符串里
        j = m.start() - 1
        while j >= 0 and text[j] in " \t":
            j -= 1
        prev = text[j] if j >= 0 else ""
        if prev in "'\"`":
            continue
        seg = text[m.start():m.start()+40]
        mm = num3.match(text[m.start():m.start()+60])
        if mm:
            line = text.count("\n", 0, m.start()) + 1
            print(f.name, line, mm.group(0))
