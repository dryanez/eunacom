// Data ported verbatim from the approved design bundle (EUNACOM Sitio.html).
// Keep this file in sync with the design; it is the source of truth for copy.


export const UNIVERSIDADES = ["Universidad de Chile","Pontificia U. Católica","U. de Concepción","U. de Santiago","U. Austral de Chile","U. de Valparaíso"];

export const CURSOS = [
  {
    slug:"anual",
    kicker:"Curso teórico · anual",
    estado:"Inscripciones abiertas",
    nombre:"Curso teórico online anual 2027",
    resumen:"Doce meses de preparación que cubren las dos convocatorias del año: si rindes en julio y necesitas volver a rendir en diciembre, el curso sigue activo. Incluye todo el material, banco de preguntas y seguimiento semanal.",
    duracion:"12 meses", inicio:"11 de enero de 2027", termino:"20 de diciembre de 2027",
    examen:"Julio y diciembre 2027", modalidad:"Online, plataforma e-learning", cupos:"Sin límite",
    precioClp:"$1.190.000", precioUsd:"≈ US$ 1.240", precioNota:"Hasta 12 cuotas con Webpay. También en dos pagos de $595.000.",
    intro:[
      "Es el curso más completo y el que recomendamos a quien no quiere depender de una sola oportunidad. Cubre la convocatoria de julio y la de diciembre del mismo año, con el calendario reordenado después de julio según cómo te haya ido.",
      "El curso se dicta a través de la plataforma e-learning y contempla un calendario con todos los temas a evaluar en el EUNACOM. Todo el material está disponible desde el primer día; lo que se calendariza es tu tiempo."
    ],
    incluye:[
      "86 clases grabadas, una por tema del temario oficial",
      "Seis manuales maquetados en PDF, descargables",
      "Banco de 4.000+ preguntas comentadas",
      "Doce simulacros cronometrados con informe por eje",
      "Calendario anual ajustado a tu diagnóstico inicial",
      "Revisión semanal de avance con devolución escrita",
      "Módulo de sistema de salud chileno, GES y medicina legal",
      "Reordenamiento del plan después de la convocatoria de julio",
      "Preparación introductoria al EUNACOM práctico",
      "Acceso a la plataforma durante los doce meses"
    ],
    comoFunciona:[
      "El curso parte con un diagnóstico: un simulacro corto y treinta preguntas por eje. Sobre ese resultado se arma tu calendario, no sobre un temario genérico.",
      "Cada bloque de estudio junta clase, capítulo del manual y preguntas del mismo tema. Terminas el bloque habiendo visto, leído y respondido sobre el mismo contenido.",
      "Cada semana entregas un simulacro corto y recibes por escrito qué falló y qué se mueve del calendario. Después de la convocatoria de julio el plan se rehace completo con tus resultados reales."
    ],
    paraQuien:"Quien quiere cubrir las dos convocatorias del año sin volver a pagar, y quien viene de un intento no aprobado y necesita rehacer bases con tiempo.",
    temarioNota:"Doce meses. Los primeros seis apuntan a julio; los siguientes se reordenan según tu resultado.",
    temario:[
      {s:"Enero–febrero",t:"Diagnóstico y medicina interna I",d:"Cardiovascular y respiratorio. Simulacro inicial y armado del calendario."},
      {s:"Marzo",t:"Medicina interna II",d:"Digestivo, nefrología, endocrinología."},
      {s:"Abril",t:"Infectología y medicina interna III",d:"Infecciones frecuentes, hematología, reumatología."},
      {s:"Mayo",t:"Cirugía y traumatología",d:"Abdomen agudo, trauma, urgencias quirúrgicas, urología."},
      {s:"Junio",t:"Pediatría y repaso",d:"Recién nacido, desarrollo, patología respiratoria e infecciosa. Simulacros completos."},
      {s:"Julio",t:"Convocatoria de julio",d:"Semana de repaso dirigido, estrategia de examen y rendición."},
      {s:"Agosto",t:"Reordenamiento del plan",d:"Análisis de tu resultado real y calendario nuevo hacia diciembre."},
      {s:"Sept.–octubre",t:"Ginecología, obstetricia y salud pública",d:"Control prenatal, urgencias obstétricas, red asistencial, GES, notificación."},
      {s:"Noviembre",t:"Psiquiatría, neurología y dermatología",d:"Ánimo, urgencia psiquiátrica, ACV, cefaleas, dermatosis frecuentes."},
      {s:"Diciembre",t:"Repaso final y examen",d:"Solo tus errores acumulados. Dos simulacros completos y cierre."}
    ],
    cierreTitulo:"Inscripciones abiertas para el curso anual 2027.",
    cierreTexto:"El pago se hace en línea con Webpay o por transferencia. El acceso a la plataforma y el calendario completo llegan a tu correo el mismo día."
  },
  {
    slug:"seis-julio",
    kicker:"Curso teórico · seis meses",
    estado:"Inscripciones abiertas",
    nombre:"Curso teórico online 6 meses · EUNACOM julio 2027",
    resumen:"Seis meses dirigidos a la convocatoria de julio. Mismo material y mismo seguimiento que el curso anual, concentrado en un semestre de estudio con carga de diez a quince horas semanales.",
    duracion:"6 meses", inicio:"11 de enero de 2027", termino:"5 de julio de 2027",
    examen:"Julio 2027", modalidad:"Online, plataforma e-learning", cupos:"Sin límite",
    precioClp:"$690.000", precioUsd:"≈ US$ 720", precioNota:"Hasta 6 cuotas con Webpay. También en dos pagos de $345.000.",
    intro:[
      "Seis meses ordenados por el peso real de cada eje en el perfil de conocimientos vigente, no por el orden en que se enseña la medicina en la universidad. Antes de la primera clase hacemos un diagnóstico y el calendario se arma sobre tu resultado.",
      "Es el curso que toma la mayoría: alcanza cómodamente si vienes con bases razonables y puedes sostener entre diez y quince horas semanales de estudio."
    ],
    incluye:[
      "86 clases grabadas, una por tema del temario oficial",
      "Seis manuales maquetados en PDF, descargables",
      "Banco de 4.000+ preguntas comentadas",
      "Ocho simulacros cronometrados con informe por eje",
      "Calendario de seis meses ajustado a tu diagnóstico",
      "Revisión semanal de avance con devolución escrita",
      "Módulo de sistema de salud chileno, GES y medicina legal",
      "Acceso a la plataforma hasta el día de tu examen"
    ],
    comoFunciona:[
      "Estudias cuando puedes. El calendario reparte diez a quince horas semanales en bloques de noventa minutos, pensado para quien está con turnos o trabajando.",
      "Cada bloque junta clase, capítulo del manual y preguntas del mismo tema, para que la corrección llegue mientras el contenido está fresco.",
      "Los domingos cierras con un simulacro corto. Lo revisamos y el lunes tienes por escrito qué falló y qué se mueve del calendario."
    ],
    paraQuien:"Quien rinde en julio con bases razonablemente firmes, con o sin intento previo, y puede sostener diez a quince horas semanales.",
    temarioNota:"Seis meses. El último es solo repaso de tus errores acumulados.",
    temario:[
      {s:"Mes 1",t:"Diagnóstico y medicina interna I",d:"Cardiovascular y respiratorio. Simulacro inicial y armado del calendario."},
      {s:"Mes 2",t:"Medicina interna II e infectología",d:"Digestivo, nefrología, endocrinología, infecciones frecuentes."},
      {s:"Mes 3",t:"Cirugía y traumatología",d:"Abdomen agudo, trauma, urgencias quirúrgicas, urología."},
      {s:"Mes 4",t:"Pediatría y gineco-obstetricia",d:"Recién nacido, desarrollo, control prenatal, urgencias obstétricas."},
      {s:"Mes 5",t:"Salud pública y ejes menores",d:"Red asistencial, GES, notificación, psiquiatría, neurología, dermatología."},
      {s:"Mes 6",t:"Repaso dirigido y examen",d:"Solo tus errores acumulados. Simulacros completos y estrategia de examen."}
    ],
    cierreTitulo:"Empieza el 11 de enero de 2027.",
    cierreTexto:"El pago se hace en línea con Webpay o por transferencia. El acceso a la plataforma y el calendario completo llegan a tu correo el mismo día."
  },
  {
    slug:"seis-diciembre",
    kicker:"Curso teórico · seis meses",
    estado:"Últimos cupos",
    nombre:"Curso teórico online 6 meses · EUNACOM diciembre 2026",
    resumen:"Seis meses dirigidos a la convocatoria de diciembre de este año. El calendario ya está en marcha, así que el ingreso tardío se compensa concentrando los primeros ejes y ajustando la carga semanal.",
    duracion:"6 meses (calendario comprimido si ingresas ahora)", inicio:"1 de septiembre de 2026", termino:"6 de diciembre de 2026",
    examen:"Diciembre 2026", modalidad:"Online, plataforma e-learning", cupos:"Últimos cupos",
    precioClp:"$690.000", precioUsd:"≈ US$ 720", precioNota:"Hasta 6 cuotas con Webpay. Ingreso tardío sin recargo.",
    intro:[
      "Es el mismo curso de seis meses dirigido a la convocatoria de diciembre de 2026. Si ingresas ahora, el calendario se comprime: los ejes de mayor peso se abren primero y la carga semanal se ajusta a las semanas que quedan.",
      "Antes de empezar hacemos el diagnóstico igual que siempre. Si el resultado muestra que no alcanza con el tiempo restante, te lo vamos a decir y te recomendaremos el curso de julio 2027 en lugar de venderte este."
    ],
    incluye:[
      "86 clases grabadas, disponibles desde el primer día",
      "Seis manuales maquetados en PDF, descargables",
      "Banco de 4.000+ preguntas comentadas",
      "Seis simulacros cronometrados con informe por eje",
      "Calendario comprimido ajustado a las semanas que quedan",
      "Revisión semanal de avance con devolución escrita",
      "Módulo de sistema de salud chileno, GES y medicina legal",
      "Acceso a la plataforma hasta el día del examen"
    ],
    comoFunciona:[
      "El calendario prioriza los ejes de mayor peso y deja los menores para las últimas semanas, que es el orden inverso al que la mayoría usa por su cuenta.",
      "La carga sube a quince o dieciocho horas semanales. Es exigente y conviene saberlo antes de pagar, no después.",
      "La última semana es exclusivamente repaso de tus errores acumulados y estrategia de examen: nada de contenido nuevo antes de rendir."
    ],
    paraQuien:"Quien ya está inscrito en la convocatoria de diciembre 2026 y puede sostener quince a dieciocho horas semanales hasta el examen.",
    temarioNota:"Calendario comprimido a las semanas que quedan hasta diciembre.",
    temario:[
      {s:"Semanas 1–2",t:"Diagnóstico y medicina interna I",d:"Cardiovascular y respiratorio. Simulacro inicial."},
      {s:"Semanas 3–4",t:"Medicina interna II e infectología",d:"Digestivo, nefrología, endocrinología, infecciones frecuentes."},
      {s:"Semanas 5–6",t:"Cirugía y traumatología",d:"Abdomen agudo, trauma, urgencias quirúrgicas."},
      {s:"Semanas 7–8",t:"Pediatría",d:"Recién nacido, desarrollo, patología respiratoria e infecciosa."},
      {s:"Semanas 9–10",t:"Ginecología y obstetricia",d:"Control prenatal, urgencias obstétricas, patología cervicouterina."},
      {s:"Semanas 11–12",t:"Salud pública y sistema chileno",d:"Red asistencial, GES, notificación obligatoria, medicina legal."},
      {s:"Semana 13",t:"Ejes menores",d:"Psiquiatría, neurología, dermatología, oftalmología."},
      {s:"Semana 14",t:"Repaso dirigido y examen",d:"Solo tus errores. Dos simulacros completos y estrategia."}
    ],
    cierreTitulo:"Últimos cupos para diciembre 2026.",
    cierreTexto:"El pago se hace en línea con Webpay o por transferencia. Si el diagnóstico muestra que el tiempo no alcanza, te devolvemos el pago íntegro y te reservamos el curso de julio 2027."
  },
  {
    slug:"banco",
    kicker:"Banco de preguntas",
    estado:"Acceso inmediato",
    nombre:"Banco de preguntas y simulacros",
    resumen:"Cuatro mil preguntas comentadas y seis simulacros cronometrados, sin clases ni seguimiento. Para quien ya tiene el contenido resuelto y necesita volumen de práctica.",
    duracion:"6 meses de acceso", inicio:"Inmediato", termino:"6 meses después del pago",
    examen:"Cualquier convocatoria", modalidad:"Autoguiado", cupos:"Sin límite",
    precioClp:"$280.000", precioUsd:"≈ US$ 290", precioNota:"Pago único. Se descuenta del valor si después subes a un curso teórico.",
    intro:[
      "Es la parte del programa que más mueve el puntaje en poco tiempo: preguntas comentadas, con explicación de por qué cada distractor está mal, filtrables por eje y por dificultad.",
      "No incluye clases, manuales ni corrección personalizada de simulacros. Si vienes de cero, este no es tu producto: el curso teórico sí."
    ],
    incluye:[
      "4.000+ preguntas comentadas, filtrables por eje y dificultad",
      "Seis simulacros cronometrados en formato del examen real",
      "Informe automático de resultados por eje",
      "Modo error: repite solo las preguntas que fallaste",
      "Actualización de preguntas durante los seis meses",
      "Sin clases, sin manuales, sin corrección personalizada"
    ],
    comoFunciona:[
      "Eliges eje y dificultad, respondes por tandas y revisas el comentario de cada pregunta al terminar la tanda.",
      "Los simulacros son cronometrados y en el formato del examen real: la fatiga de tres horas es parte de lo que hay que entrenar.",
      "El modo error rearma tandas solo con lo que fallaste, poniendo primero las preguntas más antiguas."
    ],
    paraQuien:"Quien ya estudió el contenido y necesita volumen de práctica, o quien rinde por segunda vez con las bases firmes.",
    temarioNota:"Distribución de preguntas por eje, según peso en el perfil vigente.",
    temario:[
      {s:"Medicina interna",t:"1.180 preguntas",d:"Cardiovascular, respiratorio, digestivo, nefro, endocrino, infecto."},
      {s:"Cirugía",t:"640 preguntas",d:"Abdomen agudo, trauma, urgencias quirúrgicas, urología."},
      {s:"Pediatría",t:"720 preguntas",d:"Neonatología, desarrollo, respiratorio, infeccioso."},
      {s:"Gineco-obstetricia",t:"610 preguntas",d:"Prenatal, urgencias obstétricas, oncología ginecológica."},
      {s:"Salud pública",t:"430 preguntas",d:"Red asistencial, GES, epidemiología, notificación."},
      {s:"Psiquiatría",t:"250 preguntas",d:"Ánimo, ansiedad, urgencia psiquiátrica, adicciones."},
      {s:"Neurología",t:"110 preguntas",d:"ACV, cefaleas, convulsiones, demencias."},
      {s:"Otros ejes",t:"90 preguntas",d:"Dermatología, oftalmología, otorrino. Geriatría distribuida."}
    ],
    cierreTitulo:"Acceso inmediato al pagar.",
    cierreTexto:"El pago se hace en línea con Webpay. El acceso al banco queda activo en el momento en que se confirma la transacción."
  },
  {
    slug:"practico",
    kicker:"Curso práctico · ECOE",
    estado:"Inscripciones próximamente",
    nombre:"Curso práctico EUNACOM · simulaciones ECOE",
    resumen:"Simulaciones del EUNACOM práctico en modalidad ECOE, con estaciones cronometradas, paciente simulado, pauta de evaluación y devolución grabada.",
    duracion:"4 semanas", inicio:"Por confirmar", termino:"Por confirmar",
    examen:"Práctico 2027", modalidad:"Sesiones sincrónicas, grupos de ocho", cupos:"8 por grupo",
    precioClp:"$340.000", precioUsd:"≈ US$ 355", precioNota:"Inscripciones próximamente. Déjanos tu correo y te avisamos.",
    intro:[
      "El práctico no se estudia como el teórico. Se evalúa desempeño en estaciones cronometradas con pauta: anamnesis dirigida, examen físico pertinente, comunicación con el paciente, procedimientos y razonamiento clínico en voz alta.",
      "El curso son simulaciones reales con paciente simulado y pauta ECOE, grabadas para que veas lo que el evaluador ve."
    ],
    incluye:[
      "Doce estaciones ECOE simuladas y cronometradas",
      "Paciente simulado entrenado en cada estación",
      "Pauta de evaluación completa después de cada estación",
      "Grabación de tus estaciones con devolución comentada",
      "Módulo de comunicación: consentimiento, malas noticias, paciente difícil",
      "Guía de procedimientos evaluados con checklist"
    ],
    comoFunciona:[
      "Grupos de ocho. Cada sesión son tres estaciones: una la haces tú, dos las observas con la pauta en mano.",
      "Al terminar cada estación recibes la pauta con tu puntaje y qué se descontó. Observar con pauta enseña casi tanto como ejecutar.",
      "La grabación queda disponible para que revises tu propio desempeño antes de la siguiente sesión."
    ],
    paraQuien:"Quien ya aprobó el teórico o lo rinde en esta convocatoria y va al práctico después.",
    temarioNota:"Doce estaciones distribuidas en cuatro sesiones.",
    temario:[
      {s:"Sesión 1",t:"Anamnesis y examen físico",d:"Dolor torácico, dolor abdominal, disnea."},
      {s:"Sesión 2",t:"Urgencia y procedimientos",d:"Manejo inicial de shock, sutura, vía aérea básica."},
      {s:"Sesión 3",t:"Comunicación",d:"Malas noticias, consentimiento informado, rechazo de tratamiento."},
      {s:"Sesión 4",t:"Estaciones mixtas",d:"Pediatría, obstetricia y salud pública en formato ECOE completo."}
    ],
    cierreTitulo:"Inscripciones abiertas próximamente.",
    cierreTexto:"Déjanos tu correo y te avisamos en cuanto se abran los cupos, antes de que salga la convocatoria pública."
  }
];

