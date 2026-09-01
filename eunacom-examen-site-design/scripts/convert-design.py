"""Transpile the DesignCombo template export into JSX.

Reads the <x-dc> body of the design bundle and emits one JSX fragment per page
plus the shared chrome, so the React app is a faithful port of the design
rather than a hand-copy. Directives handled:

  <sc-if value="{{ x }}">        -> {x && (<>...</>)}
  <sc-for list="{{ xs }}" as="a"> -> {xs.map((a, i) => (<Fragment key={i}>...</Fragment>))}
  <sc-raw-select>                 -> <select>
  {{ expr }}                      -> {expr}
  sc-camel-on-click               -> onClick
  style-hover / style-focus       -> generated CSS classes (React has no inline pseudo-states)

Run: python3 scripts/convert-design.py <design-bundle.html> <out-dir>
"""

import html
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

VOID = {"br", "img", "input", "hr", "meta", "link", "path"}

ATTR_MAP = {
    "sc-camel-on-click": "onClick",
    "sc-camel-on-change": "onChange",
    "sc-camel-view-box": "viewBox",
    "stroke-width": "strokeWidth",
    "stroke-linecap": "strokeLinecap",
    "stroke-linejoin": "strokeLinejoin",
    "class": "className",
    "for": "htmlFor",
}
DROP_ATTRS = {"hint-placeholder-val", "hint-placeholder-count", "as", "list"}


def camel(prop):
    head, *rest = prop.strip().split("-")
    return head + "".join(w.capitalize() for w in rest)


def parse_style(text):
    out = {}
    for decl in text.split(";"):
        if ":" not in decl:
            continue
        prop, _, val = decl.partition(":")
        prop, val = prop.strip(), val.strip()
        if prop:
            out[camel(prop)] = val
    return out


def js(value):
    return json.dumps(value, ensure_ascii=False)


def jsx_style(text):
    return "{{" + ", ".join(f"{js(k)}: {js(v)}" for k, v in parse_style(text).items()) + "}}"


MUSTACHE = re.compile(r"\{\{(.+?)\}\}")


def jsx_text(text):
    """Turn template text into JSX children, converting {{ x }} into {x}."""
    text = html.unescape(text)
    parts, last = [], 0
    for m in MUSTACHE.finditer(text):
        parts.append(("lit", text[last:m.start()]))
        parts.append(("expr", m.group(1).strip()))
        last = m.end()
    parts.append(("lit", text[last:]))

    out = []
    for kind, val in parts:
        if kind == "expr":
            out.append("{" + val + "}")
        elif val:
            # Braces and angle brackets are JSX syntax; ship literals as strings.
            if any(c in val for c in "{}<>"):
                out.append("{" + js(val) + "}")
            else:
                out.append(val)
    return "".join(out)


def bare_expr(value):
    m = MUSTACHE.fullmatch(value.strip())
    return m.group(1).strip() if m else None


class Converter(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.root = {"tag": "#root", "attrs": [], "children": []}
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        node = {"tag": tag, "attrs": attrs, "children": []}
        self.stack[-1]["children"].append(node)
        if tag not in VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.stack[-1]["children"].append({"tag": tag, "attrs": attrs, "children": []})

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i]["tag"] == tag:
                del self.stack[i:]
                return

    def handle_data(self, data):
        self.stack[-1]["children"].append({"tag": "#text", "text": data})

    def handle_entityref(self, name):
        self.stack[-1]["children"].append({"tag": "#text", "text": f"&{name};"})

    def handle_charref(self, name):
        self.stack[-1]["children"].append({"tag": "#text", "text": f"&#{name};"})


class Emitter:
    def __init__(self):
        self.css = []

    def pseudo_class(self, decls, pseudo):
        name = f"{'hv' if pseudo == 'hover' else 'fc'}-{len(self.css)}"
        body = "".join(f"{k}:{v};" for k, v in (d.split(":", 1) for d in decls.split(";") if ":" in d))
        self.css.append(f".{name}:{pseudo}{{{body}}}")
        return name

    def attrs(self, attrs):
        out, classes = [], []
        for key, value in attrs:
            if key in DROP_ATTRS or value is None:
                continue
            if key == "style":
                # style can be literal CSS text or a bound style object ({{ c.estilo }})
                expr = bare_expr(value)
                out.append(f"style={{{expr}}}" if expr else f"style={jsx_style(value)}")
            elif key in ("style-hover", "style-focus"):
                classes.append(self.pseudo_class(value, key.split("-")[1]))
            else:
                name = ATTR_MAP.get(key, key)
                expr = bare_expr(value)
                out.append(f"{name}={{{expr}}}" if expr else f"{name}={js(html.unescape(value))}")
        if classes:
            out.append(f'className="{" ".join(classes)}"')
        return (" " + " ".join(out)) if out else ""

    def children(self, node, depth):
        return "".join(self.emit(c, depth + 1) for c in node["children"])

    def emit(self, node, depth=0):
        pad = "  " * depth
        tag = node["tag"]

        if tag == "#text":
            text = jsx_text(node["text"])
            return text if text.strip() else (" " if node["text"].strip() == "" and " " in node["text"] else "")

        if tag == "sc-if":
            cond = bare_expr(dict(node["attrs"]).get("value", ""))
            return f"\n{pad}{{{cond} && (<>{self.children(node, depth)}\n{pad}</>)}}"

        if tag == "sc-for":
            a = dict(node["attrs"])
            listexpr, item = bare_expr(a.get("list", "")), a.get("as", "item")
            idx = "_i" if item != "_i" else "_j"
            return (f"\n{pad}{{({listexpr} || []).map(({item}, {idx}) => (<Fragment key={{{idx}}}>"
                    f"{self.children(node, depth)}\n{pad}</Fragment>))}}")

        if tag == "#root":
            return self.children(node, depth - 1)

        jsx_tag = "select" if tag == "sc-raw-select" else tag
        attrs = self.attrs(node["attrs"])
        if jsx_tag in VOID:
            return f"\n{pad}<{jsx_tag}{attrs} />"
        return f"\n{pad}<{jsx_tag}{attrs}>{self.children(node, depth)}\n{pad}</{jsx_tag}>"


def main():
    src, outdir = Path(sys.argv[1]), Path(sys.argv[2])
    raw = src.read_text(encoding="utf-8", errors="replace")

    body = raw[raw.index("</helmet>") + len("</helmet>"):raw.index("</x-dc>")]
    body = "\n".join(l for l in body.split("\n") if "base64" not in l)

    parser = Converter()
    parser.feed(body)
    emitter = Emitter()

    outdir.mkdir(parents=True, exist_ok=True)
    (outdir / "design.jsx.txt").write_text(emitter.emit(parser.root), encoding="utf-8")
    (outdir / "design-pseudo.css").write_text("\n".join(emitter.css) + "\n", encoding="utf-8")
    print(f"wrote {outdir}/design.jsx.txt and design-pseudo.css ({len(emitter.css)} pseudo-classes)")


if __name__ == "__main__":
    main()
