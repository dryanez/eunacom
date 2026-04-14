# Clase Standard — EUNACOM Study App

Every clase.json MUST meet this standard before upload to Turso.

## Required Fields

```json
{
  "specialty": "string — Area name (Psiquiatría, Cirugía, Especialidades, etc.)",
  "subsystem": "string — Subsystem name (Dermatología, Urología, etc.)",
  "lessonNumber": "integer — lesson order number",
  "topic": "string — Human readable topic name in Spanish",
  "savedAt": "ISO date string",
  "summary": "string — 3-paragraph summary covering definition, diagnosis, treatment. MIN 800 chars.",
  "cleanTranscript": "string — Full structured class content. MIN 3000 chars. See format below.",
  "keyPoints": "array — 5-8 key clinical points for EUNACOM. Each MIN 30 chars.",
  "quiz": "array — exactly 3 EUNACOM-style clinical vignette questions. See format below."
}
```

## cleanTranscript Format

Must use structured markdown-like syntax:
- `## Heading` for section headers
- `- item` for bullet lists  
- `1. item` for numbered lists
- `| Col | Col |` for tables
- `**bold**` for emphasis
- `[[Topic Name]]` for hyperlinks to related classes

Minimum sections required:
1. Introduction / Definition
2. Classification (if applicable)
3. Clinical presentation / Diagnosis
4. Treatment
5. Follow-up / Prognosis

Source: Use the actual video transcript (transcript.txt) as the BASE content. 
Keep ALL medical details from the lecture — drug names, doses, criteria, clinical pearls.
Do NOT summarize or shorten the transcript. Structure it with headers and formatting.

## keyPoints Format

Array of 5-8 strings. Each point must be:
- A specific, actionable clinical fact
- Relevant to EUNACOM exam
- MIN 30 characters
- Contains actual medical content (not generic filler like "this is important")

Example:
```json
[
  "La causa más frecuente de FA es la hipertensión arterial (cardiopatía hipertensiva).",
  "CHA2DS2-VASc ≥2 = anticoagulación oral. Score 0 = no anticoagular.",
  "FA con hemodinamia inestable = cardioversión eléctrica inmediata.",
]
```

## quiz Format

Exactly 3 questions. Each must be:

```json
{
  "questionText": "Clinical vignette in Spanish. Patient age, sex, symptoms, exam findings, labs. Asks for diagnosis, next step, or treatment. MIN 100 chars.",
  "options": [
    {"id": "A", "text": "Option text", "isCorrect": false, "explanation": "Why wrong. MIN 30 chars."},
    {"id": "B", "text": "Option text", "isCorrect": true, "explanation": "Why correct. MIN 30 chars."},
    {"id": "C", "text": "Option text", "isCorrect": false, "explanation": "Why wrong. MIN 30 chars."},
    {"id": "D", "text": "Option text", "isCorrect": false, "explanation": "Why wrong. MIN 30 chars."},
    {"id": "E", "text": "Option text", "isCorrect": false, "explanation": "Why wrong. MIN 30 chars."}
  ]
}
```

Rules:
- Exactly 5 options (A-E)
- Exactly 1 correct answer
- Clinical vignette format (not simple factual questions)
- All in Spanish
- Explanations for EVERY option (correct and incorrect)

## Validation

Run `node validate_clases.cjs` before uploading. It checks:
- All required fields present
- Minimum character counts met
- Quiz format correct (3 questions, 5 options each, 1 correct)
- keyPoints has 5-8 items with min length
- cleanTranscript has min 3000 chars
- summary has min 800 chars
