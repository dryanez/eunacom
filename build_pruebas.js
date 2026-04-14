#!/usr/bin/env node
/**
 * Build pruebas.json from all enriched CSVs in .tmp/
 * 
 * Output structure:
 * {
 *   "Módulo 1": {
 *     "Cardiología": {
 *       "pruebas": [
 *         { "id": "m1-cardiologia-1", "name": "Prueba 1", "questions": [...] },
 *         { "id": "m1-cardiologia-2", "name": "Prueba 2", "questions": [...] },
 *       ]
 *     }
 *   }
 * }
 */

const fs = require('fs')
const path = require('path')

const BASE = path.join(__dirname, '.tmp')

// Mapping from enriched folder names to [Módulo, Topic display name]
// Using the same Módulo mapping that the app uses in questionDB.json
const FOLDER_MAP = {
  // Módulo 1 — Medicina Interna (Capítulo 3 topics + Cap 4 Medicina interna)
  'enriched_cardiología':       ['Módulo 1', 'Cardiología'],
  'enriched_endocrinologia':    ['Módulo 1', 'Endocrinología'],
  'enriched_gastroenterología': ['Módulo 1', 'Gastroenterología'],
  'enriched_hematología':       ['Módulo 1', 'Hematología'],
  'enriched_infectología':      ['Módulo 1', 'Infectología'],
  'enriched_nefrología':        ['Módulo 1', 'Nefrología'],
  'enriched_neurología':        ['Módulo 1', 'Neurología'],
  'enriched_respiratorio':      ['Módulo 1', 'Respiratorio'],
  'enriched_reumatología':      ['Módulo 1', 'Reumatología'],
  'enriched_medicina_interna':  ['Módulo 1', 'Medicina Interna'],

  // Módulo 2 — Cirugía, Especialidades, Psiquiatría (Capítulo 1 + Cap 4 Especialidades)
  'enriched_cirugía_y_anastesia':    ['Módulo 2', 'Cirugía y Anestesia'],
  'enriched_dermatología':           ['Módulo 2', 'Dermatología'],
  'enriched_oftalmología':           ['Módulo 2', 'Oftalmología'],
  'enriched_otorrinolaringología':   ['Módulo 2', 'Otorrinolaringología'],
  'enriched_psiquiatría':            ['Módulo 2', 'Psiquiatría'],
  'enriched_salud_pública':          ['Módulo 2', 'Salud Pública'],
  'enriched_traumatología':          ['Módulo 2', 'Traumatología'],
  'enriched_urología':               ['Módulo 2', 'Urología'],
  'enriched_especialidades':         ['Módulo 2', 'Especialidades'],

  // Módulo 3 — Pediatría, Ginecología, Obstetricia (Capítulo 2 + Cap 4 Ped+Gine)
  'enriched_ginecología':              ['Módulo 3', 'Ginecología'],
  'enriched_neonatología':             ['Módulo 3', 'Neonatología'],
  'enriched_obstetricia':              ['Módulo 3', 'Obstetricia'],
  'enriched_pediatría':                ['Módulo 3', 'Pediatría'],
  'enriched_pediatría_y_ginecología':  ['Módulo 3', 'Pediatría y Ginecología'],
}

