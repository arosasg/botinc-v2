#!/usr/bin/env python3
"""Generate the Workspace v19 view components from the design template.

One file per screen, side pane, overlay and dialog under
apps/web/features/workspace/views/, plus workspace-view.tsx composing them in
template order. Every component takes the view-model `v` (the prototype's
renderVals merged with props) and renders the design markup 1:1.
"""
import os, re, sys, json, subprocess, html
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dc2jsx

D = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "design-ref")
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "apps", "web", "features", "workspace", "views")
os.makedirs(OUT, exist_ok=True)

src = open(os.path.join(D, "Workspace v19.dc.html")).read()
s = src.find("</helmet>") + len("</helmet>"); e = src.find('<script type="text/x-dc"')
p = dc2jsx.P(); p.feed(src[s:e])
root = [k for k in p.root.kids if not isinstance(k, dc2jsx.Text)][0]

def slug(s):
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return s or "block"
def pascal(s):
    return "".join(x.capitalize() for x in slug(s).split("-"))

files = []  # (component name, file slug, jsx)
component_ids = {}
def emit(name, node, scope=set()):
    if node.tag == "sc-if":
        # a bare conditional is the component body (no JSX-expression braces)
        inner = dc2jsx.render_kids(node, set(scope), 0)
        jsx = f"{dc2jsx.expr(cond_of(node), set(scope))} ? (<>{inner}</>) : null"
    else:
        jsx = dc2jsx.render(node, set(scope), 0)
    fslug = slug(name)
    suffix = component_ids.get(fslug, 0)
    component_ids[fslug] = suffix + 1
    if suffix:
        fslug = f"{fslug}-{suffix}"
        name = f"{pascal(name)}{suffix}"
    else:
        name = pascal(name)
    files.append((name, fslug, jsx))
    return name

def cond_of(n):
    m = dc2jsx.BIND.search(dict(n.attrs).get("value", ""))
    return m.group(1).strip() if m else None

def label_of(n):
    for k in n.kids:
        if isinstance(k, dc2jsx.Node):
            a = dict(k.attrs)
            return a.get("data-screen-label") or a.get("aria-label") or (a.get("class") or "").split(" ")[0] or k.tag
    return "block"

# --- compose the root
root_parts = []
for k in root.kids:
    if isinstance(k, dc2jsx.Text):
        continue
    a = dict(k.attrs)
    if k.tag == "div" and "app-main" in (a.get("class") or ""):
        # header + workspace-body pages + overlays
        inner = []
        for kk in k.kids:
            if isinstance(kk, dc2jsx.Text): continue
            aa = dict(kk.attrs)
            if kk.tag == "div" and "workspace-body" in (aa.get("class") or ""):
                body_parts = []
                for page in kk.kids:
                    if isinstance(page, dc2jsx.Text): continue
                    if page.tag == "sc-if":
                        c = cond_of(page); name = emit("page-" + label_of(page), page)
                        body_parts.append(f"<{name} v={{v}} />")
                    else:
                        name = emit("body-" + (dict(page.attrs).get("class") or page.tag).split(" ")[0], page)
                        body_parts.append(f"<{name} v={{v}} />")
                # the workspace-body wrapper itself keeps its attributes
                attrs = " ".join(x for x in (dc2jsx.jsx_attr(kk_k, kk_v, set()) for kk_k, kk_v in kk.attrs) if x)
                inner.append(f"<div {attrs}>" + "".join(body_parts) + "</div>")
            elif kk.tag == "sc-if":
                name = emit("overlay-" + label_of(kk), kk); inner.append(f"<{name} v={{v}} />")
            else:
                name = emit("app-" + (aa.get("class") or kk.tag).split(" ")[0], kk); inner.append(f"<{name} v={{v}} />")
        attrs = " ".join(x for x in (dc2jsx.jsx_attr(ak, av, set()) for ak, av in k.attrs) if x)
        root_parts.append(f"<div {attrs}>" + "".join(inner) + "</div>")
    elif k.tag == "sc-if" and cond_of(k) == "dialogOpen":
        # modal-shade > section > many sc-if dialogs
        shade = [x for x in k.kids if isinstance(x, dc2jsx.Node)][0]
        section = [x for x in shade.kids if isinstance(x, dc2jsx.Node)][0]
        dparts = []
        for d in section.kids:
            if isinstance(d, dc2jsx.Text):
                if d.s.strip(): dparts.append(dc2jsx.render(d, set(), 0))
                continue
            if d.tag == "sc-if":
                name = emit("dialog-" + (cond_of(d) or "x"), d); dparts.append(f"<{name} v={{v}} />")
            else:
                dparts.append(dc2jsx.render(d, set(), 0))
        shade_attrs = " ".join(x for x in (dc2jsx.jsx_attr(ak, av, set()) for ak, av in shade.attrs) if x)
        sec_attrs = " ".join(x for x in (dc2jsx.jsx_attr(ak, av, set()) for ak, av in section.attrs) if x)
        root_parts.append(f"{{v.dialogOpen ? (<div {shade_attrs}><section {sec_attrs}>" + "".join(dparts) + "</section></div>) : null}")
    elif k.tag == "sc-if":
        name = emit("shell-" + label_of(k), k); root_parts.append(f"<{name} v={{v}} />")
    else:
        name = emit("shell-" + (a.get("class") or k.tag).split(" ")[0], k); root_parts.append(f"<{name} v={{v}} />")

