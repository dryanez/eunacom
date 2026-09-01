const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const app = express();
const PORT = process.env.PORT || 4321;
const VAULT_PATH = process.env.VAULT_PATH || "/Users/felipeyanez/Desktop/NEWeunacom/os";
const JSON_CACHE = path.join(VAULT_PATH, "cached_instagram.json");
const SCRIPTS_DIR = path.join(__dirname, "scripts");
const QUESTION_DB_PATH = path.join(__dirname, "../eunacom-mobile/public/data/questionDB.json");

// Load and index 6,099 EUNACOM questions from database
let questionDB = [];
try {
  if (fs.existsSync(QUESTION_DB_PATH)) {
    questionDB = JSON.parse(fs.readFileSync(QUESTION_DB_PATH, "utf-8"));
    console.log(`✅ Loaded ${questionDB.length} official EUNACOM questions from questionDB.json`);
  }
} catch (e) {
  console.warn("⚠️ Could not load questionDB.json:", e.message);
}

function getRandomQuestionByTopic(topicKeyword) {
  if (!questionDB || questionDB.length === 0) return null;
  if (!topicKeyword) return questionDB[Math.floor(Math.random() * questionDB.length)];
  const filtered = questionDB.filter(q => 
    (q.topic && q.topic.toLowerCase().includes(topicKeyword.toLowerCase())) ||
    (q.tags && q.tags.toLowerCase().includes(topicKeyword.toLowerCase()))
  );
  if (filtered.length > 0) return filtered[Math.floor(Math.random() * filtered.length)];
  return questionDB[Math.floor(Math.random() * questionDB.length)];
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// The Obsidian vault is a local-only convenience, not a requirement. When it's
// absent (any hosted environment) the studio still runs: reads fall back to a
// committed snapshot and writes report as unavailable instead of crashing.
function detectVault() {
  try {
    if (!fs.existsSync(VAULT_PATH)) return false;
    fs.accessSync(VAULT_PATH, fs.constants.R_OK | fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}
const VAULT_ENABLED = process.env.VAULT_ENABLED === "0" ? false : detectVault();

// Snapshot shipped with the app so the hosted build still has real outlier data
const SNAPSHOT_CACHE = path.join(__dirname, "data", "cached_instagram.json");

// Guard for endpoints that genuinely need a writable local vault
function requireVault(res) {
  if (VAULT_ENABLED) return true;
  res.status(503).json({
    error: "Esta función requiere el vault local de Obsidian",
    vault_enabled: false,
    hint: "Ejecuta el estudio localmente para guardar en el vault."
  });
  return false;
}

// Resolve a caller-supplied path and refuse anything outside the vault.
// Without this, ?path=../.env walked straight out and returned repo secrets.
const VAULT_ROOT = path.resolve(VAULT_PATH);
function resolveInsideVault(relPath) {
  if (typeof relPath !== "string" || !relPath) return null;
  if (relPath.includes("\0")) return null;
  const full = path.resolve(VAULT_ROOT, relPath);
  if (full !== VAULT_ROOT && !full.startsWith(VAULT_ROOT + path.sep)) return null;
  return full;
}

const CTA_MAP = {
  clinical_quiz: "TRAMPAS",
  traps_asofamech: "TRAMPAS",
  visual_algorithm: "ALGORITMO",
  chilean_lingo: "DICCIONARIO",
  salary_cesfam: "SUELDOS",
  radar_burocratico: "FECHAS",
  active_recall_famed: "FAMED"
};

// Helper to read cached data. Prefers the live vault cache, falls back to the
// committed snapshot so a hosted instance is not empty.
function getCachedData() {
  const sources = VAULT_ENABLED ? [JSON_CACHE, SNAPSHOT_CACHE] : [SNAPSHOT_CACHE];
  for (const src of sources) {
    if (!fs.existsSync(src)) continue;
    try {
      return JSON.parse(fs.readFileSync(src, "utf-8"));
    } catch (e) {
      console.error(`Error reading cache ${src}:`, e.message);
    }
  }
  return { competitors: [], outliers: [], hook_formulas: [], weekly_sprint_matrix: [] };
}

// 1. Status endpoint
app.get("/api/status", (req, res) => {
  const data = getCachedData();
  res.json({
    status: "online",
    vault_enabled: VAULT_ENABLED,
    vault_path: VAULT_ENABLED ? VAULT_PATH : null,
    synced_at: data.synced_at || null,
    total_competitors: data.total_competitors || (data.competitors ? data.competitors.length : 0),
    total_outliers: data.total_outliers_identified || (data.outliers ? data.outliers.length : 0)
  });
});

// 2. Data endpoint with flexible filters
app.get("/api/data", (req, res) => {
  const { company, platform, pillar, archetype, min_score, search } = req.query;
  const data = getCachedData();

  let filteredOutliers = data.outliers || [];
  let filteredComps = data.competitors || [];

  if (company && company !== "all") {
    filteredOutliers = filteredOutliers.filter(o =>
      (o.company && o.company.toUpperCase() === company.toUpperCase()) ||
      (o.category && o.category.toUpperCase() === company.toUpperCase())
    );
    filteredComps = filteredComps.filter(c =>
      c.company && c.company.toUpperCase() === company.toUpperCase()
    );
  }

  if (platform && platform !== "all") {
    filteredOutliers = filteredOutliers.filter(o => (o.platform || "instagram").toLowerCase() === platform.toLowerCase());
  }

  if (archetype && archetype !== "all") {
    filteredOutliers = filteredOutliers.filter(o => o.archetype === archetype || o.pillar === archetype);
  } else if (pillar && pillar !== "all") {
    filteredOutliers = filteredOutliers.filter(o => o.pillar === pillar || o.archetype === pillar);
  }

  if (min_score) {
    const scoreVal = parseFloat(min_score);
    if (!isNaN(scoreVal)) {
      filteredOutliers = filteredOutliers.filter(o => (o.outlier_score || 1) >= scoreVal);
    }
  }

  if (search) {
    const s = search.toLowerCase();
    filteredOutliers = filteredOutliers.filter(o =>
      (o.hook_text && o.hook_text.toLowerCase().includes(s)) ||
      (o.competitor_name && o.competitor_name.toLowerCase().includes(s)) ||
      (o.competitor_handle && o.competitor_handle.toLowerCase().includes(s)) ||
      (o.archetype_label && o.archetype_label.toLowerCase().includes(s)) ||
      (o.caption && o.caption.toLowerCase().includes(s))
    );
  }

  res.json({
    synced_at: data.synced_at,
    total_posts: filteredOutliers.length,
    competitors: filteredComps,
    outliers: filteredOutliers,
    weekly_sprint_matrix: data.weekly_sprint_matrix || [],
    hook_formulas: data.hook_formulas || []
  });
});

// 3. Live Scraper Execution with Server-Sent Events (SSE)
app.get("/api/scrape/stream", (req, res) => {
  if (!requireVault(res)) return;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const company = req.query.company || "all";
  const scriptPath = path.join(SCRIPTS_DIR, "social_scraper.py");

  const sendLog = (msg, isDone = false) => {
    res.write(`data: ${JSON.stringify({ log: msg, done: isDone, timestamp: new Date().toISOString() })}\n\n`);
  };

  sendLog(`🚀 Starting Live Multi-Platform Scraper Engine [Company: ${company.toUpperCase()}]...`);

  const args = [scriptPath, "--output-json", JSON_CACHE];
  if (company && company !== "all") {
    args.push("--company", company);
  }

  const pyBin = fs.existsSync("/Users/felipeyanez/Documents/Archive/08_Business_Projects/Automation_and_Dev_Tools/command-center-plugin/.venv/bin/python")
    ? "/Users/felipeyanez/Documents/Archive/08_Business_Projects/Automation_and_Dev_Tools/command-center-plugin/.venv/bin/python"
    : "python3";

  const py = spawn(pyBin, args);

  py.stdout.on("data", (chunk) => {
    const lines = chunk.toString().split("\n").filter(l => l.trim().length > 0);
    lines.forEach(line => sendLog(line));
  });

  py.stderr.on("data", (chunk) => {
    const lines = chunk.toString().split("\n").filter(l => l.trim().length > 0);
    lines.forEach(line => sendLog(`⚠️ ${line}`));
  });

  py.on("close", (code) => {
    if (code === 0) {
      sendLog(`✅ Scrape completed successfully! Vault JSON & Markdown briefs updated.`, true);
    } else {
      sendLog(`❌ Scraper exited with code ${code}`, true);
    }
    res.end();
  });
});

// 4. Smart Weekly Content Planner & Optimizer Endpoint
app.post("/api/planner/generate-weekly-mix", (req, res) => {
  const { company = "EUNACOM" } = req.body;
  const data = getCachedData();
  const isFamed = company.toUpperCase() === "FAMED";

  const outliers = (data.outliers || []).filter(o => {
    if (company === "all") return true;
    const itemComp = (o.app || o.company || o.category || "").toUpperCase();
    return itemComp === company.toUpperCase();
  });

  // Dual-Company Schedule Matrix
  const eunacomSlots = [
    {
      day: "Lunes",
      day_index: 1,
      time_slot: "20:30 CLT (Peak Retención Médicos en Turno)",
      archetype: "clinical_quiz",
      archetype_label: "🩺 Caso Clínico & Quiz EUNACOM",
      color: "cyan",
      format: "REEL (9:16 / 35s)",
      goal: "Ego clínico y comentarios masivos (A, B o C)",
      cta_type: "Practica más de 2,000 preguntas reales en eunacomapp.cl"
    },
    {
      day: "Martes",
      day_index: 2,
      time_slot: "13:30 CLT (Almuerzo Turno CESFAM)",
      archetype: "traps_asofamech",
      archetype_label: "⚠️ Trampa ASOFAMECH",
      color: "amber",
      format: "CARRUSEL (4:5 / 6 slides)",
      goal: "Loss Aversion: Evitar errores comunes en la pauta de corrección",
      cta_type: "Guarda este carrusel para tu próximo repaso"
    },
    {
      day: "Miércoles",
      day_index: 3,
      time_slot: "08:30 CLT (Apertura de Jornada)",
      archetype: "radar_burocratico",
      archetype_label: "🚨 Fechas & Requisitos Convalidación",
      color: "rose",
      format: "REEL / POST NOTICIOSO",
      goal: "FOMO burocrático y descargas de checklist",
      cta_type: "Comenta 'EUNACOM' para recibir el simulacro diagnóstico gratis"
    },
    {
      day: "Jueves",
      day_index: 4,
      time_slot: "21:00 CLT (Sesión Nocturna de Estudio)",
      archetype: "visual_algorithm",
      archetype_label: "🧠 Algoritmo de 1-Página",
      color: "purple",
      format: "CARRUSEL (4:5 / Diagrama de Flujo)",
      goal: "Máxima tasa de Guardados (Saves) para el algoritmo",
      cta_type: "Guarda este algoritmo y entrena con repetición espaciada"
    },
    {
      day: "Viernes",
      day_index: 5,
      time_slot: "14:00 CLT (Relajación / Fin de Semana)",
      archetype: "chilean_lingo",
      archetype_label: "🇨🇱 Modismos Médicos en Chile",
      color: "blue",
      format: "REEL / MEME (9:16 / 25s)",
      goal: "Viralidad orgánica por compartidos en WhatsApp",
      cta_type: "Etiqueta al colega que siempre se confunde"
    },
    {
      day: "Sábado",
      day_index: 6,
      time_slot: "11:30 CLT (Aspiracional / Tiempo Libre)",
      archetype: "salary_cesfam",
      archetype_label: "💵 Sueldos CESFAM & Homologación",
      color: "emerald",
      format: "REEL (9:16 / 50s)",
      goal: "Venta del ROI: Motivación de convalidar y trabajar en Chile",
      cta_type: "Empieza hoy gratis en eunacomapp.cl"
    },
    {
      day: "Domingo",
      day_index: 7,
      time_slot: "20:00 CLT (Planificación de Estudio Semanal)",
      archetype: "active_recall_famed",
      archetype_label: "⚡ Método de Estudio Activo vs Pasivo",
      color: "pink",
      format: "REEL / DEMO APP",
      goal: "Optimización de hábitos y prueba del método",
      cta_type: "Prueba el sistema de simulacros cronometrados"
    }
  ];

  const famedSlots = [
    {
      day: "Lunes",
      day_index: 1,
      time_slot: "19:30 CET (Feierabend / Lernzeit)",
      archetype: "fsp_anamnese",
      archetype_label: "🇩🇪 FSP Anamnesegespräch",
      color: "cyan",
      format: "REEL (9:16 / 45s)",
      goal: "Dominio de preguntas clínicas en alemán con el paciente simulado",
      cta_type: "Entrena tu pronunciación médica con IA en famedtestprep.com"
    },
    {
      day: "Martes",
      day_index: 2,
      time_slot: "13:00 CET (Mittagspause)",
      archetype: "arztbrief_traps",
      archetype_label: "📝 Arztbrief & Dokumentation",
      color: "amber",
      format: "CARRUSEL (4:5 / 5 slides)",
      goal: "Estructura correcta del informe médico en 20 minutos sin errores gramaticales",
      cta_type: "Descarga la plantilla oficial del Arztbrief para FSP"
    },
    {
      day: "Miércoles",
      day_index: 3,
      time_slot: "08:00 CET (Guten Morgen / Pendeln)",
      archetype: "arzt_arzt_uebergabe",
      archetype_label: "🩺 Arzt-Arzt-Kommunikation",
      color: "purple",
      format: "REEL (9:16 / 40s)",
      goal: "Presentación clínica concisa del caso al médico jefe (Chefarzt)",
      cta_type: "Practica casos clínicos reales en alemán en famedtestprep.com"
    },
    {
      day: "Jueves",
      day_index: 4,
      time_slot: "20:30 CET (Abend-Fokus)",
      archetype: "fachbegriffe_vs_laien",
      archetype_label: "🧠 Fachbegriff vs. Laiensprache",
      color: "rose",
      format: "CARRUSEL (4:5 / Tabla de Vocabulario)",
      goal: "Máxima tasa de Guardados: Cómo traducir términos técnicos a lenguaje del paciente",
      cta_type: "Guarda este vocabulario médico esencial para la FSP"
    },
    {
      day: "Viernes",
      day_index: 5,
      time_slot: "16:00 CET (Wochenende)",
      archetype: "approbation_roadmap",
      archetype_label: "🏛️ Approbation & Hospitation Roadmap",
      color: "blue",
      format: "REEL / INFOGRAFÍA",
      goal: "Claridad en los trámites burocráticos ante la Landesprüfungsamt",
      cta_type: "Accede al plan de estudio de 30 días para la Approbation"
    },
    {
      day: "Sábado",
      day_index: 6,
      time_slot: "11:00 CET (Wochenend-Lernen)",
      archetype: "assistenzarzt_salary",
      archetype_label: "💵 Assistenzarzt Gehalt & Leben in DE",
      color: "emerald",
      format: "REEL (9:16 / 50s)",
      goal: "Motivación y ROI financiero de trabajar como médico en Alemania",
      cta_type: "Prepárate para la FSP desde €9.99 en famedtestprep.com"
    },
    {
      day: "Domingo",
      day_index: 7,
      time_slot: "19:00 CET (Wochenplanung)",
      archetype: "ai_speech_practice",
      archetype_label: "🎙️ Feedback de Pronunciación con IA",
      color: "pink",
      format: "REEL FACELESS / APP SCREEN",
      goal: "Demostración en vivo del analizador de voz de FaMED",
      cta_type: "Prueba gratis el evaluador de voz en famedtestprep.com"
    }
  ];

  const scheduleSlots = isFamed ? famedSlots : eunacomSlots;

  // Match each slot with the top viral outlier of that archetype or general top outlier
  const plan = scheduleSlots.map((slot, idx) => {
    let matched = outliers.filter(o => o.archetype === slot.archetype || o.pillar === slot.archetype);
    if (matched.length === 0) {
      matched = outliers.length > 0 ? [outliers[idx % outliers.length]] : [];
    }

    const topOutlier = matched[0] || (data.outliers && data.outliers[idx % (data.outliers.length || 1)]) || {
      competitor_handle: isFamed ? "famed_top" : "eunacom_top",
      competitor_name: isFamed ? "FaMED Medical Prep" : "EUNACOM Master",
      outlier_score: 5.2,
      hook_text: isFamed ? `Anamnese-Schlüsselfrage für die FSP Fachsprachprüfung` : `Pregunta clave de ${slot.archetype_label} que define tu aprobación`,
      url: isFamed ? "https://famedtestprep.com" : "https://www.eunacomapp.cl",
      why_converted: "Alto impacto visual y debate clínico inmediato."
    };

    return {
      ...slot,
      selected_outlier: topOutlier,
      recommended_hook: `🔥 [${slot.day}] ${topOutlier.hook_text ? topOutlier.hook_text.slice(0, 95) : slot.archetype_label}`,
      recording_action: `Grabar video de ${slot.format} respondiendo al ángulo de @${topOutlier.competitor_handle} (${topOutlier.outlier_score}x Outlier).`
    };
  });

  res.json({
    generated_at: new Date().toISOString(),
    target_company: company,
    total_days: plan.length,
    plan: plan
  });
});

// 5. Save Weekly Content Sprint directly to Obsidian
app.post("/api/planner/save-sprint", (req, res) => {
  if (!requireVault(res)) return;
  const { plan, company = "EUNACOM" } = req.body;
  if (!plan || !Array.isArray(plan)) {
    return res.status(400).json({ error: "Invalid plan data" });
  }

  const dateStr = new Date().toISOString().split("T")[0];
  const sprintPath = path.join(VAULT_PATH, "daily-briefs", `weekly-content-sprint-${dateStr}.md`);

  let md = `---
type: weekly-content-sprint
date: ${dateStr}
company: ${company}
status: in-production
---

# 🚀 7-Day High-Converting Content Production Sprint · ${company} (${dateStr})
*Generado automáticamente por el Smart Weekly Content Planner a partir de los Outliers virales analizados.*

---

## 📊 Matriz Semanal de Publicación & Horarios Óptimos

| Día | Horario Óptimo (CLP) | Arquetipo de Post | Formato | Outlier Benchmark | Meta Estratégica |
|---|---|---|---|---|---|
`;

  plan.forEach(item => {
    md += `| **${item.day}** | \`${item.time_slot}\` | **${item.archetype_label}** | \`${item.format}\` | [@${item.selected_outlier.competitor_handle} (${item.selected_outlier.outlier_score}x)](${item.selected_outlier.url}) | ${item.goal} |\n`;
  });

  md += `\n---\n\n## 📝 Guiones y Pautas de Grabación por Día\n\n`;

  plan.forEach((item, idx) => {
    md += `### 📅 Día ${idx + 1}: ${item.day} — ${item.archetype_label} (${item.time_slot})\n`;
    md += `- **Formato:** \`${item.format}\`\n`;
    md += `- **Objetivo de Conversión:** ${item.goal}\n`;
    md += `- **Llamado a la Acción (CTA):** *${item.cta_type}*\n`;
    md += `- **Outlier de Referencia:** [@${item.selected_outlier.competitor_handle}](${item.selected_outlier.url}) — **Multiplicador:** \`${item.selected_outlier.outlier_score}x\`\n`;
    md += `- **Gancho Principal Sugerido:**\n> "${item.recommended_hook}"\n`;
    md += `- **Pauta de Grabación:** ${item.recording_action}\n\n---\n\n`;
  });

  try {
    fs.writeFileSync(sprintPath, md, "utf-8");
    // Also save as active task
    const activePath = path.join(VAULT_PATH, "projects", "active-weekly-sprint.md");
    fs.writeFileSync(activePath, md, "utf-8");

    res.json({ success: true, file_path: sprintPath });
  } catch (err) {
    console.error("Error saving weekly sprint to Obsidian:", err);
    res.status(500).json({ error: "Failed to write sprint to vault" });
  }
});

// ── Cadence: 7 archetype slots, ordered Mon→Sun ────────────────────────────
const WEEKLY_SLOTS = [
  { day: "Lunes",     day_index: 1, archetype: "clinical_quiz",     time_cl: "20:30 CLST", time_de: "00:30 CET+1", weight: 2.0, cta: "TRAMPAS"     },
  { day: "Martes",    day_index: 2, archetype: "traps_asofamech",   time_cl: "13:30 CLST", time_de: "17:30 CET",   weight: 3.5, cta: "TRAMPAS"     },
  { day: "Miercoles", day_index: 3, archetype: "visual_algorithm",  time_cl: "13:00 CLST", time_de: "17:00 CET",   weight: 3.0, cta: "MODISMOS"    },
  { day: "Jueves",    day_index: 4, archetype: "clinical_quiz",     time_cl: "21:00 CLST", time_de: "01:00 CET+1", weight: 2.0, cta: "TRAMPAS"     },
  { day: "Viernes",   day_index: 5, archetype: "chilean_lingo",     time_cl: "14:00 CLST", time_de: "18:00 CET",   weight: 2.5, cta: "DICCIONARIO" },
  { day: "Sabado",    day_index: 6, archetype: "salary_cesfam",     time_cl: "11:30 CLST", time_de: "15:30 CET",   weight: 2.0, cta: "SUELDOS"     },
  { day: "Domingo",   day_index: 7, archetype: "radar_burocratico", time_cl: "18:00 CLST", time_de: "22:00 CET",   weight: 1.5, cta: "FECHAS"      }
];

// ── PICK_SCORE formula ─────────────────────────────────────────────────────
function calcPickScore(post, slotWeight) {
  const outlierScore  = (post.outlier_score || 1)   * 4.0;
  const likesScore    = ((post.likes || 0) / 1000)  * 1.5;
  const commentsScore = ((post.comments || 0) / 100)* 2.0;
  const savesScore    = ((post.saves_est || post.saves || 0) / 500) * 3.0;
  const carouselBonus = (post.media_type === "carousel" || post.format === "carousel") ? 1.5 : 0;
  return outlierScore + likesScore + commentsScore + savesScore + carouselBonus + (slotWeight || 0);
}

// ── Inline carousel blueprint generator ───────────────────────────────────
function buildCarouselBlueprint(post, ctaKeyword) {
    const arch = post.archetype || post.pillar || "clinical_quiz";
    const cleanArchLabel = (post.archetype_label || "").replace(/\s*\/.*$/, "").replace(/^[^\w\s]+/, "").trim() || "Caso Clínico";
    const hookTopic = post.hook_text ? post.hook_text.replace(/^[^\w\s]+/, "").slice(0, 50).trim() : cleanArchLabel;

    // Pull real clinical question from questionDB if available
    const realQ = getRandomQuestionByTopic(hookTopic) || getRandomQuestionByTopic("Medicina Interna") || (questionDB[0] || null);

    const hookOptions = [
      { type: "Loss Aversion",
        hook: arch === "chilean_lingo" ? `🇨🇱 3 Modismos Chilenos que NUNCA debes malinterpretar en el Box o EUNACOM (Desliza ➡️)` :
              arch === "salary_cesfam" ? `💵 ¿Cuánto gana realmente un médico en APS en Chile? Desglose 2026 (Desliza ➡️)` :
              arch === "radar_burocratico" ? `🚨 Calendario y Documentos Oficiales EUNACOM 2026 que debes tener listos (Guarda 🔖)` :
              arch === "visual_algorithm" ? `🧠 Algoritmo de 1-Página: Conducta GES inmediata ante ${hookTopic} (Guarda 🔖)` :
              `⚠️ 3 Trampas del EUNACOM en ${cleanArchLabel} que reprueban al 70% (Desliza ➡️)` },
      { type: "Cheat Sheet",
        hook: arch === "chilean_lingo" ? `🧠 Diccionario Médico Chileno: De expresión popular a Semiología Oficial ASOFAMECH (Guarda 🔖)` :
              arch === "salary_cesfam" ? `📊 Calculadora de Sueldo Médico APS 2026: Base + Zona + Turnos SAPU (Guarda 🔖)` :
              arch === "visual_algorithm" ? `📋 Cheat Sheet de 1-Página: Conducta GES en ${hookTopic} lista para imprimir (Guarda 🔖)` :
              `🧠 Algoritmo de 1-Página: Conducta GES inmediata ante ${hookTopic} (Guarda 🔖)` },
      { type: "Direct Challenge",
        hook: arch === "chilean_lingo" ? `🩺 El paciente te dice: "Doctor, tengo la guata aceda"... ¿Qué anotas en la ficha? (Slide 2)` :
              arch === "visual_algorithm" ? `❓ ¿En qué paso del algoritmo fallan el 80% de los postulantes? (Slide 2)` :
              `🩺 Caso Clínico ASOFAMECH: ¿Cuál es la conducta inicial prioritaria? (Solución en Slide 4)` }
    ];

    let sections;
    if (arch === "chilean_lingo") {
      sections = [
        { num: 1, timestamp: "Slide 1 (PORTADA)", label: "Slide 1 · Portada", bg: "navy", kind: "portada",
          tag: "DICCIONARIO MÉDICO CHILENO",
          title: "3 Modismos que debes dominar en el Box o EUNACOM",
          swipeCta: "DESLIZA →",
          visual_cue: "Fondo Navy (#1a2740) + Lockup eunacomapp.cl + DM Serif Display + Eyebrow Dorado + Badge Terracota 'DESLIZA →'.",
          spoken_text: hookOptions[0].hook },
        { num: 2, timestamp: "Slide 2 (MODISMO 1)", label: "Slide 2 · Modismo 1", bg: "arena", kind: "traduccion",
          tag: "TRADUCCIÓN BOX #1",
          patientLabel: "EL PACIENTE DICE", patientText: "“Doctor, tengo la guata aceda”",
          semioLabel: "SEMIOLOGÍA FORMAL", semioText: "Pirosis / Reflujo Gastroesofágico",
          examLabel: "ENUNCIADO Y CONDUCTA ASOFAMECH", examText: "Preguntar por síntomas de dispepsia y pirosis retroesternal",
          visual_cue: "Fondo Arena + 3 tarjetas: Blanca (Paciente) + Navy (Semiología) + Dorado (ASOFAMECH).",
          spoken_text: `El paciente dice: "Tengo la guata aceda".\nTraducción semiológica: Pirosis retroesternal.\nEn EUNACOM: Indagar síntomas de ERGE y alarma antes de dar IBP.` },
        { num: 3, timestamp: "Slide 3 (MODISMO 2)", label: "Slide 3 · Modismo 2", bg: "arena", kind: "traduccion",
          tag: "TRADUCCIÓN BOX #2",
          patientLabel: "EL PACIENTE DICE", patientText: "“Me dio un aire y una puntada”",
          semioLabel: "SEMIOLOGÍA FORMAL", semioText: "Dorsalgia mecánica vs Dolor Pleurítico",
          examLabel: "ENUNCIADO Y CONDUCTA ASOFAMECH", examText: "Descartar pleuritis, neumonía o TEP antes de catalogar como muscular",
          visual_cue: "Fondo Arena + 3 tarjetas con contraste Navy/Dorado.",
          spoken_text: `El paciente dice: "Me dio un aire".\nTraducción semiológica: Dorsalgia / Dolor osteomuscular.\nEn EUNACOM: Anamnesis dirigida a descartar tope inspiratorio y pleuritis.` },
        { num: 4, timestamp: "Slide 4 (MODISMO 3)", label: "Slide 4 · Modismo 3", bg: "arena", kind: "traduccion",
          tag: "TRADUCCIÓN BOX #3",
          patientLabel: "EL PACIENTE DICE", patientText: "“Le vino la churredera con patatús”",
          semioLabel: "SEMIOLOGÍA FORMAL", semioText: "SDA + Presíncope por deshidratación",
          examLabel: "ENUNCIADO Y CONDUCTA ASOFAMECH", examText: "Evaluar signos vitales ortostáticos y rehidratación oral inmediata",
          visual_cue: "Fondo Arena + 3 tarjetas con contraste Navy/Dorado.",
          spoken_text: `El paciente dice: "Churredera con patatús".\nTraducción: Diarrea aguda con presíncope.\nEn EUNACOM: Evaluar hemodinamia antes de terapia farmacológica.` },
        { num: 5, timestamp: "Slide 5 (REGLA ECOE)", label: "Slide 5 · Reglas ECOE", bg: "arena", kind: "regla",
          tag: "REGLA DE ORO · BOX CHILENO", title: "3 Reglas para el EUNACOM Práctico",
          rules: ["Nunca corrijas al paciente en el box: aclara amablemente", "Escribe siempre semiología médica formal en la ficha clínica", "Pregunta abierta primero antes de encasillar el síntoma"],
          visual_cue: "Fondo Arena + 3 tarjetas Doradas (#e8c46a) con texto oscuro de alto contraste.",
          spoken_text: `3 Reglas ECOE:\n1. Nunca corrijas al paciente: aclara amablemente.\n2. Escribe semiología formal en la ficha.\n3. Pregunta abierta primero.` },
        { num: 6, timestamp: "Slide 6 (CTA)", label: "Slide 6 · Cierre & Lead Magnet", bg: "navy", kind: "cta",
          title: "Guarda este diccionario para tu próximo turno",
          image: "/simulacro-card.png",
          mockupCaption: "captura · simulador de anamnesis eunacomapp.cl",
          brandCta: "eunacomapp.cl", linkCta: `Comenta "${ctaKeyword}" para el PDF`,
          visual_cue: `Fondo Navy + Mockup app real + 'Comenta ${ctaKeyword} para el diccionario completo en PDF'.`,
          spoken_text: `Guarda este carrusel para tu turno.\n\nPractica con más de 6.000 preguntas oficiales en eunacomapp.cl (Comenta ${ctaKeyword} abajo).` }
      ];
    } else if (arch === "salary_cesfam") {
      sections = [
        { num: 1, timestamp: "Slide 1 (PORTADA)", label: "Slide 1 · Portada", bg: "navy", kind: "portada",
          tag: "SUELDOS Y CONTRATOS 2026",
          title: "¿Cuánto Gana Realmente un Médico en APS en Chile?",
          swipeCta: "DESLIZA →",
          visual_cue: "Fondo Navy + DM Serif Display + Eyebrow Dorado + Badge Terracota 'DESLIZA →'.",
          spoken_text: hookOptions[0].hook },
        { num: 2, timestamp: "Slide 2 (DESGLOSE APS)", label: "Slide 2 · Sueldo Base APS", bg: "arena", kind: "desglose",
          tag: "DESGLOSE SUELDO APS · 2026",
          rows: [
            { name: "Sueldo Base 44h (Médico EDF / APS inicial)", value: "$2.350.000 - $2.600.000 CLP" },
            { name: "Asignación de Zona (20% a 40% según región)", value: "+$470.000 - $940.000 CLP", accent: true },
            { name: "Turnos SAPU / Urgencia 12h fin de semana", value: "+$200.000 - $280.000 CLP / turno" }
          ],
          highlight: "Ingreso mensual líquido promedio en APS: $3.100.000 - $3.800.000 CLP.",
          visual_cue: "Fondo Arena + Tarjeta blanca con desglose salarial + Tarjeta Dorada con ingreso líquido total.",
          spoken_text: `Desglose Salarial APS 2026:\n- Sueldo Base 44h: $2.350.000 - $2.600.000 CLP líquido.\n- Asignación de Zona: +20% a +40%.\n- Turno SAPU 12h: +$200.000 a $280.000 adicional.` },
        { num: 3, timestamp: "Slide 3 (COMPARATIVA CONTRATOS)", label: "Slide 3 · Comparativa Contratos", bg: "arena", kind: "desglose",
          tag: "APS 44H vs HONORARIOS vs SAPU",
          rows: [
            { name: "Contrato APS 44h (Ley 19.378)", value: "Previsión + Vacaciones + Bono Ley" },
            { name: "Honorarios Urgencia", value: "+35% valor hora bruto sin previsión" },
            { name: "Postulación a Beca Especialidad", value: "Habilitado por MINSAL desde Año 2", accent: true }
          ],
          highlight: "La única barrera legal para firmar contrato indefinido es el puntaje EUNACOM.",
          visual_cue: "Fondo Arena + Tabla comparativa 3 filas + Highlight dorado de convalidación.",
          spoken_text: `Comparativa de Contratos:\n- APS 44h: Seguridad social y postulación a becas.\n- Honorarios: Mayor pago por hora, sin beneficios ley.\n- EUNACOM: Requisito legal habilitante.` },
        { num: 4, timestamp: "Slide 4 (PROYECCIÓN CARRERA)", label: "Slide 4 · Proyección de Carrera", bg: "arena", kind: "regla",
          tag: "PROYECCIÓN DE CARRERA", title: "Ruta Médica en el Sistema Público",
          rules: ["Año 1–3: APS / CESFAM con perfeccionamiento continuo", "Año 3–5: Beca de Especialidad 100% financiada por MINSAL", "Año 5+: Especialista contratado sobre $5.000.000 CLP"],
          visual_cue: "Fondo Arena + 3 tarjetas doradas con la progresión de 1 a 5 años.",
          spoken_text: `Proyección médica en Chile:\n- Año 1-3: APS y experiencia clínica.\n- Año 3-5: Especialidad financiada por el Estado.\n- Año 5+: Renta sobre $5.000.000 CLP.` },
        { num: 5, timestamp: "Slide 5 (PASOS DE ACCESO)", label: "Slide 5 · Pasos para Acceder", bg: "arena", kind: "checklist",
          tag: "PASOS PARA ACCEDER",
          items: ["Aprobar EUNACOM sobre el puntaje de corte (700+ pts)", "Postular en las convocatorias MINSAL de marzo o agosto", "Elegir Servicio de Salud con asignación de zona preferente"],
          saveNote: "Guarda esta guía salarial",
          visual_cue: "Fondo Arena + Checklist numerado en rojo plazo con nota de guardado.",
          spoken_text: `3 Pasos clave:\n1. Rendir y aprobar EUNACOM con alto puntaje.\n2. Postular en convocatorias de marzo o agosto.\n3. Elegir zona con mejor asignación.` },
        { num: 6, timestamp: "Slide 6 (CTA)", label: "Slide 6 · Cierre & Lead Magnet", bg: "navy", kind: "cta",
          title: "Prepara tu EUNACOM 2026 y accede a las mejores plazas",
          image: "/simulacro-card.png",
          mockupCaption: "captura · simulador de sueldos y plazas en app",
          brandCta: "eunacomapp.cl", linkCta: `Comenta "${ctaKeyword}" para la tabla en PDF`,
          visual_cue: `Fondo Navy + Mockup app real + 'Comenta ${ctaKeyword} para la tabla completa en PDF'.`,
          spoken_text: `Guarda este desglose salarial.\n\nPrepara tu EUNACOM 2026 con simulacros reales en eunacomapp.cl (Comenta ${ctaKeyword} abajo).` }
      ];
    } else if (arch === "radar_burocratico") {
      sections = [
        { num: 1, timestamp: "Slide 1 (PORTADA · ROJO)", label: "Slide 1 · Portada", bg: "rojo", kind: "radar",
          tag: "RADAR BUROCRÁTICO", date: "OFICIAL 2026",
          title: "Fechas Oficiales EUNACOM 2026 y Plazos ASOFAMECH",
          leadHtml: "ASOFAMECH confirmó las fechas oficiales para las convocatorias de Julio y Diciembre 2026. Revisa los plazos y documentos obligatorios.",
          ctaBox: "Desliza para ver el calendario oficial y el checklist de inscripción →",
          visual_cue: "Fondo Rojo Plazo (#a8321f) + Fecha Mono + DM Serif Display + Caja Arena inferior.",
          spoken_text: hookOptions[0].hook },
        { num: 2, timestamp: "Slide 2 (CALENDARIO OFICIAL)", label: "Slide 2 · Calendario Oficial", bg: "arena", kind: "desglose",
          tag: "CALENDARIO OFICIAL ASOFAMECH 2026",
          rows: [
            { name: "Inscripción Examen Julio", value: "Marzo a Mayo 2026" },
            { name: "Rendición Sección Teórica (ST)", value: "Julio 2026", accent: true },
            { name: "Inscripción Examen Diciembre", value: "Agosto a Octubre 2026" },
            { name: "Rendición Sección Teórica (ST)", value: "Diciembre 2026", accent: true },
            { name: "Entrega de Resultados Oficiales", value: "Máximo 30 días hábiles" }
          ],
          highlight: "Los cupos en sedes se asignan por orden de inscripción validada por ASOFAMECH.",
          visual_cue: "Fondo Arena + Tabla fechas con acentos terracota + Highlight dorado.",
          spoken_text: `Calendario Oficial EUNACOM 2026:\n- Examen Julio: Inscripción Marzo-Mayo.\n- Examen Diciembre: Inscripción Agosto-Octubre.\n- Resultados: Máximo 30 días hábiles.` },
        { num: 3, timestamp: "Slide 3 (CHECKLIST DOCUMENTOS)", label: "Slide 3 · Checklist Documentos", bg: "arena", kind: "checklist",
          tag: "CHECKLIST DE INSCRIPCIÓN OBLIGATORIA",
          items: [
            "Título de Médico Cirujano con Apostilla de La Haya (original y copia legalizada)",
            "Certificado de concentración de notas y plan de estudios apostillado",
            "Cédula de identidad chilena o pasaporte vigente",
            "Certificado de habilitación profesional o buena conducta médica del país de origen"
          ],
          saveNote: "Guarda este checklist",
          visual_cue: "Fondo Arena + 4 tarjetas numeradas con checklist rojo + Nota de guardado.",
          spoken_text: `4 Documentos obligatorios ASOFAMECH:\n1. Título apostillado.\n2. Concentración de notas legalizada.\n3. Documento de identidad vigente.\n4. Certificado de habilitación profesional.` },
        { num: 4, timestamp: "Slide 4 (ERRORES FRECUENTES)", label: "Slide 4 · Errores Frecuentes", bg: "arena", kind: "checklist",
          tag: "3 ERRORES QUE RECHAZAN INSCRIPCIONES",
          items: [
            "Apostilla digital no verificable o código QR borroso",
            "Discrepancia en el nombre entre título y pasaporte",
            "Falta de timbre oficial o certificación de autenticidad institucional"
          ],
          saveNote: "Evita estos 3 rechazos",
          visual_cue: "Fondo Arena + 3 tarjetas de errores comunes + Nota en rojo plazo.",
          spoken_text: `3 Errores frecuentes en inscripción:\n1. Apostilla ilegible o QR caído.\n2. Discrepancias de nombres.\n3. Falta de timbres oficiales.` },
        { num: 5, timestamp: "Slide 5 (PLAN 90 DÍAS)", label: "Slide 5 · Plan de Estudio", bg: "arena", kind: "regla",
          tag: "CRONOGRAMA DE ESTUDIO", title: "Plan de 90 Días para Aprobar",
          rules: [
            "Mes 1: Diagnóstico inicial y refuerzo de las 4 áreas troncales",
            "Mes 2: 50 preguntas diarias de questionDB con pauta MINSAL",
            "Mes 3: 3 simulacros completos cronometrados de 180 preguntas"
          ],
          visual_cue: "Fondo Arena + 3 tarjetas doradas con el plan mes a mes.",
          spoken_text: `Plan 90 Días:\n- Mes 1: Diagnóstico y áreas troncales.\n- Mes 2: 50 preguntas diarias con pauta.\n- Mes 3: 3 simulacros con timer.` },
        { num: 6, timestamp: "Slide 6 (CTA)", label: "Slide 6 · Cierre & Lead Magnet", bg: "navy", kind: "cta",
          title: "Mide tu puntaje con un simulacro diagnóstico gratis",
          image: "/simulacro-card.png",
          mockupCaption: "captura · simulacro oficial en eunacomapp.cl",
          brandCta: "eunacomapp.cl", linkCta: `Comenta "${ctaKeyword}" para el cronograma en PDF`,
          visual_cue: `Fondo Navy + Mockup app real + 'Comenta ${ctaKeyword} para el cronograma en PDF'.`,
          spoken_text: `Guarda este cronograma para no perder los plazos.\n\nMide tu nivel con simulacro diagnóstico gratis en eunacomapp.cl (Comenta ${ctaKeyword} abajo).` }
      ];
    } else if (arch === "visual_algorithm") {
      sections = [
        { num: 1, timestamp: "Slide 1 (PORTADA · DORADO)", label: "Slide 1 · Portada", bg: "dorado", kind: "portada",
          tag: "ALGORITMO MINSAL",
          title: `Manejo Clínico de ${hookTopic}`,
          swipeCta: "DESLIZA →",
          visual_cue: "Fondo Dorado (#e8c46a) + Badge Navy + DM Serif Display + Botón Terracota 'DESLIZA →'.",
          spoken_text: hookOptions[0].hook },
        { num: 2, timestamp: "Slide 2 (FLUJO COMPLETO)", label: "Slide 2 · Flujo Completo", bg: "arena", kind: "flujo",
          tag: "FLUJO COMPLETO",
          steps: [
            { step: "1 · Triage y Signos Vitales", dose: "Descartar shock / Red flags" },
            { step: "2 · Manejo Inicial de Rescate", dose: "Fármaco 1ª elección GES" },
            { step: "3 · Confirmación Diagnóstica", dose: "Examen complementario en APS" },
            { step: "4 · Criterio de Derivación", dose: "Secundario si no responde" }
          ],
          note: "Criterio de resolución: Estabilización hemodinámica y cumplimiento de metas terapéuticas MINSAL.",
          visual_cue: "Fondo Arena + Píldoras Navy conectadas con dosis Dorada + Tarjeta blanca de nota clínica.",
          spoken_text: `Flujo completo de manejo:\n1. Triage y signos vitales.\n2. Manejo de rescate con fármaco GES.\n3. Confirmación en APS.\n4. Criterio de derivación oportuna.` },
        { num: 3, timestamp: "Slide 3 (ZOOM DOSIS)", label: "Slide 3 · Zoom Dosis y Cortes", bg: "arena", kind: "desglose",
          tag: "ZOOM · LO QUE PREGUNTA EL EXAMEN",
          rows: [
            { name: "Fármaco de 1ª Elección", value: "Dosis estándar pauta GES", accent: true },
            { name: "Punto de Corte / Umbral", value: "Meta terapéutica MINSAL" },
            { name: "Contraindicación Absoluta", value: "Criterio de descarte frecuente" }
          ],
          highlight: "En EUNACOM se evalúa la conducta terapéutica exacta exigida en APS.",
          visual_cue: "Fondo Arena + Tarjeta blanca con filas de dosis y valores de corte.",
          spoken_text: `Dosis y puntos clave para el examen:\n- Fármaco de 1ª elección según guía GES.\n- Puntos de corte para indicar o contraindicar tratamiento.` },
        { num: 4, timestamp: "Slide 4 (REGLAS DE ORO)", label: "Slide 4 · Reglas de Oro", bg: "arena", kind: "regla",
          tag: "REGLA DE ORO", title: "3 Claves del Algoritmo ASOFAMECH",
          rules: [
            "Pregunta por conducta inmediata, no por diagnóstico teórico",
            "Prioriza siempre lo resoluble en Atención Primaria de Salud",
            "Sigue estrictamente la guía MINSAL y la canasta GES"
          ],
          visual_cue: "Fondo Arena + 3 tarjetas doradas con las reglas de oro.",
          spoken_text: `3 Reglas de Oro del algoritmo:\n1. Conducta inmediata.\n2. Prioridad a la resolución en APS.\n3. Apego a la norma técnica MINSAL.` },
        { num: 5, timestamp: "Slide 5 (CTA)", label: "Slide 5 · Cierre & Lead Magnet", bg: "navy", kind: "cta",
          title: "Practica este y más de 40 algoritmos oficiales",
          image: "/simulacro-card.png",
          mockupCaption: "captura · algoritmos interactivos eunacomapp.cl",
          brandCta: "eunacomapp.cl", linkCta: `Comenta "${ctaKeyword}" para el PDF imprimible`,
          visual_cue: `Fondo Navy + Mockup app real + 'Comenta ${ctaKeyword} para la ficha PDF'.`,
          spoken_text: `Guarda este algoritmo para repasar antes del examen.\n\nPractica más de 6.000 preguntas oficiales en eunacomapp.cl (Comenta ${ctaKeyword} abajo).` }
      ];
    } else {
      // Default: clinical_quiz / traps_asofamech (Tipo 2)
      sections = [
        { num: 1, timestamp: "Slide 1 (PORTADA · NAVY)", label: "Slide 1 · Portada", bg: "navy", kind: "portada",
          tag: `TRAMPAS ASOFAMECH · ${cleanArchLabel.toUpperCase()}`,
          title: "Las 3 trampas mortales que repiten todos los años",
          swipeCta: "DESLIZA →",
          visual_cue: "Fondo Navy (#1a2740) + Lockup eunacomapp.cl + DM Serif Display + Badge Dorado + 'DESLIZA →'.",
          spoken_text: hookOptions[0].hook },
        { num: 2, timestamp: "Slide 2 (TRAMPA 1)", label: "Slide 2 · Trampa 1", bg: "arena", kind: "trampa", numeral: "1",
          tag: "LA DISTRACTORA CÓMODA",
          errorLabel: "LO QUE ELIGE EL 70%", errorText: "Solicitar TAC de abdomen de urgencia creyendo que es indispensable para confirmar",
          officialLabel: "LA CONDUCTA OFICIAL", officialText: "Derivar a cirugía sin retrasar por imágenes ante sospecha clínica evidente",
          visual_cue: "Fondo Arena + Numeral Terracota '1' + Tarjeta Error (Gris) + Tarjeta Oficial (Terracota).",
          spoken_text: `Trampa 1 (La distractora cómoda):\nLo que elige el 70%: Solicitar TAC antes de actuar.\nConducta oficial: Derivar a cirugía sin retrasar por imagen.` },
        { num: 3, timestamp: "Slide 3 (TRAMPA 2)", label: "Slide 3 · Trampa 2", bg: "arena", kind: "trampa", numeral: "2",
          tag: "EL REFLEJO DE HOSPITAL",
          errorLabel: "LO QUE ELIGE EL 70%", errorText: "Derivar a especialista terciario antes de iniciar el tratamiento farmacológico en box",
          officialLabel: "LA CONDUCTA OFICIAL", officialText: "Iniciar manejo integral de 1ª línea en APS según canasta básica GES",
          visual_cue: "Fondo Arena + Numeral Terracota '2' + Tarjeta Error + Tarjeta Oficial.",
          spoken_text: `Trampa 2 (El reflejo de hospital):\nLo que elige el 70%: Derivar de inmediato sin iniciar tratamiento.\nConducta oficial: Resolución y fármaco de 1ª línea en box.` },
        { num: 4, timestamp: "Slide 4 (TRAMPA 3)", label: "Slide 4 · Trampa 3", bg: "arena", kind: "trampa", numeral: "3",
          tag: "EL LABORATORIO QUE CONFUNDE",
          errorLabel: "LO QUE ELIGE EL 70%", errorText: "Esperar confirmación serológica compleja para catalogar y clasificar el cuadro",
          officialLabel: "LA CONDUCTA OFICIAL", officialText: "Tratar empíricamente según criterios clínicos de riesgo y temporalidad",
          visual_cue: "Fondo Arena + Numeral Terracota '3' + Tarjeta Error + Tarjeta Oficial.",
          spoken_text: `Trampa 3 (El laboratorio que confunde):\nLo que elige el 70%: Esperar anticuerpos o exámenes complejos.\nConducta oficial: Tratamiento según clínica y signos de alarma.` },
        { num: 5, timestamp: "Slide 5 (REGLA DE ORO)", label: "Slide 5 · Regla de Oro", bg: "arena", kind: "regla",
          tag: "REGLA DE ORO", title: "El perfil EUNACOM en tres líneas",
          rules: [
            "Pregunta por conducta, no por diagnóstico",
            "Prioriza lo resoluble en APS",
            "Sigue la guía MINSAL, no el hospital"
          ],
          visual_cue: "Fondo Arena + 3 tarjetas doradas con las reglas de oro.",
          spoken_text: `El perfil EUNACOM en tres líneas:\n1. Pregunta por conducta, no por diagnóstico.\n2. Prioriza lo resoluble en APS.\n3. Sigue la guía MINSAL, no el hospital.` },
        { num: 6, timestamp: "Slide 6 (CTA)", label: "Slide 6 · Cierre & Lead Magnet", bg: "navy", kind: "cta",
          title: "Pon a prueba lo que acabas de leer",
          image: "/simulacro-card.png",
          mockupCaption: "captura · simulacro oficial en eunacomapp.cl",
          brandCta: "eunacomapp.cl", linkCta: "Link en bio",
          visual_cue: "Fondo Navy + Mockup app real + 'eunacomapp.cl · Link en bio'.",
          spoken_text: `Pon a prueba lo que acabas de leer.\n\nPractica con más de 6.000 preguntas oficiales en eunacomapp.cl (Link en bio).` }
      ];
    }

    const captionMap = {
      chilean_lingo: `[DICCIONARIO MEDICO CHILENO] ${hookTopic}\n\nDesliza para ver la traduccion semiologica de las expresiones que mas confunden a medicos extranjeros en Chile.\n\nGuarda este carrusel para tu proximo turno.\n\nPractica el simulacro EUNACOM gratis en eunacomapp.cl (Comenta ${ctaKeyword} abajo).\n\n#EUNACOM #MedicinaChile #MedicosExtranjeros #CESFAM #ASOFAMECH`,
      salary_cesfam: `[SUELDOS MEDICOS CHILE 2026] Cuanto gana un medico en APS / CESFAM?\n\nDesliza para ver el desglose: sueldo base, asignaciones de zona, turnos SAPU y proyeccion de carrera.\n\nAprueba el EUNACOM 2026 y accede al mercado laboral medico chileno — eunacomapp.cl (Comenta ${ctaKeyword} abajo).\n\n#EUNACOM #SueldoMedico #CESFAM #APS #MedicinaChile`,
      radar_burocratico: `[FECHAS OFICIALES EUNACOM 2026] Convocatorias Julio y Diciembre.\n\nDesliza para el calendario completo, plazos de inscripcion y el checklist obligatorio de documentos apostillados.\n\nPrepárate con simulacros reales en eunacomapp.cl (Comenta ${ctaKeyword} abajo).\n\n#EUNACOM #ASOFAMECH #ConvalidacionMedica #MedicinaChile`,
      visual_algorithm: `[ALGORITMO MINSAL] ${hookTopic}\n\nDesliza para dominar el flujo clinico oficial y los puntos de corte evaluados en el examen.\n\nGuarda este algoritmo para estudiar.\n\nPractica mas de 6.000 preguntas en eunacomapp.cl (Comenta ${ctaKeyword} abajo).\n\n#EUNACOM #AlgoritmoClinico #MedicinaChile #ASOFAMECH #GES`,
      default: `[TRAMPAS ASOFAMECH] Las 3 trampas que reprueban medicos en ${cleanArchLabel}.\n\nDesliza para ver la distractora comoda vs la conducta oficial exigida en el examen.\n\nGuarda este carrusel para repasar.\n\nPractica mas de 6.000 preguntas en eunacomapp.cl (Comenta ${ctaKeyword} abajo).\n\n#EUNACOM #ASOFAMECH #MedicinaChile #CESFAM #MedicosExtranjeros`
    };

    return {
      hook_variations: hookOptions,
      sections,
      caption_ready_to_post: captionMap[arch] || captionMap.default,
      cta_keyword: ctaKeyword
    };
  }

// ─────────────────────────────────────────────────────────────────────────────
// 6a. Weekly Auto-Generator: POST /api/planner/generate-week-content
//     Auto-picks 7 posts using PICK_SCORE, generates full carousel blueprint
//     for each, assigns archetype day+time slots, writes vault markdown.
// ─────────────────────────────────────────────────────────────────────────────
app.post("/api/planner/generate-week-content", (req, res) => {
  if (!requireVault(res)) return;
  const data = getCachedData();
  const outliers = data.outliers || [];

  // ── Auto-pick: Best post per archetype slot ────────────────────────────────
  const usedCodes = new Set();
  const posts = WEEKLY_SLOTS.map((slot, idx) => {
    const eligible = outliers.filter(o =>
      (o.company || "").toUpperCase() === "EUNACOM" &&
      (o.archetype === slot.archetype || o.pillar === slot.archetype) &&
      !usedCodes.has(o.code || o.id)
    );
    const scored = eligible.map(o => ({
      ...o,
      pick_score: calcPickScore(o, slot.weight)
    })).sort((a, b) => b.pick_score - a.pick_score);

    let best = scored[0];
    if (!best) {
      // Fallback: globally highest EUNACOM not yet used
      const fallback = outliers
        .filter(o => (o.company || "").toUpperCase() === "EUNACOM" && !usedCodes.has(o.code || o.id))
        .map(o => ({ ...o, pick_score: calcPickScore(o, slot.weight) }))
        .sort((a, b) => b.pick_score - a.pick_score);
      best = fallback[idx % Math.max(fallback.length, 1)] || {
        code: `fallback_${idx}`, archetype: slot.archetype,
        archetype_label: slot.archetype, competitor_handle: "eunacom_top",
        competitor_name: "EUNACOM Benchmark", outlier_score: 5.0,
        hook_text: `Top EUNACOM ${slot.archetype}`, url: "https://www.eunacomapp.cl",
        company: "EUNACOM", pick_score: slot.weight
      };
    }
    usedCodes.add(best.code || best.id || `slot_${idx}`);

    // IMPORTANT: Always enforce slot archetype so blueprint picks the right slide kind sequence
    const bestWithSlotArch = { ...best, archetype: slot.archetype, archetype_label: best.archetype_label || slot.archetype };
    const cta = CTA_MAP[slot.archetype] || "TRAMPAS";
    const blueprint = buildCarouselBlueprint(bestWithSlotArch, cta);

    return {
      slot_index: idx + 1,
      day: slot.day,
      day_index: slot.day_index,
      time_slot_cl: slot.time_cl,
      time_slot_de: slot.time_de,
      archetype: slot.archetype,
      archetype_label: best.archetype_label || slot.archetype,
      format: "CARRUSEL (4:5 / 6 Slides)",
      pick_score: parseFloat((best.pick_score || 0).toFixed(2)),
      outlier_reference: {
        handle: best.competitor_handle || "eunacom_top",
        name: best.competitor_name || "EUNACOM",
        score: best.outlier_score || 5.0,
        url: best.url || "https://www.eunacomapp.cl",
        original_hook: best.hook_text || ""
      },
      ...blueprint
    };
  });

  // ── Write vault markdown ───────────────────────────────────────────────────
  const weekDir = path.join(VAULT_PATH, "weekly-content");
  if (!fs.existsSync(weekDir)) fs.mkdirSync(weekDir, { recursive: true });
  const dateStr = new Date().toISOString().split("T")[0];
  const mdPath  = path.join(weekDir, `esta-semana-${dateStr}.md`);

  let md = `---\ntype: weekly-content-pack\ndate: ${dateStr}\ncompany: EUNACOM\ntotal_posts: ${posts.length}\nstatus: ready-to-produce\n---\n\n# Esta Semana - EUNACOM Content Pack (${dateStr})\nAuto-generado con PICK_SCORE algorithm.\n\n`;
  posts.forEach((p, i) => {
    md += `\n---\n\n## Post ${i + 1}: ${p.day} - ${p.time_slot_cl}\n`;
    md += `- Arquetipo: ${p.archetype_label}\n- Formato: ${p.format}\n- Pick Score: ${p.pick_score}\n- Referencia Outlier: @${p.outlier_reference.handle} (${p.outlier_reference.score}x)\n\n`;
    md += `### Hooks\n`;
    p.hook_variations.forEach(h => { md += `\n**${h.type}:**\n> ${h.hook}\n`; });
    md += `\n### Diseno por Slide\n`;
    p.sections.forEach(s => {
      md += `\n#### ${s.timestamp} - ${s.label}\n- Visual: ${s.visual_cue}\n- Texto: ${s.spoken_text}\n`;
    });
    md += `\n### Caption\n\`\`\`\n${p.caption_ready_to_post}\n\`\`\`\n\n**CTA Keyword:** ${p.cta_keyword}\n`;
  });

  try { fs.writeFileSync(mdPath, md, "utf-8"); } catch(e) { console.error("Vault write error:", e); }

  res.json({
    generated_at: new Date().toISOString(),
    week_start: dateStr,
    company: "EUNACOM",
    vault_file: mdPath,
    total_posts: posts.length,
    posts
  });
});

// 6b. AI Script & Carousel Blueprint Generator Endpoint
app.post("/api/ai/generate-script", (req, res) => {
  const { post, platform = "reel" } = req.body;
  if (!post) {
    return res.status(400).json({ error: "Missing post data" });
  }

  const isEunacom = (post.company && post.company.toUpperCase() === "EUNACOM") || (post.category && post.category.toLowerCase() === "eunacom");
  const targetBrand = isEunacom ? "@eunacomapp" : "@famedapp";
  const targetSite = isEunacom ? "eunacomapp.cl" : "famedtestprep.com";
  const arch = post.archetype || post.pillar || "clinical_quiz";
  const cta = CTA_MAP[arch] || "TRAMPAS";

  const blueprint = buildCarouselBlueprint(post, cta);

  const fullScript = {
    title: `🖼️ 6-Slide Carousel Blueprint: Outdo @${post.competitor_handle || 'competitor'} (${post.outlier_score || 5.0}x Multiplier)`,
    company: isEunacom ? "EUNACOM" : "FAMED",
    target_platform: targetBrand,
    target_site: targetSite,
    archetype: arch,
    archetype_label: post.archetype_label || arch,
    format_type: "carousel",
    duration_est: "45s (135 words)",
    competitor_reference: {
      handle: post.competitor_handle || "competitor",
      name: post.competitor_name || "Competitor Post",
      original_hook: post.hook_text || "",
      outlier_score: post.outlier_score || 5.0,
      url: post.url || `https://instagram.com/p/${post.code || ""}`
    },
    ...blueprint
  };

  res.json(fullScript);
});

// 7. Save Generated Script to Obsidian Vault as an Active Project Task
app.post("/api/obsidian/save-task", (req, res) => {
  if (!requireVault(res)) return;
  const { script } = req.body;
  if (!script) {
    return res.status(400).json({ error: "Missing script payload" });
  }

  const projectsDir = path.join(VAULT_PATH, "projects");
  if (!fs.existsSync(projectsDir)) {
    fs.mkdirSync(projectsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `task_${script.company || "post"}_${timestamp}.md`;
  const filePath = path.join(projectsDir, filename);

  const markdownContent = `---
type: active-content-task
created_at: ${new Date().toISOString()}
company: ${script.company || "N/A"}
platform: ${script.target_platform || "Instagram"}
format: ${script.format_type || "reel"}
status: ready-to-record
cta_keyword: ${script.cta_keyword || "SIMULACRO"}
---

# 🎬 ${script.title || "Guion de Producción"}

> **Benchmark Outlier:** [@${script.competitor_reference?.handle || "competitor"}](${script.competitor_reference?.url || "#"}) — *Multiplicador Viral: ${script.competitor_reference?.outlier_score || 1.0}x*
> **Hook Original:** "${script.competitor_reference?.original_hook || "N/A"}"

---

## 🎯 Hooks Alternativos

${(script.hook_variations || []).map((h, i) => `### Opción ${i + 1}: ${h.type}\n> **"${h.hook}"**\n`).join("\n")}

---

## 📋 Estructura de Grabación

${(script.sections || []).map((s, i) => `### ${s.timestamp} — ${s.label || `Paso ${i + 1}`}
- **Visual:** ${s.visual_cue}
- **Audio / Guion:**
${s.spoken_text.split("\n").map(line => `  > ${line}`).join("\n")}
`).join("\n")}

---

## 📲 Caption Lista para Copiar

\`\`\`text
${script.caption_ready_to_post || ""}
\`\`\`

---
*Guardado automáticamente desde el Social Media Intelligence Studio.*
`;

  try {
    fs.writeFileSync(filePath, markdownContent, "utf-8");
    res.json({ success: true, file_path: filePath, filename });
  } catch (err) {
    console.error("Error writing Obsidian task:", err);
    res.status(500).json({ error: "Failed to write task to vault" });
  }
});

// 8. Vault Notes List & Detail
app.get("/api/vault/notes", (req, res) => {
  if (!requireVault(res)) return;
  try {
    const listDir = (dir, base = "") => {
      let results = [];
      if (!fs.existsSync(dir)) return results;
      const list = fs.readdirSync(dir);
      list.forEach(file => {
        if (file.startsWith(".")) return;
        const fullPath = path.join(dir, file);
        const relPath = base ? `${base}/${file}` : file;
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
          results = results.concat(listDir(fullPath, relPath));
        } else if (file.endsWith(".md") || file.endsWith(".canvas") || file.endsWith(".json")) {
          results.push({
            name: file,
            path: relPath,
            size: stat.size,
            mtime: stat.mtime
          });
        }
      });
      return results;
    };

    const files = listDir(VAULT_PATH);
    res.json({ vault_path: VAULT_PATH, files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/vault/note", (req, res) => {
  if (!requireVault(res)) return;
  const notePath = req.query.path;
  if (!notePath) return res.status(400).json({ error: "Missing path" });
  const fullPath = resolveInsideVault(notePath);
  if (!fullPath) return res.status(403).json({ error: "Path outside vault" });
  try {
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      res.json({ path: notePath, content });
    } else {
      res.status(404).json({ error: "Note not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── 5b. Daily Stories Generator (21 Stories 9:16 across 7 Days of the Loop) ──
app.post("/api/planner/generate-daily-stories", (req, res) => {
  if (!requireVault(res)) return;
  const data = getCachedData();
  const eunacomOutliers = (data.outliers || []).filter(o => 
    (o.company || "").toUpperCase() === "EUNACOM" || (o.category || "").toLowerCase() === "eunacom"
  ).sort((a, b) => (b.outlier_score || 0) - (a.outlier_score || 0));

  // 7-day diverse loop based on Sistema Cálido Chileno:
  const LOOP_DAYS = [
    { day: "Lunes", type: "tipo_1_quiz", label: "Quiz Clínico Interactivo", specialty: "Cardiología" },
    { day: "Martes", type: "tipo_2_trampas", label: "Trampas Mortales ASOFAMECH", specialty: "Cirugía" },
    { day: "Miércoles", type: "tipo_4_algoritmo", label: "Algoritmo Visual de 1-Página", specialty: "Endocrinología" },
    { day: "Jueves", type: "tipo_1_quiz", label: "Quiz Clínico Interactivo", specialty: "Pediatría" },
    { day: "Viernes", type: "tipo_5_sueldos", label: "Sueldos, CESFAM y Contratos", specialty: "Salud Pública / APS" },
    { day: "Sábado", type: "tipo_6_diccionario", label: "Diccionario Médico Chileno", specialty: "Semiología de Box" },
    { day: "Domingo", type: "tipo_3_radar", label: "Radar Burocrático & Plazos", specialty: "ASOFAMECH Oficial" }
  ];

  const storiesByDay = LOOP_DAYS.map((loopSlot, dayIdx) => {
    const compPost = eunacomOutliers[dayIdx % Math.max(eunacomOutliers.length, 1)] || {
      competitor_handle: "colmed_chile",
      outlier_score: 12.3,
      hook_text: "Caso clínico de alta frecuencia"
    };

    let dayStories = [];

    if (loopSlot.type === "tipo_1_quiz") {
      const q = getRandomQuestionByTopic(loopSlot.specialty) || getRandomQuestionByTopic("Medicina Interna") || (questionDB[dayIdx] || null);
      const qStem = q ? q.question.replace(/\n+/g, " ") : `Paciente consulta por cuadro agudo en ${loopSlot.specialty}. ¿Cuál es la conducta de 1ª línea según pauta GES?`;
      const choices = q && q.choices ? q.choices.slice(0, 4) : [
        { id: "A", text: "Conducta Oficial MINSAL / GES" },
        { id: "B", text: "Tratamiento sintomático ambulatorio" },
        { id: "C", text: "Derivación a especialista terciario" },
        { id: "D", text: "Observación y control en 30 días" }
      ];
      const correctLetter = q ? q.correctAnswer : "A";
      const correctChoice = choices.find(c => c.id === correctLetter) || choices[0];
      const explanationText = q && q.explanation ? q.explanation.slice(0, 200) + "..." : "La guía MINSAL prioriza el manejo resolutivo inmediato antes de solicitar exámenes terciarios.";

      dayStories = [
        {
          story_num: 1, time_slot: "08:00 CLST",
          title: `Story 1 · Quiz Clínico (${loopSlot.specialty})`,
          kind: "story_quiz", bg: "navy", aspectRatio: "9-16",
          tag: `QUIZ CLÍNICO · ${loopSlot.specialty.toUpperCase()}`,
          headline: "El 85% de los médicos falla esta pregunta",
          question_stem: qStem,
          choices: choices.map(c => ({ id: c.id, text: c.text, is_correct: c.id === correctLetter })),
          sticker: { type: "poll", label: "¿Cuál es tu respuesta?", options: choices.map(c => `${c.id}) ${c.text.slice(0, 25)}`) },
          caption_brief: "Story 1 (08:00): Viñeta clínica con sticker de votación interactiva A/B/C/D."
        },
        {
          story_num: 2, time_slot: "13:00 CLST",
          title: `Story 2 · Resolución & Pauta GES`,
          kind: "story_resolution", bg: "arena", aspectRatio: "9-16",
          tag: "CONDUCTA OFICIAL GES",
          headline: `Alternativa Correcta: ${correctLetter}`,
          correct_text: correctChoice.text,
          explanation: explanationText,
          gold_rule: "En EUNACOM: La pauta GES tiene prioridad legal y terapéutica sobre cualquier distractor.",
          sticker: { type: "reaction", emoji: "🧠", label: "¿Acertaste?" },
          caption_brief: "Story 2 (13:00): Justificación técnica MINSAL y descarte de distractores."
        },
        {
          story_num: 3, time_slot: "20:00 CLST",
          title: `Story 3 · Banco Oficial & CTA`,
          kind: "story_cta", bg: "navy", aspectRatio: "9-16",
          tag: "BANCO OFICIAL EUNACOM 2026",
          headline: "+10.000 preguntas oficiales con pauta MINSAL",
          image: "/simulacro-card.png",
          mockupCaption: "captura · simulador real eunacomapp.cl",
          sticker: { type: "link", url: "https://eunacomapp.cl", label: "eunacomapp.cl ↗" },
          caption_brief: "Story 3 (20:00): Demostración del simulador con Link Sticker a la plataforma."
        }
      ];

    } else if (loopSlot.type === "tipo_2_trampas") {
      dayStories = [
        {
          story_num: 1, time_slot: "08:00 CLST",
          title: "Story 1 · Trampas ASOFAMECH en Cirugía",
          kind: "story_quiz", bg: "navy", aspectRatio: "9-16",
          tag: "TRAMPAS ASOFAMECH · CIRUGÍA",
          headline: "Las 3 trampas mortales que repiten todos los años",
          question_stem: "Frente a sospecha de apendicitis aguda en box de APS: ¿Cuál es la conducta?",
          choices: [
            { id: "A", text: "TAC de abdomen de urgencia para confirmar", is_correct: false },
            { id: "B", text: "Derivar a cirugía sin retrasar por imágenes", is_correct: true },
            { id: "C", text: "Antibioticoterapia ambulatoria y control", is_correct: false },
            { id: "D", text: "Ecografía abdominal en 48 horas", is_correct: false }
          ],
          sticker: { type: "poll", label: "Vota tu conducta:", options: ["A) TAC urgente", "B) Derivar directo"] },
          caption_brief: "Story 1 (08:00): La distractora cómoda vs la conducta oficial. Sticker de votación rápida."
        },
        {
          story_num: 2, time_slot: "13:00 CLST",
          title: "Story 2 · El Perfil EUNACOM en 3 Líneas",
          kind: "story_resolution", bg: "arena", aspectRatio: "9-16",
          tag: "REGLA DE ORO",
          headline: "Alternativa Correcta: B",
          correct_text: "Derivar a pabellón sin retrasar por estudios de imagen",
          explanation: "En apendicitis típica, el diagnóstico es clínico. En el EUNACOM, pedir TAC en APS es el distractor número 1.",
          gold_rule: "Pregunta por conducta, no por diagnóstico. Prioriza lo resoluble en APS.",
          sticker: { type: "reaction", emoji: "🔥", label: "¿Te sabías la regla?" },
          caption_brief: "Story 2 (13:00): Regla de oro en tres líneas con sticker de reacción."
        },
        {
          story_num: 3, time_slot: "20:00 CLST",
          title: "Story 3 · Pon a Prueba lo que Leíste",
          kind: "story_cta", bg: "navy", aspectRatio: "9-16",
          tag: "SIMULACRO EN TIEMPO REAL",
          headline: "Pon a prueba lo que acabas de leer",
          image: "/simulacro-card.png",
          mockupCaption: "captura · simulacro en iPhone",
          sticker: { type: "link", url: "https://eunacomapp.cl", label: "eunacomapp.cl ↗" },
          caption_brief: "Story 3 (20:00): Captura del simulador y Link Sticker a eunacomapp.cl."
        }
      ];

    } else if (loopSlot.type === "tipo_4_algoritmo") {
      dayStories = [
        {
          story_num: 1, time_slot: "08:00 CLST",
          title: "Story 1 · Algoritmo MINSAL de Urgencia",
          kind: "story_quiz", bg: "dorado", aspectRatio: "9-16",
          tag: "ALGORITMO MINSAL",
          headline: "Manejo de Cetoacidosis Diabética",
          question_stem: "¿Cuál es el primer paso obligatorio antes de iniciar infusión de insulina?",
          choices: [
            { id: "A", text: "Carga de Insulina en bolo 0.1 U/kg", is_correct: false },
            { id: "B", text: "Verificar K+ > 3.3 mEq/L e hidratar con SF", is_correct: true },
            { id: "C", text: "Infusión de Bicarbonato de Sodio", is_correct: false },
            { id: "D", text: "Insulina NPH subcutánea de rescate", is_correct: false }
          ],
          sticker: { type: "poll", label: "¿Qué indicas primero?", options: ["A) Insulina bolo", "B) K+ e hidratación"] },
          caption_brief: "Story 1 (08:00): Punto de quiebre del algoritmo con sticker de votación."
        },
        {
          story_num: 2, time_slot: "13:00 CLST",
          title: "Story 2 · Flujo y Dosis de Rescate",
          kind: "story_resolution", bg: "arena", aspectRatio: "9-16",
          tag: "FLUJO COMPLETO",
          headline: "Alternativa Correcta: B",
          correct_text: "Fluidos SF 15-20 ml/kg/h + Control de Potasio antes de Insulina",
          explanation: "Si K < 3.3 mEq/L, la insulina precipita arritmias letales por hipokalemia. Nunca dar insulina sin confirmar potasio.",
          gold_rule: "Criterio de resolución: Anion gap < 12 y Bicarbonato > 15 mEq/L.",
          sticker: { type: "reaction", emoji: "📌", label: "Guarda la dosis" },
          caption_brief: "Story 2 (13:00): Flujo de 4 pasos y dosis evaluadas en el examen."
        },
        {
          story_num: 3, time_slot: "20:00 CLST",
          title: "Story 3 · Fichas de Algoritmos en App",
          kind: "story_cta", bg: "navy", aspectRatio: "9-16",
          tag: "+40 ALGORITMOS CLÍNICOS",
          headline: "Domina todos los algoritmos oficiales",
          image: "/simulacro-card.png",
          mockupCaption: "captura · algoritmos interactivos eunacomapp.cl",
          sticker: { type: "link", url: "https://eunacomapp.cl", label: "eunacomapp.cl ↗" },
          caption_brief: "Story 3 (20:00): Lead magnet para descargar las 40 fichas de algoritmos."
        }
      ];

    } else if (loopSlot.type === "tipo_5_sueldos") {
      dayStories = [
        {
          story_num: 1, time_slot: "08:00 CLST",
          title: "Story 1 · Sueldos Médicos en Chile 2026",
          kind: "story_quiz", bg: "navy", aspectRatio: "9-16",
          tag: "SUELDOS MÉDICOS · CHILE",
          headline: "¿Cuánto gana un médico en un CESFAM?",
          question_stem: "¿Sabías cuál es el sueldo base inicial de un médico general contratado en APS por 44 horas semanales?",
          choices: [
            { id: "A", text: "$1.2M – $1.8M CLP", is_correct: false },
            { id: "B", text: "$2.8M – $3.8M CLP líquidos", is_correct: true },
            { id: "C", text: "$4.5M – $6.0M CLP", is_correct: false },
            { id: "D", text: "Solo pago por boleta de honorarios", is_correct: false }
          ],
          sticker: { type: "poll", label: "¿Cuánto calculabas?", options: ["A) $1.5M", "B) $2.8M - $3.8M"] },
          caption_brief: "Story 1 (08:00): Hook aspiracional de sueldos médicos en Chile con encuesta."
        },
        {
          story_num: 2, time_slot: "13:00 CLST",
          title: "Story 2 · Desglose Mensual APS + Turnos",
          kind: "story_resolution", bg: "arena", aspectRatio: "9-16",
          tag: "DESGLOSE MENSUAL",
          headline: "Base 44h: $2.8M – $3.8M líquidos",
          correct_text: "Base 44h + Turnos SAPU/SAR + Asignación de Zona (hasta +40%)",
          explanation: "Con EUNACOM aprobado accedes a contrato indefinido Ley 19.378, seguridad social y postulación a becas de especialidad.",
          gold_rule: "La única barrera legal para firmar contrato indefinido en Chile es el puntaje EUNACOM.",
          sticker: { type: "reaction", emoji: "💼", label: "Proyección médica" },
          caption_brief: "Story 2 (13:00): Desglose salarial transparente de contrato APS."
        },
        {
          story_num: 3, time_slot: "20:00 CLST",
          title: "Story 3 · Habilítate para Trabajar en Chile",
          kind: "story_cta", bg: "navy", aspectRatio: "9-16",
          tag: "CONCURSOS Y PLAZAS MÉDICAS",
          headline: "Aprueba el EUNACOM y accede al mercado médico",
          image: "/simulacro-card.png",
          mockupCaption: "captura · simulador de plazas eunacomapp.cl",
          sticker: { type: "link", url: "https://eunacomapp.cl", label: "eunacomapp.cl ↗" },
          caption_brief: "Story 3 (20:00): Llamado a la acción para habilitarse y postular a plazas públicas."
        }
      ];

    } else if (loopSlot.type === "tipo_6_diccionario") {
      dayStories = [
        {
          story_num: 1, time_slot: "08:00 CLST",
          title: "Story 1 · Diccionario Médico Chileno",
          kind: "story_quiz", bg: "terracota", aspectRatio: "9-16",
          tag: "DICCIONARIO MÉDICO CHILENO",
          headline: "Cuando el paciente te dice que “le dio un aire”",
          question_stem: "El paciente en box te dice: “Doctor, tengo la guata acorchada y me dio un aire en la espalda”. ¿Qué semiología registras?",
          choices: [
            { id: "A", text: "Dispepsia ulcerosa y neumotórax", is_correct: false },
            { id: "B", text: "Parestesia abdominal + Dorsalgia mecánica", is_correct: true },
            { id: "C", text: "Cólico biliar y lumbago agudo", is_correct: false },
            { id: "D", text: "Reflujo gastroesofágico atípico", is_correct: false }
          ],
          sticker: { type: "poll", label: "¿Cómo lo traduces?", options: ["A) Dispepsia", "B) Parestesia + Dorsalgia"] },
          caption_brief: "Story 1 (08:00): Modismo popular vs semiología formal con sticker de encuesta."
        },
        {
          story_num: 2, time_slot: "13:00 CLST",
          title: "Story 2 · Traducción Semiológica Formal",
          kind: "story_resolution", bg: "arena", aspectRatio: "9-16",
          tag: "TRADUCCIÓN BOX",
          headline: "Parestesia abdominal / Hipoestesia T10-T12",
          correct_text: "“Guata acorchada” = Parestesia · “Aire” = Contractura/Dorsalgia",
          explanation: "En el EUNACOM Práctico (ECOE) y en la ficha clínica de urgencia debes registrar siempre terminología médica formal.",
          gold_rule: "Regla ECOE: Nunca corrijas con soberbia al paciente; traduce mentalmente y anota semiología formal.",
          sticker: { type: "reaction", emoji: "🇨🇱", label: "Guarda el modismo" },
          caption_brief: "Story 2 (13:00): Cuadro comparativo: Modismo -> Semiología -> Pregunta ASOFAMECH."
        },
        {
          story_num: 3, time_slot: "20:00 CLST",
          title: "Story 3 · Descarga el Diccionario Completo",
          kind: "story_cta", bg: "navy", aspectRatio: "9-16",
          tag: "DICCIONARIO DE BOX EN PDF",
          headline: "Más de 50 modismos chilenos traducidos a semiología",
          image: "/simulacro-card.png",
          mockupCaption: "captura · simulador de anamnesis eunacomapp.cl",
          sticker: { type: "link", url: "https://eunacomapp.cl", label: "eunacomapp.cl ↗" },
          caption_brief: "Story 3 (20:00): Comparte con tus colegas y descarga el PDF en la app."
        }
      ];

    } else if (loopSlot.type === "tipo_3_radar") {
      dayStories = [
        {
          story_num: 1, time_slot: "08:00 CLST",
          title: "Story 1 · Radar Burocrático EUNACOM 2026",
          kind: "story_quiz", bg: "rojo", aspectRatio: "9-16",
          tag: "RADAR BUROCRÁTICO",
          headline: "Fechas Oficiales EUNACOM 2026",
          question_stem: "¿Sabes en qué meses se rinde oficialmente la Sección Teórica (ST) del EUNACOM cada año?",
          choices: [
            { id: "A", text: "Marzo y Septiembre", is_correct: false },
            { id: "B", text: "Julio y Diciembre (2 convocatorias)", is_correct: true },
            { id: "C", text: "Solo una vez en Enero", is_correct: false },
            { id: "D", text: "Mayo y Noviembre", is_correct: false }
          ],
          sticker: { type: "poll", label: "¿En qué fecha rindes?", options: ["Julio 2026", "Diciembre 2026"] },
          caption_brief: "Story 1 (08:00): Fechas oficiales confirmadas por ASOFAMECH con sticker de votación."
        },
        {
          story_num: 2, time_slot: "13:00 CLST",
          title: "Story 2 · Checklist de 4 Documentos Apostillados",
          kind: "story_resolution", bg: "arena", aspectRatio: "9-16",
          tag: "CHECKLIST DE INSCRIPCIÓN",
          headline: "4 Documentos Obligatorios ASOFAMECH",
          correct_text: "Título apostillado + Concentración de notas + Cédula/Pasaporte + Habilitación médica",
          explanation: "Las inscripciones para el examen de Julio cierran en Mayo, y para el examen de Diciembre en Octubre. No dejes la apostilla para el final.",
          gold_rule: "Evita rechazos: Verifica que el código digital de la apostilla sea legible por internet.",
          sticker: { type: "reaction", emoji: "🚨", label: "Revisa tus papeles" },
          caption_brief: "Story 2 (13:00): Checklist burocrático oficial de 4 puntos indispensables."
        },
        {
          story_num: 3, time_slot: "20:00 CLST",
          title: "Story 3 · Simulacro Diagnóstico Gratuito",
          kind: "story_cta", bg: "navy", aspectRatio: "9-16",
          tag: "SIMULACRO DIAGNÓSTICO GRATIS",
          headline: "Mide tu puntaje actual en 180 preguntas",
          image: "/simulacro-card.png",
          mockupCaption: "captura · simulador oficial eunacomapp.cl",
          sticker: { type: "link", url: "https://eunacomapp.cl", label: "eunacomapp.cl ↗" },
          caption_brief: "Story 3 (20:00): Simulacro diagnóstico con timer real y Link Sticker a eunacomapp.cl."
        }
      ];
    }

    return {
      day: loopSlot.day,
      day_index: dayIdx + 1,
      topic: loopSlot.label,
      specialty: loopSlot.specialty,
      competitor_reference: {
        handle: compPost.competitor_handle || "colmed_chile",
        score: compPost.outlier_score || 5.0,
        original_hook: compPost.hook_text || ""
      },
      stories: dayStories
    };
  });

  // Write stories pack to Obsidian Vault
  const weekDir = path.join(VAULT_PATH, "weekly-content");
  if (!fs.existsSync(weekDir)) fs.mkdirSync(weekDir, { recursive: true });
  const dateStr = new Date().toISOString().split("T")[0];
  const storiesMdPath = path.join(weekDir, `stories-semana-${dateStr}.md`);

  let md = `---\ntype: daily-stories-pack\ndate: ${dateStr}\ncompany: EUNACOM\ntotal_stories: 21\nstatus: ready-to-publish\n---\n\n# Pack 21 Stories Semanales (9:16) - EUNACOM (${dateStr})\nGenerado según el Loop Semanal de Dirección 1e (Cálido Chileno) y ASOFAMECH oficial.\n\n`;
  storiesByDay.forEach(d => {
    md += `\n---\n\n## 📅 ${d.day} — ${d.topic} (${d.specialty})\n\n`;
    d.stories.forEach(s => {
      md += `### ${s.title} (${s.time_slot})\n`;
      md += `- **Tag:** ${s.tag}\n- **Titular:** ${s.headline}\n`;
      if (s.question_stem) md += `- **Pregunta / Enunciado:** ${s.question_stem}\n`;
      if (s.choices) md += `- **Opciones:**\n${s.choices.map(c => `  - [${c.id}] ${c.text} ${c.is_correct ? '✅' : ''}`).join('\n')}\n`;
      if (s.correct_text) md += `- **Conducta Oficial:** ${s.correct_text}\n`;
      if (s.explanation) md += `- **Justificación Técnica:** ${s.explanation}\n`;
      if (s.gold_rule) md += `- **Regla de Oro:** ${s.gold_rule}\n`;
      md += `- **Sticker Interactivo:** [${s.sticker.type.toUpperCase()}] ${s.sticker.label || s.sticker.url}\n`;
      md += `- **Brief:** ${s.caption_brief}\n\n`;
    });
  });

  try { fs.writeFileSync(storiesMdPath, md, "utf-8"); } catch (e) { console.error("Vault write error:", e); }

  res.json({
    date: dateStr,
    total_days: storiesByDay.length,
    total_stories: storiesByDay.length * 3,
    days: storiesByDay
  });
});

// Bind to loopback only. Locally this tool reads/writes the vault and shells
// out to the Python scraper, so it must never be reachable from the network.
const HOST = process.env.HOST || "127.0.0.1";

// Only listen when run directly. A serverless host provides the listener and
// just needs the handler, so in that case we export the app instead.
if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Social Media Outlier Engine & Intelligence Studio`);
    console.log(`🌐 Web App running at: http://${HOST}:${PORT}`);
    console.log(VAULT_ENABLED
      ? `📁 Connected Obsidian Vault: ${VAULT_PATH}`
      : `☁️  Vault OFF — hosted mode (studio + exports only, no vault writes)`);
    console.log(`🔒 Bound to ${HOST} — local access only`);
    console.log(`======================================================\n`);
  });
}

module.exports = app;