// Simple CSV parser that handles quoted fields with commas and newlines
function parseCSV(text) {
  const rows = []
  let current = ''
  let inQuotes = false
  const lines = text.split('\n')
  
  for (const line of lines) {
    if (inQuotes) {
      current += '\n' + line
      // Count quotes in this line
      const quoteCount = (line.match(/"/g) || []).length
      if (quoteCount % 2 === 1) {
        inQuotes = false
        rows.push(current)
        current = ''
      }
    } else {
      const quoteCount = (line.match(/"/g) || []).length
      if (quoteCount % 2 === 1) {
        inQuotes = true
        current = line
      } else {
        rows.push(line)
      }
    }
  }
  if (current) rows.push(current)

  // Parse each row into fields
  return rows.filter(r => r.trim()).map(row => {
    const fields = []
    let field = ''
    let inQ = false
    for (let i = 0; i < row.length; i++) {
      const c = row[i]
      if (c === '"') {
        if (inQ && row[i+1] === '"') { field += '"'; i++; continue }
        inQ = !inQ
      } else if (c === ',' && !inQ) {
        fields.push(field)
        field = ''
      } else {
        field += c
      }
    }
    fields.push(field)
    return fields
  })
}

function slugify(text) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Parse a CSV file and return question objects
function parseQuestionsFromCSV(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8')
  const rows = parseCSV(raw)
  if (rows.length < 2) return []
  
  const header = rows[0].map(h => h.trim().toLowerCase())
  const questions = []
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.length < 8) continue
    
    const get = (col) => {
      const idx = header.indexOf(col)
      return idx >= 0 && idx < row.length ? row[idx].trim() : ''
    }
    
    const numero = get('numero')
    const pregunta = get('pregunta')
    if (!pregunta) continue
    
    const q = {
      numero: parseInt(numero) || (i),
      pregunta: pregunta,
      opciones: [
        { id: 'A', text: get('opcion_a') },
        { id: 'B', text: get('opcion_b') },
        { id: 'C', text: get('opcion_c') },
        { id: 'D', text: get('opcion_d') },
        { id: 'E', text: get('opcion_e') },
      ].filter(o => o.text), // Remove empty options
      respuestaCorrecta: get('respuesta_correcta').toUpperCase().trim(),
      explicacion: get('explicacion_correcta'),
      explicacionIncorrectas: get('por_que_incorrectas'),
      codigoEunacom: get('codigo_eunacom'),
      tags: get('tags'),
      videoRecomendado: get('video_recomendado'),
    }
    
    questions.push(q)
  }
  
  return questions
}

// Extract the number from a filename like "Cardiología 12.csv" → 12
function extractFileNumber(filename) {
  const m = filename.match(/(\d+)\.csv$/i)
  return m ? parseInt(m[1]) : 999
}

// ─── MAIN ────────────────────────────────────────────────────────

const result = {}
let totalQuestions = 0
let totalPruebas = 0

const dirs = fs.readdirSync(BASE).filter(d => d.startsWith('enriched_') && d !== 'enriched_csvs')

// Normalize folder name to NFC for matching
function normKey(s) { return s.normalize('NFC') }

// Build a normalized lookup
const normalizedMap = {}
for (const [k, v] of Object.entries(FOLDER_MAP)) {
  normalizedMap[normKey(k)] = v
}

for (const dir of dirs.sort()) {
  const mapping = normalizedMap[normKey(dir)]
  if (!mapping) {
    console.warn(`⚠️  No mapping for folder: ${dir} (normalized: ${normKey(dir)})`)
    continue
  }
  
  const [modulo, topic] = mapping
  const dirPath = path.join(BASE, dir)
  
  const csvFiles = fs.readdirSync(dirPath)
    .filter(f => f.endsWith('.csv'))
    .sort((a, b) => extractFileNumber(a) - extractFileNumber(b))
  
  if (!result[modulo]) result[modulo] = {}
  if (!result[modulo][topic]) result[modulo][topic] = { pruebas: [] }
  
  for (let i = 0; i < csvFiles.length; i++) {
    const csvFile = csvFiles[i]
    const filePath = path.join(dirPath, csvFile)
    const questions = parseQuestionsFromCSV(filePath)
    
    if (questions.length === 0) {
      console.warn(`  ⚠️  No questions found in: ${dir}/${csvFile}`)
      continue
    }
    
    const pruebaNum = i + 1
    const id = `${slugify(modulo)}-${slugify(topic)}-${pruebaNum}`
    
    result[modulo][topic].pruebas.push({
      id,
      name: `Prueba ${pruebaNum}`,
      sourceFile: csvFile,
      questionCount: questions.length,
      questions,
    })
    
    totalQuestions += questions.length
    totalPruebas++
  }
  
  console.log(`✅ ${modulo} / ${topic}: ${csvFiles.length} pruebas, ${result[modulo][topic].pruebas.reduce((s, p) => s + p.questions.length, 0)} questions`)
}

// Sort modules
const sorted = {}
for (const mod of ['Módulo 1', 'Módulo 2', 'Módulo 3']) {
  if (result[mod]) {
    sorted[mod] = {}
    for (const topic of Object.keys(result[mod]).sort()) {
      sorted[mod][topic] = result[mod][topic]
    }
  }
}

// ─── Write output: split into per-topic files + an index ─────

const outDir = path.join(__dirname, 'eunacom-app-v2', 'public', 'data', 'pruebas')
fs.mkdirSync(outDir, { recursive: true })

// Build index (no questions, just metadata)
const index = {}
for (const [mod, topics] of Object.entries(sorted)) {
  index[mod] = {}
  for (const [topic, data] of Object.entries(topics)) {
    const topicSlug = slugify(mod + '-' + topic)
    index[mod][topic] = {
      slug: topicSlug,
      pruebas: data.pruebas.map(p => ({
        id: p.id,
        name: p.name,
        questionCount: p.questionCount,
      }))
    }
    // Write full topic file (with questions)
    const topicFile = path.join(outDir, `${topicSlug}.json`)
    fs.writeFileSync(topicFile, JSON.stringify(data))
    const sizeMB = (fs.statSync(topicFile).size / 1024).toFixed(0)
    console.log(`  📄 ${topicSlug}.json (${sizeMB} KB)`)
  }
}

// Write index
const indexPath = path.join(outDir, 'index.json')
fs.writeFileSync(indexPath, JSON.stringify(index, null, 2))

// Also write a single combined file for convenience (used in dev)
const fullPath = path.join(__dirname, 'eunacom-app-v2', 'src', 'data', 'pruebas.json')
fs.writeFileSync(fullPath, JSON.stringify(sorted, null, 0))

console.log('\n════════════════════════════════════')
console.log(`Total: ${totalPruebas} pruebas, ${totalQuestions} questions`)
console.log(`Index: ${indexPath}`)
console.log(`Topic files: ${outDir}/`)
console.log(`Full file: ${fullPath} (${(fs.statSync(fullPath).size / (1024 * 1024)).toFixed(1)} MB)`)
console.log('════════════════════════════════════')