root_attrs = " ".join(x for x in (dc2jsx.jsx_attr(ak, av, set()) for ak, av in root.attrs) if x)
root_jsx = f"<div {root_attrs}>" + "".join(root_parts) + "</div>"

def pretty(jsx):
    open("/tmp/gen.jsx", "w").write(jsx)
    r = subprocess.run(["npx", "--yes", "prettier@3", "--parser", "babel-ts", "--print-width", "120", "/tmp/gen.jsx"], capture_output=True, text=True)
    if r.returncode:
        sys.exit("prettier failed: " + r.stderr[-1500:])
    out = r.stdout.strip()
    if out.endswith(";"): out = out[:-1]
    out = re.sub(r"\\u([0-9a-fA-F]{4})", lambda m: chr(int(m.group(1), 16)), out)
    out = out.replace('webkitdirectory=""', '{...{ webkitdirectory: "" }}')
    return out

HEADER = '''/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CSSProperties } from "react";
import { Fragment } from "react";
import type { Vals } from "../vals";
import { css } from "@/lib/dc/css";
import { interp } from "@/lib/dc/interp";
import { MessageText } from "../message-text";

'''
for name, fslug, jsx in files:
    body = pretty(jsx)
    body = body.replace('<p>{interp(m.text)}</p>', '<MessageText text={String(m.text ?? "")} />')
    body = body.replace('onKeyDown={v.composerKey12}', 'onKeyDown={v.composerKey12} onPaste={v.composerPaste}')
    body = re.sub(
        r'(<button\s+className=\{`send-button[^>]+type="submit"[^>]+disabled=\{v\.composerEmpty11\})',
        r'\1 onClick={v.sendComposer11}',
        body,
        flags=re.S,
    )
    uses_css = "CSSProperties" in body
    uses_frag = "<Fragment" in body
    hdr = HEADER
    if not uses_css: hdr = hdr.replace('import type { CSSProperties } from "react";\n', "")
    if not uses_frag: hdr = hdr.replace('import { Fragment } from "react";\n', "")
    if "css(" not in body: hdr = hdr.replace('import { css } from "@/lib/dc/css";\n', "")
    if "interp(" not in body: hdr = hdr.replace('import { interp } from "@/lib/dc/interp";\n', "")
    if "<MessageText" not in body: hdr = hdr.replace('import { MessageText } from "../message-text";\n', "")
    open(os.path.join(OUT, fslug + ".tsx"), "w").write(hdr + f"export function {name}({{ v }}: {{ v: Vals }}) {{\n  return (\n    " + body.replace("\n", "\n    ") + "\n  );\n}\n")
    print(fslug, len(body))

imports = [f'import {{ {n} }} from "./{fs}";' for n, fs, _ in files]
root_body = pretty(root_jsx)
open(os.path.join(OUT, "workspace-view.tsx"), "w").write(
    '/* Generated by scripts/gen-workspace.py. Composes the Workspace v19 screens in template order. */\n'
    '/* eslint-disable @typescript-eslint/no-explicit-any */\n'
    'import type { Vals } from "../vals";\n' + "\n".join(imports) + "\n\n"
    f"export function WorkspaceView({{ v }}: {{ v: Vals }}) {{\n  return (\n    " + root_body.replace("\n", "\n    ") + "\n  );\n}\n")
print("root", len(root_body), "files", len(files))

subprocess.run([sys.executable,os.path.join(os.path.dirname(__file__),"workspace-product.py")],check=True)
