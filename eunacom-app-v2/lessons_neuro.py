"""
Didactic lesson blocks for Neurología y Geriatría (Módulo 1).
Each block:
  {"type": "text", "html": "..."}
  {"type": "rapid_check", "id": "...", "question": "...", "options": [...],
   "correct": "A-E", "wrong_hint": "..."}
"""

LESSONS = {

# ─────────────────────────────────────────────────────────────────────────
"acv-stroke": [
  {"type": "text", "html": """
<h3>ACV isquémico: la ventana terapéutica lo es todo</h3>
<p>El ACV isquémico es la emergencia neurológica más importante del EUNACOM. El manejo depende completamente del tiempo transcurrido desde el inicio de los síntomas.</p>
<table>
<thead><tr><th>Tiempo desde inicio</th><th>Conducta</th><th>Examen clave</th></tr></thead>
<tbody>
<tr><td><strong>&lt; 4,5 horas</strong></td><td>🟢 Trombolisis IV con rtPA (alteplasa)</td><td>TC cerebral sin contraste para descartar hemorragia</td></tr>
<tr><td><strong>4,5 – 24 horas</strong></td><td>🟡 Evaluar trombectomía mecánica si oclusión de gran vaso</td><td>RM o TC perfusión</td></tr>
<tr><td><strong>&gt; 24 horas</strong></td><td>🔴 No trombolizar. Antiagregación + estatinas + control FRCV</td><td>RM cerebral + estudio etiológico</td></tr>
</tbody>
</table>
<p><strong>Contraindicaciones absolutas de trombolisis:</strong></p>
<ul>
<li>TC con hemorragia activa (el más importante)</li>
<li>Cirugía o trauma mayor en últimas 3 semanas</li>
<li>ACV previo + DM combinados</li>
<li>PA &gt;185/110 que no cede</li>
<li>Anticoagulación activa (INR &gt;1,7)</li>
<li>Plaquetas &lt;100.000</li>
</ul>
<p>Truco: <strong>primero pide TC sin contraste</strong>. Si hay sangre = no trombolizas. Si no hay sangre + ventana &lt;4,5h = trombolizas.</p>
"""},

  {"type": "rapid_check", "id": "rc-acv1",
   "question": "Paciente de 64 años, hipertensa, llega a urgencias con hemiparesia faciobraquiocrural izquierda de 2 horas de evolución. PA 170/100. TC cerebral sin contraste: sin hemorragia. ¿Conducta inmediata?",
   "options": ["A. Aspirina 300 mg oral stat", "B. Trombolisis IV con rtPA", "C. Anticoagulación con heparina IV", "D. RM cerebral urgente antes de decidir", "E. Observar y repetir TC en 24 horas"],
   "correct": "B",
   "wrong_hint": "Ventana &lt;4,5h + TC sin hemorragia + déficit neurológico establecido = TROMBOLISIS con rtPA. La PA de 185/110 es el límite — 170/100 permite trombolizar. La aspirina no es el tratamiento agudo del ACV isquémico en ventana. La RM no es necesaria si el TC descartó hemorragia y la clínica es clara. No hay tiempo que perder."},

  {"type": "text", "html": """
<h3>ACV isquémico vs hemorrágico: cómo diferenciarlos y manejarlos</h3>
<table>
<thead><tr><th>Característica</th><th>🔵 ACV Isquémico</th><th>🔴 ACV Hemorrágico</th></tr></thead>
<tbody>
<tr><td><strong>Causa más frecuente</strong></td><td>Embolismo o trombosis</td><td>HTA crónica (causa #1)</td></tr>
<tr><td><strong>Inicio</strong></td><td>Brusco, máximo al inicio</td><td>Brusco, puede progresar</td></tr>
<tr><td><strong>Cefalea</strong></td><td>Ausente o leve</td><td>Intensa (frecuente)</td></tr>
<tr><td><strong>TC sin contraste</strong></td><td>Normal primeras horas (o hipodensidad)</td><td>Hiperdensidad (blanco = sangre)</td></tr>
<tr><td><strong>Trombolisis</strong></td><td>Sí (si ventana &lt;4,5h)</td><td>CONTRAINDICADA</td></tr>
<tr><td><strong>Control PA</strong></td><td>No reducir bruscamente (&lt;185/110 para tto)</td><td>Reducir agresivamente (&lt;140)</td></tr>
<tr><td><strong>Anticoagulación</strong></td><td>Según etiología (FA → ACO)</td><td>Contraindicada inicialmente</td></tr>
</tbody>
</table>
<p>La <strong>causa más frecuente de ACV hemorrágico</strong> en adultos es la <strong>HTA</strong>. Los ganglios basales (putamen) es la ubicación más frecuente del hematoma hipertensivo.</p>
"""},

  {"type": "rapid_check", "id": "rc-acv2",
   "question": "Paciente de 70 años, hipertenso mal controlado. ACV hace 10 días. Estudio demuestra FA paroxística como causa. ¿Conducta terapéutica a largo plazo?",
   "options": ["A. Aspirina 100 mg indefinida", "B. Clopidogrel 75 mg indefinido", "C. Anticoagulación oral (warfarina o NOAC)", "D. Doble antiagregación aspirina + clopidogrel", "E. No requiere tratamiento crónico"],
   "correct": "C",
   "wrong_hint": "ACV isquémico de origen cardioembólico por FA = anticoagulación oral indefinida (warfarina con INR 2-3, o preferiblemente un NOAC como rivaroxabán o apixabán). La antiagregación es para ACV aterotrombótico, NO para FA. La doble antiagregación no tiene indicación en FA. El riesgo de recurrencia en FA sin anticoagulación es muy alto."},

  {"type": "text", "html": """
<h3>Hemorragia subaracnoidea (SAH): la cefalea que no debes perder</h3>
<p>La SAH es la emergencia que más se diagnostica tarde — y cuando se pierde, el paciente puede morir de la segunda hemorragia.</p>
<p><strong>Presentación clásica:</strong> "La peor cefalea de mi vida", de inicio súbito, "en trueno" (thunderclap headache), que alcanza el máximo en segundos. Puede tener vómitos, rigidez de nuca, pérdida transitoria de conciencia.</p>
<p><strong>Algoritmo diagnóstico:</strong></p>
<table>
<thead><tr><th>Paso</th><th>Examen</th><th>Resultado esperable</th></tr></thead>
<tbody>
<tr><td>1</td><td>TC cerebral sin contraste</td><td>Hiperdensidad en cisternas basales (sangre). Sensibilidad 98% en primeras 12h, baja a 85-90% a las 24h</td></tr>
<tr><td>2 (si TC negativo)</td><td>Punción lumbar</td><td>LCR xantocrómico (amarillo) + GR que NO se aclaran entre tubos 1 y 4</td></tr>
<tr><td>3 (si SAH confirmada)</td><td>Angiografía cerebral o AngioTC</td><td>Aneurisma (causa #1 de SAH no traumática)</td></tr>
</tbody>
</table>
<p>Truco: si TC es negativo y la sospecha es alta, <strong>NO descartas SAH sin hacer punción lumbar</strong>. Un TC negativo dentro de las 6-12h es muy sensible, pero NO 100%.</p>
"""},

  {"type": "rapid_check", "id": "rc-acv3",
   "question": "Mujer de 35 años, sin antecedentes, consulta por cefalea súbita 'la más intensa de su vida', que alcanzó máxima intensidad en segundos. TC cerebral sin contraste: NORMAL. ¿Conducta?",
   "options": ["A. Alta con analgésicos — la TC descartó la causa grave", "B. RM cerebral urgente", "C. Punción lumbar para buscar xantocromía", "D. EEG urgente", "E. Triptán y control en 48h"],
   "correct": "C",
   "wrong_hint": "TC normal NO descarta SAH. La sensibilidad del TC baja con el tiempo (a las 24h puede ser 85%). Ante cefalea en trueno, si el TC es negativo el SIGUIENTE paso OBLIGATORIO es punción lumbar para buscar xantocromía (LCR amarillo) o eritrocitos que no se aclaran. Un triptán puede aliviar el dolor pero enmascara el diagnóstico. Esta es la trampa clásica del EUNACOM: no alta con TC negativo."},

  {"type": "text", "html": """
<h3>Hematoma subdural vs epidural: la tabla de los traumas</h3>
<table>
<thead><tr><th>Característica</th><th>🟡 Hematoma Epidural</th><th>🔵 Hematoma Subdural</th></tr></thead>
<tbody>
<tr><td><strong>Vaso comprometido</strong></td><td>Arteria meníngea media</td><td>Venas puente (bridging veins)</td></tr>
<tr><td><strong>Mecanismo</strong></td><td>Fractura temporal + trauma</td><td>Trauma (o mínimo en anciano)</td></tr>
<tr><td><strong>Imagen TC</strong></td><td>Lente biconvexa (no cruza suturas)</td><td>Medialuna cóncava (cruza suturas)</td></tr>
<tr><td><strong>Lúcido intervalo</strong></td><td>Sí (clásico: pierde conciencia → mejora → deteriora)</td><td>No (o subagudo en anciano)</td></tr>
<tr><td><strong>Población afectada</strong></td><td>Jóvenes con trauma directo</td><td>Ancianos (trauma mínimo, ACO)</td></tr>
<tr><td><strong>Urgencia</strong></td><td>Extrema (arterial)</td><td>Alta (puede ser crónico)</td></tr>
</tbody>
</table>
<p><strong>Truco del anciano con subdural crónico:</strong> adulto mayor que toma anticoagulantes o que tuvo un trauma banal hace 2-4 semanas y ahora tiene cefalea + confusión progresiva. TC: imagen hipodensa (crónica) o hiperdensa (aguda) en forma de medialuna.</p>
"""},

  {"type": "rapid_check", "id": "rc-acv4",
   "question": "Hombre de 22 años sufre traumatismo craneal en partido de fútbol. Pierde conciencia brevemente, luego está lúcido 30 minutos. Después deteriora progresivamente con anisocoria. ¿Diagnóstico?",
   "options": ["A. Conmoción cerebral simple", "B. Hematoma subdural agudo", "C. Hematoma epidural", "D. Hemorragia subaracnoidea traumática", "E. Contusión cerebral"],
   "correct": "C",
   "wrong_hint": "El 'lúcido intervalo' (pérdida → mejoría → deterioro) es PATOGNOMÓNICO del hematoma EPIDURAL. La arteria meníngea media sangra rápido (arterial), pero al principio el hematoma no es lo suficientemente grande para causar efecto de masa. Al crecer, comprime el lóbulo temporal y el nervio motor ocular común → anisocoria (herniación uncal). Es una emergencia neuroquirúrgica."},

  {"type": "text", "html": """
<h3>TIA: la emergencia silenciosa</h3>
<p>El AIT (Ataque Isquémico Transitorio) es un déficit neurológico focal que se resuelve completamente en &lt;24h (generalmente &lt;1h) sin lesión en imagen. El peligro real: <strong>el riesgo de ACV completo en los siguientes 2-7 días es del 10-15%</strong> — por eso es una urgencia igual que el ACV.</p>
<p>Estudio urgente del TIA (las 48h siguientes):</p>
<ul>
<li>TC o RM cerebral (descartar ACV establecido pequeño)</li>
<li>Eco doppler carotídeo (descartar estenosis carotídea &gt;70%)</li>
<li>Holter 24-48h (buscar FA paroxística)</li>
<li>Ecocardiograma (fuente cardioembólica)</li>
<li>Laboratorio: glicemia, hemograma, coagulación, lípidos</li>
</ul>
<p>Tratamiento inmediato: <strong>aspirina 300 mg stat</strong> (si no está anticoagulado). A largo plazo según causa.</p>
"""},
],

# ─────────────────────────────────────────────────────────────────────────
"cefalea": [
  {"type": "text", "html": """
<h3>Las 4 cefaleas que debes conocer de memoria</h3>
<p>El EUNACOM te da un caso clínico y tienes que identificar el tipo de cefalea por sus características. Esta tabla es tu guía rápida:</p>
<table>
<thead><tr><th>Característica</th><th>🟣 Migraña</th><th>🔴 Cluster</th><th>🟡 Tensional</th><th>⚡ SAH</th></tr></thead>
<tbody>
<tr><td><strong>Localización</strong></td><td>Unilateral (70%)</td><td>Periocular unilateral</td><td>Bilateral, "en casco"</td><td>Holocraneana</td></tr>
<tr><td><strong>Calidad</strong></td><td>Pulsátil, palpitante</td><td>Punzante, penetrante</td><td>Opresiva, "presión"</td><td>Explosiva, "trueno"</td></tr>
<tr><td><strong>Duración</strong></td><td>4–72 horas</td><td>15–180 minutos</td><td>30 min – 7 días</td><td>Horas–días (si sobrevive)</td></tr>
<tr><td><strong>Síntomas acompañantes</strong></td><td>Náuseas, foto/fonofobia, aura</td><td>Lagrimeo, rinorrea, miosis (autonómicos)</td><td>Sin náuseas, no fotofobia intensa</td><td>Vómitos, rigidez nuca, pérdida conciencia</td></tr>
<tr><td><strong>Quién la tiene</strong></td><td>Mujer joven (3:1)</td><td>Hombre joven (3:1)</td><td>Cualquiera, estrés</td><td>Cualquiera, sin aviso</td></tr>
<tr><td><strong>Tratamiento agudo</strong></td><td>Triptanes, AINEs</td><td>O₂ 100% + sumatriptán SC</td><td>AINEs, paracetamol</td><td>Neurocirugía urgente</td></tr>
</tbody>
</table>
"""},

  {"type": "rapid_check", "id": "rc-cef1",
   "question": "Hombre de 33 años consulta por episodios de dolor intenso periocular izquierdo de 30 minutos, con lagrimeo y rinorrea ipsilateral, que ocurren todos los días a la misma hora durante 6 semanas. ¿Diagnóstico?",
   "options": ["A. Migraña con aura", "B. Neuralgia del trigémino", "C. Cefalea en racimos (cluster)", "D. Cefalea tensional", "E. Sinusitis aguda"],
   "correct": "C",
   "wrong_hint": "El perfil es clásico de cefalea en racimos: hombre joven, dolor periocular UNILATERAL, síntomas autonómicos ipsilaterales (lagrimeo + rinorrea), duración 15-180 min, y la característica más llamativa — episodios en 'racimos' que ocurren a la misma hora del día por semanas. El tratamiento de la crisis es O₂ al 100% (alta tasa de flujo) + sumatriptán SC."},

  {"type": "text", "html": """
<h3>Migraña: tratamiento de la crisis y profilaxis</h3>
<p>El tratamiento de la migraña tiene dos pilares que el EUNACOM pregunta por separado:</p>
<table>
<thead><tr><th></th><th>Tratamiento de la CRISIS</th><th>Tratamiento PROFILÁCTICO</th></tr></thead>
<tbody>
<tr><td><strong>Indicación</strong></td><td>Cada episodio agudo</td><td>≥3 crisis/mes o crisis incapacitantes</td></tr>
<tr><td><strong>Primera línea</strong></td><td>Triptanes (sumatriptán) + AINES</td><td>Propranolol (1ª elección), Amitriptilina, Topiramato, Valproato</td></tr>
<tr><td><strong>Segunda línea</strong></td><td>Ergotamina (ojo: contraindicada en embarazo, vasculopatía)</td><td>Flunarizina, Verapamilo</td></tr>
<tr><td><strong>Evitar en embarazo</strong></td><td>Ergotamina, triptanes</td><td>Valproato (teratogénico)</td></tr>
</tbody>
</table>
<p>La trampa del EUNACOM con profilaxis: te preguntan cuál NO es profiláctico de migraña. La respuesta es <strong>la morfina/opioides</strong> — no tienen ningún rol en profilaxis. Los profilácticos reales son los beta-bloqueadores, antidepresivos tricíclicos y antiepilépticos.</p>
"""},

  {"type": "rapid_check", "id": "rc-cef2",
   "question": "¿Cuál de los siguientes medicamentos NO es útil como tratamiento PROFILÁCTICO de la jaqueca (migraña)?",
   "options": ["A. Propranolol", "B. Amitriptilina", "C. Valproato de sodio", "D. Tramadol", "E. Topiramato"],
   "correct": "D",
   "wrong_hint": "Los profilácticos de migraña son: propranolol (β-bloqueador, 1ª elección), amitriptilina (tricíclico), valproato (antiepiléptico), topiramato (antiepiléptico), flunarizina (bloqueador calcio). Los opioides/tramadol NO tienen rol profiláctico y además pueden causar cefalea de rebote por uso excesivo de analgésicos. Esta es la respuesta falsa clásica que pone el EUNACOM."},

  {"type": "text", "html": """
<h3>Neuralgias: trigémino y occipital</h3>
<p>La <strong>neuralgia del trigémino</strong> (tic doloroso) es el dolor facial más intenso conocido. Características que debes memorizar:</p>
<ul>
<li>Dolor <strong>eléctrico, en descarga</strong>, de <strong>segundos de duración</strong></li>
<li>Territorio trigeminal (mejilla, mandíbula, frente — ramas V2 y V3 más frecuentes)</li>
<li><strong>Puntos gatillo</strong> desencadenantes: masticar, hablar, tocar la mejilla</li>
<li>Sin déficit neurológico (si hay → buscar causa secundaria: tumor, EM)</li>
<li><strong>Tratamiento de elección: carbamazepina</strong></li>
</ul>
<p>Diferencia con cefalea en racimos: el cluster dura minutos y tiene síntomas autonómicos. La neuralgia del trigémino dura segundos y tiene puntos gatillo táctiles.</p>
"""},

  {"type": "rapid_check", "id": "rc-cef3",
   "question": "Paciente de 48 años, dolor intenso en mejilla derecha de segundos de duración, recurrente, que se desencadena al masticar. Sin déficit neurológico. ¿Diagnóstico y tratamiento?",
   "options": ["A. Cefalea en racimos — O₂ + sumatriptán", "B. Migraña — triptanes", "C. Neuralgia del trigémino — carbamazepina", "D. ATM — antiinflamatorios", "E. Absceso dental — amoxicilina"],
   "correct": "C",
   "wrong_hint": "Dolor eléctrico de segundos + puntos gatillo (masticar) + territorio trigeminal = neuralgia del trigémino. El tratamiento de primera línea es carbamazepina (antiepiléptico que estabiliza membranas nerviosas). El cluster dura 15-180 minutos y tiene lagrimeo/rinorrea. El absceso dental da dolor continuo, no en descargas de segundos."},

  {"type": "text", "html": """
<h3>Cefalea por abuso de analgésicos (rebote)</h3>
<p>Trampa frecuente en el EUNACOM: paciente con cefalea crónica que toma analgésicos &gt;15 días/mes. La cefalea <em>empeora</em> con el tratamiento. ¿Qué está pasando?</p>
<p>La <strong>cefalea de rebote por sobreuso de analgésicos</strong> es una de las causas más frecuentes de cefalea crónica diaria. Los medicamentos que más la causan: triptanes, ergotamina, analgésicos combinados (con cafeína o codeína), AINEs en exceso.</p>
<p>Tratamiento: <strong>suspender el analgésico causante</strong> (puede provocar empeoramiento temporal) + iniciar profilaxis. Sin eso, ningún tratamiento funciona.</p>
"""},

  {"type": "rapid_check", "id": "rc-cef4",
   "question": "Paciente de 35 años con migraña de 10 años de evolución. En el último año toma sumatriptán más de 15 días al mes. La cefalea es ahora diaria. ¿Diagnóstico más probable?",
   "options": ["A. Migraña crónica refractaria al tratamiento", "B. Hipertensión endocraneana", "C. Cefalea por sobreuso de analgésicos (rebote)", "D. Cefalea tensional sobreañadida", "E. Tumor cerebral"],
   "correct": "C",
   "wrong_hint": "Cefalea diaria + sobreuso de analgésicos (&gt;10-15 días/mes) = cefalea de rebote. El triptán que en principio ayuda, tomado en exceso 'rebota' y genera cefalea crónica. El tratamiento es suspender el sobreuso — empeora al principio pero luego mejora. Sin suspender el analgésico, ningún profiláctico funciona."},
],

# ─────────────────────────────────────────────────────────────────────────
"epilepsia": [
  {"type": "text", "html": """
<h3>Epilepsia: el mapa de las crisis y sus fármacos</h3>
<p>La clasificación de las crisis determina el tratamiento. El EUNACOM pregunta principalmente por convulsión febril, status epilépticus, y la elección del antiepiléptico correcto.</p>
<table>
<thead><tr><th>Tipo de crisis</th><th>Características</th><th>Fármaco de elección</th></tr></thead>
<tbody>
<tr><td><strong>Tónico-clónica generalizada</strong></td><td>Todo el cuerpo, pérdida de conciencia</td><td>Valproato, carbamazepina, levetiracetam</td></tr>
<tr><td><strong>Ausencia</strong></td><td>Niño que "se queda mirando" 5-30 seg, sin aura, sin postictus</td><td>Etosuximida (1ª), valproato</td></tr>
<tr><td><strong>Crisis focal (parcial)</strong></td><td>Un territorio, puede generalizarse</td><td>Carbamazepina, lamotrigina, levetiracetam</td></tr>
<tr><td><strong>Síndrome de West (espasmos infantiles)</strong></td><td>Lactante 3-12 meses, espasmos en flexión en salvas</td><td>ACTH, vigabatrina</td></tr>
</tbody>
</table>
<p>El truco del EUNACOM: preguntan cuál antiepiléptico usar en <strong>mujer embarazada con epilepsia</strong>. La respuesta es <strong>levetiracetam</strong> o lamotrigina — el valproato es teratogénico (espina bífida). La carbamazepina también tiene riesgo. Si ya tomaba valproato, se evalúa caso a caso.</p>
"""},

  {"type": "rapid_check", "id": "rc-epi1",
   "question": "Niño de 7 años, múltiples episodios diarios de 'desconexión' de 10 segundos, sin aura, sin confusión post-ictal. EEG: punta-onda a 3 Hz. ¿Diagnóstico y tratamiento?",
   "options": ["A. Crisis focales — carbamazepina", "B. Epilepsia de ausencias — etosuximida", "C. Síndrome de West — ACTH", "D. Crisis tónico-clónicas — valproato", "E. Síncope vagal — no requiere antiepiléptico"],
   "correct": "B",
   "wrong_hint": "Desconexión breve 10s + sin aura + sin confusión post-ictal + EEG punta-onda 3Hz = epilepsia de ausencias. El fármaco de elección es etosuximida (solo para ausencias). Si hay crisis tónicas asociadas, se prefiere valproato. La carbamazepina está CONTRAINDICADA en ausencias — las puede empeorar. El síncope no tiene actividad EEG ictal."},

  {"type": "text", "html": """
<h3>Convulsión febril: no todo es epilepsia</h3>
<p>La convulsión febril afecta al 2-5% de los niños. El EUNACOM la pregunta para que sepas cuándo actuar y cuándo tranquilizar a los padres.</p>
<table>
<thead><tr><th>Característica</th><th>Convulsión Febril SIMPLE</th><th>Convulsión Febril COMPLEJA</th></tr></thead>
<tbody>
<tr><td><strong>Edad</strong></td><td>6 meses – 5 años</td><td>Cualquier edad</td></tr>
<tr><td><strong>Tipo</strong></td><td>Generalizada tónico-clónica</td><td>Focal O más de 15 min O recurrente en 24h</td></tr>
<tr><td><strong>Duración</strong></td><td>&lt;15 minutos</td><td>&gt;15 minutos</td></tr>
<tr><td><strong>Recurrencia en 24h</strong></td><td>No</td><td>Sí (si se repite = compleja)</td></tr>
<tr><td><strong>Punción lumbar</strong></td><td>No de rutina (si &gt;18 meses y buen estado general)</td><td>Considerar siempre</td></tr>
<tr><td><strong>Tratamiento</strong></td><td>Observar, controlar fiebre</td><td>Diazepam rectal + evaluar ingreso</td></tr>
</tbody>
</table>
<p>La convulsión febril simple <strong>NO requiere antiepilépticos crónicos</strong>. El riesgo de epilepsia posterior es solo ligeramente superior al de la población general. Tranquilizar a los padres y tratar la causa de la fiebre.</p>
"""},

  {"type": "rapid_check", "id": "rc-epi2",
   "question": "Niño de 13 meses, fiebre de 38,8°C, presenta convulsión tónico-clónica generalizada de 1 minuto que cede espontáneamente. Primera vez. Neurológicamente normal al recuperarse. ¿Conducta?",
   "options": ["A. Hospitalizar e iniciar antiepiléptico", "B. Punción lumbar urgente", "C. EEG urgente y TAC cerebral", "D. Controlar la fiebre y observar — convulsión febril simple", "E. Diazepam rectal de mantenimiento"],
   "correct": "D",
   "wrong_hint": "Convulsión febril SIMPLE: menor de 5 años, generalizada, &lt;15 minutos, primera vez, recuperación completa = NO requiere antiepilépticos ni PL de rutina (el niño tiene 13 meses, &gt;12 meses, y está en buen estado). La conducta es tratar la fiebre + observar + informar a los padres. La PL solo si hubiera sospecha de meningitis (rigidez de nuca, fontanela abombada, menor de 12 meses sin vacunación completa)."},

  {"type": "text", "html": """
<h3>Status epilépticus: protocolo de actuación</h3>
<p>Status epilépticus = convulsión &gt;5 minutos O dos convulsiones sin recuperación de conciencia entre ellas. Es una emergencia — cada minuto sin tratar aumenta el daño neuronal.</p>
<table>
<thead><tr><th>Tiempo</th><th>Paso</th><th>Fármaco</th></tr></thead>
<tbody>
<tr><td>0–5 min</td><td>Vía aérea, posición lateral, glucosa, O₂</td><td>—</td></tr>
<tr><td>5–20 min</td><td>Primera línea: benzodiacepina</td><td>Diazepam IV 0,3 mg/kg (o lorazepam IV)</td></tr>
<tr><td>20–40 min</td><td>Segunda línea: si no cedió</td><td>Fenitoína IV (o levetiracetam IV, valproato IV)</td></tr>
<tr><td>&gt;40 min</td><td>Status refractario → UCI</td><td>Midazolam en infusión, propofol, pentobarbital</td></tr>
</tbody>
</table>
<p>Regla del EUNACOM: el primer fármaco siempre es una <strong>benzodiacepina</strong>. Si preguntan qué das primero en status → diazepam IV.</p>
"""},

  {"type": "rapid_check", "id": "rc-epi3",
   "question": "Paciente adulto en status epilépticus de 8 minutos. Ya tiene vía venosa. ¿Cuál es el primer fármaco a administrar?",
   "options": ["A. Fenitoína IV", "B. Valproato IV", "C. Diazepam IV", "D. Fenobarbital IV", "E. Levetiracetam IV"],
   "correct": "C",
   "wrong_hint": "Primera línea en status epilépticus: BENZODIACEPINA (diazepam o lorazepam IV). Son los fármacos más rápidos y efectivos para cortar la convulsión. La fenitoína es segunda línea (si las benzo no funcionan). El fenobarbital también es segunda línea. El error más común es empezar con fenitoína cuando aún no se han dado las benzo."},
],

# ─────────────────────────────────────────────────────────────────────────
"demencia-delirium-geriatria": [
  {"type": "text", "html": """
<h3>Las 4 demencias: diagnóstico diferencial en una tabla</h3>
<p>El EUNACOM te da una presentación clínica y quiere que identifiques el tipo de demencia. Las características de inicio y los síntomas asociados son la clave:</p>
<table>
<thead><tr><th>Demencia</th><th>Inicio</th><th>Hallazgo característico</th><th>Imagen</th></tr></thead>
<tbody>
<tr><td><strong>🧠 Alzheimer</strong></td><td>Insidioso, &gt;65 años</td><td>Amnesia precoz (memoria reciente primero), afasia, apraxia</td><td>Atrofia hipocampal y parietal</td></tr>
<tr><td><strong>🩸 Vascular</strong></td><td>Escalonado (por infartos)</td><td>FRC cardiovasculares, déficits focales, historia de ACV</td><td>Leucoaraiosis, infartos múltiples</td></tr>
<tr><td><strong>👁️ Cuerpos de Lewy</strong></td><td>Fluctuante</td><td>Alucinaciones VISUALES + parkinsonismo + fluctuación cognitiva</td><td>Hipometabolismo occipital</td></tr>
<tr><td><strong>🗣️ Frontotemporal</strong></td><td>Presenil (45–65 años)</td><td>Cambios de CONDUCTA/personalidad, desinhibición, sin amnesia inicial</td><td>Atrofia frontal y temporal</td></tr>
</tbody>
</table>
<p>El Alzheimer es la causa más frecuente (60-80% de todas las demencias). <strong>El diagnóstico es clínico</strong> — la confirmación definitiva es por autopsia (placas de amiloide + ovillos de tau).</p>
"""},

  {"type": "rapid_check", "id": "rc-dem1",
   "question": "Paciente de 65 años, deterioro cognitivo insidioso de 4 meses: falla de memoria reciente, dificultad para nombrar objetos, se pierde en lugares conocidos. Sin antecedentes vasculares. TC normal. ¿Diagnóstico más probable?",
   "options": ["A. Demencia vascular", "B. Demencia frontotemporal", "C. Demencia con cuerpos de Lewy", "D. Enfermedad de Alzheimer", "E. Delirium"],
   "correct": "D",
   "wrong_hint": "Inicio insidioso + pérdida de memoria reciente + afasia nominativa + desorientación topográfica + sin historia vascular + TC normal = Alzheimer hasta demostrar lo contrario. La vascular tiene inicio escalonado con FRC. La frontotemporal empieza con cambios de conducta (no amnesia). Cuerpos de Lewy tiene alucinaciones visuales + parkinsonismo. El delirium es AGUDO, no de 4 meses."},

  {"type": "text", "html": """
<h3>Delirium vs Demencia: la distinción más importante en Geriatría</h3>
<p>El delirium es la confusión aguda. La demencia es la confusión crónica. Confundirlos es un error grave porque el delirium tiene una causa tratable y reversible.</p>
<table>
<thead><tr><th>Característica</th><th>⚡ Delirium</th><th>🐌 Demencia</th></tr></thead>
<tbody>
<tr><td><strong>Inicio</strong></td><td>AGUDO (horas–días)</td><td>Insidioso (meses–años)</td></tr>
<tr><td><strong>Curso</strong></td><td>Fluctuante (empeora de noche)</td><td>Progresivo estable</td></tr>
<tr><td><strong>Atención</strong></td><td>Muy alterada (no puede concentrarse)</td><td>Relativamente conservada al inicio</td></tr>
<tr><td><strong>Conciencia</strong></td><td>Obnubilada</td><td>Normal al inicio</td></tr>
<tr><td><strong>Causa</strong></td><td>Siempre tiene causa tratable: ITU, neumonía, medicamentos, ICC</td><td>Neurodegenerativa</td></tr>
<tr><td><strong>Reversible</strong></td><td>Sí (si se trata la causa)</td><td>No (progresiva)</td></tr>
<tr><td><strong>Tratamiento</strong></td><td>Tratar la causa + haloperidol si agitación</td><td>Según tipo; inhibidores colinesterasa en Alzheimer</td></tr>
</tbody>
</table>
<p>Regla del EUNACOM: <strong>adulto mayor hospitalizado con confusión aguda = delirium hasta demostrar lo contrario</strong>. La causa más frecuente de delirium en hospitalizados: <strong>infección (ITU, neumonía)</strong>, medicamentos, retención urinaria, fecaloma, deshidratación.</p>
"""},

  {"type": "rapid_check", "id": "rc-dem2",
   "question": "Mujer de 80 años, ingresada por ITU. Evoluciona con confusión, agitación nocturna, alucinaciones visuales. Ayer estaba lúcida. ¿Diagnóstico y tratamiento del cuadro conductual?",
   "options": ["A. Exacerbación de Alzheimer — ajustar donepezilo", "B. Psicosis geriátrica — risperidona crónica", "C. Delirium — tratar ITU + haloperidol si agitación severa", "D. Demencia con cuerpos de Lewy de novo — iniciar anticolinesterasa", "E. Crisis de ansiedad — lorazepam"],
   "correct": "C",
   "wrong_hint": "Confusión AGUDA (ayer estaba lúcida) + fluctuante + hospitalización + causa desencadenante (ITU) = DELIRIUM. El tratamiento es tratar la causa (ATB para ITU) + medidas no farmacológicas (orientación, sueño-vigilia, familiar acompañante) + haloperidol si hay agitación severa que amenaza seguridad. El lorazepam puede EMPEORAR el delirium. La risperidona crónica no está indicada. No es Alzheimer porque el inicio fue agudo."},

  {"type": "text", "html": """
<h3>Geriatría: los grandes síndromes geriátricos</h3>
<p>El EUNACOM evalúa cuatro síndrome geriátricos clave:</p>
<table>
<thead><tr><th>Síndrome</th><th>Definición y clave</th><th>Herramienta de evaluación</th></tr></thead>
<tbody>
<tr><td><strong>Caídas</strong></td><td>Etiología multifactorial: medicamentos (benzodiacepinas, antihipertensivos), deterioro sensorial, sarcopenia. Fractura de cadera = mortalidad 30% al año en &gt;80 años</td><td>Prueba Timed Up and Go (TUG)</td></tr>
<tr><td><strong>Polifarmacia</strong></td><td>&gt;5 medicamentos. Criterios Beers: medicamentos inapropiados en ancianos (benzodiacepinas, anticolinérgicos, AINEs, antipsicóticos)</td><td>Criterios Beers/STOPP</td></tr>
<tr><td><strong>Fragilidad</strong></td><td>Fenotipo de Fried: pérdida de peso involuntaria + fatiga + baja actividad + velocidad de marcha lenta + debilidad. ≥3 = frágil</td><td>Criterios de Fried</td></tr>
<tr><td><strong>Deterioro cognitivo leve</strong></td><td>Entre normal y demencia. No interfiere con la vida diaria. 15% progresa a demencia/año</td><td>Mini-Mental (MMSE), Test del reloj</td></tr>
</tbody>
</table>
<p><strong>Medicamentos de Beers que el EUNACOM pregunta:</strong> Benzodiacepinas (riesgo de caídas y delirium), antidepresivos tricíclicos (anticolinérgicos), AINEs (GI + renal + HTA), digoxina dosis altas, antihistamínicos primera generación (prometazina).</p>
"""},

  {"type": "rapid_check", "id": "rc-dem3",
   "question": "Hombre de 82 años, insomnio crónico. El médico le indica lorazepam. ¿Cuál es el principal riesgo en este paciente?",
   "options": ["A. Adicción severa", "B. Hepatotoxicidad", "C. Caídas y delirium", "D. Hipertensión rebote", "E. Arritmia cardíaca"],
   "correct": "C",
   "wrong_hint": "Las benzodiacepinas son medicamentos inapropiados en el anciano (Criterios Beers). El principal riesgo en un adulto mayor es la sedación excesiva + deterioro del equilibrio → CAÍDAS (con riesgo de fractura de cadera) + delirium. Existen alternativas más seguras para el insomnio geriátrico: melatonina, higiene del sueño, mirtazapina a bajas dosis. En general en el EUNACOM, benzo + anciano = riesgo de caídas."},

  {"type": "rapid_check", "id": "rc-dem4",
   "question": "Anciana de 78 años con diagnóstico de Alzheimer leve. ¿Cuál es el tratamiento farmacológico de primera línea para enlentecer el deterioro cognitivo?",
   "options": ["A. Haloperidol", "B. Memantina", "C. Donepezilo (inhibidor de acetilcolinesterasa)", "D. Lorazepam", "E. No existe tratamiento farmacológico efectivo"],
   "correct": "C",
   "wrong_hint": "En Alzheimer leve-moderado el tratamiento son los inhibidores de acetilcolinesterasa: donepezilo, rivastigmina, galantamina. Enlentecen el deterioro pero NO curan. La memantina (antagonista NMDA) es para Alzheimer moderado-grave o como adición. El haloperidol se usa solo para agitación severa, no como tratamiento cognitivo. No es correcto decir que no hay tratamiento — aunque limitado, hay."},
],

# ─────────────────────────────────────────────────────────────────────────
"parkinson-movimiento": [
  {"type": "text", "html": """
<h3>Parkinson: la tríada TRAP y cómo no confundirlo</h3>
<p>La enfermedad de Parkinson es el trastorno del movimiento más preguntado. Debes dominar:</p>
<p><strong>Tríada (o tétrada) TRAP:</strong></p>
<ul>
<li><strong>T</strong>emblor de <strong>reposo</strong> (desaparece al moverse, "cuenta monedas")</li>
<li><strong>R</strong>igidez en "<strong>rueda dentada</strong>" (en jerky steps)</li>
<li><strong>A</strong>cinesia / <strong>B</strong>radicinesia (movimientos lentos, letra pequeña — micrografía)</li>
<li><strong>P</strong>ostura encorvada + inestabilidad postural</li>
</ul>
<table>
<thead><tr><th>Tipo de temblor</th><th>Cuándo aparece</th><th>Causa</th></tr></thead>
<tbody>
<tr><td><strong>De REPOSO</strong></td><td>En reposo, desaparece al moverse</td><td>Parkinson, PPD</td></tr>
<tr><td><strong>De ACCIÓN/postural</strong></td><td>Al mantener una postura</td><td>Temblor esencial</td></tr>
<tr><td><strong>De INTENCIÓN</strong></td><td>Al acercarse al objetivo</td><td>Cerebeloso (ataxia)</td></tr>
</tbody>
</table>
<p>El <strong>temblor esencial</strong> es el más frecuente en general. Responde a propranolol. Empeora con el café. No hay bradicinesia ni rigidez.</p>
"""},

  {"type": "rapid_check", "id": "rc-park1",
   "question": "Paciente de 61 años, temblor de la mano derecha que aparece en reposo y desaparece al hacer movimientos voluntarios. Marcha lenta, letras pequeñas al escribir. ¿Diagnóstico?",
   "options": ["A. Temblor esencial", "B. Parkinsonismo por medicamentos (PPD)", "C. Enfermedad de Parkinson", "D. Cerebeloso (ataxia)", "E. Hipertiroidismo"],
   "correct": "C",
   "wrong_hint": "Temblor en REPOSO que desaparece al moverse + bradicinesia (escritura pequeña) + marcha lenta = Parkinson. El temblor esencial aparece en acción/postura y NO hay bradicinesia ni rigidez. El PPD sería en paciente con antecedente de medicamentos antidopaminérgicos (metoclopramida, haloperidol). El cerebeloso es un temblor de intención (aparece al acercarse al objetivo)."},

  {"type": "text", "html": """
<h3>PPD (Parkinsonismo inducido por fármacos): la trampa más común</h3>
<p>El parkinsonismo secundario por fármacos (PPD) es clínicamente indistinguible del Parkinson idiopático — mismo temblor, misma rigidez, misma bradicinesia. La diferencia está en el <strong>antecedente farmacológico</strong>.</p>
<p>Medicamentos que causan PPD (todos son bloqueadores dopaminérgicos):</p>
<ul>
<li><strong>Metoclopramida</strong> (antieméticos) — el más frecuente por su uso cotidiano</li>
<li><strong>Haloperidol, risperidona, olanzapina</strong> (antipsicóticos)</li>
<li><strong>Prometazina</strong> (antihistamínico con acción antidopaminérgica)</li>
<li>Flunarizina, cinarizina (bloqueadores calcio usados en vértigo)</li>
</ul>
<p><strong>Conducta en PPD:</strong> suspender el medicamento causante. Si hay necesidad de antipsicótico, usar clozapina o quetiapina (menor acción dopaminérgica).</p>
<p><strong>NO usar metoclopramida en pacientes con Parkinson</strong> — empeora el cuadro dramáticamente.</p>
"""},

  {"type": "rapid_check", "id": "rc-park2",
   "question": "Mujer de 55 años, sin antecedentes neurológicos. Inició metoclopramida hace 2 meses por reflujo gastroesofágico. Consulta por temblor, rigidez y lentitud de movimientos. ¿Diagnóstico?",
   "options": ["A. Enfermedad de Parkinson de inicio precoz", "B. Parkinsonismo inducido por metoclopramida (PPD)", "C. Temblor esencial", "D. Esclerosis lateral amiotrófica", "E. Distrofia muscular"],
   "correct": "B",
   "wrong_hint": "Parkinsonismo con inicio 2 meses después de iniciar metoclopramida = PPD por metoclopramida. La metoclopramida bloquea receptores dopaminérgicos D2 en el estriado y causa parkinsonismo farmacológico. La conducta es suspender la metoclopramida. En la enfermedad de Parkinson NO hay antecedente farmacológico claro y el debut es más insidioso en años."},

  {"type": "text", "html": """
<h3>Tratamiento del Parkinson: cuándo y con qué</h3>
<table>
<thead><tr><th>Situación</th><th>Tratamiento</th></tr></thead>
<tbody>
<tr><td>Parkinson precoz sin discapacidad funcional</td><td>Observar + ejercicio. No iniciar levodopa todavía (reservarla)</td></tr>
<tr><td>Parkinson con discapacidad funcional (&lt;65 años)</td><td>Agonistas dopaminérgicos (pramipexol, ropinirol) para retrasar levodopa</td></tr>
<tr><td>Parkinson con discapacidad funcional (&gt;65 años)</td><td><strong>Levodopa + carbidopa</strong> (gold standard, más eficaz, menos discinesias en mayores)</td></tr>
<tr><td>Parkinson avanzado con fluctuaciones</td><td>Ajuste levodopa + inhibidores MAO-B (selegilina) + apomorfina</td></tr>
</tbody>
</table>
<p>La <strong>carbidopa</strong> que se combina con levodopa es un inhibidor de la dopa-descarboxilasa periférica — impide que la levodopa se metabolice en la periferia y permite que más llegue al cerebro + reduce los efectos secundarios periféricos (náuseas, hipotensión).</p>
"""},

  {"type": "rapid_check", "id": "rc-park3",
   "question": "Paciente de 72 años con enfermedad de Parkinson que ya tiene dificultad para las actividades de la vida diaria. ¿Cuál es el tratamiento de primera línea más adecuado?",
   "options": ["A. Propranolol", "B. Pramipexol (agonista dopaminérgico)", "C. Levodopa + carbidopa", "D. Carbamazepina", "E. Haloperidol"],
   "correct": "C",
   "wrong_hint": "En mayores de 65 años con Parkinson y discapacidad funcional, el tratamiento de elección es levodopa + carbidopa (el gold standard). En jóvenes (&lt;65 años) se prefieren agonistas dopaminérgicos primero para reservar la levodopa (que tiene limitaciones a largo plazo como discinesias). El propranolol es para temblor esencial. El haloperidol está CONTRAINDICADO en Parkinson (bloquea dopamina)."},
],

# ─────────────────────────────────────────────────────────────────────────
"meningitis-encefalitis": [
  {"type": "text", "html": """
<h3>Meningitis bacteriana: gérmenes por edad y LCR</h3>
<p>Conocer el germen más probable según la edad te da el tratamiento empírico correcto:</p>
<table>
<thead><tr><th>Edad</th><th>Gérmenes más frecuentes</th><th>Tratamiento empírico</th></tr></thead>
<tbody>
<tr><td>RN &lt;3 meses</td><td><em>E. coli</em>, SGB, <em>Listeria</em></td><td>Ampicilina + Gentamicina (o cefotaxima)</td></tr>
<tr><td>3m – 60 años</td><td><em>N. meningitidis</em> (meningococo), <em>S. pneumoniae</em></td><td>Ceftriaxona</td></tr>
<tr><td>&gt;60 años / inmunosuprimido</td><td><em>S. pneumoniae</em>, <em>Listeria</em></td><td>Ceftriaxona + Ampicilina</td></tr>
</tbody>
</table>
<p>La <strong>dexametasona</strong> se agrega ANTES o simultáneamente con el primer ATB (no después). Reduce mortalidad y secuelas (sordera) en meningitis neumocócica.</p>
<h3>LCR en meningitis: el análisis que todo lo dice</h3>
<table>
<thead><tr><th>Parámetro</th><th>Normal</th><th>Bacteriana</th><th>Viral</th><th>TBC/Fúngica</th></tr></thead>
<tbody>
<tr><td><strong>Aspecto</strong></td><td>Cristal de roca</td><td>Turbio/purulento</td><td>Claro</td><td>Claro/opalescente</td></tr>
<tr><td><strong>Glucosa</strong></td><td>60-70% de glicemia</td><td>↓↓ Muy baja (&lt;40)</td><td>Normal</td><td>↓ Baja</td></tr>
<tr><td><strong>Proteínas</strong></td><td>&lt;45 mg/dl</td><td>↑↑ Muy altas (&gt;150)</td><td>↑ Levemente alta</td><td>↑↑ Altas</td></tr>
<tr><td><strong>Células</strong></td><td>&lt;5 MN</td><td>PMN (neutrófilos) ↑↑</td><td>MN (linfocitos) ↑</td><td>MN (linfocitos) ↑</td></tr>
</tbody>
</table>
"""},

  {"type": "rapid_check", "id": "rc-men1",
   "question": "Adulto de 25 años, fiebre alta, cefalea intensa, rigidez de nuca. LCR: turbio, glucosa 28 mg/dl, proteínas 280 mg/dl, PMN 1200/mm³. ¿Diagnóstico y antibiótico de elección?",
   "options": ["A. Meningitis viral — aciclovir", "B. Meningitis bacteriana — ceftriaxona", "C. Meningitis TBC — isoniacida + rifampicina", "D. Encefalitis herpética — aciclovir", "E. Meningitis criptocócica — fluconazol"],
   "correct": "B",
   "wrong_hint": "LCR turbio + glucosa muy baja + proteínas muy altas + PMN (neutrófilos) ↑↑ = meningitis BACTERIANA. El antibiótico empírico en adulto joven es ceftriaxona. La meningitis viral tiene LCR claro con glucosa normal y linfocitos. La TBC también da linfocitosis pero con glucosa moderadamente baja y evolución subaguda. Agregar dexametasona antes o con la primera dosis de ATB."},

  {"type": "text", "html": """
<h3>Encefalitis herpética: el diagnóstico que no se puede perder</h3>
<p>La encefalitis por VHS-1 es la causa más frecuente de encefalitis viral grave en adultos inmunocompetentes. Si no se trata, mortalidad &gt;70%.</p>
<p><strong>Características clínicas:</strong></p>
<ul>
<li>Fiebre + cefalea + alteración de conducta/personalidad (lóbulo temporal)</li>
<li>Crisis convulsivas (frecuentes, focales)</li>
<li>Alucinaciones olfativas o gustativas (afectación del lóbulo temporal)</li>
<li>Puede progresar a coma</li>
</ul>
<p><strong>Diagnóstico:</strong> RMN: lesiones hipointensas en T1/hiperintensas en T2 en <strong>lóbulos temporales</strong> (bilateral pero asimétrico). LCR: linfocitos ↑, proteínas ↑, glucosa normal. PCR VHS-1 en LCR (confirmatorio). EEG: descargas periódicas en temporal.</p>
<p><strong>Tratamiento: aciclovir IV 10 mg/kg c/8h × 14-21 días</strong>. No esperar la PCR para iniciar — si hay sospecha clínica, trata.</p>
"""},

  {"type": "rapid_check", "id": "rc-men2",
   "question": "Hombre de 40 años, 5 días de fiebre + confusión + alucinaciones + crisis convulsiva focal. LCR: linfocitos ↑, proteínas ↑, glucosa normal. RMN: hiperintensidad en lóbulos temporales. ¿Diagnóstico y tratamiento?",
   "options": ["A. Meningitis bacteriana — ceftriaxona", "B. Encefalitis herpética — aciclovir IV", "C. Tumor temporal — dexametasona", "D. ACV hemorrágico — neurocirugía", "E. Psicosis aguda — antipsicóticos"],
   "correct": "B",
   "wrong_hint": "Fiebre + confusión/alucinaciones + convulsiones + LCR con linfocitosis + glucosa NORMAL + lesión en lóbulos TEMPORALES en RMN = encefalitis herpética por VHS-1 hasta demostrar lo contrario. El tratamiento es aciclovir IV INMEDIATO sin esperar confirmación. La meningitis bacteriana tiene LCR con glucosa muy baja y PMN. La glucosa normal en LCR aleja de bacteriana."},

  {"type": "text", "html": """
<h3>Meningococcemia: la urgencia dermatológica-neurológica</h3>
<p>La meningococcemia es la meningitis con septicemia meningocócica. Puede matar en 24 horas. La clave es el rash:</p>
<ul>
<li>Exantema <strong>petequial o purpúrico</strong>, no blanqueable a la presión (prueba del vaso de vidrio)</li>
<li>Progresa rápidamente a púrpura fulminante + coagulación intravascular diseminada (CID)</li>
<li><strong>Tratar antes de la punción lumbar</strong> si el estado es crítico — el ATB primero, el diagnóstico después</li>
</ul>
<p>Profilaxis de contactos: rifampicina o ciprofloxacino para convivientes.</p>
"""},

  {"type": "rapid_check", "id": "rc-men3",
   "question": "Adolescente de 16 años, fiebre de 39°C, cefalea, rigidez de nuca, y manchas rojizas en tronco que NO blanquean al presionarlas con un vaso. ¿Conducta inmediata?",
   "options": ["A. Punción lumbar urgente antes de cualquier otro paso", "B. TC cerebral para descartar contraindicación de PL", "C. Ceftriaxona IV inmediato + PL cuando estabilice", "D. Paracetamol y observar en urgencias", "E. Anticoagulación con heparina por CID"],
   "correct": "C",
   "wrong_hint": "Rash petequial-purpúrico + rigidez de nuca = meningococcemia hasta demostrar lo contrario. Es una emergencia. Si el paciente está en deterioro rápido, dar ceftriaxona IV INMEDIATO sin esperar PL. Retrasar el ATB para hacer la PL puede costar la vida. Después de estabilizar, se puede hacer PL para confirmar. La PL no está contraindicada pero el ATB no puede esperar."},
],

# ─────────────────────────────────────────────────────────────────────────
"enfermedades-neuromusculares": [
  {"type": "text", "html": """
<h3>Miastenia Gravis vs Guillain-Barré: los dos grandes neuromusculares</h3>
<table>
<thead><tr><th>Característica</th><th>🟡 Miastenia Gravis</th><th>🔵 Guillain-Barré</th></tr></thead>
<tbody>
<tr><td><strong>Mecanismo</strong></td><td>Autoanticuerpos anti-RACh (unión neuromuscular)</td><td>Autoinmune post-infecciosa (desmielinización)</td></tr>
<tr><td><strong>Debilidad</strong><br/>(clave)</td><td>EMPEORA con el ejercicio, MEJORA con el reposo (fatigabilidad)</td><td>ASCENDENTE, simétrica, sin fatigabilidad</td></tr>
<tr><td><strong>Inicio</strong></td><td>Insidioso, fluctuante</td><td>Subagudo post-infeccioso (1-4 sem)</td></tr>
<tr><td><strong>Músculos</strong></td><td>Oculares (ptosis, diplopía) + proximales</td><td>Miembros inferiores → sube</td></tr>
<tr><td><strong>Reflejos</strong></td><td>Conservados</td><td>Abolidos (hiporreflexia)</td></tr>
<tr><td><strong>LCR</strong></td><td>Normal</td><td>Disociación albúmino-citológica (proteínas ↑↑, células normales)</td></tr>
<tr><td><strong>Diagnóstico</strong></td><td>Anti-RACh, prueba de edrofonio (+)</td><td>EMG, LCR</td></tr>
<tr><td><strong>Tratamiento</strong></td><td>Inhibidores colinesterasa (piridostigmina) ± inmunosupresores ± timectomía</td><td>Ig IV o plasmaféresis + monitoreo respiratorio</td></tr>
</tbody>
</table>
<p><strong>Truco Guillain-Barré:</strong> busca el antecedente de infección 1-4 semanas antes (Campylobacter jejuni el más frecuente, también CMV, EBV). El peligro real es la parálisis de los músculos respiratorios → UCI y ventilación mecánica.</p>
"""},

  {"type": "rapid_check", "id": "rc-nm1",
   "question": "Mujer de 33 años, astenia y diplopía de 2 semanas, que empeoran al final del día y mejoran con el reposo. Ptosis palpebral bilateral. ¿Diagnóstico?",
   "options": ["A. Esclerosis múltiple", "B. Miastenia gravis", "C. Síndrome de Guillain-Barré", "D. Botulismo", "E. Miopatía inflamatoria"],
   "correct": "B",
   "wrong_hint": "Debilidad que EMPEORA con el ejercicio/tarde del día y MEJORA con el reposo = patrón de FATIGABILIDAD = miastenia gravis. La ptosis + diplopía son la presentación ocular clásica. La EM puede dar diplopía pero no tiene fatigabilidad tan característica. El GBS es ascendente y no fluctúa con el ejercicio. Se confirma con anti-RACh y prueba de edrofonio."},

  {"type": "text", "html": """
<h3>Esclerosis Múltiple: la enfermedad de los brotes y remisiones</h3>
<p>La EM es la enfermedad desmielinizante más frecuente en adultos jóvenes. El EUNACOM la pregunta por su presentación inicial y criterios diagnósticos.</p>
<p><strong>Presentación típica:</strong> Mujer joven (20-40 años), brotes de síntomas neurológicos que duran días-semanas y luego se recuperan parcialmente. Los síntomas dependen de qué placa de desmielinización se forma:</p>
<ul>
<li>Neuritis óptica: pérdida visual unilateral dolorosa (nervio óptico)</li>
<li>Síntoma de Uhthoff: empeora con el calor (duchas calientes)</li>
<li>Signo de Lhermitte: sensación eléctrica al flexionar el cuello</li>
<li>Debilidad o parestesias en extremidades</li>
</ul>
<p><strong>Diagnóstico:</strong> RMN (criterios de McDonald): placas periventriculares, en cuerpo calloso, en ángulo calloseptal ("dedos de Dawson"). Requiere diseminación en espacio (2 lugares) Y en tiempo (2 brotes en distinto momento).</p>
<p><strong>LCR:</strong> bandas oligoclonales de IgG (90% de los casos).</p>
<p><strong>Tratamiento:</strong> brote agudo = corticoides IV (metilprednisolona). Mantenimiento = interferón β, acetato de glatiramer, natalizumab.</p>
"""},

  {"type": "rapid_check", "id": "rc-nm2",
   "question": "Mujer de 28 años, hace 6 meses pérdida visual en ojo derecho que mejoró sola. Ahora debilidad en piernas con parestesias. Refiere que sus síntomas empeoran cuando se baña con agua caliente. ¿Diagnóstico?",
   "options": ["A. Miastenia gravis", "B. Neuromielitis óptica", "C. Esclerosis múltiple", "D. Guillain-Barré", "E. Lupus eritematoso sistémico con afectación neurológica"],
   "correct": "C",
   "wrong_hint": "Mujer joven + 2 episodios en distinto tiempo y lugar (neuritis óptica + síntomas medulares) + signo de Uhthoff (empeora con calor) = Esclerosis Múltiple (criterios de diseminación en espacio y tiempo). La neuromielitis óptica (Devic) afecta específicamente nervio óptico + médula espinal, pero no tiene el perfil de remisión-exacerbación tan típico. El GBS es agudo y ascendente, no tiene brotes."},

  {"type": "text", "html": """
<h3>Neuropatías periféricas y patología de columna</h3>
<p>Las tres más frecuentes en el EUNACOM:</p>
<table>
<thead><tr><th>Patología</th><th>Clínica</th><th>Clave diagnóstica / tratamiento</th></tr></thead>
<tbody>
<tr><td><strong>Síndrome del túnel carpiano</strong></td><td>Parestesias en 1°-3° dedo (mediano), peor de noche, signo de Tinel y Phalen (+)</td><td>EMG confirma. Tto: férula nocturna → infiltración → cirugía</td></tr>
<tr><td><strong>Hernia discal lumbar (L4-L5 / L5-S1)</strong></td><td>Dolor lumbar + ciática (cara posterior muslo y pierna), Lasègue (+), déficit sensitivo-motor según nivel</td><td>RMN. Tto inicial: analgesia + ejercicio (NO reposo absoluto). Cirugía si sínd. cauda equina (urgencia)</td></tr>
<tr><td><strong>Parálisis facial periférica (Bell)</strong></td><td>Toda la hemicara afectada (INCLUYENDO frente), inicio agudo</td><td>Diferencia con central: la parálisis CENTRAL respeta la frente (inervación bilateral de la frente). Tto: corticoides orales + protección ocular</td></tr>
</tbody>
</table>
<p><strong>Síndrome de cauda equina = URGENCIA QUIRÚRGICA:</strong> hernia masiva que comprime la cauda → incontinencia vesical/intestinal + anestesia en silla de montar + debilidad bilateral piernas. Cirugía en &lt;48h.</p>
"""},

  {"type": "rapid_check", "id": "rc-nm3",
   "question": "Paciente con parálisis facial derecha. Al examinarlo: no puede cerrar el ojo derecho, no puede elevar la ceja derecha, no puede arrugar la frente derecha. ¿Es una parálisis facial periférica o central?",
   "options": ["A. Central — porque afecta la frente", "B. Central — porque no puede cerrar el ojo", "C. Periférica — porque afecta TODA la hemicara incluyendo la frente", "D. Periférica — porque es unilateral", "E. No se puede distinguir sin imagen"],
   "correct": "C",
   "wrong_hint": "La clave es la FRENTE. La parálisis facial PERIFÉRICA (Bell, parotiditis, colesteatoma) afecta TODA la hemicara ipsilateral incluyendo la frente (no puede arrugar la frente ni elevar la ceja). La parálisis CENTRAL (ACV) respeta la frente — el paciente SÍ puede arrugar la frente y elevar la ceja, porque la frente tiene inervación bilateral desde el córtex. En este paciente la frente está afectada → es periférica."},

  {"type": "rapid_check", "id": "rc-nm4",
   "question": "Paciente con hernia discal L5-S1 con ciática, lleva 5 días con analgesia. ¿Cuándo está indicada la cirugía de urgencia?",
   "options": ["A. Si el dolor no mejora en 48h", "B. Si el Lasègue es positivo", "C. Si hay incontinencia vesical o intestinal + anestesia en silla de montar", "D. Si la RMN confirma la hernia", "E. Si el paciente tiene más de 50 años"],
   "correct": "C",
   "wrong_hint": "La cirugía de urgencia (&lt;48h) en hernia discal se reserva para el SÍNDROME DE CAUDA EQUINA: incontinencia vesical y/o rectal + anestesia en silla de montar (periné, escroto/vulva) + debilidad bilateral de piernas. Sin esto, el manejo es conservador: analgesia + fisioterapia + ejercicio. El Lasègue positivo y la hernia en RMN son hallazgos comunes que NO indican cirugía urgente por sí solos."},
],

}
