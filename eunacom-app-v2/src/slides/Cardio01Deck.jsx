import React from "react";
import Deck from "../deck/Deck";
import { Slide } from "../deck/Slide";
import { GuevaraAlgorithm } from "../components/deck/GuevaraAlgorithm";
import { GuevaraTable } from "../components/deck/GuevaraTable";
import { QuestionSlide } from "../components/deck/QuestionSlide";

export default function Cardio01Deck() {
  return (
    <Deck title="Cardio 01: Angina Crónica Estable & Cardiopatía Isquémica" classId="cardio-01">
      
      {/* ── SLIDE 1: PORTADA HERO HIGH-IMPACT ── */}
      <Slide
        nav="Portada & Códigos"
        notes="Bienvenidos a la Masterclass oficial de Angina Crónica Estable para el EUNACOM 2026. Cubriremos los algoritmos diagnósticos, test de esfuerzo, manejo médico y las 4 trampas clásicas del examen."
      >
        <div style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#ffffff",
          padding: "40px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ background: "#e11d48", color: "#fff", padding: "6px 16px", borderRadius: 8, fontSize: 14, fontWeight: 900, letterSpacing: "0.08em" }}>
              [CLASE 01]
            </span>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              MEDICINA INTERNA · CARDIOLOGÍA
            </span>
          </div>

          <h1 style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 58,
            fontWeight: 900,
            color: "#f8fafc",
            margin: "0 0 16px",
            lineHeight: 1.15
          }}>
            Angina Crónica Estable
          </h1>

          <div style={{ fontSize: 24, color: "#94a3b8", maxWidth: 900, lineHeight: 1.4, marginBottom: 36 }}>
            Algoritmos Diagnósticos · Test de Esfuerzo · Criterios de Alto Riesgo · Terapia Antiisquémica
          </div>

          <div style={{ display: "flex", gap: 14 }}>
            <span style={{ background: "rgba(56, 189, 248, 0.15)", border: "1.5px solid #38bdf8", color: "#38bdf8", padding: "8px 20px", borderRadius: 9999, fontSize: 14, fontWeight: 800 }}>
              CÓD: 1.01.1.001 (Angina Estable)
            </span>
            <span style={{ background: "rgba(245, 158, 11, 0.15)", border: "1.5px solid #f59e0b", color: "#fbbf24", padding: "8px 20px", borderRadius: 9999, fontSize: 14, fontWeight: 800 }}>
              CÓD: 1.01.4.004 (PEG Bruce)
            </span>
            <span style={{ background: "rgba(34, 197, 94, 0.15)", border: "1.5px solid #22c55e", color: "#4ade80", padding: "8px 20px", borderRadius: 9999, fontSize: 14, fontWeight: 800 }}>
              EUNACOM 2026
            </span>
          </div>
        </div>
      </Slide>

      {/* ── SLIDE 2: MATRIZ DE EXIGENCIA LEGAL PERFIL V3 (FULL-SCREEN TABLE) ── */}
      <Slide
        nav="Matriz Perfil V3"
        notes="El Perfil V3 exige al médico general diagnosticar de forma específica la Angina Estable, realizar el tratamiento inicial y el seguimiento completo en APS."
      >
        <GuevaraTable
          classNumber="CLASE 01"
          title="Matriz de Exigencia Legal Perfil V3 (ASOFAMECh)"
          subtitle="Alcance de práctica obligatorio para el Médico General en Chile"
          headers={["Código", "Entidad Clínica", "Diagnóstico", "Tratamiento", "Seguimiento APS"]}
          rows={[
            ["1.01.1.001", "Angina Crónica Estable", "Específico", "Completo", "✓ APS (CESFAM)"],
            ["1.01.4.004", "Test de Esfuerzo (PEG)", "Interpreta", "Solicita", "✓ APS"],
            ["1.01.4.008", "AngioTAC Coronario", "Interpreta", "Deriva", "Especialidad"],
            ["1.01.1.002", "Angina Inestable (SCA)", "Sospecha", "Inicial Urgencia", "🚨 Hospitaliza"]
          ]}
          highlightColIndex={4}
          bottomNote="En APS el médico general es legalmente responsable del diagnóstico, titulación de betabloqueadores y detección de alto riesgo."
        />
      </Slide>

      {/* ── SLIDE 3: ALGORITMO DIAGNÓSTICO DEL DOLOR TORÁCICO (GUEVARA FLOWCHART) ── */}
      <Slide
        nav="Algoritmo Dolor Torácico"
        notes="Ante un paciente con dolor torácico en APS, la primera pregunta es determinar si el dolor ocurre en esfuerzo predecible o en reposo agudo."
      >
        <GuevaraAlgorithm
          classNumber="CLASE 01"
          title="Algoritmo de Dolor Torácico en Atención Primaria"
          rootNode={{
            badge: "EVALUACIÓN CLÍNICA INICIAL",
            title: "Paciente consulta por Dolor Torácico en APS",
            desc: "Anamnesis + Examen Físico + ECG de 12 derivaciones en < 10 minutos"
          }}
          decisionQuestion="¿El dolor es gatillado por Esfuerzo y cede en < 10 min de Reposo?"
          branches={[
            {
              isYes: true,
              decisionTag: "✓ SÍ (Esfuerzo Fijo)",
              tag: "Cuadro Crónico",
              title: "Angina Crónica Estable",
              bullets: [
                "Dolor opresivo retroesternal con esfuerzo",
                "Cede rápidamente con reposo o NTG",
                "ECG basal habitualmente normal"
              ],
              action: "Indicar Test de Esfuerzo (Bruce) e Iniciar AAS + Atorvastatina + Bisoprolol"
            },
            {
              isNo: true,
              decisionTag: "✗ NO (Dolor en Reposo)",
              tag: "Urgencia Médica",
              title: "Síndrome Coronario Agudo",
              bullets: [
                "Dolor en reposo prolongado (> 20 min)",
                "Angina de reciente comienzo (CCS III-IV)",
                "ST elevado o Infradesnivel / Troponinas (+)"
              ],
              action: "AAS 250mg + Clopidogrel 300mg + Derivación Inmediata a Urgencias (SAMU)"
            },
            {
              decisionTag: "🌙 SÍ (Reposo Nocturno)",
              borderColor: "#a855f7",
              tag: "Vasoespasmo",
              title: "Angina de Prinzmetal",
              bullets: [
                "Hombre/mujer joven fumador",
                "Dolor nocturno con ST elevado transitorio",
                "Coronarias angiográficamente sanas"
              ],
              action: "Indicar Calcioantagonistas (Amlodipino) · 🚨 PROHIBIDO Betabloqueadores"
            }
          ]}
          bottomBanner="Si la angina aparece en reposo o dura más de 20 minutos, trátelo como Síndrome Coronario Agudo hasta demostrar lo contrario."
        />
      </Slide>

      {/* ── SLIDE 4: CRITERIOS DE DIAMOND-FORRESTER (FULL-SCREEN TABLE) ── */}
      <Slide
        nav="Diamond-Forrester"
        notes="La probabilidad pre-test se define según los 3 criterios de Diamond-Forrester: Opresión, Esfuerzo y Alivio rápido."
      >
        <GuevaraTable
          classNumber="CLASE 01"
          title="Clasificación de Diamond-Forrester"
          subtitle="Estratificación diagnóstica del dolor torácico"
          headers={["Categoría", "1. Opresión Retroesternal", "2. Desencadenado por Esfuerzo", "3. Alivio < 10m Reposo", "Probabilidad Pre-Test"]}
          rows={[
            ["Angina Típica", "✓ Presente", "✓ Presente", "✓ Presente", "ALTA (> 85%)"],
            ["Angina Atípica", "✓ Presente (o 2/3)", "✓ Presente", "✗ Ausente", "INTERMEDIA (15–85%)"],
            ["Dolor No Cardíaco", "✗ Puntada / Pleurítico", "✗ No esfuerzo", "✗ No cede reposo", "BAJA (< 15%)"]
          ]}
          highlightColIndex={4}
          bottomNote="Angina Típica (3/3) en hombres >50 años o mujeres >60 años tiene probabilidad pre-test >90% de enfermedad coronaria."
        />
      </Slide>

      {/* ── SLIDE 5: ALGORITMO DE ELECCIÓN DE EXAMEN NO INVASIVO (GUEVARA FLOWCHART) ── */}
      <Slide
        nav="Algoritmo Examen No Invasivo"
        notes="Algoritmo clave del EUNACOM: ¿Qué examen pedir? Si el ECG basal es normal y camina -> Test de esfuerzo. Si tiene BCRI o no camina -> Eco-estrés con Dobutamina."
      >
        <GuevaraAlgorithm
          classNumber="CLASE 01"
          title="Algoritmo de Elección de Examen No Invasivo en APS"
          rootNode={{
            badge: "INDICACIÓN DIAGNÓSTICA",
            title: "Paciente con Sospecha de Cardiopatía Isquémica Estable",
            desc: "Objetivo: Confirmar isquemia inducible y estratificar riesgo de mortalidad cardiovascular"
          }}
          decisionQuestion="¿El ECG Basal es Interpretable y el Paciente Puede Caminar?"
          branches={[
            {
              isYes: true,
              decisionTag: "✓ SÍ (Elegible Esfuerzo)",
              tag: "1ra Línea APS",
              title: "Test de Esfuerzo (Bruce)",
              bullets: [
                "Cinta rodante con monitorización ECG continua",
                "Criterio (+) = Infradesnivel ST ≥ 1.0 mm horizontal",
                "Evalúa capacidad funcional en METs"
              ],
              action: "Examen de 1ra Elección en Atención Primaria"
            },
            {
              decisionTag: "🔍 RIESGO MEDIO (15-50%)",
              borderColor: "#38bdf8",
              tag: "No Invasivo Anatómico",
              title: "AngioTAC Coronario",
              bullets: [
                "Visualiza directamente la anatomía coronaria",
                "Valor Predictivo Negativo > 98%",
                "Ideal para DESCARTAR enfermedad coronaria"
              ],
              action: "De elección en probabilidad intermedia baja"
            },
            {
              isNo: true,
              decisionTag: "✗ NO (ECG Alterado / No Camina)",
              tag: "Alternativa",
              title: "Eco-Estrés Dobutamina",
              bullets: [
                "Indicado en: BCRI, Marcapasos, WPW, amputados",
                "Evalúa motilidad parietal inducida por estrés",
                "Alternativa: Resonancia Cardíaca de Estrés"
              ],
              action: "Contraindicado PEG convencional; solicitar Eco-Estrés"
            }
          ]}
          bottomBanner="Si el paciente tiene Bloqueo Completo de Rama Izquierda (BCRI), el Test de Esfuerzo está formalmente contraindicado."
        />
      </Slide>

      {/* ── SLIDE 6: CRITERIOS DE ALTO RIESGO EN TEST DE ESFUERZO (GUEVARA FLOWCHART) ── */}
      <Slide
        nav="Criterios de Alto Riesgo"
        notes="Estos 4 hallazgos en el test de esfuerzo definen alto riesgo de mortalidad anual (>3%) e indican derivación inmediata a coronariografía invasiva."
      >
        <GuevaraAlgorithm
          classNumber="CLASE 01"
          title="Algoritmo ante Test de Esfuerzo Positivo"
          rootNode={{
            badge: "RESULTADO DE ERGOMETRÍA",
            title: "Test de Esfuerzo Positivo para Isquemia (ST ↓ ≥ 1.0 mm)",
            desc: "Estratificación de Riesgo: Determinar si requiere manejo médico exclusivo o revascularización invasiva"
          }}
          decisionQuestion="¿Presenta algún Criterio de Alto Riesgo Isquémico?"
          branches={[
            {
              isNo: true,
              decisionTag: "🚨 SÍ: CRITERIOS DE ALTO RIESGO",
              tag: "Mortalidad > 3%/año",
              title: "4 Banderas Rojas en PEG",
              bullets: [
                "1. Infradesnivel del ST ≥ 2.0 mm o en ≥ 5 derivaciones",
                "2. Isquemia precoz en Estadio 1 Bruce (< 5 METs / FC < 120)",
                "3. Caída de la Presión Arterial Sistólica con el ejercicio",
                "4. Taquicardia Ventricular durante el esfuerzo"
              ],
              action: "Derivación Inmediata a Coronariografía Invasiva (Sospecha Tronco Común o 3 Vasos)"
            },
            {
              isYes: true,
              decisionTag: "✓ NO: RIESGO LEVE / MODERADO",
              tag: "Mortalidad < 1%/año",
              title: "Isquemia Leve en Altos METs",
              bullets: [
                "Infradesnivel ST < 2.0 mm en estadio 3 o 4 (> 7 METs)",
                "Buena respuesta presora (PAS sube normalmente)",
                "Sin arritmias ventriculares complejas"
              ],
              action: "Manejo Médico Completo en APS: Optimizar Antiisquémicos y Prevención Secundaria"
            }
          ]}
          bottomBanner="La caída de la PAS durante el esfuerzo físico refleja falla ventricular aguda por isquemia extensa y exige coronariografía."
        />
      </Slide>

      {/* ── SLIDE 7: TABLA MAESTRA DE FÁRMACOS (FULL-SCREEN TABLE) ── */}
      <Slide
        nav="Farmacología Maestra"
        notes="Tabla maestra de tratamiento farmacológico en APS: Prevención secundaria obligatoria y terapia antiisquémica sintomática."
      >
        <GuevaraTable
          classNumber="CLASE 01"
          title="Tabla Maestra de Tratamiento Farmacológico en APS"
          subtitle="Dosis, metas terapéuticas y precauciones en Atención Primaria"
          headers={["Fármaco", "Clase", "Dosis Habitual", "Objetivo / Meta", "Alerta EUNACOM"]}
          rows={[
            ["Aspirina (AAS)", "Antiagregante", "100 mg/día vo", "Inhibe COX-1 plaquetaria", "Clopidogrel 75mg si alergia"],
            ["Atorvastatina", "Estatina Potente", "80 mg/día noche", "c-LDL < 55 mg/dL", "Obligatoria siempre (incluso LDL normal)"],
            ["Bisoprolol", "Betabloqueador", "5–10 mg/día vo", "FC reposo 55–60 lpm", "1ra línea antiisquémica"],
            ["Amlodipino", "Calcioantagonista DHP", "5–10 mg/día vo", "Vasodilatación arterial", "Asociar a BB si persiste angina"],
            ["Nitroglicerina", "Nitrato SL", "0.6 mg SOS", "Alivio sintomático rápido", "🚨 PROHIBIDO con Sildenafil (<24h)"]
          ]}
          highlightColIndex={3}
          bottomNote="Las estatinas de alta potencia reducen la mortalidad en cardiopatía isquémica independientemente del nivel basal de colesterol."
        />
      </Slide>

      {/* ── SLIDE 8: ALGORITMO DE TITULACIÓN ANTIISQUÉMICA (GUEVARA FLOWCHART) ── */}
      <Slide
        nav="Algoritmo de Titulación"
        notes="Algoritmo de titulación antiisquémica: iniciar Betabloqueador y titular hasta FC 55-60 lpm. Si persiste con angina, agregar Amlodipino."
      >
        <GuevaraAlgorithm
          classNumber="CLASE 01"
          title="Algoritmo de Titulación Antiisquémica en APS"
          rootNode={{
            badge: "PASO 1: INICIO TERAPÉUTICO",
            title: "Iniciar Betabloqueador de 1ra Línea (Bisoprolol o Carvedilol)",
            desc: "Asociar Aspirina 100 mg + Atorvastatina 80 mg + Nitroglicerina SL SOS"
          }}
          decisionQuestion="¿El paciente alcanza FC 55–60 lpm y está asintomático?"
          branches={[
            {
              isYes: true,
              decisionTag: "✓ SÍ (Control Óptimo)",
              tag: "Meta Cumplida",
              title: "Control Sintomático Exitoso",
              bullets: [
                "FC en reposo entre 55 y 60 lpm",
                "Sin episodios de dolor anginoso en actividades diarias",
                "Tolerancia adecuada sin hipotensión ni bradicardia extrema"
              ],
              action: "Mantener dosis actual y control periódico semestral en CESFAM"
            },
            {
              decisionTag: "⚠️ NO (FC > 60 lpm con Angina)",
              borderColor: "#f59e0b",
              tag: "Dosis Subterapéutica",
              title: "Titular Betabloqueador",
              bullets: [
                "Aumentar dosis (ej. Bisoprolol 5mg ➔ 10mg/d)",
                "Verificar adherencia y técnica de toma",
                "Monitorear PA y ECG de control"
              ],
              action: "Aumentar dosis de BB hasta alcanzar FC meta de 55–60 lpm"
            },
            {
              isNo: true,
              decisionTag: "✗ PERSISTE ANGINA CON FC 55-60",
              tag: "Terapia Combinada",
              title: "Asociar Calcioantagonista",
              bullets: [
                "Agregar Amlodipino 5–10 mg/día (DHP)",
                "Alternativa: Verapamilo/Diltiazem SOLO si intolerancia a BB",
                "🚨 NUNCA combinar Verapamilo + Betabloqueador"
              ],
              action: "Terapia Dual: Betabloqueador + Calcioantagonista Dihidropiridínico"
            }
          ]}
          bottomBanner="Nunca combine Verapamilo o Diltiazem con Betabloqueadores por riesgo de bloqueo AV completo y shock cardiogénico."
        />
      </Slide>

      {/* ── SLIDE 9: ALGORITMO DE ANGINA DE PRINZMETAL (GUEVARA FLOWCHART) ── */}
      <Slide
        nav="Angina de Prinzmetal"
        notes="Algoritmo de la Angina de Prinzmetal: Vasoespasmo coronario en reposo. Calcioantagonistas son de 1ra línea; los Betabloqueadores están formalmente PROHIBIDOS."
      >
        <GuevaraAlgorithm
          classNumber="CLASE 01"
          title="Algoritmo de Angina Vasoespástica (Prinzmetal)"
          rootNode={{
            badge: "SOSPECHA CLÍNICA",
            title: "Dolor Torácico Anginoso en Reposo (Típicamente Nocturno / Madrugada)",
            desc: "Paciente joven fumador sin factores de riesgo tradicionales. ECG durante el dolor: Supradesnivel ST transitorio"
          }}
          decisionQuestion="¿El Supradesnivel del ST desaparece al administrar Nitroglicerina SL?"
          branches={[
            {
              isYes: true,
              decisionTag: "✓ SÍ (Vasoespasmo Reversible)",
              tag: "1ra Línea",
              title: "Calcioantagonistas",
              bullets: [
                "Amlodipino 10 mg/día o Diltiazem 180–240 mg/día",
                "Efecto vasodilatador coronario potente",
                "Cese estricto del consumo de tabaco y drogas"
              ],
              action: "Indicar Calcioantagonistas + Nitratos sublinguales SOS + Cese Tabaco"
            },
            {
              isNo: true,
              decisionTag: "🚫 PROHIBICIÓN ABSOLUTA",
              tag: "Efecto Adverso Grave",
              title: "¡NUNCA Betabloqueadores!",
              bullets: [
                "El bloqueo Beta-2 deja libre el tono vasoconstrictor Alfa-1",
                "Empeora severamente el vasoespasmo coronario",
                "Puede precipitar IAM transmural extenso y muerte súbita"
              ],
              action: "🚨 BETABLOQUEADORES FORMALMENTE CONTRAINDICADOS EN PRINZMETAL"
            }
          ]}
          bottomBanner="En Angina de Prinzmetal: Calcioantagonistas SÍ, Betabloqueadores NUNCA."
        />
      </Slide>

      {/* ── SLIDE 10: TABLA DIFERENCIAL DE SÍNDROMES CORONARIOS (FULL-SCREEN TABLE) ── */}
      <Slide
        nav="Tabla Diferencial SCA"
        notes="Tabla maestra comparativa de los 4 síndromes coronarios: Estable vs Inestable vs IAM sin SDST vs IAM con SDST."
      >
        <GuevaraTable
          classNumber="CLASE 01"
          title="Tabla Diferencial de Síndromes Coronarios"
          subtitle="Diagnóstico diferencial clave para el EUNACOM"
          headers={["Entidad", "Dolor Torácico", "Troponinas", "ECG Típico", "Trombo / Fisiopatología", "Conducta"]}
          rows={[
            ["Angina Estable", "Solo con esfuerzo (<10m)", "Negativas (-)", "Normal en reposo", "Placa fija ≥70% sin trombo", "Ambulatorio APS (PEG)"],
            ["Angina Inestable", "En reposo / Reciente (<2m)", "Negativas (-)", "ST normal o infradesnivel", "Placa rota + Trombo suboclusivo", "🚨 Hospitalizar (SCASEST)"],
            ["IAM sin SDST", "En reposo (>20m)", "POSITIVAS (+)", "Infradesnivel ST / Onda T (-)", "Placa rota + Trombo + Necrosis", "🚨 Coronariografía precoz"],
            ["IAM con SDST", "En reposo severo", "POSITIVAS (+)", "Supradesnivel ST persistente", "Trombo 100% Oclusivo Rojo", "🚨 Reperfusión (<120m PCI)"]
          ]}
          highlightColIndex={0}
          bottomNote="La diferencia entre Angina Inestable e IAM sin SDST es exclusivamente la elevación de biomarcadores cardíacos (Troponinas)."
        />
      </Slide>

      {/* ── SLIDE 11: CASO CLÍNICO #1 ── */}
      <Slide
        nav="Caso Clínico 1"
        notes="Caso clínico de diagnóstico y conducta inicial en APS."
      >
        <QuestionSlide
          classNumber="CLASE 01"
          questionNumber={1}
          specialty="Cardiología"
          code="1.01.1.001"
          question="Hombre de 56 años, hipertenso y fumador. Consulta en CESFAM por dolor retroesternal opresivo al subir 2 pisos de escaleras, de 3 meses de evolución, que cede con 3 minutos de reposo. Examen físico normal, PA 138/84 mmHg, FC 76 lpm. ECG basal normal. ¿Cuál es el diagnóstico y la conducta inicial más adecuada?"
          correctOptionId="B"
          options={[
            {
              id: "A",
              text: "Dolor torácico no coronario; tranquilizar e indicar analgesia con AINEs.",
              explanation: "Incorrecto. Cumple los 3 criterios de Diamond-Forrester para Angina Típica.",
              isCorrect: false
            },
            {
              id: "B",
              text: "Angina Crónica Estable; indicar Test de Esfuerzo (PEG) e iniciar Aspirina 100 mg, Atorvastatina 80 mg y Bisoprolol.",
              explanation: "Correcto. Angina Típica CCS II con ECG normal. El Test de Esfuerzo es el estudio indicado en APS.",
              isCorrect: true
            },
            {
              id: "C",
              text: "SCACEST; derivar de urgencia para angioplastía primaria inmediata.",
              explanation: "Incorrecto. Cuadro crónico de 3 meses de evolución con ECG normal.",
              isCorrect: false
            },
            {
              id: "D",
              text: "Angina de Prinzmetal; iniciar Verapamilo y reposo absoluto.",
              explanation: "Incorrecto. Ocurre con esfuerzo físico predecible, no en reposo nocturno.",
              isCorrect: false
            }
          ]}
        />
      </Slide>

      {/* ── SLIDE 12: CASO CLÍNICO #2 ── */}
      <Slide
        nav="Caso Clínico 2"
        notes="Caso de titulación y metas de frecuencia cardíaca."
      >
        <QuestionSlide
          classNumber="CLASE 01"
          questionNumber={2}
          specialty="Cardiología"
          code="1.01.1.001"
          question="Mujer de 64 años con Angina Estable confirmada en tratamiento con Aspirina 100 mg, Atorvastatina 80 mg y Atenolol 25 mg/día. Refiere que persiste con episodios de opresión al caminar 3 cuadras. Al examen: PA 132/80 mmHg, FC 82 lpm. ¿Cuál es la conducta farmacológica más adecuada?"
          correctOptionId="C"
          options={[
            {
              id: "A",
              text: "Suspender Atenolol e iniciar Diltiazem 60 mg cada 8 horas.",
              explanation: "Incorrecto. El betabloqueador es de primera línea y su dosis actual es subterapéutica.",
              isCorrect: false
            },
            {
              id: "B",
              text: "Agregar Clopidogrel 75 mg/día para doble antiagregación plaquetaria.",
              explanation: "Incorrecto. La DAPT no está indicada en angina estable crónica sin stent reciente.",
              isCorrect: false
            },
            {
              id: "C",
              text: "Aumentar la dosis del Betabloqueador para alcanzar una FC meta en reposo de 55 a 60 lpm.",
              explanation: "Correcto. La meta terapéutica antiisquémica obligatoria con betabloqueadores es una FC en reposo de 55 a 60 lpm.",
              isCorrect: true
            },
            {
              id: "D",
              text: "Derivar de urgencia para cirugía de bypass coronario inmediato.",
              explanation: "Incorrecto. Primero se optimiza la dosis del tratamiento médico ambulatorio.",
              isCorrect: false
            }
          ]}
        />
      </Slide>

      {/* ── SLIDE 13: CASO CLÍNICO #3 ── */}
      <Slide
        nav="Caso Clínico 3"
        notes="Caso de angina vasoespástica y contraindicación de fármacos."
      >
        <QuestionSlide
          classNumber="CLASE 01"
          questionNumber={3}
          specialty="Cardiología"
          code="1.01.1.001"
          question="Hombre de 42 años fumador. Consulta por dolor torácico opresivo que lo despierta a las 4:00 AM en reposo. ECG muestra supradesnivel del ST de 2.5 mm en D2, D3 y aVF que desaparece por completo tras Nitroglicerina sublingual. Troponinas seriadas normales. ¿Cuál es el tratamiento de elección y qué fármaco está contraindicado?"
          correctOptionId="D"
          options={[
            {
              id: "A",
              text: "Tratamiento: Propranolol; Contraindicado: Nitratos.",
              explanation: "Incorrecto. Los betabloqueadores están formalmente contraindicados en Prinzmetal.",
              isCorrect: false
            },
            {
              id: "B",
              text: "Tratamiento: Angioplastía coronaria; Contraindicado: Aspirina.",
              explanation: "Incorrecto. El mecanismo es vasoespasmo funcional sin placa obstructiva fija.",
              isCorrect: false
            },
            {
              id: "C",
              text: "Tratamiento: Amiodarona; Contraindicado: Calcioantagonistas.",
              explanation: "Incorrecto. Los calcioantagonistas son precisamente la primera línea de elección.",
              isCorrect: false
            },
            {
              id: "D",
              text: "Tratamiento: Calcioantagonistas (Amlodipino/Diltiazem); Contraindicado: Betabloqueadores.",
              explanation: "Correcto. En Angina de Prinzmetal se indican Calcioantagonistas y se contraindican Betabloqueadores.",
              isCorrect: true
            }
          ]}
        />
      </Slide>

      {/* ── SLIDE 14: RESUMEN MAESTRO & REGLAS DE ORO ── */}
      <Slide
        nav="Resumen Maestro"
        notes="Hemos completado la Masterclass de Angina Crónica Estable con algoritmos de decisión clínica. En la siguiente clase abordaremos el SCASEST (Cardio 02)."
      >
        <GuevaraTable
          classNumber="CLASE 01"
          title="Resumen Maestro: 5 Reglas de Oro EUNACOM"
          subtitle="Conceptos de máxima rentabilidad para el examen"
          headers={["#", "Situación Clínica", "Regla de Decisión", "Conducta Obligatoria"]}
          rows={[
            ["1", "Diagnóstico Clínico", "3/3 Diamond-Forrester (Opresión + Esfuerzo + Alivio <10m)", "Angina Típica ➔ Test de Esfuerzo en APS"],
            ["2", "ECG Basal con BCRI", "PEG pierde validez diagnóstica", "Contraindicado PEG ➔ Solicitar Eco-Estrés"],
            ["3", "Prevención Secundaria", "Estatina de alta potencia obligatoria siempre", "Atorvastatina 80 mg (Meta c-LDL < 55 mg/dL)"],
            ["4", "Meta Betabloqueador", "Titular dosis según frecuencia cardíaca", "Meta FC en reposo: 55 a 60 lpm"],
            ["5", "Angina de Prinzmetal", "Vasoespasmo nocturno con ST ↑ transitorio", "Calcioantagonistas SÍ ➔ Betabloqueadores NUNCA"]
          ]}
          highlightColIndex={3}
          bottomNote="Próxima Clase: Cardio 02 — SCASEST: Angina Inestable e Infarto Agudo al Miocardio sin SDST."
        />
      </Slide>

    </Deck>
  );
}
