"""
Didactic lesson blocks for Cardiología (Módulo 1).
Each block:
  {"type": "text", "html": "..."}
  {"type": "rapid_check", "id": "...", "question": "...", "options": [...],
   "correct": "A-E", "wrong_hint": "..."}
"""

LESSONS = {

# ─────────────────────────────────────────────────────────────────────────
"insuficiencia-cardiaca": [
  {"type": "text", "html": """
<h3>Insuficiencia Cardíaca: Diagnóstico y Clasificación</h3>
<p>La insuficiencia cardíaca es el síndrome clínico resultante de cualquier trastorno estructural o funcional del llenado ventricular o de la eyección de sangre. La causa más frecuente en Chile es la combinación de <strong>cardiopatía hipertensiva y coronaria</strong>.</p>
<table>
<thead><tr><th>Clasificación según FEVI</th><th>FEVI (%)</th><th>Manejo Farmacológico Clave</th></tr></thead>
<tbody>
<tr><td><strong>🟢 Preservada (ICFEp)</strong></td><td>≥ 50%</td><td>Tratamiento de la causa, diuréticos si congestión, iSGLT2</td></tr>
<tr><td><strong>🟡 Rango Medio (ICFEmr)</strong></td><td>41 – 49%</td><td>Manejo similar a ICFEr (beneficio parcial de betabloqueadores/IECAs)</td></tr>
<tr><td><strong>🔴 Reducida (ICFEr)</strong></td><td>≤ 40%</td><td><strong>4 Pilares:</strong> ARNI/IECA, Betabloqueador, Espironolactona, iSGLT2</td></tr>
</tbody>
</table>
<p><strong>Criterios de Framingham (Diagnóstico Clínico):</strong> Requiere 2 criterios mayores OR 1 mayor + 2 menores.</p>
<ul>
<li><strong>Mayores:</strong> DPN, Ingurgitación yugular, Estertores crepitantes, Cardiomegalia en Rx, Edema agudo de pulmón, R3 (tercer ruido), Reflujo hepatoyugular positivo.</li>
<li><strong>Menores:</strong> Edema bilateral de extremidades inferiores, Tos nocturna, Disnea de esfuerzo, Hepatomegalia, Derrame pleural, Taquicardia (>120 lpm).</li>
</ul>
"""},

  {"type": "rapid_check", "id": "rc-ic1",
   "question": "Paciente de 68 años con antecedentes de HTA y antecedentes de infarto previo. Consulta por disnea progresiva hasta ortopnea. Al examen físico: crepitos pulmonares bilaterales y reflujo hepatoyugular. ¿Qué examen es el más adecuado para clasificar la insuficiencia cardíaca del paciente?",
   "options": ["A. Rx de tórax", "B. Electrocardiograma", "C. Ecocardiografía transtorácica", "D. AngioTAC de tórax", "E. Péptidos natriuréticos (NT-proBNP)"],
   "correct": "C",
   "wrong_hint": "Aunque la clínica y los péptidos natriuréticos orientan el diagnóstico, el examen de elección para clasificar la insuficiencia cardíaca según su fracción de eyección (preservada, rango medio o reducida) es la ecocardiografía. La Rx de tórax muestra congestión y cardiomegalia, pero no mide la FEVI."},

  {"type": "text", "html": """
<h3>Manejo de la Insuficiencia Cardíaca Crónica (ICFEr)</h3>
<p>El manejo farmacológico de la ICFEr tiene como objetivo bloquear la activación neurohumoral patológica y disminuir la mortalidad a largo plazo. Los 4 pilares terapéuticos son:</p>
<ol>
<li><strong>Inhibidor de la ECA (Enalapril) o ARNI (Sacubitrilo/Valsartán):</strong> Primera línea. Disminuyen poscarga y remodelado.</li>
<li><strong>Betabloqueadores (Carvedilol, Bisoprolol, Metoprolol succinato):</strong> Iniciar solo cuando el paciente esté estable (euvolémico). Disminuyen la frecuencia cardíaca y la muerte súbita.</li>
<li><strong>Antagonistas de la Aldosterona (Espironolactona):</strong> Disminuyen la fibrosis miocárdica. Vigilar potasio y función renal.</li>
<li><strong>iSGLT2 (Dapagliflozina, Empagliflozina):</strong> Disminuyen hospitalizaciones y mortalidad cardiovascular independientemente de si el paciente es diabético.</li>
</ol>
<p>⚠️ <strong>Furosemida (Diurético de asa):</strong> Se utiliza para el manejo sintomático de la congestión y sobrecarga de volumen. <strong>NO disminuye la mortalidad a largo plazo</strong>.</p>
"""},

  {"type": "rapid_check", "id": "rc-ic2",
   "question": "Un paciente de 62 años con diagnóstico de insuficiencia cardíaca con FEVI del 32% se encuentra estable bajo tratamiento con Enalapril y Carvedilol. A pesar de esto, refiere disnea de esfuerzos moderados (NYHA II) y se evidencia edema leve en tobillos. Su potasio sérico es de 4.1 mEq/L y creatinina de 1.1 mg/dL. ¿Cuál es el siguiente paso terapéutico más adecuado para disminuir la mortalidad?",
   "options": ["A. Aumentar dosis de Furosemida", "B. Agregar Espironolactona", "C. Agregar Hidralazina + Dinitrato de isosorbida", "D. Suspender Carvedilol", "E. Agregar Digoxina"],
   "correct": "B",
   "wrong_hint": "Para pacientes sintomáticos con ICFEr a pesar de IECA y Betabloqueador, el siguiente paso para reducir la mortalidad es agregar un antagonista del receptor de mineralocorticoides como la espironolactona (siempre que el potasio y la función renal lo permitan). La furosemida es sintomática y no reduce mortalidad."},
],

# ─────────────────────────────────────────────────────────────────────────
"cardiopatia-isquemia": [
  {"type": "text", "html": """
<h3>Síndrome Coronario Agudo (SCA): Enfrentamiento Inicial</h3>
<p>El SCA se clasifica en base al electrocardiograma en SCA con supradesnivel del segmento ST (SDST) y SCA sin supradesnivel del ST (SNDST, que incluye IAMSEST y Angina Inestable). El tiempo es músculo.</p>
<table>
<thead><tr><th>Tipo de SCA</th><th>Hallazgo ECG</th><th>Manejo Inmediato</th><th>Terapia de Reperfusión</th></tr></thead>
<tbody>
<tr><td><strong>🔴 IAM con SDST</strong></td><td>Supradesnivel ST ≥ 1mm en ≥ 2 derivadas contiguas (o nuevo LBBB)</td><td>Aspirina 300 mg + Clopidogrel 300 mg + Heparina + Nitroglicerina</td><td><strong>Angioplastia (ICP)</strong> si ventana &lt; 120 min. Si no, <strong>Trombolisis</strong> en &lt; 30 min.</td></tr>
<tr><td><strong>🟡 IAM sin SDST</strong></td><td>Infradesnivel ST, inversión onda T o ECG normal. Troponinas (+)</td><td>Aspirina 300 mg + Clopidogrel + Heparina. Estratificar riesgo.</td><td>Coronariografía de urgencia o diferida según score de riesgo (TIMI/GRACE).</td></tr>
<tr><td><strong>🔵 Angina Inestable</strong></td><td>Misma clínica/ECG que IAM sin SDST, pero <strong>Troponinas (-)</strong></td><td>Mismo manejo que IAM sin SDST.</td><td>Estratificación y coronariografía según riesgo.</td></tr>
</tbody>
</table>
<p><strong>Clínica de la Angina Inestable:</strong> Angina de reposo (>20 min), angina de reciente comienzo (clase funcional III-IV en el último mes), o angina progresiva (claramente más frecuente, prolongada o de menor umbral).</p>
"""},

  {"type": "rapid_check", "id": "rc-isq1",
   "question": "Paciente de 58 años, diabético e hipertenso, consulta por dolor opresivo retroesternal irradiado a mandíbula de 1 hora de evolución. ECG muestra supradesnivel del segmento ST de 3 mm en derivadas V1-V4. Se encuentra en un hospital periférico sin sala de hemodinamia. El centro con angioplastia más cercano se encuentra a 3 horas de distancia. ¿Cuál es la conducta inmediata?",
   "options": ["A. Administrar Aspirina 300 mg y derivar para angioplastia inmediata", "B. Administrar doble antiagregación y realizar trombolisis inmediata", "C. Solicitar troponinas de urgencia y esperar resultado", "D. Administrar Clopidogrel 75 mg y repetir ECG en 30 minutos", "E. Derivar en ambulancia básica a centro con hemodinamia"],
   "correct": "B",
   "wrong_hint": "En un IAM con supradesnivel de ST, si el tiempo de traslado a un centro con angioplastia (ICP) es superior a 120 minutos, la conducta inmediata obligatoria es realizar TROMBOLISIS química (ej. Tenecteplasa o Alteplasa) en el lugar de presentación, asociada a doble antiagregación (Aspirina 300mg + Clopidogrel 300mg) y anticoagulación."},

  {"type": "text", "html": """
<h3>Angina Crónica Estable y Prevención Secundaria</h3>
<p>La angina estable es un dolor opresivo retroesternal desencadenado por el esfuerzo o estrés emocional, que cede con el reposo o nitroglicerina sublingual en &lt; 20 minutos.</p>
<ul>
<li><strong>Tratamiento sintomático de elección:</strong> Betabloqueadores (atenolol, metoprolol) como primera línea. Nitroglicerina sublingual SOS.</li>
<li><strong>Prevención Secundaria (Disminuyen mortalidad):</strong>
  <ul>
    <li><strong>Aspirina 100 mg/día</strong> (o Clopidogrel 75 mg si alergia).</li>
    <li><strong>Estatinas de alta intensidad</strong> (Atorvastatina 40-80 mg o Rosuvastatina 20-40 mg) con objetivo de LDL &lt; 55 mg/dL.</li>
    <li><strong>IECAs/ARA II:</strong> Especialmente si el paciente es hipertenso, diabético o tiene FEVI &lt; 40%.</li>
    <li>Control estricto de factores de riesgo cardiovascular (FRCV).</li>
  </ul>
</li>
</ul>
"""},

  {"type": "rapid_check", "id": "rc-isq2",
   "question": "Paciente de 65 años con diagnóstico de cardiopatía isquémica estable. Refiere dolor opresivo retroesternal recurrente al caminar más de 2 cuadras, que cede con 5 minutos de reposo. Actualmente toma Aspirina 100 mg y Atorvastatina 40 mg. Su PA es 130/80 y FC es 78 lpm. ¿Cuál es el tratamiento sintomático de primera línea a agregar?",
   "options": ["A. Nitroglicerina sublingual reglada", "B. Amlodipino 10 mg al día", "C. Propranolol o Metoprolol", "D. Mononitrato de isosorbida vía oral", "E. Clopidogrel 75 mg al día"],
   "correct": "C",
   "wrong_hint": "Los betabloqueadores son los fármacos antianginosos de primera línea en la angina crónica estable, ya que disminuyen la demanda miocárdica de oxígeno al reducir la frecuencia cardíaca y la contractilidad. Los nitratos sublinguales se usan en las crisis agudas, no de forma reglada diaria."},
],

# ─────────────────────────────────────────────────────────────────────────
"hta-riesgo": [
  {"type": "text", "html": """
<h3>Hipertensión Arterial (HTA): Diagnóstico y Manejo</h3>
<p>El diagnóstico de HTA se realiza con el promedio de al menos dos lecturas de presión arterial por visita en dos o más visitas separadas (≥ 140/90 mmHg). Confirmar preferentemente con <strong>MAPA (Holter de presión arterial)</strong> o autocontrol domiciliario (AMPA).</p>
<table>
<thead><tr><th>Estudio confirmatorio (MAPA)</th><th>Umbral de Diagnóstico (PA)</th></tr></thead>
<tbody>
<tr><td><strong>Promedio de 24 horas</strong></td><td>≥ 130/80 mmHg</td></tr>
<tr><td><strong>Promedio Diurno (Vigilia)</strong></td><td>≥ 135/85 mmHg</td></tr>
<tr><td><strong>Promedio Nocturno (Sueño)</strong></td><td>≥ 120/70 mmHg</td></tr>
</tbody>
</table>
<p><strong>Tratamiento Antihipertensivo Inicial:</strong></p>
<ul>
<li><strong>Fármacos de primera línea:</strong> IECAs (Enalapril), ARA II (Losartán), Calcioantagonistas (Amlodipino) o Tiazidas (Hidroclorotiazida).</li>
<li><strong>Elección según comorbilidad:</strong>
  <ul>
    <li>Diabéticos / Enfermedad Renal Crónica con proteinuria: <strong>IECAs o ARA II</strong> (nefroprotectores).</li>
    <li>Angina / Post-IAM: <strong>Betabloqueadores</strong>.</li>
    <li>Adultos mayores / HTA sistólica aislada: <strong>Calcioantagonistas o Tiazidas</strong>.</li>
  </ul>
</li>
</ul>
<p>⚠️ <strong>Contraindicación absoluta:</strong> NUNCA asociar IECA + ARA II (riesgo de falla renal e hiperkalemia). Evitar betabloqueadores en asma grave o bloqueo AV de alto grado.</p>
"""},

  {"type": "rapid_check", "id": "rc-hta1",
   "question": "Paciente de 52 años, diabético con nefropatía diabética (creatinina 1.4 mg/dL, microalbuminuria positiva). En controles repetidos de PA clínica se registran cifras promedio de 145/92 mmHg. ¿Cuál es el fármaco antihipertensivo de primera elección?",
   "options": ["A. Hidroclorotiazida", "B. Enalapril o Losartán", "C. Amlodipino", "D. Atenolol", "E. Espironolactona"],
   "correct": "B",
   "wrong_hint": "En pacientes con diabetes mellitus y nefropatía (proteinuria o microalbuminuria), los IECAs o ARA II son los fármacos de primera elección por su efecto antiproteinúrico y nefroprotector (vasodilatación de la arteriola eferente renal, reduciendo la presión intraglomerular)."},

  {"type": "text", "html": """
<h3>Manejo de la Dislipidemia y Anticoagulación Crónica</h3>
<p>El riesgo cardiovascular (RCV) determina el objetivo terapéutico de colesterol LDL. En prevención secundaria (pacientes con antecedente de IAM, ACV o enfermedad arterial periférica), el paciente se clasifica automáticamente en <strong>Riesgo Muy Alto</strong>.</p>
<ul>
<li><strong>Objetivo LDL en RCV Muy Alto:</strong> &lt; 55 mg/dL (y reducción ≥50% del valor basal).</li>
<li><strong>Objetivo LDL en RCV Alto:</strong> &lt; 70 mg/dL.</li>
</ul>
<p><strong>Manejo de la Anticoagulación Oral (ACO):</strong></p>
<ul>
<li><strong>Fibrilación Auricular no valvular:</strong> Se prefiere el uso de Anticoagulantes Orales de Acción Directa (ACOD/NOACs como Rivaroxabán o Apixabán) frente a la Warfarina/Acenocumarol por menor riesgo de hemorragia intracraneal.</li>
<li><strong>Válvulas mecánicas o Estenosis Mitral moderada-grave:</strong> Uso exclusivo de antagonistas de vitamina K (Acenocumarol/Warfarina) con control de INR objetivo (generalmente 2.0 - 3.0).</li>
<li>⚠️ <strong>Intoxicación por cumarínicos:</strong> Si sangrado activo grave, administrar <strong>Complejo Protrombínico</strong> (o Plasma Fresco Congelado) + Vitamina K IV. Si INR elevado sin sangrado, suspender dosis y administrar Vitamina K vía oral según nivel de INR.</li>
</ul>
"""},

  {"type": "rapid_check", "id": "rc-hta2",
   "question": "Paciente de 72 años, anticoagulado con acenocumarol por fibrilación auricular. Consulta por epistaxis severa persistente que no cede con taponamiento anterior. Su INR de control resulta en 6.5. ¿Cuál es la conducta más adecuada?",
   "options": ["A. Suspender acenocumarol y repetir INR en 24 horas", "B. Administrar Vitamina K oral 2 mg y taponamiento posterior", "C. Administrar Vitamina K 10 mg IV lento + Complejo Protrombínico / Plasma Fresco Congelado", "D. Administrar sulfato de protamina de urgencia", "E. Transfundir concentrado de plaquetas inmediato"],
   "correct": "C",
   "wrong_hint": "Ante un sangrado severo o de riesgo vital bajo tratamiento con anticoagulantes cumarínicos (independientemente del INR), la conducta inmediata es revertir el efecto con Vitamina K IV lenta y reponer los factores de coagulación deficientes con Complejo Protrombínico (de elección) o Plasma Fresco Congelado. El sulfato de protamina es el antídoto de la heparina, no de los cumarínicos."},
],

# ─────────────────────────────────────────────────────────────────────────
"arritmias": [
  {"type": "text", "html": """
<h3>Fibrilación Auricular (FA) y Flutter Auricular</h3>
<p>La FA es la arritmia sostenida más frecuente. El electrocardiograma muestra: <strong>ausencia de ondas P</strong>, reemplazadas por ondas f de fibrilación, y un <strong>ritmo ventricular completamente irregular (RR irregular)</strong>.</p>
<table>
<thead><tr><th>Pilar del Manejo de FA</th><th>Estrategia y Herramientas</th><th>Detalles Clínicos</th></tr></thead>
<tbody>
<tr><td><strong>1. Control de Frecuencia</strong></td><td>Betabloqueadores (Carvedilol), Calcioantagonistas no dihidropiridínicos (Verapamilo/Diltiazem) o Digoxina</td><td>Objetivo FC reposo &lt; 110 lpm. Verapamilo contraindicado en insuficiencia cardíaca con FEVI reducida.</td></tr>
<tr><td><strong>2. Prevención de Embolías</strong></td><td>Evaluación de RCV embólico mediante score <strong>CHA2DS2-VASc</strong></td><td><strong>Score ≥ 2 en hombres o ≥ 3 en mujeres:</strong> Anticoagulación oral crónica (NOACs o TACO).</td></tr>
<tr><td><strong>3. Control del Ritmo</strong></td><td>Cardioversión eléctrica o farmacológica (Amiodarona)</td><td>Solo si inestabilidad hemodinámica (eléctrica inmediata) o si se decide estrategia de control del ritmo.</td></tr>
</tbody>
</table>
<p>⚠️ <strong>Regla de las 48 horas para Cardioversión en FA:</strong></p>
<ul>
<li>Si FA dura <strong>&lt; 48 horas:</strong> Se puede cardiovertir de forma segura sin anticoagulación previa (iniciar heparina al ingreso).</li>
<li>Si FA dura <strong>&gt; 48 horas (o tiempo desconocido):</strong> NO cardiovertir de inmediato por riesgo de embolía. Requiere 3 semanas de anticoagulación previa (o realizar ecocardiograma transesofágico para descartar trombo en orejuela) y continuar anticoagulado por al menos 4 semanas post-cardioversión.</li>
</ul>
"""},

  {"type": "rapid_check", "id": "rc-arr1",
   "question": "Paciente de 65 años, hipertenso, acude a urgencias por palpitaciones de 3 horas de evolución. ECG confirma FA con respuesta ventricular de 135 lpm. PA: 135/85 mmHg. No presenta dolor torácico ni disnea. ¿Cuál es el manejo de primera línea?",
   "options": ["A. Cardioversión eléctrica inmediata con 200 J", "B. Iniciar Amiodarona 150 mg IV para cardioversión farmacológica", "C. Controlar frecuencia cardíaca con Betabloqueadores e iniciar Heparina para evaluar cardioversión", "D. Anticoagulación con warfarina y control en 3 semanas", "E. Administrar Adenosina 6 mg IV rápido"],
   "correct": "C",
   "wrong_hint": "El paciente está hemodinámicamente estable (PA conservada, sin signos de shock o isquemia), por lo que la cardioversión eléctrica de urgencia no está indicada. Al llevar menos de 48 horas de evolución, se puede plantear cardioversión tras iniciar anticoagulación transitoria con heparina y controlar la respuesta ventricular con betabloqueadores. La adenosina se usa en TPSV, no en FA."},

  {"type": "text", "html": """
<h3>Bradiarritmias y Taquiarritmias Supraventriculares</h3>
<p>Las bradiarritmias y bloqueos de conducción requieren una evaluación de su estabilidad y nivel de bloqueo. Las taquiarritmias de complejo angosto (QRS &lt; 120 ms) sugieren origen supraventricular.</p>
<ul>
<li><strong>Bloqueo AV de primer grado:</strong> Prolongación del PR &gt; 200 ms. Todos los PR conducen. Benigno, manejo observacional.</li>
<li><strong>Bloqueo AV de segundo grado Mobitz I (Wenckebach):</strong> El PR se prolonga progresivamente hasta que una onda P no conduce. Generalmente benigno.</li>
<li><strong>Bloqueo AV de segundo grado Mobitz II:</strong> El PR es constante, pero súbitamente una onda P no conduce. Alto riesgo de progresión a bloqueo completo. Requiere <strong>marcapasos definitivo</strong>.</li>
<li><strong>Bloqueo AV completo (Tercer Grado):</strong> Disociación auriculoventricular completa. Las P y los QRS van cada uno por su lado. Frecuencia cardíaca baja y regular. Requiere <strong>marcapasos definitivo</strong>.</li>
<li><strong>Taquicardia Paroxística Supraventricular (TPSV):</strong> Taquicardia regular de complejo angosto, FC 150-220 lpm.
  <ul>
    <li>Estable: 1ª línea: <strong>Maniobras vagales</strong> (masaje carotídeo, Valsalva). 2ª línea: <strong>Adenosina 6-12 mg IV en bolo rápido</strong>.</li>
    <li>Inestable: <strong>Cardioversión eléctrica sincronizada</strong>.</li>
  </ul>
</li>
</ul>
"""},

  {"type": "rapid_check", "id": "rc-arr2",
   "question": "Paciente de 32 años presenta palpitaciones de inicio súbito. Al ECG se observa taquicardia regular a 180 lpm con QRS estrecho y ondas P no visibles. Su PA es 120/75 mmHg. Se le solicita realizar maniobra de Valsalva modificada sin éxito. ¿Cuál es el siguiente paso terapéutico de elección?",
   "options": ["A. Cardioversión eléctrica con 100 J", "B. Amiodarona 300 mg IV a pasar en 30 minutos", "C. Adenosina 6 mg IV en bolo rápido", "D. Verapamilo 5 mg IV", "E. Digoxina 0.5 mg IV"],
   "correct": "C",
   "wrong_hint": "Paciente con TPSV hemodinámicamente estable en quien fallaron las maniobras vagales: la terapia farmacológica de elección es la adenosina en bolo IV rápido (debido a su vida media ultracorta de segundos). La cardioversión eléctrica se reserva para inestabilidad hemodinámica."},
],

# ─────────────────────────────────────────────────────────────────────────
"valvulopatias": [
  {"type": "text", "html": """
<h3>Valvulopatías Aórtica y Mitral</h3>
<p>Las valvulopatías se evalúan clínicamente mediante la semiología de sus soplos y se confirman con <strong>ecocardiografía</strong>. Las indicaciones de cirugía de reemplazo valvular dependen de la severidad y los síntomas.</p>
<table>
<thead><tr><th>Valvulopatía</th><th>Tipo de Soplo Semiológico</th><th>Clínica Clave y Hallazgos</th></tr></thead>
<tbody>
<tr><td><strong>Estenosis Aórtica (EA)</strong></td><td>Soplo sistólico eyectivo, áspero, con <strong>irradiación a carótidas</strong>. Pulso parvus et tardus.</td><td>Tríada clásica de gravedad: <strong>Angina, Síncope y Disnea (IC)</strong>. Desdoblamiento paradójico de S2.</td></tr>
<tr><td><strong>Insuficiencia Aórtica (IA)</strong></td><td>Soplo diastólico decreciente en borde esternal izquierdo.</td><td>Presión de pulso amplia (divergente), pulso saltón (de Corrigan), soplo de Austin Flint.</td></tr>
<tr><td><strong>Estenosis Mitral (EM)</strong></td><td>Rolido diastólico con chasquido de apertura en foco mitral.</td><td>Asociación muy fuerte a <strong>Fiebre Reumática</strong> e inicio de <strong>Fibrilación Auricular</strong> por dilatación auricular izquierda. Signos de congestión pulmonar.</td></tr>
<tr><td><strong>Insuficiencia Mitral (IM)</strong></td><td>Soplo holosistólico en foco mitral, irradiado a axila.</td><td>Causa aguda: rotura de músculo papilar post-IAM o endocarditis. Causa crónica: mixomatosa, funcional.</td></tr>
</tbody>
</table>
<p>⚠️ <strong>Regla de oro del soplo sistólico eyectivo en el adulto mayor:</strong> Sospechar Estenosis Aórtica. Si el paciente presenta síncope o disnea, la sobrevida media cae drásticamente a menos de 2-3 años si no se realiza reemplazo valvular quirúrgico o TAVI.</p>
"""},

  {"type": "rapid_check", "id": "rc-val1",
   "question": "Paciente de 76 años, consulta por un episodio de síncope al subir una escalera. Al examen físico se ausculta un soplo sistólico eyectivo grado III/VI en el segundo espacio intercostal derecho que se irradia a los vasos del cuello, con un segundo ruido disminuido. ¿Cuál es la conducta más adecuada ante este paciente?",
   "options": ["A. Indicar test de esfuerzo para evaluar capacidad funcional", "B. Solicitar ecocardiograma y evaluar reemplazo valvular quirúrgico", "C. Iniciar tratamiento con betabloqueadores y controlar en 6 meses", "D. Solicitar Holter de ritmo de 24 horas y dar de alta", "E. Iniciar tratamiento con vasodilatadores como nifedipino"],
   "correct": "B",
   "wrong_hint": "El paciente presenta síncope secundario a una Estenosis Aórtica severa sintomática (soplo eyectivo irradiado a carótidas, síncope de esfuerzo). El test de esfuerzo está absolutamente contraindicado por riesgo de muerte súbita. El manejo de elección es la confirmación ecocardiográfica urgente y la derivación para reemplazo valvular."},

  {"type": "text", "html": """
<h3>Cardiopatías Congénitas en el Adulto</h3>
<p>Las cardiopatías congénitas son patologías diagnosticadas frecuentemente en la infancia, pero algunas pueden debutar clínicamente en la edad adulta.</p>
<ul>
<li><strong>Comunicación Interauricular (CIA):</strong> La cardiopatía congénita más frecuente que debuta en el adulto.
  <ul>
    <li>Clínica: <strong>Soplo sistólico de eyección pulmonar</strong> (por hiperflujo pulmonar funcional) asociado a un característico <strong>desdoblamiento fijo del segundo ruido (S2)</strong>.</li>
    <li>Complicación a largo plazo: Hipertensión pulmonar, insuficiencia cardíaca derecha y arritmias auriculares (FA).</li>
  </ul>
</li>
<li><strong>Comunicación Interventricular (CIV):</strong> Soplo <strong>holosistólico (pansistólico)</strong> áspero de alta intensidad en el borde esternal izquierdo inferior, que suele acompañarse de frémito.</li>
<li><strong>Ductus Arterioso Persistente (DAP):</strong> Soplo continuo <strong>\"en maquinaria de Gibson\"</strong> (sistodiastólico) audible en el foco pulmonar e infraclavicular izquierdo.</li>
<li><strong>Coartación Aórtica:</strong> HTA en extremidades superiores con **pulsos femorales disminuidos y retrasados** con respecto al pulso radial. Rx de tórax muestra el signo de Roesler (muescas costales).</li>
</ul>
"""},

  {"type": "rapid_check", "id": "rc-val2",
   "question": "Un joven de 19 años es evaluado en control médico de rutina. Se ausculta un soplo sistólico de eyección en foco pulmonar y un segundo ruido cardíaco que presenta un desdoblamiento constante y fijo durante la inspiración y la espiración. El paciente se encuentra asintomático. ¿Cuál es el diagnóstico de sospecha?",
   "options": ["A. Estenosis aórtica severa", "B. Comunicación interventricular", "C. Comunicación interauricular", "D. Persistencia del ductus arterioso", "E. Coartación aórtica"],
   "correct": "C",
   "wrong_hint": "El desdoblamiento fijo del segundo ruido (S2) en un paciente joven es patognomónico de la Comunicación Interauricular (CIA). El soplo sistólico es eyectivo en foco pulmonar debido al aumento de flujo a través de la válvula pulmonar normal."},
],

# ─────────────────────────────────────────────────────────────────────────
"pericardio-infeccion": [
  {"type": "text", "html": """
<h3>Pericarditis Aguda y Taponamiento Cardíaco</h3>
<p>La pericarditis aguda es la inflamación del saco pericárdico, frecuentemente de etiología viral. El taponamiento cardíaco es la compresión del corazón debida a la acumulación de líquido en el espacio pericárdico, comprometiendo el retorno venoso y el gasto cardíaco.</p>
<table>
<thead><tr><th>Patología</th><th>Diagnóstico Clínico / Examen</th><th>Electrocardiograma o Signo Clave</th><th>Conducta y Tratamiento</th></tr></thead>
<tbody>
<tr><td><strong>Pericarditis Aguda</strong></td><td>Dolor torácico pleurítico que alivia al inclinarse hacia adelante (plegaria mahometana) + **Frote pericárdico**.</td><td><strong>Supradesnivel del ST difuso con concavidad hacia arriba</strong> (cara de emoticón feliz 😃) e infradesnivel del segmento PR.</td><td>AINEs (Ibuprofeno/Aspirina a dosis altas) asociados a **Colquicina** para prevenir recurrencias.</td></tr>
<tr><td><strong>Taponamiento Cardíaco</strong></td><td>Disnea severa + hipotensión + shock obstructivo.</td><td><strong>Tríada de Beck:</strong> Hipotensión + Ruidos cardíacos apagados + Ingurgitación yugular. Alternancia eléctrica en el ECG.</td><td><strong>Punción pericárdica (pericardiocentesis) de urgencia</strong>. Expansión de volumen transitoria con suero fisiológico.</td></tr>
</tbody>
</table>
"""},

  {"type": "rapid_check", "id": "rc-per1",
   "question": "Paciente de 24 años consulta por dolor retroesternal punzante que aumenta con la inspiración profunda y al acostarse de espaldas, y que disminuye al sentarse e inclinarse hacia adelante. ECG muestra supradesnivel del segmento ST cóncavo en casi todas las derivadas excepto aVR y V1, e infradesnivel del PR. ¿Cuál es el tratamiento de primera línea?",
   "options": ["A. Angioplastia coronaria de urgencia", "B. Trombolisis con Alteplasa", "C. Ibuprofeno a dosis altas + Colquicina", "D. Prednisona oral 1 mg/kg/día", "E. Pericardiocentesis guiada por ecocardiografía"],
   "correct": "C",
   "wrong_hint": "La clínica (dolor pleurítico posicional) y los hallazgos electrocardiográficos (ST difuso cóncavo y PR descendido) son típicos de Pericarditis Aguda. El tratamiento de primera línea es la asociación de un AINE (como ibuprofeno o aspirina) y colquicina para reducir la inflamación y evitar las recidivas. Los corticoides se reservan para casos refractarios o autoinmunes."},

  {"type": "text", "html": """
<h3>Endocarditis Infecciosa y Fiebre Reumática</h3>
<p>La endocarditis infecciosa (EI) es la infección del endotelio cardíaco, afectando principalmente a las válvulas. La fiebre reumática (FR) es una secuela no supurativa de una faringoamigdalitis por Streptococo betahemolítico del grupo A.</p>
<ul>
<li><strong>Endocarditis Infecciosa:</strong>
  <ul>
    <li>Clínica: Fiebre de origen desconocido + **soplo cardíaco nuevo o cambiante**. Fenómenos embólicos (nódulos de Osler, manchas de Janeway, hemorragias en astilla, manchas de Roth en retina).</li>
    <li>Diagnóstico: **Criterios de Duke** (Mayores: Hemocultivos positivos típicos y Ecocardiograma con vegetación o insuficiencia valvular nueva).</li>
    <li>Etiología: *S. aureus* (frecuente en usuarios de drogas endovenosas o agudo), *S. viridans* (subagudo post-procedimientos dentales).</li>
  </ul>
</li>
<li><strong>Fiebre Reumática Activa:</strong>
  <ul>
    <li>Clínica: **Criterios de Jones** (Mayores: Carditis, Poliartritis migratoria, Corea de Sydenham, Eritema marginado, Nódulos subcutáneos).</li>
    <li>Prevención primaria: Tratamiento oportuno de faringoamigdalitis bacteriana con **Penicilina benzatina**.</li>
    <li>Prevención secundaria: Penicilina benzatina mensual para evitar recidivas que dañen permanentemente las válvulas (causa #1 de estenosis mitral).</li>
  </ul>
</li>
</ul>
"""},

  {"type": "rapid_check", "id": "rc-per2",
   "question": "Un paciente de 45 años con antecedente de válvula aórtica bicúspide presenta fiebre de hasta 38.5 °C de 2 semanas de evolución asociada a compromiso del estado general. Al examen físico se ausculta un soplo de regurgitación aórtica que no estaba documentado previamente. ¿Cuál es el primer paso diagnóstico más adecuado ante la sospecha clínica?",
   "options": ["A. Tomar hemocultivos (3 sets de sitios diferentes) y solicitar ecocardiograma", "B. Iniciar antibioterapia empírica con Vancomicina + Ceftriaxona", "C. Solicitar PCR y VHS e iniciar AINEs", "D. Solicitar TAC de tórax con contraste", "E. Realizar punción lumbar para descartar bacteriemia"],
   "correct": "A",
   "wrong_hint": "Ante la sospecha clínica de Endocarditis Infecciosa (fiebre + soplo nuevo), el primer paso fundamental y obligatorio antes de iniciar cualquier antibiótico es la toma de al menos 3 sets de hemocultivos periféricos separados en el tiempo y el espacio, asociado a la solicitud de un ecocardiograma (inicialmente transtorácico)."},
],

# ─────────────────────────────────────────────────────────────────────────
"urgencias-reanimacion": [
  {"type": "text", "html": """
<h3>Paro Cardiorrespiratorio (PCR) y Desfibrilación</h3>
<p>El manejo del PCR se basa en el Soporte Vital Cardiovascular Avanzado (ACLS). La clave es el reconocimiento rápido, compresiones de alta calidad y la identificación del ritmo de paro.</p>
<table>
<thead><tr><th>Ritmo de Paro</th><th>Tipo de Ritmo</th><th>Manejo Inmediato</th><th>Terapia Farmacológica</th></tr></thead>
<tbody>
<tr><td><strong>⚡ Fibrilación Ventricular (FV) / TV sin pulso</strong></td><td>Desfibrilable</td><td><strong>Descarga inmediata (desfibrilación)</strong> + continuar RCP 2 min.</td><td>Adrenalina 1 mg cada 3-5 min (post 2ª descarga) + Amiodarona 300 mg (post 3ª descarga).</td></tr>
<tr><td><strong>🛑 Asistolia / Actividad Eléctrica Sin Pulso (AESP)</strong></td><td>No Desfibrilable</td><td><strong>RCP de alta calidad inmediato</strong> + buscar y tratar causas reversibles.</td><td>Adrenalina 1 mg IV/IO lo antes posible, repetir cada 3-5 min.</td></tr>
</tbody>
</table>
<p><strong>Causas reversibles de PCR (5 H y 5 T):</strong></p>
<ul>
<li><strong>H:</strong> Hipovolemia, Hipoxia, Hidrogeniones (acidosis), Hipo/Hiperkalemia, Hipotermia.</li>
<li><strong>T:</strong> Tensión (neumotórax a tensión), Taponamiento cardíaco, Toxinas, Trombosis pulmonar (TEP), Trombosis coronaria (IAM).</li>
</ul>
"""},

  {"type": "rapid_check", "id": "rc-urg1",
   "question": "Durante la monitorización de un paciente en paro cardiorrespiratorio en curso de RCP, el monitor muestra un ritmo desorganizado, caótico, con ondas de amplitud y frecuencia variables, sin complejos QRS definidos. El reanimador comprueba que no hay pulso. ¿Cuál es el tratamiento inmediato de elección?",
   "options": ["A. Administrar Adrenalina 1 mg IV directo", "B. Realizar cardioversión eléctrica sincronizada con 100 J", "C. Administrar Amiodarona 300 mg IV", "D. Descarga no sincronizada (desfibrilación) con 200 J (bifásico)", "E. Realizar intubación endotraqueal inmediata"],
   "correct": "D",
   "wrong_hint": "El ritmo descrito es una Fibrilación Ventricular (FV), que es un ritmo desfibrilable. La medida más importante que determina la sobrevida en FV es la desfibrilación eléctrica precoz no sincronizada a máxima energía (200 J en bifásico o 360 J en monofásico). La adrenalina se administra después de la segunda descarga si persiste el paro."},

  {"type": "text", "html": """
<h3>Disección Aórtica y Embolia Pulmonar (TEP)</h3>
<p>Dos emergencias vasculares de alta mortalidad que requieren un diagnóstico rápido y diferenciado.</p>
<ul>
<li><strong>Disección Aórtica:</strong> Desgarro de la íntima aórtica.
  <ul>
    <li>Clínica: Dolor torácico o interescapular súbito, **desgarrador / lancinante**, de máxima intensidad al inicio. Diferencia de presión arterial &gt; 20 mmHg entre extremidades o asimetría de pulsos.</li>
    <li>Diagnóstico de elección: **AngioTAC de tórax y aorta**.</li>
    <li>Clasificación de Stanford: **Tipo A** (afecta aorta ascendente, tratamiento **quirúrgico urgente**), **Tipo B** (aorta descendente, tratamiento **médico con control estricto de PA y FC** usando Labetalol endovenoso).</li>
  </ul>
</li>
<li><strong>Tromboembolismo Pulmonar (TEP):</strong> Oclusión embólica de la vasculatura arterial pulmonar.
  <ul>
    <li>Clínica: Disnea súbita + dolor torácico pleurítico + taquicardia. Signo de TVP en extremidad inferior.</li>
    <li>Diagnóstico: Si inestable, ecocardiograma a la cabecera (signos de sobrecarga VD). Si estable: evaluar probabilidad con Score de Wells. Wells bajo → Dímero D. Wells moderado/alto → **AngioTAC de tórax**.</li>
    <li>Tratamiento: Anticoagulación con Heparina en paciente estable. Si **TEP Masivo (inestabilidad hemodinámica / shock)** → **Trombolisis con rtPA (Alteplasa)** de urgencia.</li>
  </ul>
</li>
</ul>
"""},

  {"type": "rapid_check", "id": "rc-urg2",
   "question": "Paciente de 54 años consulta por dolor interescapular de inicio súbito, descrito como lancinante y extremadamente intenso. Al examen físico destaca PA de 190/110 mmHg en el brazo derecho y 155/90 mmHg en el brazo izquierdo. ECG sin signos de isquemia. ¿Cuál es el diagnóstico de sospecha y el examen de elección para confirmarlo?",
   "options": ["A. IAMCEST - Coronariografía de urgencia", "B. Tromboembolismo pulmonar - AngioTAC de tórax", "C. Disección aórtica - AngioTAC de tórax y aorta", "D. Pericarditis aguda - Ecocardiograma transtorácico", "E. Rotura esofágica - Endoscopía digestiva alta"],
   "correct": "C",
   "wrong_hint": "La presentación clínica de dolor desgarrador súbito con asimetría de presión arterial entre ambos brazos (>20 mmHg de diferencia sistólica) es altamente sugerente de una Disección Aórtica. El examen diagnóstico estándar de elección es el AngioTAC de tórax y aorta."},
],

}
