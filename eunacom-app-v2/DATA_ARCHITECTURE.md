# EUNACOM App — Data Architecture Reference

> Last updated: April 2026. Read this before touching tags, questions, or pruebas.

---

## 1. The Two Question Sets

### A) Pruebas (MisClases — the main study section)
- **Location:** `public/data/pruebas/modulo-*.json`
- **Format:** Nested — `data.pruebas[].questions[]`
- **Field name:** `pregunta` (not `question`)
- **24 files** covering all EUNACOM subjects
- **Source:** `.tmp/enriched_*/` CSVs

### B) Examen (the custom exam builder section)
- **Location:** `public/data/questionDB.json`
- **Format:** Flat array of question objects
- **Field name:** `question` (not `pregunta`)
- **6,099 questions** with `topic` and `category` fields
- **Source:** `Eunacom2026/` specialty folders

---

## 2. Source CSV Files

### `.tmp/enriched_*/` — Source for **Prueba** questions
```
/Volumes/Install macOS Sequoia/Eunacom/.tmp/
  enriched_cardiología/          ✅ Tags filled
  enriched_cirugía_y_anastesia/  ✅ Tags filled
  enriched_dermatología/         ✅ Tags filled
  enriched_endocrinologia/       ✅ Tags filled
  enriched_especialidades/       ✅ Tags filled (partial match — see §4)
  enriched_gastroenterología/    ✅ Tags filled
  enriched_ginecología/          ❌ Tags EMPTY — 0/259
  enriched_hematología/          ✅ Tags filled
  enriched_infectología/         ✅ Tags filled
  enriched_medicina_interna/     ✅ Tags filled
  enriched_nefrología/           ✅ Tags filled
  enriched_neonatología/         ❌ Tags EMPTY — 0/294
  enriched_neurología/           ✅ Tags filled
  enriched_obstetricia/          ❌ Tags EMPTY — 0/240
  enriched_oftalmología/         ✅ Tags filled
  enriched_otorrinolaringología/ ✅ Tags filled
  enriched_pediatría/            ❌ Tags EMPTY — 0/301
  enriched_pediatría_y_ginecología/ ❌ Tags EMPTY — 0/1123
  enriched_psiquiatría/          ✅ Tags filled
  enriched_respiratorio/         ✅ Tags filled
  enriched_reumatología/         ✅ Tags filled
  enriched_salud_pública/        ✅ Tags filled
  enriched_traumatología/        ✅ Tags filled
  enriched_urología/             ✅ Tags filled
```

CSV columns: `numero, pregunta, opcion_a-e, respuesta_correcta, explicacion_correcta, por_que_incorrectas, video_recomendado, codigo_eunacom, tags, modelo_usado`

### `Eunacom2026/` — Source for **Examen** questions
```
/Volumes/Install macOS Sequoia/Eunacom/Eunacom2026/
  Cardiología/        ✅ Tags + codigo_eunacom filled
  Cirugía y anastesia/✅ Tags + codigo_eunacom filled
  Dermatología/       ✅ Tags + codigo_eunacom filled
  Endocrinología/     ✅ Tags + codigo_eunacom filled
  Gastroenterología/  ✅ Tags + codigo_eunacom filled
  Hematología/        ✅ Tags + codigo_eunacom filled
  Infectología/       ✅ Tags + codigo_eunacom filled
  Nefrología/         ✅ Tags + codigo_eunacom filled
  Neurología/         ✅ Tags + codigo_eunacom filled
  Respiratorio/       ✅ Tags + codigo_eunacom filled
  Reumatología/       ✅ Tags + codigo_eunacom filled
  ── MISSING ──
  ❌ No Pediatría folder
  ❌ No Ginecología folder
  ❌ No Obstetricia folder
  ❌ No Neonatología folder
  ❌ No Psiquiatría folder
  ❌ No Traumatología folder
  ❌ No Oftalmología folder
  ❌ No Otorrinolaringología folder
  ❌ No Salud Pública folder
  ❌ No Urología folder
```

CSV columns: `numero, pregunta, opcion_a-e, respuesta_correcta, explicacion_correcta, por_que_incorrectas, video_recomendado, codigo_eunacom, tags, modelo_usado`

---

## 3. Tag Coverage (Pruebas) — After Last Patch

