# 🎬 EUNACOM 2026 · Masterclass & Video Studio Architecture

> **Documento Maestro de Arquitectura y Guía Operativa del Sistema de Clases y Renderizado de Videos**  
> *Creado para documentar todo lo construido hasta la fecha y permitir continuar la producción de clases en cualquier equipo.*

---

## 📌 1. Visión General del Sistema

El **Studio Creator V3** es el subsistema de producción audiovisual y pedagógica de la plataforma EUNACOM. Transforma el temario oficial del **Perfil V3 de ASOFAMECh (2026)** en **Masterclasses Interactivas 16:9** y **Videos 1080p Full HD (`.mp4`)** listos para producción con voz médica sintetizada de ElevenLabs.

### Componentes Clave:
1. **Studio Hub (`/studio`)**: Panel de control administrativo para explorar especialidades, teleprompter, guiones clínicos y previsualización de slides.
2. **Motor de Diapositivas Bolt-Slides (`/deck/:classId`)**: Motor de presentación interactiva 1080p 16:9 con modo presentador, lápiz digital interactivo, sincronización de audio y modo de exportación limpia (`?export=true`).
3. **Pipeline de Audio ElevenLabs (`scripts/generate_class_audio.cjs`)**: Segmentador y sintetizador automático de guiones médicos slide por slide en español neutro (`eleven_multilingual_v2`).
4. **Renderizador de Video 1080p MP4 (`scripts/render_class_video.cjs`)**: Motor automatizado basado en Puppeteer + FFmpeg que captura cada diapositiva en 1920x1080, une el audio correspondiente y compila un video `.mp4` terminado.
5. **Control de Acceso Admin (`AdminRoute`)**: Protección estricta para que **únicamente el administrador (`dr.felipeyanez@gmail.com`)** tenga visibilidad y acceso a las herramientas del Studio y a las rutas de los Decks.

---

## 🏛️ 2. Estructura de Especialidades & Códigos Oficiales Perfil V3

Cada especialidad del Perfil V3 se organiza en **16 Masterclasses de 14 Slides** cada una, cubriendo el 100% de los códigos oficiales con sus niveles de exigencia legal:

### A. Gastroenterología (`1.06` - 64 Códigos Oficiales)
* **`1.06.1.001` - `1.06.1.037`**: 37 Enfermedades (Hepatitis, Cirrosis, ERGE, Úlcera péptica, Cáncer gástrico, CCR, PBE, etc.)
* **`1.06.2.001` - `1.06.2.012`**: 12 Signos y Síntomas (HDA/HDB, Ascitis, Ictericia, Disfagia, Constipación, etc.)
* **`1.06.3.001` - `1.06.3.008`**: 8 Procedimientos Terapéuticos (Paracentesis, Lavado gástrico, SNG, etc.)
* **`1.06.4.001` - `1.06.4.007`**: 7 Procedimientos Diagnósticos (Endoscopía digestiva, Colonoscopía, CPRE, etc.)
* **`1.06.5.001`**: 1 Situación Específica (Evaluación preoperatoria gastrointestinal)

*Catálogo de las 16 Masterclasses de Gastro*:
1. `gastro-01`: Hemorragia Digestiva Alta y Baja (1.06.2.007, 1.06.1.030, 1.06.4.007) **[COMPLETA + VIDEO MP4 LISTO]**
2. `gastro-02`: Hemorragia Digestiva Baja y Enfermedad Diverticular
3. `gastro-03`: Cirrosis Hepática e Hipertensión Portal (Ascitis)
4. `gastro-04`: Complicaciones de Cirrosis (PBE y Encefalopatía Hepática)
5. `gastro-05`: Enfermedad por Reflujo Gastroesofágico y Esófago de Barrett
6. `gastro-06`: Trastornos Motores Esofágicos y Disfagia (Acalasia)
7. `gastro-07`: Úlcera Péptica e Infección por Helicobacter pylori
8. `gastro-08`: Cáncer Gástrico y Lesiones Premalignas
9. `gastro-09`: Cáncer Colorrectal y Pólipos Colónicos
10. `gastro-10`: Patología Biliar Litiásica (Colelitiasis, Coledocolitiasis, Colangitis)
11. `gastro-11`: Pancreatitis Aguda y Crónica
12. `gastro-12`: Enfermedad Inflamatoria Intestinal (CU vs Crohn)
13. `gastro-13`: Diarrea Aguda y Crónica / Malabsorción (Enfermedad Celíaca)
14. `gastro-14`: Hepatitis Virales Agudas y Crónicas (VHA, VHB, VHC)
15. `gastro-15`: Síndrome de Intestino Irritable y Trastornos Funcionales
16. `gastro-16`: Urgencias Quirúrgicas Abdominales (Apendicitis, Obstrucción, Isquemia)

