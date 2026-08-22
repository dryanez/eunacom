import React from "react";
import Deck from "../deck/Deck";
import { Slide } from "../deck/Slide";
import { Cover } from "../components/deck/Cover";
import { Steps } from "../components/deck/Steps";
import { Table } from "../components/deck/Table";
import { Contrast } from "../components/deck/Contrast";
import { Bento } from "../components/deck/Bento";
import { QuestionSlide } from "../components/deck/QuestionSlide";

export default function Cardio01Deck() {
  return (
    <Deck title="Cardio 01: Insuficiencia Cardíaca (Masterclass)" classId="cardio-01">
      {/* SLIDE 1: COVER */}
      <Slide
        nav="Portada & Codigos"
        notes="Bienvenidos a la Masterclass completa de Insuficiencia Cardiaca para el EUNACOM 2026. Cubriremos los codigos 1.01.1.018 y 1.01.2.005 con profundidad y rigor clinico."
      >
        <Cover
          kicker="COD: 1.01.1.018 + 1.01.2.005"
          badges={[
            { label: "EUNACOM 2026", bg: "#ffe4e6", color: "#e11d48", border: "#f43f5e" },
            { label: "Medicina Interna", bg: "#e0f2fe", color: "#0284c7", border: "#38bdf8" },
            { label: "Perfil V3 Oficial", bg: "#dcfce7", color: "#16a34a", border: "#4ade80" }
          ]}
          title={<span>Insuficiencia <span style={{ color: "#e11d48", fontStyle: "italic" }}>Cardiaca</span></span>}
          subtitle="Diagnostico Clinico de Framingham · Ecocardiograma FEVI · Los 4 Pilares de Sobrevida · Perfiles Hemodinamicos de Forrester"
        />
      </Slide>

      {/* SLIDE 2: MATRIZ DE AUDITORIA OFICIAL */}
      <Slide
        nav="Matriz Perfil V3"
        notes="Esta es la matriz de exigencia legal de ASOFAMECh. Para IC cronica se exige diagnostico especifico y seguimiento completo en APS."
      >
        <Table
          title="Matriz de Codigos Oficiales Perfil V3"
          subtitle="Exigencia legal obligatoria evaluada en el Examen Unico Nacional de Medicina."
          headers={["Codigo", "Situacion Clinica / Examen", "Diagnostico", "Tratamiento", "Seguimiento", "Estado"]}
          highlightCol={1}
          pearl="El nivel Especifico exige realizar el diagnostico autonomamente. El nivel Completo exige control en APS."
          rows={[
            { highlight: true, cells: ["1.01.1.018", "Insuficiencia Cardiaca Cronica (IC-FEr / IC-FEp)", "Especifico", "Inicial", "Completo APS", "✓ 100% Cubierto"] },
            { highlight: true, cells: ["1.01.2.005", "Insuficiencia Cardiaca Aguda / Edema Pulmonar", "Especifico", "Inicial", "Derivar UCI", "✓ 100% Cubierto"] },
            { cells: ["1.01.4.006", "Ecocardiografia Transtoracica", "Emplea Informe", "Indica segun FEVI", "Especialista", "✓ 100% Cubierto"] },
            { cells: ["1.01.4.009", "Biomarcadores Peptidos (BNP / NT-proBNP)", "Interpreta y Emplea", "Triaje Urgencias", "VPN > 95%", "✓ 100% Cubierto"] }
          ]}
        />
      </Slide>

      {/* SLIDE 3: ETIOLOGIAS & CHAMPIT (SCANNABLE BULLETS & ARROWS) */}
      <Slide
        nav="Etiologias & CHAMPIT"
        notes="Cardiopatia isquemica es la causa numero 1 de IC-FEr. Para descompensaciones agudas en urgencias, recuerda siempre la mnemotecnia CHAMPIT."
      >
        <Bento
          title="Etiologias Principales & Gatillantes Agudos"
          subtitle="Causas de base y factores de descompensacion en el Servicio de Urgencias."
          tiles={[
            {
              tag: "Causa #1 IC-FEr",
              stat: "50-60%",
              pillBg: "#e11d48",
              title: "Cardiopatia Isquemica",
              bullets: [
                "Infartos previos (IAM) ➔ Necrosis y perdida de miocitos",
                "Remodelado ventricular ➔ Miocardiopatia dilatada",
                "Causa principal de FEVI Reducida (FEVI <= 40%)"
              ]
            },
            {
              tag: "Causa #1 IC-FEp",
              stat: "20-30%",
              pillBg: "#0284c7",
              title: "Cardiopatia Hipertensiva",
              bullets: [
                "HTA de larga data ➔ Hipertrofia concentrica VI",
                "Rigidez miocardica ➔ Aumento de presiones de llenado",
                "Causa principal de FEVI Preservada (FEVI >= 50%)"
              ]
            },
            {
              tag: "Otras Causas EUNACOM",
              stat: "10-20%",
              pillBg: "#16a34a",
              title: "Valvular & Chagas",
              bullets: [
                "Estenosis Aortica ➔ Sobrecarga de presion en ancianos",
                "Miocardiopatia Alcoholica ➔ Reversible con abstinencia",
                "Chagas Cronico (IV Region) ➔ BCRD + HBPI + Aneurisma"
              ]
            },
            {
              colSpan: 3,
              gridColumns: 2,
              tag: "Gatillantes de Urgencia · Regla CHAMPIT",
              pillBg: "#f59e0b",
              pillColor: "#000",
              bulletBg: "rgba(245, 158, 11, 0.08)",
              title: "Factores de Descompensacion Aguda en Urgencias",
              bullets: [
                "[C] Coronario ➔ Isquemia miocardica aguda o infarto silente",
                "[H] Hipertension ➔ Crisis hipertensiva con aumento brusco de poscarga",
                "[A] Arritmias ➔ Fibrilacion Auricular con respuesta ventricular rapida",
                "[M] Mecanicas ➔ Rotura de cuerda tendinosa o disfuncion de musculo papilar",
                "[P] Pulmonar ➔ Tromboembolismo pulmonar (TEP) o Neumonia",
                "[I] Infeccion ➔ Cuadro infeccioso sistemico o ITU en adulto mayor",
                "[T] Toxicos / Farmacos ➔ AINEs (Retencion severa de sodio y agua)"
              ]
            }
          ]}
        />
      </Slide>

      {/* SLIDE 4: CRITERIOS DE FRAMINGHAM (CLEAN VERTICAL BULLETS) */}
      <Slide
        nav="Criterios de Framingham"
        notes="Para diagnostico se requieren 2 Mayores o 1 Mayor + 2 Menores. El R3 galope es el signo mas especifico."
      >
        <Table
          title="Criterios Diagnosticos de Framingham"
          subtitle="Regla de oro: Diagnostico clinico con 2 Criterios Mayores O 1 Mayor + 2 Menores."
          headers={["Tipo de Criterio", "Signos y Sintomas Clinicos", "Especificidad / Perla EUNACOM"]}
          pearl="El Galope por R3 y la Ingurgitacion Yugular a 45° son los mejores signos para diferenciar disnea cardiaca de respiratoria."
          rows={[
            {
              highlight: true,
              cells: [
                "Criterios Mayores",
                [
                  "Disnea Paroxistica Nocturna u Ortopnea (>= 2 almohadas)",
                  "Ingurgitacion Yugular a 45° y Reflujo Hepatoyugular (+)",
                  "Crepitaciones bibasales en auscultacion pulmonar",
                  "Galope por Tercer Ruido (R3) ➔ SIGNO MAS ESPECIFICO",
                  "Cardiomegalia en Rx de torax (Indice Cardiotoracico > 0.50)",
                  "Edema Agudo de Pulmon (EAP)"
                ],
                "Alta Especificidad (R3 galope es el signo fisico mas especifico de sobrecarga de volumen)"
              ]
            },
            {
              cells: [
                "Criterios Menores",
                [
                  "Edema maleolar bilateral vespertino (blando)",
                  "Tos nocturna irritativa y disnea de esfuerzo habitual",
                  "Hepatomegalia congestiva dolorosa",
                  "Derrame pleural (usualmente derecho o bilateral)",
                  "Taquicardia en reposo (> 100 lpm)"
                ],
                "Menor Especificidad (requieren combinarse con al menos 1 criterio mayor)"
              ]
            }
          ]}
        />
      </Slide>

      {/* SLIDE 5: ECOCARDIOGRAMA & FEVI */}
      <Slide
        nav="Ecocardiograma & FEVI"
        notes="El ecocardiograma define si es IC-FEr, IC-FElr o IC-FEp. Los iSGLT2 han demostrado beneficio en todas las categorias."
      >
        <Table
          title="Ecocardiograma Transtoracico: Clasificacion FEVI"
          subtitle="El reporte ecocardiografico determina la indicacion de farmacos con beneficio en mortalidad."
          headers={["Categoria FEVI", "Rango FEVI", "Hallazgos Ecocardiograficos", "Tratamiento con Sobrevida"]}
          rows={[
            {
              highlight: true,
              cells: [
                "1. IC con FEVI Reducida (IC-FEr)",
                "FEVI <= 40%",
                [
                  "Disfuncion sistolica pura",
                  "Dilatacion ventricular izquierda",
                  "Acinesia segmentaria post-IAM"
                ],
                [
                  "Los 4 Pilares Obligatorios:",
                  "ARNI + Betabloqueador + ARM + iSGLT2"
                ]
              ]
            },
            {
              cells: [
                "2. IC con FEVI Levemente Reducida",
                "FEVI 41 - 49%",
                [
                  "Disfuncion sistolica moderada",
                  "Aumento leve de presiones de llenado"
                ],
                "iSGLT2 de primera linea + modulacion SRAA"
              ]
            },
            {
              cells: [
                "3. IC con FEVI Preservada (IC-FEp)",
                "FEVI >= 50%",
                [
                  "Disfuncion diastolica",
                  "Hipertrofia concentrica VI (E/e > 14)",
                  "Dilatacion de auricula izquierda"
                ],
                "iSGLT2 (Dapagliflozina) + Diureticos de asa para sintomas"
              ]
            }
          ]}
          pearl="Biomarcadores BNP: NT-proBNP < 300 pg/mL o BNP < 100 pg/mL descartan causa cardiaca con Valor Predictivo Negativo > 95%."
        />
      </Slide>

      {/* SLIDE 6: LOS 4 PILARES DE SOBREVIDA */}
      <Slide
        nav="Los 4 Pilares de Sobrevida"
        notes="Terapia cuadruple fundamental en FEVI reducida. Revisa siempre la regla de 36h de lavado al cambiar de Enalapril a Sacubitril/Valsartan."
      >
        <Steps
          title="Los 4 Pilares de Sobrevida en IC-FEr (FEVI <= 40%)"
          subtitle="Terapia cuadruple obligatoria para reducir hospitalizaciones y mortalidad cardiovascular."
          items={[
            { tag: "Pilar 1 · SRAA", badgeBg: "#e11d48", title: "ARNI / IECA", desc: "Sacubitril/Valsartan de 1ra linea. Si se cambia de Enalapril a ARNI: esperar 36 horas de lavado para evitar angioedema." },
            { tag: "Pilar 2 · Simpatico", badgeBg: "#0284c7", title: "Betabloqueadores", desc: "Solo 3 validados: Carvedilol, Bisoprolol y Metoprolol Succinato. Iniciar en paciente euvolemico. (Atenolol NO sirve)." },
            { tag: "Pilar 3 · Mineralocorticoide", badgeBg: "#16a34a", title: "Espironolactona", desc: "Dosis 25-50 mg/dia. Requisitos de inicio seguro: Creatinina < 2.5 mg/dL y Potasio K+ < 5.0 mEq/L." },
            { tag: "Pilar 4 · Metabolico", badgeBg: "#f59e0b", title: "iSGLT2 (Dapa/Empa)", desc: "Dapagliflozina 10 mg/dia. Obligatorio en pacientes diabeticos y NO diabeticos. Reduce muerte CV desde el 1er mes." }
          ]}
        />
      </Slide>

      {/* SLIDE 7: CONTRASTE: SOBREVIDA VS PROHIBIDOS */}
      <Slide
        nav="Sobrevida vs Prohibidos"
        notes="Pregunta trampa recurrente: Furosemida alivia congestion pero no reduce mortalidad. Los AINEs y Verapamilo estan contraindicados."
      >
        <Contrast
          title="Farmacos Prohibidos vs Manejo del Hierro"
          leftTitle="Farmacos Prohibidos / Trampas EUNACOM"
          leftItems={[
            "AINEs (Ibuprofeno, Ketorolaco, Diclofenaco): Retienen agua y sodio, provocan descompensacion aguda.",
            "Calcioantagonistas No Dihidropiridinicos (Verapamilo, Diltiazem): Inotropos negativos potentes, empeoran IC.",
            "Tiazolidinedionas (Pioglitazona): Retencion hidrica severa.",
            "Furosemida Oral: Es el diuretico sintomatico de eleccion, pero NO disminuye la mortalidad a largo plazo."
          ]}
          rightTitle="Manejo del Hierro & Analgesia Segura"
          rightItems={[
            "Deficit de Hierro: Ferritina < 100 ng/mL o 100-299 con Sat. Transferrina < 20%.",
            "Tratamiento: Hierro Carboximaltosa Endovenoso (el hierro oral no se absorbe por edema intestinal).",
            "Analgesia de Eleccion en IC: Paracetamol o Tramadol (evitar formalmente los AINEs).",
            "Digoxina: Indicada solo en FA concomitante o sintomas refractarios; no reduce mortalidad."
          ]}
        />
      </Slide>

      {/* SLIDE 8: DISPOSITIVOS DAI & TRC */}
      <Slide
        nav="Dispositivos DAI / TRC"
        notes="Criterios de derivacion a electrofisiologia: DAI para prevenir muerte subita si FEVI <= 35%, TRC si hay BCRI con QRS ancho."
      >
        <Bento
          title="Terapia con Dispositivos: DAI vs Resincronizador TRC"
          subtitle="Criterios formales de derivacion a especialista tras 3 meses de terapia medica optima."
          tiles={[
            {
              tag: "Prevencion Muerte Subita",
              pillBg: "#e11d48",
              title: "Desfibrilador Automatico (DAI)",
              bullets: [
                "FEVI <= 35% persistente tras >= 3 meses con 4 Pilares",
                "Clase funcional NYHA II o III",
                "Sobrevida estimada > 1 ano"
              ]
            },
            {
              tag: "Disincronia Ventricular",
              pillBg: "#0284c7",
              title: "Resincronizador Cardiaco (TRC)",
              bullets: [
                "FEVI <= 35% en ritmo sinusal",
                "Sintomaticos a pesar de terapia optima",
                "QRS ancho >= 130-150 ms con patron BCRI"
              ]
            },
            {
              colSpan: 3,
              gridColumns: 2,
              tag: "Algoritmo de Derivacion APS ➔ Especialista",
              pillBg: "#16a34a",
              bulletBg: "rgba(22, 163, 74, 0.08)",
              title: "Seguimiento en APS & Criterio de Derivacion",
              bullets: [
                "Medico General: Inicia y titula los 4 Pilares durante 3 meses",
                "Control con Ecocardiograma a los 3 meses de terapia optima",
                "Si FEVI se mantiene <= 35% ➔ Derivar a Electrofisiologia para DAI",
                "Si FEVI <= 35% + BCRI (QRS >= 130 ms) ➔ Derivar para TRC"
              ]
            }
          ]}
        />
      </Slide>

      {/* SLIDE 9: IC AGUDA & FORRESTER */}
      <Slide
        nav="Cuadricula de Forrester"
        notes="En urgencias se evalua Perfusion (Caliente/Frio) y Congestion (Humedo/Seco). El 80% de los pacientes consultan como Caliente y Humedo."
      >
        <Table
          title="Insuficiencia Cardiaca Aguda: Cuadricula de Forrester"
          subtitle="Evaluacion hemodinamica inmediata en el Servicio de Urgencias (Codigo 1.01.2.005)."
          headers={["Perfil Clinico", "Hemodinamia", "Manifestaciones Clinicas", "Conducta Terapeutica Inmediata"]}
          rows={[
            {
              cells: [
                "Perfil A (Caliente y Seco)",
                "Normoperfundido + Seco",
                ["Sin disnea en reposo", "Sin crépitos pulmonares", "Sin edemas periféricos"],
                "Mantener y titular los 4 Pilares orales en APS."
              ]
            },
            {
              highlight: true,
              cells: [
                "Perfil B (Caliente y Humedo) - 80% Urgencias",
                "Normoperfundido + Humedo",
                ["Crisis hipertensiva", "Edema Agudo de Pulmon (EAP)", "Ortopnea y crepitos masivos"],
                "VNI (CPAP) + Furosemida EV bolo + Nitroglicerina EV en infusion continua."
              ]
            },
            {
              cells: [
                "Perfil L (Frio y Seco)",
                "Hipoperfundido + Seco",
                ["Deshidratacion / exceso diureticos", "Extremidades frias", "Llene capilar lento"],
                "Prueba controlada de volumen con Cristaloides (Suero Fisiologico)."
              ]
            },
            {
              cells: [
                "Perfil C (Frio y Humedo) - Shock Cardiogenico",
                "Hipoperfundido + Humedo",
                ["Hipotension (PAS < 90)", "Mala perfusion distal", "Crepitos y congestion alveolar"],
                "Noradrenalina + Dobutamina + Traslado inmediato a UCI."
              ]
            }
          ]}
          pearl="En Edema Agudo de Pulmon normoperfundido (Caliente y Humedo), la triada salvadora es: VNI + Furosemida EV + Vasodilatador EV."
        />
      </Slide>

      {/* SLIDE 10: MANEJO DEL EDEMA AGUDO DE PULMON */}
      <Slide
        nav="Manejo del EAP"
        notes="Protocolo secuencial de urgencia: Posicion sentada, CPAP precoz para evitar IOT, Furosemida EV y Nitroglicerina si PAS > 110."
      >
        <Steps
          title="Manejo Protocolizado del Edema Agudo de Pulmon"
          subtitle="Secuencia terapeutica en Urgencias para paciente en perfil Caliente y Humedo con PA preservada."
          items={[
            { tag: "Paso 1 · Posicion & O2", badgeBg: "#0f172a", title: "Posicion Sentada", desc: "Sentar al paciente con piernas colgando para disminuir el retorno venoso. Oxigeno solo si SatO2 < 90%." },
            { tag: "Paso 2 · VNI Precoz", badgeBg: "#0284c7", title: "Ventilacion No Invasiva (CPAP)", desc: "Disminuye el trabajo respiratorio y la precarga. Reduce la necesidad de intubacion endotraqueal en un 50%." },
            { tag: "Paso 3 · Diuretico EV", badgeBg: "#16a34a", title: "Furosemida Endovenosa", desc: "Bolo de 20 a 40 mg EV (o el doble de la dosis oral si ya era usuario cronico) para iniciar diuresis rapida." },
            { tag: "Paso 4 · Vasodilatador", badgeBg: "#e11d48", title: "Nitroglicerina EV", desc: "Infusion continua si la Presion Arterial Sistolica es > 110 mmHg para reducir rapidamente la poscarga." }
          ]}
        />
      </Slide>

      {/* SLIDE 11: CASO CLINICO 1 */}
      <Slide
        nav="Caso Clinico 1"
        notes="Caso de optimizacion de sobrevida en APS. El paciente tiene FEVI 32% y ya toma Enalapril y Carvedilol; requiere Espironolactona y Dapagliflozina."
      >
        <QuestionSlide
          number={1}
          caseText="Hombre de 64 anos, diabetico e hipertenso, con antecedente de infarto miocardico hace 2 anos. Acude a control en APS por disnea que aparece al caminar 1 cuadra (Capacidad Funcional III) y ortopnea de 2 almohadas. Al examen fisico: PA 128/76 mmHg, FC 72 lpm regular. Ingurgitacion yugular (+) y crepitaciones en ambas bases pulmonares. Ecocardiograma: FEVI 32% con acinesia anterior. Tratamiento actual: Enalapril 10 mg c/12h y Carvedilol 25 mg c/12h."
          question="Cual es la conducta terapeutica mas adecuada a agregar para disminuir la mortalidad a largo plazo?"
          options={[
            { text: "Suspender Carvedilol y agregar Furosemida 40 mg/dia por via oral.", isCorrect: false },
            { text: "Cambiar Carvedilol por Atenolol 50 mg/dia para mejor control adrenergico.", isCorrect: false },
            { text: "Agregar Espironolactona 25 mg/dia y Dapagliflozina 10 mg/dia. (Completa los 4 Pilares)", isCorrect: true },
            { text: "Agregar Digoxina 0.25 mg al dia y programar estudio electrofisiologico.", isCorrect: false },
            { text: "Aumentar la dosis de Enalapril a 40 mg cada 12 horas como unica medida.", isCorrect: false }
          ]}
          explanation="El paciente tiene IC-FEr sintomatica (FEVI 32%). Para disminuir la mortalidad debe recibir la terapia cuadruple completa: a su esquema actual (Enalapril + Carvedilol) se deben agregar obligatoriamente un ARM (Espironolactona) y un iSGLT2 (Dapagliflozina)."
        />
      </Slide>

      {/* SLIDE 12: CASO CLINICO 2 */}
      <Slide
        nav="Caso Clinico 2"
        notes="Caso de edema pulmonar en urgencias con perfil Caliente y Humedo. Requiere CPAP + Furosemida EV + Nitroglicerina EV."
      >
        <QuestionSlide
          number={2}
          caseText="Mujer de 72 anos con antecedentes de HTA e IC con FEVI 35%, consulta a urgencias por disnea de inicio subito en reposo con expectoracion rosada y sudoracion profusa. Examen: Polipneica a 32 rpm, SatO2 84% aire ambiental. PA 185/105 mmHg, FC 118 lpm regular. Crepitaciones hasta campos superiores y sibilancias difusas. Llene capilar 2 segundos, extremidades tibias."
          question="Cual es la combinacion terapeutica inicial de eleccion para esta paciente?"
          options={[
            { text: "Hidratacion con Suero Fisiologico 1000 mL EV y Nebulizacion con Salbutamol.", isCorrect: false },
            { text: "Ventilacion No Invasiva (CPAP) + Furosemida EV en bolo + Infusion de Nitroglicerina EV.", isCorrect: true },
            { text: "Intubacion orotraqueal inmediata + Infusion de Noradrenalina y Dobutamina.", isCorrect: false },
            { text: "Bolo de Morfina 10 mg EV + Hidrocortisona 200 mg EV + Furosemida oral.", isCorrect: false }
          ]}
          explanation="La paciente presenta un Edema Agudo de Pulmon en perfil Caliente y Humedo con crisis hipertensiva. El manejo inmediato consiste en CPAP para reclutar alveolos, Furosemida EV para descongestion y Nitroglicerina EV para reducir la poscarga."
        />
      </Slide>

      {/* SLIDE 13: CASO CLINICO 3 */}
      <Slide
        nav="Caso Clinico 3"
        notes="Caso de deficit de hierro y dolor. El hierro en IC se trata con Carboximaltosa EV y los AINEs estan prohibidos."
      >
        <QuestionSlide
          number={3}
          caseText="Hombre de 68 anos con IC-FEr (FEVI 28%), en tratamiento con los 4 pilares (Sacubitril/Valsartan, Bisoprolol, Espironolactona y Empagliflozina). Refiere astenia marcada y disnea CF II persistente sin edemas. Laboratorio: Hb 11.2 g/dL, Creatinina 1.1 mg/dL. Cinetica de hierro: Ferritina 48 ng/mL, Saturacion de Transferrina 14%. Ademas consulta por dolor lumbociatico agudo y pregunta si puede tomar Ibuprofeno 600 mg."
          question="Cual es la indicacion medica correcta respecto al hierro y la analgesia?"
          options={[
            { text: "Indicar Sulfato Ferroso 200 mg/dia por via oral y autorizar Ibuprofeno por 5 dias.", isCorrect: false },
            { text: "Indicar Sulfato Ferroso oral y cambiar analgesia por Celecoxib 200 mg/dia.", isCorrect: false },
            { text: "Indicar Hierro Carboximaltosa Endovenoso y contraindicar formalmente los AINEs (indicar Paracetamol).", isCorrect: true },
            { text: "Transfundir 2 unidades de globulos rojos e indicar Ketoprofeno intramuscular.", isCorrect: false }
          ]}
          explanation="En IC con deficit de hierro (Ferritina < 100 ng/mL), el tratamiento de eleccion es el Hierro Carboximaltosa Endovenoso, ya que el hierro oral no se absorbe bien. Los AINEs (como Ibuprofeno o Celecoxib) estan formalmente contraindicados porque provocan retencion hidrosalina y descompensacion."
        />
      </Slide>

      {/* SLIDE 14: CHECKLIST FINAL */}
      <Slide
        nav="Checklist Final"
        notes="Checklist de oro para memorizar antes de rendir el examen. Cubrimos al 100% los codigos 1.01.1.018 y 1.01.2.005."
      >
        <Table
          title="Checklist Final de Dominio: Insuficiencia Cardiaca"
          subtitle="Reglas de oro indispensables para responder preguntas en el EUNACOM 2026."
          headers={["Concepto Clinico", "Regla de Oro de Examen", "Nivel Exigencia"]}
          rows={[
            { highlight: true, cells: ["Diagnostico Clinico (Framingham)", "2 Mayores o 1 Mayor + 2 Menores. R3 Galope es el signo mas especifico.", "Especifico"] },
            { cells: ["Biomarcadores BNP en Urgencia", "NT-proBNP < 300 o BNP < 100 descartan causa cardiaca (VPN > 95%).", "Emplea Informe"] },
            { highlight: true, cells: ["Los 4 Pilares de Sobrevida", "ARNI (36h lavado) + BB (Carvedilol/Biso/Metoprolol) + ARM (K < 5.0) + iSGLT2 (Dapa/Empa).", "Completo APS"] },
            { cells: ["Manejo EAP en Urgencias", "Posicion sentada + CPAP precoz + Furosemida EV + Nitroglicerina EV.", "Inicial Urgencias"] },
            { cells: ["Farmacos Contraindicados", "AINEs (Ibuprofeno/Diclofenaco) y Calcioantagonistas No DHP (Verapamilo/Diltiazem).", "Prohibicion Absoluta"] }
          ]}
          pearl="Proxima Masterclass: Cardiologia 02 · Fibrilacion Auricular & Flutter (Codigo 1.01.1.012 - CHA2DS2-VASc, DOACs y Cardioversion)."
        />
      </Slide>
    </Deck>
  );
}
