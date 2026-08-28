/**
 * GENERADOR DE ESQUELETO · Módulo 1 (Medicina Interna)
 *
 * Cruza el temario LEGAL oficial (perfil_v3_full.json, extraído del Perfil v3 2026)
 * con (a) el contenido ya redactado en classesCatalog.json y (b) el banco real de
 * preguntas EUNACOM (reconstrucciones/topic_index.json), y propone la lista granular
 * de clases (modelo "Opción B": ~1 clase por 1–2 situaciones clínicas, con niveles
 * Focused / Standard / Dense-Emergency) que cubre el 100 % de los códigos.
 *
 * Salida:
 *   skeleton_modulo_1.json      — máquina: por especialidad, clases propuestas con códigos
 *   TEMARIO_OFICIAL_MODULO_1.md — revisión humana
 */
const fs = require('fs');
const path = require('path');

const APP = path.join(__dirname, '..', 'eunacom-app-v2');
const perfil = require('./perfil_v3_full.json');
const catalog = require(path.join(APP, 'src/data/classesCatalog.json'));
const topicIndex = require(path.join(APP, 'public/data/reconstrucciones/topic_index.json'));

// perfil specKey  ->  {classesCatalog subsystem, topic_index subject, book key, accent}
const MAP = {
  '1.01': { sub: 'Cardiología',            subj: 'Cardiología',                key: 'cardiologia',      accent: '#ea580c' },
  '1.02': { sub: 'Diabetes',               subj: 'Diabetes y Nutrición',      key: 'diabetes',         accent: '#0891b2' },
  '1.03': { sub: 'Endocrinología',         subj: 'Endocrinología',            key: 'endocrinologia',   accent: '#7c3aed' },
  '1.04': { sub: 'Infectología',           subj: 'Enfermedades Infecciosas',  key: 'infectologia',     accent: '#4d7c0f' },
  '1.05': { sub: 'Respiratorio',           subj: 'Enfermedades Respiratorias', key: 'neumologia',      accent: '#0f766e' },
  '1.06': { sub: 'Gastroenterología',      subj: 'Gastroenterología',         key: 'gastroenterologia', accent: '#15803d' },
  '1.07': { sub: 'Neurología y Geriatría', subj: 'Neurología',                key: 'geriatria',        accent: '#a16207' },
  '1.08': { sub: 'Hematología',            subj: 'Hematología / Oncología',   key: 'hematologia',      accent: '#be123c' },
  '1.09': { sub: 'Nefrología',             subj: 'Nefrología',                key: 'nefrologia',       accent: '#a16207' },
  '1.10': { sub: 'Neurología y Geriatría', subj: 'Neurología',                key: 'neurologia',       accent: '#6d28d9' },
  '1.11': { sub: 'Reumatología',           subj: 'Reumatología',              key: 'reumatologia',     accent: '#9f1239' },
};

const norm = s => (s || '').toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

const STOP = new Set('de la el los las y o en con del al un una para por sobre agudo aguda cronico cronica sindrome enfermedad trastorno paciente'.split(' '));
const toks = s => norm(s).split(' ').filter(w => w.length > 3 && !STOP.has(w));

function overlap(a, b) {
  const A = new Set(toks(a)), B = toks(b);
  if (!A.size || !B.length) return 0;
  let hit = 0; for (const w of B) if (A.has(w)) hit++;
  return hit / Math.max(A.size, B.length);
}

const EMERG_RE = /(shock|paro|infarto|edema agudo|diseccion|taponamiento|status|hemorragia|crisis|sepsis|cetoacidosis|coma|tromboembol|masiv|severa|grave|falla|insuficiencia .* aguda|urgencia|reanimacion)/i;

const out = { module: 'Módulo 1 · Medicina Interna', generated: new Date().toISOString().slice(0, 10), specialties: [] };
let md = `# 📋 TEMARIO OFICIAL · MÓDULO 1 — MEDICINA INTERNA\n\n`;
md += `Derivado del **Perfil de Conocimientos EUNACOM v3.0 (2026)**. Cada clase cubre 1–2 situaciones\n`;
md += `clínicas oficiales (modelo Opción B granular). Niveles de densidad: 🟢 Focused (8–10 slides / 2–3 pp) ·\n`;
md += `🟡 Standard (12–15 / 4–5 pp) · 🔴 Dense-Emergency (18–24 / 6–8 pp).\n\n`;
md += `\`cat\` = clases ya redactadas en classesCatalog · \`Q\` = preguntas reales en el banco EUNACOM.\n\n---\n\n`;

