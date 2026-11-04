/**
 * ══════════════════════════════════════════════════════════════════════════════
 * MANUAL EUNACOM · COMPILADOR MULTI-ESPECIALIDAD
 * Estilo editorial "Maqueta 1b — Alta densidad codificada"
 *   · banda de color de la especialidad a sangre en el borde superior
 *   · portada oscura con numeral Barlow · pestaña de sección en la esquina
 *   · página de tema a doble columna · figuras dinámicas · síntesis · solucionario
 *
 * Cada especialidad tiene su PROPIO color (portada, banda, reglas, tarjetas)
 * para diferenciar los tomos de un vistazo. El azul marino de las tablas de
 * datos y el verde del solucionario se mantienen constantes en toda la serie.
 *
 * Uso:   node scripts/build_maqueta_1b_book.cjs [clave]
 *        clave = cardiologia | neumologia | neurologia | ...  (por defecto: todas
 *        las que tengan dataset estructurado)
 *
 * Datos: cada especialidad requiere un dataset con la forma de
 *        master_cardiology_23_full_dataset.cjs (array de clases con
 *        contentSections, table, vignette, explicacion, keyPoints, questions…).
 * ══════════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const ROOT = path.join(__dirname, '..');
const SVG_DIR = path.join(ROOT, 'generate-book', 'svg_diagrams');
const LIBRO_DIR = path.join(ROOT, 'libro_eunacom_v3');
const PUBLIC_SHOWCASE = path.join(ROOT, '..', 'public', 'cardio_showcase');

/* ══════════════════════════ PALETA POR ESPECIALIDAD ══════════════════════════
 * Un color base por especialidad; los tonos (tinte, borde, oscuro…) se derivan.
 * Colores elegidos para máxima separación cromática entre tomos contiguos.     */
// enlaces libro ↔ sitio (rutas por confirmar con el equipo web; base en una sola constante)
const SITE = {
  base: 'https://www.eunacomapp.cl',
  clase: id => `https://www.eunacomapp.cl/clase/${id}`,
  preguntas: id => `https://www.eunacomapp.cl/preguntas/${id}`,
};

const ACCENTS = {
  cardiologia:   '#ea580c', // naranja
  diabetes:      '#0891b2', // cian
  endocrinologia:'#7c3aed', // violeta
  gastroenterologia: '#15803d', // verde bosque
  hematologia:   '#be123c', // carmesí
  infectologia:  '#4d7c0f', // oliva
  nefrologia:    '#a16207', // ámbar oscuro
  neurologia:    '#6d28d9', // púrpura
  neumologia:    '#0f766e', // teal profundo
  reumatologia:  '#9f1239', // granate
  // Módulo 2 / 3 (para cuando haya dataset)
  cirugia:       '#334155',
  traumatologia: '#b45309',
  urologia:      '#0369a1',
  dermatologia:  '#a21caf',
  oftalmologia:  '#0e7490',
  otorrino:      '#4338ca',
  psiquiatria:   '#7e22ce',
  saludpublica:  '#166534',
  pediatria:     '#c2410c',
  ginecologia:   '#be185d',
  obstetricia:   '#9d174d',
};

