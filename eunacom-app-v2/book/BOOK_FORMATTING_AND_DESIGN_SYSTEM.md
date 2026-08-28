# 📘 MANUAL DE DISEÑO, ARQUITECTURA Y FORMATEO EDITORIAL EUNACOM (DESIGN SYSTEM & PIPELINE SPECIFICATION)

Este documento es la **norma editorial técnica y de diseño completa** para estructurar, maquetar, diagramar y compilar cualquier capítulo o módulo del **Manual EUNACOM 2026** bajo el estándar editorial de alta densidad (estilo CTO / First Aid USMLE).

---

## 🗺️ RUTAS CLAVE DEL PIPELINE

```
d:\Anti\Eunacom\eunacom-app-v2\book\
├── scripts/
│   ├── dataset_bloque_1.cjs          # Dataset estructurado Bloque 1 (Capítulo 1)
│   ├── dataset_bloque_2.cjs          # Dataset estructurado Bloque 2 (Capítulo 2)
│   └── build_cto_with_v3_table_and_orange_header.cjs # Compilador Maestro Puppeteer
├── generate-book/svg_diagrams/       # Algoritmos vectoriales SVG limpios
├── figuras_galeria/ o figuras/       # Iconografía clínica (coronariografías, ECGs, esquemas)
└── libro_eunacom_v3/                 # Salida de PDFs compilados por módulo
```

---

## 1️⃣ NORMAS EDITORIALES OBLIGATORIAS (GOLDEN RULES)

### 📌 REGLA 1: ELEMENTOS 100% FULL-WIDTH (ANCHO COMPLETO DE LADO A LADO)
* **Figuras Clínicas (`.clinical-fig-card-fullwidth`)**: Deben ocupar el 100% del ancho de la página (no dividir en cajas del 50% que compriman o deformen las imágenes).
  * Las imágenes internas se organizan en un contenedor flex horizontal (`.fig-card-body-flex`) con altura controlada (`max-height: 120px` a `140px`, `object-fit: contain`), fondo neutro claro (`#f8fafc`), borde redondeado y etiqueta inferior (`.sub-img-label`).
  * Pie de figura (`.fig-card-footer-caption`): Texto a ancho completo explicando la interpretación médica y la **Perla EUNACOM**.
* **Tablas de Contenido (`.cto-table-wrapper-fullwidth`)**: Estructura a ancho completo (100%), cabecera azul marino (`#1e3a8a`), tipografía compacta (`7.6pt`), padding holgado (`4.5px 8px`) y filas alternadas.
* **Algoritmos Vectoriales SVG (`.cto-diagram-container`)**: Contenedor a ancho completo con borde y cabecera numerada `FIGURA X.X: TÍTULO DEL ALGORITMO`.

---

### 📌 REGLA 2: REFERENCIACIÓN OBLIGATORIA EN EL TEXTO PROSA
Todo elemento gráfico o tabular debe estar **explícitamente citado dentro de los párrafos de texto** del tema:
* **Figuras clínicas**: *(véase Figura 2.1A: Angiografía de Arterias Coronarias)*, *(véase Figura 2.1B: Cascada Isquémica y Revascularización CABG)*.
* **Tablas de datos**: *(véase Tabla 2.1: Esquema de Terapia Médica Óptima)*, *(véase Tabla 2.3: Dosificación de Fibrinólisis con Tenecteplase)*.
* **Algoritmos**: *(véase Figura 2.1: Algoritmo Diagnóstico y Manejo de Angina Estable)*.

---

### 📌 REGLA 3: BANCO DE PREGUNTAS SIN SPOILERS + SOLUCIONARIO FINAL
* **En la página del tema**: Solo se colocan los enunciados clínicos oficiales numerados y las opciones de respuesta (**A a la E**). No se muestra la clave ni la justificación al pie de la pregunta para garantizar el estudio activo.
* **Al final del libro**: Se incluye una sección dedicada **"Solucionario & Justificaciones Razonadas EUNACOM"** (`.cto-solucionario-page`) en grid de 2 columnas con la clave correcta destacada en verde (`.sol-correct-pill`) y la justificación clínica oficial con perlas para el examen.

---

### 📌 REGLA 4: TABLA MAESTRA PERFIL V3 ORDENADA NUMÉRICAMENTE
* En la Página 2 del manual, la **Tabla Maestra de Códigos Perfil V3** debe estar ordenada estrictamente de forma correlativa numérica por código (`1.01.1.001`, `1.01.1.002`, `1.01.1.008`, ..., `1.01.4.001`).
* Botón de acceso a la clase (`Clase X.X →`) y texto limpio para las Garantías GES (sin enlaces rotos o ficticios).

---

### 📌 REGLA 5: PORTADILLA DE CAPÍTULO (CHAPTER OPENER) EN 4 BLOQUES FULL-WIDTH
1. **Orientación EUNACOM**: Impacto del capítulo en el examen (4 a 6 preguntas) y metas de estudio.
2. **Matriz Legal Perfil V3 ASOFAMECh**: Competencias oficiales (Código, Diagnóstico, Tratamiento, Seguimiento, GES).
3. **Historial de Preguntas EUNACOM**: Reconstrucciones históricas organizadas en grid interno de 2 columnas.
4. **Conceptos Clave & Trampas Frecuentes**: Puntos de alto rendimiento con alertas visuales destacadas en rojo (`.is-trap-row`) para errores graves.

---

### 📌 REGLA 6: CABECERA NARANJA DE LADO A LADO Y PIE LIMPIO
* **Cabecera superior (`.orange-top-bar`)**: Banda naranja continua con `Manual EUNACOM de Cardiología, 1.ª edición` a la izquierda y `CAPÍTULO XX • TEMA X.X` a la derecha en badge blanco/oscuro.
* **Pie de página**: Número de página centrado y limpio sin textos redundantes.

---

## 2️⃣ GUÍA DE AUTOMATIZACIÓN PARA OTROS CAPÍTULOS Y MÓDULOS

Para extender este estándar a los siguientes bloques y especialidades (Gastroenterología, Nefrología, Neumología, Pediatría, Cirugía, etc.):

1. **Crear el dataset estructurado en `book/scripts/dataset_bloque_X.cjs`** incluyendo:
   - `id`, `topicLabel`, `title`, `perfilCode`, `dx`, `tx`, `seg`, `ges`.
   - `contentSections` con menciones explícitas a tablas (`Tabla X.X`) y figuras (`Figura X.XA/B`).
   - `table`: headers y rows de alta densidad.
   - `svg`: nombre del diagrama vectorial limpio.
   - `vignette`: caso clínico con viñeta, análisis y conducta.
   - `keyPoints`: reglas de oro del examen.
   - `questions`: 2 preguntas de selección múltiple con opciones A-E, clave y justificación razonada.
2. **Iconografía clínica**: Extraer o crear las imágenes clínicas a 300 DPI y colocarlas en la carpeta de figuras del módulo.
3. **Ejecutar el compilador Puppeteer**: Generará el PDF maestro con portada, matriz V3 correlativa, índice, portadillas de 4 tarjetas, flujo a 2 columnas con figuras y tablas full-width, y el solucionario general final compilado automáticamente.
