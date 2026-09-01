import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { BLOG_POSTS } from "../src/data/blogPosts.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distDir = path.resolve(__dirname, "../dist")

if (!fs.existsSync(distDir)) {
  console.error("dist directory does not exist. Run vite build first.")
  process.exit(1)
}

const baseHtml = fs.readFileSync(path.join(distDir, "index.html"), "utf8")

const STATIC_ROUTES = [
  {
    route: "/",
    title: "EUNACOM 2026 | El Curso y Plataforma #1 en Chile de Preparación – Eunacom App (+650 Videos y +10.000 Preguntas)",
    description: "Eunacom App (eunacomapp.cl) es la plataforma y curso #1 en Chile para la preparación del EUNACOM 2026. Incluye +650 clases en video según Perfil ASOFAMECH, el banco #1 con +10.000 preguntas, reconstrucciones y simulacros. Desde $14.990 CLP.",
    canonical: "https://www.eunacomapp.cl/",
    ogType: "website",
    h1: "Eunacom App: El Curso #1 y Plataforma de Preparación para el EUNACOM 2026 en Chile"
  },
  {
    route: "/curso-eunacom-2026",
    title: "Mejor Curso EUNACOM 2026 | Tabla Comparativa y Plataforma #1 en Chile",
    description: "Compara los mejores cursos EUNACOM en Chile 2026. Descubre por qué Eunacom App supera a Guevara, EUNAMED y Dr. EUNACOM con +10.000 preguntas reales, 650+ clases y precios desde $14.990 CLP.",
    canonical: "https://www.eunacomapp.cl/curso-eunacom-2026",
    ogType: "website",
    h1: "Comparativa de los Mejores Cursos EUNACOM 2026 en Chile"
  },
  {
    route: "/simulacros-eunacom",
    title: "Simulacros Oficiales EUNACOM 2026 | Banco de +10.000 Preguntas Clínicas",
    description: "Practica con simulacros de 180 preguntas cronometradas idénticas al examen EUNACOM-ST oficial de ASOFAMECH. Retroalimentación justificada con Guías GES y MINSAL vigentes.",
    canonical: "https://www.eunacomapp.cl/simulacros-eunacom",
    ogType: "website",
    h1: "Simulacros Oficiales EUNACOM 2026 (180 Preguntas Cronometradas)"
  },
  {
    route: "/guia-eunacom-2026",
    title: "Guía Completa EUNACOM 2026 | Temario Oficial V3, Fechas y Requisitos ASOFAMECH",
    description: "Guía oficial y completa del EUNACOM 2026 en Chile. Requisitos para médicos extranjeros, fechas de inscripción, temario oficial ASOFAMECH y estrategias de aprobación.",
    canonical: "https://www.eunacomapp.cl/guia-eunacom-2026",
    ogType: "website",
    h1: "Guía Completa y Temario Oficial del EUNACOM 2026"
  },
  {
    route: "/reconstrucciones-eunacom",
    title: "Reconstrucciones EUNACOM Reales 2024-2026 | Exámenes Anteriores Explicados",
    description: "Accede a la recopilación más completa de reconstrucciones reales del EUNACOM. Practica con preguntas oficiales de exámenes anteriores justificadas por alternativa.",
    canonical: "https://www.eunacomapp.cl/reconstrucciones-eunacom",
    ogType: "website",
    h1: "Reconstrucciones Reales del Examen EUNACOM 2024-2026"
  },
  {
    route: "/convenios",
    title: "Convenios y Descuentos para Médicos e Instituciones | Eunacom App",
    description: "Convenios especiales y tarifas grupales para médicos extranjeros, agrupaciones profesionales, centros de salud y clínicas en Chile para la preparación del EUNACOM.",
    canonical: "https://www.eunacomapp.cl/convenios",
    ogType: "website",
    h1: "Convenios Institucionales y Planes Grupales EUNACOM"
  },
  {
    route: "/faq",
    title: "Preguntas Frecuentes EUNACOM 2026 | Respuestas y Dudas Oficiales – Eunacom App",
    description: "Encuentra respuestas a todas las dudas sobre el examen EUNACOM teórico (ST) y práctico (SP), fechas 2026, puntajes de aprobación, temarios y uso de la plataforma Eunacom App.",
    canonical: "https://www.eunacomapp.cl/faq",
    ogType: "website",
    h1: "Preguntas Frecuentes sobre el Examen EUNACOM y Eunacom App"
  },
  {
    route: "/blog",
    title: "Blog EUNACOM 2026 | Artículos, Guías de Estudio y Novedades Médicas",
    description: "Estrategias de estudio comprobadas, resúmenes clínicos, análisis de fechas y novedades del examen EUNACOM en Chile para médicos nacionales y extranjeros.",
    canonical: "https://www.eunacomapp.cl/blog",
    ogType: "website",
    h1: "Blog y Guías Médicas para el EUNACOM 2026"
  }
]

for (const post of BLOG_POSTS) {
  STATIC_ROUTES.push({
    route: "/blog/" + post.slug,
    title: post.metaTitle,
    description: post.metaDescription,
    canonical: "https://www.eunacomapp.cl/blog/" + post.slug,
    ogType: "article",
    h1: post.title,
    articleData: post
  })
}

