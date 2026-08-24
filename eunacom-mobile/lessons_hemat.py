"""
Didactic lesson blocks for each hematología topic.
Each block is either:
  {"type": "text", "html": "..."}   — rendered as HTML (tables, paragraphs, lists)
  {"type": "rapid_check", "id": "...", "question": "...", "options": [...], "correct": "A-E",
   "wrong_hint": "..."}             — inline Socratic mini-quiz with feedback
"""

LESSONS = {

# ─────────────────────────────────────────────────────────────────────────
"anemias-clasificacion": [
  {"type": "text", "html": """
<h3>¿Cómo clasificar una anemia? El VCM es tu primer paso</h3>
<p>Cuando ves una anemia, lo primero que miras es el <strong>Volumen Corpuscular Medio (VCM)</strong>. Eso te da tres caminos posibles, y dentro de cada uno hay diagnósticos distintos que se distinguen por el <strong>perfil de hierro</strong>.</p>
<table>
<thead><tr><th>Tipo</th><th>VCM</th><th>Diagnósticos principales</th></tr></thead>
<tbody>
<tr><td>🔴 Microcítica</td><td>&lt; 80 fl</td><td>Ferropénica · Talasemia · Enf. Crónicas</td></tr>
<tr><td>🟡 Normocítica</td><td>80–100 fl</td><td>Hemolítica · Enf. Crónicas · Aplásica · Hemorragia aguda</td></tr>
<tr><td>🔵 Macrocítica</td><td>&gt; 100 fl</td><td>B12 · Folatos · SMD · Hipotiroidismo</td></tr>
</tbody>
</table>
<p>El VCM te da el tipo morfológico. El <strong>perfil de hierro</strong> es donde el EUNACOM pone las trampas más frecuentes.</p>
"""},

  {"type": "rapid_check", "id": "rc-a1",
   "question": "Un paciente tiene anemia microcítica. El perfil de hierro muestra ferritina BAJA, ferremia BAJA y transferrina ALTA. ¿Cuál es el diagnóstico?",
   "options": ["A. Anemia de enfermedades crónicas", "B. Anemia ferropénica", "C. Talasemia", "D. Anemia sideroblástica"],
   "correct": "B",
   "wrong_hint": "Recuerda: ferritina refleja las <strong>reservas</strong> de hierro. Ferritina ↓ = reservas vacías = ferropénica. La transferrina es el transportador — cuando no hay hierro disponible, el cuerpo la sube para capturar más. En enfermedades crónicas pasa lo contrario: ferritina ↑ (reactante de fase aguda) + transferrina ↓."},

  {"type": "text", "html": """
<h3>La tabla que distingue las 3 anemias microcíticas</h3>
<p>Esta tabla diferencia las tres anemias microcíticas más importantes — y es la trampa favorita del EUNACOM:</p>
<table>
<thead><tr><th>Parámetro</th><th>🔴 Ferropénica</th><th>🟠 Enf. Crónicas</th><th>🟡 Talasemia</th></tr></thead>
<tbody>
<tr><td><strong>Ferritina</strong></td><td>↓ Baja</td><td>↑ Alta</td><td>Normal / Alta</td></tr>
<tr><td><strong>Ferremia</strong></td><td>↓ Baja</td><td>↓ Baja</td><td>Normal</td></tr>
<tr><td><strong>Transferrina</strong></td><td>↑ Alta</td><td>↓ Baja</td><td>Normal</td></tr>
<tr><td><strong>VCM</strong></td><td>↓ Bajo</td><td>↓ Bajo (o normal)</td><td>↓↓ Muy bajo</td></tr>
<tr><td><strong>GR</strong></td><td>Bajos</td><td>Bajos</td><td>Normal/Altos</td></tr>
</tbody>
</table>
<p><strong>Gran truco de la talasemia:</strong> microcítica hipocrómica con perfil de hierro NORMAL. El problema no es falta de hierro — es defecto genético en las cadenas de globina.</p>
<p><strong>Truco de enfermedades crónicas:</strong> la ferritina es reactante de fase aguda. En inflamación crónica el hígado la sube aunque el hierro no esté disponible para eritropoyesis.</p>
"""},

  {"type": "rapid_check", "id": "rc-a2",
   "question": "Paciente con artritis reumatoide activa presenta anemia normocítica. Perfil de hierro: ferremia baja, transferrina BAJA, ferritina ALTA. ¿Diagnóstico?",
   "options": ["A. Anemia ferropénica", "B. Talasemia", "C. Anemia de enfermedades crónicas", "D. Mielodisplasia"],
   "correct": "C",
   "wrong_hint": "Tiene enfermedad inflamatoria crónica (AR). La ferritina ALTA actúa como señuelo — aunque parece haber hierro, no está disponible para eritropoyesis. Ferremia ↓ + transferrina ↓ (se reduce en inflamación) = patrón de enf. crónicas. En ferropénica la transferrina subiría."},

  {"type": "text", "html": """
<h3>Anemias macrocíticas: cuando el VCM supera los 100 fl</h3>
<p>Las macrocíticas tienen en común un problema en la <strong>síntesis de ADN</strong>. Las células no pueden dividirse bien y quedan grandes. Los dos grandes culpables son el <strong>déficit de B12</strong> y el <strong>déficit de folatos</strong>.</p>
<table>
<thead><tr><th>Característica</th><th>Déficit B12</th><th>Déficit Folatos</th><th>SMD</th></tr></thead>
<tbody>
<tr><td><strong>VCM</strong></td><td>&gt;100 fl</td><td>&gt;100 fl</td><td>&gt;100 fl (variable)</td></tr>
<tr><td><strong>Pancitopenia</strong></td><td>Sí</td><td>Sí</td><td>Sí</td></tr>
<tr><td><strong>Síntomas neurológicos</strong></td><td>Sí (parestesias, ataxia)</td><td>No</td><td>No</td></tr>
<tr><td><strong>Respuesta reticulocitaria</strong></td><td>5–7 días</td><td>5–7 días</td><td>No hay</td></tr>
<tr><td><strong>Edad típica</strong></td><td>Cualquiera</td><td>Cualquiera</td><td>&gt;60 años</td></tr>
</tbody>
</table>
<p>Si trataste al paciente 60 días con B12 + folatos + hierro oral y <em>no hubo ninguna mejoría</em>, el diagnóstico no es nutricional. Es una patología estructural de la médula ósea. El siguiente paso obligado es <strong>biopsia de médula ósea</strong>.</p>
"""},

  {"type": "rapid_check", "id": "rc-a3",
   "question": "Hombre de 65 años, pancitopenia con VCM 106 fl. Recibió B12 + folatos + hierro oral por 60 días sin cambios. ¿Cuál es la conducta más adecuada?",
   "options": ["A. Aumentar dosis de B12", "B. Cambiar a B12 parenteral", "C. Solicitar biopsia de médula ósea", "D. Solicitar eritropoyetina", "E. Iniciar corticoides"],
   "correct": "C",
   "wrong_hint": "60 días sin respuesta descarta déficit nutricional. Si fuera B12 o folatos, habría reticulocitosis en 5–7 días. El problema es estructural: SMD hasta demostrar lo contrario en un mayor de 60. La biopsia de médula ósea confirma el diagnóstico. B12 parenteral se usaría si sospecháramos malabsorción — pero 60 días de respuesta nula ya lo descarta."},

  {"type": "text", "html": """
<h3>Anemia hemolítica: reconocerla por sus marcadores</h3>
<p>La hemólisis es destrucción prematura de GR. El cuerpo compensa (↑ reticulocitos) y el contenido de los GR destruidos se vuelca a la sangre:</p>
<table>
<thead><tr><th>Marcador</th><th>Valor</th><th>¿Por qué?</th></tr></thead>
<tbody>
<tr><td><strong>Reticulocitos</strong></td><td>↑ Altos</td><td>Médula compensa</td></tr>
<tr><td><strong>LDH</strong></td><td>↑ Alta</td><td>Sale del interior del GR destruido</td></tr>
<tr><td><strong>Bilirrubina INDIRECTA</strong></td><td>↑ Alta</td><td>Hemo → bilirrubina no conjugada</td></tr>
<tr><td><strong>Haptoglobina</strong></td><td>↓ Baja</td><td>Se une a Hb libre y se consume</td></tr>
<tr><td><strong>Orina</strong></td><td>Oscura</td><td>Hemoglobinuria</td></tr>
<tr><td><strong>Coombs directo</strong></td><td>(+) si autoinmune</td><td>IgG o C3 sobre GR</td></tr>
</tbody>
</table>
<h3>Ferropénica en hombre adulto: siempre busca la causa</h3>
<p>Ferropenia en hombre adulto (o mujer postmenopáusica) = <strong>sangrado digestivo oculto</strong> hasta demostrar lo contrario = <strong>colonoscopía obligatoria</strong>. Dar solo hierro sin buscar la causa es incorrecto en el EUNACOM.</p>
"""},

  {"type": "rapid_check", "id": "rc-a4",
   "question": "Un hombre de 57 años presenta anemia ferropénica confirmada. ¿Cuál es la conducta más adecuada?",
   "options": ["A. Sulfato ferroso 1 mes y controlar", "B. Sulfato ferroso 6 meses sin más estudios", "C. Solicitar colonoscopía e iniciar sulfato ferroso", "D. Observar sin tratamiento", "E. Biopsia de médula ósea"],
   "correct": "C",
   "wrong_hint": "El hierro oral trata la anemia pero NO explica la causa. Un hombre adulto con ferropenia sin causa obvia debe ser estudiado para cáncer colorrectal con sangrado oculto. En el EUNACOM, dar solo hierro sin buscar la causa es incorrecto. La respuesta siempre incluye colonoscopía + hierro."},
],

# ─────────────────────────────────────────────────────────────────────────
"leucemias": [
  {"type": "text", "html": """
<h3>Las 4 leucemias: una tabla que lo cambia todo</h3>
<p>El EUNACOM pregunta leucemias con casos clínicos. La clave es leer el hemograma y la clínica. Esta tabla es tu brújula:</p>
<table>
<thead><tr><th>Característica</th><th>🔵 LLA</th><th>🔴 LMA</th><th>🟢 LLC</th><th>🟡 LMC</th></tr></thead>
<tbody>
<tr><td><strong>Edad típica</strong></td><td>Niños (2–5 años)</td><td>Adultos cualquier edad</td><td>Adultos &gt;60</td><td>Adultos 40–60</td></tr>
<tr><td><strong>Tipo celular</strong></td><td>Linfoblastos</td><td>Mieloblastos</td><td>Linfocitos maduros</td><td>Serie mieloide completa</td></tr>
<tr><td><strong>Blastos en sangre</strong></td><td>&gt;20% linfoblastos</td><td>&gt;20% mieloblastos</td><td>Raros</td><td>&lt;5% blastos</td></tr>
<tr><td><strong>Leucocitos</strong></td><td>Variable (con blastos)</td><td>Variable (con blastos)</td><td>↑↑ 90% linfocitos</td><td>↑↑↑ serie mieloide</td></tr>
<tr><td><strong>Esplenomegalia</strong></td><td>Moderada</td><td>Moderada</td><td>Moderada</td><td><strong>MASIVA</strong></td></tr>
<tr><td><strong>Plaquetas</strong></td><td>↓ Bajas</td><td>↓ Bajas</td><td>Normales o ↓</td><td>↑↑ Altas</td></tr>
<tr><td><strong>Marcador especial</strong></td><td>—</td><td>Bastones de Auer</td><td>Curso indolente</td><td>Cromosoma Philadelphia</td></tr>
<tr><td><strong>Pronóstico</strong></td><td>85% curación (niños)</td><td>Variable, urgencia</td><td>Sobrevida larga</td><td>Tto: Imatinib</td></tr>
</tbody>
</table>
"""},

  {"type": "rapid_check", "id": "rc-l1",
   "question": "Niño de 5 años, fiebre 2 semanas, dolores óseos, petequias. Hemograma: Hto 27%, blancos 2.900 con 84% linfocitos y 5% blastos, plaquetas 48.000. ¿Diagnóstico más probable?",
   "options": ["A. Linfoma de Hodgkin", "B. Leucemia linfática aguda (LLA)", "C. Leucemia linfática crónica (LLC)", "D. PTI", "E. Mononucleosis infecciosa"],
   "correct": "B",
   "wrong_hint": "Blastos en el hemograma de un niño con pancitopenia + dolores óseos + fiebre prolongada = LLA hasta demostrar lo contrario. Los dolores óseos se deben a infiltración del periostio medular. La LLC no existe en niños. El PTI tiene solo plaquetas bajas, sin blastos ni anemia leucopenia. La MN tiene odinofagia aguda, sin blastos."},

  {"type": "text", "html": """
<h3>LMC: la que más confunde en el EUNACOM</h3>
<p>La LMC tiene un hemograma muy característico. El paciente suele estar relativamente bien, pero el hemograma es impresionante:</p>
<ul>
<li>Leucocitosis masiva (&gt;30.000–50.000)</li>
<li>Desviación izquierda MIELOIDE completa: metamielocitos, mielocitos, promielocitos, baciliformes, segmentados — todos juntos</li>
<li>Blastos &lt;5% (si &gt;20% = fase blástica = urgencia)</li>
<li>Plaquetas ELEVADAS (trombocitosis)</li>
<li>Esplenomegalia MASIVA (hematopoyesis extramedular + infiltración)</li>
<li>Cromosoma Philadelphia (t(9;22), BCR-ABL) — tratamiento con Imatinib</li>
</ul>
<p>Presentación típica: dolor en hipocondrio izquierdo (esplenomegalia), fiebre recurrente, astenia. El hemograma lo dice todo.</p>
"""},

  {"type": "rapid_check", "id": "rc-l2",
   "question": "Paciente de 50 años, esplenomegalia importante, fiebre recurrente. Hemograma: blancos 43.000 con promielocitos 5%, baciliformes 24%, blastos 1%, plaquetas 460.000. ¿Diagnóstico?",
   "options": ["A. Leucemia mieloide aguda", "B. Reacción leucemoide", "C. Leucemia mieloide crónica", "D. Mononucleosis infecciosa", "E. Mielodisplasia"],
   "correct": "C",
   "wrong_hint": "Este es el hemograma clásico de LMC: leucocitosis masiva con desviación izquierda MIELOIDE completa (todos los estadios), blastos &lt;5%, plaquetas ALTAS y esplenomegalia masiva. En leucemia mieloide AGUDA los blastos serían &gt;20% y el paciente estaría muy enfermo. Este patrón + esplenomegalia = LMC."},

  {"type": "text", "html": """
<h3>LLC vs LMC: el duelo más frecuente en el EUNACOM</h3>
<p>Ambas tienen leucocitosis masiva. La clave está en el <strong>tipo de célula</strong>:</p>
<table>
<thead><tr><th>Característica</th><th>🟢 LLC</th><th>🟡 LMC</th></tr></thead>
<tbody>
<tr><td><strong>Célula predominante</strong></td><td>Linfocitos maduros (90%)</td><td>Serie mieloide completa</td></tr>
<tr><td><strong>Leucocitosis</strong></td><td>&gt;30.000, 90% linfocitos</td><td>&gt;30.000, todos los estadios mieloides</td></tr>
<tr><td><strong>Plaquetas</strong></td><td>Normales o ↓</td><td>↑↑ Altas</td></tr>
<tr><td><strong>Esplenomegalia</strong></td><td>Moderada</td><td>MASIVA</td></tr>
<tr><td><strong>Curso clínico</strong></td><td>Muy indolente</td><td>Crónico pero evoluciona</td></tr>
</tbody>
</table>
<p>Regla práctica: "90% linfocitos" en adulto mayor con curso indolente → <strong>LLC</strong>. Desviación izquierda mieloide con plaquetas altas → <strong>LMC</strong>.</p>
<h3>Reacción leucemoide por Bordetella pertussis</h3>
<p>Bordetella pertussis produce una <strong>linfocitosis masiva hasta 50.000</strong> que imita una leucemia — por eso se llama reacción leucemoide. La toxina pertussis bloquea la salida de linfocitos hacia los ganglios, acumulándolos en sangre. Clave: ocurre en <strong>lactantes con tos convulsiva</strong>.</p>
"""},

  {"type": "rapid_check", "id": "rc-l3",
   "question": "Adulto mayor asintomático, chequeo. Hemograma: blancos 29.000 con 90% linfocitos, plaquetas 140.000, Hto 30%, esplenomegalia leve. Curso indolente. ¿Diagnóstico?",
   "options": ["A. LMC", "B. LMA", "C. LLC", "D. Reacción leucemoide", "E. Linfoma"],
   "correct": "C",
   "wrong_hint": "90% linfocitos + adulto mayor + curso indolente = LLC clásica. La LMC tendría serie mieloide con todos los estadios y plaquetas ELEVADAS. La LMA sería aguda con blastos y el paciente estaría muy enfermo. La reacción leucemoide ocurre en lactantes con tos convulsiva, no en adultos mayores asintomáticos."},

  {"type": "rapid_check", "id": "rc-l4",
   "question": "Lactante de 5 meses con tos convulsiva. Hemograma: leucocitosis 44.000 con 90% linfocitos. ¿Cuál es la causa más probable?",
   "options": ["A. LLA concomitante", "B. Infección viral sobreagregada", "C. Reacción leucemoide por Bordetella pertussis", "D. LLC en lactante", "E. Agamaglobulinemia congénita"],
   "correct": "C",
   "wrong_hint": "Bordetella pertussis produce linfocitosis masiva que imita leucemia — reacción leucemoide. La LLC no existe en lactantes. Es un fenómeno infeccioso/reactivo, no neoplásico. El diagnóstico se confirma con la clínica de tos convulsiva y la serología."},
],

# ─────────────────────────────────────────────────────────────────────────
"linfomas": [
  {"type": "text", "html": """
<h3>Linfoma de Hodgkin: el cuadro más "armado" del EUNACOM</h3>
<p>El Linfoma de Hodgkin tiene una presentación característica que el EUNACOM usa casi siempre igual. Aprende este perfil:</p>
<ul>
<li><strong>Edad:</strong> adulto joven, típicamente 15–35 años</li>
<li><strong>Adenopatías:</strong> cervicales (o mediastínicas), firmes, indoloras, crecimiento progresivo en semanas-meses</li>
<li><strong>Síntomas B:</strong> fiebre + baja de peso &gt;10% en 6 meses + sudoración nocturna</li>
<li><strong>Rx tórax:</strong> mediastino ensanchado</li>
<li><strong>Hemograma:</strong> normal o leve alteración (no hay pancitopenia)</li>
</ul>
<p>El <strong>signo patognomónico</strong>: <em>dolor en las adenopatías al tomar alcohol</em>. Si aparece en la pregunta → la respuesta es Hodgkin.</p>
"""},

  {"type": "rapid_check", "id": "rc-lf1",
   "question": "Paciente de 16 años, fiebre, baja de peso, adenopatías cervicales progresivas por 3 meses. Refiere DOLOR en el cuello al tomar alcohol. Rx tórax: mediastino ensanchado. ¿Diagnóstico?",
   "options": ["A. Linfoma de Hodgkin", "B. Tuberculosis", "C. Mononucleosis infecciosa", "D. Enfermedad por arañazo de gato", "E. LLA"],
   "correct": "A",
   "wrong_hint": "El dolor con alcohol es el signo PATOGNOMÓNICO del Linfoma de Hodgkin — no lo tiene ningún otro diagnóstico. Además tiene el perfil clásico: adulto joven, adenopatías duras progresivas + síntomas B + mediastino ensanchado + hemograma normal. La TBC puede dar adenopatías sin ese signo. La MN es aguda (días) con odinofagia."},

  {"type": "text", "html": """
<h3>Diagnóstico diferencial de adenopatías</h3>
<table>
<thead><tr><th>Diagnóstico</th><th>Clínica característica</th><th>Cómo diferenciarlo</th></tr></thead>
<tbody>
<tr><td><strong>Linfoma Hodgkin</strong></td><td>Joven, progresivo, síntomas B, dolor con alcohol</td><td>Biopsia ganglionar: células de Reed-Sternberg</td></tr>
<tr><td><strong>Mononucleosis</strong></td><td>Adolescente, aguda (días), odinofagia intensa, esplenomegalia blanda</td><td>Paul-Bunnell / Monospot (+)</td></tr>
<tr><td><strong>TBC ganglionar</strong></td><td>Exposición, PPD (+), adenopatías cervicales</td><td>PPD, Rx tórax, biopsia (granuloma)</td></tr>
<tr><td><strong>Bartonella</strong></td><td>Niño/joven, contacto con gato, adenopatía axilar unilateral</td><td>Historia de arañazo, serología</td></tr>
</tbody>
</table>
<h3>¿Qué examen pides ante sospecha de linfoma?</h3>
<p>Ante sospecha de linfoma: <strong>biopsia ganglionar</strong> primero. No biopsia de médula ósea (eso es para estadificación). No TAC solo (para estadificación, no diagnóstico). La biopsia ganglionar da el diagnóstico histológico definitivo.</p>
"""},

  {"type": "rapid_check", "id": "rc-lf2",
   "question": "Paciente con adenopatías inguinales indoloras, baja de peso y fiebre. Hemograma normal. ¿Cuál es el primer examen para confirmar el diagnóstico?",
   "options": ["A. TAC de tórax-abdomen-pelvis", "B. Biopsia ganglionar", "C. Biopsia de médula ósea", "D. Electroforesis de proteínas", "E. PET scan"],
   "correct": "B",
   "wrong_hint": "Ante sospecha de linfoma, el diagnóstico definitivo siempre requiere biopsia ganglionar. El TAC es para estadificación pero no da el diagnóstico histológico. La biopsia de médula ósea puede ser parte del estudio pero no es el primer paso. Sin diagnóstico histológico no puedes iniciar tratamiento."},

  {"type": "text", "html": """
<h3>Linfomas de bajo grado: el hecho FALSO que siempre preguntan</h3>
<p>Te dan 5 afirmaciones sobre linfomas de bajo grado y piden cuál es FALSA. La falsa es siempre la misma:</p>
<table>
<thead><tr><th>Afirmación</th><th>¿Verdadera o Falsa?</th></tr></thead>
<tbody>
<tr><td>Al diagnóstico suelen estar diseminados</td><td>✅ Verdadera</td></tr>
<tr><td>Tienen sobrevidas de más de 10 años</td><td>✅ Verdadera</td></tr>
<tr><td>Se diagnostican mediante biopsia ganglionar</td><td>✅ Verdadera</td></tr>
<tr><td>Son frecuentes en adultos mayores</td><td>✅ Verdadera</td></tr>
<tr><td><em>La tasa de recaídas después del tratamiento es muy BAJA</em></td><td>❌ FALSA — la tasa de recaídas es MUY ALTA</td></tr>
</tbody>
</table>
<p>La paradoja de los linfomas de bajo grado: aunque tienen sobrevida larga y crecen despacio, <strong>casi siempre recaen</strong>. Son difíciles de curar definitivamente.</p>
"""},

  {"type": "rapid_check", "id": "rc-lf3",
   "question": "Respecto a los linfomas de bajo grado, ¿cuál de las siguientes es FALSA?",
   "options": ["A. Suelen estar diseminados al diagnóstico", "B. La tasa de recaídas después del tratamiento es muy baja", "C. Tienen sobrevidas de más de 10 años", "D. Se diagnostican mediante biopsia ganglionar", "E. Son frecuentes en adultos mayores"],
   "correct": "B",
   "wrong_hint": "Los linfomas de bajo grado tienen ALTA tasa de recaídas — esa es la afirmación falsa. Son la paradoja de la oncología: crecen lento, el paciente vive años, pero casi nunca se curan definitivamente. Todo lo demás es verdadero."},

  {"type": "rapid_check", "id": "rc-lf4",
   "question": "Adolescente de 15 años, fiebre de 4 días, odinofagia intensa, ictericia leve, esplenomegalia blanda. Hemograma con linfocitosis y linfocitos atípicos. ¿Diagnóstico más probable?",
   "options": ["A. Linfoma de Hodgkin", "B. LLA", "C. Mononucleosis infecciosa", "D. Anemia hemolítica autoinmune", "E. Hepatitis viral aguda"],
   "correct": "C",
   "wrong_hint": "Mononucleosis: AGUDA (días), tríada fiebre + odinofagia intensa + adenopatías. Además: esplenomegalia BLANDA (no dura como linfoma), ictericia leve, linfocitos atípicos (células de Downey). El linfoma de Hodgkin es insidioso (semanas-meses), adenopatías DURAS, sin odinofagia intensa. Confirmar con Paul-Bunnell/Monospot."},
],

# ─────────────────────────────────────────────────────────────────────────
"mieloma-mielofibrosis-smd": [
  {"type": "text", "html": """
<h3>Tres enfermedades de la médula ósea en adulto mayor</h3>
<p>Mieloma, Mielofibrosis y SMD afectan a adultos mayores y dan pancitopenia. Cada una tiene un hallazgo casi patognomónico:</p>
<table>
<thead><tr><th>Característica</th><th>🦴 Mieloma Múltiple</th><th>💧 Mielofibrosis</th><th>⚠️ SMD</th></tr></thead>
<tbody>
<tr><td><strong>Hallazgo especial</strong></td><td>Tríada: dolor óseo + anemia + hipercalcemia</td><td>Dacriocitos (hematíes en lágrima)</td><td>No responde a B12/folatos/hierro</td></tr>
<tr><td><strong>Esplenomegalia</strong></td><td>Puede haber</td><td>MASIVA</td><td>Variable, leve</td></tr>
<tr><td><strong>Lab clave</strong></td><td>Proteínas ↑, albúmina ↓, pico M</td><td>Frotis con dacriocitos</td><td>Pancitopenia macrocítica sin respuesta</td></tr>
<tr><td><strong>Calcio</strong></td><td>↑ Hipercalcemia</td><td>Normal</td><td>Normal</td></tr>
<tr><td><strong>Diagnóstico definitivo</strong></td><td>Electroforesis + biopsia médula</td><td>Biopsia médula (fibrosis)</td><td>Biopsia médula</td></tr>
</tbody>
</table>
"""},

  {"type": "rapid_check", "id": "rc-m1",
   "question": "Adulto mayor, dolores óseos difusos, anemia normocítica, hipercalcemia. Proteínas totales 10 g/dl, albúmina 2.8 g/dl. ¿Diagnóstico?",
   "options": ["A. Linfoma de Hodgkin", "B. Mielofibrosis", "C. Mieloma múltiple", "D. Hiperparatiroidismo", "E. Metástasis óseas"],
   "correct": "C",
   "wrong_hint": "La tríada de mieloma: dolor óseo + anemia + hipercalcemia. Proteínas totales ALTAS con albúmina BAJA es el patrón de gammapatía monoclonal (las globulinas anómalas aumentan proteínas). Se confirma con electroforesis de proteínas (pico M) y biopsia de médula ósea."},

  {"type": "text", "html": """
<h3>Mieloma smoldering: observar, no tratar</h3>
<p>El mieloma asintomático (smoldering): hay pico M en electroforesis pero <em>sin síntomas ni daño orgánico</em>. Conducta: <strong>observar, no tratar</strong>. El tratamiento se reserva para cuando hay daño orgánico — regla <strong>CRAB</strong>:</p>
<table>
<thead><tr><th>Letra</th><th>Significado</th></tr></thead>
<tbody>
<tr><td><strong>C</strong></td><td>Calcio elevado (hipercalcemia)</td></tr>
<tr><td><strong>R</strong></td><td>Renal (insuficiencia renal)</td></tr>
<tr><td><strong>A</strong></td><td>Anemia</td></tr>
<tr><td><strong>B</strong></td><td>Bone (lesiones óseas líticas)</td></tr>
</tbody>
</table>
"""},

  {"type": "rapid_check", "id": "rc-m2",
   "question": "Paciente de 67 años, examen de chequeo. Electroforesis: pico monoclonal. Sin dolores óseos, sin anemia, calcio normal, función renal normal. ¿Conducta?",
   "options": ["A. Iniciar quimioterapia", "B. Observar evolución", "C. Iniciar hidroxiurea", "D. Solicitar trasplante de médula", "E. Iniciar AAS"],
   "correct": "B",
   "wrong_hint": "Mieloma smoldering sin daño orgánico (sin CRAB) = OBSERVACIÓN. Tratar prematuramente tiene toxicidad sin beneficio demostrado. El tratamiento se inicia cuando aparece el daño orgánico."},

  {"type": "text", "html": """
<h3>Mielofibrosis: los dacriocitos te lo dicen todo</h3>
<p>En la mielofibrosis el tejido medular es reemplazado por fibrosis. El bazo y el hígado compensan (hematopoyesis extramedular) → <strong>esplenomegalia masiva</strong>.</p>
<p>Los eritrocitos se deforman al salir de la médula fibrótica y quedan con forma de <strong>lágrima (teardrop / dacriocito)</strong>. Este hallazgo en el frotis = mielofibrosis hasta demostrar lo contrario.</p>
"""},

  {"type": "rapid_check", "id": "rc-m3",
   "question": "Paciente con esplenomegalia masiva, astenia, pancitopenia. El frotis muestra hematíes con forma de lágrima (dacriocitos). ¿Diagnóstico más probable?",
   "options": ["A. Leucemia mieloide crónica", "B. Mieloma múltiple", "C. Mielofibrosis", "D. Mielodisplasia", "E. Asplenia"],
   "correct": "C",
   "wrong_hint": "Los dacriocitos (hematíes en lágrima) son el hallazgo PATOGNOMÓNICO de mielofibrosis. Se forman cuando los GR atraviesan la médula fibrótica. La esplenomegalia masiva se debe a hematopoyesis extramedular. La asplenia causaría cuerpos de Howell-Jolly, sin esplenomegalia."},

  {"type": "rapid_check", "id": "rc-m4",
   "question": "Hombre 65 años, pancitopenia: Hto 27%, blancos 3.500, plaquetas 87.000. VCM 103 fl. B12 + folatos + hierro oral por 60 días: sin mejoría. ¿Siguiente paso?",
   "options": ["A. Cambiar B12 a vía parenteral", "B. Aumentar dosis de folatos", "C. Solicitar biopsia de médula ósea", "D. Iniciar eritropoyetina", "E. Solicitar homocisteína"],
   "correct": "C",
   "wrong_hint": "Ausencia total de respuesta tras 60 días de B12 + folatos + hierro oral descarta déficit nutricional. Si fuera B12 o folatos, habría reticulocitosis en 5–7 días. El diagnóstico es SMD u otra patología medular. La biopsia de médula ósea es el único examen que confirma. B12 parenteral se usaría si sospecháramos malabsorción — pero sin respuesta en 60 días ya lo descarta."},
],

# ─────────────────────────────────────────────────────────────────────────
"hemostasia": [
  {"type": "text", "html": """
<h3>Hemostasia primaria vs secundaria: la distinción más importante del tema</h3>
<p>Todo el tema de coagulopatías gira en torno a entender qué falla en la hemostasia primaria (plaquetas) vs secundaria (factores de coagulación):</p>
<table>
<thead><tr><th>Característica</th><th>🟣 Trastorno Plaquetario</th><th>🔵 Trastorno Coagulación</th></tr></thead>
<tbody>
<tr><td><strong>Tipo de lesión</strong></td><td>Superficial, mucosas</td><td>Profunda, tejidos</td></tr>
<tr><td><strong>Manifestaciones</strong></td><td>Petequias, equimosis, epistaxis, gingivorragia, menorragia</td><td>Hematomas profundos, hemartrosis, hemorragia muscular</td></tr>
<tr><td><strong>Inicio del sangrado</strong></td><td>Inmediato al trauma</td><td>Tardío (horas después)</td></tr>
<tr><td><strong>Examen alterado</strong></td><td>Tiempo de sangría ↑</td><td>TTPA ↑ (vía intrínseca) o TP ↑ (vía extrínseca)</td></tr>
<tr><td><strong>Plaquetas</strong></td><td>↓ Bajas o función alterada</td><td>Normales</td></tr>
<tr><td><strong>TP / TTPA</strong></td><td>Normales</td><td>Alterados</td></tr>
</tbody>
</table>
<p>Regla de oro: <strong>petequias = plaquetas</strong>. <strong>Hemartrosis = coagulación</strong>. Nunca se confunden si memorizas eso.</p>
"""},

  {"type": "rapid_check", "id": "rc-h1",
   "question": "Niño de 9 años, epistaxis y gingivorragia desde pequeño, petequias recurrentes. ¿Cuál examen estará alterado?",
   "options": ["A. Recuento de plaquetas", "B. Tiempo de protrombina (TP)", "C. TTPA", "D. Tiempo de sangría", "E. Fibrinogenemia"],
   "correct": "D",
   "wrong_hint": "Epistaxis + gingivorragia + petequias = trastorno plaquetario (hemostasia primaria). El examen de hemostasia primaria es el TIEMPO DE SANGRÍA. El recuento de plaquetas puede ser normal si el trastorno es funcional. El TP y TTPA evalúan la coagulación — estarán normales en trastornos plaquetarios."},

  {"type": "text", "html": """
<h3>PTI: la diferencia crítica entre niño y adulto</h3>
<table>
<thead><tr><th>Característica</th><th>PTI en Niño</th><th>PTI en Adulto</th></tr></thead>
<tbody>
<tr><td><strong>Causa desencadenante</strong></td><td>Post-infección viral (autolimitado)</td><td>Autoinmune crónico</td></tr>
<tr><td><strong>Evolución</strong></td><td>Autolimitado en semanas</td><td>Crónico, necesita tratamiento</td></tr>
<tr><td><strong>Plaq &gt;20k sin sangrado</strong></td><td>OBSERVAR + reposo</td><td>CORTICOIDES orales</td></tr>
<tr><td><strong>Hemorragia grave o plaq &lt;10k</strong></td><td>Ig IV o corticoides</td><td>Corticoides, Ig IV, esplenectomía</td></tr>
<tr><td><strong>Transfusión de plaquetas</strong></td><td>Solo en hemorragia que amenace la vida</td><td>Igual, no de rutina</td></tr>
</tbody>
</table>
<p><strong>Jamás dar aspirina</strong> en PTI — inhibe la función de las pocas plaquetas que quedan.</p>
"""},

  {"type": "rapid_check", "id": "rc-h2",
   "question": "Niño de 6 años con PTI, plaquetas 30.000/mm³, sin manifestaciones hemorrágicas graves. ¿Conducta más adecuada?",
   "options": ["A. Transfusión inmediata de plaquetas", "B. Iniciar prednisona oral", "C. Iniciar aspirina", "D. Indicar reposo y observar evolución", "E. Esplenectomía"],
   "correct": "D",
   "wrong_hint": "PTI en niño con plaquetas &gt;20.000 y SIN sangrado activo grave = OBSERVAR. El PTI pediátrico es autolimitado y resuelve espontáneamente en semanas. Los corticoides se reservan para sangrado activo o plaquetas &lt;10–20k. La aspirina está CONTRAINDICADA. La esplenectomía es el último recurso en casos crónicos refractarios."},

  {"type": "text", "html": """
<h3>Hemofilia: genética, clínica y laboratorio</h3>
<table>
<thead><tr><th>Característica</th><th>Hemofilia A</th><th>Hemofilia B</th><th>Von Willebrand</th></tr></thead>
<tbody>
<tr><td><strong>Factor deficiente</strong></td><td>Factor VIII</td><td>Factor IX</td><td>Factor von Willebrand</td></tr>
<tr><td><strong>Herencia</strong></td><td>Ligada al X recesiva</td><td>Ligada al X recesiva</td><td>Autosómica dominante</td></tr>
<tr><td><strong>Afecta a</strong></td><td>Casi solo hombres</td><td>Casi solo hombres</td><td>Ambos sexos</td></tr>
<tr><td><strong>Clínica</strong></td><td>Hemartrosis, hematomas profundos</td><td>Igual que A</td><td>Epistaxis, menorragia, equimosis</td></tr>
<tr><td><strong>Tiempo sangría</strong></td><td>Normal</td><td>Normal</td><td>↑ Prolongado</td></tr>
<tr><td><strong>TTPA</strong></td><td>↑ Prolongado</td><td>↑ Prolongado</td><td>↑ Prolongado</td></tr>
<tr><td><strong>TP</strong></td><td>Normal</td><td>Normal</td><td>Normal</td></tr>
</tbody>
</table>
<p>La diferencia clave: en hemofilia el tiempo de sangría es <strong>normal</strong>. En Von Willebrand, el tiempo de sangría está <strong>prolongado</strong> porque el VWF también es necesario para la adhesión plaquetaria.</p>
"""},

  {"type": "rapid_check", "id": "rc-h3",
   "question": "Niño de 6 años con varios hematomas musculares espontáneos y hemartrosis recurrentes desde pequeño. ¿Cuál examen estará alterado?",
   "options": ["A. Recuento de plaquetas", "B. Tiempo de sangría", "C. TTPA", "D. Fibrinogenemia", "E. Tiempo de protrombina"],
   "correct": "C",
   "wrong_hint": "Hemartrosis + hematomas profundos = trastorno de COAGULACIÓN. El examen de la vía intrínseca es el TTPA. Tanto hemofilia A (F.VIII) como B (F.IX) prolongan el TTPA. El tiempo de sangría y las plaquetas son normales porque la hemostasia primaria está intacta."},

  {"type": "text", "html": """
<h3>Truco genético de hemofilia: el padre hemofílico y el hijo varón</h3>
<p>Trampa de genética frecuente en el EUNACOM. La hemofilia está ligada al X:</p>
<ul>
<li>Padre hemofílico (X<sup>h</sup>Y) + Madre normal (XX):</li>
<li>Hijas: reciben X<sup>h</sup> del padre + X normal de la madre → <strong>portadoras</strong> (no enfermas)</li>
<li>Hijos varones: reciben Y del padre + X normal de la madre → <strong>sanos</strong> (0% hemofilia)</li>
</ul>
<p>Resultado: <strong>si el padre es hemofílico y espera un hijo VARÓN → 0% de probabilidad de hemofilia</strong>. El X enfermo solo lo heredan las hijas.</p>
<h3>Anticoagulación: ¿qué examen monitoreas con qué droga?</h3>
<table>
<thead><tr><th>Droga</th><th>Mecanismo</th><th>Examen de control</th></tr></thead>
<tbody>
<tr><td><strong>Heparina no fraccionada</strong></td><td>Potencia antitrombina III</td><td>TTPA</td></tr>
<tr><td><strong>Warfarina / Acenocumarol</strong></td><td>Inhibe factores vitamina K dependientes</td><td>TP / INR</td></tr>
<tr><td><strong>HBPM (enoxaparina)</strong></td><td>Inhibe F.Xa principalmente</td><td>Anti-Xa</td></tr>
</tbody>
</table>
<p><strong>Trampa clásica:</strong> Paciente en acenocumarol con TTPA alargado → <strong>mantener el tratamiento</strong>. El acenocumarol se monitorea con INR, no TTPA. Si el INR está en rango, el paciente está bien anticoagulado.</p>
"""},

  {"type": "rapid_check", "id": "rc-h4",
   "question": "Paciente hemofílico: ¿qué probabilidad tiene de tener un hijo varón hemofílico si la madre es sana (no portadora)?",
   "options": ["A. 100%", "B. 50%", "C. 25%", "D. 0%", "E. 75%"],
   "correct": "D",
   "wrong_hint": "El padre hemofílico tiene X(h)Y. Al hijo varón le da el cromosoma Y, no el X. La madre no portadora le da un X normal. El hijo varón (XY) recibe X normal de la madre + Y del padre = sano. Por eso la respuesta es 0%."},

  {"type": "rapid_check", "id": "rc-h5",
   "question": "Paciente con déficit de antitrombina III en tratamiento con acenocumarol. Se solicita TTPA y resulta alargado. ¿Conducta correcta?",
   "options": ["A. Iniciar heparina además", "B. Aumentar dosis de acenocumarol", "C. Disminuir dosis de acenocumarol", "D. Mantener el tratamiento sin cambios", "E. Suspender anticoagulación y dar vitamina K"],
   "correct": "D",
   "wrong_hint": "El acenocumarol se monitorea con TP/INR, no con TTPA. El TTPA puede alargarse secundariamente con cumarínicos, pero ese no es el examen correcto. Si el INR está en rango terapéutico, el paciente está bien anticoagulado y no hay que cambiar nada. Modificar la dosis basándose en el TTPA sería un error clínico grave."},
],

# ─────────────────────────────────────────────────────────────────────────
"hematologia-pediatrica": [
  {"type": "text", "html": """
<h3>Ictericia neonatal: el timing lo es todo</h3>
<p>La ictericia neonatal se clasifica por el momento en que aparece — eso te dice la causa:</p>
<table>
<thead><tr><th>Timing</th><th>Causa principal</th><th>Mecanismo</th></tr></thead>
<tbody>
<tr><td><strong>&lt; 24 horas de vida</strong></td><td>Hemólisis activa (incompatibilidad ABO o Rh)</td><td>Anticuerpos maternos IgG cruzan placenta y destruyen GR fetales</td></tr>
<tr><td><strong>24–72 horas</strong></td><td>Fisiológica (la más frecuente en general)</td><td>GR fetales se destruyen, glucuroniltransferasa inmadura</td></tr>
<tr><td><strong>&gt; 1 semana</strong></td><td>Lactancia materna, hipotiroidismo, colestasis</td><td>Diversas</td></tr>
</tbody>
</table>
<p><strong>Truco del EUNACOM:</strong> La causa más frecuente de ictericia en las primeras 24 horas es la <strong>incompatibilidad ABO</strong>, no la Rh. ¿Por qué? Porque los anticuerpos anti-A y anti-B son IgG de forma natural (sin sensibilización previa) → presentes desde el primer embarazo. La incompatibilidad Rh es menos frecuente gracias a la profilaxis con anti-D.</p>
"""},

  {"type": "rapid_check", "id": "rc-p1",
   "question": "Recién nacido de 18 horas de vida presenta ictericia. ¿Cuál es la causa más frecuente?",
   "options": ["A. Ictericia fisiológica", "B. Incompatibilidad de grupo Rh", "C. Incompatibilidad de grupo ABO", "D. Hipotiroidismo congénito", "E. Infección intrauterina"],
   "correct": "C",
   "wrong_hint": "Ictericia en las primeras 24 horas = hemólisis. La causa más FRECUENTE es incompatibilidad ABO (no Rh). Los anticuerpos anti-A y anti-B son IgG naturales que cruzan la placenta sin sensibilización previa. La ictericia fisiológica aparece DESPUÉS de las 24 horas, nunca antes."},

  {"type": "text", "html": """
<h3>Profilaxis Rh: los detalles que importan</h3>
<p>La inmunoglobulina anti-D previene la sensibilización materna. Detalles que pregunta el EUNACOM:</p>
<ul>
<li>Se da a mujeres <strong>Rh NEGATIVAS</strong></li>
<li>Que sean <strong>NO sensibilizadas</strong> (Coombs indirecto NEGATIVO)</li>
<li>Si ya está sensibilizada (Coombs indirecto +), la profilaxis no sirve</li>
<li>Se administra a las <strong>28 semanas</strong> de gestación</li>
<li>Y dentro de las <strong>72 horas postparto</strong> si el RN es Rh(+)</li>
<li>También ante: amniocentesis, aborto, versión cefálica externa</li>
</ul>
"""},

  {"type": "rapid_check", "id": "rc-p2",
   "question": "¿Cuál de las siguientes pacientes se beneficia de la profilaxis con inmunoglobulina anti-D?",
   "options": ["A. Mujer Rh(+), Coombs indirecto negativo, 28 semanas", "B. Mujer Rh(-), Coombs indirecto POSITIVO, 28 semanas", "C. Mujer Rh(-), Coombs indirecto NEGATIVO, 28 semanas", "D. Mujer Rh(+), Coombs indirecto positivo, 28 semanas", "E. Mujer Rh(-), Coombs indirecto negativo, antes del embarazo"],
   "correct": "C",
   "wrong_hint": "La profilaxis anti-D sirve para PREVENIR la sensibilización. Solo funciona en mujeres Rh(-) NO sensibilizadas (Coombs indirecto NEGATIVO). Si ya está sensibilizada (Coombs + = ya tiene anticuerpos anti-D), la profilaxis no ayuda. Las Rh(+) no la necesitan."},

  {"type": "text", "html": """
<h3>Poliglobulia neonatal: ¿quién tiene riesgo y quién no?</h3>
<p>Poliglobulia neonatal = Hcto &gt;65% en las primeras horas. Factores de riesgo son situaciones de <strong>hipoxia fetal crónica</strong>:</p>
<table>
<thead><tr><th>Factor de RIESGO ✅</th><th>¿Por qué?</th></tr></thead>
<tbody>
<tr><td>Hijo de madre diabética</td><td>Hiperglicemia fetal → hiperinsulinismo → ↑ eritropoyetina</td></tr>
<tr><td>Preeclampsia</td><td>Hipoxia placentaria crónica → ↑ eritropoyesis</td></tr>
<tr><td>RCIU</td><td>Hipoxia placentaria → ↑ eritropoyesis</td></tr>
<tr><td>RN postérmino</td><td>Insuficiencia placentaria tardía → hipoxia</td></tr>
</tbody>
</table>
<p><strong>La trampa del EUNACOM: la prematurez NO es factor de riesgo.</strong> Los prematuros tienen <em>menos</em> eritropoyesis y Hcto más bajo porque sus reservas de hierro son menores (se acumulan en el 3er trimestre).</p>
"""},

  {"type": "rapid_check", "id": "rc-p3",
   "question": "¿Cuál de las siguientes opciones NO es factor de riesgo para poliglobulia neonatal?",
   "options": ["A. Hijo de madre diabética", "B. Preeclampsia materna", "C. Prematurez", "D. Retraso del crecimiento intrauterino", "E. Recién nacido postérmino"],
   "correct": "C",
   "wrong_hint": "Los prematuros tienen Hcto MÁS BAJO, no más alto. Sus reservas de hierro son menores (se acumulan en el 3er trimestre), tienen menor masa eritrocitaria y tienden a la anemia. Los factores de riesgo de poliglobulia son hipoxia crónica fetal (preeclampsia, RCIU, postérmino) o hiperproducción (hijo de madre diabética). La prematurez es factor de riesgo de ANEMIA, no de poliglobulia."},

  {"type": "text", "html": """
<h3>Hierro en el prematuro: cuándo empezar</h3>
<p>El hierro corporal se acumula durante el <strong>tercer trimestre</strong> — el prematuro se pierde parte de ese proceso:</p>
<ul>
<li><strong>Prematuro con LME:</strong> iniciar hierro al <strong>doblar el peso de nacimiento</strong></li>
<li><strong>RN término con LME:</strong> iniciar a los <strong>4 meses</strong></li>
<li><strong>RN con fórmula:</strong> la fórmula ya viene suplementada</li>
</ul>
<h3>Inmunodeficiencias: qué germen te dice qué déficit</h3>
<table>
<thead><tr><th>Tipo de inmunodeficiencia</th><th>Gérmenes característicos</th></tr></thead>
<tbody>
<tr><td><strong>Déficit humoral (anticuerpos)</strong></td><td>Bacterias encapsuladas (Pneumococo, Haemophilus)</td></tr>
<tr><td><strong>Déficit celular (linfocitos T)</strong></td><td>Virus, hongos, parásitos, mycobacterias</td></tr>
<tr><td><strong>Déficit de fagocitosis</strong></td><td>Bacterias catalasa(+): Staph, Aspergillus</td></tr>
<tr><td><strong>Déficit de complemento</strong></td><td>Neisseria (meningococo, gonococo)</td></tr>
</tbody>
</table>
"""},

  {"type": "rapid_check", "id": "rc-p4",
   "question": "¿Cuándo se inicia la suplementación con hierro en un lactante PREMATURO con lactancia materna exclusiva?",
   "options": ["A. Al cumplir 2 semanas de vida", "B. Al doblar el peso de nacimiento", "C. A los 4 meses de edad", "D. A los 6 meses de edad", "E. No requiere suplementación"],
   "correct": "B",
   "wrong_hint": "En el prematuro con LME, las reservas de hierro son menores porque se acumulan en el 3er trimestre. Se inicia hierro al doblar el peso de nacimiento (~2–3 meses de edad corregida). En el RN término con LME se espera hasta los 4 meses. El prematuro necesita suplementación más precoz."},

  {"type": "rapid_check", "id": "rc-p5",
   "question": "Paciente con infecciones por Neisseria meningitidis a repetición. ¿Qué tipo de inmunodeficiencia debe sospecharse primero?",
   "options": ["A. Déficit de IgA", "B. Déficit de complemento (C5-C9)", "C. Alteraciones de la fagocitosis", "D. Déficit de linfocitos T", "E. Déficit de subclases de IgG"],
   "correct": "B",
   "wrong_hint": "Neisseria meningitidis es destruida principalmente por lisis mediada por el Complejo de Ataque de Membrana (MAC = C5–C9). El déficit de estos componentes produce susceptibilidad específica a Neisseria a repetición. El déficit de IgA da infecciones respiratorias/digestivas recurrentes. La fagocitosis alterada afecta a bacterias catalasa-positivas (Staphylococcus, Aspergillus)."},
],

}
