# 📊 Visual Diagramming Export — AI Skills for Antigravity · Claude Code · Gemini CLI · Cursor

![Visual Diagramming Suite](assets/banner.png)

[![Creator](https://img.shields.io/badge/Creator-SMARTbrain%20Activity-blue)](https://www.smartbrainactivity.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Security Scan](https://img.shields.io/badge/Security_Scan-Passed-brightgreen)](scripts/audit-scan.js)
![Antigravity Skill](https://img.shields.io/badge/Antigravity-Skill-black?logo=google&logoColor=white)
![Claude Code](https://img.shields.io/badge/Claude_Code-Compatible-blue?logo=anthropic&logoColor=white)
![Gemini CLI](https://img.shields.io/badge/Gemini_CLI-Compatible-4285F4?logo=google&logoColor=white)
![Excalidraw](https://img.shields.io/badge/Excalidraw-Diagrams-6965DB)
![Markmap](https://img.shields.io/badge/Markmap-Mind_Maps-FF6B6B)
![PlantUML](https://img.shields.io/badge/PlantUML-UML-green)
![License MIT](https://img.shields.io/badge/License-MIT-yellow)

A collection of AI skills for AI coding assistants (like Claude, Antigravity, Cursor, etc.) designed to generate and export visual diagrams right from the chat or terminal.

[🇪🇸 Leer en Español](README.es.md)

## 🚀 Installation & Setup

To use these skills with your local AI coding assistant, you must clone this repository into your editor's "global skills" directory (e.g., `.gemini/antigravity/skills` or your environment's equivalent).

1. Open your terminal and navigate to your AI assistant's global skills folder.
2. Run the following command to download the complete collection:

```bash
git clone https://github.com/SMARTbrainActivity/visual-diagramming-export.git
```

3. (Optional but recommended) Audit the code using our embedded security scanner before running anything:
```bash
node visual-diagramming-export/scripts/audit-scan.js
```
4. Restart your AI chat. Now you can prompt: *"Generate a mind map about [Topic] using Markmap"*.

---

## Included Skills

- **[Excalidraw Crafter](./excalidraw-crafter)**: Generates raw `.excalidraw` JSON files for editable whiteboard layouts (Flowcharts, mind maps, grids). 
- **[Markmap Generator](./markmap-generator)**: Compiles hierarchical lists into standalone, interactive HTML mind maps locally.
- **[PlantUML Architect](./plantuml-architect)**: Authors strict UML code and transparently transforms it into ready-to-use SVG/PNG URLs using the Kroki API.

## Requirements
- **Node.js**: Required to execute the local compilation scripts for Markmap and PlantUML on your machine.
- **Any AI Agent / IDE**: These skills are fully IDE-agnostic. The AI will save files to the local disk regardless of your setup.

**🛡️ Privacy & Security Note**: If your system doesn't have Node.js installed, the AI may prompt you to optionally run a `start-skill.js` wizard. This open-source script is included directly in this repository and its ONLY purpose is to run official OS package managers (`winget`, `brew`, `apt-get`) to install Node.js cleanly and securely for you. There is no malware, hidden downloads, or telemetry. We strongly encourage you to inspect the source code of the `/scripts/` folder before running anything.

**🔍 Static Audit Scanner**: This repository includes a native static analysis script (`scripts/audit-scan.js`) similar to Snyk/CodeQL. You can run `node scripts/audit-scan.js` at any time to verify that none of the executable logic contains malicious patterns (like `eval`, unauthorized HTTP requests, or destructive `child_process` commands).

## Language Agnostic
These skills adapt to your prompt's language automatically. You can instruct the AI in English, Spanish, or any other language, and the resulting diagrams will be perfectly labeled in your desired language.

## Support & Contact
- **Creator**: SMARTbrain Activity
- **Website**: [www.smartbrainactivity.ai](https://www.smartbrainactivity.ai)
- **Email**: hey@smartbrainactivity.ai
