import os
import re

svg_dir = r'd:\Anti\Eunacom\eunacom-app-v2\book\generate-book\svg_diagrams'
files = [f for f in os.listdir(svg_dir) if f.endswith('.svg')]

for f in sorted(files):
    p = os.path.join(svg_dir, f)
    with open(p, 'r', encoding='utf-8', errors='ignore') as fp:
        content = fp.read()
    
    ys = [float(y) for y in re.findall(r'\by=[\"\']([\d\.]+)[\"\']', content)]
    y1s = [float(y) for y in re.findall(r'\by1=[\"\']([\d\.]+)[\"\']', content)]
    y2s = [float(y) for y in re.findall(r'\by2=[\"\']([\d\.]+)[\"\']', content)]
    all_y = ys + y1s + y2s
    
    # Content elements start at y >= 50
    content_y = [y for y in all_y if y >= 45]
    
    if content_y:
        min_y = min(content_y)
        max_y = max(content_y)
        vb = re.search(r'viewBox=[\"\']([^\"\']+)[\"\']', content)
        vb_str = vb.group(1) if vb else 'N/A'
        print(f"{f:30s} -> min_y={min_y:.1f}, max_y={max_y:.1f}, orig_viewBox={vb_str}")