function mix(hex, other, t) {
  const a = hex.replace('#', '').match(/../g).map(x => parseInt(x, 16));
  const b = other.replace('#', '').match(/../g).map(x => parseInt(x, 16));
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
function themeVars(acc) {
  return {
    acc,
    accD:  mix(acc, '#000000', 0.20),
    accDp: mix(acc, '#000000', 0.40),
    accT:  mix(acc, '#ffffff', 0.93),
    accP:  mix(acc, '#ffffff', 0.74),
    accL:  mix(acc, '#ffffff', 0.55),
    accInk: mix(acc, '#000000', 0.58),
  };
}

/* ══════════════════════════ REGISTRO DE ESPECIALIDADES ══════════════════════ */
const SPECIALTIES = [
  {
    key: 'cardiologia', ch: '01', title: 'Cardiología',
    module: 'Módulo 1 · Medicina Interna', moduleDir: 'Modulo_1_Medicina_Interna',
    subtitle: 'Electrocardiografía y arritmias, síndromes coronarios, insuficiencia cardíaca y shock, valvulopatías, hipertensión y patología vascular.',
    dataset: () => require('./master_cardiology_23_full_dataset.cjs').master23ClassesFullData,
    figDir: path.join(LIBRO_DIR, 'Modulo_1_Medicina_Interna', 'figuras'),
    figSpec: require('./figspec_cardiologia.cjs'),
    out: 'Manual_EUNACOM_Cardiologia_Completo_2026.pdf',
    publicOut: path.join(PUBLIC_SHOWCASE, 'Manual_EUNACOM_Cardiologia_Completo_2026.pdf'),
  },
  { key: 'diabetes',        ch: '06', title: 'Diabetes y Dislipidemias',           module: 'Módulo 1 · Medicina Interna', moduleDir: 'Modulo_1_Medicina_Interna', dataset: null },
  { key: 'endocrinologia',  ch: '07', title: 'Endocrinología',                      module: 'Módulo 1 · Medicina Interna', moduleDir: 'Modulo_1_Medicina_Interna', dataset: null },
  {
    key: 'gastroenterologia', ch: '08', title: 'Gastroenterología', variant: 'MUESTRA',
    module: 'Módulo 1 · Medicina Interna', moduleDir: 'Modulo_1_Medicina_Interna',
    subtitle: 'Esófago y estómago, intestino y colon, hígado e hipertensión portal, vía biliar y páncreas.',
    dataset: () => require('./dataset_gastroenterologia.cjs').gastroenterologiaClasses,
    figSpec: {},
    out: 'Manual_EUNACOM_Gastroenterologia_MUESTRA_2026.pdf',
  },
  { key: 'hematologia',     ch: '09', title: 'Hematología',                          module: 'Módulo 1 · Medicina Interna', moduleDir: 'Modulo_1_Medicina_Interna', dataset: null },
  { key: 'infectologia',    ch: '10', title: 'Infectología',                         module: 'Módulo 1 · Medicina Interna', moduleDir: 'Modulo_1_Medicina_Interna', dataset: null },
  { key: 'nefrologia',      ch: '11', title: 'Nefrología',                           module: 'Módulo 1 · Medicina Interna', moduleDir: 'Modulo_1_Medicina_Interna', dataset: null },
  { key: 'neurologia',      ch: '12', title: 'Neurología y Geriatría',              module: 'Módulo 1 · Medicina Interna', moduleDir: 'Modulo_1_Medicina_Interna', dataset: null },
  { key: 'neumologia',      ch: '13', title: 'Respiratorio',                         module: 'Módulo 1 · Medicina Interna', moduleDir: 'Modulo_1_Medicina_Interna', dataset: null },
  { key: 'reumatologia',    ch: '14', title: 'Reumatología',                         module: 'Módulo 1 · Medicina Interna', moduleDir: 'Modulo_1_Medicina_Interna', dataset: null },
];

/* ───────────────────────────── helpers ───────────────────────────── */

function getSvg(name) {
  if (!name) return '';
  const p = path.join(SVG_DIR, name);
  if (!fs.existsSync(p)) return '';
  let s = fs.readFileSync(p, 'utf8');
  s = s.replace(/<ellipse[^>]+fill=["']#222222["'][^>]*\/>/gi, '');
  s = s.replace(/<line[^>]+y1=["']35["'][^>]+y2=["']55["'][^>]*\/>/gi, '');
  return s;
}
const stripTags = (s = '') => String(s).replace(/<[^>]+>/g, '').replace(/&bull;/g, '·').trim();
function truncate(s, n) {
  s = stripTags(s);
  if (s.length <= n) return s;
  let cut = s.slice(0, n);
  const sp = cut.lastIndexOf(' ');
  if (sp > n * 0.6) cut = cut.slice(0, sp);
  return cut.replace(/[\s,.;:–—-]+$/, '') + '…';
}
function sentences(s = '') {
  return stripTags(s).split(/(?<=[.:])\s+(?=[A-ZÁÉÍÓÚ¿0-9])/).map(x => x.trim()).filter(Boolean);
}
const firstSentence = s => sentences(s)[0] || '';
function parseReconstrucciones(str, title) {
  if (!str) return [];
  const out = [];
  stripTags(str).split('·').forEach(chunk => {
    const m = chunk.match(/(\d{4})\s*\(([^)]+)\)/);
    if (!m) return;
    m[2].split(',').forEach(q => {
      const qn = q.replace(/[^\d#]/g, '');
      if (qn) out.push({ tag: `EUNACOM ${m[1]} · ${qn.startsWith('#') ? qn : 'Q' + qn}`, text: title });
    });
  });
  return out;
}
const TRAP_RE = /(prohib|contraindic|nunca|jam[aá]s|no se debe|no está indicad|no debe|evitar|error|trampa|descarta|anula)/i;
const CIFRA_RE = /(?:≥|≤|>|<|~|±)?\s?\d[\d.,]*\s?(?:mm\/s|mmHg|mm|ms|mcg|µg|mg\/dl|mg|kg|mEq|mL|lpm|%|J|min|h)\b/i;
function extractCifras(kps) {
  const seen = new Set(), out = [];
  kps.forEach(k => {
    const plain = stripTags(k);
    const m = plain.match(CIFRA_RE);
    if (!m) return;
    const val = m[0].replace(/\s+/g, ' ').trim();
    const key = val.replace(/[^\d a-z%]/gi, '').toLowerCase();
    if (seen.has(key) || val.length < 3) return;
    seen.add(key);
    let label = plain.slice(0, plain.indexOf(m[0])).replace(/[\s(,:;–—-]+$/, '').trim();
    if (label.length < 4 || label.length > 52) label = truncate(plain, 46);
    out.push({ val, label });
  });
  return out.slice(0, 6);
}
function extractMnemos(kps) {
  const mn = [];
  kps.forEach(k => {
    const m = stripTags(k).match(/^([A-ZÁÉÍÓÚ0-9][^—–]{1,44}?)\s+[—–]\s+(.+)/);
    if (m) mn.push({ name: m[1].trim(), expl: truncate(m[2], 118) });
  });
  if (mn.length) return mn.slice(0, 4);
  return kps.slice(0, 4).map(k => ({ name: '', expl: truncate(k, 128) }));
}
const CN = n => String(n).padStart(2, '0');

/* ───────────────────────────── prepare ───────────────────────────── */

function prepare(data, figSpec) {
  const bns = [...new Set(data.map(c => c.blockNum))].sort((a, b) => a - b);
  const blocks = bns.map(bn => {
    const classes = data.filter(c => c.blockNum === bn);
    return { bn, name: classes[0].blockName, classes };
  });
  let cursor = 3;
  blocks.forEach(b => {
    b.startPage = cursor; cursor += 1;
    b.classes.forEach(c => { c.startPage = cursor; cursor += (figSpec[c.topicLabel] ? 3 : 2); });
    cursor += 1;
  });
  return {
    blocks, solPage: cursor,
    totalQuestions: data.reduce((n, c) => n + (c.questions ? c.questions.length : 0), 0),
    totalRecon: data.reduce((n, c) => n + parseReconstrucciones(c.reconstrucciones, c.title).length, 0),
    uniqueCodes: new Set(data.flatMap(c => String(c.perfilCode || '').split(/[,\s]+/).filter(Boolean))).size,
  };
}

/* ───────────────────────────── page builders ───────────────────────────── */

/* Cada sección va envuelta en una tabla: el <thead> (banda de color, centrada)
   se repite automáticamente en la parte superior de CADA página impresa. */
function sec(x, label, body, opt = {}) {
  const txt = `Manual EUNACOM de ${x.spec.title}${label ? `&nbsp;&nbsp;·&nbsp;&nbsp;${label}` : ''}`;
  return `<table class="secwrap"><thead><tr><td><div class="gbar${opt.green ? ' green' : ''}"><span>${txt}</span></div></td></tr></thead>`
    + `<tbody><tr><td class="secbody${opt.flush ? ' flush' : ''}">${body}</td></tr></tbody></table>`;
}

function coverPage(x) {
  const { spec, blocks, uniqueCodes, totalRecon, data } = x;
  return sec(x, '', `
  <div class="cover">
    <div class="cover-spine"><span>${spec.module}</span></div>
    <div class="cover-inner">
      <div class="cover-top">
        <div class="cover-eyebrow">
          <span class="l1">Manual EUNACOM de Medicina</span>
          <span class="l2">Edición Chile 2026 · 1.ª edición</span>
        </div>
        <div class="cover-codebox"><span class="k">perfil v3 asofamech</span><span class="v">${uniqueCodes} códigos oficiales</span></div>
      </div>
      <div class="cover-hero">
        <div class="cover-numrow">
          <span class="bignum">${spec.ch}</span>
          <div class="cover-numlabel"><span class="k">Bloques temáticos</span><span class="v">${CN(blocks.length)}</span></div>
        </div>
        <h1>${spec.title}</h1>
        <div class="cover-rule"></div>
        <p class="cover-desc">${spec.subtitle} Texto oficial de estudio, 100&nbsp;% adaptado al Perfil de Conocimientos V3 de ASOFAMECh y a las Garantías Explícitas en Salud (GES).</p>
      </div>
      <div class="cover-foot">
        <div class="cover-stats">
          <div><span class="n">${data.length}</span><span class="t">clases granulares de alta densidad</span></div>
          <div><span class="n">${totalRecon}</span><span class="t">reconstrucciones oficiales fechadas</span></div>
          <div><span class="n">GES</span><span class="t">normas técnicas MINSAL vigentes</span></div>
        </div>
        <div class="cover-foot-row">
          <span>Banco de preguntas oficiales con solucionario razonado al final del manual · Formato editorial de alta densidad</span>
          <span class="brand">Academia EUNACOM<br><em>Masterclass</em></span>
        </div>
      </div>
    </div>
  </div>`, { flush: true });
}

function indexPage(x) {
  const { spec, blocks, solPage } = x;
  const rows = blocks.map(b => `
    <div class="idx-chap">
      <div class="idx-chap-head">
        <span class="idx-cn">${CN(b.bn)}</span><span class="idx-ct">${b.name}</span><span class="idx-cp">${b.startPage}</span>
      </div>
      <div class="idx-topics">
        ${b.classes.map(c => `<div class="idx-t"><span class="idx-tt">${c.topicLabel}. ${c.title}</span><span class="idx-dots"></span><span class="idx-tp">${c.startPage}</span></div>`).join('')}
      </div>
    </div>`).join('');
  return sec(x, 'Índice general', `
    <div class="pg-lead">
      <h2>Índice general</h2><div class="rule"></div>
    </div>
    ${rows}
    <div class="idx-sol"><span class="idx-sol-t">Solucionario &amp; Justificaciones Razonadas EUNACOM</span><span class="idx-sol-p">${solPage}</span></div>
  `);
}

function chapterOpener(b, x) {
  const { spec } = x;
  const matrix = b.classes.map((c, i) => `
    <tr${i % 2 ? ' class="alt"' : ''}>
      <td class="mono">${c.perfilCode}</td><td>${c.title}</td><td>${c.dx}</td><td>${c.tx}</td><td>${c.seg}</td><td class="ges">${stripTags(c.ges)}</td>
    </tr>`).join('');
  const recon = b.classes.flatMap(c => parseReconstrucciones(c.reconstrucciones, c.title)).slice(0, 8);
  const reconGrid = recon.map(r => `<div class="hist-item"><span class="hist-tag">${r.tag}</span><span class="hist-txt">${truncate(r.text, 68)}</span></div>`).join('');
  const conceptRows = b.classes.flatMap(c => c.keyPoints).slice(0, 6).map(k => {
    const trap = TRAP_RE.test(stripTags(k));
    return `<p class="concept${trap ? ' trap' : ''}">${trap ? '<strong>! Trampa · </strong>' : ''}${k}</p>`;
  }).join('');
  const nQ = b.classes.reduce((n, c) => n + c.questions.length, 0);
  return sec(x, `Bloque ${CN(b.bn)} — ${b.name}`, `
    <div class="op-title">
      <span class="op-num">${CN(b.bn)}</span>
      <div><span class="eyebrow">${b.classes.length} competencia${b.classes.length===1?'':'s'} oficial${b.classes.length===1?'':'es'} del Perfil V3</span><h1>${b.name}</h1></div>
    </div>
    <div class="card card-accent">
      <div class="card-head"><span>Orientación EUNACOM · impacto en el examen</span><span class="pill dark">${nQ} preguntas de banco</span></div>
      <p class="card-body-p">Este bloque reúne <strong>${b.classes.length} competencia${b.classes.length===1?'':'s'} oficial${b.classes.length===1?'':'es'}</strong> del Perfil V3 de ASOFAMECh
      y <strong>${recon.length}+ reconstrucciones históricas fechadas</strong> del EUNACOM. Es obligatorio dominar la conducta
      de primera línea de cada escenario, las cifras que se preguntan literalmente y las trampas que anulan la respuesta.</p>
    </div>
    <div class="card">
      <div class="card-head navy"><span>Matriz legal Perfil V3 ASOFAMECh · competencias oficiales</span><span class="pill light">${b.classes.length} códigos</span></div>
      <table class="dtbl"><thead><tr><th>Código V3</th><th>Tema / patología oficial</th><th>Dx</th><th>Tx</th><th>Seg</th><th>Régimen / garantía GES</th></tr></thead><tbody>${matrix}</tbody></table>
    </div>
    <div class="card">
      <div class="card-head grey"><span>Historial de preguntas EUNACOM</span><span class="pill plain">${recon.length} reconstrucciones</span></div>
      <div class="hist-grid">${reconGrid}</div>
    </div>
    <div class="card">
      <div class="card-head grey"><span>Conceptos clave &amp; trampas frecuentes</span><span class="pill plain">Alto rendimiento</span></div>
      <div class="concept-list">${conceptRows}</div>
    </div>
  `);
}

function figureBlock(c, x) {
  const spec = x.figSpec[c.topicLabel];
  if (!spec) return '';
  const imgs = spec.items.map((it, i) => {
    const src = x.figMap.get(it.file);
    if (!src) return '';
    const tag = spec.items.length > 1 ? `<b>${String.fromCharCode(65 + i)}.</b> ` : '';
    return `<figure class="fx"><img src="${src}" alt=""><figcaption>${tag}${it.cap}</figcaption></figure>`;
  }).join('');
  if (!imgs) return '';
  return `<div class="figblock ${spec.mode || 'wide'}"><div class="figrow">${imgs}</div><p class="figcap"><b>Figura ${c.topicLabel}.</b> ${spec.desc}</p></div>`;
}

function topicPage(c, b, x) {
  const prose = c.contentSections.map(s => `<h3>${s.subhead}</h3>${(s.paragraphs || [s.text]).map(p => `<p>${p}</p>`).join('')}`).join('');
  const svg = getSvg(c.svg);
  const algoCard = svg ? `<div class="algo-card"><div class="algo-head">Algoritmo ${c.topicLabel} · ${c.algoTitle}</div><div class="algo-body">${svg}</div></div>` : '';
  const tbl = c.table ? `
    <div class="card tbl-card">
      <div class="card-head navy"><span>Tabla ${c.topicLabel} · ${c.table.title}</span><span class="pill light mono">${c.perfilCode}</span></div>
      <table class="dtbl"><thead><tr>${c.table.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${c.table.rows.map((r, i) => `<tr${i % 2 ? ' class="alt"' : ''}>${r.map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table>
    </div>` : '';
  const rules = c.keyPoints.map(k => `<span>▸ ${k}</span>`).join('');

  const contexto = c.contexto
    ? `<div class="contexto"><span class="contexto-tag">¿Por qué?</span><p>${c.contexto}</p></div>` : '';
  const watch = c.classId
    ? `<a class="lnk" href="${SITE.clase(c.classId)}">▶&nbsp;Ver masterclass de este tema</a>` : '';
  const moreQ = c.classId
    ? `<a class="lnk ghost" href="${SITE.preguntas(c.classId)}">Más preguntas online de ${c.title.split(':')[0].split('(')[0].trim()} →</a>` : '';

  const qbank = `
    <div class="qbank">
      <div class="qbank-head"><span>Banco de autoevaluación EUNACOM · Tema ${c.topicLabel}</span><span class="qbank-note">Solucionario razonado al final del libro</span></div>
      <div class="qbank-body">
        ${c.questions.map((q, i) => `<div class="q"><span class="q-tag">${stripTags(q.recTag || 'Reconstrucción oficial EUNACOM')}</span><p class="q-stem"><strong>${i + 1}.</strong> ${q.stem}</p><div class="q-opts">${q.options.map(o => `${o.id}) ${o.text}`).join('<br>')}</div></div>`).join('')}
      </div>
      ${moreQ ? `<div class="qbank-foot">${moreQ}</div>` : ''}
    </div>`;

  return sec(x, `Bloque ${CN(b.bn)} · Tema ${c.topicLabel}`, `
    <div class="topic-title">
      <h2>${c.topicLabel}. ${c.title}</h2><div class="rule"></div>
    </div>
    ${watch ? `<div class="watch-row">${watch}</div>` : ''}
    ${contexto}
    <div class="prose">${prose}</div>
    ${figureBlock(c, x)}
    ${algoCard}
    ${tbl}
    <div class="case-row">
      <div class="case">
        <div class="case-head"><span>Caso clínico tipo EUNACOM</span><span class="mono">${c.topicLabel}</span></div>
        <div class="case-body"><p>${c.vignette}</p><p class="conducta"><strong>Conducta oficial. </strong>${c.explicacion}</p></div>
      </div>
      <div class="rules"><div class="rules-head">Reglas de oro del examen</div><div class="rules-body">${rules}</div></div>
    </div>
    ${qbank}
  `);
}

function synthesisPage(b, x) {
  const synthRows = b.classes.map((c, i) => {
    const hallazgo = truncate(c.keyPoints[0], 88);
    const conducta = truncate(c.keyPoints[1] || firstSentence(c.explicacion), 88);
    const trapRaw = [...c.keyPoints.slice(2), c.explicacion, ...c.keyPoints].map(stripTags).find(s => TRAP_RE.test(s));
    let err = trapRaw ? truncate(trapRaw, 88) : '—';
    if (err === hallazgo || err === conducta) err = '—';
    return `<tr${i % 2 ? ' class="alt"' : ''}><td><strong>${c.title}</strong></td><td>${hallazgo}</td><td class="do">${conducta}</td><td class="err">${err}</td></tr>`;
  }).join('');
  const cifraGrid = extractCifras(b.classes.flatMap(c => c.keyPoints)).map(v => `<div class="cifra"><span class="cifra-n">${v.val}</span><span class="cifra-t">${v.label}</span></div>`).join('');
  const mnemoList = extractMnemos(b.classes.flatMap(c => c.keyPoints)).map(m => `<div>${m.name ? `<strong>${m.name} — </strong>` : ''}${m.expl}</div>`).join('');
  const ges = b.classes.filter(c => /ges|urgencia|garant/i.test(c.ges)).slice(0, 3).map(c => `<div class="ges-item"><span class="ges-t">${truncate(c.ges, 46)}</span><span class="ges-d">Tema ${c.topicLabel} · ${c.title} · código ${c.perfilCode}</span></div>`).join('');
  const chk = b.classes.map(c => `<div class="chk-item">${truncate(c.keyPoints[0], 96)} <span class="chk-ref">→ ${c.topicLabel}</span></div>`).join('');
  return sec(x, `Síntesis · Bloque ${CN(b.bn)}`, `
    <div class="synth-title">
      <h2>Síntesis operativa: qué responder en el examen</h2>
      <span class="pill outline">Repaso de 10 minutos</span>
    </div>
    <div class="rule"></div>
    <div class="card">
      <div class="card-head navy"><span>Tabla ${b.bn}.S · Conducta obligatoria por escenario clínico</span><span class="pill light mono">temas ${b.classes[0].topicLabel} a ${b.classes[b.classes.length - 1].topicLabel}</span></div>
      <table class="dtbl"><thead><tr><th>Escenario</th><th>Hallazgo decisivo</th><th>Conducta de 1.ª línea</th><th>Error que anula la respuesta</th></tr></thead><tbody>${synthRows}</tbody></table>
    </div>
    <div class="synth-two">
      <div class="card"><div class="card-head grey"><span>Cifras que se preguntan literalmente</span></div><div class="cifra-grid">${cifraGrid || '<div class="cifra"><span class="cifra-t">Sin cifras numéricas destacadas.</span></div>'}</div></div>
      <div class="card card-accent"><div class="card-head"><span>Reglas y mnemotecnias del bloque</span></div><div class="mnemo">${mnemoList}</div></div>
    </div>
    ${ges ? `<div class="card"><div class="card-head grey"><span>Cobertura GES del bloque</span><span class="pill plain">Garantías explícitas aplicables</span></div><div class="ges-grid">${ges}</div></div>` : ''}
    <div class="card"><div class="card-head dark"><span>Autochequeo final · si no puedes responder esto, vuelve al tema indicado</span></div><div class="chk-grid">${chk}</div></div>
  `);
}

function solucionarioPages(x) {
  let qn = 0;
  const cards = x.data.flatMap(c => c.questions.map(q => {
    qn++;
    const opt = (q.options.find(o => o.id === q.correcta) || {}).text || '';
    const sen = sentences(q.explicacion);
    const perla = sen.length > 1 ? sen.pop() : '';
    const isTrap = TRAP_RE.test(perla);
    return `
      <div class="sol-card">
        <div class="sol-card-head"><span class="mono">TEMA ${c.topicLabel} · PREGUNTA ${qn}</span><span class="mono light">${stripTags(q.recTag || '')}</span></div>
        <div class="sol-card-body">
          <p class="sol-recap">${truncate(q.stem, 120)}</p>
          <div class="sol-clave"><span class="sol-pill">Clave ${q.correcta}</span><span class="sol-opt">${opt}</span></div>
          <p class="sol-just">${sen.join(' ')}</p>
          ${perla ? `<p class="sol-perla${isTrap ? ' trap' : ''}"><strong>${isTrap ? 'Trampa. ' : 'Perla. '}</strong>${perla}</p>` : ''}
        </div>
      </div>`;
  })).join('');
  return sec(x, 'Solucionario razonado', `
    <div class="pg-lead">
      <h2>Solucionario &amp; Justificaciones Razonadas EUNACOM</h2>
      <p class="pg-lead-p">Clave oficial y justificación clínica de cada reconstrucción. Las preguntas se presentan sin clave en la página del tema; aquí se resuelven con la perla de examen correspondiente.</p>
      <div class="rule green"></div>
    </div>
    <div class="sol-grid">${cards}</div>
  `, { green: true });
}

/* ───────────────────────────── document ───────────────────────────── */

function buildHtml(x) {
  const t = themeVars(x.spec.accent);
  const body = [
    coverPage(x), indexPage(x),
    ...x.blocks.flatMap(b => [chapterOpener(b, x), ...b.classes.map(c => topicPage(c, b, x)), synthesisPage(b, x)]),
    solucionarioPages(x),
  ].join('\n');

  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;700&family=Spectral:wght@400;600;700&display=swap');
:root{--acc:${t.acc};--acc-d:${t.accD};--acc-dp:${t.accDp};--acc-t:${t.accT};--acc-p:${t.accP};--acc-l:${t.accL};--acc-ink:${t.accInk}}
*{box-sizing:border-box;margin:0;padding:0}
@page{size:A4;margin:0 0 22px}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:'IBM Plex Sans',system-ui,sans-serif;color:#15181d;font-size:10.2px;line-height:1.5;background:#fff}

/* cada sección = una tabla; el <thead> (banda de color) se repite en cada página */
.secwrap{width:794px;border-collapse:collapse;table-layout:fixed;page-break-after:always}
.secwrap:last-child{page-break-after:auto}
.secwrap thead{display:table-header-group}
.secwrap>thead>tr>td{padding:0}
.gbar{height:22px;background:var(--acc);-webkit-print-color-adjust:exact;display:flex;align-items:center;justify-content:center;
  font:700 8.5px/1 'IBM Plex Sans',sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#fff7ed}
.gbar.green{background:#166534}
.secbody{padding:18px 42px 14px;vertical-align:top}
.secbody.flush{padding:0}
.watch-row{margin-top:8px}

.eyebrow{display:block;font:600 9px/1.3 'IBM Plex Sans',sans-serif;letter-spacing:.18em;text-transform:uppercase;color:var(--acc-d)}
.mono{font-family:'JetBrains Mono',monospace}
.rule{height:3px;background:var(--acc);margin-top:8px}
.rule.green{background:#166534}
.pg-lead h2{font:700 25px/1.15 'Spectral',serif;letter-spacing:-.01em;margin-top:3px}
.pg-lead-p{font:400 10.2px/1.5 'IBM Plex Sans',sans-serif;color:#475569;max-width:640px;margin-top:6px}

/* COVER */
.cover{position:relative;background:#0f172a;color:#fff;height:1079px;overflow:hidden}
.cover-spine{position:absolute;left:0;top:0;bottom:0;width:38px;background:var(--acc);display:flex;align-items:center;justify-content:center}
.cover-spine span{font:700 10px/1 'IBM Plex Sans',sans-serif;letter-spacing:.32em;text-transform:uppercase;color:var(--acc-t);writing-mode:vertical-rl;transform:rotate(180deg)}
.cover-inner{position:absolute;inset:0 0 0 38px;padding:54px 58px 46px;display:flex;flex-direction:column}
.cover-top{display:flex;justify-content:space-between;align-items:flex-start}
.cover-eyebrow{display:flex;flex-direction:column;gap:6px}
.cover-eyebrow .l1{font:700 12px/1 'IBM Plex Sans',sans-serif;letter-spacing:.24em;text-transform:uppercase;color:var(--acc-l)}
.cover-eyebrow .l2{font:400 10px/1 'IBM Plex Sans',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#94a3b8}
.cover-codebox{border:1px solid #334155;padding:8px 12px;display:flex;flex-direction:column;gap:3px;align-items:flex-end}
.cover-codebox .k{font:400 8px/1 'JetBrains Mono',monospace;letter-spacing:.1em;color:#94a3b8}
.cover-codebox .v{font:700 9.5px/1 'IBM Plex Sans',sans-serif;letter-spacing:.08em;text-transform:uppercase}
.cover-hero{margin-top:104px;display:flex;flex-direction:column;gap:16px}
.cover-numrow{display:flex;align-items:flex-end;gap:22px}
.bignum{font:700 144px/.8 'Barlow Condensed',sans-serif;color:var(--acc);letter-spacing:-.02em}
.cover-numlabel{display:flex;flex-direction:column;gap:4px;padding-bottom:14px}
.cover-numlabel .k{font:600 10px/1 'IBM Plex Sans',sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#94a3b8}
.cover-numlabel .v{font:700 42px/.9 'Barlow Condensed',sans-serif;color:#475569}
.cover h1{font:700 72px/.95 'Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:-.01em}
.cover-rule{height:4px;width:300px;background:var(--acc)}
.cover-desc{max-width:540px;font:400 13px/1.55 'IBM Plex Sans',sans-serif;color:#cbd5e1}
.cover-foot{margin-top:auto;display:flex;flex-direction:column;gap:16px}
.cover-stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:#1e293b;border:1px solid #1e293b}
.cover-stats>div{background:#0f172a;padding:12px 14px;display:flex;flex-direction:column;gap:4px}
.cover-stats .n{font:700 26px/1 'Barlow Condensed',sans-serif;color:var(--acc-l)}
.cover-stats .t{font:400 9px/1.3 'IBM Plex Sans',sans-serif;letter-spacing:.05em;text-transform:uppercase;color:#94a3b8}
.cover-foot-row{display:flex;justify-content:space-between;align-items:flex-end;gap:24px}
.cover-foot-row span{font:400 9px/1.5 'IBM Plex Sans',sans-serif;color:#64748b;max-width:430px}
.cover-foot-row .brand{font:700 10px/1.4 'IBM Plex Sans',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#fff;text-align:right}
.cover-foot-row .brand em{font-weight:400;font-style:normal;color:#64748b}

/* ÍNDICE */
.idx-chap{margin-top:18px}
.idx-chap-head{display:flex;align-items:baseline;gap:12px}
.idx-cn{font:700 26px/1 'Barlow Condensed',sans-serif;color:var(--acc);width:34px;flex:none}
.idx-ct{flex:1;font:700 13px/1.3 'IBM Plex Sans',sans-serif}
.idx-cp{font:700 12px/1 'JetBrains Mono',monospace;color:#1e3a8a}
.idx-topics{display:flex;flex-direction:column;gap:3px;padding-left:46px;margin-top:5px}
.idx-t{display:flex;align-items:baseline;gap:8px;font:400 11px/1.5 'IBM Plex Sans',sans-serif}
.idx-dots{flex:1;border-bottom:1px dotted #cbd5e1;position:relative;top:-3px}
.idx-tp{font:400 10px/1 'JetBrains Mono',monospace;color:#475569}
.idx-sol{margin-top:20px;display:flex;align-items:baseline;gap:12px;background:#f1f5f9;padding:9px 12px;border-left:3px solid #16a34a}
.idx-sol-t{flex:1;font:700 12px/1.3 'IBM Plex Sans',sans-serif}
.idx-sol-p{font:700 12px/1 'JetBrains Mono',monospace;color:#166534}

/* CARDS */
.card{border:1px solid #cbd5e1;margin-top:12px;break-inside:avoid}
.card-accent{border-top:3px solid var(--acc)}
.card-head{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:6px 12px;background:var(--acc-t);border-bottom:1px solid var(--acc-p);font:700 9.5px/1.25 'IBM Plex Sans',sans-serif;letter-spacing:.07em;text-transform:uppercase;color:var(--acc-dp)}
.card-head.navy{background:#1e3a8a;border-bottom:none;color:#fff}
.card-head.grey{background:#f8fafc;border-bottom:1px solid #cbd5e1;color:#334155}
.card-head.dark{background:#1e293b;border-bottom:none;color:#fff}
.pill{font:700 8px/1 'IBM Plex Sans',sans-serif;letter-spacing:.08em;text-transform:uppercase;padding:4px 8px;border-radius:2px;white-space:nowrap}
.pill.dark{background:var(--acc-dp);color:#fff}
.pill.light{background:#fff;color:#1e3a8a}
.pill.plain{background:transparent;color:#64748b;padding:0;font-weight:600}
.pill.outline{background:var(--acc-t);border:1px solid var(--acc-p);color:var(--acc-dp)}
.pill.mono{font-family:'JetBrains Mono',monospace;letter-spacing:.02em}
.card-body-p{padding:9px 12px;font:400 10px/1.5 'IBM Plex Sans',sans-serif;text-align:justify;hyphens:auto}
.dtbl{width:100%;border-collapse:collapse;font-size:9px}
.dtbl th{text-align:left;padding:4.5px 8px;font:700 8px/1.2 'IBM Plex Sans',sans-serif;letter-spacing:.05em;text-transform:uppercase;color:#1e3a8a;background:#e2e8f0}
.dtbl td{padding:4.5px 8px;border-bottom:1px solid #eef2f6;vertical-align:top;line-height:1.35}
.dtbl tr.alt td{background:#f1f5f9}
.dtbl td.mono{font-family:'JetBrains Mono',monospace;font-size:8px}
.dtbl td.ges{color:#1e3a8a;font-weight:600}
.dtbl td.do{font-weight:600}
.dtbl td.err{color:#991b1b}

/* PORTADILLA */
.op-title{display:flex;align-items:flex-start;gap:18px}
.op-num{font:700 58px/.9 'Barlow Condensed',sans-serif;color:var(--acc)}
.op-title h1{font:700 25px/1.15 'IBM Plex Sans',sans-serif;letter-spacing:-.02em;max-width:600px;margin-top:2px}
.hist-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:#e2e8f0}
.hist-item{background:#fff;padding:6px 10px;display:flex;flex-direction:column;gap:2px}
.hist-tag{font:700 8px/1 'JetBrains Mono',monospace;color:var(--acc)}
.hist-txt{font:400 9.5px/1.35 'IBM Plex Sans',sans-serif}
.concept-list{display:flex;flex-direction:column}
.concept{padding:7px 12px;border-bottom:1px solid #eef2f6;font:400 10px/1.45 'IBM Plex Sans',sans-serif}
.concept:last-child{border-bottom:none}
.concept.trap{background:#fef2f2;color:#991b1b;border-bottom-color:#fecaca}
.concept.trap strong{font-size:8.5px;letter-spacing:.08em;text-transform:uppercase}

/* TEMA */
.topic-title h2{font:700 20px/1.2 'IBM Plex Sans',sans-serif;letter-spacing:-.02em;margin-top:3px}
.topic-eyebrow{display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding-right:150px}
.lnk{font:700 8px/1.3 'IBM Plex Sans',sans-serif;letter-spacing:.04em;text-transform:uppercase;color:#fff;background:var(--acc);padding:4px 9px;border-radius:3px;text-decoration:none;white-space:nowrap}
.lnk.ghost{background:transparent;color:var(--acc-d);border:1px solid var(--acc-p);text-transform:none;letter-spacing:.01em}
.contexto{margin-top:10px;border-left:3px solid var(--acc);background:var(--acc-t);padding:7px 12px;break-inside:avoid}
.contexto-tag{font:700 8px/1 'IBM Plex Sans',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--acc-dp)}
.contexto p{margin-top:3px;font:400 9.6px/1.5 'IBM Plex Sans',sans-serif;color:#334155;text-align:justify}
.qbank-foot{border:1px solid #cbd5e1;border-top:none;padding:7px 10px;display:flex;justify-content:flex-end}
.prose{padding:14px 0 0;column-count:2;column-gap:22px;font:400 10.2px/1.5 'IBM Plex Sans',sans-serif;text-align:justify;hyphens:auto}
.prose h3{font:700 9px/1.3 'IBM Plex Sans',sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--acc-d);margin:10px 0 5px;break-after:avoid}
.prose h3:first-child{margin-top:0}
.prose p{margin:0 0 8px}
.prose strong{color:#1e3a8a}
.figblock{margin:14px 0 4px;break-inside:avoid}
.figblock.full{column-span:all;-webkit-column-span:all}
.figrow{display:flex;flex-wrap:wrap;gap:14px 16px;justify-content:center;align-items:flex-end}
.figrow .fx{margin:0;display:flex;flex-direction:column;gap:5px;align-items:center;max-width:100%}
.figrow .fx img{display:block;width:auto;height:auto;max-width:100%;border:1px solid #e2e8f0;border-radius:3px;background:#fff}
.figblock.full .fx img{max-height:340px}
.figblock.wide .fx img{max-height:250px}
.figrow .fx figcaption{font:600 7.6px/1.3 'IBM Plex Sans',sans-serif;letter-spacing:.03em;text-transform:uppercase;color:#64748b;text-align:center;max-width:280px}
.figrow .fx figcaption b{color:#1e3a8a}
.figcap{margin-top:8px;font:400 8.8px/1.45 'IBM Plex Sans',sans-serif;color:#334155;text-align:justify}
.figcap b{color:var(--acc-d);font-weight:700}
.figblock.full .figcap{max-width:720px;margin-left:auto;margin-right:auto}
.algo-card{border:1px solid #cbd5e1;margin:14px 0 4px;column-span:all;-webkit-column-span:all;break-inside:avoid}
.algo-head{padding:6px 12px;background:#f1f5f9;border-bottom:1px solid #cbd5e1;font:700 9.5px/1.25 'IBM Plex Sans',sans-serif;letter-spacing:.07em;text-transform:uppercase;color:#1e3a8a}
.algo-body{padding:10px 12px;display:flex;justify-content:center}
.algo-body svg{width:100%!important;max-width:100%!important;height:auto!important;display:block}
.tbl-card{break-inside:avoid;margin-top:12px}
.case-row{display:flex;gap:14px;margin-top:12px;break-inside:avoid}
.case{flex:1.35;border:1px solid #cbd5e1;border-left:4px solid #1e3a8a;display:flex;flex-direction:column}
.case-head{display:flex;justify-content:space-between;padding:5px 10px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font:700 9px/1 'IBM Plex Sans',sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#1e3a8a}
.case-head .mono{color:#64748b}
.case-body{padding:8px 10px;display:flex;flex-direction:column;gap:5px}
.case-body p{font:400 9.6px/1.45 'IBM Plex Sans',sans-serif;text-align:justify}
.case-body .conducta{color:#334155}
.case-body .conducta strong{color:var(--acc-d)}
.rules{flex:1;border:1px solid var(--acc-p);background:var(--acc-t);display:flex;flex-direction:column}
.rules-head{padding:5px 10px;border-bottom:1px solid var(--acc-p);font:700 9px/1 'IBM Plex Sans',sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--acc-dp)}
.rules-body{padding:8px 10px;display:flex;flex-direction:column;gap:4px;font:400 9.4px/1.4 'IBM Plex Sans',sans-serif;color:var(--acc-ink)}
.qbank{margin-top:12px;break-inside:avoid}
.qbank-head{display:flex;justify-content:space-between;align-items:center;padding:5px 10px;background:#1e293b;font:700 9px/1 'IBM Plex Sans',sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#fff}
.qbank-note{font-weight:600;font-size:8px;color:#94a3b8}
.qbank-body{display:flex;gap:14px;border:1px solid #cbd5e1;border-top:none;padding:9px 10px}
.q{flex:1;display:flex;flex-direction:column;gap:3px}
.q-tag{font:700 8px/1 'JetBrains Mono',monospace;color:var(--acc)}
.q-stem{font:400 9.6px/1.4 'IBM Plex Sans',sans-serif;text-align:justify}
.q-opts{font:400 9.2px/1.5 'IBM Plex Sans',sans-serif;color:#334155}

/* SÍNTESIS */
.synth-title{display:flex;justify-content:space-between;align-items:flex-end;gap:16px}
.synth-title h2{font:700 20px/1.2 'IBM Plex Sans',sans-serif;letter-spacing:-.02em;margin-top:3px}
.synth-two{display:flex;gap:12px;align-items:flex-start}
.synth-two .card{flex:1;margin-top:12px}
.cifra-grid{padding:8px 10px;display:grid;grid-template-columns:1fr 1fr;gap:8px}
.cifra{display:flex;flex-direction:column}
.cifra-n{font:700 16px/1.1 'Barlow Condensed',sans-serif;color:#1e3a8a}
.cifra-t{font:400 8.8px/1.3 'IBM Plex Sans',sans-serif;color:#475569}
.mnemo{padding:8px 10px;display:flex;flex-direction:column;gap:6px;font:400 9.6px/1.4 'IBM Plex Sans',sans-serif;color:var(--acc-ink)}
.ges-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:#e2e8f0}
.ges-item{background:#fff;padding:7px 10px;display:flex;flex-direction:column;gap:2px}
.ges-t{font:700 9px/1.2 'IBM Plex Sans',sans-serif;color:#1e3a8a}
.ges-d{font:400 8.6px/1.3 'IBM Plex Sans',sans-serif;color:#475569}
.chk-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:#e2e8f0}
.chk-item{background:#fff;padding:6px 10px;font:400 9.4px/1.4 'IBM Plex Sans',sans-serif}
.chk-ref{font:400 8px/1 'JetBrains Mono',monospace;color:var(--acc)}

/* SOLUCIONARIO */
.sol-grid{margin-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:12px;align-content:start}
.sol-card{border:1px solid #cbd5e1;display:flex;flex-direction:column;break-inside:avoid}
.sol-card-head{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:5px 10px;background:#f8fafc;border-bottom:1px solid #cbd5e1;font:700 8.5px/1.2 'JetBrains Mono',monospace;color:#334155}
.sol-card-head .light{color:#64748b;font-weight:400;font-size:8px}
.sol-card-body{padding:8px 10px;display:flex;flex-direction:column;gap:6px}
.sol-recap{font:400 9.4px/1.4 'IBM Plex Sans',sans-serif;color:#475569}
.sol-clave{display:flex;align-items:center;gap:8px}
.sol-pill{font:700 9px/1 'IBM Plex Sans',sans-serif;letter-spacing:.08em;text-transform:uppercase;background:#dcfce7;color:#166534;border:1px solid #86efac;padding:4px 8px;border-radius:999px;white-space:nowrap}
.sol-opt{font:600 9.4px/1.3 'IBM Plex Sans',sans-serif}
.sol-just{font:400 9.6px/1.45 'IBM Plex Sans',sans-serif}
.sol-perla{background:var(--acc-t);border-left:3px solid var(--acc);padding:5px 8px;font:400 9.2px/1.4 'IBM Plex Sans',sans-serif;color:var(--acc-ink)}
.sol-perla.trap{background:#fef2f2;border-left-color:#b91c1c;color:#7f1d1d}
</style></head><body>
${body}
</body></html>`;
}

/* ───────────────────────────── render ───────────────────────────── */

async function compressImage(browser, file, crop, maxW = 1180) {
  const ext = path.extname(file).toLowerCase();
  const mime = ext === '.png' ? 'png' : 'jpeg';
  const raw = `data:image/${mime};base64,${fs.readFileSync(file).toString('base64')}`;
  const pg = await browser.newPage();
  try {
    return await pg.evaluate(async (src, maxW, crop) => {
      const img = new Image(); img.src = src; await img.decode();
      const W = img.naturalWidth, H = img.naturalHeight;
      let sx = 0, sy = 0, sw = W, sh = H;
      if (crop && crop.length === 4) {
        sx = Math.round(W * crop[0] / 100); sy = Math.round(H * crop[1] / 100);
        sw = Math.round(W * crop[2] / 100); sh = Math.round(H * crop[3] / 100);
      } else {
        const probe = document.createElement('canvas'); probe.width = W; probe.height = H;
        const pc = probe.getContext('2d'); pc.drawImage(img, 0, 0);
        let x0 = W, y0 = H, x1 = 0, y1 = 0;
        try {
          const d = pc.getImageData(0, 0, W, H).data;
          for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) {
            const i = (y * W + x) * 4;
            if (d[i + 3] > 8 && (d[i] < 244 || d[i + 1] < 244 || d[i + 2] < 244)) {
              if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
            }
          }
        } catch (e) { x0 = 0; y0 = 0; x1 = W; y1 = H; }
        if (x1 - x0 > W * 0.25 && y1 - y0 > H * 0.15) {
          const pad = Math.round(Math.min(W, H) * 0.012);
          sx = Math.max(0, x0 - pad); sy = Math.max(0, y0 - pad);
          sw = Math.min(W, x1 + pad) - sx; sh = Math.min(H, y1 + pad) - sy;
        }
      }
      const scale = Math.min(1, maxW / sw);
      const c = document.createElement('canvas');
      c.width = Math.round(sw * scale); c.height = Math.round(sh * scale);
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
      return c.toDataURL('image/jpeg', 0.82);
    }, raw, maxW, crop);
  } catch (e) { return raw; } finally { await pg.close(); }
}

function figJobs(figSpec, figDir) {
  const jobs = [];
  Object.values(figSpec).forEach(spec => spec.items.forEach(it => {
    const p = path.join(figDir, it.file);
    if (fs.existsSync(p)) jobs.push({ key: it.file, path: p, crop: it.crop || spec.crop || null });
  }));
  return jobs;
}

async function buildBook(spec, browser) {
  const t = themeVars(spec.accent);
  const data = spec.dataset();
  const figSpec = spec.figSpec || {};
  const meta = prepare(data, figSpec);
  const x = { spec: { ...spec, accent: spec.accent }, data, figSpec, figMap: new Map(), ...meta };

  const jobs = figSpec && spec.figDir ? figJobs(figSpec, spec.figDir) : [];
  for (const j of jobs) x.figMap.set(j.key, await compressImage(browser, j.path, j.crop));

  const html = buildHtml(x);
  fs.writeFileSync(path.join(__dirname, `temp_maqueta_${spec.key}.html`), html);

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 180000 });
  await page.evaluateHandle('document.fonts.ready');
  const pdf = await page.pdf({
    format: 'A4', printBackground: true, displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `<div style="width:100%;font:600 7px 'Helvetica',Arial,sans-serif;color:#9aa3af;text-align:center;"><span class="pageNumber"></span></div>`,
    margin: { top: '0', bottom: '18px', left: '0', right: '0' },
  });
  await page.close();

  const outMain = path.join(LIBRO_DIR, spec.moduleDir, spec.out || `Manual_EUNACOM_${spec.title.replace(/\s+/g, '_')}_Completo_2026.pdf`);
  const outs = [outMain];
  if (spec.publicOut) outs.push(spec.publicOut);
  for (const out of outs) {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const targets = [out, out.replace(/\.pdf$/, '_NEW.pdf'), out.replace(/\.pdf$/, `_${Date.now()}.pdf`)];
    let done = false;
    for (const tp of targets) {
      try { fs.writeFileSync(tp, pdf); console.log(tp === out ? '     ✓' : '     ✓ (bloqueado → )', tp); done = true; break; } catch (e) {}
    }
    if (!done) console.warn('     ⚠ no se pudo escribir', out);
  }
  console.log(`     ${data.length} clases · ${meta.totalQuestions} preguntas · ${(pdf.length / 1e6).toFixed(1)} MB · color ${spec.accent}`);
}

async function main() {
  const arg = process.argv[2];
  const targets = SPECIALTIES
    .map(s => ({ ...s, accent: ACCENTS[s.key] || '#334155' }))
    .filter(s => !arg || s.key === arg);

  console.log('▶ MANUAL EUNACOM · compilador multi-especialidad (Maqueta 1b)\n');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });

  for (const spec of targets) {
    if (!spec.dataset) {
      console.log(`  ⏭  ${spec.title.padEnd(28)} pendiente — falta dataset estructurado (scripts/dataset_${spec.key}.cjs)`);
      continue;
    }
    console.log(`  ▶  ${spec.title.padEnd(28)} [${spec.accent}]`);
    try { await buildBook(spec, browser); } catch (e) { console.error(`     ✗ ${e.message}`); }
  }
  await browser.close();
  console.log('\n✔ Fin.');
}

main().catch(e => { console.error(e); process.exit(1); });
