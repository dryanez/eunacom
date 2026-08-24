import React from "react";
import Deck from "../deck/Deck";
import { Slide } from "../deck/Slide";
import { BnBSlide } from "../components/deck/BnBSlide";
import {
  VesselPlaqueGraphic,
  OxygenBalanceGraphic,
  ECGDepressionGraphic,
  ECGElevationGraphic,
  BnBMiniTable
} from "../components/deck/BnBGraphics";
import { QuestionSlide } from "../components/deck/QuestionSlide";

export default function Cardio01Deck() {
  return (
    <Deck title="Cardio 01: Angina Crónica Estable & Cardiopatía Isquémica" classId="cardio-01">
      
      {/* SLIDE 1: PORTADA OFICIAL (Boards & Beyond Minimalist Style) */}
      <Slide
        nav="Portada & Códigos"
        notes="Bienvenidos a la Masterclass oficial de Angina Crónica Estable y Cardiopatía Isquémica para el EUNACOM 2026. Cubriremos los códigos 1.01.1.001, 1.01.4.004 y 1.01.4.008 del Perfil V3."
      >
        <div style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          background: "#ffffff",
          padding: "40px"
        }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#0284c7", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
            ASOFAMECh Perfil V3 Oficial · Medicina Interna
          </div>
          <h1 style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 64,
            fontWeight: 700,
            color: "#0f2942",
            margin: "0 0 16px",
            lineHeight: 1.15
          }}>
            Angina Crónica Estable
          </h1>
          <div style={{ fontSize: 24, color: "#475569", maxWidth: 900, lineHeight: 1.4, marginBottom: 28 }}>
            Cardiopatía Isquémica · Test de Esfuerzo · Criterios de Alto Riesgo · Prevención Secundaria
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <span style={{ background: "#0f2942", color: "#fff", padding: "6px 16px", borderRadius: 9999, fontSize: 13, fontWeight: 800 }}>
              CÓD: 1.01.1.001
            </span>
            <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "6px 16px", borderRadius: 9999, fontSize: 13, fontWeight: 800 }}>
              CÓD: 1.01.4.004 (PEG)
            </span>
            <span style={{ background: "#dcfce7", color: "#166534", padding: "6px 16px", borderRadius: 9999, fontSize: 13, fontWeight: 800 }}>
              EUNACOM 2026
            </span>
          </div>
        </div>
      </Slide>

      {/* SLIDE 2: MATRIZ DE COMPETENCIA LEGAL (PERFIL V3) */}
      <Slide
        nav="Matriz Perfil V3"
        notes="El código 1.01.1.001 clasifica la Angina Crónica Estable con Diagnóstico Específico, Tratamiento Inicial y Seguimiento Completo en APS."
      >
        <BnBSlide
          classNumber="CLASE 01"
          title="Matriz de Exigencia Legal Perfil V3"
          subtitle="Competencias obligatorias evaluadas en el EUNACOM"
          bullets={[
            {
              text: "Nivel de Diagnóstico: Específico",
              sub: ["El médico general en APS debe diagnosticarla autónomamente mediante clínica"]
            },
            {
              text: "Nivel de Tratamiento: Inicial y de Mantención",
              sub: ["Iniciar terapia antiisquémica y prevención secundaria completa"]
            },
            {
              text: "Nivel de Seguimiento: Completo en APS",
              sub: ["Control periódico en CESFAM; derivar solo si refractariedad o alto riesgo"]
            }
          ]}
          rightContent={
            <BnBMiniTable
              headers={["Código", "Situación Clínica", "Diagnóstico", "APS"]}
              rows={[
                ["1.01.1.001", "Angina Crónica Estable", "Específico", "✓ Completo"],
                ["1.01.4.004", "Test de Esfuerzo (PEG)", "Interpreta", "✓ Solicita"],
                ["1.01.4.008", "AngioTAC Coronario", "Interpreta", "✓ Riesgo medio"]
              ]}
            />
          }
          bottomCallout="💡 En APS: El médico general titula fármacos y evalúa criterios de alto riesgo isquémico."
        />
      </Slide>

      {/* SLIDE 3: STABLE ANGINA (DEFINITION) */}
      <Slide
        nav="Definición de Angina"
        notes="La angina es la manifestación clínica de la isquemia miocárdica transitoria generada por un desbalance entre la oferta y la demanda de oxígeno."
      >
        <BnBSlide
          classNumber="CLASE 01"
          title="Angina Crónica Estable"
          subtitle="Definición & Fisiopatología Básica"
          bullets={[
            {
              text: "Isquemia miocárdica transitoria",
              sub: ["Desbalance: Demanda de O₂ >> Oferta de O₂ coronario"]
            },
            {
              text: "Causa: Placa aterosclerótica fija",
              sub: [
                "Placa estable con capa fibrosa gruesa",
                "Sin ulceración ni trombo oclusivo agudo",
                "Obstrucción ≥ 70–75% del lumen arterial"
              ]
            },
            {
              text: "Síntomas gatillados por esfuerzo o estrés",
              sub: ["Alivio predecible con reposo o nitroglicerina"]
            }
          ]}
          rightContent={<VesselPlaqueGraphic occlusion="75%" label="Obstrucción Fija ≥ 70%" status="Flujo Insuficiente en Esfuerzo" />}
          bottomCallout="💡 En reposo el flujo coronario es normal; la isquemia aparece al aumentar el consumo de O2."
        />
      </Slide>

      {/* SLIDE 4: OXYGEN SUPPLY VS DEMAND */}
      <Slide
        nav="Oferta vs Demanda de O2"
        notes="El miocardio no puede aumentar la extracción de oxígeno porque en reposo ya extrae el 75-80%. Por tanto, el único mecanismo para suplir mayor demanda es aumentar el flujo coronario dilatando arterias y prolongando la diástole."
      >
        <BnBSlide
          classNumber="CLASE 01"
          title="Balance de Oxígeno Miocárdico"
          subtitle="Determinantes de la Isquemia"
          bullets={[
            {
              text: "Extracción basal de O₂ miocárdica: ~75–80%",
              sub: ["El corazón NO puede extraer más O₂ ante mayor trabajo"]
            },
            {
              text: "Para aumentar oferta de O₂:",
              sub: [
                "Vasodilatación coronaria",
                "Aumento del tiempo de diástole (FC más lenta)"
              ]
            },
            {
              text: "Factores que aumentan la Demanda de O₂:",
              sub: [
                "Frecuencia cardíaca (FC)",
                "Contractilidad miocárdica (inotropismo)",
                "Tensión de pared / Postcarga (Ley de Laplace)"
              ]
            }
          ]}
          rightContent={<OxygenBalanceGraphic supplyText="Oferta: Flujo Coronario" demandText="Demanda: FC + Tensión Pared" />}
          bottomCallout="💡 Principio terapéutico: Toda la medicación antiisquémica busca reducir la demanda de O2."
        />
      </Slide>

      {/* SLIDE 5: LOS 3 CRITERIOS DE DIAMOND-FORRESTER */}
      <Slide
        nav="Criterios Diamond-Forrester"
        notes="Para diagnosticar la angina y clasificarla en típica, atípica o dolor no cardíaco se emplean los 3 criterios de Diamond-Forrester."
      >
        <BnBSlide
          classNumber="CLASE 01"
          title="Criterios de Diamond-Forrester"
          subtitle="Clasificación clínica del dolor torácico"
          bullets={[
            {
              text: "1. Localización y Carácter:",
              sub: ["Opresión o pesadez retroesternal (irradiación a cuello, mandíbula, brazo izq.)"]
            },
            {
              text: "2. Gatillante Fisiológico:",
              sub: ["Desencadenado por esfuerzo físico o estrés emocional"]
            },
            {
              text: "3. Alivio Rápido:",
              sub: ["Cede en < 5–10 minutos con reposo o nitratos sublinguales"]
            }
          ]}
          rightContent={
            <BnBMiniTable
              headers={["Clasificación", "Criterios", "Probabilidad"]}
              rows={[
                ["Angina Típica", "3 de 3", "Alta (> 85%)"],
                ["Angina Atípica", "2 de 3", "Intermedia (15-85%)"],
                ["No Cardíaco", "0 o 1 de 3", "Baja (< 15%)"]
              ]}
            />
          }
          bottomCallout="💡 Angina Típica = Cumple los 3 criterios. Angina Atípica = Cumple 2 (frecuente en mujeres y ancianos)."
        />
      </Slide>

      {/* SLIDE 6: EQUIVALENTES ANGINOSOS & DIABÉTICOS */}
      <Slide
        nav="Equivalentes Anginosos"
        notes="En pacientes diabéticos, la neuropatía autonómica simpática puede enmascarar el dolor torácico, cursando con isquemia silente o presentándose como disnea aislada de esfuerzo."
      >
        <BnBSlide
          classNumber="CLASE 01"
          title="Presentaciones Especiales"
          subtitle="Isquemia silente & Equivalentes anginosos"
          bullets={[
            {
              text: "Pacientes Diabéticos:",
              sub: [
                "Neuropatía autonómica sensorial cardíaca",
                "Frecuente isquemia silente (sin dolor torácico)",
                "Sospechar ante disnea de esfuerzo o fatiga súbita"
              ]
            },
            {
              text: "Mujeres y Adultos Mayores:",
              sub: [
                "Presentación atípica frecuente (disnea, náuseas, dolor epigástrico)",
                "Menor prevalencia de angina opresiva clásica"
              ]
            },
            {
              text: "Dolor No Cardíaco (Osteocondritis / Tietze):",
              sub: [
                "Puntada de costado reproducible a la palpación costal",
                "Modifica con movimientos respiratorios"
              ]
            }
          ]}
          rightContent={
            <div style={{ background: "#fef3c7", border: "2px solid #d97706", borderRadius: 14, padding: "18px 20px", width: "100%", boxShadow: "3px 3px 0px #d97706" }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#92400e", textTransform: "uppercase", marginBottom: 6 }}>
                ⚠️ Regla EUNACOM en Diabetes
              </div>
              <div style={{ fontSize: 16, color: "#78350f", lineHeight: 1.45, fontWeight: 600 }}>
                Paciente diabético con disnea de esfuerzos de inicio reciente = <strong>Equivalente Anginoso</strong>. Indicar estudio isquémico prioritario.
              </div>
            </div>
          }
          bottomCallout="💡 La disnea de esfuerzos aislada en un paciente diabético debe estudiarse como cardiopatía isquémica."
        />
      </Slide>

      {/* SLIDE 7: ESCALA CANADIENSE CCS */}
      <Slide
        nav="Clasificación CCS"
        notes="La severidad funcional de la angina se gradúa según la Sociedad Cardiovascular Canadiense de clase I a IV."
      >
        <BnBSlide
          classNumber="CLASE 01"
          title="Clasificación Funcional Canadiense"
          subtitle="Canadian Cardiovascular Society (CCS I a IV)"
          bullets={[
            {
              text: "Clase I: Angina solo con esfuerzos extenuantes o prolongados",
              sub: ["La actividad física ordinaria (caminar, subir escaleras) no causa angina"]
            },
            {
              text: "Clase II: Ligera limitación de la actividad ordinaria",
              sub: ["Angina al caminar rápido, subir cuestas o subir más de 1 piso"]
            },
            {
              text: "Clase III: Marcada limitación de la actividad ordinaria",
              sub: ["Angina al caminar 1 a 2 cuadras en plano o subir 1 piso a paso normal"]
            },
            {
              text: "Clase IV: Incapacidad para cualquier actividad / Angina en reposo",
              sub: ["¡Alerta!: Angina en reposo o con mínimos esfuerzos = Síndrome Coronario Agudo"]
            }
          ]}
          rightContent={
            <BnBMiniTable
              headers={["Grado", "Actividad Desencadenante", "Severidad"]}
              rows={[
                ["CCS I", "Esfuerzos extenuantes", "Leve"],
                ["CCS II", "Caminar rápido / >1 piso", "Moderada"],
                ["CCS III", "Caminar 1-2 cuadras", "Marcada"],
                ["CCS IV", "Mínimo esfuerzo / Reposo", "Urgencia (SCA)"]
              ]}
            />
          }
          bottomCallout="💡 Cambio brusco a clase CCS III-IV en <2 meses = Angina Inestable (SCASEST)."
        />
      </Slide>

      {/* SLIDE 8: TEST DE ESFUERZO / ERGOMETRÍA */}
      <Slide
        nav="Test de Esfuerzo (PEG)"
        notes="El Test de Esfuerzo convencional con protocolo de Bruce es el estudio diagnóstico inicial de elección en APS cuando el ECG basal es normal y el paciente puede caminar."
      >
        <BnBSlide
          classNumber="CLASE 01"
          title="Test de Esfuerzo (Ergometría)"
          subtitle="Estudio diagnóstico no invasivo de 1ra línea en APS"
          bullets={[
            {
              text: "Indicación de 1ra Línea en APS:",
              sub: [
                "Paciente con capacidad motora para caminar",
                "ECG basal normal e interpretable"
              ]
            },
            {
              text: "Criterio de Positividad para Isquemia:",
              sub: [
                "Infradesnivel del ST ≥ 1.0 mm (0.1 mV)",
                "Morfología horizontal o descendente",
                "Medido a 80 ms del punto J"
              ]
            },
            {
              text: "Respuesta Normal:",
              sub: ["Infradesnivel ascendente rápido = Variante normal", "Aumento fisiológico de PAS con el ejercicio"]
            }
          ]}
          rightContent={<ECGDepressionGraphic />}
          bottomCallout="💡 Infradesnivel horizontal o descendente ≥ 1 mm = Positivo para Isquemia Miocárdica."
        />
      </Slide>

      {/* SLIDE 9: CRITERIOS DE ALTO RIESGO EN TEST DE ESFUERZO */}
      <Slide
        nav="Criterios de Alto Riesgo"
        notes="Estos 4 hallazgos en el test de esfuerzo definen alto riesgo de mortalidad anual (>3%) e indican derivación inmediata a coronariografía invasiva."
      >
        <BnBSlide
          classNumber="CLASE 01"
          title="Criterios de Alto Riesgo en PEG"
          subtitle="Banderas rojas que exigen Coronariografía Invasiva"
          bullets={[
            {
              text: "1. Infradesnivel Severo del ST:",
              sub: ["Depresión del ST ≥ 2.0 mm o presente en ≥ 5 derivaciones"]
            },
            {
              text: "2. Isquemia Precoz:",
              sub: ["Aparición en Estadio 1 de Bruce (FC < 120 lpm o < 5 METs)"]
            },
            {
              text: "3. Caída de la Presión Arterial Sistólica:",
              sub: ["Descenso de PAS durante el ejercicio = Falla de bomba por isquemia masiva"]
            },
            {
              text: "4. Arritmias Ventriculares:",
              sub: ["Taquicardia ventricular durante el esfuerzo o recuperación"]
            }
          ]}
          rightContent={
            <div style={{ background: "#fee2e2", border: "2.5px solid #dc2626", borderRadius: 16, padding: "20px", textAlign: "center", width: "100%" }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>🚨</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#991b1b", textTransform: "uppercase" }}>
                Conducta Obligatoria
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#7f1d1d", marginTop: 6, lineHeight: 1.4 }}>
                Derivación Inmediata a <strong>Coronariografía Invasiva</strong> (Sospecha de Tronco Común Izquierdo o 3 Vasos).
              </div>
            </div>
          }
          bottomCallout="💡 La caída de la presión arterial sistólica durante el test de esfuerzo es un signo de pésimo pronóstico."
        />
      </Slide>

      {/* SLIDE 10: ALTERNATIVAS CUANDO EL ECG NO ES INTERPRETABLE */}
      <Slide
        nav="Alternativas al PEG"
        notes="Si el ECG basal tiene alteraciones basales como Bloqueo Completo de Rama Izquierda, marcapasos o WPW, el PEG convencional no es interpretable y se debe solicitar Eco-Estrés o AngioTAC."
      >
        <BnBSlide
          classNumber="CLASE 01"
          title="Alternativas al Test de Esfuerzo"
          subtitle="¿Cuándo NO realizar Ergometría convencional?"
          bullets={[
            {
              text: "ECG Basal No Interpretable:",
              sub: [
                "Bloqueo Completo de Rama Izquierda (BCRI)",
                "Ritmo de Marcapasos ventricular",
                "Preexcitación (Síndrome de WPW)",
                "Depresión basal del ST > 1 mm por HVI o digital"
              ]
            },
            {
              text: "Estudios de Elección Alternativos:",
              sub: [
                "Eco-Estrés Farmacológico (Dobutamina o Dipiridamol)",
                "Resonancia Cardíaca de Estrés",
                "AngioTAC Coronario (en riesgo intermedio 15–50%, VPN >98%)"
              ]
            }
          ]}
          rightContent={
            <div style={{ background: "#eff6ff", border: "2px solid #3b82f6", borderRadius: 14, padding: "18px 20px", width: "100%" }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#1e40af", textTransform: "uppercase", marginBottom: 6 }}>
                🔍 AngioTAC Coronario
              </div>
              <div style={{ fontSize: 15, color: "#1e3a8a", lineHeight: 1.45 }}>
                • Excelente para <strong>descartar enfermedad coronaria</strong> en probabilidad media gracias a su <strong>VPN &gt; 98%</strong>.
              </div>
            </div>
          }
          bottomCallout="💡 En presencia de BCRI: El Test de Esfuerzo convencional está formalmente contraindicado."
        />
      </Slide>

      {/* SLIDE 11: PREVENCIÓN SECUNDARIA OBLIGATORIA */}
      <Slide
        nav="Prevención Secundaria"
        notes="Todo paciente con cardiopatía coronaria demostrada debe recibir terapia de prevención secundaria obligatoria para reducir infarto y mortalidad."
      >
        <BnBSlide
          classNumber="CLASE 01"
          title="Prevención Secundaria Obligatoria"
          subtitle="Fármacos que modifican la sobrevida en cardiopatía isquémica"
          bullets={[
            {
              text: "Aspirina (AAS) 100 mg/día a permanencia",
              sub: [
                "Inhibe irreversiblemente la COX-1 plaquetaria",
                "Clopidogrel 75 mg/día si alergia a la aspirina"
              ]
            },
            {
              text: "Estatina de Alta Potencia (Obligatoria)",
              sub: [
                "Atorvastatina 80 mg o Rosuvastatina 40 mg/día",
                "Estabilización de placa y efecto pleiotrópico",
                "Meta: c-LDL < 55 mg/dL Y reducción ≥ 50% del valor basal",
                "Se indica SIEMPRE, incluso con colesterol basal 'normal'"
              ]
            },
            {
              text: "IECA (Enalapril 10–20 mg/día):",
              sub: ["Si asocia HTA, Diabetes Mellitus, FEVI ≤ 40% o daño renal"]
            }
          ]}
          rightContent={
            <div style={{ background: "#f0fdf4", border: "2.5px solid #16a34a", borderRadius: 16, padding: "20px", textAlign: "center", width: "100%" }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#166534", textTransform: "uppercase" }}>Meta de c-LDL</div>
              <div style={{ fontSize: 44, fontWeight: 900, color: "#15803d", fontFamily: "monospace", margin: "8px 0" }}>&lt; 55</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#166534" }}>mg/dL en Prevención Secundaria</div>
            </div>
          }
          bottomCallout="💡 Las estatinas de alta potencia son obligatorias independientemente del nivel basal de colesterol."
        />
      </Slide>

      {/* SLIDE 12: TERAPIA ANTIISQUÉMICA (BETABLOQUEADORES) */}
      <Slide
        nav="Betabloqueadores"
        notes="Los betabloqueadores son el fármaco antiisquémico de primera elección porque disminuyen el consumo miocárdico de oxígeno al reducir la frecuencia cardíaca y la contractilidad."
      >
        <BnBSlide
          classNumber="CLASE 01"
          title="Betabloqueadores (1ra Línea)"
          subtitle="Tratamiento antiisquémico sintomático de elección"
          bullets={[
            {
              text: "Fármaco Antiisquémico de 1ra Elección:",
              sub: [
                "Bisoprolol 5–10 mg/día o Carvedilol 25 mg c/12h",
                "Mecanismo: Bloqueo Beta-1 ➔ ↓ FC y ↓ Contractilidad",
                "Prolonga la diástole ➔ Aumenta la perfusión coronaria"
              ]
            },
            {
              text: "Meta Terapéutica Obligatoria:",
              sub: ["Frecuencia Cardíaca en reposo entre 55 y 60 lpm"]
            },
            {
              text: "Contraindicaciones Principales:",
              sub: ["Asma severa, Bloqueo AV de 2do/3er grado o bradicardia <50 lpm"]
            }
          ]}
          rightContent={
            <div style={{ background: "#eff6ff", border: "2.5px solid #0284c7", borderRadius: 16, padding: "20px", textAlign: "center", width: "100%" }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#0369a1", textTransform: "uppercase" }}>Meta de Frecuencia Cardíaca</div>
              <div style={{ fontSize: 42, fontWeight: 900, color: "#0284c7", fontFamily: "monospace", margin: "8px 0" }}>55 - 60</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0369a1" }}>lpm en Reposo</div>
            </div>
          }
          bottomCallout="💡 Si el paciente persiste sintomático con FC >60 lpm, titular primero la dosis del Betabloqueador."
        />
      </Slide>

      {/* SLIDE 13: CALCIOANTAGONISTAS & NITRATOS */}
      <Slide
        nav="Calcioantagonistas & Nitratos"
        notes="Revisemos el rol de los Calcioantagonistas y el uso de nitratos sublinguales como rescate sintomático."
      >
        <BnBSlide
          classNumber="CLASE 01"
          title="Calcioantagonistas & Nitratos"
          subtitle="Terapia combinada y rescate sintomático"
          bullets={[
            {
              text: "Calcioantagonistas Dihidropiridínicos (Amlodipino 5–10 mg/d):",
              sub: [
                "Vasodilatador arterial periférico y coronario",
                "Excelente para asociar a Betabloqueador si persiste angina"
              ]
            },
            {
              text: "Calcioantagonistas No-DHP (Verapamilo / Diltiazem):",
              sub: ["Alternativa de 1ra línea si existe contraindicación o intolerancia a BB"]
            },
            {
              text: "Nitroglicerina Sublingual 0.6 mg SOS:",
              sub: [
                "Venodilatación ➔ Disminuye la precarga y el retorno venoso",
                "Tomar sentado; repetir cada 5 min (máx 3 dosis). Si no cede ➔ Urgencias"
              ]
            }
          ]}
          rightContent={
            <div style={{ background: "#fee2e2", border: "2px solid #dc2626", borderRadius: 14, padding: "16px 18px", width: "100%" }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#991b1b", textTransform: "uppercase", marginBottom: 4 }}>
                🚫 Contraindicación Absoluta
              </div>
              <div style={{ fontSize: 15, color: "#7f1d1d", lineHeight: 1.4, fontWeight: 600 }}>
                NUNCA administrar nitratos si el paciente consumió <strong>Sildenafil (&lt;24h)</strong> o <strong>Tadalafil (&lt;48h)</strong> por riesgo de shock e hipotensión mortal.
              </div>
            </div>
          }
          bottomCallout="💡 ¡Peligro!: Nunca combinar Verapamilo con Betabloqueadores por riesgo de bradicardia severa y shock."
        />
      </Slide>

      {/* SLIDE 14: ANGINA VASOESPÁSTICA DE PRINZMETAL */}
      <Slide
        nav="Angina de Prinzmetal"
        notes="La angina de Prinzmetal se debe a vasoespasmo coronario transitorio en reposo, típica en pacientes jóvenes fumadores."
      >
        <BnBSlide
          classNumber="CLASE 01"
          title="Angina Vasoespástica (Prinzmetal)"
          subtitle="Vasoespasmo coronario en reposo"
          bullets={[
            {
              text: "Presentación Clínica:",
              sub: [
                "Dolor anginoso de reposo, típicamente en la noche / madrugada",
                "Pacientes jóvenes sin factores de riesgo clásicos excepto Tabaquismo"
              ]
            },
            {
              text: "Electrocardiograma Característico:",
              sub: [
                "Supradesnivel transitorio del ST DURANTE el episodio de dolor",
                "Normalización total del trazado tras ceder el espasmo con Nitratos"
              ]
            },
            {
              text: "Tratamiento de Elección:",
              sub: [
                "Calcioantagonistas (Amlodipino o Diltiazem) + Cese de Tabaco"
              ]
            }
          ]}
          rightContent={<ECGElevationGraphic />}
          bottomCallout="💡 Supradesnivel transitorio del ST que desaparece con Nitroglicerina = Angina de Prinzmetal."
        />
      </Slide>

      {/* SLIDE 15: PRINZMETAL — CONTRAINDICACIÓN DE BETABLOQUEO */}
      <Slide
        nav="Peligro de Betabloqueo"
        notes="Pregunta clásica de examen: En Angina de Prinzmetal los betabloqueadores están formalmente contraindicados porque dejan el tono alfa vasoconstrictor sin oposición."
      >
        <BnBSlide
          classNumber="CLASE 01"
          title="Prinzmetal: ¿Por qué NO Betabloqueo?"
          subtitle="Peligro farmacológico clásico del EUNACOM"
          bullets={[
            {
              text: "Mecanismo del Efecto Adverso:",
              sub: [
                "Las arterias coronarias tienen receptores vasodilatadores Beta-2 y vasoconstrictores Alfa-1",
                "Al bloquear los receptores Beta-2, el tono vasoconstrictor Alfa-1 queda libre sin oposición",
                "El vasoespasmo coronario EMPEORA severamente pudiendo precipitar un infarto transmural"
              ]
            },
            {
              text: "Fármaco Contraindicado: Betabloqueadores (Propranolol, Atenolol, etc.)",
              sub: []
            },
            {
              text: "Fármaco Indicado: Calcioantagonistas (Amlodipino, Diltiazem)",
              sub: []
            }
          ]}
          rightContent={
            <div style={{ background: "#fee2e2", border: "3px solid #dc2626", borderRadius: 16, padding: "22px", textAlign: "center", width: "100%" }}>
              <div style={{ fontSize: 32, marginBottom: 4 }}>🚫</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#991b1b", textTransform: "uppercase" }}>
                ¡PROHIBIDOS BETABLOQUEADORES!
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#7f1d1d", marginTop: 8, lineHeight: 1.4 }}>
                En Angina de Prinzmetal empeoran el vasoespasmo por vasoconstricción Alfa-1 refleja.
              </div>
            </div>
          }
          bottomCallout="💡 Regla de Examen: Prinzmetal = Calcioantagonistas SÍ, Betabloqueadores NUNCA."
        />
      </Slide>

      {/* SLIDE 16: LAS 4 TRAMPAS DEL EUNACOM */}
      <Slide
        nav="4 Trampas del EUNACOM"
        notes="Repasemos las 4 trampas clásicas del banco de preguntas en cardiopatía isquémica estable."
      >
        <BnBSlide
          classNumber="CLASE 01"
          title="Las 4 Trampas Críticas del EUNACOM"
          subtitle="Errores clásicos que debes evitar en el examen"
          bullets={[
            {
              text: "1. Estatina con Colesterol Normal:",
              sub: ["En cardiopatía coronaria la Atorvastatina 80 mg es obligatoria siempre (meta LDL <55 mg/dL)"]
            },
            {
              text: "2. BCRI en Test de Esfuerzo:",
              sub: ["El PEG convencional pierde validez; se debe solicitar Eco-Estrés o Resonancia"]
            },
            {
              text: "3. Betabloqueo en Prinzmetal:",
              sub: ["Empeora el vasoespasmo; el fármaco de elección son los Calcioantagonistas"]
            },
            {
              text: "4. Angina Inestable Disfrazada:",
              sub: ["Angina en reposo o con mínimos esfuerzos (CCS IV) es un SCA; requiere hospitalización"]
            }
          ]}
          rightContent={
            <BnBMiniTable
              headers={["Situación", "Error Común", "Conducta Correcta"]}
              rows={[
                ["Colesterol normal", "No dar estatina", "Atorvastatina 80 mg"],
                ["BCRI basal", "Pedir PEG", "Pedir Eco-Estrés"],
                ["Prinzmetal", "Dar Betabloqueo", "Dar Calcioantagonista"],
                ["Angina reposo", "Tratar como estable", "Hospitalizar por SCA"]
              ]}
            />
          }
          bottomCallout="💡 Revisa siempre el ECG basal antes de indicar un test de esfuerzo en APS."
        />
      </Slide>

      {/* SLIDE 17: CASO CLÍNICO EUNACOM #1 */}
      <Slide
        nav="Caso Clínico 1"
        notes="Analicemos este caso clínico de diagnóstico y conducta inicial en APS."
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
              text: "Dolor torácico no coronario; tranquilizar e indicar kinesioterapia.",
              explanation: "Incorrecto. Cumple los 3 criterios de Diamond-Forrester para Angina Típica.",
              isCorrect: false
            },
            {
              id: "B",
              text: "Angina Crónica Estable; indicar Test de Esfuerzo (Ergometría) e iniciar Aspirina 100 mg, Atorvastatina 80 mg y Bisoprolol.",
              explanation: "Correcto. Angina Típica CCS II con ECG normal. El Test de Esfuerzo es el estudio indicado en APS.",
              isCorrect: true
            },
            {
              id: "C",
              text: "SCACEST; derivar de urgencia para angioplastía primaria inmediata.",
              explanation: "Incorrecto. Cuadro crónico estable de 3 meses con ECG normal.",
              isCorrect: false
            },
            {
              id: "D",
              text: "Angina de Prinzmetal; iniciar Verapamilo y reposo absoluto.",
              explanation: "Incorrecto. Ocurre con esfuerzo predecible, no en reposo nocturno.",
              isCorrect: false
            }
          ]}
        />
      </Slide>

      {/* SLIDE 18: CASO CLÍNICO EUNACOM #2 */}
      <Slide
        nav="Caso Clínico 2"
        notes="Analicemos este caso de titulación y metas de frecuencia cardíaca."
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
              explanation: "Incorrecto. La DAPT no está indicada en angina estable crónica.",
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
              explanation: "Incorrecto. Primero se optimiza la terapia médica ambulatoria.",
              isCorrect: false
            }
          ]}
        />
      </Slide>

      {/* SLIDE 19: CASO CLÍNICO EUNACOM #3 */}
      <Slide
        nav="Caso Clínico 3"
        notes="Analicemos este caso de angina vasoespástica y contraindicación de fármacos."
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
              explanation: "Incorrecto. Los betabloqueadores están contraindicados en Prinzmetal.",
              isCorrect: false
            },
            {
              id: "B",
              text: "Tratamiento: Angioplastía coronaria; Contraindicado: Aspirina.",
              explanation: "Incorrecto. El mecanismo es vasoespasmo funcional sin trombo.",
              isCorrect: false
            },
            {
              id: "C",
              text: "Tratamiento: Amiodarona; Contraindicado: Calcioantagonistas.",
              explanation: "Incorrecto. Los calcioantagonistas son precisamente la primera línea.",
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

      {/* SLIDE 20: SUMMARY & HIGH YIELD TAKEAWAYS */}
      <Slide
        nav="Resumen High Yield"
        notes="Hemos completado la Masterclass de Angina Crónica Estable con el estándar Boards and Beyond. En la siguiente clase abordaremos el SCASEST (Cardio 02)."
      >
        <BnBSlide
          classNumber="CLASE 01"
          title="Resumen de Conceptos Clave"
          subtitle="Boards & Beyond Standard · EUNACOM 2026"
          bullets={[
            {
              text: "Diagnóstico: 3/3 Criterios de Diamond-Forrester (Opresión + Esfuerzo + Alivio <10m)",
              sub: []
            },
            {
              text: "Estudio: Test de Esfuerzo (PEG) si ECG basal normal. Eco-Estrés si BCRI",
              sub: []
            },
            {
              text: "Prevención Secundaria: Aspirina 100 mg + Atorvastatina 80 mg (meta LDL <55 mg/dL)",
              sub: []
            },
            {
              text: "Antiisquémico de 1ra Línea: Betabloqueadores (Meta FC reposo 55–60 lpm)",
              sub: []
            },
            {
              text: "Prinzmetal: Calcioantagonistas SÍ, Betabloqueadores PROHIBIDOS",
              sub: []
            }
          ]}
          rightContent={
            <div style={{ background: "#f0fdf4", border: "2px solid #16a34a", borderRadius: 16, padding: "20px", textAlign: "center", width: "100%" }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#166534", textTransform: "uppercase" }}>✓ Clase 01 Dominada</div>
              <div style={{ fontSize: 15, color: "#14532d", marginTop: 8, fontWeight: 600 }}>
                👉 Siguiente Clase: <strong>Cardio 02 — SCASEST: Angina Inestable e IAM sin SDST</strong>
              </div>
            </div>
          }
          bottomCallout="💡 Revisa el capítulo correspondiente en el Manual EUNACOM y practica las preguntas del banco."
        />
      </Slide>

    </Deck>
  );
}
