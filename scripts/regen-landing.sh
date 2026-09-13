#!/usr/bin/env bash
# Regenerate the landing + thread-shell JSX bodies from the design sources.
set -euo pipefail
cd "$(dirname "$0")/.."
D=../design-ref
gen() { python3 scripts/dc2jsx.py "$1" --start "$2" --end "$3" > /tmp/gen.jsx; npx --yes prettier@3 --parser babel --print-width 120 /tmp/gen.jsx 2>/dev/null; }
python3 - "$D" <<'PY'
import re,subprocess,sys
D=sys.argv[1]
def gen(f,start,end):
    j=subprocess.run(["python3","scripts/dc2jsx.py",f"{D}/{f}","--start",start,"--end",end],capture_output=True,text=True,check=True).stdout
    open('/tmp/gen.jsx','w').write(j)
    p=subprocess.run(["npx","--yes","prettier@3","--parser","babel-ts","--print-width","120","/tmp/gen.jsx"],capture_output=True,text=True)
    if p.returncode: raise SystemExit(p.stderr[-2000:])
    j=p.stdout.strip()
    if j.endswith(';'): j=j[:-1]
    return j
def splice(path,body):
    s=open(path).read()
    a=s.index('  return (\n')+len('  return (\n'); b=s.rindex('\n  );\n}')
    s=s[:a]+'    '+body.replace('\n','\n    ')+s[b:]
    open(path,'w').write(s)
# landing
j=gen("Landing v4.dc.html", r'<div class="\{\{ rootClass \}\}">', '</x-dc>')
def imp(m):
    attrs=dict(re.findall(r'(\w+)="([^"]*)"', m.group(0)))
    parts=[f'{k}={{{attrs[k]}}}' for k in ["gap","dot","force","radius","speed","band","life","opacity"] if k in attrs]
    if 'color' in attrs: parts.append(f'color="{attrs["color"]}"')
    return "<DotWave "+" ".join(parts)+" />"
j=re.sub(r'<Import\b[^>]*?/>', imp, j, flags=re.S)
j=j.replace('<button className={v.apiCls} onClick={v.setApi}>','<button className={v.apiClsBtn} onClick={v.setApi}>')
j=re.sub(r'<ThreadShell((?:.|\n)*?)\s*style=\{\{\s*display: "block",\s*width: "100%",\s*height: "100%",?\s*\}\}\s*/>', lambda m: '<div style={{ display: "block", width: "100%", height: "100%" }}><ThreadShell'+m.group(1).rstrip()+' /></div>', j)
splice('apps/web/features/landing/landing-view.tsx', j)
# thread shell
j=gen("ThreadShell.dc.html", r'<div class="app app-v9', '</x-dc>')
splice('apps/web/features/landing/thread-shell.tsx', j)
PY
for f in apps/web/features/landing/landing-view.tsx apps/web/features/landing/thread-shell.tsx; do
  python3 - "$f" <<'PY'
import re,sys
p=sys.argv[1]; t=open(p).read()
t=re.sub(r'style=\{(\{[^}]*"--[^}]*\})\}', r'style={\1 as CSSProperties}', t)
t=re.sub(r'\\u([0-9a-fA-F]{4})', lambda m: chr(int(m.group(1),16)), t)
open(p,'w').write(t)
PY
done
echo regenerated
