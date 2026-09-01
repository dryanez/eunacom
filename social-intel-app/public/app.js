// MedIntel Studio Frontend Application
document.addEventListener("DOMContentLoaded", () => {
  // State
  let currentCompany = "all";
  let currentPlatform = "all";
  let currentPillar = "all";
  let currentMinScore = 0;
  let currentSearch = "";
  let currentView = "excel"; // 'excel' | 'cards'

  let allData = {
    competitors: [],
    outliers: [],
    weekly_sprint_matrix: [],
    hook_formulas: []
  };

  let activeScript = null;
  let activeSprintPlan = null;

  // DOM Elements
  const kpiCreators = document.getElementById("kpi-creators");
  const kpiPosts = document.getElementById("kpi-posts");
  const kpiOutliers = document.getElementById("kpi-outliers");
  const kpiMaxMult = document.getElementById("kpi-max-mult");
  const kpiMaxCreator = document.getElementById("kpi-max-creator");
  const kpiTopPillar = document.getElementById("kpi-top-pillar");

  const tableBody = document.getElementById("table-body");
  const cardsView = document.getElementById("cards-view");
  const tableView = document.getElementById("table-view");
  const emptyState = document.getElementById("empty-state");

  const searchInput = document.getElementById("search-input");
  const clearSearchBtn = document.getElementById("clear-search");
  const pillarSelect = document.getElementById("pillar-select");
  const multiplierSelect = document.getElementById("multiplier-select");

  // Company tabs
  const companyTabs = document.querySelectorAll(".company-tab");
  const platformPills = document.querySelectorAll(".filter-pill");

  // View switchers
  const viewExcelBtn = document.getElementById("view-excel");
  const viewCardsBtn = document.getElementById("view-cards");
  const viewBoardBtn = document.getElementById("view-board");
  const viewAdsBtn = document.getElementById("view-ads");
  const viewCalidoBtn = document.getElementById("view-calido");

  const boardView = document.getElementById("board-view");
  const adsView = document.getElementById("ads-view");
  const calidoView = document.getElementById("calido-view");

  // Kanban state & storage
  const KANBAN_STORAGE_KEY = "medintel_kanban_tasks_v2";
  let kanbanTasks = [];

  function loadKanbanTasks() {
    try {
      const stored = localStorage.getItem(KANBAN_STORAGE_KEY);
      if (stored) {
        kanbanTasks = JSON.parse(stored);
      } else {
        kanbanTasks = [];
      }
    } catch (e) {
      kanbanTasks = [];
    }
  }

  function saveKanbanTasks() {
    try {
      localStorage.setItem(KANBAN_STORAGE_KEY, JSON.stringify(kanbanTasks));
    } catch (e) {
      console.error("Failed to save kanban tasks:", e);
    }
  }

  // 5 Rings Meta Ads Data Structure (Olympic Rings 3:2:2 Dynamic Testing Matrix)
  const metaAds5RingsData = {
    1: {
      ring_num: 1,
      title: "🔴 Ring 1: Problem & Hook (Stop the Scroll)",
      badge_color: "rose",
      goal: "Disrupt the feed of foreign doctors and tap into the core fear of failing the convalidation / licensing exam (60% first-attempt failure rate).",
      creatives: [
        {
          code: "R1_C1_UGC",
          format: "VIDEO (9:16 / 45s)",
          title: "Doctor in Scrubs Empathy Hook",
          prompt: "Doctor speaking outside German/Chilean clinic: '¿Por qué más del 60% de los médicos reprueban en su primer intento? No es falta de conocimiento médico, es falta de entrenamiento con el formato y tiempo real del examen.'"
        },
        {
          code: "R1_C2_TIMER",
          format: "VIDEO (9:16 / 30s)",
          title: "20-Min Countdown Stress Test",
          prompt: "Screen recording of 20-minute Anamnese / EUNACOM timer ticking down rapidly from 03:00 to 00:00 with red grammar error highlights and clinical stress sound."
        },
        {
          code: "R1_C3_STATIC",
          format: "STATIC IMAGE (1:1)",
          title: "High-Contrast Pattern Interrupt",
          prompt: "Bold yellow & dark background: 'CONVALIDACIÓN MÉDICA 2026: Deja de memorizar libros de medicina de forma pasiva. El examen evalúa reflejos clínicos, no memoria fotográfica.'"
        }
      ],
      primary_copies: [
        {
          label: "Text A (Empathy Story & Stakes)",
          text: "Estudiaste 7 años de medicina. Conoces diagnósticos, dosis y guías clínicas. Sin embargo, en el examen de convalidación lo que decide tu aprobación no es cuántos libros leíste, sino tu velocidad para responder preguntas trampa bajo presión de tiempo.\n\nEn FaMED y EUNACOM entrenas con simuladores cronometrados 24/7."
        },
        {
          label: "Text B (Direct ROI & Value)",
          text: "¿Sin profesor particular o academias de más de €80/hora? FaMED y EUNACOM son tus simuladores con inteligencia artificial disponibles 24/7 en tu teléfono.\n\nPractica casos clínicos y preguntas oficiales desde solo €9.99 / $9.990 CLP."
        }
      ],
      headlines: [
        { title: "Pasa tu Examen Médico al 1.er Intento 🚨" },
        { title: "El #1 Simulador de Examen con IA Médica" }
      ]
    },
    2: {
      ring_num: 2,
      title: "🟠 Ring 2: Product & Mechanism (How It Works)",
      badge_color: "amber",
      goal: "Demonstrate the interactive AI patient speech engine, timed exam simulations, and automated clinical scoring.",
      creatives: [
        {
          code: "R2_C1_VOICE",
          format: "VIDEO (9:16 / 40s)",
          title: "AI Voice Dialogue Simulation",
          prompt: "Doctor clicks microphone in app, conducts a live Anamnese dialogue with AI simulated patient 'Herr Meier', and instant grammar/clinical score appears in green."
        },
        {
          code: "R2_C2_3IN1",
          format: "VIDEO (9:16 / 50s)",
          title: "3-Part Exam Simulator Walkthrough",
          prompt: "Split-screen app demo: Station 1 (20-min Anamnese) ➔ Station 2 (Arzt-Arzt handover / ASOFAMECH rubric) ➔ Station 3 (Arztbrief / clinical rationale feedback)."
        },
        {
          code: "R2_C3_CAROUSEL",
          format: "CAROUSEL (4:5 / 5 Slides)",
          title: "50+ Real Exam Protocols Explorer",
          prompt: "Visual walkthrough of verified exam protocols from Landesärztekammern & ASOFAMECH with step-by-step diagnostic breakdown."
        }
      ],
      primary_copies: [
        {
          label: "Text A (Interactive Walkthrough)",
          text: "Así funciona tu entrenamiento diario:\n1. Eliges un caso clínico oficial.\n2. Haces la entrevista médica por voz o respondes el caso en tiempo real.\n3. La IA corrige tu terminología médica, errores diagnósticos y fluidez.\n4. Revisas la pauta exacta de corrección.\n\nEntrena cuando y donde quieras desde tu teléfono."
        },
        {
          label: "Text B (Feature Bullets)",
          text: "✨ +50 Casos y +2,500 preguntas oficiales\n✨ Feedback clínico inmediato con IA\n✨ Simulación cronometrada de 20 minutos\n✨ Pautas de corrección oficiales\n\nPrueba hoy tu diagnóstico gratis en el link."
        }
      ],
      headlines: [
        { title: "Demo en Vivo: Simulador con Pacientes IA 🎙️" },
        { title: "Entrena para tu Examen Médico 24/7" }
      ]
    },
    3: {
      ring_num: 3,
      title: "🟡 Ring 3: Social Proof & Transformation",
      badge_color: "emerald",
      goal: "Build undeniable trust and credibility using real doctor convalidation success stories and passed certificates.",
      creatives: [
        {
          code: "R3_C1_TESTIMONIAL",
          format: "VIDEO (9:16 / 45s)",
          title: "Doctor Holding Passed Certificate",
          prompt: "Doctor in hospital scrubs holding their official Approbation / EUNACOM approval certificate: 'Convalidé en solo 4 meses entrenando 30 minutos al día con el simulador.'"
        },
        {
          code: "R3_C2_WHATSAPP",
          format: "REEL (9:16 / 30s)",
          title: "Celebration Messages Montage",
          prompt: "Rapid dynamic montage of real WhatsApp and Telegram messages: '¡Aprobé con 82%!', '¡Pasé la FSP al primer intento!', '¡Ya tengo mi contrato en el hospital!'."
        },
        {
          code: "R3_C3_BADGE",
          format: "STATIC IMAGE (1:1)",
          title: "Trust Badge & Statistics",
          prompt: "Gold trust badge: '4.9 / 5 estrellas por más de 550+ médicos. 97% de tasa de aprobación en el primer intento con nuestro método de repetición espaciada.'"
        }
      ],
      primary_copies: [
        {
          label: "Text A (Real Transformation Story)",
          text: "'Pensé que convalidar en Alemania / Chile me tomaría 2 años. Con el simulador practiqué 3 casos al día saliendo de mi turno. Hoy ya trabajo como médico contratado.'\n\nÚnete a la comunidad de más de 550 médicos que ya aprobaron."
        },
        {
          label: "Text B (Data & Pass Rate)",
          text: "Más de 550 médicos ya se preparan con nosotros. El 97% de quienes completan al menos 30 simulacros aprueban su examen en la primera fecha oficial."
        }
      ],
      headlines: [
        { title: "97% de Aprobación en Primer Intento ⭐" },
        { title: "Historias Reales de Médicos Convalidados" }
      ]
    },
    4: {
      ring_num: 4,
      title: "🟢 Ring 4: Price & Objection Crusher",
      badge_color: "cyan",
      goal: "Address and eliminate the biggest objections: high tutoring costs, lack of time, and busy hospital shifts.",
      creatives: [
        {
          code: "R4_C1_COMPARE",
          format: "IMAGE (1:1 / Comparison)",
          title: "Academy (€80/hr) vs App (€0.86/day)",
          prompt: "Side-by-side comparison table: 'Profesor particular: €80/hora, horarios rígidos, sin grabaciones' vs 'Simulador IA: €0.86/día (€25.99/mes), práctica ilimitada 24/7, feedback instantáneo'."
        },
        {
          code: "R4_C2_SHIFT",
          format: "VIDEO (9:16 / 30s)",
          title: "Study in 15 Minutes Between Shifts",
          prompt: "Doctor in hospital on coffee break: 'No tienes que estudiar 6 horas seguidas. 1 caso clínico de 15 minutos en cada descanso te da 90 casos resueltos al mes.'"
        },
        {
          code: "R4_C3_REFUND",
          format: "STATIC (1:1)",
          title: "Risk-Free Trial Assurance",
          prompt: "Clean minimal graphic: 'Prueba 7 días sin riesgo. Cancela en 1 clic cuando quieras. Todo el contenido oficial en la palma de tu mano.'"
        }
      ],
      primary_copies: [
        {
          label: "Text A (Cost Comparison)",
          text: "Una sola hora con un tutor privado cuesta entre €50 y €80. Con FaMED / EUNACOM obtienes acceso ilimitado a todo el simulador, casos clínicos y correcciones automáticas por solo €25.99 al mes (€0.86 por día).\n\nInvierte en tu convalidación sin pagar miles de euros en academias tradicionales."
        },
        {
          label: "Text B (No Time Objection)",
          text: "¿Haces turnos de 24 horas y no tienes tiempo para clases fijas? Entrena con casos cortos de 10 minutos adaptados a tu ritmo."
        }
      ],
      headlines: [
        { title: "¿Por qué pagar €80/hora por clases? 💡" },
        { title: "Entrena en tus descansos de guardia" }
      ]
    },
    5: {
      ring_num: 5,
      title: "🟣 Ring 5: Direct Offer & Urgency",
      badge_color: "purple",
      goal: "Drive immediate conversions for doctors with upcoming exam dates within 30 to 90 days.",
      creatives: [
        {
          code: "R5_C1_OFFER",
          format: "VIDEO (9:16 / 35s)",
          title: "Countdown to Exam Date Sprint",
          prompt: "¿Tienes fecha de examen en los próximos 30 o 60 días? Activa tu Pase Intensivo de 1 Mes por solo €25.99 o Pase Trimestral por €69.99 y completa los 50 casos esenciales antes de tu examen."
        },
        {
          code: "R5_C2_BUNDLE",
          format: "STATIC (1:1)",
          title: "Pricing Matrix Boxshot",
          prompt: "Clear visual breakdown of plans: 1 Semana Sprint (€9.99) | 1 Mes Intensivo (€25.99) | 3 Meses Maestría (€69.99) con botón de inicio inmediato."
        },
        {
          code: "R5_C3_URGENCY",
          format: "REEL (9:16 / 25s)",
          title: "Don't Waste 6 Months Waiting for Next Date",
          prompt: "Reprobar significa esperar 6 meses más y perder miles de euros en sueldo de médico. Asegura tu aprobación hoy."
        }
      ],
      primary_copies: [
        {
          label: "Text A (Direct Offer & Pricing)",
          text: "🚀 Tu Pase Intensivo para Convalidar:\n\n⚡ 1 Semana Sprint: €9.99\n🔥 1 Mes Intensivo: €25.99 (€0.86/día)\n💎 3 Meses Completos: €69.99\n\nAcceso inmediato a todos los casos oficiales, simulaciones por voz y banco de preguntas."
        },
        {
          label: "Text B (Urgency & Loss Aversion)",
          text: "Reprobar un examen de convalidación te retrasa entre 4 y 6 meses. Empieza tu preparación hoy mismo."
        }
      ],
      headlines: [
        { title: "Empieza tu Pase Intensivo desde €9.99 🔥" },
        { title: "Asegura tu fecha de examen hoy" }
      ]
    }
  };

  // Modals
  const scriptModal = document.getElementById("script-modal");
  const plannerModal = document.getElementById("planner-modal");
  const scrapeModal = document.getElementById("scrape-modal");
  const vaultModal = document.getElementById("vault-modal");

  const btnSmartPlanner = document.getElementById("btn-smart-planner");
  const btnRunScrape = document.getElementById("btn-run-scrape");
  const btnOpenVault = document.getElementById("btn-open-vault");
  const scrapeLogs = document.getElementById("scrape-console-logs");
  const scrapeStatusText = document.getElementById("console-status-text");
  const btnCloseConsole = document.getElementById("btn-close-console");

  // Archetype Styling Maps
  const archetypeBadgeClasses = {
    clinical_quiz: "archetype-cyan",
    traps_asofamech: "archetype-amber",
    radar_burocratico: "archetype-rose",
    visual_algorithm: "archetype-purple",
    salary_cesfam: "archetype-emerald",
    chilean_lingo: "archetype-blue",
    active_recall_famed: "archetype-pink"
  };

  const archetypeLabels = {
    clinical_quiz: "🩺 Caso Clínico & Quiz",
    traps_asofamech: "⚠️ Trampa ASOFAMECH",
    radar_burocratico: "🚨 Radar Burocrático",
    visual_algorithm: "🧠 Algoritmo de 1-Pág",
    salary_cesfam: "💵 Sueldos & CESFAM",
    chilean_lingo: "🇨🇱 Modismos Médicos",
    active_recall_famed: "⚡ Active Recall & Anki"
  };

  // 1. Fetch initial data from server API
  async function loadData() {
    try {
      const params = new URLSearchParams({
        company: currentCompany,
        platform: currentPlatform,
        archetype: currentPillar,
        min_score: currentMinScore,
        search: currentSearch
      });

      const res = await fetch(`/api/data?${params.toString()}`);
      const data = await res.json();
      allData = data;
      renderAll();
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  }

  // 2. Render KPIs & Dashboard
  function renderAll() {
    renderKPIs();
    if (currentView === "excel") {
      tableView.style.display = "block";
      cardsView.style.display = "none";
      boardView.style.display = "none";
      adsView.style.display = "none";
      if (calidoView) calidoView.style.display = "none";
      renderTable();
    } else if (currentView === "cards") {
      tableView.style.display = "none";
      cardsView.style.display = "grid";
      boardView.style.display = "none";
      adsView.style.display = "none";
      if (calidoView) calidoView.style.display = "none";
      renderCards();
    } else if (currentView === "board") {
      tableView.style.display = "none";
      cardsView.style.display = "none";
      boardView.style.display = "flex";
      adsView.style.display = "none";
      if (calidoView) calidoView.style.display = "none";
      renderBoard();
    } else if (currentView === "ads") {
      tableView.style.display = "none";
      cardsView.style.display = "none";
      boardView.style.display = "none";
      adsView.style.display = "flex";
      if (calidoView) calidoView.style.display = "none";
      render5RingsAds(currentActiveRing || 1);
    } else if (currentView === "calido") {
      tableView.style.display = "none";
      cardsView.style.display = "none";
      boardView.style.display = "none";
      adsView.style.display = "none";
      if (calidoView) {
        calidoView.style.display = "flex";
        populateCalidoOutlierPicker();
        renderCalidoStudio();
      }
    }
  }

  let currentActiveRing = 1;

  // Render Kanban Board
  function renderBoard() {
    loadKanbanTasks();
    const outliers = allData.outliers || [];

    // Seed default tasks if empty
    if (kanbanTasks.length === 0 && outliers.length > 0) {
      const topOutliers = outliers.slice(0, 8);
      const stages = ["backlog", "scripting", "recording", "editing", "published"];
      kanbanTasks = topOutliers.map((o, idx) => ({
        id: "task_" + o.id + "_" + idx,
        outlier_id: o.id,
        title: o.hook_text || `Counter-content against @${o.competitor_handle}`,
        handle: o.competitor_handle,
        company: o.company || (o.category ? o.category.toUpperCase() : "EUNACOM"),
        platform: o.platform || "instagram",
        multiplier: o.outlier_score,
        archetype: o.archetype || o.pillar || "clinical_quiz",
        archetype_label: o.archetype_label || archetypeLabels[o.archetype] || "🩺 Caso Clínico",
        format: o.media_type || "reel",
        stage: stages[idx % stages.length],
        created_at: new Date().toISOString(),
        raw_post: o
      }));
      saveKanbanTasks();
    }

    const stages = ["backlog", "scripting", "recording", "editing", "published"];
    stages.forEach(stage => {
      const listEl = document.getElementById(`list-${stage}`);
      const countEl = document.getElementById(`count-${stage}`);
      if (!listEl) return;

      const stageTasks = kanbanTasks.filter(t => {
        if (currentCompany !== "all") {
          return t.stage === stage && (t.company || "").toUpperCase() === currentCompany.toUpperCase();
        }
        return t.stage === stage;
      });

      if (countEl) countEl.textContent = stageTasks.length.toString();
      listEl.innerHTML = "";

      if (stageTasks.length === 0) {
        listEl.innerHTML = `<div style="padding:20px; text-align:center; color:var(--text-muted); font-size:11px;">No tasks in this stage</div>`;
        return;
      }

      stageTasks.forEach(task => {
        const card = document.createElement("div");
        card.className = "kanban-card";

        const archKey = task.archetype || "clinical_quiz";
        const badgeCls = archetypeBadgeClasses[archKey] || "archetype-cyan";
        const badgeLbl = task.archetype_label || archetypeLabels[archKey] || "🩺 Caso Clínico";

        const currentStageIdx = stages.indexOf(task.stage);
        const prevStage = currentStageIdx > 0 ? stages[currentStageIdx - 1] : null;
        const nextStage = currentStageIdx < stages.length - 1 ? stages[currentStageIdx + 1] : null;

        card.innerHTML = `
          <div class="kanban-card-header">
            <span class="archetype-badge ${badgeCls}" style="font-size:9px; padding:2px 5px;">${badgeLbl}</span>
            <span class="outlier-pill viral-high" style="font-size:9px; padding:1px 5px;">${task.multiplier}x</span>
          </div>
          <div class="kanban-card-title" title="${task.title}">"${task.title}"</div>
          <div class="kanban-card-meta">
            <span style="font-size:11px; color:var(--text-muted);">@${task.handle}</span>
            <span class="company-tag ${(task.company || 'eunacom').toLowerCase()}" style="font-size:8px;">${task.company || 'EUNACOM'}</span>
          </div>
          <div class="kanban-card-actions">
            <div style="display:flex; gap:4px;">
              ${prevStage ? `<button class="btn-kanban-nav btn-move-task" data-id="${task.id}" data-to="${prevStage}" title="Move left">◀</button>` : ''}
              ${nextStage ? `<button class="btn-kanban-nav btn-move-task" data-id="${task.id}" data-to="${nextStage}" title="Move right">▶</button>` : ''}
            </div>
            <div style="display:flex; gap:4px;">
              <button class="btn-table-action btn-kanban-script" data-id="${task.id}" style="font-size:10px; padding:2px 6px;">🚀 Script</button>
              <button class="btn-kanban-nav btn-del-task" data-id="${task.id}" style="color:#f87171;" title="Delete task">✕</button>
            </div>
          </div>
        `;

        listEl.appendChild(card);
      });
    });

    // Attach Kanban Event Handlers
    document.querySelectorAll(".btn-move-task").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const taskId = e.currentTarget.getAttribute("data-id");
        const toStage = e.currentTarget.getAttribute("data-to");
        const task = kanbanTasks.find(t => t.id === taskId);
        if (task) {
          task.stage = toStage;
          saveKanbanTasks();
          renderBoard();
        }
      });
    });

    document.querySelectorAll(".btn-del-task").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const taskId = e.currentTarget.getAttribute("data-id");
        kanbanTasks = kanbanTasks.filter(t => t.id !== taskId);
        saveKanbanTasks();
        renderBoard();
      });
    });

    document.querySelectorAll(".btn-kanban-script").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const taskId = e.currentTarget.getAttribute("data-id");
        const task = kanbanTasks.find(t => t.id === taskId);
        if (task) {
          const post = task.raw_post || allData.outliers.find(o => o.id === task.outlier_id) || {
            competitor_handle: task.handle,
            competitor_name: task.handle,
            hook_text: task.title,
            outlier_score: task.multiplier,
            company: task.company,
            url: `https://www.tiktok.com/@${task.handle}`,
            archetype_label: task.archetype_label
          };
          openScriptStudio(post);
        }
      });
    });
  }

  // 5 Rings Meta Ads Renderer
  function render5RingsAds(ringNum = 1) {
    currentActiveRing = ringNum;
    const ringData = metaAds5RingsData[ringNum] || metaAds5RingsData[1];
    const deck = document.getElementById("ring-content-deck");
    if (!deck) return;

    // Update active tab styling
    document.querySelectorAll(".ring-tab").forEach(tab => {
      const r = parseInt(tab.getAttribute("data-ring"), 10);
      if (r === ringNum) {
        tab.classList.add("active");
      } else {
        tab.classList.remove("active");
      }
    });

    let creativesHtml = "";
    ringData.creatives.forEach(c => {
      creativesHtml += `
        <div class="creative-card">
          <div class="creative-card-header">
            <span class="creative-code-badge">${c.code}</span>
            <span class="creative-format-badge">${c.format}</span>
          </div>
          <strong style="color:#fff; font-size:13px;">${c.title}</strong>
          <div class="creative-prompt-box">
            ${c.prompt}
          </div>
          <button class="btn btn-secondary btn-copy-creative" data-prompt="${encodeURIComponent(c.prompt)}" style="font-size:11px; padding:4px 8px; justify-content:center;">
            <span>📋</span> Copy Creative Prompt
          </button>
        </div>
      `;
    });

    let copiesHtml = "";
    ringData.primary_copies.forEach(cp => {
      copiesHtml += `
        <div class="copy-card">
          <div class="copy-card-header">
            <span class="copy-label">${cp.label}</span>
          </div>
          <div class="copy-text-box">${cp.text}</div>
          <button class="btn btn-secondary btn-copy-text" data-text="${encodeURIComponent(cp.text)}" style="font-size:11px; padding:4px 8px; justify-content:center;">
            <span>📋</span> Copy Primary Text
          </button>
        </div>
      `;
    });

    let headlinesHtml = "";
    ringData.headlines.forEach((hl, i) => {
      headlinesHtml += `
        <div class="headline-item">
          <span class="headline-text">Headline ${i + 1}: ${hl.title}</span>
          <button class="btn-copy-mini btn-copy-hl" data-hl="${encodeURIComponent(hl.title)}">📋 Copy</button>
        </div>
      `;
    });

    deck.innerHTML = `
      <div class="ring-goal-banner">
        <div class="ring-goal-text">
          <strong>🎯 Ring Objective:</strong> ${ringData.goal}
        </div>
        <button class="btn btn-primary highlight" id="btn-copy-ring-bundle" style="font-size:11px; padding:4px 12px; white-space:nowrap;">
          <span>📦</span> Copy Full Ring 3:2:2 Bundle
        </button>
      </div>

      <div class="ring-section">
        <h3 class="section-title">🎬 3 Dynamic Creatives (Video UGC, Demo &amp; Static):</h3>
        <div class="creatives-grid">
          ${creativesHtml}
        </div>
      </div>

      <div class="ring-section">
        <h3 class="section-title">✍️ 2 High-Converting Primary Copies:</h3>
        <div class="primary-copies-grid">
          ${copiesHtml}
        </div>
      </div>

      <div class="ring-section">
        <h3 class="section-title">📌 2 Punchy Headlines:</h3>
        <div class="headlines-grid">
          ${headlinesHtml}
        </div>
      </div>
    `;

    // Event listeners for copy buttons inside Meta Ads view
    deck.querySelectorAll(".btn-copy-creative").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const prompt = decodeURIComponent(e.currentTarget.getAttribute("data-prompt"));
        navigator.clipboard.writeText(prompt);
        btn.innerHTML = "<span>✓ Copied!</span>";
        setTimeout(() => { btn.innerHTML = "<span>📋</span> Copy Creative Prompt"; }, 1500);
      });
    });

    deck.querySelectorAll(".btn-copy-text").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const text = decodeURIComponent(e.currentTarget.getAttribute("data-text"));
        navigator.clipboard.writeText(text);
        btn.innerHTML = "<span>✓ Copied!</span>";
        setTimeout(() => { btn.innerHTML = "<span>📋</span> Copy Primary Text"; }, 1500);
      });
    });

    deck.querySelectorAll(".btn-copy-hl").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const hl = decodeURIComponent(e.currentTarget.getAttribute("data-hl"));
        navigator.clipboard.writeText(hl);
        btn.textContent = "✓ Copied!";
        setTimeout(() => { btn.textContent = "📋 Copy"; }, 1500);
      });
    });

    const btnCopyBundle = deck.querySelector("#btn-copy-ring-bundle");
    if (btnCopyBundle) {
      btnCopyBundle.addEventListener("click", () => {
        let bundle = `# ${ringData.title}\n\n**Goal:** ${ringData.goal}\n\n## 🎬 3 Creatives:\n`;
        ringData.creatives.forEach(c => {
          bundle += `### ${c.code} (${c.format}) — ${c.title}\n> ${c.prompt}\n\n`;
        });
        bundle += `## ✍️ 2 Primary Texts:\n`;
        ringData.primary_copies.forEach(cp => {
          bundle += `### ${cp.label}\n${cp.text}\n\n`;
        });
        bundle += `## 📌 2 Headlines:\n`;
        ringData.headlines.forEach((hl, i) => {
          bundle += `${i + 1}. ${hl.title}\n`;
        });
        navigator.clipboard.writeText(bundle);
        btnCopyBundle.innerHTML = "<span>✓ Full 3:2:2 Bundle Copied!</span>";
        setTimeout(() => { btnCopyBundle.innerHTML = "<span>📦</span> Copy Full Ring 3:2:2 Bundle"; }, 2000);
      });
    }
  }

  // Ring tab switching event listeners
  document.querySelectorAll(".ring-tab").forEach(tab => {
    tab.addEventListener("click", (e) => {
      const ringNum = parseInt(e.currentTarget.getAttribute("data-ring"), 10);
      render5RingsAds(ringNum);
    });
  });

  // Custom Task Creator Modal
  const customTaskModal = document.getElementById("custom-task-modal");
  const btnAddCustomTask = document.getElementById("btn-add-custom-task");
  const btnCancelCustomTask = document.getElementById("btn-cancel-custom-task");
  const btnSaveCustomTask = document.getElementById("btn-save-custom-task");

  if (btnAddCustomTask) {
    btnAddCustomTask.addEventListener("click", () => {
      customTaskModal.style.display = "flex";
      document.getElementById("task-hook-input").value = "";
    });
  }

  if (btnCancelCustomTask) {
    btnCancelCustomTask.addEventListener("click", () => {
      customTaskModal.style.display = "none";
    });
  }

  const closeCustomTaskBtn = document.getElementById("close-custom-task-modal");
  if (closeCustomTaskBtn) {
    closeCustomTaskBtn.addEventListener("click", () => {
      customTaskModal.style.display = "none";
    });
  }

  if (btnSaveCustomTask) {
    btnSaveCustomTask.addEventListener("click", () => {
      const company = document.getElementById("task-company-input").value;
      const archetype = document.getElementById("task-archetype-input").value;
      const hookText = document.getElementById("task-hook-input").value.trim();
      const format = document.getElementById("task-format-input").value;
      const stage = document.getElementById("task-stage-input").value;

      if (!hookText) {
        alert("Please enter a video hook or post concept!");
        return;
      }

      loadKanbanTasks();
      const newTask = {
        id: "task_custom_" + Date.now(),
        title: hookText,
        handle: company.toLowerCase() + "_prep",
        company: company,
        platform: format === "carousel" ? "instagram" : "tiktok",
        multiplier: 4.5,
        archetype: archetype,
        archetype_label: archetypeLabels[archetype] || "🩺 Caso Clínico",
        format: format,
        stage: stage,
        created_at: new Date().toISOString()
      };

      kanbanTasks.unshift(newTask);
      saveKanbanTasks();
      customTaskModal.style.display = "none";
      renderBoard();
    });
  }

  // Export Kanban Board to Vault
  const btnSyncBoardVault = document.getElementById("btn-sync-board-vault");
  if (btnSyncBoardVault) {
    btnSyncBoardVault.addEventListener("click", async () => {
      loadKanbanTasks();
      btnSyncBoardVault.innerHTML = "<span>⏳ Exporting...</span>";

      let md = `---
type: obsidian-production-board
created_at: ${new Date().toISOString()}
total_tasks: ${kanbanTasks.length}
status: in-progress
---

# 📋 Solopreneur Content Production Board & Action Steps

`;
      const stages = [
        { key: "backlog", title: "📥 Backlog & Outliers Pool" },
        { key: "scripting", title: "✍️ In Scripting (AI Script Studio)" },
        { key: "recording", title: "🎥 Ready to Record / Teleprompter" },
        { key: "editing", title: "✂️ In Editing & Graphics" },
        { key: "published", title: "🚀 Scheduled & Published Live" }
      ];

      stages.forEach(st => {
        const tasks = kanbanTasks.filter(t => t.stage === st.key);
        md += `## ${st.title} (${tasks.length})\n\n`;
        if (tasks.length === 0) {
          md += `*No tasks in this column.*\n\n`;
        } else {
          tasks.forEach((t, i) => {
            md += `### ${i + 1}. [${t.company}] ${t.archetype_label} — ${t.multiplier}x Multiplier\n`;
            md += `- **Hook / Concept:** "${t.title}"\n`;
            md += `- **Format:** \`${t.format.toUpperCase()}\` · **Creator Reference:** @${t.handle}\n`;
            md += `- **Status:** \`${t.stage.toUpperCase()}\`\n\n`;
          });
        }
      });

      try {
        const res = await fetch("/api/obsidian/save-task", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            script: {
              company: currentCompany === "all" ? "EUNACOM" : currentCompany,
              target_platform: "BOARD_SYNC",
              duration_est: `${kanbanTasks.length} tasks`,
              competitor_reference: {
                handle: "obsidian_production_board",
                original_hook: "Complete Kanban Production Pipeline",
                outlier_score: 5.0
              },
              hook_variations: [],
              sections: [],
              caption_ready_to_post: md
            }
          })
        });
        const data = await res.json();
        if (data.success) {
          btnSyncBoardVault.innerHTML = "<span>✓ Saved to Vault!</span>";
          setTimeout(() => { btnSyncBoardVault.innerHTML = "<span>💾</span> Export Board to Vault"; }, 2000);
        }
      } catch (e) {
        console.error(e);
        btnSyncBoardVault.innerHTML = "<span>❌ Error</span>";
      }
    });
  }

  function renderKPIs() {
    const outliers = allData.outliers || [];
    const comps = allData.competitors || [];

    kpiCreators.textContent = comps.length.toString();
    kpiPosts.textContent = outliers.length.toString();

    const viralOutliers = outliers.filter(o => (o.outlier_score || 1) >= 1.3);
    kpiOutliers.textContent = viralOutliers.length.toString();

    if (outliers.length > 0) {
      const topOutlier = outliers.reduce((prev, cur) => (cur.outlier_score > prev.outlier_score ? cur : prev), outliers[0]);
      kpiMaxMult.textContent = `${topOutlier.outlier_score}x`;
      kpiMaxCreator.textContent = `@${topOutlier.competitor_handle} (${topOutlier.company || "EUNACOM"})`;
    } else {
      kpiMaxMult.textContent = "--";
      kpiMaxCreator.textContent = "No data";
    }

    // Top pillar/archetype calculation
    const archCounts = {};
    outliers.forEach(o => {
      const k = o.archetype || o.pillar || "clinical_quiz";
      archCounts[k] = (archCounts[k] || 0) + (o.comments * 3 + o.likes);
    });

    let topArchKey = "clinical_quiz";
    let maxArchScore = -1;
    for (const [k, v] of Object.entries(archCounts)) {
      if (v > maxArchScore) {
        maxArchScore = v;
        topArchKey = k;
      }
    }

    kpiTopPillar.textContent = archetypeLabels[topArchKey] || "🩺 Casos Clínicos";
  }

  // 3. Render Table (Excel Matrix View)
  function renderTable() {
    tableBody.innerHTML = "";
    const outliers = allData.outliers || [];

    if (outliers.length === 0) {
      emptyState.style.display = "block";
      tableView.style.display = "none";
      return;
    }
    emptyState.style.display = "none";
    tableView.style.display = "block";

    outliers.forEach((post) => {
      const tr = document.createElement("tr");

      // Virality Pill Class
      let scoreClass = "viral-med";
      if (post.outlier_score >= 10.0) scoreClass = "viral-super";
      else if (post.outlier_score >= 3.0) scoreClass = "viral-high";

      // Platform badge
      const isIG = (post.platform || "instagram") === "instagram";
      const platformIcon = isIG ? "📸 IG" : "🎵 TT";

      // Color-coded Archetype
      const archKey = post.archetype || post.pillar || "clinical_quiz";
      const badgeClass = archetypeBadgeClasses[archKey] || "archetype-cyan";
      const badgeLabel = post.archetype_label || archetypeLabels[archKey] || "🩺 Caso Clínico";

      // Media thumbnail fallback
      const thumbUrl = post.thumbnail || "";
      const mediaThumbHtml = thumbUrl
        ? `<div class="media-preview-box"><img src="${thumbUrl}" alt="media" onerror="this.style.display='none';"><span class="media-type-tag">${(post.media_type || "reel").toUpperCase()}</span></div>`
        : `<div class="media-preview-box"><span style="font-size:20px;">${post.media_type === "reel" ? "🎬" : "🖼️"}</span><span class="media-type-tag">${(post.media_type || "reel").toUpperCase()}</span></div>`;

      tr.innerHTML = `
        <td>${mediaThumbHtml}</td>
        <td>
          <div class="creator-cell">
            <span class="creator-name">${post.competitor_name || post.competitor_handle}</span>
            <a href="${post.profile_url || post.url}" target="_blank" class="creator-handle" title="Open Creator Profile">@${post.competitor_handle} ↗</a>
            <span class="company-tag ${(post.company || post.category || 'eunacom').toLowerCase()}">${(post.company || post.category || 'EUNACOM').toUpperCase()}</span>
          </div>
        </td>
        <td>
          <span style="font-size: 11px; font-weight: 700; color: var(--text-secondary);">${platformIcon}</span>
        </td>
        <td style="text-align: center;">
          <span class="outlier-pill ${scoreClass}">${post.outlier_score}x</span>
        </td>
        <td>
          <div class="eng-metrics">
            <span class="likes">❤️ ${Number(post.likes).toLocaleString()}</span>
            <span>💬 ${Number(post.comments).toLocaleString()}</span>
            <span>👁️ ${Number(post.views || 0).toLocaleString()}</span>
          </div>
        </td>
        <td>
          <div class="hook-cell">
            <div class="hook-text">"${post.hook_text || post.caption.slice(0, 90)}"</div>
            <span class="archetype-badge ${badgeClass}">${badgeLabel}</span>
          </div>
        </td>
        <td>
          <div class="why-cell" title="${post.why_converted}">${post.why_converted}</div>
        </td>
        <td>
          <div class="action-cell">
            <button class="btn-table-action btn-gen-script" data-id="${post.id}" title="Generate AI Counter Script">
              <span>🚀</span> Script
            </button>
            <button class="btn-table-action btn-add-to-kanban" data-id="${post.id}" title="Add to Obsidian Production Board" style="background:rgba(255,255,255,0.08); border-color:var(--border-subtle);">
              <span>📋</span> +Board
            </button>
            <a href="${post.profile_url || post.url}" target="_blank" class="btn-link-icon" title="Open Creator Profile on ${isIG ? 'Instagram' : 'TikTok'}">👤</a>
            <a href="${post.search_url || post.url}" target="_blank" class="btn-link-icon" title="Explore Topic on ${isIG ? 'Instagram' : 'TikTok'}">🔍</a>
          </div>
        </td>
      `;

      tableBody.appendChild(tr);
    });

    // Attach click events for script generator and add-to-kanban buttons
    document.querySelectorAll(".btn-gen-script").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        const post = allData.outliers.find(p => p.id === id);
        if (post) openScriptStudio(post);
      });
    });

    document.querySelectorAll(".btn-add-to-kanban").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        const post = allData.outliers.find(p => p.id === id);
        if (post) {
          loadKanbanTasks();
          const newTask = {
            id: "task_" + post.id + "_" + Date.now(),
            outlier_id: post.id,
            title: post.hook_text || `Counter-content @${post.competitor_handle}`,
            handle: post.competitor_handle,
            company: post.company || (post.category ? post.category.toUpperCase() : "EUNACOM"),
            platform: post.platform || "instagram",
            multiplier: post.outlier_score,
            archetype: post.archetype || post.pillar || "clinical_quiz",
            archetype_label: post.archetype_label || archetypeLabels[post.archetype] || "🩺 Caso Clínico",
            format: post.media_type || "reel",
            stage: "backlog",
            created_at: new Date().toISOString(),
            raw_post: post
          };
          kanbanTasks.unshift(newTask);
          saveKanbanTasks();
          e.currentTarget.innerHTML = "<span>✓ Added!</span>";
          setTimeout(() => {
            e.currentTarget.innerHTML = "<span>📋</span> +Board";
          }, 1500);
        }
      });
    });
  }

  // 4. Render Visual Cards
  function renderCards() {
    cardsView.innerHTML = "";
    const outliers = allData.outliers || [];

    if (outliers.length === 0) {
      emptyState.style.display = "block";
      cardsView.style.display = "none";
      return;
    }
    emptyState.style.display = "none";
    cardsView.style.display = "grid";

    outliers.forEach(post => {
      const card = document.createElement("div");
      card.className = "outlier-card";

      let scoreClass = "viral-med";
      if (post.outlier_score >= 10.0) scoreClass = "viral-super";
      else if (post.outlier_score >= 3.0) scoreClass = "viral-high";

      const archKey = post.archetype || post.pillar || "clinical_quiz";
      const badgeClass = archetypeBadgeClasses[archKey] || "archetype-cyan";
      const badgeLabel = post.archetype_label || archetypeLabels[archKey] || "🩺 Caso Clínico";

      card.innerHTML = `
        <div class="card-header">
          <div class="creator-cell">
            <span class="creator-name">${post.competitor_name}</span>
            <span class="creator-handle">@${post.competitor_handle} · <span class="company-tag ${(post.company || 'eunacom').toLowerCase()}">${post.company || 'EUNACOM'}</span></span>
          </div>
          <span class="outlier-pill ${scoreClass}">${post.outlier_score}x</span>
        </div>
        <div class="card-body">
          <div class="card-hook">"${post.hook_text}"</div>
          <div class="card-why"><strong>Why it worked:</strong> ${post.why_converted}</div>
          <div style="font-size:11px; color:var(--text-muted); display:flex; justify-content:space-between;">
            <span>❤️ ${Number(post.likes).toLocaleString()} likes</span>
            <span>💬 ${Number(post.comments).toLocaleString()} comments</span>
            <span>👁️ ${Number(post.views || 0).toLocaleString()} views</span>
          </div>
        </div>
        <div class="card-footer">
          <span class="archetype-badge ${badgeClass}">${badgeLabel}</span>
          <div style="display:flex; gap:6px; align-items:center;">
            <a href="${post.profile_url || post.url}" target="_blank" class="btn-link-icon" title="Open Creator Profile">👤</a>
            <a href="${post.search_url || post.url}" target="_blank" class="btn-link-icon" title="Explore Topic">🔍</a>
            <button class="btn-table-action btn-add-to-kanban" data-id="${post.id}" title="Add to Obsidian Production Board" style="background:rgba(255,255,255,0.08); border-color:var(--border-subtle);">
              <span>📋</span> +Board
            </button>
            <button class="btn-table-action btn-gen-script" data-id="${post.id}">
              <span>🚀</span> Script
            </button>
          </div>
        </div>
      `;
      cardsView.appendChild(card);
    });

    document.querySelectorAll(".btn-gen-script").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        const post = allData.outliers.find(p => p.id === id);
        if (post) openScriptStudio(post);
      });
    });

    document.querySelectorAll(".btn-add-to-kanban").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        const post = allData.outliers.find(p => p.id === id);
        if (post) {
          loadKanbanTasks();
          const newTask = {
            id: "task_" + post.id + "_" + Date.now(),
            outlier_id: post.id,
            title: post.hook_text || `Counter-content @${post.competitor_handle}`,
            handle: post.competitor_handle,
            company: post.company || (post.category ? post.category.toUpperCase() : "EUNACOM"),
            platform: post.platform || "instagram",
            multiplier: post.outlier_score,
            archetype: post.archetype || post.pillar || "clinical_quiz",
            archetype_label: post.archetype_label || archetypeLabels[post.archetype] || "🩺 Caso Clínico",
            format: post.media_type || "reel",
            stage: "backlog",
            created_at: new Date().toISOString(),
            raw_post: post
          };
          kanbanTasks.unshift(newTask);
          saveKanbanTasks();
          e.currentTarget.innerHTML = "<span>✓ Added!</span>";
          setTimeout(() => {
            e.currentTarget.innerHTML = "<span>📋</span> +Board";
          }, 1500);
        }
      });
    });
  }

  // 5. Open AI Script Studio Modal
  async function openScriptStudio(post) {
    scriptModal.style.display = "flex";
    document.getElementById("script-modal-title").textContent = `Counter-Script for @${post.competitor_handle} (${post.outlier_score}x Viral Multiplier)`;
    document.getElementById("script-target-brand").textContent = post.company === "EUNACOM" ? "@eunacomapp_cl (EUNACOM)" : "@famedapp (FAMED)";
    document.getElementById("script-comp-link").href = post.url;

    // Call server AI script generator
    try {
      const res = await fetch("/api/ai/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post })
      });
      const scriptData = await res.json();
      activeScript = scriptData;
      renderScriptModalContent(scriptData);
    } catch (err) {
      console.error("Error generating script:", err);
    }
  }

  function renderScriptModalContent(script) {
    // 1. Render Hook Variations
    const hooksContainer = document.getElementById("script-hooks-list");
    hooksContainer.innerHTML = "";
    script.hook_variations.forEach((h, index) => {
      const card = document.createElement("div");
      card.className = `hook-option-card ${index === 0 ? "selected" : ""}`;
      card.innerHTML = `
        <div class="hook-type-label">${h.type}</div>
        <div class="hook-quote">"${h.hook}"</div>
      `;
      card.addEventListener("click", () => {
        document.querySelectorAll(".hook-option-card").forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        // Update first step spoken text
        if (script.sections && script.sections[0]) {
          script.sections[0].spoken_text = h.hook;
          const firstStepSpoken = document.querySelector("#script-timeline .step-spoken");
          if (firstStepSpoken) firstStepSpoken.textContent = `"${h.hook}"`;
        }
      });
      hooksContainer.appendChild(card);
    });

    // 2. Render Timeline Steps / Carousel Slides
    const timelineContainer = document.getElementById("script-timeline");
    timelineContainer.innerHTML = "";
    const isCarousel = script.format_type === "carousel";

    script.sections.forEach(step => {
      const div = document.createElement("div");
      div.className = "script-timeline-step";
      div.innerHTML = `
        <span class="step-time-badge" style="${isCarousel ? 'background:rgba(168,85,247,0.15); color:var(--accent-purple); border-color:rgba(168,85,247,0.3);' : ''}">${step.timestamp} · ${step.label}</span>
        <div class="step-visual">👁️ Visual Layout: <em>${step.visual_cue}</em></div>
        <div class="step-spoken" style="${isCarousel ? 'color:var(--text-primary); font-family:inherit; white-space:pre-line;' : ''}">${isCarousel ? step.spoken_text : `"${step.spoken_text}"`}</div>
      `;
      timelineContainer.appendChild(div);
    });

    // 3. Render Caption
    document.getElementById("script-caption-text").textContent = script.caption_ready_to_post;
  }

  // 6. 7-Day Smart Weekly Content Planner
  btnSmartPlanner.addEventListener("click", async () => {
    plannerModal.style.display = "flex";
    const targetComp = currentCompany === "all" ? "EUNACOM" : currentCompany;
    document.getElementById("planner-target-company").textContent = `${targetComp} (${targetComp === "EUNACOM" ? "@eunacomapp_cl" : "@famedapp"})`;

    const grid = document.getElementById("planner-sprint-grid");
    grid.innerHTML = "<div style='grid-column: 1/-1; padding:30px; text-align:center; color:var(--text-muted);'>🤖 Analyzing viral outliers & computing optimal 7-day schedule mix...</div>";

    try {
      const res = await fetch("/api/planner/generate-weekly-mix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: targetComp })
      });
      const data = await res.json();
      activeSprintPlan = data;
      renderSprintGrid(data.plan);
    } catch (err) {
      console.error("Error generating weekly mix:", err);
    }
  });

  function renderSprintGrid(plan) {
    const grid = document.getElementById("planner-sprint-grid");
    grid.innerHTML = "";

    plan.forEach(item => {
      const card = document.createElement("div");
      card.className = "sprint-day-card";

      const badgeClass = archetypeBadgeClasses[item.archetype] || "archetype-cyan";
      const outlier = item.selected_outlier;

      card.innerHTML = `
        <div class="sprint-day-header">
          <span class="sprint-day-title">📅 ${item.day}</span>
          <span class="sprint-time-badge">${item.time_slot.split(" ")[0]} ${item.time_slot.split(" ")[1]}</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="archetype-badge ${badgeClass}">${item.archetype_label}</span>
          <span class="sprint-format-tag">${item.format}</span>
        </div>
        <div class="sprint-hook-box">
          "${item.recommended_hook}"
        </div>
        <div class="sprint-outlier-ref">
          <span>Benchmark: <strong>@${outlier.competitor_handle}</strong></span>
          <span class="outlier-pill viral-high" style="font-size:10px; padding:2px 6px;">${outlier.outlier_score}x</span>
        </div>
        <div class="sprint-goal-text">
          🎯 <strong>Meta:</strong> ${item.goal}
        </div>
        <button class="btn-table-action btn-planner-script" data-day="${item.day}" style="width:100%; justify-content:center; margin-top:auto;">
          <span>🎬</span> Open 1-Click Teleprompter
        </button>
      `;

      grid.appendChild(card);
    });

    // Attach click events for script studio inside planner
    document.querySelectorAll(".btn-planner-script").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const day = e.currentTarget.getAttribute("data-day");
        const item = activeSprintPlan.plan.find(p => p.day === day);
        if (item && item.selected_outlier) {
          openScriptStudio(item.selected_outlier);
        }
      });
    });
  }

  // Export 7-Day Sprint to Obsidian Vault
  document.getElementById("btn-save-sprint-vault").addEventListener("click", async () => {
    if (!activeSprintPlan) return;
    const btn = document.getElementById("btn-save-sprint-vault");
    btn.innerHTML = "<span>⏳ Exporting to Vault...</span>";

    try {
      const res = await fetch("/api/planner/save-sprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: activeSprintPlan.plan,
          company: activeSprintPlan.target_company
        })
      });
      const data = await res.json();
      if (data.success) {
        btn.innerHTML = "<span>✓ Saved to Obsidian Briefs!</span>";
        setTimeout(() => {
          btn.innerHTML = "<span>💾</span> Export Sprint to Obsidian Vault";
        }, 2000);
      }
    } catch (e) {
      console.error(e);
      btn.innerHTML = "<span>❌ Error</span>";
    }
  });

  // 7. Save Script to Obsidian Vault as Active Task
  document.getElementById("btn-save-vault-task").addEventListener("click", async () => {
    if (!activeScript) return;
    const btn = document.getElementById("btn-save-vault-task");
    btn.innerHTML = "<span>⏳ Saving...</span>";

    try {
      const res = await fetch("/api/obsidian/save-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script: activeScript })
      });
      const data = await res.json();
      if (data.success) {
        btn.innerHTML = "<span>✓ Saved to Obsidian!</span>";
        setTimeout(() => {
          btn.innerHTML = "<span>💾</span> Save to Obsidian Vault as Active Task";
          scriptModal.style.display = "none";
        }, 1500);
      }
    } catch (e) {
      console.error(e);
      btn.innerHTML = "<span>❌ Error</span>";
    }
  });

  // Copy Full Markdown Script
  document.getElementById("btn-copy-full-script").addEventListener("click", () => {
    if (!activeScript) return;
    let md = `# 🎬 Counter-Script: Outdo @${activeScript.competitor_reference.handle}\n\n`;
    md += `> Target: ${activeScript.company} · Duration: ${activeScript.duration_est}\n\n`;
    activeScript.sections.forEach(s => {
      md += `### ${s.timestamp} · ${s.label}\n- Visual: ${s.visual_cue}\n- Script: "${s.spoken_text}"\n\n`;
    });
    md += `### Caption:\n${activeScript.caption_ready_to_post}\n`;
    navigator.clipboard.writeText(md);
    alert("Full Markdown Script copied to clipboard!");
  });

  // Copy Caption
  document.getElementById("btn-copy-caption").addEventListener("click", () => {
    const txt = document.getElementById("script-caption-text").textContent;
    navigator.clipboard.writeText(txt);
    alert("Social Caption copied to clipboard!");
  });

  // 8. Live Scraper SSE Execution Stream
  btnRunScrape.addEventListener("click", () => {
    scrapeModal.style.display = "flex";
    scrapeLogs.innerHTML = "";
    btnCloseConsole.style.display = "none";
    scrapeStatusText.textContent = "Connecting to live scraper engine...";

    const evtSource = new EventSource(`/api/scrape/stream?company=${currentCompany}`);

    evtSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const line = document.createElement("div");
        line.className = "console-line";
        if (data.log.includes("✅") || data.log.includes("[✓]")) line.classList.add("success");
        if (data.log.includes("🚀") || data.log.includes("[*]")) line.classList.add("info");
        line.textContent = data.log;
        scrapeLogs.appendChild(line);
        scrapeLogs.scrollTop = scrapeLogs.scrollHeight;

        if (data.done) {
          evtSource.close();
          scrapeStatusText.textContent = "Scraping complete!";
          btnCloseConsole.style.display = "inline-flex";
          loadData();
        }
      } catch (err) {
        console.error(err);
      }
    };

    evtSource.onerror = () => {
      evtSource.close();
      scrapeStatusText.textContent = "Stream finished or interrupted.";
      btnCloseConsole.style.display = "inline-flex";
      loadData();
    };
  });

  btnCloseConsole.addEventListener("click", () => {
    scrapeModal.style.display = "none";
  });

  // 9. Vault Notes Explorer
  btnOpenVault.addEventListener("click", async () => {
    vaultModal.style.display = "flex";
    const filesList = document.getElementById("vault-files-list");
    filesList.innerHTML = "<div style='padding:10px; color:var(--text-muted);'>Loading vault files...</div>";

    try {
      const res = await fetch("/api/vault/files");
      const data = await res.json();
      filesList.innerHTML = "";

      data.files.forEach(f => {
        const div = document.createElement("div");
        div.className = "vault-file-item";
        div.innerHTML = `<span>📄</span> <span style="flex:1; overflow:hidden; text-overflow:ellipsis;">${f.path}</span>`;
        div.addEventListener("click", async () => {
          document.querySelectorAll(".vault-file-item").forEach(i => i.classList.remove("active"));
          div.classList.add("active");
          document.getElementById("vault-current-file-name").textContent = f.path;

          const nRes = await fetch(`/api/vault/note?path=${encodeURIComponent(f.path)}`);
          const nData = await nRes.json();
          document.getElementById("vault-note-viewer").textContent = nData.content;
        });
        filesList.appendChild(div);
      });
    } catch (e) {
      console.error(e);
    }
  });

  // Close modals
  document.getElementById("close-script-modal").addEventListener("click", () => scriptModal.style.display = "none");
  document.getElementById("close-planner-modal").addEventListener("click", () => plannerModal.style.display = "none");
  document.getElementById("btn-close-planner").addEventListener("click", () => plannerModal.style.display = "none");
  document.getElementById("close-scrape-modal").addEventListener("click", () => scrapeModal.style.display = "none");
  document.getElementById("close-vault-modal").addEventListener("click", () => vaultModal.style.display = "none");

  // Filters & Event Listeners
  companyTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      companyTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentCompany = tab.getAttribute("data-company");
      loadData();
    });
  });

  platformPills.forEach(pill => {
    pill.addEventListener("click", () => {
      platformPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      currentPlatform = pill.getAttribute("data-platform");
      loadData();
    });
  });

  pillarSelect.addEventListener("change", (e) => {
    currentPillar = e.target.value;
    loadData();
  });

  multiplierSelect.addEventListener("change", (e) => {
    currentMinScore = parseFloat(e.target.value);
    loadData();
  });

  // Search input debouncing
  let searchTimeout = null;
  searchInput.addEventListener("input", (e) => {
    currentSearch = e.target.value.trim();
    clearSearchBtn.style.display = currentSearch ? "block" : "none";
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      loadData();
    }, 250);
  });

  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    currentSearch = "";
    clearSearchBtn.style.display = "none";
    loadData();
  });

  // View Switcher
  viewExcelBtn.addEventListener("click", () => {
    currentView = "excel";
    viewExcelBtn.classList.add("active");
    viewCardsBtn.classList.remove("active");
    viewBoardBtn.classList.remove("active");
    viewAdsBtn.classList.remove("active");
    renderAll();
  });

  viewCardsBtn.addEventListener("click", () => {
    currentView = "cards";
    viewCardsBtn.classList.add("active");
    viewExcelBtn.classList.remove("active");
    viewBoardBtn.classList.remove("active");
    viewAdsBtn.classList.remove("active");
    renderAll();
  });

  viewBoardBtn.addEventListener("click", () => {
    currentView = "board";
    viewBoardBtn.classList.add("active");
    viewExcelBtn.classList.remove("active");
    viewCardsBtn.classList.remove("active");
    viewAdsBtn.classList.remove("active");
    renderAll();
  });

  viewAdsBtn.addEventListener("click", () => {
    currentView = "ads";
    viewAdsBtn.classList.add("active");
    viewExcelBtn.classList.remove("active");
    viewCardsBtn.classList.remove("active");
    viewBoardBtn.classList.remove("active");
    if (viewCalidoBtn) viewCalidoBtn.classList.remove("active");
    renderAll();
  });

  if (viewCalidoBtn) {
    viewCalidoBtn.addEventListener("click", () => {
      currentView = "calido";
      viewCalidoBtn.classList.add("active");
      viewExcelBtn.classList.remove("active");
      viewCardsBtn.classList.remove("active");
      viewBoardBtn.classList.remove("active");
      viewAdsBtn.classList.remove("active");
      renderAll();
    });
  }

  // =========================================================================
  // CÁLIDO CHILENO DESIGN SYSTEM & INTERACTIVE STUDIO (EUNACOM)
  // =========================================================================
  let calidoActiveArchetype = "tipo2"; // default: Trampas ASOFAMECH 6-slide carousel
  let calidoActiveSlide = 1; // 1 to 6
  let calidoDeckMode = "single"; // 'single' | 'deck'

  const CALIDO_PIXEL_DIMS = {
    "4-5": "1080 × 1350 px (Escala 1:3)",
    "9-16": "1080 × 1920 px (Escala 1:3)",
    "1-1": "1080 × 1080 px (Escala 1:3)"
  };

  // Shared by the Loop Semanal view and the vault export.
  // Copy transcribed from the "Loop semanal" section of the .dc.html.
  const calidoLoopDays = [
    { day: "LUN", title: "Quiz Clínico", desc: "Reel 9:16. Abre la semana desafiando. Responde comentarios las primeras 2 h.", tag: "TIPO 1", navy: false },
    { day: "MAR", title: "Trampas ASOFAMECH", desc: "Carrusel 4:5. Rota la especialidad cada semana.", tag: "TIPO 2", navy: true },
    { day: "MIÉ", title: "Algoritmo Visual", desc: "Carrusel 4:5. El post que más se guarda: mitad de semana, mitad de estudio.", tag: "TIPO 4", navy: false },
    { day: "JUE", title: "Quiz Clínico", desc: "Reel 9:16. Otra especialidad. Es el formato que más veces se repite.", tag: "TIPO 1", navy: false },
    { day: "VIE", title: "Sueldos y CESFAM", desc: "Reel 9:16. Viernes de proyección: plata, contrato, futuro.", tag: "TIPO 5", navy: true },
    { day: "SÁB", title: "Diccionario Chileno", desc: "Reel meme. Fin de semana liviano, máximo compartido por WhatsApp.", tag: "TIPO 6", navy: false },
    { day: "DOM", title: "Radar Burocrático", desc: "Post 1:1. Solo cuando hay noticia real de ASOFAMECH; si no, repite Tipo 4.", tag: "TIPO 3", navy: true }
  ];

  const calidoLoopSummary = [
    { label: "MEZCLA SEMANAL", value: "4 reels · 2 carruseles · 1 post" },
    { label: "REUTILIZACIÓN", value: "Cada reel se recorta a story vertical + TikTok sin cambios" },
    { label: "CTA POR TIPO", value: "Comentario (1, 3) · Guardar (2, 4) · Link en bio (5) · Compartir (6)" }
  ];

  const calidoArchetypesData = {
    tipo2: {
      id: "tipo2",
      badge: "TIPO 2",
      title: "Trampas Mortales ASOFAMECH",
      format: "CARRUSEL 4:5 (6 Slides)",
      aspectRatio: "4-5",
      totalSlides: 6,
      slides: [
        { num: 1, label: "Slide 1 · Portada", bg: "navy", kind: "portada",
          tag: "TRAMPAS ASOFAMECH · CARDIOLOGÍA",
          title: "Insuficiencia Cardíaca con FEVI preservada",
          swipeCta: "DESLIZA →" },
        { num: 2, label: "Slide 2 · Trampa 1", bg: "arena", kind: "trampa", numeral: "1",
          tag: "LA DISTRACTORA CÓMODA",
          errorLabel: "LO QUE ELIGE EL 70%", errorText: "Furosemida en bolo para la disnea de esfuerzo",
          officialLabel: "LA CONDUCTA OFICIAL", officialText: "iSGLT2 de base, sin diurético si no hay congestión activa" },
        { num: 3, label: "Slide 3 · Trampa 2", bg: "arena", kind: "trampa", numeral: "2",
          tag: "EL REFLEJO DE HOSPITAL",
          errorLabel: "LO QUE ELIGE EL 70%", errorText: "IECA/ARA-II aislados como primera línea de sobrevida",
          officialLabel: "LA CONDUCTA OFICIAL", officialText: "Empagliflozina 10mg o Dapagliflozina 10mg al día" },
        { num: 4, label: "Slide 4 · Trampa 3", bg: "arena", kind: "trampa", numeral: "3",
          tag: "LA TITULACIÓN APURADA",
          errorLabel: "LO QUE ELIGE EL 70%", errorText: "Betabloqueador a todo paciente con FEVI preservada",
          officialLabel: "LA CONDUCTA OFICIAL", officialText: "Solo si hay FA rápida o HTA no controlada" },
        { num: 5, label: "Slide 5 · Regla de Oro", bg: "arena", kind: "regla",
          tag: "REGLA DE ORO", title: "El perfil EUNACOM en tres líneas",
          rules: ["Pregunta por conducta, no por diagnóstico", "Prioriza lo resoluble en APS", "Sigue la guía MINSAL, no el hospital"] },
        { num: 6, label: "Slide 6 · CTA", bg: "navy", kind: "cta",
          title: "Pon a prueba lo que acabas de leer",
          mockupCaption: "captura · simulacro en iPhone",
          brandCta: "eunacomapp.cl", linkCta: "Link en bio" }
      ]
    },
    tipo1: {
      id: "tipo1",
      badge: "TIPO 1",
      title: "Quiz Clínico Interactivo",
      format: "REEL 9:16 (30–45s)",
      aspectRatio: "9-16",
      totalSlides: 3,
      slides: [
        { num: 1, label: "0:00–0:03 · HOOK", bg: "arena", kind: "hook",
          tag: "QUIZ CLÍNICO · ENDOCRINO",
          title: "El 85% de los médicos falla esta pregunta",
          videoCaption: "video · cara a cámara, gesto de reto",
          footerTitle: "Endocrinología · EUNACOM" },
        { num: 2, label: "0:03–0:15 · VIÑETA", bg: "navy", kind: "vineta",
          tag: "VIÑETA CLÍNICA",
          title: "Mujer de 38 años, control de rutina, sin síntomas",
          labs: [ { name: "TSH", value: "14.2" }, { name: "T4 libre", value: "0.5" } ] },
        { num: 3, label: "0:25–0:40 · PAUTA", bg: "arena", kind: "regla",
          tag: "PAUTA OFICIAL", title: "Hipotiroidismo subclínico: qué exige ASOFAMECH",
          rules: ["Repetir perfil tiroideo en 6 semanas", "Tratar si TSH > 10 mUI/L", "Levotiroxina 1.6 µg/kg/día en ayunas"] }
      ]
    },
    tipo3: {
      id: "tipo3",
      badge: "TIPO 3",
      title: "Radar Burocrático",
      format: "POST 1:1 (FOMO & Plazos)",
      aspectRatio: "1-1",
      totalSlides: 2,
      slides: [
        { num: 1, label: "Post 1:1 · Titular", bg: "rojo", kind: "radar",
          tag: "RADAR BUROCRÁTICO", date: "31.08.2026",
          title: "Fechas oficiales EUNACOM 2026",
          leadHtml: "Si eres médico extranjero, este plazo vence en <strong>15 días</strong>.",
          ctaBox: "Comenta CALENDARIO y te lo enviamos por DM" },
        { num: 2, label: "Post 1:1 · Checklist", bg: "arena", kind: "checklist",
          tag: "CHECKLIST DE INSCRIPCIÓN",
          items: ["Apostilla de título y notas", "Inscripción en plataforma ASOFAMECH", "Pago de arancel examen teórico (ST)"],
          saveNote: "Guarda este post" }
      ]
    },
    tipo4: {
      id: "tipo4",
      badge: "TIPO 4",
      title: "Algoritmo Visual de 1 Página",
      format: "CARRUSEL 4:5 (Flowchart)",
      aspectRatio: "4-5",
      totalSlides: 2,
      slides: [
        { num: 1, label: "Slide 1 · Portada", bg: "dorado", kind: "algoritmoPortada",
          tag: "ALGORITMO MINSAL",
          title: "Manejo de cetoacidosis diabética",
          saveNote: "Guarda este carrusel" },
        { num: 2, label: "Slide 2 · Flujo", bg: "arena", kind: "flujo",
          tag: "FLUJO COMPLETO",
          steps: [
            { step: "1 · Fluidos", dose: "SF 15–20 ml/kg/h" },
            { step: "2 · Insulina", dose: "0.1 U/kg/h EV" },
            { step: "3 · Potasio", dose: "K < 5.2 → aportar" },
            { step: "4 · Bicarbonato", dose: "pH < 6.9" }
          ],
          note: "Criterio de resolución: anion gap < 12 y bicarbonato > 15 mEq/L." }
      ]
    },
    tipo5: {
      id: "tipo5",
      badge: "TIPO 5",
      title: "Sueldos y CESFAM",
      format: "REEL 9:16 (Transparencia)",
      aspectRatio: "9-16",
      totalSlides: 2,
      slides: [
        { num: 1, label: "0:00–0:03 · HOOK", bg: "navy", kind: "hookVideo",
          tag: "SUELDOS MÉDICOS · CHILE",
          title: "¿Cuánto gana un médico en un CESFAM?",
          videoCaption: "video · a cámara, fondo centro médico" },
        { num: 2, label: "Desglose mensual", bg: "arena", kind: "desglose",
          tag: "DESGLOSE MENSUAL",
          rows: [
            { name: "Base 44 hrs", value: "$2.8M – $3.8M", accent: true },
            { name: "Turnos SAPU / SAR", value: "+ variable" },
            { name: "Asignación de zona", value: "+ hasta 40%" }
          ],
          highlight: "La única barrera legal para firmar contrato indefinido es el puntaje EUNACOM." }
      ]
    },
    tipo6: {
      id: "tipo6",
      badge: "TIPO 6",
      title: "Diccionario Médico Chileno",
      format: "REEL 9:16 (Semiología)",
      aspectRatio: "9-16",
      totalSlides: 2,
      slides: [
        { num: 1, label: "Hook · POV", bg: "terracota", kind: "hookVideo",
          tag: "DICCIONARIO MÉDICO CHILENO",
          title: "Cuando el paciente te dice que “le dio un aire”",
          videoCaption: "video · POV consulta CESFAM" },
        { num: 2, label: "Traducción", bg: "arena", kind: "traduccion",
          tag: "TRADUCCIÓN",
          patientLabel: "EL PACIENTE DICE", patientText: "“Tengo la guata acorchada”",
          semioLabel: "SEMIOLOGÍA", semioText: "Parestesia abdominal",
          examLabel: "COMO LO PREGUNTA ASOFAMECH", examText: "Hipoestesia en territorio de dermatomas T10–T12" }
      ]
    },
    loop: {
      id: "loop",
      badge: "LOOP SEMANAL",
      title: "Plan de Publicación 7 Días",
      format: "ESTRATEGIA COMPLETA",
      aspectRatio: "1-1",
      totalSlides: 1,
      slides: []
    }
  };

  // Color token copy handlers (delegated: pills are rendered per active palette)
  const calidoTokensBar = document.getElementById("calido-tokens-bar");
  if (calidoTokensBar) {
    calidoTokensBar.addEventListener("click", (e) => {
      const pill = e.target.closest(".color-token-pill");
      if (!pill) return;
      const hex = pill.getAttribute("data-hex");
      if (!hex) return;
      navigator.clipboard.writeText(hex);
      const nameSpan = pill.querySelector(".token-name");
      if (!nameSpan) return;
      const origName = nameSpan.textContent;
      nameSpan.textContent = "✓ Copiado!";
      setTimeout(() => { nameSpan.textContent = origName; }, 1200);
    });
  }

  // Pristine snapshot so "Restaurar Valores Predeterminados" can roll back edits
  const calidoDefaultsSnapshot = JSON.parse(JSON.stringify(calidoArchetypesData));

  // Tabs carry data-type="2" | "loop"; archetype keys are "tipo2" | "loop"
  function calidoKeyFromTab(tab) {
    const raw = tab.getAttribute("data-type") || tab.getAttribute("data-archetype") || "";
    if (!raw) return null;
    return calidoArchetypesData[raw] ? raw : `tipo${raw}`;
  }

  // Archetype Tabs Navigation
  const calidoArchetypeTabs = document.querySelectorAll(".calido-nav-tab");
  calidoArchetypeTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const key = calidoKeyFromTab(tab);
      if (!key || !calidoArchetypesData[key]) return;
      calidoArchetypeTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      calidoActiveArchetype = key;
      calidoActiveSlide = 1;
      calidoDeckMode = "single";
      renderCalidoStudio();
    });
  });

  // Render Cálido Studio
  function renderCalidoStudio() {
    const arch = calidoArchetypesData[calidoActiveArchetype] || calidoArchetypesData.tipo2;

    // Update Stage Toolbar Badges
    const badgeEl = document.getElementById("calido-stage-badge");
    const dimEl = document.getElementById("calido-dim-label") || document.getElementById("calido-stage-dim");
    if (badgeEl) {
      const slideCount = (arch.slides && arch.slides.length) || 0;
      badgeEl.textContent = slideCount > 1
        ? `${arch.badge}: ${arch.title} · SLIDE ${calidoActiveSlide} DE ${slideCount}`
        : `${arch.badge}: ${arch.title}`;
    }
    if (dimEl) dimEl.textContent = `${arch.format} · ${CALIDO_PIXEL_DIMS[arch.aspectRatio] || ""}`;

    // View toggle buttons
    const btnSingle = document.getElementById("btn-single-slide-view");
    const btnDeck = document.getElementById("btn-deck-gallery-view");
    const canvasWrap = document.getElementById("calido-canvas-wrapper");
    const deckGrid = document.getElementById("calido-deck-grid");

    if (btnSingle && btnDeck) {
      if (calidoDeckMode === "single") {
        btnSingle.classList.add("active");
        btnDeck.classList.remove("active");
        if (canvasWrap) canvasWrap.style.display = "flex";
        if (deckGrid) deckGrid.style.display = "none";
      } else {
        btnSingle.classList.remove("active");
        btnDeck.classList.add("active");
        if (canvasWrap) canvasWrap.style.display = "none";
        if (deckGrid) deckGrid.style.display = "flex";
      }
    }

    if (calidoActiveArchetype === "loop") {
      renderCalidoLoopWeekly();
      return;
    }

    renderCalidoStepper(arch);
    renderCalidoForm(arch);
    renderCalidoLiveCard(arch);
    if (calidoDeckMode === "deck") {
      renderCalidoDeckGrid(arch);
    }
  }

  // Render Slide Stepper
  function renderCalidoStepper(arch) {
    const stepper = document.getElementById("calido-slide-stepper");
    if (!stepper) return;
    stepper.innerHTML = "";

    arch.slides.forEach(s => {
      const btn = document.createElement("button");
      btn.className = `stepper-btn ${s.num === calidoActiveSlide ? "active" : ""}`;
      btn.textContent = `Slide ${s.num}`;
      btn.addEventListener("click", () => {
        calidoActiveSlide = s.num;
        calidoDeckMode = "single";
        renderCalidoStudio();
      });
      stepper.appendChild(btn);
    });
  }

  // Render Live Editable Form
  function renderCalidoForm(arch) {
    const formFields = document.getElementById("calido-form-fields");
    if (!formFields) return;
    formFields.innerHTML = "";

    const currentSlide = arch.slides.find(s => s.num === calidoActiveSlide) || arch.slides[0];
    if (!currentSlide) return;

    // Dynamically build inputs for current slide properties
    Object.keys(currentSlide).forEach(key => {
      if (["num", "label", "bg"].includes(key)) return;

      const group = document.createElement("div");
      group.className = "form-group";

      const label = document.createElement("label");
      label.textContent = key.replace(/([A-Z])/g, " $1").toUpperCase();
      group.appendChild(label);

      if (Array.isArray(currentSlide[key])) {
        const textarea = document.createElement("textarea");
        textarea.rows = 4;
        textarea.value = JSON.stringify(currentSlide[key], null, 2);
        textarea.addEventListener("input", (e) => {
          try {
            currentSlide[key] = JSON.parse(e.target.value);
            renderCalidoLiveCard(arch);
          } catch (err) {
            // Keep typing
          }
        });
        group.appendChild(textarea);
      } else if (typeof currentSlide[key] === "string" && currentSlide[key].length > 40) {
        const textarea = document.createElement("textarea");
        textarea.rows = 3;
        textarea.value = currentSlide[key];
        textarea.addEventListener("input", (e) => {
          currentSlide[key] = e.target.value;
          renderCalidoLiveCard(arch);
        });
        group.appendChild(textarea);
      } else {
        const input = document.createElement("input");
        input.type = "text";
        input.value = currentSlide[key] || "";
        input.addEventListener("input", (e) => {
          currentSlide[key] = e.target.value;
          renderCalidoLiveCard(arch);
        });
        group.appendChild(input);
      }

      formFields.appendChild(group);
    });
  }

  // Helper to build Card HTML for single slide.
  // Every size/spacing below is transcribed from the mockups in
  // "Sistema Calido Chileno.dc.html" — they are the design's own 1:3 values.
  function generateSlideCardHtml(arch, slide) {
    const ratioClass = `calido-card-${arch.aspectRatio || "4-5"}`;
    const isReel = (arch.aspectRatio || "") === "9-16";

    // The design uses five card grounds, not just navy/arena
    const GROUNDS = {
      navy:      "background: var(--cc-navy); color: var(--cc-arena);",
      arena:     "background: var(--cc-arena); color: var(--cc-text-dark);",
      rojo:      "background: var(--cc-rojo-plazo); color: var(--cc-arena);",
      dorado:    "background: var(--cc-dorado); color: var(--cc-text-dark);",
      terracota: "background: var(--cc-terracota); color: var(--cc-arena);"
    };
    const bgStyle = GROUNDS[slide.bg] || GROUNDS.arena;
    const onDark = ["navy", "rojo", "terracota"].includes(slide.bg);

    // Reels/TikTok safe margins — the design reserves these on every 9:16 card
    const safeTop = isReel ? `<div style="height:40px; flex:none;"></div>` : "";
    const safeBottom = isReel ? `<div style="height:56px; flex:none;"></div>` : "";

    const eyebrow = (text, color) =>
      `<span style="font-family:'Work Sans',sans-serif; font-weight:700; font-size:${isReel ? 11 : 10.5}px; letter-spacing:0.14em;${color ? ` color:${color};` : ""}">${text}</span>`;

    const serif = (text, size, lh, mt) =>
      `<div style="font-family:'DM Serif Display',serif; font-weight:400; font-size:${size}px; line-height:${lh};${mt ? ` margin-top:${mt}px;` : ""} text-wrap:pretty;">${text}</div>`;

    const footerBrand = (extra, color) =>
      `<div style="margin-top:auto; font-family:'Work Sans',sans-serif; font-size:${isReel ? 12 : 11}px; letter-spacing:0.12em; color:${color || "var(--cc-text-muted)"};">EUNACOMAPP.CL${extra || ""}</div>`;

    // The design stripes the video placeholder in the card's own ground colour,
    // so it reads as a hole in the card rather than a pasted-on beige block.
    const PLATES = {
      navy:      { a: "var(--cc-navy-light)", b: "var(--cc-navy-stripe)", cap: "var(--cc-azul-muted)" },
      arena:     { a: "var(--cc-arena-stripe-a)", b: "var(--cc-arena-stripe-b)", cap: "var(--cc-text-muted)" },
      terracota: { a: "var(--cc-terracota-muted)", b: "var(--cc-terracota)", cap: "var(--cc-terracota-caption)" }
    };
    const videoPlate = (caption, variant) => {
      const v = PLATES[variant] || PLATES.arena;
      return `
      <div style="margin-top:18px; flex:1; border-radius:12px; background:repeating-linear-gradient(45deg, ${v.a} 0 6px, ${v.b} 6px 12px); display:flex; align-items:flex-end; padding:12px; box-sizing:border-box;">
        <span style="font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:${v.cap};">${caption}</span>
      </div>`;
    };

    let bodyHtml = "";
    const k = slide.kind;

    if (k === "portada") {
      bodyHtml = `
        ${eyebrow(slide.tag, "var(--cc-dorado)")}
        ${serif(slide.title, 38, "1.0", 16)}
        <div style="margin-top:auto; display:flex; align-items:center; justify-content:space-between;">
          <span style="font-family:'Work Sans',sans-serif; font-size:11px; letter-spacing:0.12em; color:var(--cc-azul-muted);">EUNACOMAPP.CL</span>
          <span style="font-family:'Work Sans',sans-serif; font-weight:700; font-size:12px; color:var(--cc-terracota);">${slide.swipeCta}</span>
        </div>`;

    } else if (k === "trampa") {
      bodyHtml = `
        <div style="display:flex; align-items:baseline; gap:10px;">
          <span style="font-family:'DM Serif Display',serif; font-weight:400; font-size:34px; color:var(--cc-terracota); line-height:1;">${slide.numeral}</span>
          ${eyebrow(slide.tag)}
        </div>
        <div style="margin-top:18px; display:flex; flex-direction:column; gap:10px;">
          <div style="background:var(--cc-arena-card); border-radius:12px; padding:14px 16px; display:flex; flex-direction:column; gap:5px; border-left:4px solid var(--cc-border-neutral);">
            <span style="font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.1em; color:var(--cc-text-muted);">${slide.errorLabel}</span>
            <span style="font-size:14px; line-height:1.35; color:var(--cc-text-dark);">${slide.errorText}</span>
          </div>
          <div style="background:var(--cc-arena-card); border-radius:12px; padding:14px 16px; display:flex; flex-direction:column; gap:5px; border-left:4px solid var(--cc-terracota);">
            <span style="font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.1em; color:var(--cc-terracota);">${slide.officialLabel}</span>
            <span style="font-size:14px; line-height:1.35; font-weight:600; color:var(--cc-text-dark);">${slide.officialText}</span>
          </div>
        </div>
        ${footerBrand(` · ${slide.num} / ${arch.slides.length}`)}`;

    } else if (k === "regla") {
      bodyHtml = `
        ${eyebrow(slide.tag, "var(--cc-terracota)")}
        ${serif(slide.title, 28, "1.05", 14)}
        <div style="margin-top:16px; display:flex; flex-direction:column; gap:9px; font-size:13.5px; line-height:1.35;">
          ${(slide.rules || []).map(r => `<div style="background:var(--cc-dorado); border-radius:10px; padding:11px 14px; color:var(--cc-text-dark);">${r}</div>`).join("")}
        </div>
        ${footerBrand(isReel ? "" : ` · ${slide.num} / ${arch.slides.length}`)}`;

    } else if (k === "cta") {
      bodyHtml = `
        ${serif(slide.title, 28, "1.05")}
        ${videoPlate(slide.mockupCaption, "navy")}
        <div style="margin-top:16px; display:flex; align-items:center; justify-content:space-between;">
          <span style="font-family:'Work Sans',sans-serif; font-weight:700; font-size:13px; color:var(--cc-dorado);">${slide.brandCta}</span>
          <span style="font-family:'Work Sans',sans-serif; font-size:11px; color:var(--cc-azul-muted);">${slide.linkCta}</span>
        </div>`;

    } else if (k === "hook") {
      bodyHtml = `
        <div style="display:flex; align-items:center; gap:9px;">
          <div style="width:22px; height:22px; border-radius:50%; background:var(--cc-terracota); flex:none;"></div>
          ${eyebrow(slide.tag)}
        </div>
        ${serif(slide.title, 40, "0.98", 18)}
        <div style="margin-top:20px; height:150px; border-radius:12px; background:repeating-linear-gradient(45deg, var(--cc-arena-stripe-a) 0 6px, var(--cc-arena-stripe-b) 6px 12px); display:flex; align-items:flex-end; padding:12px; box-sizing:border-box;">
          <span style="font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:var(--cc-text-muted);">${slide.videoCaption}</span>
        </div>
        <div style="margin-top:auto; background:var(--cc-navy); color:var(--cc-arena); border-radius:12px; padding:12px 14px; display:flex; flex-direction:column; gap:2px;">
          <span style="font-family:'DM Serif Display',serif; font-weight:400; font-size:17px;">${slide.footerTitle}</span>
          <span style="font-family:'Work Sans',sans-serif; font-size:10.5px; letter-spacing:0.12em; color:var(--cc-azul-muted);">EUNACOMAPP.CL</span>
        </div>`;

    } else if (k === "hookVideo") {
      bodyHtml = `
        ${eyebrow(slide.tag, onDark && slide.bg === "navy" ? "var(--cc-dorado)" : null)}
        ${serif(slide.title, slide.bg === "terracota" ? 40 : 38, "0.98", 16)}
        ${videoPlate(slide.videoCaption, slide.bg)}
        <div style="margin-top:16px; font-family:'Work Sans',sans-serif; font-size:12px; letter-spacing:0.12em; color:${onDark ? "var(--cc-azul-muted)" : "var(--cc-text-muted)"};">EUNACOMAPP.CL</div>`;

    } else if (k === "vineta") {
      bodyHtml = `
        ${eyebrow(slide.tag, "var(--cc-dorado)")}
        ${serif(slide.title, 26, "1.05", 14)}
        <div style="margin-top:20px; background:var(--cc-arena-card); color:var(--cc-text-dark); border-radius:12px; padding:16px; display:flex; flex-direction:column; gap:11px;">
          ${(slide.labs || []).map((l, i) => `
            ${i ? `<div style="height:1px; background:var(--cc-divider);"></div>` : ""}
            <div style="display:flex; justify-content:space-between; align-items:baseline;">
              <span style="font-size:12.5px; color:var(--cc-text-slate);">${l.name}</span>
              <strong style="font-family:'Work Sans',sans-serif; font-size:24px; color:var(--cc-terracota);">${l.value}</strong>
            </div>`).join("")}
        </div>`;

    } else if (k === "radar") {
      bodyHtml = `
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <span style="font-family:'Work Sans',sans-serif; font-weight:700; font-size:10.5px; letter-spacing:0.16em;">${slide.tag}</span>
          <span style="font-family:'IBM Plex Mono',monospace; font-size:11px;">${slide.date}</span>
        </div>
        ${serif(slide.title, 40, "0.98", 18)}
        <div style="margin-top:14px; font-size:14px; line-height:1.4;">${slide.leadHtml}</div>
        <div style="margin-top:auto; background:var(--cc-arena); color:var(--cc-text-dark); border-radius:12px; padding:12px 14px; font-size:13px; font-weight:600;">${slide.ctaBox}</div>`;

    } else if (k === "checklist") {
      bodyHtml = `
        ${eyebrow(slide.tag, "var(--cc-rojo-plazo)")}
        <div style="margin-top:16px; display:flex; flex-direction:column; gap:9px; font-size:13.5px;">
          ${(slide.items || []).map((it, i) => `
            <div style="background:var(--cc-arena-card); border-radius:10px; padding:12px 14px; display:flex; gap:12px; align-items:center; color:var(--cc-text-dark);">
              <span style="font-family:'IBM Plex Mono',monospace; font-size:11px; color:var(--cc-rojo-plazo);">${String(i + 1).padStart(2, "0")}</span>${it}
            </div>`).join("")}
        </div>
        <div style="margin-top:auto; display:flex; align-items:center; justify-content:space-between;">
          <span style="font-family:'Work Sans',sans-serif; font-size:11px; letter-spacing:0.12em; color:var(--cc-text-muted);">EUNACOMAPP.CL</span>
          <span style="font-family:'DM Serif Display',serif; font-weight:400; font-style:italic; font-size:17px; color:var(--cc-rojo-plazo);">${slide.saveNote}</span>
        </div>`;

    } else if (k === "algoritmoPortada") {
      bodyHtml = `
        ${eyebrow(slide.tag, "var(--cc-navy)")}
        ${serif(slide.title, 38, "1.0", 16)}
        <div style="margin-top:14px; font-family:'DM Serif Display',serif; font-weight:400; font-style:italic; font-size:20px; color:var(--cc-dorado-dark);">${slide.saveNote}</div>
        ${footerBrand(` · ${slide.num} / ${arch.slides.length}`, "var(--cc-navy)")}`;

    } else if (k === "flujo") {
      bodyHtml = `
        ${eyebrow(slide.tag, "var(--cc-terracota)")}
        <div style="margin-top:14px; display:flex; flex-direction:column; gap:6px;">
          ${(slide.steps || []).map((s, i) => `
            ${i ? `<div style="align-self:center; width:1px; height:10px; background:var(--cc-border-neutral);"></div>` : ""}
            <div style="background:var(--cc-navy); color:var(--cc-arena); border-radius:9px; padding:10px 13px; font-size:12.5px; display:flex; justify-content:space-between; gap:10px;">
              <span>${s.step}</span>
              <span style="color:var(--cc-dorado); font-family:'IBM Plex Mono',monospace; font-size:11px;">${String(s.dose).replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>
            </div>`).join("")}
        </div>
        <div style="margin-top:14px; background:var(--cc-arena-card); border-radius:10px; padding:11px 13px; font-size:12px; line-height:1.35; color:var(--cc-text-slate);">${String(slide.note).replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
        ${footerBrand(` · ${slide.num} / ${arch.slides.length}`)}`;

    } else if (k === "desglose") {
      bodyHtml = `
        ${eyebrow(slide.tag, "var(--cc-terracota)")}
        <div style="margin-top:16px; background:var(--cc-arena-card); border-radius:12px; padding:16px; display:flex; flex-direction:column; gap:12px;">
          ${(slide.rows || []).map((r, i) => `
            ${i ? `<div style="height:1px; background:var(--cc-divider);"></div>` : ""}
            <div style="display:flex; flex-direction:column; gap:2px;">
              <span style="font-size:12px; color:var(--cc-text-slate);">${r.name}</span>
              <strong style="font-family:'Work Sans',sans-serif; font-size:${r.accent ? 22 : 18}px;${r.accent ? " color:var(--cc-terracota);" : " color:var(--cc-text-dark);"}">${r.value}</strong>
            </div>`).join("")}
        </div>
        <div style="margin-top:16px; background:var(--cc-dorado); border-radius:12px; padding:13px 15px; font-size:13px; line-height:1.35; font-weight:600; color:var(--cc-text-dark);">${slide.highlight}</div>
        ${footerBrand()}`;

    } else if (k === "traduccion") {
      bodyHtml = `
        ${eyebrow(slide.tag, "var(--cc-terracota)")}
        <div style="margin-top:16px; display:flex; flex-direction:column; gap:10px;">
          <div style="background:var(--cc-arena-card); border-radius:12px; padding:14px 16px; display:flex; flex-direction:column; gap:4px;">
            <span style="font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.1em; color:var(--cc-text-muted);">${slide.patientLabel}</span>
            <span style="font-family:'DM Serif Display',serif; font-weight:400; font-size:22px; line-height:1.1; color:var(--cc-text-dark);">${slide.patientText}</span>
          </div>
          <div style="background:var(--cc-navy); color:var(--cc-arena); border-radius:12px; padding:14px 16px; display:flex; flex-direction:column; gap:4px;">
            <span style="font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.1em; color:var(--cc-azul-muted);">${slide.semioLabel}</span>
            <span style="font-family:'DM Serif Display',serif; font-weight:400; font-size:22px; line-height:1.1;">${slide.semioText}</span>
          </div>
          <div style="background:var(--cc-dorado); border-radius:12px; padding:14px 16px; display:flex; flex-direction:column; gap:4px;">
            <span style="font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.1em; color:var(--cc-dorado-dark);">${slide.examLabel}</span>
            <span style="font-size:13.5px; line-height:1.35; font-weight:600; color:var(--cc-text-dark);">${slide.examText}</span>
          </div>
        </div>
        ${footerBrand()}`;
    }

    return `
      <div class="calido-rendered-card ${ratioClass}" style="${bgStyle}">
        ${safeTop}${bodyHtml}${safeBottom}
      </div>
    `;
  }

  // Render single live card
  function renderCalidoLiveCard(arch) {
    const canvasWrap = document.getElementById("calido-canvas-wrapper");
    if (!canvasWrap) return;

    const currentSlide = arch.slides.find(s => s.num === calidoActiveSlide) || arch.slides[0];
    if (!currentSlide) return;

    // The Loop view overwrites the whole canvas, so rebuild the host if it's gone.
    // generateSlideCardHtml already returns a .calido-rendered-card — don't nest another.
    let liveCard = document.getElementById("calido-live-card");
    if (!liveCard) {
      canvasWrap.innerHTML = `<div id="calido-live-card"></div>`;
      liveCard = document.getElementById("calido-live-card");
    }
    liveCard.innerHTML = generateSlideCardHtml(arch, currentSlide);
  }

  // Render Deck Grid Mode (All Slides side-by-side)
  function renderCalidoDeckGrid(arch) {
    const deckGrid = document.getElementById("calido-deck-grid");
    if (!deckGrid) return;
    deckGrid.innerHTML = "";

    arch.slides.forEach(s => {
      const item = document.createElement("div");
      item.className = "deck-slide-item";
      item.innerHTML = `
        <div class="deck-slide-label">${s.label || `Slide ${s.num}`}</div>
        ${generateSlideCardHtml(arch, s)}
      `;
      deckGrid.appendChild(item);
    });
  }

  // Render 7-Day Loop Semanal
  function renderCalidoLoopWeekly() {
    const canvasWrap = document.getElementById("calido-canvas-wrapper");
    const deckGrid = document.getElementById("calido-deck-grid");
    const formFields = document.getElementById("calido-form-fields");
    const stepper = document.getElementById("calido-slide-stepper");

    if (canvasWrap) canvasWrap.style.display = "flex";
    if (deckGrid) deckGrid.style.display = "none";
    if (stepper) stepper.innerHTML = `<span style="font-family:'IBM Plex Mono',monospace; font-size:11px; color:var(--cc-dorado);">⚡ 7-DAY CONTENT ENGINE</span>`;

    const days = calidoLoopDays;

    if (canvasWrap) {
      canvasWrap.innerHTML = `
        <div style="width:100%; display:flex; flex-direction:column; gap:16px;">
          <div style="font-family:'DM Serif Display',serif; font-weight:400; font-size:24px; color:var(--cc-arena); text-align:center;">
            Loop Semanal de Contenido EUNACOM (${calidoPalettes[calidoActivePalette].label})
          </div>
          <div class="calido-loop-grid">
            ${days.map(d => `
              <div class="calido-loop-day-card ${d.navy ? 'navy-card' : ''}">
                <div class="calido-loop-day-header">${d.day}</div>
                <div class="calido-loop-day-title">${d.title}</div>
                <div class="calido-loop-day-desc">${d.desc}</div>
                <div class="calido-loop-day-tag">${d.tag}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (formFields) {
      formFields.innerHTML = `
        <div style="font-size:12.5px; line-height:1.5; color:var(--text-secondary);">
          <strong>Un post al día, siete días, se repite cada semana.</strong><br><br>
          ${calidoLoopSummary.map(r => `
            <div style="margin-bottom:8px;">
              <span style="font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.1em; color:var(--cc-dorado);">${r.label}</span><br>
              ${r.value}
            </div>`).join("")}
          <br>Haz clic en <strong>Exportar a Obsidian Vault</strong> para guardar el blueprint completo en tu vault.
        </div>
      `;
    }
  }

  // Toggle Single View vs Deck Gallery View
  const btnViewSingle = document.getElementById("btn-single-slide-view");
  const btnViewDeck = document.getElementById("btn-deck-gallery-view");
  if (btnViewSingle && btnViewDeck) {
    btnViewSingle.addEventListener("click", () => {
      calidoDeckMode = "single";
      renderCalidoStudio();
    });
    btnViewDeck.addEventListener("click", () => {
      calidoDeckMode = "deck";
      renderCalidoStudio();
    });
  }

  // Export Cálido Chileno to Obsidian Vault
  const btnExportCalidoObsidian = document.getElementById("btn-export-calido-vault");
  if (btnExportCalidoObsidian) {
    btnExportCalidoObsidian.addEventListener("click", async () => {
      const arch = calidoArchetypesData[calidoActiveArchetype] || calidoArchetypesData.tipo2;
      const palette = calidoPalettes[calidoActivePalette];
      const p = palette.vars;
      btnExportCalidoObsidian.innerHTML = "<span>⏳ Guardando...</span>";

      let md = `# 🎨 EUNACOM Social Blueprint: ${palette.label} (${arch.title})\n\n`;
      md += `> Sistema de Diseño: ${palette.label} · Formato: ${arch.format} · ${CALIDO_PIXEL_DIMS[arch.aspectRatio] || ""}\n`;
      md += `> Marca: EUNACOM (eunacomapp.cl) · Paleta: Navy (${p["--cc-navy"]}), Fondo (${p["--cc-arena"]}), Acento (${p["--cc-terracota"]}), Respuesta (${p["--cc-dorado"]})\n`;
      if (arch.linkedOutlier) {
        const o = arch.linkedOutlier;
        md += `> Outlier vinculado: @${o.competitor_handle || "?"} · ${Number(o.outlier_score || 0).toFixed(1)}x\n`;
      }
      md += `\n`;

      if (arch.slides && arch.slides.length > 0) {
        arch.slides.forEach(s => {
          md += `## 📱 Slide ${s.num}: ${s.label || ''}\n`;
          md += `- **Fondo:** ${s.bg === 'navy' ? `Navy (${p["--cc-navy"]})` : `Claro (${p["--cc-arena"]})`}\n`;
          md += `- **Etiqueta Superior:** \`${s.tag || ''}\`\n`;
          Object.keys(s).forEach(k => {
            if (!["num", "label", "bg", "tag"].includes(k)) {
              const val = typeof s[k] === 'object' ? JSON.stringify(s[k]) : s[k];
              md += `- **${k.toUpperCase()}:** ${val}\n`;
            }
          });
          md += `\n`;
        });
      } else if (arch.id === "loop") {
        md += `## 🗓️ Loop Semanal de Publicación\n`;
        calidoLoopDays.forEach(d => {
          md += `- **${d.day} — ${d.title}** (${d.tag}): ${d.desc}\n`;
        });
        md += `\n`;
        calidoLoopSummary.forEach(r => { md += `- **${r.label}:** ${r.value}\n`; });
        md += `\n`;
      }

      md += `## 🎯 Prompt de Generación / Copywriting:\n`;
      md += `Generar contenido para EUNACOM respetando la regla de 1 solo acento (${p["--cc-terracota"]}) por pieza, datos clínicos en tarjetas blancas y tipografía DM Serif Display + Work Sans.\n`;

      try {
        const res = await fetch("/api/obsidian/save-task", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            script: {
              company: "EUNACOM",
              target_platform: "ESTUDIO_VISUAL_STUDIO",
              duration_est: `${(arch.slides || []).length || 1} slides / assets`,
              competitor_reference: {
                handle: arch.linkedOutlier ? (arch.linkedOutlier.competitor_handle || "estudio_visual") : "estudio_visual",
                original_hook: arch.title,
                outlier_score: arch.linkedOutlier ? Number(arch.linkedOutlier.outlier_score) || 0 : 10.0
              },
              hook_variations: [],
              sections: [],
              caption_ready_to_post: md
            }
          })
        });
        const data = await res.json();
        if (data.success) {
          btnExportCalidoObsidian.innerHTML = "<span>✓ Guardado en Vault!</span>";
        } else {
          console.error("save-task failed:", data);
          btnExportCalidoObsidian.innerHTML = "<span>❌ No se guardó</span>";
        }
        setTimeout(() => {
          btnExportCalidoObsidian.innerHTML = "<span>💾</span> Exportar a Obsidian Vault";
        }, 2000);
      } catch (e) {
        console.error(e);
        btnExportCalidoObsidian.innerHTML = "<span>❌ Error</span>";
        setTimeout(() => {
          btnExportCalidoObsidian.innerHTML = "<span>💾</span> Exportar a Obsidian Vault";
        }, 2000);
      }
    });
  }

  // Copy HTML/CSS code of current slide
  const btnCopyCalidoCode = document.getElementById("btn-copy-calido-html");
  if (btnCopyCalidoCode) {
    btnCopyCalidoCode.addEventListener("click", () => {
      const arch = calidoArchetypesData[calidoActiveArchetype] || calidoArchetypesData.tipo2;
      const currentSlide = arch.slides.find(s => s.num === calidoActiveSlide) || arch.slides[0];
      if (!currentSlide) return;

      // Resolve var(--cc-*) to literal hex so the markup renders outside this page
      const p = calidoPalettes[calidoActivePalette].vars;
      const html = generateSlideCardHtml(arch, currentSlide)
        .replace(/var\((--cc-[a-z-]+)\)/g, (m, name) => p[name] || m);

      navigator.clipboard.writeText(html);
      btnCopyCalidoCode.innerHTML = "<span>✓ Copiado!</span>";
      setTimeout(() => {
        btnCopyCalidoCode.innerHTML = "<span>📋</span> Copiar HTML del Slide";
      }, 1500);
    });
  }

  // -------------------------------------------------------------------------
  // Palette Presets — the studio cards are drawn entirely with --cc-* vars,
  // so switching a preset means overwriting those vars on :root.
  // -------------------------------------------------------------------------
  const calidoPalettes = {
    oficial: {
      label: "EUNACOM Oficial",
      tag: "SISTEMA VISUAL · EUNACOMAPP.CL",
      title: "Estudio Visual EUNACOM",
      desc: "Paleta real de la app (#0284C7 / #0F172A). Lo que el alumno ya reconoce al abrir eunacomapp.cl.",
      highlight: "app",
      vars: {
        "--cc-navy": "#0f172a", "--cc-navy-light": "#1e293b", "--cc-navy-stripe": "#27384f",
        "--cc-arena": "#f8fafc", "--cc-arena-ground": "#eef2f7", "--cc-arena-card": "#ffffff",
        "--cc-terracota": "#0284c7", "--cc-terracota-hover": "#0369a1", "--cc-terracota-muted": "#0ea5e9",
        "--cc-dorado": "#f59e0b", "--cc-dorado-dark": "#b45309",
        "--cc-azul-suave": "#64748b", "--cc-azul-muted": "#94a3b8",
        "--cc-rojo-plazo": "#ef4444", "--cc-border-warm": "#e2e8f0",
        "--cc-text-dark": "#0f172a", "--cc-text-slate": "#334155", "--cc-text-muted": "#64748b",
        "--cc-border-card": "#e2e8f0", "--cc-border-neutral": "#cbd5e1",
        "--cc-arena-stripe-a": "#e2e8f0", "--cc-arena-stripe-b": "#f1f5f9", "--cc-divider": "#e8edf3",
        "--cc-terracota-caption": "#dbeafe"
      }
    },
    calido: {
      label: "Cálido Chileno",
      tag: "DIRECCIÓN 1e · CÁLIDO CHILENO",
      title: "Estudio Visual Cálido Chileno",
      desc: "Navy clínico sobre arena, con un único acento terracota por pieza. Editorial, cercano, alta tasa de guardados.",
      highlight: "app",
      vars: {
        // Lifted verbatim from "Sistema Calido Chileno.dc.html"
        "--cc-navy": "#1a2740", "--cc-navy-light": "#22314c", "--cc-navy-stripe": "#27384f",
        "--cc-arena": "#f7ece0", "--cc-arena-ground": "#efe7dd", "--cc-arena-card": "#ffffff",
        "--cc-terracota": "#d9764a", "--cc-terracota-hover": "#b85c34", "--cc-terracota-muted": "#cd6d43",
        "--cc-dorado": "#e8c46a", "--cc-dorado-dark": "#8a4a24",
        "--cc-azul-suave": "#7c95b5", "--cc-azul-muted": "#a8b8ce",
        "--cc-rojo-plazo": "#a8321f", "--cc-border-warm": "#d7ccbe",
        // The design's greys are warm taupe, not cool slate. #8a8275 is the
        // 2nd most-used colour in the entire file (67 uses); I had #6b7688.
        "--cc-text-dark": "#1a2740", "--cc-text-slate": "#6b7891", "--cc-text-muted": "#8a8275",
        "--cc-border-card": "#e2d6c7", "--cc-border-neutral": "#cdbaa8",
        "--cc-arena-stripe-a": "#e6dccf", "--cc-arena-stripe-b": "#f2e7da", "--cc-divider": "#ece3d8",
        "--cc-terracota-caption": "#ffe6d6"
      }
    },
    papel: {
      label: "Papel Clínico",
      tag: "DIRECCIÓN 1b · PAPEL CLÍNICO",
      title: "Estudio Visual Papel Clínico",
      desc: "Ficha impresa de hospital: papel hueso, tinta grafito y sello rojo. Se lee como documento oficial, no como anuncio.",
      highlight: "app",
      vars: {
        "--cc-navy": "#1f2933", "--cc-navy-light": "#2b3947", "--cc-navy-stripe": "#38495a",
        "--cc-arena": "#f4f1ea", "--cc-arena-ground": "#e9e5db", "--cc-arena-card": "#ffffff",
        "--cc-terracota": "#c4372a", "--cc-terracota-hover": "#9d2b20", "--cc-terracota-muted": "#b8443a",
        "--cc-dorado": "#b8862b", "--cc-dorado-dark": "#7a5717",
        "--cc-azul-suave": "#7b8794", "--cc-azul-muted": "#9aa5b1",
        "--cc-rojo-plazo": "#9d2b20", "--cc-border-warm": "#cfc9bc",
        "--cc-text-dark": "#1f2933", "--cc-text-slate": "#3e4c59", "--cc-text-muted": "#7b8794",
        "--cc-border-card": "#ddd6c8", "--cc-border-neutral": "#c4bcae",
        "--cc-arena-stripe-a": "#e3ded2", "--cc-arena-stripe-b": "#eeeae0", "--cc-divider": "#e6e1d5",
        "--cc-terracota-caption": "#ffdcd6"
      }
    },
    lab: {
      label: "Ficha de Lab",
      tag: "DIRECCIÓN 1a · FICHA DE LABORATORIO",
      title: "Estudio Visual Ficha de Lab",
      desc: "Fondo casi blanco, datos en amarillo señalético y azul de examen. Diseñado para valores de laboratorio y rangos.",
      highlight: "app",
      vars: {
        "--cc-navy": "#10233b", "--cc-navy-light": "#1b3253", "--cc-navy-stripe": "#24406b",
        "--cc-arena": "#fdfcf7", "--cc-arena-ground": "#f2f0e6", "--cc-arena-card": "#ffffff",
        "--cc-terracota": "#ffc531", "--cc-terracota-hover": "#e0a80f", "--cc-terracota-muted": "#f0b41f",
        "--cc-dorado": "#ffd76b", "--cc-dorado-dark": "#8a6a00",
        "--cc-azul-suave": "#5b7fa6", "--cc-azul-muted": "#8fa8c2",
        "--cc-rojo-plazo": "#d64545", "--cc-border-warm": "#ddd8c4",
        "--cc-text-dark": "#10233b", "--cc-text-slate": "#334e68", "--cc-text-muted": "#6b7f95",
        "--cc-border-card": "#e5e1d0", "--cc-border-neutral": "#cfc9b4",
        "--cc-arena-stripe-a": "#eae6d6", "--cc-arena-stripe-b": "#f7f4e9", "--cc-divider": "#eeeadb",
        "--cc-terracota-caption": "#fff3cf"
      }
    }
  };

  const CALIDO_TOKEN_LABELS = {
    "--cc-navy": "Navy Base",
    "--cc-arena": "Fondo Claro",
    "--cc-terracota": "Acento Principal",
    "--cc-dorado": "Acento Respuesta",
    "--cc-azul-suave": "Texto Secundario",
    "--cc-rojo-plazo": "Alerta / Plazo"
  };

  let calidoActivePalette = "oficial";

  function applyCalidoPalette(presetKey) {
    const preset = calidoPalettes[presetKey];
    if (!preset) return;
    calidoActivePalette = presetKey;

    Object.entries(preset.vars).forEach(([k, v]) => {
      document.documentElement.style.setProperty(k, v);
    });

    const tagEl = document.getElementById("calido-system-tag");
    const titleEl = document.getElementById("calido-system-title");
    const descEl = document.getElementById("calido-system-desc");
    const highlightEl = document.getElementById("lockup-highlight");
    if (tagEl) tagEl.textContent = preset.tag;
    if (titleEl) titleEl.textContent = preset.title;
    if (descEl) descEl.textContent = preset.desc;
    if (highlightEl) highlightEl.style.color = preset.vars["--cc-terracota"];

    document.querySelectorAll(".palette-preset-btn").forEach(btn => {
      const isActive = btn.getAttribute("data-preset") === presetKey;
      btn.classList.toggle("active", isActive);
      btn.style.borderColor = isActive ? preset.vars["--cc-terracota"] : "var(--border-subtle)";
      btn.style.background = isActive ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.04)";
      btn.style.color = isActive ? preset.vars["--cc-terracota"] : "var(--text-secondary)";
    });

    renderCalidoTokensBar();
    renderCalidoStudio();
  }

  function renderCalidoTokensBar() {
    const bar = document.getElementById("calido-tokens-bar");
    if (!bar) return;
    const preset = calidoPalettes[calidoActivePalette];
    bar.innerHTML = Object.entries(CALIDO_TOKEN_LABELS).map(([varName, label]) => {
      const hex = preset.vars[varName];
      return `
        <div class="color-token-pill" data-hex="${hex}" title="Clic para copiar ${hex}">
          <span class="token-swatch" style="background:${hex};"></span>
          <span class="token-name">${label}</span>
          <span class="token-hex">${hex.toUpperCase()}</span>
        </div>
      `;
    }).join("");
  }

  document.querySelectorAll(".palette-preset-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      applyCalidoPalette(btn.getAttribute("data-preset"));
    });
  });

  // -------------------------------------------------------------------------
  // Outlier Ingestion — pull a detected viral hook into the current slide
  // -------------------------------------------------------------------------
  function populateCalidoOutlierPicker() {
    const picker = document.getElementById("calido-outlier-picker");
    if (!picker) return;

    const outliers = (allData.outliers || [])
      .filter(o => {
        const co = (o.company || o.category || "").toUpperCase();
        return co === "EUNACOM" || co === "";
      })
      .slice(0, 40);

    const prev = picker.value;
    picker.innerHTML = `<option value="">-- Usar plantilla de diseño predeterminada --</option>` +
      outliers.map(o => {
        const score = o.outlier_score ? `${Number(o.outlier_score).toFixed(1)}x · ` : "";
        const hook = (o.hook_text || o.caption || "Sin gancho").slice(0, 80);
        return `<option value="${o.id}">${score}@${o.competitor_handle || "?"} — ${hook.replace(/"/g, "&quot;")}</option>`;
      }).join("");
    if (prev) picker.value = prev;
  }

  const calidoOutlierPicker = document.getElementById("calido-outlier-picker");
  if (calidoOutlierPicker) {
    calidoOutlierPicker.addEventListener("change", () => {
      const id = calidoOutlierPicker.value;
      if (!id) return;
      const outlier = (allData.outliers || []).find(o => String(o.id) === String(id));
      if (!outlier) return;

      const arch = calidoArchetypesData[calidoActiveArchetype] || calidoArchetypesData.tipo2;
      const slide = arch.slides.find(s => s.num === calidoActiveSlide) || arch.slides[0];
      if (!slide) return;

      // Only overwrite fields this slide actually has, so each archetype stays valid
      if ("title" in slide && outlier.hook_text) slide.title = outlier.hook_text;
      if ("subtitle" in slide && outlier.caption) slide.subtitle = outlier.caption.slice(0, 180);
      if ("tag" in slide) {
        slide.tag = `OUTLIER ${Number(outlier.outlier_score || 0).toFixed(1)}x · @${outlier.competitor_handle || "?"}`;
      }
      arch.linkedOutlier = outlier;

      renderCalidoForm(arch);
      renderCalidoLiveCard(arch);
      if (calidoDeckMode === "deck") renderCalidoDeckGrid(arch);
    });
  }

  // -------------------------------------------------------------------------
  // Reset to pristine template values
  // -------------------------------------------------------------------------
  const btnResetCalido = document.getElementById("btn-reset-calido-defaults");
  if (btnResetCalido) {
    btnResetCalido.addEventListener("click", () => {
      const key = calidoActiveArchetype;
      calidoArchetypesData[key] = JSON.parse(JSON.stringify(calidoDefaultsSnapshot[key]));
      calidoActiveSlide = 1;
      const picker = document.getElementById("calido-outlier-picker");
      if (picker) picker.value = "";
      renderCalidoStudio();
      btnResetCalido.innerHTML = "<span>✓</span> Valores Restaurados";
      setTimeout(() => {
        btnResetCalido.innerHTML = "<span>↺</span> Restaurar Valores Predeterminados";
      }, 1500);
    });
  }

  // -------------------------------------------------------------------------
  // Push the whole carousel into the production Kanban board
  // -------------------------------------------------------------------------
  const btnPushToKanban = document.getElementById("btn-push-to-kanban");
  if (btnPushToKanban) {
    btnPushToKanban.addEventListener("click", () => {
      const arch = calidoArchetypesData[calidoActiveArchetype] || calidoArchetypesData.tipo2;
      const coverSlide = (arch.slides && arch.slides[0]) || {};
      const isReel = (arch.aspectRatio || "") === "9-16";

      loadKanbanTasks();
      kanbanTasks.unshift({
        id: "task_calido_" + Date.now(),
        title: coverSlide.title || arch.title,
        handle: "estudio_visual",
        company: "EUNACOM",
        platform: isReel ? "tiktok" : "instagram",
        multiplier: arch.linkedOutlier ? Number(arch.linkedOutlier.outlier_score) || 0 : 0,
        archetype: arch.id,
        archetype_label: `${arch.badge} · ${arch.title}`,
        format: isReel ? "reel" : "carousel",
        stage: "scripting",
        created_at: new Date().toISOString(),
        calido: {
          palette: calidoActivePalette,
          aspectRatio: arch.aspectRatio,
          totalSlides: (arch.slides || []).length,
          slides: arch.slides
        }
      });
      saveKanbanTasks();

      btnPushToKanban.innerHTML = "<span>✓</span> Enviado a Kanban (Scripting)";
      setTimeout(() => {
        btnPushToKanban.innerHTML = "<span>➕</span> Enviar Carrusel a Kanban de Producción";
      }, 2000);
    });
  }

  // Initial load
  applyCalidoPalette("oficial");
  loadData();
});

