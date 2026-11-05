// Importa las 1.890 preguntas de los Libros Gordos a libro_gordo_questions (tabla aparte del banco de 6.099).
//
//   node scripts/libro-gordo/import.mjs --local            → SQLite de desarrollo
//   node scripts/libro-gordo/import.mjs                    → Turso (env/.env.local o CLI de Turso)
//   node scripts/libro-gordo/import.mjs --dry-run          → solo muestra el reparto de claves
//   --src <carpeta>   (por defecto ~/Documents/Archive/Apps/eunacom-fotos/books/dist/_datos_ensayos_90Q)
//
// Las alternativas se reordenan para que la clave quede pareja (18 A, 18 B, … por libro) en vez de
// cargada a A/B como en el original. El orden es determinista (semilla = id), así que reimportar da lo
// mismo. Las alternativas tipo "Ninguna/Todas las anteriores" no se mueven de su lugar.
// Las preguntas dañadas en el original se importan con active = 0 y review_note (no salen en los ensayos).
import fs from 'fs'
import os from 'os'
import path from 'path'
import { LIBROS_GORDOS, ensureLibroGordoTables } from '../../api/_libro-gordo.js'
import { openDb } from './db.mjs'

const argv = process.argv
const DRY = argv.includes('--dry-run')
const SHOW_EXPL = argv.includes('--show-expl')  // vuelca a /tmp/libro-gordo-explicaciones.json los cambios de letras
const explChanged = []
const srcIdx = argv.indexOf('--src')
const SRC = srcIdx > -1 ? argv[srcIdx + 1] : path.join(os.homedir(), 'Documents/Archive/Apps/eunacom-fotos/books/dist/_datos_ensayos_90Q')
const LETTERS = ['A', 'B', 'C', 'D', 'E']

// Correcciones puntuales de datos dañados en el JSON fuente (revisadas a mano)
const FIXES = {
  // Clave vacía; la explicación dice "La respuesta correcta es Hemofilia" (C)
  'Q-HEMATOLOGIA-46': q => ({ ...q, correcta: 'C', review_note: 'clave vacía en el original; se usó C (Hemofilia) según la explicación' }),
  // Enunciado cortado y su segunda mitad quedó como alternativa E; clave E inexistente
  'Q-OTORRINO-34': q => {
    const tail = q.options.find(o => o.id === 'E').text
    return {
      ...q,
      stem: 'Un niño de 6 años consulta por epistaxis bilateral frecuente. ' + tail,
      options: q.options.filter(o => o.id !== 'E'),
      correcta: 'D',
      review_note: 'enunciado reparado (alternativa E era el final del caso); clave D (hipertrofia adenoidea) según auditoría, revisar',
    }
  },
}

// Dañadas sin arreglo seguro → se importan inactivas
const INACTIVE = {
  'Q-CIRUGIA-38': 'alternativas C–E de relleno ("Ninguna/Todas las anteriores", "No se dispone de información")',
  'Q-DIABETES-50': 'alternativas A y C repetidas ("Suspender la glibenclamida")',
  'Q-INFECTOLOGIA-36': 'alternativas mezcladas con otra pregunta; clave A no existe',
  'Q-INFECTOLOGIA-69': 'alternativas mezcladas con otra pregunta; clave A no existe',
  'Q-NEFROLOGIA-27': 'alternativas de relleno e ids repetidos; clave A no existe',
  'Q-NEFROLOGIA-88': 'alternativas mezcladas con otra pregunta',
  'Q-NEUROLOGIA-70': 'alternativas mezcladas e ids repetidos',
  'Q-OFTALMOLOGIA-08': 'alternativas mezcladas; clave A no existe',
  'Q-OFTALMOLOGIA-48': 'las 5 alternativas son de relleno',
}

const PINNED = /(ninguna de las anteriores|todas las anteriores|no se dispone de informaci|otra alternativa no descrita)/i

// PRNG determinista
function hashSeed(str) {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19) }
  return h >>> 0
}
function rng(seed) {
  let a = seed
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
function shuffle(arr, rand) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}

