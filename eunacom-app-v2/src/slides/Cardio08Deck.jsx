import React from "react";
import Deck from "../deck/Deck";
import { Slide } from "../deck/Slide";
import { Cover } from "../components/deck/Cover";
import { Table } from "../components/deck/Table";
import { Steps } from "../components/deck/Steps";
import { Bento } from "../components/deck/Bento";
import { Contrast } from "../components/deck/Contrast";
import { QuestionSlide } from "../components/deck/QuestionSlide";
import { GuevaraTable } from "../components/deck/GuevaraTable";
import { GuevaraAlgorithm } from "../components/deck/GuevaraAlgorithm";

export default function Cardio08Deck() {
  return (
    <Deck title="Cardio 08: SCACEST & Protocolo de Reperfusión GES" classId="cardio-08">

      {/* ── SLIDE 1: PORTADA HERO ── */}
      <Slide
        nav="Portada & Códigos"
        notes="Bienvenidos a la Masterclass oficial de SCACEST y Protocolo de Reperfusión GES para el EUNACOM 2026. Revisaremos diagnóstico en 10 minutos, tiempos de ventana, dosis exactas de antiagregación y casos clínicos clave."
      >
        <Cover
          kicker="MEDICINA INTERNA · CARDIOLOGÍA · CLASE 08"
          badges={["CÓD: 1.01.2.002", "CÓD: 1.01.3.005", "GARANTÍA GES 2026", "STEP 2 CK"]}
          title="SCACEST & Protocolo de Reperfusión GES"
          subtitle="Diagnóstico Electrocardiográfico en ≤10 min · Angioplastía Primaria vs Tenecteplase · DAPT & Anticoagulación · Clasificación de Killip-Kimball"
        />
      </Slide>

      {/* ── SLIDE 2: MATRIZ PERFIL V3 ── */}
      <Slide
        nav="Matriz Perfil V3"
        notes="El Perfil V3 exige al médico general diagnosticar de forma específica el SCACEST en menos de 10 minutos y realizar el tratamiento de urgencia con reperfusión inmediata antes de 120 minutos."
      >
        <GuevaraTable
          classNumber="CLASE 08"
          title="Matriz de Exigencia Legal Perfil V3 (ASOFAMECh)"
          subtitle="Alcance de práctica obligatorio para el Médico General en Chile"
          headers={["Código", "Entidad Clínica", "Diagnóstico", "Tratamiento", "Seguimiento Red"]}
          rows={[
            ["1.01.2.002", "IAM con SDST (SCACEST)", "Específico (≤10m)", "Urgencia Total", "🚨 SAMU / Derivación"],
            ["1.01.3.005", "Reperfusión Coronaria", "Indica / Aplica", "TNK o activa PCI", "🚨 Hemodinamia"],
            ["1.01.1.002", "Cardiopatía Isquémica Post-Alta", "Específico", "Completo", "✓ APS (CESFAM)"],
            ["1.01.2.005", "Shock Cardiogénico (Killip IV)", "Sospecha / Trata", "Inicial Inótropos", "🚨 UCI Coronaria"]
          ]}
          highlightColIndex={3}
          bottomNote="Garantía GES: El retraso injustificado en la toma del ECG o en la activación de la reperfusión constituye negligencia médica en el estándar nacional."
        />
      </Slide>

      {/* ── SLIDE 3: FISIOPATOLOGÍA & CRITERIOS ECG ── */}
      <Slide
        nav="Fisiopatología & ECG"
        notes="La rotura de una placa vulnerable genera trombosis oclusiva transmural. Los criterios diagnósticos de elevación del ST exigen elevación del punto J en al menos 2 derivaciones contiguas."
      >
        <Steps
          title="Fisiopatología de Oclusión & Criterios ECG de Elevación ST"
          subtitle="De la biología molecular de la placa a los criterios diagnósticos del punto J"
          items={[
            {
              step: "01",
              title: "Rotura de Placa Aterosclerótica",
              description: "Erosión o fisura de la capa fibrosa expone colágeno y factor tisular, activando de forma explosiva las plaquetas."
            },
            {
              step: "02",
              title: "Trombo Oclusivo Rojo 100%",
              description: "Malla de fibrina y hematíes ocluye completamente la luz coronaria epicárdica provocando isquemia transmural aguda."
            },
            {
              step: "03",
              title: "Criterios Oficiales de SDST (Punto J)",
              description: "V2-V3: ≥2.0mm (varón ≥40a), ≥2.5mm (<40a), ≥1.5mm (mujer). Resto de derivaciones: ≥1.0mm en ≥2 contiguas."
            },
            {
              step: "04",
              title: "Nuevo BCRI = SCACEST",
              description: "Bloqueo de rama izquierda nuevo o presumiblemente nuevo con síntomas isquémicos se maneja como infarto con supradesnivel."
            }
          ]}
        />
      </Slide>

      {/* ── SLIDE 4: ALGORITMO ABCDE ── */}
      <Slide
        nav="Resucitación ABCDE"
        notes="En los primeros 10 minutos: O2 solo si SatO2 es menor al 90%, 2 vías venosas periféricas gruesas, monitor desfibrilador listo y ECG de 12 derivaciones."
      >
        <Bento
          title="Algoritmo de Resucitación & Urgencias ABCDE"
          subtitle="Acciones críticas obligatorias en los primeros 10 minutos de ingreso"
          tiles={[
            {
              title: "A - B · Oxigenoterapia Racional",
              desc: "Oxígeno suplementario ÚNICAMENTE si SatO2 < 90% o PaO2 < 60 mmHg. La hiperoxia genera vasoconstricción y mayor daño por reperfusión.",
              accent: "#38bdf8",
              span: "col-span-6"
            },
            {
              title: "C · Accesos Vasculares & Monitor",
              desc: "2 VVP #18G. Monitorización continua con palas de desfibrilador listas ante alto riesgo de Fibrilación Ventricular primaria en primeras 4h.",
              accent: "#00f2fe",
              span: "col-span-6"
            },
            {
              title: "D · Analgesia Isquémica",
              desc: "Morfina 2-4 mg EV fraccionada solo si dolor refractario severo (cautela: puede retrasar la absorción gástrica de inhibidores P2Y12).",
              accent: "#f59e0b",
              span: "col-span-6"
            },
            {
              title: "E · Electrocardiograma ≤10 min",
              desc: "12 derivaciones estándar. Si hay compromiso inferior (DII, DIII, aVF), tomar de inmediato derivaciones derechas V3R-V4R y posteriores V7-V9.",
              accent: "#10b981",
              span: "col-span-6"
            }
          ]}
        />
      </Slide>

      {/* ── SLIDE 5: FARMACOTERAPIA DAPT ── */}
      <Slide
        nav="Farmacoterapia DAPT"
        notes="La terapia farmacológica inicial combina doble antiagregación plaquetaria con AAS y un inhibidor P2Y12, junto con anticoagulación parenteral y estatinas de alta potencia."
      >
        <Table
          title="Farmacoterapia Inicial & Dosis Exactas EUNACOM"
          subtitle="Doble antiagregación (DAPT), anticoagulación y cardioprotección de urgencia"
          headers={["Fármaco", "Dosis de Carga", "Mantención", "Estrategia Clínica GES"]}
          rows={[
            ["AAS (Aspirina)", "250 - 500 mg VO masticable", "100 mg / día", "Universal e inmediata en todo paciente"],
            ["Ticagrelor", "180 mg VO", "90 mg c/12h", "1ra línea para Angioplastía Primaria (PCI)"],
            ["Clopidogrel", "300 mg VO (75mg si >75a)", "75 mg / día", "De elección si recibe Trombólisis (TNK)"],
            ["Enoxaparina", "30 mg EV bolo + 1 mg/kg SC", "1 mg/kg c/12h", "Anticoagulación parenteral estándar"],
            ["Atorvastatina", "80 mg VO dosis única", "80 mg / día", "Estabilización pleiotrópica de la placa"]
          ]}
          highlightCol={1}
          pearl="Regla de examen: En mayores de 75 años sometidos a trombólisis, la dosis de carga de Clopidogrel se reduce a 75 mg y se omite el bolo EV de Enoxaparina."
        />
      </Slide>

      {/* ── SLIDE 6: SCORE KILLIP-KIMBALL ── */}
      <Slide
        nav="Score Killip-Kimball"
        notes="La clasificación de Killip-Kimball estratifica la mortalidad intrahospitalaria según la presencia de signos de congestión y shock cardiogénico al ingreso."
      >
        <Table
          title="Estratificación Hemodinámica: Score Killip-Kimball"
          subtitle="Clasificación clínica pronóstica de mortalidad intrahospitalaria en el IAM"
          headers={["Clase Killip", "Hallazgos Clínicos Cardinales", "Mortalidad", "Conducta Inmediata"]}
          rows={[
            ["Killip I", "Sin signos de insuficiencia cardíaca ni estertores", "6%", "Reperfusión estándar + monitorización"],
            ["Killip II", "Crepitaciones bibasales (<50% de campos) y/o R3 galope", "17%", "Reperfusión + Furosemida EV + Vasodilatadores"],
            ["Killip III", "Edema Agudo de Pulmón (>50% de campos crepitantes)", "38%", "VNI / CPAP + Furosemida EV + Nitroglicerina EV"],
            ["Killip IV", "Shock Cardiogénico (PAS < 90 mmHg, oliguria, frialdad)", "81%", "PCI Emergente + Noradrenalina / Inótropos + UCI"]
          ]}
          highlightCol={2}
          pearl="Killip IV (Shock Cardiogénico) es indicación mandatoria de traslado urgente a Angioplastía Primaria, incluso superando ventanas temporales habituales."
        />
      </Slide>

      {/* ── SLIDE 7: ALGORITMO REPERFUSIÓN (GUEVARA FLOWCHART) ── */}
      <Slide
        nav="Algoritmo Reperfusión"
        notes="Regla de los 120 minutos: si el traslado a hemodinamia demora menos de 120 min se traslada a PCI. Si excede 120 min, se tromboliza en menos de 30 min con Tenecteplase."
      >
        <GuevaraAlgorithm
          classNumber="CLASE 08"
          title="Algoritmo de Elección de Reperfusión (Regla de 120 Minutos)"
          rootNode={{
            badge: "DIAGNÓSTICO SCACEST CONFIRMADO",
            title: "Dolor Torácico Isquémico + SDST / Nuevo BCRI",
            desc: "Tiempo de evolución < 12 horas desde el inicio de los síntomas"
          }}
          decisionQuestion="¿El tiempo estimado desde el diagnóstico hasta cruzar la guía en Hemodinamia es ≤ 120 min?"
          branches={[
            {
              isYes: true,
              decisionTag: "✓ SÍ (≤ 120 Min)",
              tag: "Gold Standard",
              title: "Angioplastía Primaria (PCI)",
              bullets: [
                "Meta Puerta-Balón < 90 min (o <60m en centro PCI)",
                "DAPT: AAS 250-500mg + Ticagrelor 180mg",
                "Acceso vascular radial y stent liberador (DES)"
              ],
              action: "Activar código hemodinamia y trasladar de inmediato"
            },
            {
              isNo: true,
              decisionTag: "✗ NO (> 120 Min)",
              tag: "Fibrinolisis Urgente",
              title: "Trombólisis con Tenecteplase",
              bullets: [
                "Meta Puerta-Aguja < 30 min en hospital periférico",
                "Bolo EV único peso-dependiente de TNK",
                "DAPT: AAS 250-500mg + Clopidogrel 300mg"
              ],
              action: "Trombolizar inmediatamente y coordinar traslado sistemático para angiografía (2-24h)"
            }
          ]}
          bottomBanner="Si a los 60-90 min post-trombólisis el ST no desciende >50% o persiste dolor, se declara Reperfusión Fallida y se indica PCI de Rescate Inmediata."
        />
      </Slide>

      {/* ── SLIDE 8: LOCALIZACIÓN ANATÓMICA ── */}
      <Slide
        nav="Mapeo Coronario ECG"
        notes="El electrocardiograma permite localizar con exactitud la arteria ocluida: LAD en pared anterior, RCA en inferior con riesgo de ventrículo derecho, y LCx en lateral y posterior."
      >
        <Contrast
          title="Correlación Anatómica Electrocardiográfica & Arteria Culpable"
          leftTitle="Territorio Coronario & Derivaciones"
          leftItems={[
            "Pared Anteroseptal (V1 - V4): Arteria Descendente Anterior (LAD) · Riesgo de shock y falla ventricular",
            "Pared Inferior (DII, DIII, aVF): Arteria Coronaria Derecha (RCA) · Riesgo de BAV y compromiso VD",
            "Pared Lateral Alta (DI, aVL): Arteria Circunfleja (LCx)",
            "Pared Posterior (V7 - V9): Descenso especular del ST en V1-V3 con R alta"
          ]}
          rightTitle="Diagnósticos Diferenciales Críticos"
          rightItems={[
            "Disección Aórtica Aguda: Dolor desgarrante transfixiante con asimetría de pulsos (🚨 PROHIBIDO fibrinolizar)",
            "Pericarditis Aguda: Supradesnivel cóncavo difuso con infradesnivel del PR (sin imagen en espejo)",
            "Angina de Prinzmetal: Vasoespasmo con elevación transitoria del ST que cede con nitratos en reposo",
            "Síndrome de Takotsubo: Balonamiento apical en mujeres post-estrés con coronarias normales"
          ]}
        />
      </Slide>

      {/* ── SLIDE 9: CONTRAINDICACIONES FIBRINOLISIS ── */}
      <Slide
        nav="Contraindicaciones Fibrinolisis"
        notes="Las contraindicaciones absolutas de fibrinolisis prohíben la administración de Tenecteplase y obligan al traslado para Angioplastía Primaria sin importar la distancia."
      >
        <Bento
          title="Contraindicaciones de la Trombólisis Sistémica"
          subtitle="Criterios de seguridad para evitar hemorragias intracraneales catastróficas"
          tiles={[
            {
              title: "⛔ Hemorragia Intracraneal Previa",
              desc: "Cualquier antecedente de sangrado intracraneal en cualquier momento de la vida contraindica de forma absoluta la fibrinolisis.",
              accent: "#ef4444",
              span: "col-span-6"
            },
            {
              title: "⛔ ACV Isquémico Reciente (<6 Meses)",
              desc: "Infarto cerebral en los últimos 6 meses (excepto ACV isquémico agudo en las primeras 4.5 horas evaluado para trombolisis neurológica).",
              accent: "#ef4444",
              span: "col-span-6"
            },
            {
              title: "⛔ Neoplasia o Malformación Vascular SNC",
              desc: "Tumor cerebral primario o metastásico, aneurisma o malformación arteriovenosa cerebral conocida.",
              accent: "#ef4444",
              span: "col-span-6"
            },
            {
              title: "⛔ Sangrado Activo & Disección Aórtica",
              desc: "Hemorragia gastrointestinal en el último mes, traumatismo mayor/cirugía <3 meses, o sospecha de disección de aorta.",
              accent: "#ef4444",
              span: "col-span-6"
            }
          ]}
        />
      </Slide>

      {/* ── SLIDE 10: 4 TRAMPAS EUNACOM ── */}
      <Slide
        nav="4 Trampas EUNACOM"
        notes="Memoriza estas 4 trampas clásicas: el infarto de ventrículo derecho donde los nitratos están prohibidos, el fracaso fibrinolítico a los 90 min, el nuevo BCRI y la ventana tardía."
      >
        <Steps
          title="Las 4 Trampas Clásicas del Banco de Preguntas EUNACOM"
          subtitle="Patrones recurrentes diseñados para inducir a error en el examen oficial"
          items={[
            {
              step: "01",
              title: "IAM de Ventrículo Derecho (V3R-V4R)",
              description: "Tríada: Hipotensión + Yugulares ingurgitadas + Campos limpios. PROHIBIDOS Nitratos y Furosemida. Tratar con bolo de SF 0.9%."
            },
            {
              step: "02",
              title: "Criterios de Reperfusión Fallida (60-90 min)",
              description: "Si el supradesnivel del ST NO desciende >50% a los 90 min post-TNK, se declara fracaso y se realiza Angioplastía de Rescate Inmediata."
            },
            {
              step: "03",
              title: "Criterios de Sgarbossa en BCRI Previo",
              description: "ST concordante ≥1mm (5 pts), depresión ST en V1-V3 ≥1mm (3 pts), o ST discordante ≥5mm (2 pts). Score ≥3 confirma IAM."
            },
            {
              step: "04",
              title: "Ventana Tardía > 12 Horas",
              description: "Si el paciente consulta asintomático y hemodinámicamente estable tras >12h, NO se tromboliza; se programa coronariografía electiva."
            }
          ]}
        />
      </Slide>

      {/* ── SLIDE 11: CASO CLÍNICO 1 ── */}
      <Slide
        nav="Caso Clínico 1"
        notes="Caso 1: Paciente con SCACEST anterior clásico. La conducta correcta es DAPT de carga y activación inmediata de PCI sin esperar troponinas."
      >
        <QuestionSlide
          number="1"
          caseText="Hombre de 58 años hipertenso y tabaquista consulta en el Servicio de Urgencia por dolor retroesternal opresivo de 45 minutos de duración, irradiado a mandíbula y brazo izquierdo, acompañado de diaforesis. Ingresa con PA 150/90 mmHg, FC 92 lpm, SatO2 96% ambiental. El ECG revela supradesnivel del segmento ST de 3 mm en derivaciones V1 a V4."
          question="¿Cuál es la conducta inicial prioritaria más adecuada?"
          options={[
            "Administrar O2 por mascarilla, solicitar troponinas y esperar resultado para definir conducta.",
            "Administrar AAS 250 mg masticable + Ticagrelor 180 mg y activar inmediatamente Angioplastía Primaria.",
            "Administrar bolo de Tenecteplase inmediatamente y luego solicitar ecocardiograma transtorácico.",
            "Iniciar infusión de Nitroglicerina EV como monoterapia y diferir la antiagregación hasta ingreso a UCI."
          ]}
          explanation="En SCACEST no se debe retrasar la reperfusión esperando biomarcadores de necrosis miocárdica. Con SatO2 96% el oxígeno suplementario no está indicado. Se debe administrar DAPT de carga (AAS + Ticagrelor) y activar Angioplastía Primaria urgente."
        />
      </Slide>

      {/* ── SLIDE 12: CASO CLÍNICO 2 ── */}
      <Slide
        nav="Caso Clínico 2"
        notes="Caso 2: Paciente en hospital periférico a más de 120 minutos de hemodinamia. La indicación es trombolisis inmediata con Tenecteplase + Clopidogrel."
      >
        <QuestionSlide
          number="2"
          caseText="Mujer de 64 años consulta en un Hospital Comunitario sin laboratorio de hemodinamia por dolor torácico isquémico de 90 minutos de evolución. El ECG confirma SCACEST de pared anterior. El centro terciario más cercano con capacidad de Angioplastía Primaria se encuentra a 3.5 horas de traslado en ambulancia. La paciente no presenta contraindicaciones para fibrinolisis."
          question="¿Cuál es el manejo indicado según las guías clínicas GES?"
          options={[
            "Iniciar traslado inmediato en ambulancia hacia el centro terciario para Angioplastía Primaria sin trombolizar.",
            "Administrar Tenecteplase bolo EV + AAS + Clopidogrel 300mg + Enoxaparina, y coordinar traslado posterior.",
            "Administrar Tenecteplase asociado a Ticagrelor 180 mg y Heparina No Fraccionada en infusión continua.",
            "Trombolizar y mantener hospitalizada en el hospital comunitario hasta el alta sin derivación a hemodinamia."
          ]}
          explanation="Dado que el tiempo estimado de traslado supera los 120 minutos, la indicación GES es la administración inmediata de fibrinolisis en bolo con Tenecteplase (meta <30 min) asociada a DAPT con Clopidogrel y Enoxaparina, coordinando posterior traslado para coronariografía sistemática en 2-24h."
        />
      </Slide>

      {/* ── SLIDE 13: CASO CLÍNICO 3 ── */}
      <Slide
        nav="Caso Clínico 3"
        notes="Caso 3: IAM inferior que se hipotensa tras nitroglicerina. Presenta compromiso de ventrículo derecho; la conducta es suspender nitratos y expandir con SF 0.9%."
      >
        <QuestionSlide
          number="3"
          caseText="Varón de 71 años con SCACEST de pared inferior (SDST en DII, DIII, aVF). Al ingreso con PA 130/80 mmHg se le administra Nitroglicerina sublingual para alivio del dolor. A los 5 minutos el paciente evoluciona con mareos intensos, palidez, PA 70/40 mmHg, FC 88 lpm. Al examen físico destaca ingurgitación yugular marcada sin crepitaciones pulmonares."
          question="¿Cuál es la conducta terapéutica prioritaria?"
          options={[
            "Iniciar infusión continua inmediata de Noradrenalina a dosis altas.",
            "Suspender nitroglicerina y administrar un bolo rápido de Suero Fisiológico 0.9% EV (500-1000 ml).",
            "Administrar Furosemida 40 mg EV para descomprimir la ingurgitación yugular.",
            "Administrar Atropina 1 mg EV para aumentar el gasto cardíaco."
          ]}
          explanation="El paciente presenta un IAM de ventrículo derecho asociado al infarto inferior. El VD isquémico depende estrictamente de una precarga elevada para mantener el volumen eyectivo; los nitratos producen venodilatación y colapso del gasto cardíaco. La conducta prioritaria es suspender vasodilatadores y expandir enérgicamente con Suero Fisiológico 0.9%."
        />
      </Slide>

      {/* ── SLIDE 14: RESUMEN CHECKLIST ── */}
      <Slide
        nav="Checklist Final"
        notes="En resumen: toma del ECG en menos de 10 minutos, carga de AAS 250 a 500 mg, elección de reperfusión según la regla de los 120 minutos y cuidado con los nitratos en el infarto de ventrículo derecho."
      >
        <Steps
          title="Checklist de Decisión Final: SCACEST EUNACOM 2026"
          subtitle="Resumen de alta fidelidad para el examen y la guardia clínica"
          items={[
            {
              step: "01",
              title: "Diagnóstico Rápido en ≤10 Minutos",
              description: "Toma e interpretación del ECG. SDST en ≥2 contiguas o nuevo BCRI activa código IAM sin esperar troponinas."
            },
            {
              step: "02",
              title: "Carga Antitrombótica Inmediata",
              description: "AAS 250-500mg masticable + Ticagrelor 180mg (si PCI) o Clopidogrel 300mg (si TNK) + Enoxaparina 30mg EV + 1mg/kg SC."
            },
            {
              step: "03",
              title: "Regla Temporal de Reperfusión",
              description: "Traslado ≤120m ➔ Angioplastía Primaria (Puerta-Balón <90m). Traslado >120m ➔ Tenecteplase bolo (Puerta-Aguja <30m)."
            },
            {
              step: "04",
              title: "Seguridad & Rescate de Urgencia",
              description: "No dar nitratos en IAM inferior con sospecha de VD. Si el ST no desciende >50% a los 90 min post-TNK ➔ PCI de Rescate inmediata."
            }
          ]}
        />
      </Slide>

    </Deck>
  );
}
