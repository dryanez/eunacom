---
name: masterclass-studio-creator
description: >-
  Guide and pipeline for creating, scripting, and rendering EUNACOM 2026 Perfil V3 Masterclasses (14-slide interactive decks, ElevenLabs audio synthesis, and 1080p Full HD MP4 videos).
---

# Masterclass Studio Creator Skill (EUNACOM 2026 Perfil V3)

Use this skill whenever creating new Masterclasses, developing slide decks in `src/slides/`, writing clinical scripts in `perfil_v3_catalog.json`, synthesizing audio with ElevenLabs, or rendering 1080p videos with Puppeteer + FFmpeg.

---

## 1. 14-Slide Anatomical Standard

Every Masterclass MUST adhere strictly to the 14-slide pedagogy:

| Slide | Component | Clinical Purpose |
|---|---|---|
| **1** | `<Cover>` | Official title, Perfil V3 codes, and legal competence level badges |
| **2** | `<Table>` | Official Perfil V3 audit matrix (Diagnosis, Treatment, APS/Referral) |
| **3** | `<Steps>` | Cardinal pathophysiology and structured etiological diagnosis |
| **4** | `<Steps>` / `<Bento>` | Resuscitation & Emergency Algorithm (ABCDE, access, fluid therapy, targets) |
| **5** | `<Table>` / `<Bento>` | Detailed Pharmacotherapy with exact dosing, routes, and duration |
| **6** | `<Table>` | Prognostic classification / Gold Standard score (Forrest, Killip, TIMI, etc.) |
| **7** | `<Steps>` | Diagnostic / Therapeutic procedures (Technique, indications, salvage) |
| **8** | `<Contrast>` / `<Table>` | Differential diagnosis & subtype management |
| **9** | `<Bento>` | Risk stratification & clinical scores (Glasgow-Blatchford, Rockall, etc.) |
| **10** | `<Steps>` | The 4 classic pitfalls in the EUNACOM question bank |
| **11** | `<QuestionSlide>` | **Clinical Case #1**: Diagnosis and initial resuscitation |
| **12** | `<QuestionSlide>` | **Clinical Case #2**: Pharmacological management / procedure |
| **13** | `<QuestionSlide>` | **Clinical Case #3**: Emergency decision making / differential |
| **14** | `<Steps>` | Summary decision algorithm (High-fidelity checklist) |

---

## 2. Production Workflow

### Step 1: Create the Slide Deck Component
- Create `src/slides/<Specialty><Number>Deck.jsx` (e.g., `Gastro02Deck.jsx`, `Cardio02Deck.jsx`) matching the 14-slide structure from `Gastro01Deck.jsx` and `Cardio01Deck.jsx`.
- Use the visual deck components: `<Cover>`, `<Table>`, `<Steps>`, `<Bento>`, `<Contrast>`, `<QuestionSlide>`.

### Step 2: Register in `DeckRunner.jsx`
- Import the new deck and map the conditional route for `classId` in `src/slides/DeckRunner.jsx`.

### Step 3: Write Clinical Script & Teleprompter
- Add the class entry and write the `teleprompterScript` in `src/data/studio/perfil_v3_catalog.json` with explicit `[SLIDE 1]` through `[SLIDE 14]` markers.

### Step 4: Synthesize Audio (ElevenLabs)
- Run `node scripts/generate_class_audio.cjs --class=<classId>` (uses `eleven_multilingual_v2` model).
- Generates `public/audio/<classId>/slide_*.mp3` and `manifest.json`.

### Step 5: Render 1080p Full HD MP4 Video
- Run `node scripts/render_class_video.cjs --class=<classId>`.
- Generates final video in `public/videos/<classId>.mp4` and `dist/videos/<classId>.mp4`.