// Reordena las alternativas poniendo la correcta en `target` (si se puede). Devuelve { texts, key }.
function reorder(q, target, rand) {
  const opts = q.options.map(o => ({ ...o, pinned: PINNED.test(o.text) }))
  const correct = opts.find(o => o.id === q.correcta)
  const slots = opts.map((o, i) => (o.pinned ? null : i)).filter(i => i !== null)
  const out = opts.map(o => (o.pinned ? o : null))
  if (correct.pinned) {
    // la correcta es "Ninguna/Todas…": queda donde estaba, el resto se baraja
    const rest = shuffle(opts.filter(o => !o.pinned), rand)
    slots.forEach((s, i) => { out[s] = rest[i] })
  } else {
    const pos = slots.includes(target) ? target : slots[Math.floor(rand() * slots.length)]
    out[pos] = correct
    const rest = shuffle(opts.filter(o => !o.pinned && o !== correct), rand)
    slots.filter(s => s !== pos).forEach((s, i) => { out[s] = rest[i] })
  }
  const map = Object.fromEntries(out.map((o, i) => [o.id, LETTERS[i]]))
  return { texts: out.map(o => o.text), key: LETTERS[out.indexOf(correct)], map }
}

// Las explicaciones nombran alternativas por letra ("A) Incorrecta…", "la opción C", "(B, D)", "Las
// alternativas B, C y E…"); hay que cambiarlas igual que las alternativas. Solo se tocan letras en esos
// contextos, no "hepatitis B", "toxinas A y B", "C. difficile", etc. Las letras ya cambiadas pasan por un
// marcador para que una regla no reescriba lo que cambió otra.
const MARK = 0xE000
const LIST = '[A-E](?:\\s*(?:,|\\by\\b|\\be\\b|\\bo\\b|/)\\s*[A-E])*'
const EXPL_RULES = [
  // inicio de línea: "A) …", "**b) …", "*   **B: …", "C. Incorrecta"
  new RegExp(`(^|\\n)([ \\t*•\\-]*)([A-Ea-e])(?=\\s*\\**\\s*(?:\\)|:|\\.\\s+(?:Correct|Incorrect|Fals|Verdader)))`, 'g'),
  // "opción C", "alternativas B, C y E", "letra (D)", "respuesta correcta es la B", "opción b)"
  new RegExp(`((?:(?:[Oo]pci[oó]n(?:es)?|[Aa]lternativas?|[Rr]espuesta)(?: correcta)?(?: es)?(?: la)?|[Ll]etras?|[Ii]ncisos?|[Cc]lave)\\s*\\(?\\s*\\**\\s*)(${LIST}|[a-e](?=\\)))(?![\\wÁ-úñ\\-])(?!\\.\\s*[a-záéíóúñ])`, 'g'),
  // "(A)", "(A, C, E)"
  new RegExp(`(\\()(${LIST})(?=\\))`, 'g'),
  // "La A, B y D son…", "B y E tratan…" (lista al inicio de frase o tras artículo)
  new RegExp(`((?:^|[.:;]\\s+|\\n\\s*|\\b(?:[Ll]as?|[Ll]os)\\s+))(${LIST})(?![\\wÁ-úñ\\-])(?!\\.\\s*[a-záéíóúñ])`, 'g'),
]
function remapExplanation(text, map) {
  if (!text) return text
  // en listas ("B, C y E") las letras nuevas se ordenan para que no quede "D, A y C"
  const swap = span => {
    const mapped = (span.match(/[A-Ea-e]/g) || []).map(ch => {
      const up = ch.toUpperCase()
      return { idx: LETTERS.indexOf(map[up] || up), lower: ch !== up }
    }).sort((x, y) => x.idx - y.idx)
    let k = 0
    return span.replace(/[A-Ea-e]/g, () => { const m = mapped[k++]; return String.fromCharCode(MARK + m.idx + (m.lower ? 5 : 0)) })
  }
  let out = text
  out = out.replace(EXPL_RULES[0], (m, a, b, letter) => a + b + swap(letter))
  out = out.replace(EXPL_RULES[1], (m, pre, list) => pre + swap(list))
  out = out.replace(EXPL_RULES[2], (m, pre, list) => pre + swap(list))
  out = out.replace(EXPL_RULES[3], (m, pre, list) => {
    // una sola letra al inicio de frase ("A diferencia de…") no es una alternativa
    if (!/[,/]|\by\b|\be\b|\bo\b/.test(list) && !/[Ll]as?\s+$|[Ll]os\s+$/.test(pre)) return m
    return pre + swap(list)
  })
  return out.replace(/[\uE000-\uE009]/g, ch => {
    const i = ch.charCodeAt(0) - MARK
    return i < 5 ? LETTERS[i] : LETTERS[i - 5].toLowerCase()
  })
}

