import React from "react";
import Deck from "../deck/Deck";
import { Slide } from "../deck/Slide";
import { Cover } from "../components/deck/Cover";
import { Steps } from "../components/deck/Steps";
import { Table } from "../components/deck/Table";
import { Contrast } from "../components/deck/Contrast";
import { Bento } from "../components/deck/Bento";
import { QuestionSlide } from "../components/deck/QuestionSlide";

export default function Gastro01Deck() {
  return (
    <Deck title="Gastro 01: Hemorragia Digestiva Alta y Baja" classId="gastro-01">
      {/* SLIDE 1: PORTADA */}
      <Slide nav="Portada & Códigos">
        <Cover
          kicker="CÓD: 1.06.2.007 + 1.06.1.030 + 1.06.4.007"
          badges={[
            { label: "EUNACOM 2026", bg: "#ffe4e6", color: "#e11d48", border: "#f43f5e" },
            { label: "Gastroenterología", bg: "#fef3c7", color: "#d97706", border: "#fcd34d" },
            { label: "Perfil V3 Oficial", bg: "#dcfce7", color: "#16a34a", border: "#4ade80" }
          ]}
          title="Hemorragia Digestiva Alta y Baja"
          subtitle="Estabilización Inicial · Terapia Farmacológica Precoz · Clasificación de Forrest · Ligadura Variceal · HDB & Algoritmo de Urgencias"
        />
      </Slide>

      {/* SLIDE 2: MATRIZ DE AUDITORÍA OFICIAL */}
      <Slide nav="Matriz Perfil V3">
        <Table
          title="Matriz de Auditoría Oficial: Hemorragia Digestiva"
          subtitle="Exigencia legal según Perfil de Conocimientos ASOFAMECh 2026."
          headers={["Código", "Situación Clínica / Examen (Nombre Oficial)", "Diagnóstico", "Tratamiento", "Seguimiento", "Estado"]}
          highlightCol={1}
          pearl="El manejo inicial de la hemorragia digestiva grave es una competencia crítica de urgencia exigida a todo médico en Chile."
          rows={[
            {
              highlight: true,
              cells: [
                "1.06.2.007",
                "Hemorragia digestiva alta y baja",
                "Sospecha",
                "Inicial",
                "Derivar",
                "✓ 100% Auditado"
              ]
            },
            {
              cells: [
                "1.06.1.030",
                "Úlcera péptica",
                "Específico",
                "Completo",
                "Completo APS",
                "✓ 100% Auditado"
              ]
            },
            {
              cells: [
                "1.06.4.007",
                "Endoscopía digestiva alta y baja",
                "Emplea informe",
                "-",
                "-",
                "✓ 100% Auditado"
              ]
            }
          ]}
        />
      </Slide>

      {/* SLIDE 3: ETIOLOGÍA & FISIOPATOLOGÍA */}
      <Slide nav="Etiologías & Definición">
        <Bento
          title="Fisiopatología & Diagnóstico Etiológico"
          subtitle="Diferenciación anatómica por el Ángulo de Treitz y causas más frecuentes."
          tiles={[
            {
              tag: "Causa #1 HDA (50%)",
              stat: "Úlcera Péptica",
              pillBg: "#e11d48",
              title: "Úlcera Gástrica y Duodenal",
              bullets: [
                "Infección por Helicobacter pylori (causa bacteriana #1)",
                "Consumo crónico de AINEs o Aspirina (inhibición COX-1 mucosal)",
                "Sangrado por erosión de vasos submucosos o arteria gastroduodenal"
              ]
            },
            {
              tag: "Causa #2 HDA (20-30%)",
              stat: "Várices Esofágicas",
              pillBg: "#d97706",
              title: "Hipertensión Portal",
              bullets: [
                "Rotura de várices esofágicas o gástricas en pacientes cirróticos",
                "Alta mortalidad aguda (15-20% por episodio)",
                "Requiere manejo vasoconstrictor esplácnico inmediato"
              ]
            },
            {
              tag: "Otras Causas HDA (20%)",
              stat: "Mallory-Weiss / Neoplasia",
              pillBg: "#0284c7",
              title: "Lesiones Mucosas",
              bullets: [
                "Síndrome de Mallory-Weiss (desgarro por vómitos a repetición)",
                "Gastropatía erosiva por estrés o tóxicos",
                "Cáncer gástrico ulcerado (anemia + baja de peso)"
              ]
            },
            {
              colSpan: 3,
              gridColumns: 2,
              tag: "Manifestaciones Clínicas Cardinales",
              pillBg: "#16a34a",
              title: "Signos Clínicos de Presentación en Urgencias",
              bullets: [
                "➔ Hematemesis: Vómito de sangre roja fresca o con coágulos (HDA activa)",
                "➔ Vómito en borra de café: Sangre digerida por ácido gástrico",
                "➔ Melena: Deposición negra, alquitranada y maloliente (sangrado alto)",
                "➔ Hematoquecia: Sangre roja rutilante por recto (HDB o HDA masiva)",
                "➔ Inestabilidad Hemodinámica: Hipotensión, taquicardia > 100 lpm y oliguria"
              ]
            }
          ]}
        />
      </Slide>

      {/* SLIDE 4: REANIMACIÓN HEMODINÁMICA */}
      <Slide nav="Reanimación Inicial">
        <Steps
          title="Algoritmo de Reanimación Hemodinámica de Urgencia"
          subtitle="La prioridad absoluta antes de cualquier examen endoscópico es la estabilización hemodinámica."
          items={[
            {
              tag: "Paso 1 · Accesos",
              badgeBg: "#e11d48",
              title: "Vía Aérea & 2 VVP Gruesas",
              desc: "Instalar 2 vías venosas periféricas gruesas (14G o 16G). Intubación traqueal precoz si hay hematemesis masiva o encefalopatía para prevenir aspiración."
            },
            {
              tag: "Paso 2 · Fluidos",
              badgeBg: "#0284c7",
              title: "Expansión con Cristaloides",
              desc: "Infusión de Suero Fisiológico o Ringer Lactato en bolos de 500-1000 mL guiada por PA, FC y diuresis horaria (> 0.5 mL/kg/h)."
            },
            {
              tag: "Paso 3 · Transfusión",
              badgeBg: "#16a34a",
              title: "Estrategia Transfusional Restrictiva",
              desc: "Transfundir Glóbulos Rojos si Hemoglobina < 7 g/dL (meta 7-8 g/dL). En pacientes con cardiopatía coronaria activa o shock refractario, la meta es Hb 8-9 g/dL."
            },
            {
              tag: "Paso 4 · Coagulopatía",
              badgeBg: "#f59e0b",
              title: "Corrección de Coagulopatía",
              desc: "Plasma Fresco Congelado si INR > 1.5 en hemorragia activa o Plaquetas si recuento < 50.000/mm³. Revertir anticoagulantes orales si corresponde."
            }
          ]}
        />
      </Slide>

      {/* SLIDE 5: FARMACOTERAPIA PRE-ENDOSCÓPICA */}
      <Slide nav="Farmacoterapia Pre-EDA">
        <Contrast
          title="Farmacoterapia Pre-Endoscópica Obligatoria"
          leftTitle="HDA No Variceal (Úlcera Péptica)"
          leftItems={[
            "Inhibidor de Bomba de Protones (IBP) EV:",
            "➔ Omeprazol o Esomeprazol 80 mg en bolo EV directo.",
            "➔ Seguido de infusión continua 8 mg/hora por 72 horas.",
            "➔ Objetivo: Mantener pH intragástrico > 6 para favorecer estabilidad del coágulo.",
            "➔ Suspender fármacos gastrolesivos (AINEs, anticoagulantes)."
          ]}
          rightTitle="HDA Variceal (Paciente Cirrótico / Hipertensión Portal)"
          rightItems={[
            "Vasoconstrictores Esplácnicos Precoces:",
            "➔ Terlipresina 2 mg EV cada 4 horas (reduce presión portal y mortalidad).",
            "➔ Alternativa: Octreótide 50 mcg bolo EV + 50 mcg/h en infusión.",
            "Profilaxis Antibiótica Obligatoria:",
            "➔ Ceftriaxona 1g EV cada 24 horas por 7 días.",
            "➔ Reduce infecciones bacterianas, PBE, resangrado y mortalidad.",
            "Procinéticos: Eritromicina 250 mg EV 30 min antes de la EDA."
          ]}
        />
      </Slide>

      {/* SLIDE 6: CLASIFICACIÓN DE FORREST */}
      <Slide nav="Clasificación de Forrest">
        <Table
          title="Clasificación de Forrest para Úlcera Péptica Sangrante"
          subtitle="Determina el riesgo de resangrado y la indicación obligatoria de terapia endoscópica."
          headers={["Clase Forrest", "Hallazgo Endoscópico", "Riesgo de Resangrado", "Conducta Terapéutica", "Manejo Posterior"]}
          highlightCol={0}
          pearl="Las úlceras Forrest Ia, Ib y IIa requieren OBLIGATORIAMENTE Terapia Endoscópica Dual (Inyección de Adrenalina + Clip hemostático o Termocoagulación)."
          rows={[
            {
              highlight: true,
              cells: [
                "Forrest Ia",
                "Sangrado arterial en chorro (Jet)",
                "90% (Crítico)",
                [
                  "Terapia Endoscópica Dual Obligatoria:",
                  "Adrenalina 1:10.000 + Hemoclip / Termocoagulación"
                ],
                "IBP EV infusión continua 72h + UCI"
              ]
            },
            {
              highlight: true,
              cells: [
                "Forrest Ib",
                "Sangrado activo en babeo (Oozing)",
                "50 - 60% (Alto)",
                [
                  "Terapia Endoscópica Dual Obligatoria:",
                  "Adrenalina + Hemoclip / Termocoagulación"
                ],
                "IBP EV infusión continua 72h + Hospitalizar"
              ]
            },
            {
              highlight: true,
              cells: [
                "Forrest IIa",
                "Vaso visible no sangrante",
                "40 - 50% (Alto)",
                [
                  "Terapia Endoscópica Dual Obligatoria:",
                  "Adrenalina + Hemoclip / Coagulación"
                ],
                "IBP EV infusión continua 72h + Hospitalizar"
              ]
            },
            {
              cells: [
                "Forrest IIb",
                "Coágulo adherido",
                "20 - 30% (Intermedio)",
                [
                  "Remoción controlada del coágulo:",
                  "Si hay vaso subyacente ➔ Terapia dual"
                ],
                "IBP EV a dosis altas + Observación"
              ]
            },
            {
              cells: [
                "Forrest IIc",
                "Mancha de hematina oscura",
                "5 - 10% (Bajo)",
                "Sin terapia endoscópica",
                "IBP oral + Traslado a sala básica"
              ]
            },
            {
              cells: [
                "Forrest III",
                "Base de fibrina limpia",
                "< 3% (Mínimo)",
                "Sin terapia endoscópica",
                "IBP oral + Alta precoz / Ambulatorio"
              ]
            }
          ]}
        />
      </Slide>

      {/* SLIDE 7: HDA VARICEAL & LIGADURA */}
      <Slide nav="HDA Variceal & Balón">
        <Steps
          title="Protocolo de Manejo de la HDA Variceal en Cirróticos"
          subtitle="Secuencia terapéutica especializada en el paciente con hipertensión portal."
          items={[
            {
              tag: "Paso 1 · Médico",
              badgeBg: "#e11d48",
              title: "Terlipresina + Ceftriaxona",
              desc: "Iniciar inmediatamente antes de la endoscopía. La Terlipresina disminuye el flujo portal y la Ceftriaxona previene translocación bacteriana y sepsis."
            },
            {
              tag: "Paso 2 · Endoscopía",
              badgeBg: "#0284c7",
              title: "Ligadura Elástica con Bandas",
              desc: "Tratamiento endoscópico de elección dentro de las primeras 12 horas. Si son várices gástricas fúndicas (GOV2/IGV1), el tratamiento de elección es la inyección de Cianoacrilato."
            },
            {
              tag: "Paso 3 · Rescate",
              badgeBg: "#f59e0b",
              title: "Balón de Sengstaken-Blakemore",
              desc: "Medida de rescate transitoria en hemorragia masiva exanguinante refractaria. Mantener inflado máximo 24 horas como puente a terapia definitiva."
            },
            {
              tag: "Paso 4 · Avanzado",
              badgeBg: "#16a34a",
              title: "TIPS & Prevención Secundaria",
              desc: "Shunt Portosistémico Intrahepático Transyugular (TIPS) si fracasa la endoscopía. Prevención secundaria obligatoria con Betabloqueadores no selectivos (Propranolol / Carvedilol) + sesiones de ligadura."
            }
          ]}
        />
      </Slide>

      {/* SLIDE 8: HEMORRAGIA DIGESTIVA BAJA */}
      <Slide nav="Hemorragia Baja (HDB)">
        <Table
          title="Hemorragia Digestiva Baja (HDB): Diagnóstico Diferencial"
          subtitle="Sangrado digestivo originado distal al ángulo de Treitz (colon, recto y ano)."
          headers={["Etiología", "Frecuencia", "Características Clínicas", "Diagnóstico de Elección", "Manejo EUNACOM"]}
          highlightCol={0}
          pearl="En todo paciente con Hematoquecia masiva e inestabilidad hemodinámica, debe descartarse primero una HDA cataclísmica mediante EDA urgente."
          rows={[
            {
              highlight: true,
              cells: [
                "Enfermedad Diverticular",
                "30 - 40% (Causa #1)",
                [
                  "Rectorragia súbita indolora masiva",
                  "Típicamente en adultos mayores",
                  "Cede espontáneamente en el 80%"
                ],
                "Colonoscopía / AngioTAC si masiva",
                "Reanimación + Colonoscopía precoz; embolización si no cede"
              ]
            },
            {
              cells: [
                "Angiodisplasia (Ectasia)",
                "15 - 20%",
                [
                  "Sangrado recurrente autolimitado",
                  "Común en ciego y colon derecho",
                  "Asociada a Estenosis Aórtica (S. de Heyde)"
                ],
                "Colonoscopía (lesiones en cereza)",
                "Fulgoración endoscópica con Argón Plasma"
              ]
            },
            {
              cells: [
                "Cáncer Colorrectal & Pólipos",
                "10 - 15%",
                [
                  "Sangrado crónico oculto / anemia",
                  "Alteración del hábito intestinal",
                  "Baja de peso y masa palpable"
                ],
                "Colonoscopía con biopsia",
                "Estadificación con TAC + Resección quirúrgica"
              ]
            },
            {
              cells: [
                "Colitis Isquémica",
                "5 - 10%",
                [
                  "Dolor abdominal cólico en FII",
                  "Seguido de diarrea sanguinolenta",
                  "Adulto mayor con vasculopatía"
                ],
                "Colonoscopía (mucosa pálida/ulcerada)",
                "Reposo intestinal + Hidratación + Antibióticos"
              ]
            },
            {
              cells: [
                "Patología Anorrectal",
                "10%",
                [
                  "Sangrado rojo brillante al limpiarse",
                  "Goteo en la taza del inodoro",
                  "Dolor anal intenso si es fisura"
                ],
                "Inspección anal + Tacto rectal + Anoscopía",
                "Manejo dietético, fibra, baños de asiento; cirugía"
              ]
            }
          ]}
        />
      </Slide>

      {/* SLIDE 9: ESTRATIFICACIÓN PRONÓSTICA */}
      <Slide nav="Escalas Pronósticas">
        <Contrast
          title="Escalas de Estratificación Pronóstica en HDA"
          leftTitle="Escala de Glasgow-Blatchford (Pre-Endoscópica)"
          leftItems={[
            "➔ Se calcula ANTES de realizar la endoscopía digestiva alta.",
            "Variables evaluadas:",
            "● Urea en sangre / Nitrógeno ureico elevado.",
            "● Nivel de Hemoglobina basal.",
            "● Presión Arterial Sistólica y Frecuencia Cardíaca.",
            "● Presencia de síncope, melena, hepatopatía o insuficiencia cardíaca.",
            "UTILIDAD CRÍTICA EUNACOM:",
            "★ Score = 0: Paciente de Muy Bajo Riesgo. Puede manejarse de forma AMBULATORIA de forma segura sin hospitalización urgente."
          ]}
          rightTitle="Escala de Rockall (Post-Endoscópica)"
          rightItems={[
            "➔ Se calcula DESPUÉS de realizar la endoscopía digestiva alta.",
            "Variables evaluadas:",
            "● Edad del paciente (< 60, 60-79, ≥ 80 años).",
            "● Shock hemodinámico (PA y FC).",
            "● Comorbilidades mayores (cardíaca, renal, hepática).",
            "● Diagnóstico endoscópico específico.",
            "● Estigmas de hemorragia reciente (Clasificación de Forrest).",
            "UTILIDAD CRÍTICA EUNACOM:",
            "★ Evalúa el riesgo de resangrado y predice con alta precisión la mortalidad intrahospitalaria."
          ]}
        />
      </Slide>

      {/* SLIDE 10: TRAMPAS EUNACOM & RED FLAGS */}
      <Slide nav="Trampas de Examen">
        <Bento
          title="Trampas Clásicas & Distractores del Banco de Preguntas"
          subtitle="Conceptos de alta rentabilidad que definen preguntas en el EUNACOM."
          tiles={[
            {
              tag: "Trampa de Transfusión",
              stat: "Hb 7 - 8 g/dL",
              pillBg: "#e11d48",
              title: "Transfusión Excesiva",
              bullets: [
                "¡ERROR!: Transfundir hasta Hb > 10 g/dL en cirróticos.",
                "El exceso de volumen aumenta la presión portal y provoca resangrado variceal masivo.",
                "Meta estándar: Hb 7 a 8 g/dL (estrategia restrictiva)."
              ]
            },
            {
              tag: "Trampa Antibiótica",
              stat: "Ceftriaxona EV",
              pillBg: "#0284c7",
              title: "Profilaxis en Cirróticos",
              bullets: [
                "¡PREGUNTA SEGURA!: En todo cirrótico con HDA, indicar Ceftriaxona 1g/día EV precoz.",
                "La profilaxis antibiótica reduce la sobreinfección, la PBE y la mortalidad en un 50%."
              ]
            },
            {
              tag: "Trampa de la Sonda",
              stat: "Sonda Nasogástrica",
              pillBg: "#d97706",
              title: "SNG no es Obligatoria",
              bullets: [
                "El lavado gástrico con SNG no mejora la sobrevida ni cambia el pronóstico.",
                "Una SNG negativa NO descarta hemorragia digestiva si el sangrado es duodenal."
              ]
            },
            {
              colSpan: 3,
              gridColumns: 2,
              tag: "Resumen de Conductas Correctas de Examen",
              pillBg: "#16a34a",
              title: "Conductas Inmediatas ante Casos Clínicos",
              bullets: [
                "➔ Paciente inestable con hematemesis ➔ 2 VVP gruesas + Cristaloides + EDA urgente.",
                "➔ Úlcera Forrest Ia, Ib, IIa ➔ Inyección de Adrenalina + Hemoclip + IBP EV continuo 72h.",
                "➔ HDA en paciente cirrótico ➔ Terlipresina EV + Ceftriaxona EV + Ligadura con bandas.",
                "➔ HDB masiva con shock que no cede ➔ AngioTAC de abdomen y pelvis + Embolización."
              ]
            }
          ]}
        />
      </Slide>

      {/* SLIDE 11: CASO CLÍNICO 1 */}
      <Slide nav="Caso Clínico 1">
        <QuestionSlide
          number={1}
          caseText="Hombre de 54 años con antecedente de cirrosis hepática por alcohol consulta en Urgencias por vómitos con sangre roja fresca en tres oportunidades y deposiciones negras alquitranadas. Al examen: PA 90/55 mmHg, FC 112 lpm, estigmas de hepatopatía crónica y ascitis moderada. Se instalan 2 vías venosas periféricas y se inicia infusión con cristaloides."
          question="¿Cuál es el esquema farmacológico inicial más apropiado mientras se coordina la endoscopía digestiva alta de urgencia?"
          options={[
            { text: "Omeprazol 40 mg oral cada 12 horas + Propranolol 40 mg oral.", isCorrect: false },
            { text: "Terlipresina EV en bolo + Ceftriaxona 1g EV + Omeprazol 80 mg en bolo EV.", isCorrect: true },
            { text: "Acenocumarol oral para corregir la coagulopatía + Furosemida EV.", isCorrect: false },
            { text: "Ciprofloxacino oral exclusivo y esperar 24 horas antes de indicar fármacos endovenosos.", isCorrect: false }
          ]}
          explanation="En la sospecha de HDA variceal en un paciente cirrótico, la farmacoterapia inmediata obligatoria consiste en un vasoconstrictor esplácnico (Terlipresina EV) para reducir la presión portal, profilaxis antibiótica con Ceftriaxona 1g EV (disminuye mortalidad y PBE) y un IBP EV a dosis altas."
        />
      </Slide>

      {/* SLIDE 12: CASO CLÍNICO 2 */}
      <Slide nav="Caso Clínico 2">
        <QuestionSlide
          number={2}
          caseText="Mujer de 68 años con artrosis severa en tratamiento con Ketoprofeno 200 mg/día durante los últimos 2 meses consulta por melena y astenia progresiva. La EDA revela una úlcera de 15 mm en cara anterior de bulbo duodenal con un vaso visible no sangrante en su lecho (Clasificación de Forrest IIa)."
          question="¿Cuál es la conducta endoscópica y farmacológica de elección según las guías clínicas?"
          options={[
            { text: "No realizar terapia endoscópica y dar de alta con antiácidos orales.", isCorrect: false },
            { text: "Inyección exclusiva de Adrenalina sin aplicar un segundo método hemostático.", isCorrect: false },
            { text: "Terapia endoscópica dual (Inyección de Adrenalina + Hemoclip o Termocoagulación) + Omeprazol EV en infusión continua por 72 horas.", isCorrect: true },
            { text: "Derivación inmediata a gastrectomía subtotal de urgencia sin intentar manejo endoscópico.", isCorrect: false }
          ]}
          explanation="Las úlceras Forrest IIa (vaso visible no sangrante) tienen un alto riesgo de resangrado (40-50%) y requieren obligatoriamente Terapia Endoscópica Dual (Adrenalina combinada con termocoagulación o clips) más infusión continua de IBP EV (80 mg bolo + 8 mg/h) por 72 horas."
        />
      </Slide>

      {/* SLIDE 13: CASO CLÍNICO 3 */}
      <Slide nav="Caso Clínico 3">
        <QuestionSlide
          number={3}
          caseText="Hombre de 76 años hipertenso ingresa al Servicio de Urgencias por rectorragia masiva indolora con compromiso hemodinámico (PA 80/50 mmHg, FC 125 lpm). Se inicia reanimación con cristaloides y transfusión de hemoderivados. Se realiza EDA urgente que resulta completamente normal y sin contenido hemático en estómago ni duodeno."
          question="Si el sangrado activo persiste de forma abundante impidiendo la preparación del colon para una colonoscopía, ¿cuál es el examen diagnóstico y terapéutico de elección?"
          options={[
            { text: "Radiografía simple de abdomen de pie.", isCorrect: false },
            { text: "AngioTAC de Abdomen y Pelvis (o Angiografía invasiva con embolización supraselectiva).", isCorrect: true },
            { text: "Tránsito esófago-estómago-duodeno con bario.", isCorrect: false },
            { text: "Test de Sangre Oculta en Deposiciones (FIT).", isCorrect: false }
          ]}
          explanation="En la Hemorragia Digestiva Baja masiva exanguinante con inestabilidad hemodinámica donde la EDA descartó causa alta y la colonoscopía no es factible por el flujo hemático masivo, el AngioTAC de abdomen y pelvis permite localizar el vaso sangrante activo (sensibilidad para flujos > 0.3 mL/min) y guiar la embolización percutánea por radiología intervencional."
        />
      </Slide>

      {/* SLIDE 14: ALGORITMO FINAL */}
      <Slide nav="Algoritmo Resumido">
        <Steps
          title="Algoritmo Resumido de Hemorragia Digestiva EUNACOM"
          subtitle="Esquema mental rápido de decisión clínica."
          items={[
            {
              tag: "1 · Reanimar",
              badgeBg: "#e11d48",
              title: "VVP + Cristaloides + Hb 7-8",
              desc: "Estabilizar signos vitales antes de cualquier traslado o procedimiento invasivo."
            },
            {
              tag: "2 · Farmacoterapia",
              badgeBg: "#0284c7",
              title: "IBP EV + Terlipresina + Ceftriaxona",
              desc: "Administrar precozmente según sospecha clínica (úlcera vs cirrosis)."
            },
            {
              tag: "3 · Endoscopía",
              badgeBg: "#16a34a",
              title: "EDA en < 24h (< 12h si variceal)",
              desc: "Estratificar por Forrest (terapia dual en Ia, Ib, IIa) o Ligadura con bandas en várices."
            },
            {
              tag: "4 · HDB Masiva",
              badgeBg: "#f59e0b",
              title: "Colonoscopía vs AngioTAC",
              desc: "Colonoscopía si paciente estable; AngioTAC con embolización si sangrado masivo refractario."
            }
          ]}
        />
      </Slide>
    </Deck>
  );
}