export const POSTS = [
  {
    slug:"fechas-inscripciones",
    cat:"Fechas e inscripciones",
    titulo:"EUNACOM 2027: fechas, inscripciones y plazos que no conviene dejar pasar",
    bajada:"Cuándo se rinde, cuándo cierran las inscripciones, qué documentos pide la plataforma y qué pasa si te quedas fuera del plazo.",
    fecha:"12 agosto, 2026", lectura:"6 min de lectura",
    secciones:[
      {h:"Cuándo se rinde y hasta cuándo se inscribe",parrafos:[
        "El EUNACOM teórico se rinde dos veces al año, habitualmente en julio y en diciembre. Las inscripciones para cada convocatoria se abren con varios meses de anticipación y cierran alrededor de mes y medio antes del examen. La fecha exacta la publica ASOFAMECH en su sitio y no siempre se anuncia con anticipación cómoda.",
        "La recomendación práctica es simple: inscribirse el primer día que se abre el proceso. No hay ninguna ventaja en esperar y sí hay riesgo de quedar fuera, porque el cierre no se extiende y la plataforma suele saturarse los últimos días."
      ]},
      {h:"Qué necesitas para inscribirte",parrafos:[
        "Cédula de identidad chilena o pasaporte vigente, certificado de título de médico cirujano —o certificado de egreso, según el caso— y el comprobante de pago del arancel. Si te titulaste en el extranjero, el certificado debe venir apostillado o legalizado según el país de origen.",
        "Los documentos se suben escaneados. Un escaneo ilegible es motivo de rechazo, y el rechazo llega días después, cuando el plazo puede estar por cerrarse. Revisa que cada archivo se lea completo antes de enviarlo."
      ]},
      {h:"Qué pasa si te quedas fuera del plazo",parrafos:[
        "No hay inscripción tardía. Si el plazo cerró, la siguiente convocatoria es la única opción, lo que en la práctica significa entre cinco y siete meses de espera.",
        "Eso tiene consecuencias más allá del examen: contratos que dependen de la aprobación, postulaciones a cargos del sistema público y procesos de especialización que exigen el certificado. Vale la pena poner la fecha de apertura en el calendario con recordatorio."
      ]},
      {h:"Cuándo empezar a estudiar",parrafos:[
        "Seis meses de preparación alcanzan si vienes con bases razonablemente firmes y puedes sostener entre diez y quince horas semanales. Eso ubica el inicio en enero para julio, y en junio para diciembre.",
        "Si vienes de un intento no aprobado o trabajas jornada completa, el curso anual es la apuesta más realista: cubre las dos convocatorias del año y no dependes de una sola oportunidad."
      ]}
    ]
  },
  {
    slug:"como-estudiar-teorico",
    cat:"Cómo estudiar",
    titulo:"Cómo prepararse para la sección teórica del EUNACOM",
    bajada:"El orden importa más que las horas. Cómo repartir seis meses por peso real de cada eje, y por qué estudiar en orden de carrera es un error caro.",
    fecha:"3 julio, 2026", lectura:"8 min de lectura",
    secciones:[
      {h:"El error más común: estudiar en orden de carrera",parrafos:[
        "Casi todo el mundo empieza por medicina interna porque es lo primero que aparece en cualquier temario, avanza tres meses y llega al examen sin haber abierto salud pública. Es el patrón que más vemos en quienes vienen de un intento fallido.",
        "El examen no distribuye sus preguntas como la malla curricular distribuye sus horas. Hay ejes que aportan pocas preguntas y consumen semanas de estudio, y ejes que aportan muchas y se cubren en días. Estudiar en el orden en que te lo enseñaron es entregar puntaje gratis."
      ]},
      {h:"Empieza midiéndote, no leyendo",parrafos:[
        "El primer mes no debería ser contenido puro. Debería empezar con un simulacro corto y treinta preguntas por eje, para saber dónde se te está yendo el puntaje. No es un examen de ingreso: es la información con la que se arma el calendario.",
        "El resultado casi siempre sorprende. La gente suele estar peor de lo que cree en salud pública y sistema de salud chileno, y mejor de lo que cree en cirugía. Sin ese dato, el plan es una intuición."
      ]},
      {h:"Bloques de noventa minutos, tres piezas por bloque",parrafos:[
        "Diez a quince horas semanales repartidas en bloques de noventa minutos funcionan mejor que dos maratones de fin de semana. Cada bloque debe cerrar sobre un mismo tema: clase, capítulo del manual y preguntas comentadas del mismo contenido.",
        "Leer un tema el lunes y responder preguntas de ese tema el viernes rompe el ciclo. La corrección tiene que llegar mientras el contenido está fresco, porque el aprendizaje real está en entender por qué el distractor que elegiste parecía correcto."
      ]},
      {h:"Simulacros cronometrados desde temprano",parrafos:[
        "Un simulacro no sirve solo para medir conocimiento. Sirve para entrenar la fatiga de tres horas, el manejo del tiempo y la decisión de dejar una pregunta e ir a la siguiente.",
        "Hazlo cronometrado, sin pausas y sin material. Un simulacro cómodo no informa nada. Y revísalo completo después: las preguntas que acertaste por descarte también son brechas."
      ]},
      {h:"El último mes no es para contenido nuevo",parrafos:[
        "Las semanas previas al examen deberían ser exclusivamente repaso de tus propios errores acumulados. Abrir un tema nuevo a esa altura genera más ansiedad que puntaje.",
        "Duerme, come y llega al examen sin haber estudiado la noche anterior. Suena obvio y es donde se cae más gente de la que uno esperaría."
      ]}
    ]
  },
  {
    slug:"errores-comunes",
    cat:"Cómo estudiar",
    titulo:"Ocho errores comunes al prepararse para el EUNACOM",
    bajada:"Los patrones que aparecen una y otra vez en quienes no aprueban, y qué hacer distinto en cada caso.",
    fecha:"20 junio, 2026", lectura:"7 min de lectura",
    secciones:[
      {h:"Confundir horas con avance",parrafos:[
        "Sentarse seis horas a leer un manual se siente productivo y casi no mueve el puntaje. Lo que lo mueve es responder preguntas, equivocarse y entender por qué. Un bloque de noventa minutos con preguntas rinde más que una tarde completa de lectura pasiva.",
        "Si al final de la semana no sabes en qué ejes mejoraste, no estudiaste: consumiste material."
      ]},
      {h:"Dejar salud pública para el final",parrafos:[
        "Es el error más caro y el más frecuente. Es un bloque que se estudia rápido, aporta más preguntas de lo que la mayoría cree y casi nadie alcanza a abrirlo porque queda al final del calendario.",
        "Ponlo temprano, cuando todavía queda energía para memorizar garantías, plazos de notificación y niveles de atención."
      ]},
      {h:"No cronometrar nunca",parrafos:[
        "Un simulacro sin reloj mide conocimiento en condiciones que no existen el día del examen. La fatiga de tres horas y la presión del tiempo son variables que se entrenan, y no se entrenan solas.",
        "Otro error asociado: hacer simulacros y no revisarlos. El simulacro sin revisión completa es puntaje perdido dos veces."
      ]},
      {h:"Repetir el mismo estudio después de reprobar",parrafos:[
        "Un intento no aprobado no se corrige repitiendo el mismo método con más horas. Primero hay que identificar qué se cayó: contenido, manejo de tiempo o resistencia a las tres horas. Son tres problemas con soluciones distintas.",
        "Estudiar más solo resuelve el primero, y no es el más frecuente entre quienes reprueban por poco."
      ]},
      {h:"Estudiar solo y sin corrección externa",parrafos:[
        "Uno no ve sus propios patrones de error. Alguien que revise tus simulacros va a notar en dos semanas lo que tú no verías en dos meses: que fallas siempre en preguntas de manejo inicial, o que pierdes puntaje en las últimas veinte preguntas por cansancio.",
        "No requiere un tutor personal necesariamente, pero sí requiere que alguien mire tus resultados y te diga qué cambiar."
      ]}
    ]
  },
  {
    slug:"perfil-y-puntajes",
    cat:"Puntajes y requisitos",
    titulo:"Cuánto necesitas para aprobar el EUNACOM y por qué el puntaje no es lo único que importa",
    bajada:"Puntaje de corte, cómo se usa el puntaje en postulaciones, y en qué casos aprobar raspando alcanza y en cuáles no.",
    fecha:"29 mayo, 2026", lectura:"5 min de lectura",
    secciones:[
      {h:"Aprobar y puntuar alto no son lo mismo",parrafos:[
        "Para habilitarse en el sistema público basta con aprobar. Pero el puntaje se usa además como criterio de selección en concursos de cargos y en algunas postulaciones a programas de especialización, donde compites contra otros puntajes.",
        "Si tu objetivo es solo habilitarte, el corte es tu meta. Si tu objetivo es competir por un cargo o un cupo, el corte es el piso y no la meta."
      ]},
      {h:"El puntaje se construye por ejes, no en general",parrafos:[
        "Un informe de simulacro que dice sesenta por ciento no te dice nada útil. Lo que importa es cómo se reparte ese sesenta: perder de forma pareja en todo es un problema distinto a perder concentradamente en dos ejes.",
        "La pérdida concentrada es la buena noticia, porque se puede corregir en semanas. La pérdida pareja indica un problema de método de estudio, no de contenido, y eso toma más tiempo."
      ]},
      {h:"Qué hacer con un resultado bajo",parrafos:[
        "Antes de decidir cuándo volver a rendir, hay que saber qué falló. Pide el desglose de tu resultado y compáralo con tus simulacros previos: si el examen se parece a tus simulacros, el problema es contenido; si es mucho peor, el problema es el examen mismo.",
        "El segundo caso es más común de lo que parece y se trabaja con simulacros cronometrados y estrategia de examen, no con más manuales."
      ]}
    ]
  },
  {
    slug:"sedes-y-logistica",
    cat:"Logística del examen",
    titulo:"Sedes, auditorios y logística del día del examen",
    bajada:"Cómo se publican las sedes, qué llevar, a qué hora llegar y los detalles operativos que arruinan una rendición bien preparada.",
    fecha:"8 mayo, 2026", lectura:"5 min de lectura",
    secciones:[
      {h:"Cómo se asignan las sedes",parrafos:[
        "La lista de sedes y auditorios se publica algunos días antes del examen y la asignación no siempre coincide con la ciudad que uno esperaba. Conviene revisar la publicación oficial en cuanto sale y no asumir la sede del año anterior.",
        "Si te asignan una sede en otra ciudad, resuelve el traslado y el alojamiento de inmediato. Los hoteles cercanos a las sedes grandes se llenan con candidatos del mismo examen."
      ]},
      {h:"Qué llevar y a qué hora llegar",parrafos:[
        "Cédula de identidad o pasaporte vigente —el mismo documento con el que te inscribiste—, comprobante de inscripción y lápiz según lo que indique la convocatoria. Sin documento no hay ingreso, y no hay excepciones.",
        "Llega con holgura de al menos una hora. El ingreso a auditorios grandes toma tiempo, hay filas de verificación y el examen no espera a quien llegó justo."
      ]},
      {h:"El día antes",parrafos:[
        "No estudies contenido nuevo. Revisa la dirección exacta de la sede en un mapa, calcula el traslado con tráfico de día hábil y deja los documentos preparados la noche anterior.",
        "Duerme. Es el consejo más repetido y el más ignorado, y aparece en el desglose de resultados como pérdida de puntaje en las últimas veinte preguntas."
      ]}
    ]
  },
  {
    slug:"practico-ecoe",
    cat:"EUNACOM práctico",
    titulo:"EUNACOM práctico (ECOE): cómo es la evaluación y cómo se entrena",
    bajada:"Estaciones cronometradas, pauta de evaluación y desempeño observado. Por qué el práctico no se estudia como el teórico.",
    fecha:"22 abril, 2026", lectura:"6 min de lectura",
    secciones:[
      {h:"Qué se evalúa en una ECOE",parrafos:[
        "La ECOE evalúa desempeño observado, no conocimiento declarado. Recorres estaciones cronometradas donde hay un paciente simulado y un evaluador con una pauta, y el puntaje sale de lo que efectivamente haces y dices en el tiempo disponible.",
        "Eso incluye anamnesis dirigida, examen físico pertinente, comunicación con el paciente y su familia, procedimientos básicos y decisión de manejo inicial. Saber la respuesta y no llegar a decirla cuenta como no saberla."
      ]},
      {h:"Por qué leer no alcanza",parrafos:[
        "El teórico se entrena leyendo y respondiendo preguntas. El práctico se entrena haciendo, cronometrado, con alguien mirando. Es una habilidad distinta y se degrada rápido si no se practica.",
        "El error más común es subestimarlo: candidatos que aprueban el teórico con holgura y llegan al práctico sin haber ensayado una sola estación completa en voz alta."
      ]},
      {h:"Cómo entrenarlo",parrafos:[
        "Con estaciones simuladas, cronometradas y con pauta en mano. Observar a otro con la pauta enseña casi tanto como ejecutar, porque ves dónde se pierden los puntos que tú también estás perdiendo.",
        "Grabarse ayuda más de lo que la gente espera. Casi todos descubren que hablan menos de lo que creen, que no verbalizan el razonamiento y que omiten pasos de la pauta que sí conocen."
      ]}
    ]
  },
  {
    slug:"revalidacion",
    cat:"Médicos extranjeros",
    titulo:"Revalidación de título médico en Chile: las cuatro vías y una alternativa",
    bajada:"Qué exige la ley para ejercer, cómo funciona cada vía de revalidación, y en qué casos se puede trabajar como médico sin haber revalidado.",
    fecha:"14 marzo, 2026", lectura:"9 min de lectura",
    secciones:[
      {h:"Qué exige la ley para ejercer",parrafos:[
        "Para el ejercicio de la medicina en Chile se necesita el título de médico cirujano, expedido por una universidad chilena o bien por una extranjera debidamente revalidado. Además, para trabajar en el sistema público y acceder a ciertos cargos, se exige la aprobación del EUNACOM.",
        "Son dos requisitos separados y se confunden con frecuencia. La revalidación habilita el título; el EUNACOM habilita el acceso al sistema público. Aprobar el EUNACOM no revalida un título extranjero."
      ]},
      {h:"Las cuatro vías de revalidación",parrafos:[
        "La primera y más usada es el examen de revalidación de la Universidad de Chile, un proceso independiente del EUNACOM, con su propio calendario y sus propias exigencias.",
        "La segunda es el reconocimiento por convenio bilateral, disponible solo para títulos de países con los que Chile tiene convenio vigente. La tercera es el reconocimiento asociado a estudios de posgrado cursados en Chile. La cuarta corresponde a convenios internacionales específicos.",
        "Cada vía tiene requisitos documentales distintos y plazos que no se parecen entre sí. Antes de iniciar cualquiera, conviene verificar cuál aplica a tu caso: empezar por la vía equivocada cuesta meses."
      ]},
      {h:"Trabajar sin haber revalidado",parrafos:[
        "Existe una vía adicional que permite ejercer sin revalidación previa, bajo condiciones específicas y en contextos determinados. No es una excepción general y depende de interpretaciones legales que conviene revisar caso a caso.",
        "Este artículo es un resumen orientativo y no reemplaza asesoría legal. Si tu situación tiene particularidades —convenio bilateral, posgrado en curso, oferta laboral ya firmada— revísala con alguien que conozca tu expediente antes de pagar cursos o rendir exámenes."
      ]},
      {h:"El módulo que más diferencia hace en el examen",parrafos:[
        "Para un médico formado fuera de Chile, la brecha más grande en el EUNACOM no es clínica: es el funcionamiento del sistema de salud chileno. Red asistencial y niveles de atención, garantías GES, notificación obligatoria, licencias médicas, certificación de defunción y medicina legal.",
        "Son preguntas que un egresado chileno responde por costumbre. No se resuelven con más medicina, se resuelven estudiando específicamente cómo está organizado este sistema. En cualquier plan serio, ese módulo va temprano."
      ]}
    ]
  },
  {
    slug:"trabajar-en-chile",
    cat:"Médicos extranjeros",
    titulo:"Trabajar como médico en Chile: sistema público, privado y qué pide cada uno",
    bajada:"Cómo se organiza el sistema de salud chileno, qué cargos exigen EUNACOM, y qué caminos laborales existen mientras se completa la habilitación.",
    fecha:"11 febrero, 2026", lectura:"7 min de lectura",
    secciones:[
      {h:"Cómo se organiza el sistema",parrafos:[
        "El sistema chileno tiene un componente público, articulado en servicios de salud, hospitales y atención primaria municipal, y un componente privado de clínicas y centros ambulatorios. Ambos conviven con dos aseguradores: FONASA y las isapres.",
        "Entender esa arquitectura no es solo útil para trabajar: es contenido evaluado en el EUNACOM. Niveles de atención, derivación, GES y notificación obligatoria son preguntas de examen y también la realidad administrativa del día a día."
      ]},
      {h:"Qué cargos exigen EUNACOM",parrafos:[
        "La aprobación del EUNACOM se exige para trabajar en el sistema público y para acceder a ciertos cargos y programas. En el sector privado los requisitos varían según la institución y el tipo de contrato.",
        "Esto significa que hay caminos laborales posibles antes de tener el EUNACOM aprobado, pero son más estrechos y con menos estabilidad. Conviene planificar la habilitación como parte del proyecto laboral, no como un trámite posterior."
      ]},
      {h:"El orden razonable de los trámites",parrafos:[
        "Primero verificar qué vía de revalidación aplica a tu título, porque define plazos y documentos. Después inscribirse en el EUNACOM en cuanto se abra la convocatoria compatible con esos plazos.",
        "Hacerlo en el orden inverso —rendir el EUNACOM y después averiguar la revalidación— es frecuente y suele costar un año."
      ]}
    ]
  }
];