console.log("Generating " + STATIC_ROUTES.length + " static SEO pages...")

for (const item of STATIC_ROUTES) {
  let html = baseHtml

  // Replace Title
  html = html.replace(/<title>.*?<\/title>/i, "<title>" + item.title + "</title>")

  // Replace Meta Description
  html = html.replace(/<meta name="description" content=".*?" \/>/i, "<meta name=\"description\" content=\"" + item.description + "\" />")

  // Replace Canonical Link
  html = html.replace(/<link rel="canonical" href=".*?" \/>/i, "<link rel=\"canonical\" href=\"" + item.canonical + "\" />")

  // Replace OpenGraph & Twitter
  html = html.replace(/<meta property="og:title" content=".*?" \/>/i, "<meta property=\"og:title\" content=\"" + item.title + "\" />")
  html = html.replace(/<meta property="og:description" content=".*?" \/>/i, "<meta property=\"og:description\" content=\"" + item.description + "\" />")
  html = html.replace(/<meta property="og:url" content=".*?" \/>/i, "<meta property=\"og:url\" content=\"" + item.canonical + "\" />")
  html = html.replace(/<meta property="og:type" content=".*?" \/>/i, "<meta property=\"og:type\" content=\"" + item.ogType + "\" />")

  html = html.replace(/<meta name="twitter:title" content=".*?" \/>/i, "<meta name=\"twitter:title\" content=\"" + item.title + "\" />")
  html = html.replace(/<meta name="twitter:description" content=".*?" \/>/i, "<meta name=\"twitter:description\" content=\"" + item.description + "\" />")
  html = html.replace(/<meta name="twitter:url" content=".*?" \/>/i, "<meta name=\"twitter:url\" content=\"" + item.canonical + "\" />")

  if (item.articleData) {
    const articleJsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: item.articleData.title,
      description: item.articleData.metaDescription,
      datePublished: item.articleData.date,
      dateModified: "2026-08-31",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": item.canonical
      },
      author: {
        "@type": "Organization",
        name: "Eunacom App",
        url: "https://www.eunacomapp.cl/"
      },
      publisher: {
        "@type": "Organization",
        name: "Eunacom App",
        logo: {
          "@type": "ImageObject",
          url: "https://www.eunacomapp.cl/logo.png"
        }
      }
    }
    const scriptTag = "<script type=\"application/ld+json\">" + JSON.stringify(articleJsonLd) + "</script></head>"
    html = html.replace("</head>", scriptTag)
  } else if (item.route === "/curso-eunacom-2026") {
    const courseJsonLd = {
      "@context": "https://schema.org",
      "@type": "Course",
      name: "Curso de Preparación EUNACOM 2026",
      description: "Curso integral con +650 clases en video según Perfil ASOFAMECH, banco con +10.000 preguntas y simulacros cronometrados.",
      provider: {
        "@type": "Organization",
        name: "Eunacom App",
        sameAs: "https://www.eunacomapp.cl"
      },
      offers: {
        "@type": "Offer",
        category: "Paid",
        price: "14990",
        priceCurrency: "CLP"
      }
    }
    const scriptTag = "<script type=\"application/ld+json\">" + JSON.stringify(courseJsonLd) + "</script></head>"
    html = html.replace("</head>", scriptTag)
  } else if (item.route === "/simulacros-eunacom") {
    const faqJsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          "name": "¿Cuántas preguntas tiene un simulacro EUNACOM en Eunacom App?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Cada simulacro completo incluye 180 preguntas clínicas divididas en 2 bloques de 90 preguntas con límite de tiempo idéntico al examen oficial de ASOFAMECH."
          }
        },
        {
          "@type": "Question",
          "name": "¿Las justificaciones están actualizadas al Perfil ASOFAMECH 2026?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Sí, cada alternativa incluye retroalimentación basada en Guías Clínicas GES y protocolos del MINSAL vigentes."
          }
        }
      ]
    }
    const scriptTag = "<script type=\"application/ld+json\">" + JSON.stringify(faqJsonLd) + "</script></head>"
    html = html.replace("</head>", scriptTag)
  }

  const semanticShell = "<div id=\"root\"><main style=\"padding:20px;max-width:900px;margin:0 auto;font-family:sans-serif;\"><img src=\"/logo.png\" alt=\"Eunacom App\" width=\"48\" height=\"48\" fetchpriority=\"high\" style=\"margin-bottom:16px;\" /><h1>" + item.h1 + "</h1><p>" + item.description + "</p></main></div>"
  html = html.replace("<div id=\"root\"></div>", semanticShell)

  if (item.route === "/") {
    fs.writeFileSync(path.join(distDir, "index.html"), html, "utf8")
    console.log("✓ Prerendered / -> dist/index.html")
  } else {
    const targetFolder = path.join(distDir, item.route.replace(/^\//, ""))
    fs.mkdirSync(targetFolder, { recursive: true })
    fs.writeFileSync(path.join(targetFolder, "index.html"), html, "utf8")
    console.log("✓ Prerendered " + item.route + " -> dist" + item.route + "/index.html")
  }
}

console.log("Static SEO prerendering complete!")
