import json, subprocess, sys, re, os
A="0fb4bf05-7802-48e2-b209-0d63777f33ef"; P="3409ba65-04b6-44b3-af90-d9eac984e5ec"
OUT=os.path.dirname(os.path.abspath(__file__))
def call(tool, args):
    p=subprocess.run(["botinc","design","call",tool,"--account",A,"--arguments-file","-"],input=json.dumps(args),capture_output=True,text=True)
    if p.returncode!=0: raise SystemExit(f"{tool} failed: {p.stderr[:800]} {p.stdout[:800]}")
    return json.loads(p.stdout)["content"][0]["text"]
def parse(t):
    m=re.search(r"<untrusted-project-content([^>]*)>\n?(.*)</untrusted-project-content>", t, re.S)
    if not m: raise SystemExit("read_file returned no project content")
    attrs=dict(re.findall(r'(\w+)="([^"]*)"', m.group(1)))
    body=m.group(2).replace("&lt;","<").replace("&gt;",">").replace("&amp;","&")
    return attrs, body
def read_full(path):
    attrs, body = parse(call("read_file",{"project_id":P,"path":path,"offset":1,"limit":200}))
    total=int(attrs.get("total_lines","0")); lines=attrs.get("lines","")
    out=[body]
    while lines and total:
        a,b=[int(x) for x in lines.split("-")]
        if b>=total: break
        attrs, body = parse(call("read_file",{"project_id":P,"path":path,"offset":b+1,"limit":200}))
        lines=attrs.get("lines",""); out.append(body)
    return "".join(out), attrs
for path in sys.argv[1:]:
    data,attrs=read_full(path)
    dest=os.path.join(OUT,path.replace("/","__"))
    open(dest,"w").write(data)
    print(path, len(data), "bytes", attrs.get("total_lines"), "lines ->", os.path.basename(dest))