export const MATERIAL = [
  {t:"Medicina interna", c:"14 pruebas", n:"Cardiovascular, respiratorio, digestivo, nefro, endocrino"},
  {t:"Infectología", c:"6 pruebas", n:"Incluye preguntas compartidas con medicina interna"},
  {t:"Cirugía y traumatología", c:"9 pruebas", n:"Abdomen agudo, trauma, urgencias quirúrgicas"},
  {t:"Urología", c:"3 pruebas", n:"Patología prostática, litiasis, urgencias urológicas"},
  {t:"Pediatría", c:"11 pruebas", n:"Neonatología, desarrollo, respiratorio, infeccioso"},
  {t:"Ginecología y obstetricia", c:"10 pruebas", n:"Control prenatal, urgencias obstétricas, oncología"},
  {t:"Salud pública", c:"7 pruebas", n:"Red asistencial, GES, epidemiología, notificación"},
  {t:"Psiquiatría", c:"6 pruebas", n:"Ánimo, ansiedad, urgencia psiquiátrica, adicciones"},
  {t:"Neurología", c:"5 pruebas", n:"ACV, cefaleas, convulsiones, demencias"},
  {t:"Dermatología y otros", c:"4 pruebas", n:"Geriatría está contenida en las demás pruebas"},
  {t:"Ensayos y reconstrucciones", c:"8 pruebas", n:"Pruebas largas que agrupan varios contenidos"}
];

