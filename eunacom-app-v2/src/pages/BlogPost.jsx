import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Clock,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Stethoscope,
  Share2,
  Bookmark,
  MessageCircle,
  HelpCircle,
  AlertTriangle,
  ChevronRight,
  List,
  Sparkles,
} from 'lucide-react'
import { BLOG_POSTS } from '../data/blogPosts'
import { usePageSeo } from '../lib/seo'
import DoctorConsultationModal from '../components/DoctorConsultationModal'
import DoctorProfileCard from '../components/DoctorProfileCard'
import '../styles/eunacomSitioTheme.css'

function parseHeadings(md) {
  if (!md) return []
  const matches = []
  const regex = /^##\s+(.+)$/gm
  let m
  while ((m = regex.exec(md)) !== null) {
    const title = m[1].trim()
    const id = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    matches.push({ id, title })
  }
  return matches
}

function renderMarkdown(md) {
  if (!md) return ''
  let html = md

  // Convert H2s with IDs for TOC linking
  html = html.replace(/^##\s+(.+)$/gm, (match, title) => {
    const cleanTitle = title.trim()
    const id = cleanTitle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    return `<h2 id="${id}">${cleanTitle}</h2>`
  })

  // Convert H3s
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')

  // Bold & Italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')

  // Numbered and Bullet lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
  html = html.replace(/^-\s+(.+)$/gm, '<li>$1</li>')

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr />')

  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p>')
  html = html.replace(/(<li>.*<\/li>(\n|$))+/g, (match) => `<ul>${match}</ul>`)

  return `<p>${html}</p>`
}

