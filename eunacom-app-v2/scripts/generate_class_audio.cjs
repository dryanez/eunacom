#!/usr/bin/env node

/**
 * EUNACOM 2026 - ElevenLabs Audio Generator & Slide Sync Tool
 * 
 * Usage:
 *   export ELEVENLABS_API_KEY="your_api_key"
 *   export ELEVENLABS_VOICE_ID="21m00Tcm4TlvDq8ikWAM" # or any Spanish doctor voice
 *   node scripts/generate_class_audio.js --class=gastro-01
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const args = process.argv.slice(2).reduce((acc, arg) => {
  const [k, v] = arg.replace(/^--/, "").split("=");
  acc[k] = v || true;
  return acc;
}, {});

const targetClassId = args.class || "gastro-01";
const apiKey = process.env.ELEVENLABS_API_KEY || args.key;
const voiceId = process.env.ELEVENLABS_VOICE_ID || args.voice || "pNInz6obpgDQGcFmaJgB";

console.log("═══════════════════════════════════════════════════════════════════");
console.log("🎙️  EUNACOM Creator Studio · ElevenLabs Audio Sync Pipeline");
console.log("═══════════════════════════════════════════════════════════════════");
console.log("📦 Target Class: " + targetClassId);
console.log("🗣️ Voice ID:     " + voiceId);
console.log("🔑 API Key:      " + (apiKey ? "✓ Configured (" + apiKey.substring(0, 8) + "...)" : "⚠️  Not set (generating script manifest)"));
console.log("───────────────────────────────────────────────────────────────────");

const catalogPath = path.join(__dirname, "../src/data/studio/perfil_v3_catalog.json");
if (!fs.existsSync(catalogPath)) {
  console.error("❌ Catalog file not found at " + catalogPath);
  process.exit(1);
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
let targetClass = null;

for (const spec of catalog.specialties || []) {
  const found = spec.classes.find(c => c.id === targetClassId);
  if (found) {
    targetClass = found;
    break;
  }
}

if (!targetClass) {
  const gastroPath = path.join(__dirname, "../src/data/studio/gastro_catalog.json");
  if (fs.existsSync(gastroPath)) {
    const gastroData = JSON.parse(fs.readFileSync(gastroPath, "utf8"));
    targetClass = gastroData.classes.find(c => c.id === targetClassId);
  }
}

if (!targetClass) {
  console.error("❌ Class " + targetClassId + " not found in catalog.");
  process.exit(1);
}

console.log("✓ Found Masterclass: " + targetClass.title);

const outputDir = path.join(__dirname, "../public/audio/" + targetClassId);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

let slideScripts = [];

if (targetClass.teleprompterScript) {
  const rawSegments = targetClass.teleprompterScript.split(/\[SLIDE \d+:?[^\]]*\]/i);
  slideScripts = rawSegments.map(s => s.trim()).filter(Boolean);
} else {
  slideScripts = [
    "Bienvenidos a la Masterclass oficial de " + targetClass.title + " para el EUNACOM 2026. En este video cubriremos en profundidad los codigos del Perfil V3 de ASOFAMECh y las preguntas trampa mas frecuentes del examen.",
    "Analicemos la exigencia legal del Perfil V3 para esta patologia. Los objetivos ministeriales exigen diagnostico especifico y manejo protocolizado de acuerdo a las guias clinicas vigentes en Chile.",
    "Revisemos la fisiopatologia y etiologias cardinales. Identificar el mecanismo de base permite anticipar las complicaciones agudas y seleccionar la terapia farmacologica de primera linea.",
    "Para el diagnostico clinico, los signos cardinales y los criterios de alta especificidad determinan la confirmacion diagnostica y la necesidad de examenes complementarios de urgencia.",
    "En cuanto a la reanimacion y estabilizacion inicial, la prioridad absoluta es asegurar la via aerea, accesos venosos gruesos y una estrategia restrictiva de fluidos y hemoderivados.",
    "La farmacoterapia obligatoria de urgencias debe iniciarse precozmente con las dosis exactas recomendadas para reducir la morbimortalidad intrahospitalaria.",
    "Revisemos la clasificacion de riesgo y las indicaciones de procedimientos invasivos o endoscopicos de urgencia de acuerdo al cuadro clinico.",
    "En el diagnostico diferencial, debemos diferenciar con precision las presentaciones clinicas atipicas y las etiologias secundarias de mayor gravedad.",
    "Las escalas pronosticas validadas nos permiten estratificar el riesgo de resangrado o mortalidad y decidir si el paciente requiere manejo ambulatorio o en cuidados intensivos.",
    "Analicemos las trampas clasicas del banco de preguntas: los distractores mas comunes suelen incluir farmacos contraindicados o metas de laboratorio erroneas.",
    "Revisemos el Caso Clinico 1: evalua la presentacion clasica del paciente en urgencias y la seleccion de la farmacoterapia inicial de eleccion.",
    "En el Caso Clinico 2: analizamos la conducta ante un hallazgo de alto riesgo y el procedimiento terapeutico de rescate mas apropiado.",
    "En el Caso Clinico 3: identificamos la conducta correcta ante un cuadro refractario o complicado con inestabilidad hemodinamica.",
    "Para concluir, este algoritmo resume la secuencia de decisiones clinicas que debes aplicar con seguridad en el examen EUNACOM 2026."
  ];
}

console.log("✓ Prepared " + slideScripts.length + " slide audio scripts.");

async function synthesizeSlideAudio(text, slideIndex) {
  const filePath = path.join(outputDir, "slide_" + slideIndex + ".mp3");
  
  if (!apiKey) {
    return {
      slide: slideIndex,
      file: "/audio/" + targetClassId + "/slide_" + slideIndex + ".mp3",
      text: text.substring(0, 120) + "...",
      durationEstimate: Math.max(8, Math.round(text.split(" ").length / 2.5)),
      status: "ready_for_synthesis"
    };
  }

  console.log("⏳ Synthesizing Slide " + slideIndex + " with ElevenLabs (" + text.split(" ").length + " words)...");

  const payload = JSON.stringify({
    text: text,
    model_id: "eleven_multilingual_v2",
    voice_settings: {
      stability: 0.55,
      similarity_boost: 0.80,
      style: 0.15,
      use_speaker_boost: true
    }
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: "api.elevenlabs.io",
      port: 443,
      path: "/v1/text-to-speech/" + voiceId,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
        "Accept": "audio/mpeg"
      }
    }, (res) => {
      if (res.statusCode !== 200) {
        let errData = "";
        res.on("data", chunk => errData += chunk);
        res.on("end", () => {
          console.error("❌ ElevenLabs API Error on slide " + slideIndex + " (HTTP " + res.statusCode + "):", errData);
          resolve({ slide: slideIndex, file: "/audio/" + targetClassId + "/slide_" + slideIndex + ".mp3", status: "error", error: errData });
        });
        return;
      }

      const fileStream = fs.createWriteStream(filePath);
      res.pipe(fileStream);

      fileStream.on("finish", () => {
        fileStream.close();
        console.log("✓ Slide " + slideIndex + " audio saved to " + filePath);
        resolve({ slide: slideIndex, file: "/audio/" + targetClassId + "/slide_" + slideIndex + ".mp3", status: "ready" });
      });
    });

    req.on("error", (err) => {
      console.error("❌ Network error on slide " + slideIndex + ":", err.message);
      resolve({ slide: slideIndex, status: "error", error: err.message });
    });

    req.write(payload);
    req.end();
  });
}

async function run() {
  const manifest = {
    classId: targetClassId,
    title: targetClass.title,
    voiceId: voiceId,
    generatedAt: new Date().toISOString(),
    totalSlides: slideScripts.length,
    slides: []
  };

  for (let i = 0; i < slideScripts.length; i++) {
    const slideNumber = i + 1;
    const result = await synthesizeSlideAudio(slideScripts[i], slideNumber);
    manifest.slides.push(result);
    if (apiKey) {
      await new Promise(r => setTimeout(r, 600));
    }
  }

  const manifestPath = path.join(outputDir, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log("───────────────────────────────────────────────────────────────────");
  console.log("✅ Audio sync pipeline ready!");
  console.log("📄 Manifest written to: " + manifestPath);
  console.log("📁 Audio directory: public/audio/" + targetClassId + "/");
  console.log("───────────────────────────────────────────────────────────────────");
  if (!apiKey) {
    console.log("💡 TO GENERATE REAL AUDIO WITH ELEVENLABS:");
    console.log("   export ELEVENLABS_API_KEY=\"your_api_key_here\"");
    console.log("   node scripts/generate_class_audio.js --class=" + targetClassId);
  }
}

run();
