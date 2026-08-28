---
name: eunacom-manual-editorial-standard
description: Comprehensive editorial and maquetation standard for compiling high-density EUNACOM 2026 study manuals (CTO / First Aid style) with full-width figures, in-text citations, and end-of-book answer keys.
---

# EUNACOM Manual Editorial Standard (CTO / First Aid Style)

Use this skill whenever generating, editing, or automating manual chapters and modules for the EUNACOM 2026 preparation books.

## Core Directives

1. **Full-Width Graphical Elements (100% Side-to-Side)**:
   - Clinical figure cards (`.clinical-fig-card-fullwidth`) must always span 100% width across the page.
   - Internal images within figure cards must have controlled scaling (`max-height: 120-140px`, `object-fit: contain`, centered, with clear sub-labels).
   - Content tables (`.cto-table-wrapper-fullwidth`) and algorithm SVG containers (`.cto-diagram-container`) must also occupy 100% full width.

2. **Mandatory In-Text Cross-Referencing**:
   - Every single table, figure, clinical image, and algorithm must be explicitly referenced within the topic's prose paragraphs (e.g. `(véase Figura 2.1A: Angiografía de Arterias Coronarias)`, `(véase Tabla 2.1)`, `(véase Figura 2.1)`).

3. **No Inline Question Spoilers + End-of-Book Solucionario**:
   - Topic pages display only the question stems and options (A-E).
   - All answers and detailed justifications are compiled in the dedicated **Solucionario General & Respuestas Razonadas EUNACOM** at the end of the manual.

4. **Perfil V3 Master Table Strictly Sorted Numerically**:
   - Numerical order by Perfil V3 code (`1.01.1.001`, `1.01.1.002`, ...), with direct class buttons and clean text for GES warranties (no broken links).

5. **Full-Width Stacked Chapter Opener (Portadilla)**:
   - 4 full-width stacked cards: Orientación, Matriz Perfil V3, Historial de Preguntas (2-col grid), Conceptos Clave & Trampas (red alerts).

6. **Side-to-Side Orange Running Header**:
   - Orange bar with manual title on the left and `CAPÍTULO XX • TEMA X.X` on the right.

## Dataset Structure (`dataset_bloque_X.cjs`)
Each block dataset must export an array of topic objects with:
- `topicLabel`: e.g. "2.1"
- `title`: Topic title
- `contentSections`: Sections with paragraphs citing tables and figures.
- `table`: High-yield comparative table.
- `svg`: Vector algorithm filename.
- `vignette`, `explicacion`, `keyPoints`: High-yield clinical boxes.
- `questions`: 2 multiple-choice questions with stems, options (A-E), `correcta`, and `explicacion`.
