# Markmap Generator Skill

[🇪🇸 Leer en Español](README.es.md)

This skill enables an AI coding assistant to generate fully interactive, zoomable HTML mind maps on your local machine. It intercepts the AI's idea, translates it to a structured Markdown representation, and compiles it locally using an included `markmap-cli` Node.js script.

## Features
- **Standalone HTML Export**: Beautiful, interactive mind maps contained entirely within a single `.html` file.
- **IDE Agnostic**: Resulting maps can be opened in any web browser without needing specific VS Code extensions or an internet-dependent API. 
- **Auto-Cleanup**: The AI scripts automatically generate intermediate Markdown, compile it to HTML, and clean up temporary files in one step.

## Requirements
- **Node.js**: Your machine must have Node.js and NPX installed. The included `./scripts/build_map.js` script wraps around NPX to do the heavy lifting seamlessly.

**🛡️ Privacy & Security Note**: If your system doesn't have Node.js installed, the AI might prompt you to optionally run a `start-skill.js` wizard. This is directly included in this repository and its ONLY purpose is to run official OS package managers (`winget`, `brew`, `apt-get`) to install Node.js safely and transparently for you. There is no malware or telemetry included. You can inspect the source code of all `/scripts/` before running them.

## Usage
Ask the AI to "create a visual mindmap HTML about...". The AI will draft the mind mapping syntax, run the local compilation script, and provide you with an interactive file saved inside the `diagrams/` folder.

---
Created by [SMARTbrain Activity](https://www.smartbrainactivity.ai) | ✉️ [hey@smartbrainactivity.ai](mailto:hey@smartbrainactivity.ai)
