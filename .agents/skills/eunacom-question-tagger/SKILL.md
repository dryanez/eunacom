---
name: eunacom-question-tagger
description: >-
  Automates the full pipeline for ingesting, tagging, and enriching EUNACOM question banks:
  regex-based medical NLP tagging (280+ clinical rules), CSV-to-JSON patching with Perfil V3
  codes, AI explanation generation, deduplication, and coverage gap analysis across 24 modules.
---

# EUNACOM Question Tagger & Ingestor Skill

Use this skill whenever ingesting new medical questions, tagging questions with Perfil V3 codes, enriching explanations, fixing Module 3 tag gaps (Pediatría/Ginecología/Obstetricia/Neonatología at 0% coverage), patching from enriched CSVs, or auditing question bank coverage.

---

## 1. System Overview

The EUNACOM platform has a **dual question architecture**:

| Database | Location | Format | Field Name | Question Count | Source |
|----------|----------|--------|------------|---------------|--------|
| **Pruebas** (MisClases study section) | `public/data/pruebas/modulo-*.json` | Nested: `data.pruebas[].questions[]` | `pregunta` | ~8,000+ across 24 files | `.tmp/enriched_*/` CSVs |
| **Examen** (Custom exam builder) | `public/data/questionDB.json` | Flat array | `question` | 6,099 | `Eunacom2026/` CSVs |

Both databases use tags (comma-separated strings, max 6 tags) and official EUNACOM Perfil V3 codes (`codigo_eunacom`) in format `[module].[subject].[type].[number]` (e.g., `1.01.1.001`).

---

## 2. File Map & Script Inventory

```
eunacom-app-v2/
├── generate_tags.py               # Step 1: Regex NLP baseline tagger (280+ rules)
├── patch_prueba_tags_from_tmp.py   # Step 2: Patch Pruebas from enriched CSVs
├── patch_tags_from_csv.py          # Step 3: Patch QuestionDB from Eunacom2026/ CSVs
├── run_patch.py                    # Alt Step 2: Same as above with flushed stdout
├── fix_modulo3_tags.py             # Step 4: Targeted Module 3 re-tagger
├── inject_hemat_explanations.py    # Targeted: Inject hematology explanations
├── import_targeted_v1.cjs          # Targeted: Import & dedup specific topics
├── DATA_ARCHITECTURE.md            # Master reference document
└── public/data/
    ├── pruebas/modulo-*.json       # 24 prueba files
    ├── questionDB.json             # 6,099 exam questions
    └── reconstrucciones/*.json     # Exam reconstructions
```

---

## 3. Full Re-Tagging Pipeline (4 Steps)

Execute from the `eunacom-app-v2/` directory:

```bash
# Step 1: Apply regex baseline tags to ALL questions (pruebas + questionDB + reconstrucciones)
python3 generate_tags.py

# Step 2: Overwrite with real tags from enriched CSVs (pruebas only)
python3 patch_prueba_tags_from_tmp.py

# Step 3: Overwrite with real tags from Eunacom2026/ CSVs (questionDB only)
python3 patch_tags_from_csv.py

# Step 4: Fix Module 3 fallback tags specifically
python3 fix_modulo3_tags.py

# Commit
git add public/data/pruebas/ public/data/questionDB.json
git commit -m "chore: re-tag all questions"
git push
```

---

## 4. Script Details

### Step 1: `generate_tags.py` — Regex Medical NLP Tagger

- **Algorithm:** 280+ compiled regex rules (`re.search(pattern, text, re.IGNORECASE | re.DOTALL)`) organized by medical specialty
- **Input:** All JSON files in `public/data/pruebas/`, `questionDB.json`, and `reconstrucciones/`
- **Output:** Sets `q["tags"]` as comma-separated string (max 6 tags, deduplicated case-insensitively)
- **Fallback:** If no regex matches → `[specialty_from_filename, "EUNACOM"]`
- **Specialty mapping:** `SPECIALTY_MAP` infers specialty from filename (e.g., `modulo-1-cardiologia` → `Cardiología`)
- **Covers:** Pediatría, Neonatología, Ginecología, Obstetricia, Cardiología, Endocrinología, Gastro, Infecto, Hemato, Neumo, Nefro, Neuro, Reuma, Psiquiatría, Geriatría, Urgencias, Derma, Trauma, Oncología, Salud Pública, Farmacología
- **Known issue:** Hardcoded path `/Volumes/Install macOS Sequoia/Eunacom/eunacom-app-v2/public/data` — update if running from different location

### Step 2: `patch_prueba_tags_from_tmp.py` — CSV → Prueba Patcher

