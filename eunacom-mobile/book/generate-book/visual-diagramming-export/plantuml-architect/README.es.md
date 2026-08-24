# PlantUML Architect Skill

[🇬🇧 Read in English](README.md)

Este skill otorga la capacidad a tu asistente de IA para actuar como arquitecto de software avanzado, generando diagramas UML estrictos (casos de uso, secuencias, redes de componentes). Va más allá de simplemente "escribir código" ya que utiliza un script incluido para comprimir el diagrama contra la API pública de Kroki de forma local, entregando una URL con la imagen gráfica directamente.

## Características Principales
- **Diagramación Formal (UML)**: Ideal para documentar sistemas reales (arquitectura de AWS, flujos OAuth, bases de datos), no solo lluvias de ideas abstractas.
- **Renderizado Dinámico Kroki**: Evita configuraciones Java pesadas usando de intermediaria la API pública de Kroki para los exports visuales.
- **Independiente del IDE**: El resultado arrojado por la IA es una dirección HTTP de imagen universal SVG/PNG; lo pegará en Markdown resultando previsualizable desde cualquier visor o plataforma.

## Requisitos Previos
- **Node.js**: Tu sistema necesita Node.js instalado, a fin de que la IA pueda ejecutar automáticamente el compresor de código `scripts/generate_url.js` (basado en `zlib`).

**🛡️ Nota de Privacidad y Seguridad**: Si tu sistema aún no tiene Node.js instalado, la IA podría ofrecerte ejecutar el asistente `start-skill.js`. Este script abierto viene incluido en el repositorio y su ÚNICO propósito es invocar a los instaladores oficiales de tu sistema operativo (`winget`, `brew`, `apt-get`) para instalar Node.js de forma transparente. No hay malware, descargas en segundo plano ni rastreadores. Tienes total libertad para auditar el código fuente en la carpeta `/scripts/` antes de aceptarlo.

## Cómo Usarlo
Simplemente ordena: "Dibuja un diagrama UML de secuencia sobre este flujo de login". 
La IA te generará el código fuente en `.puml` dentro de `diagrams/`, lo compilará silenciosamente bajo el capó, y publicará en tu ventana de chat el render finalizado (la URL gráfica visible).

---
Creado por [SMARTbrain Activity](https://www.smartbrainactivity.ai) | ✉️ [hey@smartbrainactivity.ai](mailto:hey@smartbrainactivity.ai)