export const VIAS = [
  {n:"1",t:"Examen de revalidación, Universidad de Chile",x:"La vía más usada. Proceso independiente del EUNACOM, con calendario, arancel y exigencias propias. Requiere título apostillado o legalizado según el país de origen."},
  {n:"2",t:"Convenio bilateral de reconocimiento",x:"Disponible solo para títulos de países con convenio vigente con Chile. Los requisitos documentales varían según el convenio específico."},
  {n:"3",t:"Reconocimiento por posgrado en Chile",x:"Aplica cuando se han cursado estudios de posgrado en una universidad chilena, bajo las condiciones que fija cada institución."},
  {n:"4",t:"Revalidación por convenio internacional",x:"Vía asociada a convenios internacionales específicos. Conviene verificar la vigencia antes de iniciar el trámite, porque cambia con el tiempo."},
  {n:"+",t:"Ejercer sin haber revalidado",x:"Existe una vía adicional que permite trabajar como médico sin revalidación previa, bajo condiciones específicas y sujeta a interpretación legal. No es una excepción general."}
];

export const FAQ = [
  {q:"¿Cuál curso me conviene: el anual o el de seis meses?",a:"Si vienes con bases razonablemente firmes y puedes sostener diez a quince horas semanales, el de seis meses alcanza. El anual conviene en dos casos: si trabajas jornada completa y no puedes sostener esa carga, o si vienes de un intento no aprobado y quieres cubrir las dos convocatorias del año sin volver a pagar."},
  {q:"¿Las clases son en vivo o grabadas?",a:"Las clases son grabadas en estudio y están disponibles desde el primer día, para que puedas estudiar en los horarios que te permitan tus turnos. Lo que es sincrónico es la revisión de avance y, en el curso práctico, las estaciones ECOE."},
  {q:"¿Qué pasa si una semana no puedo estudiar?",a:"El calendario asume que habrá semanas malas y deja holgura para recuperarlas. En la revisión semanal se ajusta el plan; no pierdes el hilo ni tienes que reiniciar el módulo."},
  {q:"¿Sirve si me titulé fuera de Chile?",a:"Sí, y es una parte importante de nuestros alumnos. El módulo de sistema de salud chileno, GES, notificación obligatoria y medicina legal es el que hace más diferencia en ese caso, y en nuestros cursos va al principio del calendario, no al final."},
  {q:"¿Cómo se paga y en cuántas cuotas?",a:"En línea con Webpay, con acceso a cuotas de tu tarjeta de crédito: hasta 6 en los cursos de seis meses y hasta 12 en el anual. También aceptamos transferencia o depósito bancario, dos pagos de 50% y transferencia internacional en dólares."},
  {q:"¿Cuándo tengo acceso a la plataforma?",a:"El mismo día del pago. Con Webpay el acceso se activa al confirmarse la transacción; con transferencia, al recibir el comprobante en horario hábil."},
  {q:"¿Emiten boleta o factura?",a:"Sí, boleta electrónica en todos los casos. Si necesitas factura a nombre de una institución, indícalo en el formulario de matrícula y la emitimos con los datos que nos entregues."},
  {q:"¿Puedo cambiarme de convocatoria si no llego a tiempo?",a:"Sí. Si después del diagnóstico inicial vemos que el tiempo no alcanza, te reservamos el curso de la convocatoria siguiente sin costo adicional. Preferimos eso a que rindas sin estar preparado."},
  {q:"¿El curso incluye preparación para el EUNACOM práctico?",a:"El curso anual incluye una preparación introductoria al práctico. El entrenamiento completo con estaciones ECOE simuladas es el curso práctico, que se contrata aparte y tiene sus propias fechas."},
  {q:"¿Hay devoluciones?",a:"Sí, dentro de los primeros siete días desde el pago y siempre que no hayas descargado los manuales completos. Después de ese plazo se puede transferir el cupo a otra convocatoria, pero no devolver el pago."}
];

export const METODOS = [
  {id:"webpay", nombre:"Webpay · débito o crédito", detalle:"Pago inmediato con acceso a cuotas de tu tarjeta. El acceso se activa al confirmar."},
  {id:"transferencia", nombre:"Transferencia o depósito bancario", detalle:"Te mostramos los datos y confirmas enviando el comprobante por correo."},
  {id:"dos-pagos", nombre:"Dos pagos de 50%", detalle:"La mitad al matricularte y la mitad a mitad de curso, con la misma tarjeta."},
  {id:"internacional", nombre:"Transferencia internacional en USD", detalle:"Para pagos desde el exterior. Te enviamos los datos SWIFT por correo."}
];