for (const [specKey, m] of Object.entries(MAP)) {
  const spec = perfil.specialties.find(s => s.specKey === specKey);
  const clinical = spec.codes.filter(c => c.section === 'situacion' || c.section === 'urgencia');
  const exams = spec.codes.filter(c => c.section === 'examen');
  const procs = spec.codes.filter(c => c.section === 'procedimiento');
  const generals = spec.codes.filter(c => c.section === 'conocimiento');

  const catClasses = catalog.filter(c => c.subsystem === m.sub);
  const subj = topicIndex.find(s => norm(s.subject) === norm(m.subj));
  const qTopics = (subj ? subj.topics : []);

  // seed clusters from classesCatalog topics; fallback = one cluster per clinical code
  let seeds = catClasses.map(c => ({ title: c.topic, match: c.topic + ' ' + (c.summary || '').slice(0, 200), codes: [] }));
  if (seeds.length < clinical.length * 0.4) seeds = []; // catalog too sparse -> pure code-driven

  // assign each clinical code to best seed (or make its own).
  // guardrails: high threshold + max 3 codes per seed (Opción B granularity).
  for (const code of clinical) {
    let best = null, bestScore = 0.42;
    for (const s of seeds) {
      if (s.codes.length >= 3) continue;
      const sc = overlap(code.name, s.match);
      if (sc > bestScore) { bestScore = sc; best = s; }
    }
    if (best) best.codes.push(code);
    else seeds.push({ title: code.name, match: code.name, codes: [code], solo: true });
  }
  // drop empty seeds, merge singletons that are near-duplicates handled later (manual)
  let classes = seeds.filter(s => s.codes.length).map((s, i) => {
    const hasUrg = s.codes.some(c => c.section === 'urgencia');
    const emerg = hasUrg || EMERG_RE.test(s.title) || s.codes.some(c => EMERG_RE.test(c.name));
    const tier = emerg ? 3 : (s.codes.length >= 3 ? 3 : s.codes.length === 1 ? 1 : 2);
    // question count: best-matching qTopic
    let qc = 0, qt = '';
    for (const t of qTopics) { const sc = overlap(s.title, t.name); if (sc > 0.2 && t.count > qc) { qc = t.count; qt = t.name; } }
    return {
      n: i + 1, title: s.title, tier,
      codes: s.codes.map(c => ({ code: c.code, name: c.name, sec: c.section, dx: c.dx, tx: c.tx, seg: c.seg })),
      questionsInBank: qc, questionTopic: qt,
      hasContent: catClasses.some(c => overlap(c.topic, s.title) > 0.3),
    };
  });

  // renumber
  classes.forEach((c, i) => c.n = i + 1);
  const covered = new Set(classes.flatMap(c => c.codes.map(x => x.code)));
  const missing = clinical.filter(c => !covered.has(c.code));

  out.specialties.push({
    specKey, name: spec.specialty, bookKey: m.key, accent: m.accent,
    officialCodes: { clinical: clinical.length, exams: exams.length, procedures: procs.length, generals: generals.length },
    proposedClasses: classes.length,
    coverage: `${covered.size}/${clinical.length}`,
    questionBankTotal: subj ? subj.total : 0,
    classes,
    unmappedCodes: missing.map(c => ({ code: c.code, name: c.name })),
  });

  // markdown
  const tierIcon = t => ['', '🟢', '🟡', '🔴'][t];
  md += `## ${specKey} · ${spec.specialty}  →  libro \`${m.key}\`  ${m.accent}\n\n`;
  md += `**Códigos oficiales:** ${clinical.length} clínicos (${spec.counts.situacion} situaciones + ${spec.counts.urgencia} urgencias) · `;
  md += `${exams.length} exámenes · ${procs.length} procedimientos · ${generals.length} conocimientos generales\n`;
  md += `**Banco real EUNACOM:** ${subj ? subj.total : 0} preguntas · **Clases propuestas: ${classes.length}**\n\n`;
  md += `| # | Clase | Tier | Códigos Perfil V3 | cat | Q |\n|--:|---|:-:|---|:-:|--:|\n`;
  classes.forEach(c => {
    md += `| ${c.n} | ${c.title} | ${tierIcon(c.tier)} | ${c.codes.map(x => x.code).join(', ')} | ${c.hasContent ? '✓' : '—'} | ${c.questionsInBank || '·'} |\n`;
  });
  if (missing.length) md += `\n> ⚠️ **Sin clase asignada (${missing.length}):** ${missing.map(c => `\`${c.code}\` ${c.name}`).join(' · ')}\n`;
  md += `\n---\n\n`;
}

fs.writeFileSync(path.join(__dirname, 'skeleton_modulo_1.json'), JSON.stringify(out, null, 1));
fs.writeFileSync(path.join(__dirname, 'TEMARIO_OFICIAL_MODULO_1.md'), md);

console.log('✔ skeleton_modulo_1.json + TEMARIO_OFICIAL_MODULO_1.md\n');
console.log('Esp'.padEnd(6), 'Especialidad'.padEnd(28), 'códigos'.padStart(8), 'clases'.padStart(7), 'cobertura'.padStart(10), 'banco Q'.padStart(8));
for (const s of out.specialties) {
  console.log(s.specKey.padEnd(6), (s.name || '').padEnd(28),
    String(s.officialCodes.clinical).padStart(8), String(s.proposedClasses).padStart(7),
    s.coverage.padStart(10), String(s.questionBankTotal).padStart(8));
}
