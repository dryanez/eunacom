# Excalidraw Crafter Skill

[🇪🇸 Leer en Español](README.es.md)

This AI skill empowers your AI coding assistant (like Claude, Antigravity, or Cursor) to author raw, editable `.excalidraw` whiteboard files. Because Excalidraw relies on a strict JSON payload, this skill ensures the AI structures coordinates, dimensions, and groupings accurately to consistently generate valid, editable diagrams.

## Features
- **5 Built-in Layouts**: 🌳 Horizontal Tree, 🌟 Radial Mind Map, ⬇️ Flowchart, 🗂️ Grid / Board, 🐟 Fishbone Timeline.
- **Multiple Styles**: Supports Standard Corporate or Sketch/Hand-Drawn visual styles natively.
- **IDE Agnostic**: Works from any AI terminal. Exported files can be opened visually via `excalidraw.com` or directly inside your editor using the VS Code Excalidraw extension.
- **No Dependencies**: Unlike other diagramming skills, this one doesn't even require Node.js, because the AI writes the JSON itself!

## Usage
Simply ask your AI assistant to "generate an Excalidraw diagram for..." and it will follow the interactive workflow defined in `SKILL.md`.

All generated whiteboard files will automatically be placed in the `diagrams/` folder to keep your workspace clean.

---
Created by [SMARTbrain Activity](https://www.smartbrainactivity.ai) | ✉️ [hey@smartbrainactivity.ai](mailto:hey@smartbrainactivity.ai)