- **Algorithm:** Normalized text matching (lowercase, strip accents via Unicode NFD, collapse whitespace)
- **Source:** `.tmp/enriched_*/*.csv` (UTF-8 with BOM)
- **CSV columns:** `numero, pregunta, opcion_a-e, respuesta_correcta, explicacion_correcta, por_que_incorrectas, video_recomendado, codigo_eunacom, tags, modelo_usado`
- **Matching:** Builds `csv_lookup[normalize(pregunta)]` → exact dictionary key lookup against normalized `q['pregunta']`
- **Output:** Overwrites `q["tags"]` and `q["codigo_eunacom"]` in matching prueba questions
- **Known issue:** Truncated question text in JSON files prevents matching. Module 3 CSVs have empty `tags` columns → 0% match

### Step 3: `patch_tags_from_csv.py` — CSV → QuestionDB Patcher

- **Same algorithm** as Step 2 but sources from `Eunacom2026/` specialty folders
- **Known issue:** Only 11 of 21 specialties exist in `Eunacom2026/` — 10 missing folders result in unpatched questions

### Step 4: `fix_modulo3_tags.py` — Module 3 Targeted Fix

- **Targets:** `modulo-3-*.json` files only (Pediatría, Ginecología, Obstetricia, Neonatología)
- **Algorithm:** Identifies questions with fallback tags (`"Medicina, EUNACOM"`, `"Pediatría, EUNACOM"`, etc.) and re-runs regex tagger
- **Does NOT assign `codigo_eunacom`** — only improves tag specificity

---

## 5. Targeted Scripts

### `inject_hemat_explanations.py`
- Injects 21 curated explanations into `modulo-1-hematologia.json`
- Matches by compound key `(prueba_id, question_numero)`
- Only fills empty `explicacion` fields

### `import_targeted_v1.cjs`
- Imports questions for Diabetes, Respiratorio, Hematología from legacy `master_data_full.json`
- Deduplication: 50-char prefix check + word set Jaccard similarity (>0.8 threshold)
- Outputs standardized V2 format to `src/data/questionDB.json`

---

## 6. Current Tag Coverage (Critical Gaps)

| Module | Questions | Matched | Coverage | Status |
|--------|-----------|---------|----------|--------|
| Module 1 (Med. Interna) | ~4,200 | ~3,800 | **88–92%** | ✅ Good |
| Module 2 (Cirugía & Subs) | ~1,900 | ~1,750 | **89–94%** | ✅ Good |
| modulo-2-especialidades | 580 | 91 | **15%** | ⚠️ Mixed sources |
| modulo-3-ginecologia | 259 | 21 | **8%** | ❌ Empty CSV tags |
| modulo-3-neonatologia | 294 | 1 | **0%** | ❌ Empty CSV tags |
| modulo-3-obstetricia | 240 | 2 | **0%** | ❌ Empty CSV tags |
| modulo-3-pediatria | 301 | 3 | **0%** | ❌ Empty CSV tags |
| modulo-3-pediatria-y-ginecologia | 1,123 | 8 | **0%** | ❌ Empty CSV tags |
| questionDB.json (Examen) | 6,099 | ~2,800 | **~46%** | ❌ Missing 10 specialty folders |

---

## 7. How to Achieve 90%+ Coverage Everywhere

### For Module 3 (Pediatría, Gineco, Obstetricia, Neonatología):
1. **Generate AI tags** for the empty CSV files in `.tmp/enriched_pediatría/`, `.tmp/enriched_ginecología/`, `.tmp/enriched_obstetricia/`, `.tmp/enriched_neonatología/`, `.tmp/enriched_pediatría_y_ginecología/`
2. Use an LLM (Gemini / Claude) to read each `pregunta` + `explicacion_correcta` and assign:
   - 3–6 specific clinical topic tags
   - The official `codigo_eunacom` from `PERFIL_EUNACOM_COMPLETO.txt`
3. Write tags back to the CSV `tags` and `codigo_eunacom` columns
4. Re-run `python3 patch_prueba_tags_from_tmp.py`

### For QuestionDB (missing 10 specialty folders):
1. Generate the missing `Eunacom2026/` CSV folders from `master_data_full.json` or the prueba JSON files
2. Re-run `python3 patch_tags_from_csv.py`

### For truncated question matching:
1. Update `patch_prueba_tags_from_tmp.py` to use **prefix matching** (first 60 normalized characters) or **token similarity** (>0.85 threshold) instead of exact match
2. This catches stems like `"la actitud CORR"` matching `"la actitud correcta es:"`

### Path portability:
1. Replace all hardcoded `/Volumes/Install macOS Sequoia/...` paths with `os.path.dirname(os.path.abspath(__file__))` relative resolution

---

## 8. EUNACOM Perfil V3 Code Structure

```
Code format: [module].[subject].[type].[number]
Example:     1.01.1.001 | Angina crónica estable | Dx: Específico | Tx: Inicial | Seg: Completo

Types:
  1 = Situaciones clínicas (Clinical situations)
  2 = Urgencias (Emergencies)
  3 = Conocimientos generales (General knowledge)
  4 = Exámenes (Diagnostic exams / procedures)

Full taxonomy: eunacom-app-v2/PERFIL_EUNACOM_COMPLETO.txt
```