### B. Cardiología (`1.01` - 56 Códigos Oficiales)
* 56 códigos organizados en 16 Masterclasses (`cardio-01` a `cardio-16`): Infarto con y sin supradesnivel ST, Insuficiencia Cardíaca, Arritmias (FA, Flutter, TV, Bloqueos), Valvulopatías, Hipertensión Arterial, Shock y RCP.

---

## 🎨 3. Estándar de Diapositivas: Anatomía de una Masterclass (14 Slides)

Cada Masterclass debe implementar exactamente el siguiente flujo pedagógico sin contenido genérico:

| Slide | Tipo de Componente | Propósito Clínico |
|---|---|---|
| **1** | `<Cover>` | Portada con título oficial, códigos Perfil V3 y badges de nivel legal |
| **2** | `<Table>` | Matriz de Auditoría Oficial Perfil V3 (Diagnóstico, Tratamiento, APS/Derivación) |
| **3** | `<Steps>` | Fisiopatología cardinal y diagnóstico etiológico estructurado |
| **4** | `<Steps>` / `<Bento>` | Algoritmo de Reanimación & Urgencia (ABCDE, Vías, Expansión, Metas) |
| **5** | `<Table>` / `<Bento>` | Farmacoterapia Detallada con dosis exactas, vías y duración |
| **6** | `<Table>` | Clasificación Pronóstica / Escala Gold Standard (ej. Forrest, Killip, TIMI) |
| **7** | `<Steps>` | Procedimientos Diagnósticos / Terapéuticos (Técnica, Indicaciones, Rescate) |
| **8** | `<Contrast>` / `<Table>` | Diagnóstico Diferencial & Abordaje por Subtipos |
| **9** | `<Bento>` | Estratificación de Riesgo & Scores Clínicos (ej. Glasgow-Blatchford, Rockall) |
| **10** | `<Steps>` | Las 4 Trampas Clásicas del Banco de Preguntas EUNACOM |
| **11** | `<QuestionSlide>` | **Caso Clínico EUNACOM #1**: Diagnóstico y Reanimación inicial |
| **12** | `<QuestionSlide>` | **Caso Clínico EUNACOM #2**: Manejo Farmacológico / Procedimiento |
| **13** | `<QuestionSlide>` | **Caso Clínico EUNACOM #3**: Toma de Decisiones en Urgencias / Diferencial |
| **14** | `<Steps>` | Algoritmo de Decisión Resumido (Checklist de alta fidelidad) |

---

## 🎙️ 4. Pipeline de Audio con ElevenLabs

El script `scripts/generate_class_audio.cjs` automatiza la generación de voz médica:

1. Lee el catálogo `src/data/studio/perfil_v3_catalog.json`.
2. Extrae el `teleprompterScript` de la clase seleccionada y lo divide por bloques `[SLIDE X]`.
3. Llama a la API de ElevenLabs con el modelo `eleven_multilingual_v2` (voz médica en español neutro).
4. Guarda los audios individuales en `public/audio/{classId}/slide_{index}.mp3`.
5. Escribe el `manifest.json` con la duración y metadatos de cada slide.

### Comando para generar audio:
```bash
export ELEVENLABS_API_KEY="tu_api_key_aqui"
node scripts/generate_class_audio.cjs --class=gastro-01
```

---

## 📹 5. Motor de Renderizado de Video MP4 1080p

El script `scripts/render_class_video.cjs` produce videos `.mp4` finales sin interacción manual:

1. Inicia un navegador Chromium headless en resolución 1920x1080.
2. Navega a `http://localhost:5173/deck/{classId}?export=true` (modo exportación limpia, oculta controles y docks).
3. Captura capturas de pantalla PNG perfectas de las 14 diapositivas.
4. Con `ffmpeg`, empareja cada slide con su archivo `.mp3` de ElevenLabs generado en el paso anterior.
5. Concatena todos los segmentos y genera el video final en:
   * `dist/videos/{classId}.mp4`
   * `public/videos/{classId}.mp4`

### Comando para renderizar video:
```bash
node scripts/render_class_video.cjs --class=gastro-01
```

