#!/usr/bin/env python3
"""Convert a Claude Design DC template fragment into JSX.

Bindings `{{ expr }}` become `{v.expr}` (top-level identifiers are read off the
view-model `v`; loop variables stay bare). `sc-if` becomes a conditional,
`sc-for` a map. Class names and DOM structure are preserved exactly so the
design CSS applies unchanged.

usage: dc2jsx.py <file.dc.html> [--start REGEX --end REGEX] [--name Component]
"""
import re, sys, html, json, argparse
from html.parser import HTMLParser

VOID = {"area","base","br","col","embed","hr","img","input","link","meta","source","track","wbr"}
ATTR_MAP = {"webkitdirectory":"webkitdirectory","class":"className","for":"htmlFor","tabindex":"tabIndex","readonly":"readOnly","maxlength":"maxLength",
  "autofocus":"autoFocus","autocomplete":"autoComplete","colspan":"colSpan","rowspan":"rowSpan","spellcheck":"spellCheck",
  "contenteditable":"contentEditable","enterkeyhint":"enterKeyHint","inputmode":"inputMode","srcset":"srcSet","crossorigin":"crossOrigin",
  "autoplay":"autoPlay","playsinline":"playsInline","novalidate":"noValidate","datetime":"dateTime","accesskey":"accessKey"}
SVG_ATTRS = ["stroke-width","stroke-linecap","stroke-linejoin","stroke-dasharray","stroke-dashoffset","stroke-opacity","stroke-miterlimit",
  "fill-rule","fill-opacity","clip-rule","clip-path","font-family","font-size","font-weight","letter-spacing","text-anchor","dominant-baseline",
  "stop-color","stop-opacity","flood-color","flood-opacity","color-interpolation-filters","shape-rendering","vector-effect","paint-order",
  "marker-end","marker-start","marker-mid","pointer-events","alignment-baseline","baseline-shift","xlink:href"]
for a in SVG_ATTRS:
    parts=a.replace("xlink:","xlink-").split("-")
    ATTR_MAP[a]=parts[0]+"".join(p.capitalize() for p in parts[1:])
for a in ["viewBox","preserveAspectRatio","gradientUnits","gradientTransform","patternUnits","patternTransform","spreadMethod","markerWidth","markerHeight","refX","refY","clipPathUnits","maskUnits","maskContentUnits","filterUnits","primitiveUnits","stdDeviation","baseFrequency","numOctaves","tableValues","edgeMode","kernelMatrix","surfaceScale","specularConstant","specularExponent","diffuseConstant","pointsAtX","pointsAtY","pointsAtZ","lengthAdjust","textLength","startOffset","glyphRef","attributeName","attributeType","calcMode","keyTimes","keySplines","keyPoints","repeatCount","repeatDur","tabIndex"]:
    ATTR_MAP[a.lower()]=a
BOOL_ATTRS = {"disabled","checked","selected","readOnly","autoFocus","hidden","required","multiple","open","autoPlay","muted","loop","playsInline","noValidate","controls","defaultChecked"}
EVENTS = {"onclick":"onClick","onchange":"onChange","oninput":"onInput","onkeydown":"onKeyDown","onblur":"onBlur","onpointerdown":"onPointerDown",
  "onsubmit":"onSubmit","ondoubleclick":"onDoubleClick","onmouseleave":"onMouseLeave","onmouseenter":"onMouseEnter","onfocus":"onFocus","oncontextmenu":"onContextMenu",
  "onkeyup":"onKeyUp","onpointermove":"onPointerMove","onpointerup":"onPointerUp","onscroll":"onScroll","onmousedown":"onMouseDown","onmouseup":"onMouseUp","onpaste":"onPaste"}

BIND = re.compile(r"\{\{\s*(.*?)\s*\}\}")

class Node:
    def __init__(self, tag, attrs, parent):
        self.tag=tag; self.attrs=attrs; self.kids=[]; self.parent=parent
class Text:
    def __init__(self, s): self.s=s