const rows = []
const before = {}, after = {}
for (const book of LIBROS_GORDOS) {
  const file = path.join(SRC, `ENSAYO_90Q_${book.key.toUpperCase()}.json`)
  const questions = JSON.parse(fs.readFileSync(file, 'utf8')).map(q => (FIXES[q.id] ? FIXES[q.id](q) : q))
  if (questions.length !== 90) throw new Error(`${file}: ${questions.length} preguntas (se esperaban 90)`)
  const rand = rng(hashSeed(book.key))
  const active = questions.filter(q => !INACTIVE[q.id])
  // posiciones objetivo parejas: 0,1,2,3,4,0,1,… barajadas
  const targets = shuffle(active.map((_, i) => i % 5), rand)
  let t = 0
  for (const q of questions) {
    const n = Number(String(q.id).match(/(\d+)$/)[1])
    const id = `lg-${book.key}-${String(n).padStart(2, '0')}`
    let texts = q.options.map(o => o.text), key = q.correcta, explicacion = q.explicacion || null
    const inactive = !!INACTIVE[q.id]
    if (!inactive) {
      if (!q.options.some(o => o.id === q.correcta)) throw new Error(`${q.id}: clave ${q.correcta} no está en las alternativas`)
      before[q.correcta] = (before[q.correcta] || 0) + 1
      let map
      ;({ texts, key, map } = reorder(q, targets[t++], rng(hashSeed(q.id))))
      after[key] = (after[key] || 0) + 1
      explicacion = remapExplanation(explicacion, map)
      if (SHOW_EXPL && explicacion !== q.explicacion) explChanged.push({ id: q.id, map, before: q.explicacion, after: explicacion })
    }
    rows.push({
      id, book: book.key, number: n, source_id: q.id,
      specialty: q.specialtyName || book.name, topic: q.topicTitle || null, perfil_code: q.perfilCode || null,
      pregunta: q.stem.replace(/\s*\n\s*/g, ' ').trim(),
      opcion_a: texts[0] ?? null, opcion_b: texts[1] ?? null, opcion_c: texts[2] ?? null, opcion_d: texts[3] ?? null, opcion_e: texts[4] ?? null,
      respuesta_correcta: key, explicacion,
      active: inactive ? 0 : 1,
      review_note: INACTIVE[q.id] || q.review_note || (q.revisar_audit ? `auditoría: ${q.revisar_audit}` : null),
    })
  }
}

console.log(`${rows.length} preguntas en ${LIBROS_GORDOS.length} libros; activas ${rows.filter(r => r.active).length}`)
console.log('Clave antes  :', before)
console.log('Clave después:', after)
const flagged = rows.filter(r => r.review_note)
console.log(`Para revisar (${flagged.length}):`)
for (const r of flagged) console.log(`  ${r.source_id}${r.active ? '' : ' [inactiva]'}: ${r.review_note}`)
if (SHOW_EXPL) {
  fs.writeFileSync('/tmp/libro-gordo-explicaciones.json', JSON.stringify(explChanged, null, 1))
  console.log(`Explicaciones con letras reasignadas: ${explChanged.length} → /tmp/libro-gordo-explicaciones.json`)
}
if (DRY) process.exit(0)

const db = openDb(argv)
console.log('Destino:', db.label)
await ensureLibroGordoTables(db)
const COLS = Object.keys(rows[0])
const upsert = `INSERT INTO libro_gordo_questions (${COLS.join(', ')}) VALUES (${COLS.map(() => '?').join(', ')})
  ON CONFLICT(id) DO UPDATE SET ${COLS.filter(c => c !== 'id').map(c => `${c} = excluded.${c}`).join(', ')}, imported_at = datetime('now')`
for (let i = 0; i < rows.length; i += 200) {
  await db.batch(rows.slice(i, i + 200).map(r => ({ sql: upsert, args: COLS.map(c => r[c]) })))
  process.stdout.write(`\r  ${Math.min(i + 200, rows.length)}/${rows.length}`)
}
const check = await db.execute({ sql: 'SELECT respuesta_correcta AS k, COUNT(*) AS n FROM libro_gordo_questions WHERE active = 1 GROUP BY 1', cols: ['k', 'n'] })
console.log('\nEn la base (activas):', Object.fromEntries(check.rows.map(r => [r.k, Number(r.n)])))