| File | Matched | Total | % |
|---|---|---|---|
| modulo-1-cardiologia | 382 | 418 | 91% |
| modulo-1-endocrinologia | 267 | 311 | 85% |
| modulo-1-gastroenterologia | 388 | 420 | 92% |
| modulo-1-hematologia | 353 | 389 | 90% |
| modulo-1-infectologia | 354 | 389 | 91% |
| modulo-1-medicina-interna | 938 | 1059 | 88% |
| modulo-1-nefrologia | 312 | 341 | 91% |
| modulo-1-neurologia | 272 | 300 | 90% |
| modulo-1-respiratorio | 311 | 353 | 88% |
| modulo-1-reumatologia | 279 | 302 | 92% |
| modulo-2-cirugia-y-anestesia | 300 | 330 | 90% |
| modulo-2-dermatologia | 203 | 218 | 93% |
| modulo-2-oftalmologia | 227 | 239 | 94% |
| modulo-2-otorrinolaringologia | 226 | 239 | 94% |
| modulo-2-psiquiatria | 223 | 241 | 92% |
| modulo-2-salud-publica | 226 | 241 | 93% |
| modulo-2-traumatologia | 198 | 221 | 89% |
| modulo-2-urologia | 212 | 228 | 92% |
| **modulo-2-especialidades** | 91 | 580 | **15%** ⚠️ |
| **modulo-3-ginecologia** | 21 | 259 | **8%** ❌ |
| **modulo-3-neonatologia** | 1 | 294 | **0%** ❌ |
| **modulo-3-obstetricia** | 2 | 240 | **0%** ❌ |
| **modulo-3-pediatria-y-ginecologia** | 8 | 1123 | **0%** ❌ |
| **modulo-3-pediatria** | 3 | 301 | **0%** ❌ |

**Fallback for unmatched:** `generate_tags.py` regex tagger → specialty name from filename (e.g. `Pediatría, EUNACOM`)

---

## 4. Known Issues

### Módulo 3 (Pediatría, Ginecología, Obstetricia, Neonatología)
- Source CSVs in `.tmp/enriched_pediatría*/`, `.tmp/enriched_neonatología/`, `.tmp/enriched_obstetricia/`, `.tmp/enriched_ginecología/` all have **empty `tags` columns**
- These subjects were processed by a different pipeline that never wrote tags back to the CSV
- **Fix needed:** Run AI tagging on these CSVs, or populate tags manually, then re-run `patch_prueba_tags_from_tmp.py`

### Módulo 2 Especialidades (15% match)
- The `modulo-2-especialidades.json` has 580 questions from mixed sources
- Most don't match `.tmp/enriched_especialidades/` because they came from a different original CSV batch

### Truncated question text in some prueba files
- Some prueba questions are truncated mid-sentence (e.g. `"la actitud CORR"` instead of `"la actitud correcta es:"`)
- This prevents matching even when the CSV has the full text

---

## 5. Scripts

| Script | Purpose |
|---|---|
| `generate_tags.py` | Regex-based tagger. Run when no CSV match exists. Uses `\b` word boundaries. Fallback = module specialty from filename |
| `patch_prueba_tags_from_tmp.py` | Matches prueba questions to `.tmp/enriched_*/` CSVs by normalized text. Writes `tags` + `codigo_eunacom` |
| `patch_tags_from_csv.py` | Same but for `questionDB.json` ↔ `Eunacom2026/` CSVs |
| `run_patch.py` | Standalone version of `patch_prueba_tags_from_tmp.py` with file output |

---

## 6. EUNACOM Perfil Codes

- **Full taxonomy:** `eunacom-app-v2/PERFIL_EUNACOM_COMPLETO.txt`
- **Format:** `1.01.1.001 | Angina crónica estable | Dx: Específico | Tx: Inicial | Seg: Completo`
- **Code structure:** `[module].[subject].[type].[number]`
  - Type `1` = Situaciones clínicas, `2` = Urgencias, `3` = Conocimientos generales, `4` = Exámenes

---

## 7. To Re-Tag Everything From Scratch

```bash
cd /Volumes/Install\ macOS\ Sequoia/Eunacom/eunacom-app-v2

# Step 1: Apply regex tags (specialty fallback for everything)
python3 generate_tags.py

# Step 2: Overwrite with real tags from enriched CSVs (pruebas)
python3 patch_prueba_tags_from_tmp.py

# Step 3: Overwrite with real tags from Eunacom2026 CSVs (questionDB)
python3 patch_tags_from_csv.py

# Step 4: Commit
git add public/data/pruebas/ public/data/questionDB.json
git commit -m "chore: re-tag all questions"
git push
```
