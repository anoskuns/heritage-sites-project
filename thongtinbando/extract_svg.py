import pypdf
import re

reader = pypdf.PdfReader('thongtinbando/pdf-ban-do-viet-nam-chinh-thuc-34-tinh.pdf')
page = reader.pages[0]
data = page.get_contents().get_data().decode('latin1', errors='ignore')

H = 841.0
W = 595.0

tokens = re.findall(r'[-+]?\d*\.?\d+|[a-zA-Z*]+', data)

paths = []
current_d = []
current_fill = '#e2e8f0'
current_stroke = 'none'
current_stroke_width = 1

stack = []
for tok in tokens:
    if re.match(r'^[-+]?\d*\.?\d+$', tok):
        stack.append(float(tok))
    elif tok in ('scn', 'rg'):
        if len(stack) >= 3:
            r, g, b = stack[-3:]
            current_fill = f'rgb({int(r*255)}, {int(g*255)}, {int(b*255)})'
        elif len(stack) == 1:
            gray = int(stack[-1]*255)
            current_fill = f'rgb({gray}, {gray}, {gray})'
        stack.clear()
    elif tok in ('SCN', 'RG'):
        if len(stack) >= 3:
            r, g, b = stack[-3:]
            current_stroke = f'rgb({int(r*255)}, {int(g*255)}, {int(b*255)})'
        stack.clear()
    elif tok == 'w':
        if stack:
            current_stroke_width = stack[-1]
        stack.clear()
    elif tok == 'm':
        if len(stack) >= 2:
            x, y = stack[-2], stack[-1]
            current_d.append(f'M {x:.2f} {H - y:.2f}')
        stack.clear()
    elif tok == 'l':
        if len(stack) >= 2:
            x, y = stack[-2], stack[-1]
            current_d.append(f'L {x:.2f} {H - y:.2f}')
        stack.clear()
    elif tok == 'c':
        if len(stack) >= 6:
            x1, y1, x2, y2, x3, y3 = stack[-6:]
            current_d.append(f'C {x1:.2f} {H - y1:.2f} {x2:.2f} {H - y2:.2f} {x3:.2f} {H - y3:.2f}')
        stack.clear()
    elif tok == 'h':
        current_d.append('Z')
        stack.clear()
    elif tok in ('f', 'f*', 'b', 'b*'):
        if current_d:
            paths.append((' '.join(current_d), current_fill, 'none', 0))
            current_d = []
        stack.clear()
    elif tok in ('s', 'S'):
        if current_d:
            paths.append((' '.join(current_d), 'none', current_stroke, current_stroke_width))
            current_d = []
        stack.clear()
    elif tok in ('B', 'B*'):
        if current_d:
            paths.append((' '.join(current_d), current_fill, current_stroke, current_stroke_width))
            current_d = []
        stack.clear()
    else:
        stack.clear()

print('Total extracted SVG paths:', len(paths))
with open('thongtinbando/vietnam_extracted.svg', 'w', encoding='utf-8') as f:
    f.write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">\n')
    for d, fill, stroke, sw in paths:
        f.write(f'  <path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" />\n')
    f.write('</svg>\n')
print('Wrote thongtinbando/vietnam_extracted.svg successfully!')