---

## 🔒 6. Seguridad & Control de Acceso de Administrador

* **Email del Administrador**: `dr.felipeyanez@gmail.com`
* **Guardia de Rutas (`AdminRoute`)**:
  * Rutas protegidas: `/studio`, `/deck/:classId`
  * Si un usuario no autenticado o no administrador intenta ingresar, es redirigido automáticamente a `/dashboard`.
  * La excepción `?export=true` permite al renderizador headless local de Puppeteer capturar las diapositivas.
* **Barra Lateral (`Sidebar.jsx` & `Sidebar-ios.jsx`)**:
  * El enlace `Studio Creator V3` está envuelto en `{isAdmin() && ...}`, oculto para todos los alumnos regulares.

---

## 🚀 7. Guía Paso a Paso: Cómo Crear la Siguiente Masterclass

Para agregar una nueva Masterclass (ejemplo: `gastro-02` o `cardio-02`):

### Paso 1: Crear el Componente de Diapositivas
Crear `src/slides/Gastro02Deck.jsx` siguiendo la estructura de 14 slides de `Gastro01Deck.jsx` con sus datos clínicos específicos.

### Paso 2: Registrar la Ruta en `DeckRunner.jsx`
Importar y agregar el condicional en `src/slides/DeckRunner.jsx`:
```jsx
import Gastro02Deck from "./Gastro02Deck";

if (classId === "gastro-02") {
  return <Gastro02Deck />;
}
```

### Paso 3: Agregar el Guión Clínico en `perfil_v3_catalog.json`
Completar el campo `teleprompterScript` en `src/data/studio/perfil_v3_catalog.json` para la clase con las etiquetas `[SLIDE 1]` a `[SLIDE 14]`.

### Paso 4: Generar Audio y Video MP4
```bash
# 1. Generar audios ElevenLabs
export ELEVENLABS_API_KEY="tu_clave"
node scripts/generate_class_audio.cjs --class=gastro-02

# 2. Renderizar video MP4 1080p
node scripts/render_class_video.cjs --class=gastro-02
```

El video estará disponible inmediatamente en `http://localhost:5173/videos/gastro-02.mp4` y en el **Studio Hub**!

---

## 📁 8. Mapa de Archivos Clave del Sistema

```
NEWeunacom/eunacom-app-v2/
├── MASTERCLASS_STUDIO_ARCHITECTURE.md    # Este documento maestro
├── scripts/
│   ├── generate_class_audio.cjs          # Generador de audio ElevenLabs
│   └── render_class_video.cjs            # Renderizador de videos 1080p MP4
├── src/
│   ├── deck/                             # Motor de diapositivas Bolt-Slides
│   │   ├── Deck.jsx                      # Contenedor principal, sincronización audio, canvas lápiz
│   │   └── Slide.jsx                     # Layout 16:9 y transiciones
│   ├── components/deck/                  # Componentes visuales de slides
│   │   ├── Cover.jsx                     # Portadas de clase
│   │   ├── Table.jsx                     # Tablas clínicas de alta fidelidad
│   │   ├── Steps.jsx                     # Algoritmos paso a paso
│   │   ├── Bento.jsx                     # Cuadrículas de diagnóstico/farmacología
│   │   ├── Contrast.jsx                  # Tablas de diagnóstico diferencial
│   │   └── QuestionSlide.jsx             # Casos clínicos interactivos EUNACOM
│   ├── slides/                           # Decks específicos por clase
│   │   ├── DeckRunner.jsx                # Router y cargador de decks
│   │   ├── Gastro01Deck.jsx              # Masterclass Gastro 01 (14 slides completas)
│   │   └── Cardio01Deck.jsx              # Masterclass Cardio 01 (14 slides completas)
│   ├── pages/
│   │   └── StudioHub.jsx                 # Panel Creator Studio con selector Cardio/Gastro
│   └── data/studio/
│       ├── perfil_v3_catalog.json        # Catálogo unificado de clases y guiones
│       ├── perfil_v3_gastro_exact.json   # 64 códigos exactos de Gastro Perfil V3
│       └── gastro_catalog.json           # 16 Masterclasses de Gastroenterología
├── public/
│   ├── audio/gastro-01/                  # 14 pistas de audio ElevenLabs (.mp3)
│   └── videos/gastro-01.mp4              # Video 1080p Full HD master (.mp4)
└── dist/videos/gastro-01.mp4             # Video exportado final
```
