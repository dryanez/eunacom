import React from "react";
import Deck from "../deck/Deck";
import { Slide } from "../deck/Slide";
import { Cover } from "../components/deck/Cover";
import { Steps } from "../components/deck/Steps";
import { Table } from "../components/deck/Table";
import { Spotlight } from "../components/deck/Spotlight";
import { FlowGrid } from "../components/deck/FlowGrid";
import { DecisionFlowchart } from "../components/deck/DecisionFlowchart";
import { QuestionSlide } from "../components/deck/QuestionSlide";

export default function Cardio01Deck() {
  return (
    <Deck title="Cardio 01: Angina Crónica Estable & Cardiopatía Isquémica" classId="cardio-01">
      
      {/* SLIDE 1: PORTADA & CÓDIGOS OFICIALES */}
      <Slide
        nav="Portada & Códigos"
        notes="Bienvenidos a la Masterclass de Angina Crónica Estable y Cardiopatía Isquémica para el EUNACOM 2026. Cubriremos los códigos 1.01.1.001 de Angina Estable, 1.01.4.004 de Test de Esfuerzo y 1.01.4.008 de AngioTAC coronario del Perfil V3."
      >
        <Cover
          classNumber="CLASE 01"
          kicker="PERFIL V3 ASOFAMECH · CÓD: 1.01.1.001 + 1.01.4.004 + 1.01.4.008"
          badges={[
            { label: "EUNACOM 2026", bg: "#ffe4e6", color: "#e11d48", border: "#f43f5e" },
            { label: "Medicina Interna", bg: "#e0f2fe", color: "#0284c7", border: "#38bdf8" },
            { label: "Cardiología 01", bg: "#dcfce7", color: "#16a34a", border: "#4ade80" }
          ]}
          title={<span>Angina Crónica <span style={{ color: "#e11d48", fontStyle: "italic" }}>Estable</span></span>}
          subtitle="Criterios Diamond-Forrester · Test de Esfuerzo · Criterios de Alto Riesgo · Betabloqueo & Prevención Secundaria"
        />
      </Slide>

      {/* SLIDE 2: MATRIZ DE AUDITORÍA OFICIAL PERFIL V3 */}
      <Slide
        nav="Matriz Perfil V3"
        notes="Esta es la matriz de exigencia legal obligatoria evaluada por ASOFAMECh. Para Angina Crónica Estable se exige diagnóstico específico, inicio de tratamiento y seguimiento completo en APS."
      >
        <Table
          classNumber="CLASE 01"
          title="Matriz de Exigencia Legal Perfil V3"
          subtitle="Competencias legales obligatorias evaluadas en el Examen Único Nacional de Medicina."
          headers={["Código", "Situación Clínica / Examen", "Diagnóstico", "Tratamiento", "Seguimiento", "Nivel Legal APS"]}
          highlightCol={1}
          pearl="El médico general en APS debe realizar el diagnóstico clínico, indicar el estudio no invasivo y titular la terapia antiisquémica y preventiva."
          rows={[
            { highlight: true, cells: ["1.01.1.001", "Angina Crónica Estable", "Específico", "Inicial", "Completo APS", "✓ Manejo en CESFAM"] },
            { cells: ["1.01.4.004", "Test de Esfuerzo / Ergometría", "Emplea Informe", "Indica según riesgo", "Especialista", "✓ Interpreta criterios"] },
            { cells: ["1.01.4.008", "AngioTAC Coronario", "Emplea Informe", "Indica en riesgo medio", "Especialista", "✓ VPN > 98%"] },
            { cells: ["1.01.4.005", "Coronariografía Invasiva", "Conoce Indicación", "Deriva a Hemodinamia", "Especialista", "✓ Si alto riesgo"] }
          ]}
        />
      </Slide>

      {/* SLIDE 3: DIAGRAMA DE FLUJO DIAMOND-FORRESTER (HORIZONTAL FLOWGRID) */}
      <Slide
        nav="Criterios Diamond-Forrester"
        notes="El diagnóstico de la angina es fundamentalmente clínico. La escala de Diamond-Forrester evalúa 3 características esenciales que se deben cumplir simultáneamente para clasificar el dolor como Angina Típica."
      >
        <FlowGrid
          classNumber="CLASE 01"
          category="CARDIOLOGÍA"
          topic="ANGINA CRÓNICA ESTABLE"
          subtopic="SEMIOLOGÍA DEL DOLOR"
          title="Los 3 Criterios de Diamond-Forrester"
          subtitle="Secuencia obligatoria de evaluación clínica del dolor torácico en la consulta médica."
          steps={[
            {
              title: "1. Dolor Opresivo",
              desc: "Opresión o pesadez retroesternal con irradiación a mandíbula, cuello, hombro o brazo izquierdo.",
              tag: "Carácter",
              footer: "Localización retroesternal profunda",
              footerColor: "#0284c7"
            },
            {
              title: "2. Gatillado por Esfuerzo",
              desc: "Aparece de forma predecible ante actividad física (subir cuestas/escaleras) o estrés emocional intenso.",
              tag: "Desencadenante",
              footer: "Aumento del consumo de O2",
              footerColor: "#e11d48"
            },
            {
              title: "3. Alivio Rápido",
              desc: "Cede en menos de 5 a 10 minutos con el reposo inmediato o con la administración de Nitratos sublinguales.",
              tag: "Alivio",
              footer: "Recupera la reserva coronaria",
              footerColor: "#16a34a"
            }
          ]}
          conclusion="✓ CUMPLE LOS 3 CRITERIOS = ANGINA TÍPICA (Probabilidad pretest de enfermedad coronaria > 85%)"
          pearl="Si cumple 2 criterios = Angina Atípica (muy frecuente en diabéticos y mujeres). Si cumple 0 o 1 = Dolor Torácico No Cardíaco."
        />
      </Slide>

      {/* SLIDE 4: TABLA COMPARATIVA DE TIPOS DE DOLOR TORÁCICO */}
      <Slide
        nav="Clasificación del Dolor"
        notes="En el examen EUNACOM es clave clasificar el tipo de dolor para determinar la probabilidad pretest de cardiopatía coronaria."
      >
        <Table
          classNumber="CLASE 01"
          title="Clasificación Clínica del Dolor Torácico"
          subtitle="Diferenciación semiológica según criterios de Diamond-Forrester para triaje diagnóstico."
          headers={["Tipo de Dolor", "Criterios Cumplidos", "Población Frecuente", "Probabilidad Pretest", "Conducta Inicial"]}
          highlightCol={0}
          pearl="En pacientes diabéticos, la neuropatía autonómica puede cursar como 'isquemia silente' o manifestarse únicamente con disnea de esfuerzos."
          rows={[
            {
              highlight: true,
              cells: [
                "Angina Típica",
                "3 de 3 Criterios",
                "Hombres > 50 años, tabaquismo, dislipidemia",
                "Alta (> 85%)",
                "Test de Esfuerzo / Fármacos antiisquémicos"
              ]
            },
            {
              cells: [
                "Angina Atípica",
                "2 de 3 Criterios",
                "Mujeres, Adultos Mayores y Diabéticos (Disnea)",
                "Intermedia (15 - 85%)",
                "AngioTAC coronario o Eco-Estrés"
              ]
            },
            {
              cells: [
                "Dolor No Cardíaco",
                "0 o 1 Criterio",
                "Jóvenes, Ansiedad, Dolor punzante condral",
                "Baja (< 15%)",
                "Buscar osteocondritis (Tietze) o RGE"
              ]
            }
          ]}
        />
      </Slide>

      {/* SLIDE 5: TABLA DE LA ESCALA CANADIENSE (CCS I A IV) */}
      <Slide
        nav="Escala Canadiense (CCS)"
        notes="La severidad de la limitación funcional de la angina se gradúa según la Sociedad Cardiovascular Canadiense de clase I a clase IV."
      >
        <Table
          classNumber="CLASE 01"
          title="Clasificación Funcional Canadiense (CCS I a IV)"
          subtitle="Graduación del impacto de la angina en la actividad física de la vida diaria."
          headers={["Grado CCS", "Limitación Física", "Actividad que Desencadena Angina", "Manejo Clínico"]}
          highlightCol={0}
          pearl="¡Regla de Urgencia!: Todo paciente que progresa rápidamente a CCS III-IV en las últimas semanas o tiene dolor en reposo es un SCASEST (Angina Inestable)."
          rows={[
            { cells: ["Clase I", "Sin limitación ordinaria", "Solo con esfuerzos extenuantes, rápidos o prolongados.", "Manejo ambulatorio en APS"] },
            { cells: ["Clase II", "Ligera limitación", "Al caminar rápido, subir cuestas o más de 1 piso de escaleras.", "Titular Betabloqueador"] },
            { cells: ["Clase III", "Marcada limitación", "Al caminar 1 o 2 cuadras en plano o subir 1 piso a paso normal.", "Optimizar terapia combinada"] },
            { highlight: true, cells: ["Clase IV", "Incapacidad total", "Con mínimos esfuerzos o en reposo (sospecha de SCA).", "Derivar a Urgencias / UCI"] }
          ]}
        />
      </Slide>

      {/* SLIDE 6: DIAGRAMA DE LA CASCADA ISQUÉMICA (FLOWGRID) */}
      <Slide
        nav="Cascada Isquémica"
        notes="La base fisiopatológica es la obstrucción coronaria fija mayor al 70%. La cascada isquémica demuestra que las alteraciones metabólicas y eléctricas ocurren antes de sentir dolor."
      >
        <FlowGrid
          classNumber="CLASE 01"
          category="CARDIOLOGÍA"
          topic="ANGINA CRÓNICA ESTABLE"
          subtopic="FISIOPATOLOGÍA CORONARIA"
          title="La Cascada Isquémica Miocárdica"
          subtitle="Secuencia cronológica de eventos desde la caída de perfusión hasta el síntoma clínico."
          steps={[
            {
              title: "1. Falla Metabólica",
              desc: "Desbalance de O2 ➔ Producción de lactato y caída de ATP intracelular miocárdico.",
              tag: "Celular",
              footer: "Minutos 0 - 1",
              footerColor: "#64748b"
            },
            {
              title: "2. Falla Diastólica",
              desc: "Pérdida de la relajación activa del ventrículo izquierdo (aumento de presión telediastólica).",
              tag: "Ecocardiograma",
              footer: "Visible en Doppler tisular",
              footerColor: "#0284c7"
            },
            {
              title: "3. Cambios en ECG",
              desc: "Infradesnivel del segmento ST e inversión simétrica de la onda T por isquemia subendocárdica.",
              tag: "Electrocardiograma",
              footer: "Depresión del ST ≥ 1 mm",
              footerColor: "#f59e0b"
            },
            {
              title: "4. Dolor Anginoso",
              desc: "Estimulación de terminaciones nerviosas simpáticas por adenosina y bradicinina.",
              tag: "Síntoma Clínico",
              footer: "ÚLTIMO eslabón temporal",
              footerColor: "#dc2626"
            }
          ]}
          conclusion="💡 EL DOLOR ES EL ÚLTIMO EVENTO: Las alteraciones funcionales y eléctricas preceden siempre a la molestia del paciente."
          pearl="Una estenosis coronaria > 70% preserva el flujo basal en reposo pero agota la reserva coronaria durante el esfuerzo físico."
        />
      </Slide>

      {/* SLIDE 7: DIAGRAMA ALGORÍTMICO DE ESTUDIO DIAGNÓSTICO (DECISION FLOWCHART) */}
      <Slide
        nav="Algoritmo de Estudio Diagnóstico"
        notes="La elección del examen complementario depende de la probabilidad pretest y de si el ECG basal permite una interpretación adecuada del segmento ST."
      >
        <DecisionFlowchart
          classNumber="CLASE 01"
          category="CARDIOLOGÍA"
          topic="ANGINA CRÓNICA ESTABLE"
          subtopic="ESTUDIO NO INVASIVO"
          startNode={{
            badge: "EVALUACIÓN EN APS",
            title: "Paciente con Sospecha Clínica de Angina Estable",
            subtitle: "Dolor torácico típico/atípico + Examen físico cardiopulmonar + ECG de 12 derivaciones basal"
          }}
          decisionNode="¿El ECG Basal es Interpretable y el Paciente Puede Caminar?"
          branches={[
            {
              isYes: true,
              pillText: "✓ SÍ (Elegible para Esfuerzo)",
              tag: "1ra Línea APS",
              title: "Test de Esfuerzo (Ergometría / Bruce)",
              points: [
                "Protocolo estándar en cinta rodante",
                "Evalúa síntomas, capacidad física (METs) y ECG",
                "Criterio (+) = Infradesnivel ST ≥ 1.0 mm a 80 ms"
              ],
              action: "Indicar PEG de esfuerzo en CESFAM"
            },
            {
              label: "🔍 Riesgo Intermedio (15 - 50%)",
              pillBg: "#0284c7",
              tag: "Alta Precisión",
              title: "AngioTAC Coronario Multislice",
              points: [
                "Visualización anatómica no invasiva de coronarias",
                "Valor Predictivo Negativo > 98% (descarta obstrucción)",
                "Score de Calcio coronario (Agatston)"
              ],
              action: "Excelente para descartar patología"
            },
            {
              isNo: true,
              pillText: "✗ NO (ECG No Interpretable)",
              tag: "Contraindicado PEG",
              title: "Eco-Estrés / Resonancia Cardíaca",
              points: [
                "Presencia de BCRI, Marcapasos o WPW basal",
                "Incapacidad motora o artrosis severa",
                "Estrés farmacológico con Dobutamina / Dipiridamol"
              ],
              action: "Contraindicado Test de Esfuerzo común"
            }
          ]}
          bottomBanner={{
            icon: "💡",
            title: "Regla de Oro EUNACOM",
            text: "Si el paciente tiene Bloqueo Completo de Rama Izquierda (BCRI), el Test de Esfuerzo convencional NO es interpretable y está contraindicado como método diagnóstico único."
          }}
        />
      </Slide>

      {/* SLIDE 8: TABLA DE CRITERIOS DE POSITIVIDAD EN TEST DE ESFUERZO */}
      <Slide
        nav="Test de Esfuerzo (Criterios)"
        notes="Revisemos los criterios exactos que definen una prueba de esfuerzo positiva para isquemia miocárdica según las guías clínicas."
      >
        <Table
          classNumber="CLASE 01"
          title="Test de Esfuerzo: Criterios de Positividad & Contraindicaciones"
          subtitle="Parámetros evaluados en el protocolo de Bruce en cinta rodante."
          headers={["Parámetro", "Criterio EUNACOM", "Significado Clínico", "Conducta Terapéutica"]}
          highlightCol={1}
          pearl="Un infradesnivel ascendente rápido del ST es una respuesta fisiológica normal y NO se considera positivo."
          rows={[
            { highlight: true, cells: ["Infradesnivel del ST", "≥ 1.0 mm (0.1 mV) horizontal o descendente a 80 ms del punto J", "Positivo para Isquemia", "Optimizar fármacos antiisquémicos"] },
            { highlight: true, cells: ["Supradesnivel del ST", "≥ 1.0 mm en derivaciones sin onda Q previa", "Isquemia transmural grave", "Detener prueba ➔ Coronariografía"] },
            { cells: ["Respuesta de PA", "Aumento progresivo normal de PAS (hasta 200 mmHg)", "Reserva contráctil conservada", "Respuesta hemodinámica normal"] },
            { cells: ["Contraindicación Absoluta", "Estenosis Aórtica Severa Sintomática, IAM reciente <48h o Arritmias malignas", "Riesgo de síncope o paro", "¡Contraindicado realizar PEG!"] }
          ]}
        />
      </Slide>

      {/* SLIDE 9: DIAGRAMA DE 4 CRITERIOS DE ALTO RIESGO (DECISION FLOWCHART) */}
      <Slide
        nav="Criterios de Alto Riesgo"
        notes="Estos 4 hallazgos en el test de esfuerzo definen alto riesgo de mortalidad cardiovascular (>3% anual) e indican derivación inmediata a coronariografía invasiva."
      >
        <DecisionFlowchart
          classNumber="CLASE 01"
          category="CARDIOLOGÍA"
          topic="ANGINA CRÓNICA ESTABLE"
          subtopic="ALTO RIESGO ISQUÉMICO"
          startNode={{
            badge: "HALLAZGOS DE ALARMA EN ERGOMETRÍA",
            title: "4 Banderas Rojas de Alto Riesgo (Mortalidad > 3% Anual)",
            subtitle: "Cualquiera de estos 4 hallazgos traduce isquemia miocárdica masiva o enfermedad de tronco coronario."
          }}
          decisionNode="¿El Paciente Presenta Alguna de estas 4 Banderas Rojas?"
          branches={[
            {
              isNo: true,
              pillText: "🚨 ST Severo",
              tag: "Isquemia Extensa",
              title: "Infradesnivel ST ≥ 2.0 mm",
              points: [
                "Morfología horizontal o descendente",
                "Presente en ≥ 5 derivaciones simultáneas",
                "Persistencia > 5 min en la recuperación"
              ],
              action: "Derivar a Coronariografía urgente"
            },
            {
              isNo: true,
              pillText: "🚨 Precoz",
              tag: "Bajo Umbral",
              title: "Isquemia en Estadio 1 de Bruce",
              points: [
                "Aparición con FC < 120 lpm",
                "Carga de trabajo baja (< 5 METs)",
                "Angina limitante a los 2-3 minutos"
              ],
              action: "Compromiso de Tronco Común Izquierdo"
            },
            {
              isNo: true,
              pillText: "🚨 Falla de Bomba",
              tag: "Hemodinamia",
              title: "Caída de Presión Sistólica",
              points: [
                "Descenso de la PAS durante el esfuerzo",
                "Falla aguda contráctil del VI por isquemia",
                "Enfermedad de 3 vasos coronarios"
              ],
              action: "Alto riesgo de shock / colapso"
            }
          ]}
          bottomBanner={{
            icon: "🚨",
            title: "Conducta Obligatoria EUNACOM",
            text: "Los criterios de alto riesgo isquémico exigen derivación urgente a Coronariografía Invasiva para evaluar revascularización miocárdica quirúrgica (CABG) o percutánea (ATC)."
          }}
        />
      </Slide>

      {/* SLIDE 10: TABLA DE PREVENCIÓN SECUNDARIA OBLIGATORIA */}
      <Slide
        nav="Prevención Secundaria"
        notes="Todo paciente con cardiopatía isquémica demostrada debe recibir terapia de prevención secundaria obligatoria para reducir el riesgo de infarto y muerte."
      >
        <Table
          classNumber="CLASE 01"
          title="Terapia de Prevención Secundaria Obligatoria en APS"
          subtitle="Fármacos que modifican la sobrevida y previenen eventos coronarios mayores (MACE)."
          headers={["Fármaco", "Dosis de Elección", "Mecanismo de Beneficio", "Meta EUNACOM"]}
          highlightCol={0}
          pearl="Las estatinas de alta potencia se indican SIEMPRE en cardiopatía isquémica, independientemente del nivel basal de colesterol."
          rows={[
            {
              highlight: true,
              cells: [
                "Aspirina (AAS)",
                "100 mg / día vo a permanencia",
                "Inhibición irreversible de COX-1 plaquetaria ➔ Antiagregación",
                "Previene trombosis sobre la placa (Clopidogrel 75 mg si alergia)"
              ]
            },
            {
              highlight: true,
              cells: [
                "Estatina de Alta Potencia",
                "Atorvastatina 80 mg o Rosuvastatina 40 mg/d",
                "Estabilización de placa, efecto pleiotrópico y reducción de lípidos",
                "c-LDL < 55 mg/dL Y reducción ≥ 50% del valor basal"
              ]
            },
            {
              cells: [
                "IECA / ARA-II",
                "Enalapril 10 - 20 mg/día vo",
                "Bloqueo del eje RAA, previene remodelado y fibrosis",
                "Indicado si asocia HTA, DM2, FEVI ≤ 40% o daño renal"
              ]
            }
          ]}
        />
      </Slide>

      {/* SLIDE 11: TABLA DE TERAPIA ANTIISQUÉMICA DE 1RA Y 2DA LÍNEA */}
      <Slide
        nav="Terapia Antiisquémica"
        notes="Los betabloqueadores son el fármaco antiisquémico de primera elección porque disminuyen el consumo miocárdico de oxígeno al reducir la frecuencia cardíaca y la contractilidad."
      >
        <Table
          classNumber="CLASE 01"
          title="Farmacoterapia Antiisquémica: 1ra y 2da Línea"
          subtitle="Manejo sintomático del dolor anginoso y control hemodinámico en APS."
          headers={["Línea Terapéutica", "Fármacos de Elección", "Mecanismo Principal", "Meta & Precauciones"]}
          highlightCol={0}
          pearl="Meta antiisquémica obligatoria: Frecuencia Cardíaca en reposo entre 55 y 60 latidos por minuto."
          rows={[
            {
              highlight: true,
              cells: [
                "1ra Línea: Betabloqueadores",
                "Bisoprolol 5 - 10 mg/d o Carvedilol 25 mg c/12h",
                "Bloqueo Beta-1: ↓ FC, ↓ contractilidad y ↑ tiempo de diástole",
                "Meta FC reposo 55-60 lpm. Contraindicado en asma severa o BAV"
              ]
            },
            {
              cells: [
                "Alternativa 1ra Línea: Calcioantagonistas No-DHP",
                "Verapamilo 80-120 mg c/8h o Diltiazem 60-120 mg c/8h",
                "Inótropo y cronótropo negativo (frena nodo AV)",
                "Usar si intolerancia a BB. ¡NUNCA combinar con BB por riesgo de shock!"
              ]
            },
            {
              cells: [
                "2da Línea (Asociación): Calcioantagonistas DHP",
                "Amlodipino 5 - 10 mg / día vo",
                "Vasodilatador arterial coronario y periférico",
                "Excelente para sumar a Betabloqueador si persiste angina"
              ]
            },
            {
              cells: [
                "Rescate Inmediato: Nitratos",
                "Nitroglicerina sublingual 0.6 mg SOS",
                "Venodilatador (↓ precarga) y vasodilatador coronario",
                "Tomar en reposo (máx 3 comp en 15m). ¡Contraindicado con Sildenafil!"
              ]
            }
          ]}
        />
      </Slide>

      {/* SLIDE 12: DIAGRAMA DE ANGINA DE PRINZMETAL (DECISION FLOWCHART) */}
      <Slide
        nav="Angina de Prinzmetal"
        notes="La angina de Prinzmetal es causada por vasoespasmo coronario transitorio en reposo. Los Calcioantagonistas son el tratamiento de elección y los Betabloqueadores están estrictamente contraindicados."
      >
        <DecisionFlowchart
          classNumber="CLASE 01"
          category="CARDIOLOGÍA"
          topic="ANGINA CRÓNICA ESTABLE"
          subtopic="VASOESPASMO CORONARIO"
          startNode={{
            badge: "PATOLOGÍA ESPECIAL EUNACOM",
            title: "Angina Vasoespástica de Prinzmetal",
            subtitle: "Dolor anginoso típico de reposo (madrugada) + Supradesnivel ST transitorio que desaparece con Nitroglicerina"
          }}
          decisionNode="¿Cuál es la Conducta Terapéutica Correcta en Prinzmetal?"
          branches={[
            {
              isYes: true,
              pillText: "✓ FÁRMACO DE ELECCIÓN (SÍ)",
              tag: "1ra Línea",
              title: "Calcioantagonistas",
              points: [
                "Amlodipino 10 mg/d o Diltiazem 240 mg/d",
                "Vasodilatación arterial directa de la musculatura lisa",
                "Previenen las crisis de espasmo a largo plazo"
              ],
              action: "Tratamiento de elección a largo plazo"
            },
            {
              label: "🚭 CESE DE TABACO",
              pillBg: "#0284c7",
              tag: "Medida Esencial",
              title: "Suspensión del Cigarrillo",
              points: [
                "Principal gatillante endotelial del espasmo",
                "La nicotina induce hiperreactividad vascular",
                "Consejería antitabaco obligatoria en APS"
              ],
              action: "Reduce drásticamente las crisis"
            },
            {
              isNo: true,
              pillText: "🚨 CONTRAINDICACIÓN MORTAL (NO)",
              tag: "¡Peligro Vital!",
              title: "¡PROHIBIDOS BETABLOQUEADORES!",
              points: [
                "El bloqueo Beta-2 deja el tono Alfa-1 libre sin freno",
                "Produce vasoespasmo severo e infarto agudo",
                "Trampa repetida y clásica del banco de preguntas"
              ],
              action: "¡Estrictamente contraindicados!"
            }
          ]}
          bottomBanner={{
            icon: "💡",
            title: "Regla de Oro de Examen",
            text: "En Angina de Prinzmetal los Betabloqueadores están PROHIBIDOS porque agravan el espasmo por vasoconstricción alfa-1 refleja. El tratamiento de elección son los Calcioantagonistas."
          }}
        />
      </Slide>

      {/* SLIDE 13: LAS 4 TRAMPAS CRÍTICAS DEL EUNACOM */}
      <Slide
        nav="4 Trampas del EUNACOM"
        notes="Repasemos las 4 trampas más frecuentes que aparecen en el banco de preguntas sobre cardiopatía isquémica estable."
      >
        <Steps
          classNumber="CLASE 01"
          title="Las 4 Trampas Críticas del Banco EUNACOM"
          subtitle="Errores clásicos de examen que debes evitar para asegurar el puntaje máximo."
          items={[
            {
              num: "1",
              title: "Trampa de la Estatina con Colesterol Normal",
              desc: "En un paciente coronario con Angina Estable, la Atorvastatina 80 mg es obligatoria independientemente de que su colesterol basal esté normal (meta LDL < 55 mg/dL)."
            },
            {
              num: "2",
              title: "Trampa del BCRI en Test de Esfuerzo",
              desc: "Un paciente con Bloqueo de Rama Izquierda o Marcapasos NO puede evaluarse con Test de Esfuerzo convencional; requiere Eco-Estrés o Resonancia Cardíaca."
            },
            {
              num: "3",
              title: "Trampa de los Betabloqueadores en Prinzmetal",
              desc: "En angina vasoespástica, los betabloqueadores empeoran el cuadro por vasoconstricción alfa refleja; el tratamiento de elección son los Calcioantagonistas."
            },
            {
              num: "4",
              title: "Trampa de la Angina Inestable Disfrazada",
              desc: "Si la angina aparece en reposo o con mínimos esfuerzos (CCS IV) o progresa rápidamente en las últimas semanas, ya NO es estable: es un SCASEST y requiere hospitalización."
            }
          ]}
        />
      </Slide>

      {/* SLIDE 14: CASO CLÍNICO EUNACOM #1 */}
      <Slide
        nav="Caso Clínico 1 (Diagnóstico)"
        notes="Analicemos este caso clínico de diagnóstico y conducta inicial en APS."
      >
        <QuestionSlide
          classNumber="CLASE 01"
          questionNumber={1}
          specialty="Cardiología"
          code="1.01.1.001"
          question="Hombre de 56 años, hipertenso y fumador activo. Consulta en el CESFAM por dolor retroesternal opresivo que aparece al subir 2 pisos de escaleras o caminar rápido en subida, de 3 meses de evolución. El dolor cede completamente tras 3 a 5 minutos de reposo. Examen físico: PA 138/84 mmHg, FC 76 lpm regular, examen cardiopulmonar normal. Su ECG basal de 12 derivaciones es estrictamente normal. ¿Cuál es el diagnóstico más probable y la conducta diagnóstica inicial más adecuada?"
          correctOptionId="B"
          options={[
            {
              id: "A",
              text: "Dolor torácico no coronario; tranquilizar al paciente e indicar kinesioterapia respiratoria.",
              explanation: "Incorrecto. El paciente cumple los 3 criterios de Diamond-Forrester para Angina Típica.",
              isCorrect: false
            },
            {
              id: "B",
              text: "Angina Crónica Estable; indicar Test de Esfuerzo (Ergometría) e iniciar Aspirina 100 mg, Atorvastatina 80 mg y Bisoprolol.",
              explanation: "Correcto. El cuadro cumple criterios de Angina Típica en clase funcional CCS II. Con ECG basal normal y capacidad para caminar, el Test de Esfuerzo es el estudio indicado, asociando prevención secundaria y betabloqueo.",
              isCorrect: true
            },
            {
              id: "C",
              text: "Síndrome Coronario Agudo SCACEST; derivar de inmediato en ambulancia con sirena a Hemodinamia para angioplastía primaria.",
              explanation: "Incorrecto. El cuadro es estable de 3 meses de evolución, cede con el reposo y el ECG basal es normal sin supradesnivel del ST.",
              isCorrect: false
            },
            {
              id: "D",
              text: "Angina de Prinzmetal; iniciar Verapamilo 80 mg cada 8 horas y contraindicar el ejercicio físico.",
              explanation: "Incorrecto. La angina de Prinzmetal ocurre en reposo y de noche, no desencadenada por esfuerzo físico predecible.",
              isCorrect: false
            },
            {
              id: "E",
              text: "Osteocondritis condrocostal (Síndrome de Tietze); indicar antiinflamatorios no esteroidales orales.",
              explanation: "Incorrecto. La osteocondritis produce dolor punzante reproducible a la palpación costal, no dolor opresivo retroesternal de esfuerzo.",
              isCorrect: false
            }
          ]}
        />
      </Slide>

      {/* SLIDE 15: CASO CLÍNICO EUNACOM #2 */}
      <Slide
        nav="Caso Clínico 2 (Manejo Farmacológico)"
        notes="Analicemos este caso de titulación y metas de frecuencia cardíaca."
      >
        <QuestionSlide
          classNumber="CLASE 01"
          questionNumber={2}
          specialty="Cardiología"
          code="1.01.1.001"
          question="Mujer de 64 años con diagnóstico confirmado de Angina Crónica Estable mediante test de esfuerzo positivo en estadio 3 de Bruce. Actualmente en tratamiento con Aspirina 100 mg/día, Atorvastatina 80 mg/día y Atenolol 25 mg/día. En su control refiere que persiste con episodios de opresión precordial al caminar 3 cuadras. Al examen físico: PA 132/80 mmHg, FC 82 lpm regular. ¿Cuál es la conducta farmacológica más adecuada para optimizar el control de sus síntomas?"
          correctOptionId="C"
          options={[
            {
              id: "A",
              text: "Suspender Atenolol e iniciar Diltiazem 60 mg cada 8 horas.",
              explanation: "Incorrecto. El betabloqueador es el fármaco de primera línea y su dosis actual es subterapéutica con FC de 82 lpm.",
              isCorrect: false
            },
            {
              id: "B",
              text: "Agregar Clopidogrel 75 mg/día para realizar doble antiagregación plaquetaria.",
              explanation: "Incorrecto. La doble antiagregación no está indicada en angina crónica estable sin angioplastía reciente.",
              isCorrect: false
            },
            {
              id: "C",
              text: "Aumentar la dosis del Betabloqueador para alcanzar una frecuencia cardíaca meta en reposo de 55 a 60 lpm.",
              explanation: "Correcto. El objetivo terapéutico antiisquémico con betabloqueadores es titular la dosis hasta lograr una FC en reposo entre 55 y 60 lpm.",
              isCorrect: true
            },
            {
              id: "D",
              text: "Derivar de urgencia para cirugía de Bypass Aortocoronario (CABG) inmediata.",
              explanation: "Incorrecto. Primero se debe optimizar la terapia médica farmacológica antes de considerar revascularización invasiva.",
              isCorrect: false
            },
            {
              id: "E",
              text: "Indicar Digoxina 0.25 mg/día para mejorar el inotropismo miocárdico.",
              explanation: "Incorrecto. La digoxina no tiene indicación en angina estable y puede aumentar el consumo miocárdico de oxígeno.",
              isCorrect: false
            }
          ]}
        />
      </Slide>

      {/* SLIDE 16: CASO CLÍNICO EUNACOM #3 */}
      <Slide
        nav="Caso Clínico 3 (Prinzmetal)"
        notes="Analicemos este caso de angina vasoespástica y contraindicación de fármacos."
      >
        <QuestionSlide
          classNumber="CLASE 01"
          questionNumber={3}
          specialty="Cardiología"
          code="1.01.1.001"
          question="Hombre de 42 años, fumador de 20 cigarrillos diarios, sin otros antecedentes. Consulta en Urgencias por dolor torácico opresivo intenso que lo despierta a las 4:00 AM en reposo. Al ingreso el ECG muestra supradesnivel del ST de 2.5 mm en D2, D3 y aVF. Se le administra Nitroglicerina sublingual y a los 8 minutos el dolor desaparece por completo; un nuevo ECG repetido muestra resolución total del supradesnivel del ST con trazado normal. Las enzimas cardíacas seriadas resultan negativas. ¿Cuál es el tratamiento de elección a largo plazo y qué fármaco está estrictamente contraindicado?"
          correctOptionId="D"
          options={[
            {
              id: "A",
              text: "Tratamiento de elección: Propranolol; Fármaco contraindicado: Nitratos.",
              explanation: "Incorrecto. Los betabloqueadores como propranolol están estrictamente contraindicados en Prinzmetal.",
              isCorrect: false
            },
            {
              id: "B",
              text: "Tratamiento de elección: Angioplastía coronaria con stent; Fármaco contraindicado: Aspirina.",
              explanation: "Incorrecto. En Prinzmetal no hay placa obstructiva fija que requiera stent; el mecanismo es espasmo dinámico.",
              isCorrect: false
            },
            {
              id: "C",
              text: "Tratamiento de elección: Amiodarona oral; Fármaco contraindicado: Calcioantagonistas.",
              explanation: "Incorrecto. La amiodarona es un antiarrítmico y los calcioantagonistas son precisamente el tratamiento de elección.",
              isCorrect: false
            },
            {
              id: "D",
              text: "Tratamiento de elección: Calcioantagonistas (Amlodipino o Diltiazem); Fármaco contraindicado: Betabloqueadores.",
              explanation: "Correcto. El cuadro corresponde a Angina Vasoespástica de Prinzmetal. Los calcioantagonistas previenen el espasmo coronario y los betabloqueadores están contraindicados por dejar tono alfa vasoconstrictor libre.",
              isCorrect: true
            },
            {
              id: "E",
              text: "Tratamiento de elección: Trombolisis con Alteplase; Fármaco contraindicado: Heparina.",
              explanation: "Incorrecto. No hay trombo oclusivo; el supradesnivel resolvió espontáneamente y las troponinas fueron negativas.",
              isCorrect: false
            }
          ]}
        />
      </Slide>

      {/* SLIDE 17: ALGORITMO DE DECISIÓN RESUMIDO */}
      <Slide
        nav="Checklist & Algoritmo Resumen"
        notes="Repasemos el checklist final para resolver cualquier pregunta de angina crónica estable en el EUNACOM 2026."
      >
        <Steps
          classNumber="CLASE 01"
          title="Algoritmo Clínico Resumido: Angina Estable"
          subtitle="Checklist de alta fidelidad para el Médico General en APS."
          items={[
            {
              num: "1",
              title: "Diagnóstico Clínico (Diamond-Forrester)",
              desc: "Opresión retroesternal + Esfuerzo + Alivio con reposo/nitratos en <10 min. Clasificar clase funcional CCS I-IV."
            },
            {
              num: "2",
              title: "Estudio No Invasivo Inicial",
              desc: "Test de Esfuerzo si ECG basal normal y puede caminar. AngioTAC en riesgo intermedio o Eco-Estrés si hay BCRI."
            },
            {
              num: "3",
              title: "Terapia Preventiva Obligatoria",
              desc: "Aspirina 100 mg/d + Atorvastatina 80 mg/d (meta c-LDL <55 mg/dL) + IECA/ARA-II si es hipertenso o diabético."
            },
            {
              num: "4",
              title: "Terapia Antiisquémica",
              desc: "Betabloqueador (Bisoprolol/Carvedilol) con meta de FC reposo 55-60 lpm + Amlodipino si persiste angina + Nitratos SOS."
            }
          ]}
        />
      </Slide>

      {/* SLIDE 18: CIERRE DE LA CLASE */}
      <Slide
        nav="Conclusión & Siguiente Clase"
        notes="Hemos completado la Masterclass de Angina Crónica Estable. En la siguiente clase abordaremos el Síndrome Coronario Agudo sin Supradesnivel del ST y la Angina Inestable (Cardio 02)."
      >
        <Spotlight
          classNumber="CLASE 01"
          category="CARDIOLOGÍA"
          topic="ANGINA CRÓNICA ESTABLE"
          subtopic="CIERRE DE LA MASTERCLASS"
          badge="100% CUBIERTO"
          badgeBg="#16a34a"
          title="¡Clase Completada con Éxito!"
          stat="18 / 18"
          statLabel="Conceptos & Algoritmos Dominados"
          bullets={[
            "✓ Códigos Perfil V3 dominados: 1.01.1.001 (Angina Estable), 1.01.4.004 (PEG), 1.01.4.008 (AngioTAC).",
            "✓ Dominio de Criterios Diamond-Forrester, Escala Canadiense CCS y Criterios de Alto Riesgo.",
            "✓ Farmacoterapia completa: Dosis, metas de FC y prevención secundaria.",
            "👉 Siguiente Clase: Cardio 02 — SCASEST: Angina Inestable e Infarto sin Supradesnivel del ST."
          ]}
          pearl="Continúa revisando el capítulo correspondiente en el Manual EUNACOM 2026 y resolviendo las preguntas asociadas en el banco de pruebas."
          accentColor="#16a34a"
        />
      </Slide>

    </Deck>
  );
}
