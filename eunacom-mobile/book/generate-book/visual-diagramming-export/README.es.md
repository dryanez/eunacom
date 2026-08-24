# 📊 Visual Diagramming Export — Skills de IA para Antigravity · Claude Code · Gemini CLI · Cursor

![Visual Diagramming Suite](assets/banner.png)

[![Creador](https://img.shields.io/badge/Creador-SMARTbrain%20Activity-blue)](https://www.smartbrainactivity.ai)
[![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-yellow.svg)](LICENSE)
[![Auditoría Seguridad](https://img.shields.io/badge/Auditoría-Aprobada-brightgreen)](scripts/audit-scan.js)
![Antigravity Skill](https://img.shields.io/badge/Antigravity-Skill-black?logo=google&logoColor=white)
![Claude Code](https://img.shields.io/badge/Claude_Code-Compatible-blue?logo=anthropic&logoColor=white)
![Gemini CLI](https://img.shields.io/badge/Gemini_CLI-Compatible-4285F4?logo=google&logoColor=white)
![Excalidraw](https://img.shields.io/badge/Excalidraw-Diagrams-6965DB)
![Markmap](https://img.shields.io/badge/Markmap-Mind_Maps-FF6B6B)
![PlantUML](https://img.shields.io/badge/PlantUML-UML-green)
![License MIT](https://img.shields.io/badge/License-MIT-yellow)

Una colección de skills de IA para asistentes de código (como Claude, Antigravity, Cursor, etc.) diseñados para generar y exportar diagramas visuales directamente desde el chat o la terminal.

[🇬🇧 Read in English](README.md)

## 🚀 Instalación y Uso (Setup)

Para usar estos skills con tu asistente local de IA, debes clonar este repositorio dentro del directorio de "global skills" de tu editor (ej. `.gemini/antigravity/skills` o el equivalente en tu entorno).

1. Abre tu terminal y navega hasta la carpeta de skills globales de tu asistente de IA.
2. Ejecuta el siguiente comando para descargar la colección completa:

```bash
git clone https://github.com/SMARTbrainActivity/visual-diagramming-export.git
```

3. (Opcional pero recomendado) Audita el código usando nuestro escáner de seguridad antes de ejecutar:
```bash
node visual-diagramming-export/scripts/audit-scan.js
```
4. Reinicia tu chat con la IA. Ahora puedes pedirle: *"Genera un mapa mental sobre [Tema] usando Markmap"*.

---

## Skills Incluidos

- **[Excalidraw Crafter](./excalidraw-crafter)**: Genera archivos JSON `.excalidraw` puros para pizarras editables (diagramas de flujo, mapas mentales, matrices).
- **[Markmap Generator](./markmap-generator)**: Compila listas jerárquicas en mapas mentales interactivos en formato HTML independiente de forma local.
- **[PlantUML Architect](./plantuml-architect)**: Escribe código UML estricto y lo transforma de forma transparente en URLs de SVG/PNG listas para usar a través de la API de Kroki.

## Requisitos Previos
- **Node.js**: Necesario para ejecutar los scripts de compilación locales de Markmap y PlantUML en tu equipo.
- **Cualquier Agente de IA / IDE**: Estos skills son 100% independientes del IDE (agnósticos). La IA guardará los archivos en el disco local sin importar qué editor utilices.

**🛡️ Nota de Privacidad y Seguridad**: Si tu sistema aún no tiene Node.js instalado, la IA podría ofrecerte ejecutar el asistente guiado `start-skill.js`. Este script abierto viene incluido transversalmente en el repositorio y su ÚNICO propósito es invocar a los instaladores oficiales de tu sistema operativo (`winget`, `brew`, `apt-get`) para instalar Node.js de forma transparente. No contiene malware, descargas en segundo plano ni telemetría. Tienes total libertad y te animamos a auditar el código fuente en la carpeta libre `/scripts/` antes de presionar aceptar.

**🔍 Auditoría Estática Autocontenida**: Este repositorio incluye un escáner estático nativo (`scripts/audit-scan.js`) estilo Snyk/CodeQL. Puedes ejecutar `node scripts/audit-scan.js` en tu terminal en cualquier momento para verificar matemáticamente que ninguna de las lógicas ejecutables contiene patrones maliciosos (uso de `eval`, peticiones HTTP no autorizadas o borrados de sistema por `child_process`).

## Soporte Multilingüe (Agnóstico al Idioma)
Estos skills heredan automáticamente tu idioma. Puedes interactuar con la IA en español, inglés o cualquier otro idioma, y los diagramas generados contendrán el texto exacto en ese mismo idioma.

## Contacto y Soporte
- **Creador**: SMARTbrain Activity
- **Web**: [www.smartbrainactivity.ai](https://www.smartbrainactivity.ai)
- **Email**: hey@smartbrainactivity.ai
