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

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Helper to read cached data
function getCachedData() {
  if (fs.existsSync(JSON_CACHE)) {
    try {
      const raw = fs.readFileSync(JSON_CACHE, "utf-8");
      return JSON.parse(raw);
    } catch (e) {
      console.error("Error reading JSON cache:", e);
    }
  }
  return { competitors: [], outliers: [], hook_formulas: [], weekly_sprint_matrix: [] };
}

// 1. Status endpoint
app.get("/api/status", (req, res) => {
  const data = getCachedData();
  res.json({
    status: "online",
    vault_path: VAULT_PATH,
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

  const py = spawn("python3", args);

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

// 6. AI Script & Carousel Blueprint Generator Endpoint
app.post("/api/ai/generate-script", (req, res) => {
  const { post, platform = "reel" } = req.body;
  if (!post) {
    return res.status(400).json({ error: "Missing post data" });
  }

  const isEunacom = (post.company && post.company.toUpperCase() === "EUNACOM") || (post.category && post.category.toLowerCase() === "eunacom");
  const targetBrand = isEunacom ? "@eunacomapp_cl" : "@famedapp";
  const targetSite = isEunacom ? "eunacomapp.cl" : "famedtestprep.com";

  const isCarousel = (post.media_type === "carousel" || post.media_type === "image" ||
    ["traps_asofamech", "visual_algorithm", "arztbrief_traps", "fachbegriffe_vs_laien"].includes(post.archetype || post.pillar));

  const hookOptions = isCarousel ? [
    {
      type: "🖼️ Slide 1 Hook (Loss Aversion)",
      hook: isEunacom
        ? `⚠️ 5 Trampas del EUNACOM en ${post.archetype_label || "este tema"} que reprueban al 70% (Desliza ➡️)`
        : `⚠️ 5 Häufige Arztbrief-Fallen in der FSP (Die dich Punkte kosten) ➡️`
    },
    {
      type: "📊 Slide 1 Hook (Cheat Sheet)",
      hook: isEunacom
        ? `🧠 Algoritmo de 1-Página: Conducta GES inmediata ante ${post.hook_text ? post.hook_text.slice(0, 45) : "urgencias"} (Guarda 🔖)`
        : `📋 FSP Fachbegriff vs. Laiensprache: Die ultimative Vokabel-Tabelle ➡️`
    },
    {
      type: "🎯 Slide 1 Hook (Direct Diagnostic Challenge)",
      hook: isEunacom
        ? `🩺 Caso Clínico ASOFAMECH: ¿Cuál es el diagnóstico diferencial clave? (Solución en Slide 4)`
        : `🩺 FSP Anamnese: Die 3 Fragen, die jeder Prüfer hören will (Slide 1-5)`
    }
  ] : [
    {
      type: "🚨 High Stakes & Fear of Failure (Video)",
      hook: isEunacom
        ? `⚠️ El 85% de los médicos que reprueban el EUNACOM cometen este error exacto en ${post.archetype_label || post.pillar_label || "esta pregunta"}. ¿Lo conocías?`
        : `⚠️ Wenn du in der FSP Fachsprachprüfung diese Frage so beantwortest, fällst du durch.`
    },
    {
      type: "💡 Contrarian & Pattern Interrupt (Video)",
      hook: isEunacom
        ? `No memorices más guías Minsal de memoria: esta regla de 3 segundos te da el punto exacto en ${post.archetype_label || post.pillar_label || "el examen"}.`
        : `Der größte Fehler beim Arzt-Arzt-Gespräch in der FSP — und wie du ihn in 30 Sekunden vermeidest.`
    },
    {
      type: "🎯 Direct Question & Clinical Challenge (Video)",
      hook: isEunacom
        ? `Pregunta oficial EUNACOM: Paciente ingresa a urgencias con este cuadro. ¿Cuál es tu primera indicación? Deja tu respuesta abajo.`
        : `FSP Schnelltest: Ein Patient klagt über retrosternale Schmerzen. Wie leitest du die Notfallanamnese ein?`
    }
  ];

  let fullScript;

  if (isCarousel) {
    // 6-Slide Carousel Blueprint (NO VOICE / NO CAMERA NEEDED)
    fullScript = {
      title: `🖼️ 6-Slide Carousel Blueprint: Outdo @${post.competitor_handle} (${post.outlier_score}x Saves)`,
      company: isEunacom ? "EUNACOM" : "FAMED",
      format_type: "carousel",
      target_platform: "CARRUSEL (4:5 / No Voice)",
      duration_est: "6 Slides (Diseño Gráfico / Sin Voz)",
      competitor_reference: {
        handle: post.competitor_handle,
        name: post.competitor_name,
        url: post.url,
        original_hook: post.hook_text,
        outlier_score: post.outlier_score
      },
      hook_variations: hookOptions,
      sections: isEunacom ? [
        {
          timestamp: "Slide 1 (PORTADA · NAVY)",
          label: "High-Contrast Cover (Cálido Chileno Dirección 1e)",
          visual_cue: "Fondo Navy Clínico (#1a2740) + Lockup eunacomapp.cl + Tipografía DM Serif Display (blanco arena) + Badge Terracota (#d9764a) 'TRAMPA FRECUENTE #14' + Subtítulo Work Sans + Indicador 'DESLIZA ➡️'.",
          spoken_text: hookOptions[0].hook
        },
        {
          timestamp: "Slide 2 (EL ERROR TÍPICO · ARENA)",
          label: "The Common Clinical Pitfall (Lo que elige el 70%)",
          visual_cue: "Fondo Arena (#f7ece0) + Tarjeta blanca con borde izquierdo Terracota (#d9764a) 'El 72% responde: Tratamiento reflejo/sintomático' + Explicación fisiopatológica de por qué ASOFAMECH lo penaliza.",
          spoken_text: `❌ Lo que elige el 72%: Indicar tratamiento sintomático inmediato sin estratificación de riesgo.\n⚠️ El error: En la pauta oficial ASOFAMECH, prima el tratamiento fisiopatológico de base que reduce mortalidad.`
        },
        {
          timestamp: "Slide 3 (LA PAUTA OFICIAL · NAVY)",
          label: "Norma Técnica ASOFAMECH (Conducta Oficial)",
          visual_cue: "Fondo Navy Clínico (#1a2740) + Tarjeta blanca con borde izquierdo Dorado (#e8c46a) 'La respuesta correcta es iSGLT2 / Fármaco de 1ª Línea' + Badge Dorado '✓ PAUTA OFICIAL ASOFAMECH'.",
          spoken_text: `📌 Conducta Oficial ASOFAMECH:\n1. Fármaco de elección con evidencia grado I-A.\n2. Criterio de inclusión independiente de comorbilidad.\n3. Meta terapéutica y seguimiento ambulatorio.`
        },
        {
          timestamp: "Slide 4 (TABLA DIFERENCIAL · ARENA)",
          label: "High-Yield Comparison Chart (Decisión Rápida)",
          visual_cue: "Fondo Arena (#f7ece0) + Tabla comparativa limpia de 3 filas en tarjetas blancas con acentos Terracota en metadatos y DM Serif Display en títulos.",
          spoken_text: `📊 Tabla de Decisión Rápida:\n• Criterio A + Factor de riesgo ➔ Diagnóstico 1 (Conducta A)\n• Criterio B + Hallazgo ECG/Laboratorio ➔ Diagnóstico 2 (Conducta B)\n• Distractor frecuente de ASOFAMECH ➔ Descarte por temporalidad.`
        },
        {
          timestamp: "Slide 5 (LA REGLA DE ORO · ARENA)",
          label: "Golden Rules (Regla de Oro en 3 Líneas)",
          visual_cue: "Fondo Arena (#f7ece0) + 3 tarjetas blancas con numeración Terracota grande (01, 02, 03) y texto nítido Work Sans 400. 'Guarda esta lámina para tu turno médico 🔖'.",
          spoken_text: `🧠 3 Reglas de Oro para el Examen:\n01. No confundir síntoma de esfuerzo con descompensación aguda.\n02. Indicar fármacos de 1ª línea según pauta GES.\n03. Los betabloqueadores se titulan solo con indicación específica.`
        },
        {
          timestamp: "Slide 6 (GUARDADO & CTA · NAVY)",
          label: "Save Magnet & App Conversion (Simulador)",
          visual_cue: "Fondo Navy Clínico (#1a2740) + Mockup iPhone simulador eunacomapp.cl + Botón Terracota (#d9764a) 'Comenta TRAMPAS para recibir el banco en PDF'.",
          spoken_text: `📲 Guarda este carrusel para repasar antes del examen.\n\n🎯 Practica más de 1.850 preguntas oficiales explicadas por especialistas en eunacomapp.cl (Comenta TRAMPAS abajo).`
        }
      ] : [
        {
          timestamp: "Slide 1 (TITELBLATT)",
          label: "High-Contrast Cover (Stop Scroll)",
          visual_cue: "Dunkler Hintergrund mit gelber/weißer Schrift + Badge 'FSP Approbation' + Icon ⚠️ + 'Wische nach rechts ➡️'.",
          spoken_text: hookOptions[0].hook
        },
        {
          timestamp: "Slide 2 (DER TYPISCHE FEHLER)",
          label: "Typische FSP-Falle im Arztbrief",
          visual_cue: "Vergleichstabelle: ❌ Falsche Formulierung (Umgangssprache) vs ✅ Korrekte medizinische Fachsprache.",
          spoken_text: `❌ Falsch: 'Der Patient hat seit gestern Bauchschmerzen.'\n✅ Richtig: 'Der Patient stellt sich mit seit 24 Stunden bestehenden epigastrischen Schmerzen vor.'`
        },
        {
          timestamp: "Slide 3 (FACHBEGRIFFE TABELLE)",
          label: "Laiensprache vs. Fachbegriff",
          visual_cue: "3-spaltige Tabelle: Laiensprache (Patient) | Fachbegriff (Arzt) | Erklärung auf Spanisch.",
          spoken_text: `• Blinddarmentzündung ➔ Appendizitis\n• Gelbsucht ➔ Ikterus\n• Gallensteine ➔ Cholelithiasis\n• Herzrasen ➔ Tachykardie`
        },
        {
          timestamp: "Slide 4 (ARZTBRIEF SCHABLONE)",
          label: "Strukturierter Arztbrief Aufbau",
          visual_cue: "Übersichtskarte mit den 5 Abschnitten des Arztbriefs (Anamnese, Status praesens, Diagnosen, Therapie, Prozedere).",
          spoken_text: `📝 Wichtig für die 20-Minuten-Schreibzeit:\n1. Aktuelle Anamnese (Leitsymptom)\n2. Vorerkrankungen & Medikation\n3. Körperlicher Untersuchungsbefund\n4. Verdachts- & Differentialdiagnosen\n5. Weiteres diagnostisches & therapeutisches Prozedere`
        },
        {
          timestamp: "Slide 5 (SPICKZETTEL)",
          label: "1-Page Cheat Sheet (Save Magnet)",
          visual_cue: "Grafische Zusammenfassung mit Lesezeichen-Symbol: 'Speichere diesen Beitrag für deine FSP-Vorbereitung 🔖'.",
          spoken_text: `🧠 3 goldene Regeln für die FSP:\n1. Keine Laienbegriffe im Arzt-Arzt-Gespräch.\n2. Zeitlimit von 20 Min für den Arztbrief strikt einhalten.\n3. Immer aktiv nach Allergien und Dauermedikation fragen.`
        },
        {
          timestamp: "Slide 6 (SPEICHERN & CTA)",
          label: "Save & App Conversion",
          visual_cue: "iPhone-Mockup mit FaMED KI-Patienten Simulator + Text 'Jetzt kostenlos testen'.",
          spoken_text: `🔖 Speichere diesen Beitrag für deine FSP-Lernphase!\n\n🎙️ Trainiere deine medizinische Fachsprache mit KI-Patienten auf ${targetSite} (Link in der Bio).`
        }
      ],
      caption_ready_to_post: isEunacom
        ? `📚 [GUÍA VISUAL] ¿Conocías este algoritmo clave para el EUNACOM?\n\nDesliza las imágenes para ver el desglose paso a paso y la conducta oficial ASOFAMECH/Minsal.\n\n🔖 Guarda este carrusel para repasarlo antes de tu turno o simulacro.\n\n🎯 Practica más de 3,500 preguntas reales en ${targetSite} (Link en la Bio).\n\n#EUNACOM #EUNACOM2026 #MedicinaChile #CarruselMedico #MedicosExtranjeros #ASOFAMECH #CESFAM`
        : `📚 [FSP SPICKZETTEL] Häufige Fachbegriffe & Arztbrief-Struktur für die Fachsprachprüfung!\n\nWische nach rechts für die vollständige Übersicht.\n\n🔖 Speichere diesen Beitrag für deine tägliche Lernroutine.\n\n🎯 Trainiere Anamnese und Arzt-Arzt-Übergabe mit unserem KI-Simulator auf ${targetSite} (Link in Bio).\n\n#FSP #Fachsprachprüfung #Approbation #MedizinInDeutschland #Assistenzarzt #Aerzteblatt #FaMED`
    };
  } else {
    // Standard Short-Form Video / Reel Script (Talking Head / Screen / Voice)
    fullScript = {
      title: `🎬 Video Script: Outdoing @${post.competitor_handle} (${post.outlier_score}x Viral Multiplier)`,
      company: isEunacom ? "EUNACOM" : "FAMED",
      format_type: "reel",
      target_platform: platform.toUpperCase(),
      duration_est: "40 seconds (120 words)",
      competitor_reference: {
        handle: post.competitor_handle,
        name: post.competitor_name,
        url: post.url,
        original_hook: post.hook_text,
        outlier_score: post.outlier_score
      },
      hook_variations: hookOptions,
      sections: [
        {
          timestamp: "0:00 - 0:03 (HOOK)",
          label: "Visual & Audio Pattern Interrupt",
          visual_cue: "Close-up a la cámara con bata médica o pantalla de la app + texto bold amarillo + alerta auditiva.",
          spoken_text: hookOptions[0].hook
        },
        {
          timestamp: "0:03 - 0:15 (TENSION)",
          label: "Clinical / Cognitive Breakdown",
          visual_cue: "Corte rápido mostrando el caso clínico en pantalla o temporizador de 5 segundos.",
          spoken_text: isEunacom
            ? `Muchos marcan la conducta de libro sin revisar el Perfil EUNACOM 2026. En el caso de ${post.hook_text ? post.hook_text.slice(0, 60) : "este síntoma"}..., el error más común es no evaluar primero la pauta oficial ASOFAMECH.`
            : `In der FSP musst du sofort zwischen Notfallindikation und elektiver Abklärung unterscheiden. Bei ${post.hook_text ? post.hook_text.slice(0, 50) : "akuten Symptomen"} scheitern 60% an der korrekten Priorisierung.`
        },
        {
          timestamp: "0:15 - 0:30 (THE SOLUTION)",
          label: "High-Yield Medical Framework",
          visual_cue: "Demostración de la regla de 3 pasos o pantalla compartida del simulador.",
          spoken_text: isEunacom
            ? `La regla de oro oficial: 1. Triaje GES de urgencia. 2. Examen confirmatorio de 1ª línea. 3. Descartar los 2 distractores clásicos de la pauta.`
            : `Die 3-Schritte-Regel: 1. Symptom lokalisieren und zeitlich einordnen. 2. Red Flags ausschließen. 3. Strukturierte Verdachtsdiagnose formulieren.`
        },
        {
          timestamp: "0:30 - 0:40 (CONVERSION CTA)",
          label: "Strong Call to Action",
          visual_cue: "Demostración de 3 segundos de la app en iPhone + texto 'Link en Bio'.",
          spoken_text: isEunacom
            ? `¿Quieres entrenar con más de 3,500 preguntas oficiales con justificación clínica? Entra a ${targetBrand} gratis en el link de nuestro perfil.`
            : `Trainiere echte FSP-Fälle mit unserem KI-Patienten. Starte jetzt auf ${targetBrand}. Link in der Bio.`
        }
      ],
      caption_ready_to_post: isEunacom
        ? `🚨 ¿Sabías responder esta pregunta clásica del EUNACOM?\n\nMuchos postulantes pierden puntos por confusiones en la conducta inicial según la norma Minsal.\n\n👇 Deja tu respuesta en los comentarios: ¿A, B o C?\n\n📲 Prepárate con el banco de preguntas más actualizado en ${targetSite} (Link en la Bio).\n\n#EUNACOM #EUNACOM2026 #MedicinaChile #MedicosEnChile #ASOFAMECH #CESFAM`
        : `🔥 FSP-Simulation für ausländische Ärzte in Deutschland!\n\n👇 Wie würdest du dieses Leitsymptom im Arztbrief dokumentieren? Kommentiere unten!\n\n🚀 Trainiere interaktive Fälle auf ${targetSite} (Link in der Bio)\n\n#FSP #Fachsprachprüfung #Approbation #MedizinInDeutschland #Assistenzarzt #FaMED`
    };
  }

  res.json(fullScript);
});

// 7. Save Generated Script to Obsidian Vault as an Active Project Task
app.post("/api/obsidian/save-task", (req, res) => {
  const { script } = req.body;
  if (!script) {
    return res.status(400).json({ error: "Missing script payload" });
  }

  const projectsDir = path.join(VAULT_PATH, "projects");
  if (!fs.existsSync(projectsDir)) {
    fs.mkdirSync(projectsDir, { recursive: true });
  }

  const slug = (script.competitor_reference?.handle || "content") + "-" + Date.now();
  const filePath = path.join(projectsDir, `script-${slug}.md`);

  let md = `---
type: social-content-script
created_at: ${new Date().toISOString()}
company: ${script.company}
target_platform: ${script.target_platform}
competitor_handle: @${script.competitor_reference?.handle || ""}
competitor_url: ${script.competitor_reference?.url || ""}
outlier_multiplier: ${script.competitor_reference?.outlier_score || ""}x
status: ready-to-record
---

# 🎬 Content Script: Outdo @${script.competitor_reference?.handle || "competitor"} (${script.competitor_reference?.outlier_score}x Viral)

> **Competitor Original Hook:** "${script.competitor_reference?.original_hook || ""}"
> **Target App:** ${script.company === "EUNACOM" ? "@eunacomapp_cl" : "@famedapp"}
> **Est. Duration:** ${script.duration_est}

---

## 🎯 3 High-Performing Hook Variations:
`;

  script.hook_variations?.forEach((h, i) => {
    md += `\n### Hook Option ${i + 1} (${h.type}):\n> "${h.hook}"\n`;
  });

  md += `\n---\n\n## 📝 Step-by-Step Script & Visual Cues:\n\n`;

  script.sections?.forEach(s => {
    md += `### ⏱️ ${s.timestamp} · ${s.label}\n`;
    md += `- **👁️ Visual Cue:** *${s.visual_cue}*\n`;
    md += `- **🗣️ Spoken Script:** "${s.spoken_text}"\n\n`;
  });

  md += `\n---\n\n## 📲 Copy-Paste Instagram/TikTok Caption:\n\`\`\`text\n${script.caption_ready_to_post}\n\`\`\`\n`;

  try {
    fs.writeFileSync(filePath, md, "utf-8");
    fs.writeFileSync(path.join(projectsDir, "active-content-task.md"), md, "utf-8");
    res.json({ success: true, file_path: filePath });
  } catch (err) {
    console.error("Error saving task to Obsidian:", err);
    res.status(500).json({ error: "Failed to write file to vault" });
  }
});

// 8. Obsidian Vault File Explorer & Note Reader
app.get("/api/vault/files", (req, res) => {
  try {
    const listDir = (dir, base = "") => {
      let results = [];
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
  const notePath = req.query.path;
  if (!notePath) return res.status(400).json({ error: "Missing path" });
  const fullPath = path.join(VAULT_PATH, notePath);
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

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Social Media Outlier Engine & Intelligence Studio`);
  console.log(`🌐 Web App running at: http://localhost:${PORT}`);
  console.log(`📁 Connected Obsidian Vault: ${VAULT_PATH}`);
  console.log(`======================================================\n`);
});
