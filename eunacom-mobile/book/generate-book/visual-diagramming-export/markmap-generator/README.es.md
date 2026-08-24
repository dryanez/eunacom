# Markmap Generator Skill

[🇬🇧 Read in English](README.md)

Este skill permite que un asistente de código de IA genere mapas mentales interactivos, ampliables (zoom) y colapsables en formato HTML en tu máquina local. La IA interpreta la idea, diseña un documento Markdown jerárquico como modelo central y luego lo compila localmente usando un script basado en `markmap-cli`.

## Características Principales
- **Exportación HTML Independiente**: Mapas mentales bonitos e interactivos encapsulados en un único archivo `.html` que no requiere conexión a internet para funcionar.
- **Agnóstico al IDE**: Los mapas resultantes se abren simplemente haciendo doble clic en y viéndolos en cualquier navegador (Chrome, Safari, Edge).
- **Auto-Limpieza**: Los scripts integrados generan el Markdown intermedio, usan NPX para pasarlo a HTML y destruyen la basura temporal para mantener el proyecto inmaculado.

## Requisitos Previos
- **Node.js**: Tu máquina debe tener instalado Node.js (y NPX). El script inteligente ubicado en `./scripts/build_map.js` ejecuta la compilación en segundo plano usando esta tecnología.

**🛡️ Nota de Privacidad y Seguridad**: Si tu sistema aún no tiene Node.js instalado, es posible que la IA te ofrezca ejecutar un asistente llamado `start-skill.js`. Este script viene incluido de forma abierta en el repositorio y su ÚNICO propósito es llamar a los gestores de paquetes oficiales del sistema (`winget`, `brew`, `apt-get`) para instalar Node.js limpiamente por ti. No hay malware, descargas ocultas ni telemetría. Eres libre de inspeccionar el código fuente de la carpeta `/scripts/` en cualquier momento.

## Cómo Usarlo
Pídele a la IA "crea un mapa mental visual interactivo sobre...". La IA escribirá el árbol estructural, acudirá a la terminal sola a compilarlo y te avisará cuando tu archivo final esté listo en la carpeta `diagrams/`.

---
Creado por [SMARTbrain Activity](https://www.smartbrainactivity.ai) | ✉️ [hey@smartbrainactivity.ai](mailto:hey@smartbrainactivity.ai)
