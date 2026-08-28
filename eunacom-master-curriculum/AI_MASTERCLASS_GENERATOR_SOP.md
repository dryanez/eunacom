# 🤖 EUNACOM 2026: STANDARD OPERATING PROCEDURE (SOP) PARA GENERACIÓN DE MASTERCLASSES
## Guía Universal para Inteligencia Artificial y Creadores de Contenido

Este documento proporciona todas las instrucciones, reglas clínicas y arquitectura técnica necesarias para que **cualquier modelo de IA o desarrollador** construya clases interactivas, guiones de teleprompter, diapositivas y capítulos de libro para el EUNACOM 2026 sin perder calidad ni omitir información.

---

## 📁 1. UBICACIÓN DE LAS FUENTES DE DATOS

Toda la base de datos de 547 clases y 314 códigos oficiales se encuentra en:
1. **Catálogo Maestro JSON**: `d:\Anti\Eunacom\eunacom-master-curriculum\MASTER_CURRICULUM_547_CATALOG.json`
2. **Base de Datos Original con Transcripciones**: `d:\Anti\Eunacom\eunacom-app-v2\src\data\classesCatalog.json`
3. **Mapeo de Códigos Oficiales Perfil V3**: `d:\Anti\Eunacom\eunacom-app-v2\src\data\studio\perfil_v3_codes_exact.json`

---

## 🎯 2. FILOSOFÍA PEDAGÓGICA OBLIGATORIA (Boards & Beyond + Guevara)

Cada clase debe construirse respetando estrictamente estas 4 reglas:

1. **Granularidad & Micro-Conceptos (1 Idea por Slide)**:
   - Nunca amontonar más de 3 a 5 viñetas por diapositiva.
   - Cada diapositiva debe tener un tiempo de lectura/audio de **25 a 45 segundos**.
   - Si un tema es complejo (ej. *Tratamiento de la Insuficiencia Cardíaca*), se divide en varias diapositivas consecutivas (*Slide A: Mecanismo*, *Slide B: Dosis & Titulación*, *Slide C: Efectos Adversos & Alarmas*).

2. **Formato Visual 2-Columnas o Diagrama de Flujo Completo**:
   - **Columna Izquierda**: Viñetas concisas con palabras clave en **negrita de color** (`#dc2626` para contraindicaciones y emergencias, `#0284c7` para fármacos y metas).
   - **Columna Derecha**: Una imagen médica, tira de ECG, gráfico de fisiopatología o tabla comparativa.

3. **Enfoque en Exigencia Legal Perfil V3 (ASOFAMECh)**:
   - Debe quedar explícito el nivel exigido:
     - **Diagnóstico**: Específico vs Sospecha.
     - **Tratamiento**: Inicial vs Completo vs Urgencia.
     - **Seguimiento**: Completo en APS vs Derivar.

4. **Preguntas Tipo EUNACOM al Cierre**:
   - Cada clase debe incluir **2 a 3 casos clínicos interactivos** con 4 opciones y retroalimentación clínica inmediata que justifique por qué la correcta es la correcta y por qué los distractores fallan.

---

## 🏗️ 3. ESTRUCTURA ESTÁNDAR DE CADA DECK REACT (`src/slides/`)

Cada archivo de clase (ej. `Gastro01Deck.jsx`, `Neumo01Deck.jsx`) se crea como un componente React que exporta un `<Deck>` con los siguientes tipos de diapositivas:

```jsx
import React from "react";
import Deck from "../deck/Deck";
import { Slide } from "../deck/Slide";
import { BnBSlide } from "../components/deck/BnBSlide";
import { GuevaraAlgorithm } from "../components/deck/GuevaraAlgorithm";
import { GuevaraTable } from "../components/deck/GuevaraTable";
import { QuestionSlide } from "../components/deck/QuestionSlide";

export default function MiClaseDeck() {
  return (
    <Deck title="Título de la Clase" classId="modulo-xx">
      {/* 1. Portada */}
      <Slide nav="Portada" notes="Guion del narrador...">
        ...
      </Slide>

      {/* 2. Matriz Perfil V3 */}
      <Slide nav="Perfil V3" notes="Guion del narrador...">
        <GuevaraTable ... />
      </Slide>

      {/* 3-14. Desarrollo de Conceptos Granulares */}
      <Slide nav="Concepto 1" notes="...">
        <BnBSlide ... />
      </Slide>

      {/* 15. Algoritmo de Decisión Clínica */}
      <Slide nav="Algoritmo" notes="...">
        <GuevaraAlgorithm ... />
      </Slide>

      {/* 16-18. Casos Clínicos EUNACOM */}
      <Slide nav="Caso 1" notes="...">
        <QuestionSlide ... />
      </Slide>

      {/* 19. Resumen High-Yield */}
      <Slide nav="Resumen" notes="...">
        <GuevaraTable ... />
      </Slide>
    </Deck>
  );
}
```

---

## 🎙️ 4. ESTRUCTURA DEL GUION DE TELEPROMPTER / AUDIO (ElevenLabs)

Para cada diapositiva, el texto en `notes` debe escribirse en un lenguaje **médico claro, dinámico y pedagógico**, con el siguiente tono:
- Directo al grano: *"En esta diapositiva vemos el criterio de positividad del test de esfuerzo..."*
- Énfasis en reglas de examen: *"Recuerda esta regla de oro para el EUNACOM: si el paciente tiene BCRI, el test de esfuerzo convencional está contraindicado..."*
- Pacing natural: Oraciones breves, pausas lógicas y pronunciación adaptada al español médico chileno (ej. "AAS", "CESFAM", "MINSAL", "GES").

---

## 📖 5. ESTRUCTURA DEL CAPÍTULO DEL MANUAL DE TEXTO V2

Cada clase alimenta un capítulo correspondiente en el libro (`LIBRO_COMPLETO_V2.md`) con las siguientes secciones:
1. **Encabezado y Metadatos**: Código Perfil V3, Situación clínica, Niveles de Diagnóstico/Tratamiento/Seguimiento.
2. **Definición & Fisiopatología**: Explicación concisa y fisiológica de la enfermedad.
3. **Cuadro Clínico & Diagnóstico**: Síntomas cardinales, examen físico y criterios objetivos.
4. **Algoritmo de Estudio Diagnóstico**: Paso 1 en APS ➔ Paso 2 ➔ Examen Confirmatorio.
5. **Tratamiento & Guías GES/MINSAL**: Dosis exactas, fármacos de 1ra y 2da línea, metas terapéuticas.
6. **Banderas Rojas & Criterios de Derivación Inmediata a Urgencias**.
7. **Perlas de Examen (High-Yield Pearls)**: Los 5 puntos que más se repiten en el banco de preguntas.
