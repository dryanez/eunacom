# PlantUML Architect Skill

[🇪🇸 Leer en Español](README.es.md)

This skill allows your AI assistant to author highly technical, formal UML diagrams (sequence, use case, component, class diagrams) and deliver them directly as instantly viewable SVG/PNG URLs by transparently compiling the backend `.puml` code against the public Kroki API.

## Features
- **Formal Diagramming**: Perfect for software architects who need strict standardized UML rather than freestyle sketches.
- **Transparent Remote Rendering**: Converts raw plantuml syntax into universal `https://` SVG links using a bundled Node.js compression script without leaving your CLI environment.
- **IDE Agnostic**: Because the final result provided by the AI is a universal image URL, it can be viewed in ANY editor or browser, or embedded directly into a markdown preview without hassle.

## Requirements
- **Node.js**: Your system must have Node.js installed to execute the bundled `scripts/generate_url.js` script, which handles the `zlib` compression required by Kroki.

**🛡️ Privacy & Security Note**: If your system doesn't have Node.js installed, the AI may prompt you to optionally run a `start-skill.js` wizard. This is an open-source script included directly in this repository. Its ONLY purpose is to run official OS package managers (`winget`, `brew`, `apt-get`) to install Node.js cleanly and securely for you. There are no hidden downloads or telemetry. You are encouraged to inspect the source code of the `/scripts/` folder before running it.

## Usage
Just ask the AI to "draft a PlantUML sequence diagram for our auth flow". 
The AI will generate the `.puml` code inside the `diagrams/` folder, run the script against it, and respond in the chat directly with the clickable URL of the final image.

---
Created by [SMARTbrain Activity](https://www.smartbrainactivity.ai) | ✉️ [hey@smartbrainactivity.ai](mailto:hey@smartbrainactivity.ai)