class P(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.root=Node("#root",[],None); self.cur=self.root
    def handle_starttag(self, tag, attrs):
        n=Node(tag,attrs,self.cur); self.cur.kids.append(n)
        if tag not in VOID: self.cur=n
    def handle_startendtag(self, tag, attrs):
        self.cur.kids.append(Node(tag,attrs,self.cur))
    def handle_endtag(self, tag):
        # sc-if / sc-for bodies are compiled as separate fragments by the design
        # runtime, so a close tag never escapes the block it sits in.
        c=self.cur
        while c is not None and c.tag!=tag:
            if c.tag in ("sc-if","sc-for") and tag not in ("sc-if","sc-for"): return
            c=c.parent
        if c is not None and c.parent is not None: self.cur=c.parent
    def handle_data(self, d): self.cur.kids.append(Text(d))
    def handle_entityref(self, name): self.cur.kids.append(Text(f"&{name};"))
    def handle_charref(self, name): self.cur.kids.append(Text(f"&#{name};"))
    def handle_comment(self, d): pass

def expr(e, scope):
    """Turn a DC expression into a JS expression against `v` / loop vars."""
    e=e.strip()
    neg = e.startswith("!")
    if neg: e=e[1:].strip()
    head=e.split(".")[0].split("[")[0]
    if head in scope or head in ("true","false","null"): js=e
    else: js="v."+e
    # tolerant member access: the design runtime treats a missing path as empty
    parts=js.split(".")
    if len(parts)>2: js=parts[0]+"."+parts[1]+"".join("?."+q for q in parts[2:])
    return ("!"+js) if neg else js

def css_to_obj(s):
    out={}
    for decl in s.split(";"):
        if ":" not in decl: continue
        k,val=decl.split(":",1); k=k.strip(); val=val.strip()
        if not k: continue
        if k.startswith("--"): key=json.dumps(k)
        else:
            parts=k.split("-"); key=parts[0]+"".join(p.capitalize() for p in parts[1:])
        out[key]=val
    body="{"+", ".join(f"{k}: {json.dumps(v, ensure_ascii=False)}" for k,v in out.items())+"}"
    return body+" as CSSProperties" if any(k.startswith('"--') for k in out) else body

def jsx_text(s):
    # keep entities; bindings first, then escape any literal braces
    parts=[]; last=0
    for m in BIND.finditer(s):
        parts.append(s[last:m.start()].replace("'", "&apos;").replace("{","{'{'}").replace("}","{'}'}"))
        parts.append("{interp("+CURSCOPE_EXPR(m.group(1))+")}")
        last=m.end()
    parts.append(s[last:].replace("'", "&apos;").replace("{","{'{'}").replace("}","{'}'}"))
    return "".join(parts)

CURSCOPE_EXPR=None

def render(node, scope, ind):
    global CURSCOPE_EXPR
    pad="  "*ind
    if isinstance(node, Text):
        s=node.s
        if not s.strip(): return "" if "\n" in s or len(s)>1 else " "
        CURSCOPE_EXPR=lambda e: expr(e,scope)
        t=jsx_text(s)
        return t
    if node.tag=="sc-if":
        attrs=dict(node.attrs); cond=BIND.search(attrs.get("value","")).group(1)
        inner=render_kids(node,scope,ind+1)
        return f"{{{expr(cond,scope)} ? (<>{inner}</>) : null}}"
    if node.tag=="sc-for":
        attrs=dict(node.attrs); lst=BIND.search(attrs.get("list","")).group(1); var=attrs.get("as","item")
        inner=render_kids(node,scope|{var},ind+1)
        idx = "i" if var != "i" else "ix"
        return f"{{({expr(lst,scope)} ?? []).map(({var}: any, {idx}: number) => (<Fragment key={{{idx}}}>{inner}</Fragment>))}}"
    if node.tag in ("helmet","script","x-dc","body","html","head"):
        return render_kids(node,scope,ind) if node.tag in ("x-dc","body","html") else ""
    if node.tag=="dc-import":
        attrs=dict(node.attrs); name=attrs.pop("name","Component")
        props=[]
        for k,val in attrs.items():
            if k.startswith("hint-"): continue
            camel=k.split("-")[0]+"".join(x.capitalize() for x in k.split("-")[1:])
            if camel=="style": props.append(f"style={{{css_to_obj(val)}}}"); continue
            m=BIND.fullmatch((val or "").strip())
            props.append(f"{camel}={{{expr(m.group(1),scope)}}}" if m else f"{camel}={json.dumps(val, ensure_ascii=False)}")
        return f"<{name} {' '.join(props)} />"
    if node.tag=="x-import":
        attrs=dict(node.attrs)
        return f"<Import {' '.join(jsx_attr(k,val,scope) for k,val in attrs.items() if k not in ('component-from-global-scope','from','hint-size'))} component={json.dumps(attrs.get('component-from-global-scope',''))} />"
    tag=node.tag
    parts=[]
    for k,val in node.attrs:
        a=jsx_attr(k,val,scope)
        if a: parts.append(a)
    attrs=(" "+" ".join(parts)) if parts else ""
    if tag in VOID or not node.kids:
        return f"<{tag}{attrs} />"
    inner=render_kids(node,scope,ind+1)
    return f"<{tag}{attrs}>{inner}</{tag}>"

def render_kids(node,scope,ind):
    return "".join(render(k,scope,ind) for k in node.kids)

def jsx_attr(k,val,scope):
    lk=k.lower()
    if lk.startswith("hint-") or lk.startswith("data-comment-anchor"): return ""
    if lk in EVENTS:
        m=BIND.search(val or "")
        return f"{EVENTS[lk]}={{{expr(m.group(1),scope)}}}" if m else ""
    name=ATTR_MAP.get(lk, k)
    if lk.startswith("data-") or lk.startswith("aria-"): name=lk
    if val is None: return name if name in BOOL_ATTRS else f"{name}=\"\""
    if name=="style":
        m=BIND.fullmatch(val.strip())
        if m: return f"style={{css({expr(m.group(1),scope)})}}"
        return f"style={{{css_to_obj(val)}}}"
    m=BIND.fullmatch(val.strip())
    if m: return f"{name}={{{expr(m.group(1),scope)}}}"
    if BIND.search(val):
        # mixed template string
        s=BIND.sub(lambda mm: "${"+expr(mm.group(1),scope)+"}", val.replace("`","\\`"))
        return f"{name}={{`{s}`}}"
    v=html.unescape(val)
    if name in ("rows","cols","tabIndex","colSpan","rowSpan","maxLength","size","aria-valuemin","aria-valuemax","aria-valuenow") and re.fullmatch(r"-?\d+(\.\d+)?", v): return f"{name}={{{v}}}"
    if name in ("src","href","xlinkHref") and (v.startswith("assets/") or v.startswith("i15.svg")): v="/"+v
    # Third-party logo CDN references become vendored assets (no runtime CDN dependency).
    if name=="src" and v.startswith("https://cdn.simpleicons.org/"): v="/assets/connectors/si/"+v.split("/")[3]+".svg"
    if name in BOOL_ATTRS: return name if v in ("","true",name) else f"{name}={{{json.dumps(v, ensure_ascii=False)}}}"
    return f"{name}={json.dumps(v, ensure_ascii=False)}"

def main():
    ap=argparse.ArgumentParser(); ap.add_argument("file"); ap.add_argument("--start"); ap.add_argument("--end"); ap.add_argument("--name",default="Screen")
    a=ap.parse_args()
    src=open(a.file).read()
    if a.start:
        s=re.search(a.start,src).start(); e=re.search(a.end,src[s:]).end()+s if a.end else len(src)
        src=src[s:e]
    p=P(); p.feed(src)
    body=render_kids(p.root,set(),1)
    print(body)

if __name__=="__main__": main()
