/**
 * Parser del Perfil de Conocimientos EUNACOM · Versión 3 (2026).
 * Fuente: perfil_v3_2026_raw.txt  (pdftotext -layout -enc UTF-8 de book/Perfil2026.pdf)
 * Salida: perfil_v3_full.json  — el ESQUELETO LEGAL: toda especialidad, todo código,
 *         con su nivel oficial de Diagnóstico / Tratamiento / Seguimiento.
 *
 * Código = A.SS.G.NNN
 *   A  = área (1 Medicina Interna, 2 Pediatría, 3 Obst/Gineco, 4 Cirugía,
 *              5 Psiquiatría, 6 Especialidades, 7 Salud Pública)
 *   SS = especialidad · G = sección · NNN = correlativo
 *   G: 1 situación clínica · 2 urgencia · 3 conocimiento general · 4 examen · 5 procedimiento
 */
const fs = require('fs');
const path = require('path');

const RAW = fs.readFileSync(path.join(__dirname, 'perfil_v3_2026_raw.txt'), 'utf8')
  .replace(/\r/g, '').split('\n');

const AREAS = {
  1: 'Medicina Interna', 2: 'Pediatría', 3: 'Obstetricia y Ginecología',
  4: 'Cirugía', 5: 'Psiquiatría', 6: 'Especialidades', 7: 'Salud Pública',
};
const SECTIONS = { 1: 'situacion', 2: 'urgencia', 3: 'conocimiento', 4: 'examen', 5: 'procedimiento' };

// nombres oficiales por código de especialidad (del ÍNDICE del Perfil v3)
const SPEC_NAMES = {
  '1.01': 'Cardiología', '1.02': 'Diabetes y nutrición', '1.03': 'Endocrinología',
  '1.04': 'Enfermedades infecciosas', '1.05': 'Enfermedades respiratorias',
  '1.06': 'Gastroenterología', '1.07': 'Geriatría', '1.08': 'Hémato-oncología',
  '1.09': 'Nefrología', '1.10': 'Neurología', '1.11': 'Reumatología',
  '2.01': 'Pediatría general', '3.01': 'Obstetricia y ginecología',
  '4.01': 'Cirugía general y anestesia', '4.02': 'Traumatología', '4.03': 'Urología',
  '5.01': 'Psiquiatría general', '6.01': 'Dermatología', '6.02': 'Oftalmología',
  '6.03': 'Otorrinolaringología', '7.01': 'Salud pública',
};

const DX = ['Específico', 'Sospecha'];
const TX = ['Inicial', 'Completo', 'Derivar'];
const SEG = ['Completo', 'Derivar', 'No requiere', 'Completo APS'];
const NIVEL = ['Realiza, interpreta y emplea', 'Interpreta y emplea', 'Emplea informe',
  'Realizar', 'Derivar a especialista', 'Realiza e interpreta'];

const CODE_RE = /^(\d)\.(\d\d)\.(\d)\.(\d{3})\s+(.*)$/;

const codes = {};   // code -> {code, area, areaName, specialty, specKey, section, sectionName, name, dx, tx, seg, nivel}
const specNames = {}; // "1.01" -> "Cardiología"

let curSpecTitle = null;

function peelLevels(rest) {
  // rest = "<name>   <Dx>   <Tx>   <Seg>"  (columns may be missing/misaligned)
  let name = rest.trim(), dx = null, tx = null, seg = null;
  // try Seg (last)
  for (const s of SEG.sort((a, b) => b.length - a.length)) {
    if (name.endsWith(' ' + s)) { seg = s; name = name.slice(0, -s.length).trim(); break; }
  }
  for (const t of TX) {
    if (name.endsWith(' ' + t)) { tx = t; name = name.slice(0, -t.length).trim(); break; }
  }
  for (const d of DX) {
    if (name.endsWith(' ' + d)) { dx = d; name = name.slice(0, -d.length).trim(); break; }
  }
  return { name: name.replace(/\s{2,}/g, ' ').trim(), dx, tx, seg };
}

function peelNivel(rest) {
  let name = rest.trim(), nivel = null;
  for (const n of NIVEL.sort((a, b) => b.length - a.length)) {
    if (name.endsWith(' ' + n) || name === n) { nivel = n; name = name.slice(0, name.length - n.length).trim(); break; }
  }
  return { name: name.replace(/\s{2,}/g, ' ').trim(), nivel };
}

for (const line of RAW) {
  const t = line.trim();
  const m = line.match(CODE_RE);
  if (!m) {
    // specialty title line (appears alone, right after "Área: ...")
    if (t && !/^(Código|Nivel|Situación|Tema|Examen|Procedimiento|Área:|Diagnóstico|Específico|Tratamiento|Seguimiento|Conocimientos|Situaciones|Exámenes|\d)/.test(t)
        && t.length < 60 && /^[A-ZÁÉÍÓÚÑ]/.test(t) && !/\.{3}/.test(t)) {
      curSpecTitle = t;
    }
    continue;
  }
  const [, a, ss, g, nnn, rest] = m;
  const code = `${a}.${ss}.${g}.${nnn}`;
  const specKey = `${a}.${ss}`;
  const section = SECTIONS[g] || g;
  specNames[specKey] = SPEC_NAMES[specKey] || curSpecTitle || specKey;

  let entry = { code, area: +a, areaName: AREAS[a], specKey, specialty: specNames[specKey] || null, section, name: rest.trim(), dx: null, tx: null, seg: null, nivel: null };
  if (g === '1' || g === '2') Object.assign(entry, peelLevels(rest));
  else if (g === '4' || g === '5') Object.assign(entry, peelNivel(rest));
  else entry.name = rest.replace(/\s{2,}/g, ' ').trim();
  codes[code] = entry;
}

// backfill specialty names now that specNames is complete
for (const c of Object.values(codes)) if (!c.specialty) c.specialty = specNames[c.specKey] || null;

// group by specialty
const bySpec = {};
for (const c of Object.values(codes)) {
  (bySpec[c.specKey] = bySpec[c.specKey] || { specKey: c.specKey, specialty: c.specialty, area: c.area, areaName: c.areaName, counts: {}, codes: [] });
  bySpec[c.specKey].codes.push(c);
  bySpec[c.specKey].counts[c.section] = (bySpec[c.specKey].counts[c.section] || 0) + 1;
}

const out = {
  source: 'EUNACOM Perfil de Conocimientos v3.0 (junio 2026) · book/Perfil2026.pdf',
  totalCodes: Object.keys(codes).length,
  specialties: Object.values(bySpec).sort((a, b) => a.specKey.localeCompare(b.specKey)),
};
fs.writeFileSync(path.join(__dirname, 'perfil_v3_full.json'), JSON.stringify(out, null, 1));

console.log(`✔ perfil_v3_full.json · ${out.totalCodes} códigos · ${out.specialties.length} especialidades\n`);
for (const s of out.specialties) {
  const c = s.counts;
  console.log(`${s.specKey}  ${(s.specialty || '??').padEnd(30)} sit:${c.situacion || 0}  urg:${c.urgencia || 0}  gen:${c.conocimiento || 0}  ex:${c.examen || 0}  proc:${c.procedimiento || 0}   = ${s.codes.length}`);
}
