# Excalidraw Crafter Skill

[🇬🇧 Read in English](README.md)

Este skill otorga a tu asistente de código con IA (Claude, Antigravity, Cursor, etc.) la capacidad de generar archivos de pizarra `.excalidraw` crudos y totalmente editables. Dado que Excalidraw funciona con un formato JSON estricto, este skill asegura que la IA estructure las coordenadas, dimensiones y grupos matemáticamente para obtener diagramas válidos y funcionales siempre.

## Características Principales
- **5 Diseños Integrados**: 🌳 Árbol Jerárquico Horizontal, 🌟 Mapa Mental Radial, ⬇️ Diagrama de Flujo, 🗂️ Tablero/Grid, 🐟 Raspa de Pez/Línea de Tiempo.
- **Estilos Múltiples**: Soporta estilo corporativo estándar o el estilo clásico de pizarra ("Hand-drawn") nativo de Excalidraw.
- **Agnóstico al IDE**: Funciona en cualquier editor. Puedes abrir los archivos generados arrastrándolos a `excalidraw.com` o desde la propia extensión Excalidraw de VS Code.
- **Sin Dependencias**: A diferencia de otros skills visuales, este no requiere ni siquiera de Node.js, ¡la IA codifica el JSON directamente!

## Cómo Usarlo
Simplemente pide a tu asistente que "genere un diagrama de Excalidraw de..." y la IA seguirá el flujo de trabajo interactivo para preguntarte especificaciones antes de codificarlo basándose en su `SKILL.md`.

Todos los archivos generados se guardarán automáticamente en la subcarpeta `diagrams/` para mantener limpios tus repositorios.

---
Creado por [SMARTbrain Activity](https://www.smartbrainactivity.ai) | ✉️ [hey@smartbrainactivity.ai](mailto:hey@smartbrainactivity.ai)
