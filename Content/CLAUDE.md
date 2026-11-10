# Content Engine — Editor Guidelines & Brand Taste

This file is the operational brain for autonomous video editing for **EUNACOM** (`eunacomapp.cl`).

---

## 1. Persona & Tone
- **On-Camera Talent:** Clinical Mentor / Senior Colleague wearing a **White Coat or Scrubs**.
- **Voice:** Authoritative, high-yield, empathetic to exam stress, direct.
- **Salutation Style:** *"Colega..."*, *"Ojo con esta pregunta fija..."*, *"Si vas a rendir el EUNACOM este año..."*
- **Absolute Rule:** Zero AI avatars. 100% authentic human footage.

---

## 2. Competitive Edge & Positioning
- **Dr. Guevara:** We counter his old-school, slow whiteboard lectures with **lightning-fast, modern app-driven case breakdowns**.
- **EunaMed:** We counter their dry corporate webinars with **instant clinical value in 45 seconds**.
- **CTO / AMIR:** We counter their dense Spanish MIR encyclopedias with **hyper-focused Chilean Minsal/GES guidelines and Perfil V3 (2026)**.

---

## 3. Video Editing & Visual Specifications
- **Aspect Ratio:** 9:16 vertical (1080x1920).
- **Silence Cutting (ffmpeg):** Any pause or breath `> 300ms` at `< -30dB` is cleanly removed. Pacing must feel crisp and uninterrupted.
- **Audio:** Leveled dialogue normalized to -14 LUFS (`loudnorm`).
- **Captions (Crucial for 80%+ muted viewing):**
  - Position: Center vertical safe zone (below face, above TikTok/IG UI caption bar).
  - Font: Bold, heavy sans-serif (TheBoldFont, Montserrat Black, or Futura Bold).
  - Kinetic Style: Active word highlighted in bright **Yellow (`#FFE600`)** or **Teal/Cyan (`#00E5FF`)**.
  - Maximum 3 to 4 words per frame on screen to maintain reading speed.
- **B-Roll & Overlays:**
  - When a clinical case is spoken: overlay real EUNACOM app question cards.
  - When time pressure is discussed: overlay the real simulacro countdown clock.
  - When wrong options are dissected: highlight the rationale card from the app.

---

## 4. App Download Conversion Formulas (Calls to Action)
Never use generic CTAs like *"Descarga la app"*. Always use specific, high-curiosity triggers:

1. **The Diagnostic Challenge:**  
   *"¿Cuántas de estas 5 sacas buenas? Haz el mini-simulacro gratis de 10 preguntas de [Especialidad] en el link de la bio."*
2. **The Comment Hook:**  
   *"Comenta **SIMULACRO** y te mando el enlace directo para medir tu puntaje actual con el timer oficial del EUNACOM."*
3. **The Unresolved Pearl:**  
   *"El desglose completo con la norma técnica Minsal 2026 está en el simulacro interactivo de la app."*

---

## 5. Hook Matrix (Ship 3 to 5 Intros Per Video Body)

For every raw video recording, prepare and export 3 to 5 versions with different 3-second openers:

- **Hook 1 (The Trap):** *"El 85% de los médicos se equivoca en esta pregunta de [Especialidad] del EUNACOM..."*
- **Hook 2 (The Contrarian):** *"Por qué estudiar resúmenes de 200 páginas te va a costar el examen..."*
- **Hook 3 (The Time Bomb):** *"Tienes 60 segundos por pregunta en el EUNACOM. Si no sabes este algoritmo, vas a perder 5 minutos..."*
- **Hook 4 (The Direct Question):** *"Caso clínico EUNACOM: Paciente de 32 semanas con PA 150/100 y proteinuria. ¿Conducta inmediata?"*
- **Hook 5 (The Score Secret):** *"Esta sola pregunta de Salud Pública vale el 5% de tu puntaje total..."*

---

## 6. Directory Map
- `Raw/`: Unedited phone footage.
- `Finished/`: AI-cut MP4s + generated captions and hashtag sets.
- `Brand/`: App logo, high-res UI screenshots, 3 taste reference videos.
- `Performance/`: Weekly screenshots of reach, retention, and app install attribution.
