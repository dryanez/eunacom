import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Clock,
  ArrowRight,
  BookOpen,
  Search,
  CheckCircle2,
  Stethoscope,
  GraduationCap,
  Video,
  FileCheck,
  ShieldCheck,
  Award,
  Sparkles,
  TrendingUp,
  MessageCircle,
  HelpCircle,
  ChevronRight,
  Filter,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { BLOG_POSTS } from '../data/blogPosts'
import { usePageSeo } from '../lib/seo'
import PrerequisitesMatrix from '../components/PrerequisitesMatrix'
import DoctorConsultationModal from '../components/DoctorConsultationModal'
import DoctorProfileCard from '../components/DoctorProfileCard'
import VideoMasterclassPlayer from '../components/VideoMasterclassPlayer'
import BlogTopicProposer from '../components/BlogTopicProposer'
import '../styles/eunacomSitioTheme.css'

const CATEGORIES = [
  'Todos',
  'Logística y Fechas',
  'Estrategia y Temario',
  'Convalidación y Leyes',
  'Práctico ECOE',
  'Salarios y APS',
]

const CATEGORY_COLORS = {
  'Logística y Fechas': { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' },
  'Estrategia y Temario': { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
  'Convalidación y Leyes': { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
  'Práctico ECOE': { bg: '#f3e8ff', text: '#7e22ce', border: '#e9d5ff' },
  'Salarios y APS': { bg: '#ffe4e6', text: '#be123c', border: '#fecdd3' },
}

export default function Blog() {
  const navigate = useNavigate()
  const { openAuthModal } = useAuth()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [activeTab, setActiveTab] = useState('articles') // 'articles' | 'matrix' | 'video' | 'studio'
  const [isConsultationOpen, setIsConsultationOpen] = useState(false)

  usePageSeo({
    title: 'Blog EUNACOM 2026-2027 | Guías Oficiales, Revalidación & Temario ASOFAMECH',
    description:
      'Portal oficial de orientación para médicos en Chile. Guías de estudio del EUNACOM-ST y Práctico ECOE, fechas ASOFAMECH, convalidación de títulos extranjeros y escalas de sueldos en APS.',
    canonical: 'https://www.eunacomapp.cl/blog',
  })

  // Filter posts
  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesCategory =
        selectedCategory === 'Todos' || post.category === selectedCategory
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.keywords &&
          post.keywords.some((k) =>
            k.toLowerCase().includes(searchQuery.toLowerCase())
          ))
      return matchesCategory && matchesSearch
    })
  }, [searchQuery, selectedCategory])

  const featuredPost = BLOG_POSTS[0]

  return (
    <div className="eunacom-sitio-page min-h-screen">
      {/* ── STICKY TOP NAV ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="text-slate-600 hover:text-[var(--eunacom-navy)] text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a Eunacom App</span>
            </button>
            <span className="hidden sm:inline-block w-px h-4 bg-slate-200" />
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[var(--eunacom-blue)] uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              Centro Médico Editorial
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsConsultationOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Orientación 1 a 1 Dr. Yáñez
            </button>
            <button
              type="button"
              onClick={() => openAuthModal('register')}
              className="px-4 py-2 rounded-xl bg-[var(--eunacom-navy)] hover:bg-[var(--eunacom-navy-dark)] text-white text-xs sm:text-sm font-bold transition shadow-sm"
            >
              Practicar +10.000 Preguntas
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO BANNER (EUNACOM Sitio Style) ── */}
      <section className="eunacom-sitio-header py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-sky-200 text-xs font-semibold uppercase tracking-wider mb-4 border border-white/20">
            <ShieldCheck className="w-4 h-4 text-sky-300" />
            Supervisado por Dirección Médica · RNPI Nº 642819
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Guías Clínicas, Fechas Oficiales & Revalidación EUNACOM
          </h1>

          <p className="text-base sm:text-lg text-sky-100 max-w-3xl mx-auto leading-relaxed mb-8">
            El repositorio técnico más completo de Chile para médicos nacionales y extranjeros. Estrategias de estudio, análisis de casos GES, ECOE práctico y normativa del Sistema Nacional de Salud.
          </p>

          {/* Interactive Hub Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md max-w-3xl mx-auto border border-white/15">
            <button
              type="button"
              onClick={() => setActiveTab('articles')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                activeTab === 'articles'
                  ? 'bg-white text-[var(--eunacom-navy)] shadow-md'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              Artículos & Guías ({BLOG_POSTS.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                activeTab === 'matrix'
                  ? 'bg-white text-[var(--eunacom-navy)] shadow-md'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Matriz de Revalidación
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('video')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                activeTab === 'video'
                  ? 'bg-white text-[var(--eunacom-navy)] shadow-md'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <Video className="w-4 h-4" />
              Masterclass en Video
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('studio')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                activeTab === 'studio'
                  ? 'bg-white text-[var(--eunacom-navy)] shadow-md'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              SEO Content Studio
            </button>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* TAB 1: ARTICLES HUB */}
        {activeTab === 'articles' && (
          <div>
            {/* Search and Category Filters */}
            <div className="mb-10 space-y-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Search input */}
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por tema: infarto, ECOE, fechas, apostilla, CESFAM..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-[var(--eunacom-blue)] focus:outline-none shadow-sm text-slate-800"
                  />
                </div>

                <div className="text-xs text-slate-500 font-medium self-end md:self-center">
                  Mostrando <strong className="text-[var(--eunacom-navy)]">{filteredPosts.length}</strong> guías médicas actualizadas
                </div>
              </div>

              {/* Category selector pills */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Post Hero Card (Only on 'Todos' and no search) */}
            {selectedCategory === 'Todos' && !searchQuery && featuredPost && (
              <div
                onClick={() => navigate(`/blog/${featuredPost.slug}`)}
                className="mb-10 rounded-3xl bg-gradient-to-br from-white to-[var(--eunacom-sky-light)] border border-[var(--eunacom-sky-border)] p-6 sm:p-8 shadow-xl cursor-pointer hover:shadow-2xl transition group relative overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--eunacom-navy)] text-white">
                        Artículo Destacado
                      </span>
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[var(--eunacom-blue)]" /> {featuredPost.readTime}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--eunacom-navy)] group-hover:text-[var(--eunacom-blue)] transition mb-3">
                      {featuredPost.title}
                    </h2>

                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                      {featuredPost.excerpt}
                    </p>

                    <div className="flex items-center gap-3 text-xs font-bold text-[var(--eunacom-blue)] group-hover:translate-x-1 transition">
                      <span>Leer Guía Completa</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Highlight callout box */}
                  <div className="lg:w-80 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Perla de la Convocatoria
                      </div>
                      <div className="text-xs text-slate-700 leading-relaxed font-medium">
                        {featuredPost.keyTakeaways?.[0] || 'Inscripción obligatoria 60 días antes del examen teórico.'}
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>{featuredPost.author.name}</span>
                      <span className="text-emerald-600 font-semibold">Verificado</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => {
                const catStyle =
                  CATEGORY_COLORS[post.category] || {
                    bg: '#f1f5f9',
                    text: '#475569',
                    border: '#e2e8f0',
                  }
                return (
                  <article
                    key={post.slug}
                    onClick={() => navigate(`/blog/${post.slug}`)}
                    className="eunacom-blog-card cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          style={{
                            backgroundColor: catStyle.bg,
                            color: catStyle.text,
                            borderColor: catStyle.border,
                          }}
                          className="px-2.5 py-0.5 rounded-full text-xs font-bold border"
                        >
                          {post.category}
                        </span>
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {post.readTime}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-[var(--eunacom-navy)] group-hover:text-[var(--eunacom-blue)] transition leading-snug mb-2">
                        {post.title}
                      </h3>

                      <p className="text-slate-600 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="text-slate-500 font-medium flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{post.date}</span>
                      </div>
                      <span className="text-[var(--eunacom-blue)] font-bold flex items-center gap-1 group-hover:translate-x-1 transition">
                        Leer <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </article>
                )
              })}
            </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 my-6">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  No encontramos artículos con esa búsqueda
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mb-4">
                  Prueba buscando términos como "GES", "Infarto", "ASOFAMECH", "Práctico" o "Sueldo".
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('Todos')
                  }}
                  className="px-4 py-2 rounded-xl bg-[var(--eunacom-blue)] text-white text-xs font-bold hover:bg-[var(--eunacom-blue-hover)] transition"
                >
                  Restablecer Filtros
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PREREQUISITES & REVALIDATION MATRIX */}
        {activeTab === 'matrix' && (
          <div>
            <PrerequisitesMatrix onOpenConsultation={() => setIsConsultationOpen(true)} />
          </div>
        )}

        {/* TAB 3: VIDEO MASTERCLASS PLAYER */}
        {activeTab === 'video' && (
          <div>
            <VideoMasterclassPlayer />
          </div>
        )}

        {/* TAB 4: SEO STUDIO */}
        {activeTab === 'studio' && (
          <div>
            <BlogTopicProposer />
          </div>
        )}

        {/* ── DOCTOR PROFILE & 1-ON-1 MENTORSHIP BANNER ── */}
        <div className="mt-14">
          <DoctorProfileCard onOpenConsultation={() => setIsConsultationOpen(true)} />
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-slate-200 py-10 px-4 sm:px-6 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span className="font-bold text-[var(--eunacom-navy)]">Eunacom App</span> · Plataforma de Alto Rendimiento para el EUNACOM en Chile.
          </div>
          <div>
            © {new Date().getFullYear()} Eunacom App · eunacomapp.cl · Todos los derechos reservados
          </div>
        </div>
      </footer>

      {/* ── 1-ON-1 DOCTOR CONSULTATION MODAL ── */}
      <DoctorConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
      />
    </div>
  )
}