export default function BlogPost() {
  const navigate = useNavigate()
  const { slug } = useParams()
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isConsultationOpen, setIsConsultationOpen] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const post = BLOG_POSTS.find((p) => p.slug === slug || p.aliases?.includes(slug))

  usePageSeo({
    title: post?.metaTitle || `${post?.title} | Eunacom App`,
    description: post?.metaDescription || post?.excerpt,
    canonical: `https://www.eunacomapp.cl/blog/${post?.slug || slug}`,
    ogType: 'article',
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop
      const windowHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight
      if (windowHeight > 0) {
        setScrollProgress((totalScroll / windowHeight) * 100)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const headings = useMemo(() => {
    return post ? parseHeadings(post.content) : []
  }, [post])

  if (!post) {
    return (
      <div className="eunacom-sitio-page min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-[var(--eunacom-navy)] mb-2">
          Artículo no encontrado
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          El artículo que buscas ha sido reubicado o no existe en la base de datos oficial.
        </p>
        <button
          onClick={() => navigate('/blog')}
          className="px-5 py-2.5 rounded-xl bg-[var(--eunacom-blue)] text-white font-bold text-sm shadow-md hover:bg-[var(--eunacom-blue-hover)] transition"
        >
          Volver al Portal de Artículos
        </button>
      </div>
    )
  }

  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3)

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  // Schema.org structured data (BlogPosting, MedicalWebPage, FAQPage, Breadcrumbs)
  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.eunacomapp.cl/blog/${post.slug}`,
    },
    author: {
      '@type': 'Person',
      name: post.author.name,
      jobTitle: post.author.role,
      identifier: post.author.regNumber,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Eunacom App',
      url: 'https://www.eunacomapp.cl',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.eunacomapp.cl/favicon.ico',
      },
    },
  }

  const faqSchema = post.faqs && post.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  } : null

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: 'https://www.eunacomapp.cl',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog EUNACOM',
        item: 'https://www.eunacomapp.cl/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `https://www.eunacomapp.cl/blog/${post.slug}`,
      },
    ],
  }

  return (
    <div className="eunacom-sitio-page min-h-screen">
      {/* Dynamic Top Reading Progress Bar */}
      <div
        className="reading-progress-bar"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Structured Data Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/blog')}
              className="text-slate-600 hover:text-[var(--eunacom-navy)] text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Blog</span>
            </button>
            <span className="hidden md:inline-block text-slate-300">/</span>
            <span className="hidden md:inline-block text-xs font-semibold text-slate-500 truncate max-w-sm">
              {post.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition text-xs font-semibold flex items-center gap-1.5"
              title="Compartir artículo"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">
                {copiedLink ? '¡Enlace Copiado!' : 'Compartir'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setIsConsultationOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 transition flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Orientación 1 a 1
            </button>
          </div>
        </div>
      </header>

      {/* Article Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Article Content Column */}
          <main className="lg:col-span-8">
            {/* Category & Verified Badge */}
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--eunacom-sky-light)] text-[var(--eunacom-navy)] border border-[var(--eunacom-sky-border)]">
                {post.category}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                Revisado por Dirección Médica
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--eunacom-navy)] leading-tight tracking-tight mb-4">
              {post.title}
            </h1>

            {/* Author & Meta Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 mb-8 border-y border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--eunacom-navy)] text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  FY
                </div>
                <div>
                  <div className="font-bold text-[var(--eunacom-navy)]">
                    {post.author.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {post.author.role} · {post.author.regNumber}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {post.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[var(--eunacom-blue)]" />
                  Lectura: {post.readTime}
                </span>
              </div>
            </div>

            {/* Key Takeaways Callout Box */}
            {post.keyTakeaways && post.keyTakeaways.length > 0 && (
              <div className="clinical-pearl-box">
                <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Puntos Clave & Perlas Clínicas del Artículo
                </div>
                <ul className="space-y-1.5 text-xs sm:text-sm text-emerald-950">
                  {post.keyTakeaways.map((t, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Regulatory Note / Official Alert */}
            {post.regulatoryNote && (
              <div className="official-regulation-box">
                <div className="flex items-center gap-2 text-[var(--eunacom-navy)] text-xs font-bold uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-4 h-4 text-[var(--eunacom-blue)]" />
                  Normativa Legal Vigente
                </div>
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {post.regulatoryNote}
                </div>
              </div>
            )}

            {/* Markdown Body */}
            <article
              className="blog-light-content prose prose-slate max-w-none text-slate-700 text-base leading-relaxed my-8"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
            />

            {/* FAQ Block (Rich Snippet on-page) */}
            {post.faqs && post.faqs.length > 0 && (
              <div className="my-12 p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <h3 className="text-lg font-bold text-[var(--eunacom-navy)] mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[var(--eunacom-blue)]" />
                  Preguntas Frecuentes sobre {post.category}
                </h3>
                <div className="space-y-4">
                  {post.faqs.map((faq, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                      <div className="font-bold text-sm text-[var(--eunacom-navy)] mb-1.5">
                        {faq.q}
                      </div>
                      <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {faq.a}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* In-Article Diagnostic Triage Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[var(--eunacom-navy)] to-[var(--eunacom-blue)] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 my-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
                  ¿Preparando tu postulación?
                </span>
                <h4 className="text-lg sm:text-xl font-bold text-white mt-1">
                  Revisa tu puntaje y situación con el Dr. Felipe Yáñez
                </h4>
                <p className="text-xs sm:text-sm text-sky-100 mt-1">
                  Evaluamos tus simulacros y te entregamos una ruta de 90 días hacia la aprobación.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsConsultationOpen(true)}
                className="shrink-0 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Orientación Gratuita
              </button>
            </div>

            {/* Author Card Footer */}
            <div className="mt-12">
              <DoctorProfileCard onOpenConsultation={() => setIsConsultationOpen(true)} />
            </div>
          </main>

          {/* Sticky Sidebar Column */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Table of Contents */}
            {headings.length > 0 && (
              <div className="toc-sidebar hidden lg:block">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <List className="w-4 h-4 text-[var(--eunacom-blue)]" />
                  Tabla de Contenidos
                </div>
                <nav className="space-y-1">
                  {headings.map((h, i) => (
                    <a
                      key={i}
                      href={`#${h.id}`}
                      className="toc-link"
                      onClick={(e) => {
                        e.preventDefault()
                        document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' })
                      }}
                    >
                      {h.title}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Mock Test Practice CTA */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-[var(--eunacom-navy)] text-white flex items-center justify-center font-bold mb-3">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-[var(--eunacom-navy)] mb-1">
                Simulador EUNACOM en Línea
              </h4>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Practica con reconstrucciones oficiales, explicaciones basadas en Guías GES y cronómetro real.
              </p>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="w-full py-2.5 px-4 rounded-xl bg-[var(--eunacom-navy)] hover:bg-[var(--eunacom-navy-dark)] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
              >
                Comenzar Simulacro <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Related Articles in Sidebar */}
            {related.length > 0 && (
              <div className="p-6 rounded-2xl bg-white border border-slate-200">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Artículos Relacionados
                </div>
                <div className="space-y-4">
                  {related.map((rp) => (
                    <div
                      key={rp.slug}
                      onClick={() => navigate(`/blog/${rp.slug}`)}
                      className="cursor-pointer group"
                    >
                      <span className="text-[10px] font-bold uppercase text-[var(--eunacom-blue)]">
                        {rp.category}
                      </span>
                      <h5 className="text-xs font-bold text-slate-800 group-hover:text-[var(--eunacom-blue)] transition line-clamp-2 mt-0.5">
                        {rp.title}
                      </h5>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                        <span>{rp.readTime}</span>
                        <span>·</span>
                        <span>{rp.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 px-4 sm:px-6 mt-16 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Eunacom App · eunacomapp.cl · Todos los derechos reservados</p>
      </footer>

      {/* 1-on-1 Doctor Consultation Modal */}
      <DoctorConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
        defaultTopic={post.title}
      />
    </div>
  )
}
