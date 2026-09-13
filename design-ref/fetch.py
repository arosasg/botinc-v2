import json, subprocess, sys, html, re, os
A="825b8b30-375c-478c-afc2-9f88c3b168a8"; P="3409ba65-04b6-44b3-af90-d9eac984e5ec"
OUT=os.path.dirname(os.path.abspath(__file__))
def call(tool, args):
    p=subprocess.run(["botinc","design","call",tool,"--account",A,"--arguments-file","-"],input=json.dumps(args),capture_output=True,text=True)
    if p.returncode!=0: raise SystemExit(f"{tool} failed: {p.stderr[:800]} {p.stdout[:800]}")
    return json.loads(p.stdout)["content"][0]["text"]
def parse(t):
    m=re.search(r"<untrusted-project-content([^>]*)>\n?(.*)</untrusted-project-content>", t, re.S)
    attrs=dict(re.findall(r'(\w+)="([^"]*)"', m.group(1)))
    return attrs, html.unescape(m.group(2))
def read_full(path):
    attrs, body = parse(call("read_file",{"project_id":P,"path":path}))
    total=int(attrs.get("total_lines","0")); lines=attrs.get("lines","")
    out=[body]
    while lines and total:
        a,b=[int(x) for x in lines.split("-")]
        if b>=total: break
        attrs, body = parse(call("read_file",{"project_id":P,"path":path,"offset":b+1}))
        lines=attrs.get("lines",""); out.append(body)
    return "".join(out), attrs
for path in sys.argv[1:]:
    data,attrs=read_full(path)
    dest=os.path.join(OUT,path.replace("/","__"))
    open(dest,"w").write(data)
    print(path, len(data), "bytes", attrs.get("total_lines"), "lines ->", os.path.basename(dest))
