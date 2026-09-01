"""Split the transpiled design JSX into one React component per page.

Consumes the output of convert-design.py and writes src/pages/*.jsx plus
src/components/Chrome.jsx (the top bar / header / footer that wrap every page).
Each page destructures only the view-model keys it actually references, so a
missing binding shows up as a build error instead of a blank section.

Run: python3 scripts/generate-pages.py <design.jsx.txt>
"""

import re
import sys
from pathlib import Path

PAGES = {
    "esInicio": "Inicio",
    "esNosotros": "Nosotros",
    "esCursos": "Cursos",
    "esFicha": "Ficha",
    "esCheckout": "Checkout",
    "esMaterial": "Material",
    "esExtranjeros": "Extranjeros",
    "esBlog": "Blog",
    "esArticulo": "Articulo",
    "esFaq": "Faq",
    "esContacto": "Contacto",
}

FILE_HEADER = (
    "// Generated from the design bundle by scripts/generate-pages.py.\n"
    "// Edit the design or the generator, not this file by hand.\n"
)

# The design ships the brand as placeholders built around a single named doctor
# ([Apellido], [Nombre Apellido], "foto del doctor"). The site is an academy, so
# those become the brand from site.config.js. Credentials that would name or
# describe a specific physician are replaced with claims the design already
# makes about the method — nothing here may assert a qualification.
SUBSTITUTIONS = [
    (">Dr. [Apellido]", ">{marca}"),
    (">Dr. [Nombre Apellido]", ">{marca}"),
    ("<span>[Nombre] © 2026™. Todos los derechos reservados.",
     "<span>{marca} © 2026. Todos los derechos reservados."),
    ("· por Dr. [Apellido]", "· por {autor}"),
    (">logo\n          <br />aquí", ">{sigla}"),

    # Personal credentials -> what the academy actually offers.
    ("Médico cirujano, Universidad de Chile.\n              <br />Especialista en Medicina Interna."
     "\n              <br />Docente de pregrado 2014–2019.\n              <br />Nueve años preparando EUNACOM.",
     "Equipo docente médico.\n              <br />Clases grabadas por cada tema del temario oficial."
     "\n              <br />Seguimiento semanal con devolución escrita."),
    (">Un solo docente", ">Un equipo docente estable"),
    ("Sin equipo rotativo. Las clases, las correcciones y las respuestas son conmigo.",
     "Sin docentes rotativos. Las clases, las correcciones y las respuestas vienen del mismo equipo académico."),

    # Dummy bank details. Real ones live in site.config.js; until they are
    # filled in the checkout shows an instruction instead of a fake account.
    ("Banco de Chile · Cuenta corriente 000-00000-00\n                  <br />[Nombre del titular] · RUT 00.000.000-0",
     "{transferencia.banco}{transferencia.titular && (<><br />{transferencia.titular}</>)}"),

    # Image placeholders that describe a portrait of the doctor.
    (">placeholder\n              <br />foto del doctor\n              <br />recortada sobre\n              <br />el fondo",
     ">placeholder\n              <br />imagen"),
    (">placeholder\n              <br />retrato", ">placeholder\n              <br />imagen"),
]


def apply_brand(jsx):
    for old, new in SUBSTITUTIONS:
        if old not in jsx:
            raise SystemExit(f"brand substitution no longer matches the design: {old[:60]!r}")
        jsx = jsx.replace(old, new)
    return jsx


def dedent_block(text):
    lines = text.split("\n")
    indents = [len(l) - len(l.lstrip()) for l in lines if l.strip()]
    cut = min(indents) if indents else 0
    return "\n".join(l[cut:] if l.strip() else "" for l in lines)


RESERVED = {"Fragment", "React", "true", "false", "null", "undefined", "map", "key"}


def bindings_used(block, _keys=None):
    """Every identifier the block reads, minus the loop variables it binds itself.

    Derived from the JSX rather than from a hand-kept list, so a view-model key
    can never be silently dropped.
    """
    locals_bound = set()
    for m in re.finditer(r"\.map\(\((\w+), (\w+)\)", block):
        locals_bound.update(m.groups())

    used = set()
    # identifiers appearing at the head of a JSX expression or attribute binding
    for m in re.finditer(r"[{=]\s*([A-Za-z_$][\w$]*)", block):
        used.add(m.group(1))
    for m in re.finditer(r"\(([A-Za-z_$][\w$]*)(?:\.[\w$]+)*\s*\|\|\s*\[\]\)", block):
        used.add(m.group(1))

    return sorted(used - locals_bound - RESERVED)


def component(name, block, keys):
    used = bindings_used(block, keys)
    destructure = f"  const {{ {', '.join(used)} }} = v;\n" if used else ""
    return (
        f"{FILE_HEADER}import React, {{ Fragment }} from 'react';\n\n"
        f"export default function {name}(v) {{\n{destructure}"
        f"  return (<>\n{dedent_block(block)}\n  </>);\n}}\n"
    )


def main():
    jsx = apply_brand(Path(sys.argv[1]).read_text(encoding="utf-8"))
    keys = None

    starts = {}
    for flag in PAGES:
        m = re.search(rf"\{{{flag} && \(<>", jsx)
        if not m:
            raise SystemExit(f"page flag {flag} not found in transpiled design")
        starts[flag] = (m.start(), m.end())

    order = sorted(starts.items(), key=lambda kv: kv[1][0])
    pages_dir, comps_dir = Path("src/pages"), Path("src/components")
    pages_dir.mkdir(parents=True, exist_ok=True)
    comps_dir.mkdir(parents=True, exist_ok=True)

    footer_at = jsx.index("<footer")

    for i, (flag, (start, body_start)) in enumerate(order):
        # the last page runs up to the shared footer, every other up to the next page
        end = order[i + 1][1][0] if i + 1 < len(order) else footer_at
        block = jsx[body_start:end]
        # trim the trailing `</>)}` that closed this page's conditional
        block = re.sub(r"\s*</>\)\}\s*$", "", block)
        name = PAGES[flag]
        (pages_dir / f"{name}.jsx").write_text(component(name, block, keys), encoding="utf-8")
        print(f"src/pages/{name}.jsx  ({len(block)} chars)")

    # The top bar/header and the footer are two halves of one wrapper element,
    # so they ship as a single Layout with the active page as children.
    head, footer = jsx[: order[0][1][0]], jsx[footer_at:]
    layout = (
        f"{FILE_HEADER}import React, {{ Fragment }} from 'react';\n\n"
        f"export default function Layout(v) {{\n"
        f"  const {{ {', '.join(bindings_used(head + footer, keys))} }} = v;\n"
        f"  return (<>\n{dedent_block(head)}\n"
        f"{{v.children}}\n"
        f"{dedent_block(footer)}\n  </>);\n}}\n"
    )
    (comps_dir / "Layout.jsx").write_text(layout, encoding="utf-8")
    print(f"src/components/Layout.jsx  (header {len(head)} + footer {len(footer)} chars)")


if __name__ == "__main__":
    main()
