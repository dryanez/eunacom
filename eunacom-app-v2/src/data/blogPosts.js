// Blog posts data — Authoritative medical, administrative & clinical guides for EUNACOM 2026-2027
// Matching the editorial standard of EUNACOM Sitio and ASOFAMECH regulations.

export const BLOG_CATEGORIES = [
  'Todos',
  'Estrategia y Métodos',
  'Revalidación y Trámites',
  'Logística y Fechas',
  'Especialidades y ECOE',
  'Información EUNACOM',
]

export const BLOG_POSTS = [
  {
    slug: 'fechas-eunacom-2026-2027',
    aliases: ['fechas-eunacom-2026', 'fechas-inscripciones'],
    title: 'EUNACOM 2026-2027: Fechas oficiales, inscripciones y plazos que no conviene dejar pasar',
    metaTitle: 'EUNACOM 2026-2027: Fechas Oficiales, Inscripción y Plazos ASOFAMECH',
    metaDescription: 'Calendario completo EUNACOM 2026-2027: fechas de inscripción, plazos de entrega de documentos, costo de aranceles y calendario de rendición teórico y práctico.',
    date: '2026-08-25',
    readTime: '6 min',
    category: 'Logística y Fechas',
    author: {
      name: 'Dr. Felipe Yáñez',
      role: 'Médico Cirujano · Director Académico EUNACOM',
      regNumber: 'RNPI Nº 642819'
    },
    excerpt: 'El calendario oficial del EUNACOM se rige por plazos estrictos de ASOFAMECH. Conoce las fechas de rendición de invierno y verano, aranceles y requisitos de inscripción.',
    keyTakeaways: [
      'El EUNACOM-ST se rinde dos veces al año: Convocatoria de Invierno (Julio) y Verano (Diciembre).',
      'El cierre de inscripciones ocurre aproximadamente 60 a 90 días antes del examen.',
      'Los médicos extranjeros deben contar con su título apostillado antes de iniciar el trámite en ASOFAMECH.',
      'El pago del arancel no garantiza el cupo si no se validan los antecedentes a tiempo.'
    ],
    faqs: [
      {
        q: '¿Cuándo son las fechas de rendición del EUNACOM en 2026 y 2027?',
        a: 'El EUNACOM Teórico (ST) tiene dos rendiciones anuales: la primera semana de julio (convocatoria de invierno) y la segunda semana de diciembre (convocatoria de verano).'
      },
      {
        q: '¿Dónde se realiza la inscripción oficial?',
        a: 'La inscripción es 100% gestionada a través del portal oficial de ASOFAMECH (eunacom.cl). Ningún curso privado realiza inscripciones a nombre del postulante.'
      },
      {
        q: '¿Cuánto tiempo antes debo iniciar la inscripción si soy médico extranjero?',
        a: 'Se recomienda iniciar el proceso con al menos 4 a 6 meses de anticipación debido a los tiempos de legalización y validación de documentos.'
      }
    ],
    content: `
## Calendario Oficial y Convocatorias EUNACOM

El Examen Único Nacional de Conocimientos de Medicina (EUNACOM) es administrado por la Asociación de Facultades de Medicina de Chile (**ASOFAMECH**). La sección teórica (**EUNACOM-ST**) se rinde dos veces al año:

| Convocatoria | Período de Inscripción | Fecha de Rendición | Entrega de Resultados |
| :--- | :--- | :--- | :--- |
| **Invierno 2026** | Marzo – Mayo 2026 | Miércoles 8 de Julio 2026 | ~3 semanas posteriores |
| **Verano 2026-2027** | Agosto – Octubre 2026 | Miércoles 9 de Diciembre 2026 | Enero 2027 |
| **Invierno 2027** | Marzo – Mayo 2027 | Julio 2027 | Agosto 2027 |

:::prereq
**Importante sobre los Cupos:** ASOFAMECH asigna sedes de rendición por orden de confirmación de pago y validación de documentos. Postulantes en sedes de alta demanda (como Santiago, Valparaíso y Concepción) deben inscribirse durante los primeros días de la apertura.
:::

---

## Proceso de Inscripción Paso a Paso

1. **Creación de Cuenta en eunacom.cl**: Acceso con RUT chileno o Pasaporte vigente.
2. **Carga de Documentación Académica**:
   - Para médicos titulados en Chile: Certificado de título o certificado de egreso emitido por la universidad acreditada.
   - Para médicos titulados en el extranjero: Título profesional original debidamente apostillado o legalizado por el Ministerio de Relaciones Exteriores (MINREL).
3. **Validación de Antecedentes**: Revisión administrativa por parte del comité de ASOFAMECH (demora de 5 a 15 días hábiles).
4. **Pago de Arancel Oficial**: El costo se publica anualmente y cubre la rendición teórica nacional.
5. **Elección de Sede**: Confirmación de la ciudad y recinto universitario donde rendirás el examen.

---

## Documentación Requerida según País de Origen

| Documento | Médicos Chilenos | Médicos Extranjeros |
| :--- | :--- | :--- |
| **Cédula de Identidad / Pasaporte** | Vigente | Cédula chilena o Pasaporte vigente |
| **Título Médico** | Certificado de Título / Egreso | Apostillado (Convenio de La Haya) o Legalizado |
| **Concentración de Notas** | No requerida para inscripción | Recomendada para convalidación posterior |
| **Certificado de Habilitación** | No aplica | Certificado de ética / ejercicio profesional |

:::pearl
**Perla de Planificación:** Inscribirse al examen no te obliga a rendir inmediatamente si justificas tu postergación dentro de los plazos reglamentarios de ASOFAMECH. Sin embargo, no presentarse sin aviso previo implica la pérdida del arancel y el registro de la convocatoria como intento.
:::
    `.trim()
  },
  {
    slug: 'como-estudiar-teorico',
    aliases: ['como-prepararse-eunacom-2026'],
    title: 'Cómo prepararse para la sección teórica del EUNACOM (EUNACOM-ST): Estrategia de 7 áreas',
    metaTitle: 'Cómo Prepararse para el EUNACOM-ST Teórico | Estrategia de Estudio y 7 Áreas',
    metaDescription: 'Estrategia probada para aprobar el EUNACOM-ST: distribución de las 180 preguntas, método de estudio por casos clínicos y cómo dominar el temario ASOFAMECH.',
    date: '2026-08-20',
    readTime: '8 min',
    category: 'Estrategia y Métodos',
    author: {
      name: 'Dr. Felipe Yáñez',
      role: 'Médico Cirujano · Director Académico EUNACOM',
      regNumber: 'RNPI Nº 642819'
    },
    excerpt: 'El EUNACOM-ST no es un examen de memoria pasiva, sino de razonamiento clínico contextualizado en la epidemiología y guías clínicas GES de Chile. Conoce el método para abordarlo.',
    keyTakeaways: [
      'El 70% del puntaje se concentra en tres áreas: Medicina Interna (30%), Pediatría (18%) y Obstetricia/Ginecología (15%).',
      'El formato de 180 preguntas de selección múltiple (5 alternativas) exige un ritmo de ~1.3 minutos por caso clínico.',
      'El estudio debe basarse en Guías Clínicas GES/MINSAL y reconstrucciones reales.',
      'La resolución activa de preguntas con retroalimentación inmediata supera en un 400% a la lectura pasiva de resúmenes.'
    ],
    faqs: [
      {
        q: '¿Cuántas preguntas componen el EUNACOM-ST y cuál es el puntaje de aprobación?',
        a: 'El examen consta de 180 preguntas de opción múltiple divididas en dos bloques de 90 preguntas. El puntaje mínimo de corte para aprobar es del 51% (equivalente a un puntaje estandarizado de aprobación fijado por ASOFAMECH).'
      },
      {
        q: '¿Cuánto tiempo se recomienda dedicar a la preparación?',
        a: 'Para médicos extranjeros se sugiere un período de 4 a 6 meses con 3 a 4 horas diarias de estudio activo enfocado en casos clínicos y guías GES.'
      }
    ],
    content: `
## Estructura y Distribución del EUNACOM-ST

El examen teórico está estructurado en 180 preguntas que evalúan conocimientos médicos fundamentales para el ejercicio de la medicina general en Chile. La ponderación por especialidades es la siguiente:

\`\`\`
Medicina Interna (30%) ───────► 54 preguntas (Cardio, Resp, Gastro, Nefro, Endo, Infecto)
Pediatría (18%) ──────────────► 32 preguntas (Neonatología, PNI, Respiratorio infantil, Urgencias)
Ginecología y Obstetricia (15%) ► 27 preguntas (Control prenatal, Preeclampsia, Hemorragias, Parto)
Cirugía General (12%) ────────► 22 preguntas (Abdomen agudo, Trauma, Hernias, Shock)
Psiquiatría y Salud Mental (10%)► 18 preguntas (Depresión, Psicosis, Urgencias, Adicciones)
Especialidades (8%) ──────────► 14 preguntas (Oftalmo, ORL, Derma, Traumatología)
Salud Pública y Bioética (7%) ─► 13 preguntas (GES/AUGE, Epidemiología, Bioética, FONASA)
\`\`\`

---

## El Método de las 4 Fases de Preparación

### Fase 1: Diagnóstico Inicial y Mapeo de Debilidades
Antes de abrir un libro, debes rendir un simulacro diagnóstico completo de 180 preguntas. Esto identifica con exactitud en qué especialidades estás por debajo del 51% y evita que gastes semanas estudiando áreas que ya dominas.

### Fase 2: Estudio Modular por Sistemas Clínicos
Agrupa tu estudio por áreas de mayor rendimiento. Cada módulo debe articular tres componentes:
1. **Fisiopatología y Diagnóstico Diferencial**: Reconocimiento de signos cardinales.
2. **Guías Clínicas GES/MINSAL**: Fármacos de primera línea, plazos de derivación y criterios de ingreso a garantías explícitas.
3. **Resolución de Casos de Reconstrucción**: Práctica con preguntas reales de los últimos 5 años.

### Fase 3: Entrenamiento de Velocidad y Resistencia Cognitiva
Rendir 180 preguntas en 4 horas requiere resistencia mental. En las últimas 6 semanas, realiza simulacros cronometrados semanales manteniendo una velocidad de **1 minuto con 20 segundos por pregunta**.

### Fase 4: Repaso de Alto Rendimiento (High-Yield Flashpoints)
Los últimos 10 días deben dedicarse exclusivamente a:
- Calendario Nacional de Inmunizaciones (**PNI 2026**).
- Criterios diagnósticos y tratamiento de **Preeclampsia / Eclampsia**.
- Manejo inicial de **IAM con y sin supradesnivel** en la atención primaria (tiempos GES de trombolisis y angioplastia).
- Algoritmos de **Sepsis y Shock Séptico**.

:::pearl
**Regla de Oro EUNACOM:** En las preguntas de tratamiento en atención primaria (CESFAM), la respuesta correcta siempre prioriza el tratamiento disponible en el arsenal farmacológico del sistema público chileno antes que terapias de tercer nivel.
:::
    `.trim()
  },
  {
    slug: 'errores-comunes-eunacom',
    aliases: ['errores-comunes'],
    title: 'Ocho errores comunes al prepararse para el EUNACOM y cómo evitarlos',
    metaTitle: '8 Errores Comunes al Preparar el EUNACOM y Cómo Evitarlos',
    metaDescription: 'Los 8 errores más frecuentes que cometen los médicos al estudiar para el EUNACOM: fallas de tiempo, guías internacionales vs GES, y falta de simulacros.',
    date: '2026-08-18',
    readTime: '7 min',
    category: 'Estrategia y Métodos',
    author: {
      name: 'Dr. Felipe Yáñez',
      role: 'Médico Cirujano · Director Académico EUNACOM',
      regNumber: 'RNPI Nº 642819'
    },
    excerpt: 'Cada año cientos de postulantes con excelente formación médica reprueban por errores metodológicos. Analizamos los 8 tropiezos más frecuentes y cómo prevenirlos.',
    keyTakeaways: [
      'Estudiar con guías internacionales (UpToDate, Harrison, guías europeas) sin cotejar con normas MINSAL es la causa #1 de errores en Salud Pública y GES.',
      'Memorizar sin practicar la velocidad de lectura de enunciados largos genera falta de tiempo en el segundo bloque de 90 preguntas.',
      'Descuidar Salud Pública, Pediatría y Psiquiatría asumiendo que "Medicina Interna es suficiente".',
      'No simular las 4 horas de examen en condiciones reales antes del día oficial.'
    ],
    faqs: [
      {
        q: '¿Por qué no es suficiente estudiar de guías internacionales como UpToDate?',
        a: 'Porque el EUNACOM evalúa conductas médicas normadas en Chile. Por ejemplo, los esquemas de tratamiento antituberculoso, los plazos de tamizaje de cáncer cervicouterino o las vacunas del PNI responden a decretos específicos del MINSAL.'
      },
      {
        q: '¿Cuál es el error más recurrente durante el día del examen?',
        a: 'Quedarse atascado más de 3 minutos en preguntas dudosas durante las primeras 30 preguntas, lo que obliga a responder al azar en las últimas 20.'
      }
    ],
    content: `
## Los 8 Errores Críticos que Debes Evitar

### 1. Desconocer los Protocolos GES y la Realidad de la APS Chilena
Muchos médicos extranjeros aplican algoritmos de alta complejidad o fármacos de tercera línea que no corresponden a la conducta del médico general en un CESFAM o SAPU. **El EUNACOM premia el criterio del médico general de atención primaria**.

### 2. Estudiar Leyendo Resúmenes Pasivos
La lectura pasiva genera la "ilusión de competencia". La única forma de consolidar la memoria a largo plazo es la **recuperación activa** (active recall) resolviendo preguntas y justificando por qué las 4 opciones restantes son incorrectas.

### 3. Subestimar Pediatría y el Programa Nacional de Inmunizaciones (PNI)
Pediatría representa el 18% del examen. Las preguntas sobre calendario de vacunación, hitos del desarrollo psicomotor (EEDP y TEPSI) y patología respiratoria invernal (IRA baja) son fijas y altamente diferenciadoras.

### 4. Mal Manejo del Tiempo: No Practicar con Bloques Cronometrados
Dispones de 180 preguntas en 240 minutos (1.33 min/pregunta). Quedarse bloqueado en 5 preguntas difíciles arruina la posibilidad de responder 15 preguntas sencillas al final del cuadernillo.

\`\`\`
Tiempo Total: 240 minutos (2 bloques de 120 min)
Número de preguntas: 180 (90 preguntas por bloque)
Tiempo óptimo por pregunta: 70 a 80 segundos
Tiempo de reserva para traspaso a hoja óptica: 10 minutos por bloque
\`\`\`

### 5. Ignorar los Aspectos Legales y Éticos de Salud Pública
Salud Pública aporta cerca de 13 preguntas. Temas como confidencialidad médica, licencias médicas (formulario COMPIN), consentimiento informado en menores y notificación obligatoria de enfermedades (ENO) son puntos de alto rendimiento.

### 6. No Entrenar la Hoja de Respuestas Ópticas
El traspaso de respuestas a la hoja de lectura óptica debe hacerse en bloques de 10 o 20 preguntas, nunca dejar las 90 preguntas para los últimos 5 minutos bajo estrés.

### 7. Quemarse los Días Previos (Síndrome de Burnout)
Estudiar 14 horas diarias los últimos 3 días reduce la agudeza cognitiva, la memoria de trabajo y la concentración durante el examen. Los últimos 2 días deben enfocarse en descanso, hidratación y repaso liviano.

### 8. No Analizar las Reconstrucciones Históricas
Las preguntas del EUNACOM siguen patrones temáticos estables. Quien no practica con reconstrucciones de los últimos 5 años rinde el examen a ciegas respecto a los distractores típicos de ASOFAMECH.
    `.trim()
  },
  {
    slug: 'perfil-y-puntajes',
    aliases: ['perfil-puntajes'],
    title: 'Cuánto necesitas para aprobar el EUNACOM y por qué el puntaje no es lo único que importa',
    metaTitle: 'Puntajes EUNACOM: Nota de Corte, Percentiles y Becas de Especialidad (EDF)',
    metaDescription: 'Análisis de puntajes del EUNACOM: punto de corte del 51%, cómo se calcula el puntaje final y qué nota necesitas para postular a becas de especialidad médica (CONISS/EDF).',
    date: '2026-08-15',
    readTime: '6 min',
    category: 'Información EUNACOM',
    author: {
      name: 'Dr. Felipe Yáñez',
      role: 'Médico Cirujano · Director Académico EUNACOM',
      regNumber: 'RNPI Nº 642819'
    },
    excerpt: 'Aprobar con el 51% es el primer requisito legal para ejercer, pero el puntaje final determina tus opciones de contratación en el sistema público y tu postulación a becas de especialidad.',
    keyTakeaways: [
      'El puntaje mínimo de corte para aprobar el EUNACOM-ST es 51% de respuestas correctas estandarizadas.',
      'Para postular a programas de especialización médica ministerial (CONISS / Médicos Generales de Zona EDF) se requiere generalmente un puntaje superior a 75-80 puntos.',
      'El puntaje EUNACOM pondera directamente en los concursos públicos de la Ley Médica 19.664 y 15.076.',
      'El examen práctico (EUNACOM-SP) se califica como Aprobado / Reprobado.'
    ],
    faqs: [
      {
        q: '¿Qué significa aprobar el EUNACOM?',
        a: 'Aprobar significa obtener 51.0 puntos o más en la sección teórica y aprobar las 4 etapas de la sección práctica. Con ello obtienes la habilitación para contratar en el sector público, emitir bonos FONASA y postular a especialidades.'
      },
      {
        q: '¿Un médico extranjero puede postular a becas de especialidad con su puntaje EUNACOM?',
        a: 'Sí, a través de los concursos CONE (para médicos con ejercicio previo en Chile) o concursos universitarios directos, donde el puntaje EUNACOM es un antecedente curricular clave.'
      }
    ],
    content: `
## La Escala de Calificación del EUNACOM

El EUNACOM-ST entrega una calificación numérica en escala de **0 a 100 puntos**, con un decimal:

| Rango de Puntaje | Estado Legal | Oportunidades Profesionales |
| :--- | :--- | :--- |
| **< 51.0 puntos** | Reprobado | No habilitado para contratación pública ni FONASA Libre Elección |
| **51.0 – 65.0 puntos** | Aprobado | Habilitado para ejercer en CESFAM, Hospitales públicos y clínicas privadas |
| **65.1 – 75.0 puntos** | Aprobado (Competitivo) | Alta elegibilidad en concursos comunales de salud (APS) y contratos de planta |
| **> 75.0 puntos** | Aprobado (Sobresaliente) | Altamente competitivo para Concurso Nacional de Ingreso al Sistema de Salud (**CONISS / EDF**) y especialidades directas |

---

## ¿Por qué el Puntaje Importa Más Allá de Aprobar?

### 1. Acceso a Becas de Especialización Médica
En Chile, los programas de formación de especialistas financiados por el Ministerio de Salud (MINSAL) utilizan el **Puntaje EUNACOM** como uno de los factores más pesados dentro del Rubro A de evaluación curricular.

### 2. Contratación en Atención Primaria (Ley 19.378)
Las direcciones de salud municipal ponderan la nota del EUNACOM para asignar contratos indefinidos y cargos de jefatura médica en centros de salud familiar (CESFAM).

### 3. Inscripción en el Registro Nacional de Prestadores Individuales (RNPI)
Aprobar el EUNACOM (ST + SP) es el requisito para que la **Superintendencia de Salud** otorgue el registro definitivo de médico cirujano en Chile.
    `.trim()
  },
  {
    slug: 'sedes-y-logistica',
    aliases: ['sedes-logistica'],
    title: 'Sedes, auditorios y logística del día del examen EUNACOM',
    metaTitle: 'Sedes de Rendición EUNACOM y Logística del Día del Examen | Guía Oficial',
    metaDescription: 'Guía práctica para el día del examen EUNACOM: sedes en Santiago y regiones, horarios de ingreso, qué llevar, prohibiciones y consejos para rendir sin contratiempos.',
    date: '2026-08-12',
    readTime: '5 min',
    category: 'Logística y Fechas',
    author: {
      name: 'Dr. Felipe Yáñez',
      role: 'Médico Cirujano · Director Académico EUNACOM',
      regNumber: 'RNPI Nº 642819'
    },
    excerpt: 'El día del examen la logística es clave. Conoce qué documentos llevar, cómo es la distribución de los dos bloques de preguntas y las reglas estrictas de los auditorios.',
    keyTakeaways: [
      'El ingreso a los recintos se inicia a las 07:45 AM; las puertas se cierran puntualmente a las 08:30 AM.',
      'Es obligatorio presentar Cédula de Identidad chilena vigente o Pasaporte original con el que te inscribiste.',
      'Está estrictamente prohibido el ingreso con teléfonos móviles, smartwatches, calculadoras o apuntes.',
      'El examen se compone de dos cuadernillos de 90 preguntas con un receso intermedio de 30 a 45 minutos.'
    ],
    faqs: [
      {
        q: '¿Qué elementos debo llevar obligatoriamente?',
        a: 'Tu documento de identidad original (RUT o pasaporte), comprobante de inscripción impreso, lápiz grafito Nº 2 o HB, goma de borrar y sacapuntas.'
      },
      {
        q: '¿En qué ciudades se rinde el EUNACOM-ST?',
        a: 'En las principales ciudades universitarias de Chile: Santiago (múltiples sedes), Antofagasta, La Serena, Valparaíso, Talca, Concepción, Temuco, Valdivia y Puerto Montt.'
      }
    ],
    content: `
## Sedes de Rendición a Nivel Nacional

ASOFAMECH distribuye a los postulantes en recintos de las principales facultades de medicina del país:

- **Región Metropolitana (Santiago)**: Campus universitarios de la U. de Chile, PUC, U. de los Andes, U. Mayor, U. San Sebastián, U. Andrés Bello y U. del Desarrollo.
- **Zona Norte**: Antofagasta, Coquimbo / La Serena.
- **Zona Centro-Sur**: Valparaíso / Viña del Mar, Talca, Concepción, Temuco, Valdivia, Osorno, Puerto Montt.

---

## Cronograma Típico del Día del Examen

| Horario | Actividad |
| :--- | :--- |
| **07:45 – 08:30** | Apertura de puertas, verificación de identidad en portería y ubicación de auditorio asignado |
| **08:30 – 08:45** | Cierre de puertas, lectura de instrucciones y entrega de cuadernillos del Bloque 1 |
| **08:45 – 10:45** | **Bloque 1 (Preguntas 1 a 90)** — Duración: 2 horas exactas |
| **10:45 – 11:30** | Receso obligatorio fuera de las salas (hidratación, colación liviana) |
| **11:30 – 11:45** | Reingreso a salas y distribución del Bloque 2 |
| **11:45 – 13:45** | **Bloque 2 (Preguntas 91 a 180)** — Duración: 2 horas exactas |
| **13:45** | Retiro final de cuadernillos y hojas ópticas |

:::pearl
**Consejo de Nutrición:** Durante el receso entre bloques, evita comidas pesadas o azúcares refinados en exceso que provoquen hipoglicemia reactiva en el segundo bloque. Opta por frutos secos, agua y una manzana.
:::
    `.trim()
  },
  {
    slug: 'practico-ecoe',
    aliases: ['practico-ecoe-guia'],
    title: 'EUNACOM Práctico (ECOE): Cómo es la evaluación por estaciones y cómo entrenarlo',
    metaTitle: 'EUNACOM Práctico ECOE: Guía Completa de Estaciones Clínicas y Aprobación',
    metaDescription: 'Cómo preparar el examen EUNACOM Práctico (ECOE / EUNACOM-SP): Medicina, Cirugía, Pediatría y Obstetricia. Estructura de estaciones, listas de cotejo y rúbricas.',
    date: '2026-08-10',
    readTime: '8 min',
    category: 'Especialidades y ECOE',
    author: {
      name: 'Dr. Felipe Yáñez',
      role: 'Médico Cirujano · Director Académico EUNACOM',
      regNumber: 'RNPI Nº 642819'
    },
    excerpt: 'La sección práctica (EUNACOM-SP) evalúa tu desempeño clínico en vivo a través de un Examen Clínico Objetivo Estructurado (ECOE). Descubre cómo prepararte para cada una de las 4 ramas.',
    keyTakeaways: [
      'El EUNACOM-SP evalúa 4 ramas clínicas: Medicina Interna, Cirugía, Pediatría y Obstetricia/Ginecología.',
      'Los médicos graduados en universidades chilenas acreditadas suelen convalidar la sección práctica con sus internados aprobados.',
      'Los médicos extranjeros deben rendir las 4 ramas prácticas en universidades acreditadas designadas por ASOFAMECH.',
      'La evaluación se realiza mediante pacientes simulados (actores), maniquíes de simulación y evaluación con pauta de cotejo estructurada.'
    ],
    faqs: [
      {
        q: '¿Quiénes deben rendir el EUNACOM Práctico?',
        a: 'Todos los médicos titulados en el extranjero que no cuenten con una convalidación directa vía convenio bilateral o especialidad CONACEM, así como egresados nacionales de programas no acreditados.'
      },
      {
        q: '¿Qué pasa si repruebo una de las ramas prácticas?',
        a: 'Solo debes volver a rendir la rama específica reprobada, conservando la aprobación de las ramas que aprobaste, dentro de los plazos estipulados por ASOFAMECH.'
      }
    ],
    content: `
## Estructura del EUNACOM Práctico (ECOE)

El componente práctico (**EUNACOM-SP**) tiene como objetivo certificar que el postulante posee las destrezas clínicas, comunicacionales y procedimentales para ejercer con seguridad. Se divide en 4 etapas:

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    EUNACOM PRÁCTICO (SP)                    │
├─────────────────┬─────────────────┬───────────────┬─────────┤
│ Medicina        │ Pediatría       │ Obstetricia   │ Cirugía │
│ Interna         │                 │ y Ginecología │         │
│ (Casos clínicos │ (RN, control de │ (Control pre- │ (Sutura,│
│ y urgencias)    │ niño, diarrea)  │ natal, parto) │ trauma) │
└─────────────────┴─────────────────┴───────────────┴─────────┘
\`\`\`

---

## Cómo es una Estación ECOE Típica

1. **Lectura del Caso (1 a 2 minutos)**: En la puerta de la estación se presenta la viñeta clínica (ej: *"Paciente de 54 años consulta por dolor precordial de 2 horas de evolución"*).
2. **Entrada e Interacción (8 a 10 minutos)**:
   - Saludo formal y presentación al paciente.
   - Anamnesis dirigida (síntoma principal, antecedentes mórbidos, factores de riesgo).
   - Examen físico focalizado o verbalizado.
   - Solicitud e interpretación de exámenes complementarios (ECG, radiografía, laboratorio).
   - Planteamiento diagnóstico y plan terapéutico inmediato.
   - Comunicación de indicaciones claras al paciente o familiar.
3. **Cierre de la Estación (1 a 2 minutos)**: El evaluador docente califica la pauta de cotejo (checklist) sin intervenir.

---

## Habilidades Procedimentales Evaluadas

- **Soporte Vital Básico y Avanzado (BLS / ACLS)**: Uso de DEA, compresiones, manejo de vía aérea.
- **Técnicas Quirúrgicas Básicas**: Lavado quirúrgico, colocación de guantes estériles, infiltración anestésica local y suturas con puntos simples o colchonero.
- **Atención del Parto Inminente**: Maniobras de protección del periné, alumbramiento dirigido y reanimación neonatal básica.
- **Sondajes**: Colocación de sonda Foley y sonda nasogástrica bajo técnica estéril.
    `.trim()
  },
  {
    slug: 'revalidacion-titulo-medico-chile',
    aliases: ['revalidacion', 'revalidacion-titulo-medico'],
    title: 'Revalidación de título médico en Chile: Las 4 vías oficiales y requisitos de apostilla',
    metaTitle: 'Revalidación de Título Médico en Chile | Las 4 Vías Oficiales 2026',
    metaDescription: 'Guía exhaustiva para revalidar el título médico en Chile: Vía EUNACOM (ASOFAMECH), Vía Universidad de Chile, Vía CONACEM para especialistas y Convenios Bilaterales.',
    date: '2026-08-05',
    readTime: '9 min',
    category: 'Revalidación y Trámites',
    author: {
      name: 'Dr. Felipe Yáñez',
      role: 'Médico Cirujano · Director Académico EUNACOM',
      regNumber: 'RNPI Nº 642819'
    },
    excerpt: 'Chile ofrece cuatro mecanismos legales para que un médico formado en el extranjero pueda ejercer legalmente su profesión. Analizamos los requisitos, costos y tiempos de cada vía.',
    keyTakeaways: [
      'Vía 1 (EUNACOM ASOFAMECH): Es la vía más expedita y estándar para el ejercicio general en el sistema público y privado.',
      'Vía 2 (Universidad de Chile / Prorrectoría): Proceso de revalidación y reconocimiento académico tradicional de título universitario.',
      'Vía 3 (CONACEM Directo): Exclusiva para médicos especialistas con más de 5 años de formación o práctica demostrada.',
      'Vía 4 (Convenios y Tratados Bilaterales): Reconocimiento directo para países con tratados vigentes (Tratado de México de 1902, Convenio con España, Uruguay, etc.).'
    ],
    faqs: [
      {
        q: '¿Si tengo título de un país con convenio bilateral debo rendir el EUNACOM?',
        a: 'El convenio bilateral convalida el título profesional ante el MINREL, pero para ser contratado en el Sistema Nacional de Servicios de Salud (FONASA/Hospitales/CESFAM) la ley chilena 20.261 exige de todas formas la aprobación del EUNACOM.'
      },
      {
        q: '¿Cuánto demora el trámite de revalidación por EUNACOM comparado con la Universidad de Chile?',
        a: 'Por EUNACOM suele demorar entre 6 y 12 meses (según la fecha en que apruebes el práctico), mientras que por la Universidad de Chile puede extenderse entre 12 y 24 meses.'
      }
    ],
    content: `
## Matriz Comparativa de las 4 Vías de Revalidación

| Vía de Revalidación | Entidad Responsable | Dirigido a | Exámenes Requeridos | Permite Ejercer en Sector Público |
| :--- | :--- | :--- | :--- | :--- |
| **1. EUNACOM (Ley 20.261)** | ASOFAMECH | Todo médico general o especialista extranjero | Teórico (ST) + Práctico (SP) | **Sí** (Habilitación total) |
| **2. Universidad de Chile** | Prorrectoría U. de Chile | Médicos que buscan reconocimiento académico | Examen general de revalidación | Sí (tras validación ministerial) |
| **3. CONACEM Directo** | Corporación CONACEM | Especialistas certificados (+5 años) | Teórico y Práctico de especialidad | Sí (sólo en su especialidad) |
| **4. Tratados Bilaterales** | MINREL / Cancillería | Médicos de España, Colombia, Uruguay, etc. | Validación documental | Requiere EUNACOM para sector público |

---

## Lista de Cotejo de Documentación Requerida

Para iniciar cualquiera de los procesos anteriores, los documentos deben contar con **Apostilla de La Haya** (o legalización consular en caso de países no firmantes):

1. **Título de Médico Cirujano**: Original o copia legalizada ante notario en Chile con apostilla electrónica.
2. **Concentración de Notas / Calificaciones**: Detalle de asignaturas cursadas con escala de notas y nota mínima de aprobación.
3. **Plan de Estudios y Carga Horaria**: Certificado de horas teóricas y prácticas o programa académico emitido por la universidad de origen.
4. **Certificado de Habilitación Profesional**: Documento que acredite que no posees suspensiones ni sanciones éticas en tu país de origen.
5. **Cédula de Identidad Chilena (RUN) o Pasaporte**: Documento de identidad vigente.

:::prereq
**Alerta Legal:** Los documentos emitidos en idioma distinto al español (ej: Brasil) deben ser traducidos oficialmente por el Ministerio de Relaciones Exteriores de Chile (MINREL) o traductor público autorizado.
:::
    `.trim()
  },
  {
    slug: 'trabajar-como-medico-en-chile',
    aliases: ['trabajar-en-chile'],
    title: 'Trabajar como médico en Chile: Sistema público (APS/CESFAM/Hospitales) vs privado y sueldos',
    metaTitle: 'Trabajar como Médico en Chile: Sueldos, CESFAM, Hospitales y Sector Privado',
    metaDescription: 'Guía laboral para médicos en Chile: cuánto gana un médico general en APS/CESFAM, turnos en urgencias SAPU/SAR, remuneraciones hospitalarias y sector privado.',
    date: '2026-08-01',
    readTime: '7 min',
    category: 'Revalidación y Trámites',
    author: {
      name: 'Dr. Felipe Yáñez',
      role: 'Médico Cirujano · Director Académico EUNACOM',
      regNumber: 'RNPI Nº 642819'
    },
    excerpt: 'El mercado médico en Chile ofrece alta empleabilidad y remuneraciones atractivas. Conoce cómo funciona el sistema de salud, los tipos de contrato y las escalas de sueldo.',
    keyTakeaways: [
      'Un médico general de 44 horas semanales en Atención Primaria (CESFAM) percibe entre $2.800.000 y $4.200.000 CLP líquidos mensuales.',
      'Los turnos adicionales en servicios de urgencia (SAPU / SAR / Urgencia Hospitalaria) se pagan entre $25.000 y $45.000 CLP por hora.',
      'El ejercicio privado a través de FONASA Libre Elección permite emitir bonos de consulta médica tras la aprobación del EUNACOM.',
      'Las zonas rurales y extremas de Chile ofrecen asignaciones de zona que incrementan la remuneración base hasta en un 80%–120%.'
    ],
    faqs: [
      {
        q: '¿Cuál es la diferencia entre contrato de 44 horas en CESFAM y contrata hospitalaria?',
        a: 'En CESFAM te riges por la Ley 19.378 (Estatuto de Atención Primaria), con horario diurno habitual de lunes a viernes y asignaciones municipales. En hospitales te riges por la Ley Médica 19.664 (28h/16h o 44h) con turnos de residencia.'
      },
      {
        q: '¿Puedo trabajar en clínicas privadas antes de aprobar el EUNACOM?',
        a: 'Las clínicas privadas exigen registro en la Superintendencia de Salud (RNPI), el cual requiere la aprobación del EUNACOM. Durante períodos de alerta sanitaria existieron excepciones transitorias, pero actualmente el EUNACOM es el estándar exigido por las acreditadoras de calidad.'
      }
    ],
    content: `
## El Ecosistema de Salud en Chile

El sistema de salud chileno es mixto, compuesto por el sector público (**FONASA** y Sistema Nacional de Servicios de Salud) y el sector privado (**ISAPRES** y prestadores privados):

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    SISTEMA MÉDICO CHILENO                   │
├───────────────────────────────┬─────────────────────────────┤
│         SECTOR PÚBLICO        │        SECTOR PRIVADO       │
├───────────────────────────────┼─────────────────────────────┤
│ • APS: CESFAM / CECOSF        │ • Clínicas de Alta Complej. │
│ • Urgencias: SAPU / SAR / UAP │ • Centros Médicos y Consult.│
│ • Hospitales Tipo 1, 2, 3, 4  │ • Libre Elección FONASA     │
│ • SAMU (Atención Prehosp.)    │ • Telemedicina Privada      │
└───────────────────────────────┴─────────────────────────────┘
\`\`\`

---

## Escala de Remuneraciones Estimadas (Valores 2026 en CLP)

| Modalidad Laboral | Jornada Semanal | Rango Líquido Mensual (CLP) | Equivalente en USD aprox. |
| :--- | :--- | :--- | :--- |
| **Médico General en CESFAM (APS)** | 44 horas diurnas | $2.800.000 – $3.900.000 | $3.000 – $4.100 USD |
| **Médico APS en Zona Extrema (Rural)** | 44 horas + Asig. Zona | $4.200.000 – $5.800.000 | $4.400 – $6.100 USD |
| **Médico de Urgencia Hospitalaria** | 28 horas + turnos | $3.200.000 – $4.500.000 | $3.400 – $4.700 USD |
| **Turnos SAPU / SAR (Honorarios)** | 12 horas fin de semana | $300.000 – $500.000 por turno | $320 – $530 USD / turno |
| **Consulta Médica Privada / Bonos** | Por paciente atendido | $15.000 – $35.000 por consulta | $16 – $37 USD / pac. |

:::pearl
**Proyección de Carrera:** Muchos médicos combinan un contrato de 33 o 44 horas en CESFAM de lunes a viernes con 2 a 3 turnos mensuales en servicios de urgencia, logrando ingresos mensuales netos superiores a los $4.500.000 CLP.
:::
    `.trim()
  },
  {
    slug: 'eunacom-st-vs-eunacom-sp',
    aliases: ['st-vs-sp'],
    title: 'EUNACOM-ST vs EUNACOM-SP: Diferencias, exenciones y requisitos para ejercer en Chile',
    metaTitle: 'EUNACOM-ST vs EUNACOM-SP: Diferencias Clave y Exenciones | Guía 2026',
    metaDescription: 'Comparativa definitiva entre el EUNACOM Teórico (ST) y Práctico (SP): formatos de examen, quiénes deben rendir cada uno, exenciones y cómo prepararlos.',
    date: '2026-07-28',
    readTime: '6 min',
    category: 'Información EUNACOM',
    author: {
      name: 'Dr. Felipe Yáñez',
      role: 'Médico Cirujano · Director Académico EUNACOM',
      regNumber: 'RNPI Nº 642819'
    },
    excerpt: 'El EUNACOM no es una sola prueba: consta de una sección teórica estandarizada (ST) y una sección práctica dividida en 4 áreas clínicas (SP). Conoce sus alcances legales.',
    keyTakeaways: [
      'EUNACOM-ST es la prueba escrita nacional de 180 preguntas de selección múltiple.',
      'EUNACOM-SP evalúa destrezas en Medicina Interna, Pediatría, Cirugía y Obstetricia/Ginecología.',
      'Ambos componentes son obligatorios para médicos extranjeros sin convenio bilateral específico.',
      'Los médicos formados en Chile convalidan el SP mediante la aprobación de sus internados acreditados.'
    ],
    faqs: [
      {
        q: '¿Se puede rendir el EUNACOM Práctico antes del Teórico?',
        a: 'En la normativa vigente de ASOFAMECH, generalmente se exige haber rendido o aprobado el EUNACOM-ST antes de ser programado para las comisiones evaluadoras del EUNACOM-SP.'
      },
      {
        q: '¿Cuánto dura la vigencia de la aprobación de cada componente?',
        a: 'La aprobación del EUNACOM-ST no caduca para efectos de la convalidación del título médico en Chile.'
      }
    ],
    content: `
## Comparativa Directa entre Ambos Componentes

| Característica | EUNACOM-ST (Teórico) | EUNACOM-SP (Práctico) |
| :--- | :--- | :--- |
| **Formato** | 180 preguntas de selección múltiple (5 alternativas) | Examen clínico estructurado (ECOE) y pacientes reales |
| **Duración** | 1 día (4 horas de rendición en 2 bloques) | 4 etapas en diferentes fechas y hospitales |
| **Sede** | Auditorios universitarios nacionales | Centros de simulación y hospitales clínicos |
| **Calificación** | Nota numérica de 0 a 100 puntos (Corte: 51.0) | Aprobado / Reprobado por cada una de las 4 ramas |
| **Frecuencia** | 2 veces al año (Julio y Diciembre) | Convocatorias periódicas durante el año |

---

## Exenciones y Casos Especiales

1. **Médicos de Universidades Chilenas Acreditadas**: Quedan automáticamente eximidos de la sección práctica (SP) si sus internados de 6º y 7º año fueron aprobados en programas con acreditación vigente ante la CNA.
2. **Especialistas con Certificación CONACEM**: Quienes certifican su especialidad directamente por CONACEM pueden quedar exentos del EUNACOM para el ejercicio exclusivo de su especialidad médica.
    `.trim()
  },
  {
    slug: 'reconstrucciones-eunacom-que-son',
    aliases: ['reconstrucciones-eunacom-guia', 'reconstrucciones-eunacom'],
    title: 'Reconstrucciones del EUNACOM: Qué son y por qué son clave para aprobar',
    metaTitle: 'Reconstrucciones EUNACOM: Qué Son y Cómo Estudiar con Exámenes Reales',
    metaDescription: 'Descubre por qué las reconstrucciones de exámenes EUNACOM anteriores son el recurso pedagógico más valioso para predecir y dominar las preguntas oficiales.',
    date: '2026-07-22',
    readTime: '5 min',
    category: 'Estrategia y Métodos',
    author: {
      name: 'Dr. Felipe Yáñez',
      role: 'Médico Cirujano · Director Académico EUNACOM',
      regNumber: 'RNPI Nº 642819'
    },
    excerpt: 'Las reconstrucciones de exámenes pasados permiten calibrar la dificultad real, identificar distractores recurrentes y entrenar con el lenguaje clínico de ASOFAMECH.',
    keyTakeaways: [
      'Las reconstrucciones compilan las preguntas reales recordadas por médicos inmediatamente después de rendir el examen.',
      'Permiten identificar los tópicos de mayor recurrencia histórica que se repiten con variaciones de caso clínico.',
      'Entrenan la lectura crítica de enunciados extensos y el descarte metódico de distractores.',
      'En Eunacom App todas las reconstrucciones están digitalizadas con justificaciones basadas en Guías GES.'
    ],
    faqs: [
      {
        q: '¿Las preguntas del EUNACOM se repiten exactamente igual año tras año?',
        a: 'No se repiten de forma textual, pero el concepto clínico evaluado (ej: conducta ante tromboembolismo pulmonar en embarazo, dosis de adrenalina en anafilaxia o plazos GES de retinopatía diabética) se evalúa con una frecuencia superior al 85%.'
      }
    ],
    content: `
## El Valor Pedagógico de las Reconstrucciones

Estudiar medicina general en libros clásicos como el Harrison o Farreras cubre la teoría, pero no entrena la habilidad específica de responder preguntas de opción múltiple diseñadas por comités académicos chilenos.

### 1. Detección de Patrones de Redacción
ASOFAMECH utiliza estilos específicos de redacción clínica:
- Enunciados con datos de laboratorio implícitos (ej: *gases arteriales con acidosis metabólica y anión gap elevado*).
- Preguntas sobre la **conducta médica más adecuada** (diferenciando entre confirmación diagnóstica vs. tratamiento de emergencia).

### 2. Calibración del Nivel de Dificultad
Resolver exámenes reconstruidos te sitúa en el percentil real de exigencia, evitando que subestimes áreas como Cirugía o Psiquiatría.

### 3. Retroalimentación de Errores en Tiempo Real
Al practicar reconstrucciones digitalizadas en **Eunacom App**, cada alternativa incorrecta cuenta con la explicación clínica de por qué no aplica en ese caso.
    `.trim()
  },
  {
    slug: 'areas-tematicas-eunacom',
    aliases: ['temario-oficial-eunacom'],
    title: 'Las 7 Áreas Temáticas del EUNACOM: Distribución y Estrategia',
    metaTitle: 'Las 7 Áreas Temáticas del EUNACOM | Ponderación y Temario Oficial ASOFAMECH',
    metaDescription: 'Desglose detallado de las 7 áreas temáticas del EUNACOM: Medicina Interna, Pediatría, Ginecología, Cirugía, Psiquiatría, Especialidades y Salud Pública.',
    date: '2026-07-15',
    readTime: '7 min',
    category: 'Especialidades y ECOE',
    author: {
      name: 'Dr. Felipe Yáñez',
      role: 'Médico Cirujano · Director Académico EUNACOM',
      regNumber: 'RNPI Nº 642819'
    },
    excerpt: 'Conocer la ponderación exacta de cada especialidad te permite distribuir tus semanas de estudio con criterio de máxima rentabilidad de puntos.',
    keyTakeaways: [
      'Medicina Interna y Pediatría concentran prácticamente la mitad de todas las preguntas del examen.',
      'Salud Pública y Psiquiatría son las áreas de más rápido avance si se estudian con algoritmos y normas vigentes.',
      'Especialidades incluye Oftalmología, Otorrinolaringología, Dermatología y Traumatología.',
      'El Perfil de Conocimientos V3 de ASOFAMECH define los diagnósticos que el médico general debe resolver en forma autónoma.'
    ],
    faqs: [
      {
        q: '¿Dónde se encuentra el temario oficial del EUNACOM?',
        a: 'El documento oficial es el "Perfil de Conocimientos del EUNACOM" publicado por ASOFAMECH en eunacom.cl.'
      }
    ],
    content: `
## Desglose Completo de las 7 Áreas

### 1. Medicina Interna (~30% / 54 Preguntas)
- **Cardiovascular**: HTA esencial y secundaria, Fibrilación Auricular, Síndrome Coronario Agudo, Insuficiencia Cardíaca.
- **Respiratorio**: EPOC, Asma Bronquial, Neumonía Adquirida en la Comunidad (NAC), Tuberculosis (TBC).
- **Digestivo**: Hemorragia Digestiva Alta y Baja, Cirrosis y Encefalopatía, Enfermedad por Reflujo Gastroesofágico.
- **Endocrinología**: Diabetes Mellitus tipo 2 (algoritmo ADA/MINSAL), Hipotiroidismo, Crisis Hiperglicémicas.
- **Nefrología**: Injuria Renal Aguda (KDIGO), Enfermedad Renal Crónica, Síndromes Glomerulares.
- **Infectología**: Neumonía, ITU, Meningitis Aguda, VIH/SIDA e Infecciones de Transmisión Sexual.

### 2. Pediatría (~18% / 32 Preguntas)
- **Neonatología**: Reanimación neonatal, Ictericia neonatal, Dificultad respiratoria del recién nacido.
- **Infecciones Respiratorias**: Bronquiolitis, Síndrome Bronquial Obstructivo (SBO), Laringitis aguda obstructiva.
- **Desarrollo y Nutrición**: Lactancia materna, Curvas OMS, Malnutrición por déficit y exceso, Hitos del DSM.
- **Inmunizaciones**: Calendario oficial del PNI chileno.

### 3. Obstetricia y Ginecología (~15% / 27 Preguntas)
- **Obstetricia**: Control prenatal, Estados Hipertensivos del Embarazo (PE/Eclampsia), Hemorragias de la 2ª mitad (DPPNI, Placenta Previa), Rotura Prematura de Membranas.
- **Ginecología**: Cáncer cervicouterino (tamizaje PAP/VPH), Cáncer de mama, Hemorragia Uterina Anormal, Infecciones ginecológicas y Enfermedad Pélvica Inflamatoria (EPI).

### 4. Cirugía General (~12% / 22 Preguntas)
- **Abdomen Agudo**: Apendicitis aguda, Colecistitis aguda, Obstrucción intestinal, Peritonitis.
- **Trauma**: Manejo inicial del politraumatizado según protocolo ATLS, Neumotórax a tensión.
- **Pared Abdominal**: Hernias inguinales, crurales y umbilicales complicadas vs no complicadas.

### 5. Psiquiatría y Salud Mental (~10% / 18 Preguntas)
- Trastornos del ánimo (Depresión mayor, Bipolaridad), Trastornos de ansiedad y pánico, Esquizofrenia y brote psicótico, Urgencias psiquiátricas y riesgo suicida.

### 6. Especialidades (~8% / 14 Preguntas)
- **Oftalmología**: Ojo rojo (diagnóstico diferencial), Glaucoma agudo, Desprendimiento de retina.
- **ORL**: Otitis media aguda, Sinusitis, Epistaxis, Hipoacusias.
- **Dermatología**: Lesiones elementales, Acné, Psoriasis, Cáncer de piel (Melanoma vs Carcinomas).
- **Traumatología**: Fracturas expuestas, Luxación de hombro/cadera, Síndrome compartimental.

### 7. Salud Pública y Epidemiología (~7% / 13 Preguntas)
- Garantías Explícitas en Salud (**GES/AUGE**), Indicadores de salud (mortalidad infantil, esperanza de vida), Sensibilidad, Especificidad, VPP, VPN, Ley de Derechos y Deberes de los Pacientes.
    `.trim()
  },
  {
    slug: 'mejores-apps-preparar-eunacom-2026',
    aliases: ['comparativa-apps-eunacom'],
    title: 'Las Mejores Apps y Plataformas para Preparar el EUNACOM 2026 en Chile (Comparativa)',
    metaTitle: 'Las Mejores Apps para Preparar el EUNACOM 2026 en Chile | Comparativa',
    metaDescription: 'Comparativa exhaustiva de plataformas para el EUNACOM 2026: Eunacom App, Dr. EUNACOM, Mi EUNACOM, Guevara y EUNAMED. Precios, banco de preguntas y clases.',
    date: '2026-07-08',
    readTime: '7 min',
    category: 'Estrategia y Métodos',
    author: {
      name: 'Dr. Felipe Yáñez',
      role: 'Médico Cirujano · Director Académico EUNACOM',
      regNumber: 'RNPI Nº 642819'
    },
    excerpt: 'Analizamos las mejores aplicaciones y plataformas para preparar el EUNACOM 2026 en Chile: volumen de preguntas, clases grabadas, simulacros y relación precio-calidad.',
    keyTakeaways: [
      'Eunacom App ofrece más de 10.000 preguntas justificadas con guías GES y más de 650 clases en video.',
      'El modelo de pago único sin suscripciones recurrentes evita cobros inesperados para los médicos en preparación.',
      'La integración de simulacros con percentil comparativo permite medir el avance real semana a semana.',
      'La compatibilidad PWA permite estudiar en cualquier dispositivo móvil o de escritorio sin interrupciones.'
    ],
    faqs: [
      {
        q: '¿Por qué elegir un banco de preguntas digital interactivo frente a guías impresas?',
        a: 'Porque la aplicación mide tus tiempos de respuesta por pregunta, registra tus errores en un banco de repaso automatizado y te sitúa en un percentil de rendimiento con respecto a miles de médicos en tiempo real.'
      }
    ],
    content: `
## Ranking 2026: Plataformas y Cursos EUNACOM en Chile

Con la alta exigencia de ASOFAMECH, la preparación mediante plataformas digitales es hoy el estándar para médicos nacionales y extranjeros. A continuación, el análisis comparativo:

---

### 1. ⭐ Eunacom App (https://www.eunacomapp.cl) — Opción Líder en Cobertura y Precio

- **Banco de preguntas**: +10.000 casos clínicos actualizados con Guías GES y MINSAL.
- **Clases en video**: +650 clases grabadas organizadas por especialidad.
- **Reconstrucciones**: Todas las convocatorias históricas explicadas alternativa por alternativa.
- **Simulacros**: Exámenes cronometrados de 180 preguntas en 4 horas con percentil.
- **Precios**: Planes accesibles desde **$14.990 CLP** de pago único (sin suscripciones mensuales sorpresa).
- **Acceso multidispositivo**: iPhone, Android, Mac y Windows.

---

### 2. Dr. EUNACOM / Mi EUNACOM

- **Enfoque**: Asistentes virtuales mediante IA conversacional.
- **Limitaciones**: Banco de preguntas más acotado (~2.000–3.000 preguntas), menor profundidad en clases teóricas estructuradas y cobros recurrentes de $49.990 a $89.990 mensuales.

---

### 3. Cursos Presenciales Tradicionales (Guevara, EUNAMED)

- **Enfoque**: Clases magistrales en vivo y trayectoria histórica.
- **Limitaciones**: Costos elevados (entre $450.000 y $1.200.000+ CLP), horarios fijos que chocan con turnos de trabajo y materiales en PDF estático.

---

## Tabla Resumen Comparativa

| Plataforma | Preguntas Clínicas | Clases en Video | Simulacros 180 Preguntas | Precio de Entrada | Modelo de Pago |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Eunacom App** | **+10.000** | **+650 clases** | **Ilimitados** | **$14.990 CLP** | **Pago Único** |
| Dr. EUNACOM | ~2.500 | Limitadas | 3 a 5 | $49.990 / mes | Suscripción |
| Guevara / EUNAMED | ~1.000 en PDF | En vivo | 2 a 4 | $450.000+ | Pago alto / Cuotas |
    `.trim()
  }
]

export default BLOG_POSTS
