import React, { useState } from 'react'
import { BookOpen, Sparkles, Info, Heart, CheckCircle2, ChevronRight, Stethoscope, Award, Flame, Search } from 'lucide-react'
import { MEDLINGO_MODULES } from '../../../data/medlingo/modulePaths'
import { playTapSound } from '../../../utils/medlingoAudio'

const HIGH_YIELD_PEARLS = [
  {
    id: 'pearl_1',
    category: 'cardiologia',
    title: 'Estenosis Aórtica (EA) Severa',
    summary: 'Soplo mesosistólico eyectivo rudo en 2° EIC derecho irradiado a carótidas.',
    pearl: 'La tríada clásica es SAD (Síncope, Angina, Disnea). La presencia de síntomas indica indicación quirúrgica inmediata (Cirugía o TAVI).',
    mnemonic: 'Regla SAD: Síncope (sobrevida 3 años), Angina (5 años), Disnea (2 años).',
    color: '#ef4444'
  },
  {
    id: 'pearl_2',
    category: 'cardiologia',
    title: 'Fibrilación Auricular (FA)',
    summary: 'Arritmia con pulso irregularmente irregular y ausencia de onda P en el ECG.',
    pearl: 'Evaluar riesgo embólico con CHA2DS2-VASc. Si es ≥ 1 en hombres o ≥ 2 en mujeres, indicar anticoagulación oral directa (DOACs).',
    mnemonic: 'Regla de Oro: ¡En FA NUNCA hay R4 porque no hay sístole auricular!',
    color: '#dc2626'
  },
  {
    id: 'pearl_3',
    category: 'gastroenterologia',
    title: 'Hemorragia Digestiva Alta (HDA)',
    summary: 'Hematemesis o melena por encima del ángulo de Treitz.',
    pearl: 'La causa más frecuente es la Úlcera Péptica (H. pylori / AINEs). Manejo inicial: 2 VVP gruesas, cristaloides, IBP EV en bolo e infusión, y EDA precoz (< 24h).',
    mnemonic: 'Escala de Rockall y Glasgow-Blatchford para estratificar riesgo.',
    color: '#f59e0b'
  },
  {
    id: 'pearl_4',
    category: 'respiratorio',
    title: 'Neumonía Adquirida en la Comunidad (NAC)',
    summary: 'Infección aguda del parénquima pulmonar por S. pneumoniae.',
    pearl: 'Estratificar con CURB-65 (Confusión, Urea > 7, FR ≥ 30, PAS < 90 o PAD ≤ 60, Edad ≥ 65). CURB-65 de 0-1: ambulatorio (Amoxicilina). ≥ 2: hospitalizar.',
    mnemonic: 'CURB-65: Cada letra es 1 punto para decidir ingreso hospitalario.',
    color: '#06b6d4'
  },
  {
    id: 'pearl_5',
    category: 'pediatria',
    title: 'Laringitis Aguda Obstructiva (Crup)',
    summary: 'Tos perruna, estridor inspiratorio y disfonía en lactantes (Virus Parainfluenza).',
    pearl: 'El tratamiento angular es Dexametasona oral/EV en dosis única (0.15 - 0.6 mg/kg). En caso de estridor de reposo o dificultad respiratoria, nebulizar con Adrenalina racémica.',
    mnemonic: '¡Nunca usar antibióticos ni sedantes en laringitis viral!',
    color: '#10b981'
  },
  {
    id: 'pearl_6',
    category: 'ginecologia',
    title: 'Preeclampsia Severa',
    summary: 'PA ≥ 160/110 mmHg con proteinuria o compromiso de órgano blanco después de las 20 semanas.',
    pearl: 'La neuroprotección materna y prevención de eclampsia se realiza con Sulfato de Magnesio (bolo 4-5g en 20 min, luego 1-2g/hora). Antídoto: Gluconato de Calcio.',
    mnemonic: 'Sulfato de Magnesio: Controlar reflejos osteotendinosos y diuresis horaria.',
    color: '#ec4899'
  }
]

export default function MedLingoCollectionTab({ state, onOpenShop }) {
  const [selectedCategory, setSelectedCategory] = useState('todas')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeModalPearl, setActiveModalPearl] = useState(null)

  const filteredPearls = HIGH_YIELD_PEARLS.filter(p => {
    const matchesCategory = selectedCategory === 'todas' || p.category === selectedCategory
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.pearl.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="medlingo-tab-content collection animate-scale-up">
      
      {/* ── Top Hero Banner ── */}
      <div className="collection-hero-banner">
        <div className="collection-hero-text">
          <div className="collection-badge">
            <BookOpen size={16} />
            <span>Biblioteca de Guardia</span>
          </div>
          <h2>Colección de Perlas EUNACOM</h2>
          <p>Revisa las reglas clínicas y nemotecnias desbloqueadas en tus lecciones sin consumir vidas.</p>
        </div>
        <div className="collection-stats-pill">
          <Sparkles size={18} color="#eab308" />
          <span>{HIGH_YIELD_PEARLS.length} Perlas Clave</span>
        </div>
      </div>

      {/* ── Category Filters & Search ── */}
      <div className="collection-controls-row">
        <div className="collection-search-bar">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por patología, fármaco o criterio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="collection-category-pills">
          <button 
            className={`cat-pill ${selectedCategory === 'todas' ? 'active' : ''}`}
            onClick={() => { playTapSound(); setSelectedCategory('todas') }}
          >
            Todas
          </button>
          <button 
            className={`cat-pill ${selectedCategory === 'cardiologia' ? 'active' : ''}`}
            onClick={() => { playTapSound(); setSelectedCategory('cardiologia') }}
          >
            ❤️ Cardio
          </button>
          <button 
            className={`cat-pill ${selectedCategory === 'gastroenterologia' ? 'active' : ''}`}
            onClick={() => { playTapSound(); setSelectedCategory('gastroenterologia') }}
          >
            🍔 Gastro
          </button>
          <button 
            className={`cat-pill ${selectedCategory === 'respiratorio' ? 'active' : ''}`}
            onClick={() => { playTapSound(); setSelectedCategory('respiratorio') }}
          >
            🫁 Respiratorio
          </button>
          <button 
            className={`cat-pill ${selectedCategory === 'pediatria' ? 'active' : ''}`}
            onClick={() => { playTapSound(); setSelectedCategory('pediatria') }}
          >
            🧸 Pediatría
          </button>
          <button 
            className={`cat-pill ${selectedCategory === 'ginecologia' ? 'active' : ''}`}
            onClick={() => { playTapSound(); setSelectedCategory('ginecologia') }}
          >
            🩺 Ginecología
          </button>
        </div>
      </div>

      {/* ── Topics & Modules Grid (Duolingo Style Cards) ── */}
      <div className="collection-modules-preview-section">
        <h3 className="section-title">Temarios de Especialidad</h3>
        <div className="collection-modules-grid">
          {MEDLINGO_MODULES.map((m) => {
            const completedCount = m.units.flatMap(u => u.nodes).filter(n => state.completedNodes?.[n.id]?.stars > 0).length
            const totalCount = m.units.flatMap(u => u.nodes.filter(n => n.type !== 'chest')).length

            return (
              <div 
                key={m.id} 
                className="collection-module-card"
                style={{ '--card-accent': m.themeColor }}
                onClick={() => {
                  playTapSound()
                  setSelectedCategory(m.id)
                }}
              >
                <div className="card-top-row">
                  <span className="card-emoji">{m.emoji}</span>
                  <div className="card-info-badge">
                    <Info size={14} />
                  </div>
                </div>
                <div className="card-title">{m.name}</div>
                <div className="card-progress-bar-wrap">
                  <div 
                    className="card-progress-bar-fill" 
                    style={{ width: `${Math.round((completedCount / (totalCount || 1)) * 100)}%`, backgroundColor: m.themeColor }}
                  />
                </div>
                <div className="card-meta-text">
                  {completedCount}/{totalCount} Lecciones
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── High-Yield Pearls Cards Grid ── */}
      <div className="collection-pearls-section">
        <h3 className="section-title">Perlas & Reglas Nemotécnicas Desbloqueadas</h3>
        <div className="pearls-cards-list">
          {filteredPearls.map((item) => (
            <div 
              key={item.id} 
              className="pearl-interactive-card"
              onClick={() => {
                playTapSound()
                setActiveModalPearl(item)
              }}
            >
              <div className="pearl-card-header">
                <div className="pearl-pill-badge" style={{ backgroundColor: item.color }}>
                  {item.category.toUpperCase()}
                </div>
                <ChevronRight size={18} className="chevron" />
              </div>
              <h4 className="pearl-card-title">{item.title}</h4>
              <p className="pearl-card-summary">{item.summary}</p>
              <div className="pearl-card-rule-snippet">
                <Sparkles size={14} color="#eab308" />
                <span>{item.mnemonic}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Detail Modal for Pearl ── */}
      {activeModalPearl && (
        <div className="medlingo-modal-overlay" onClick={() => setActiveModalPearl(null)}>
          <div className="medlingo-modal-container shop animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="medlingo-shop-header">
              <div className="shop-title-wrap">
                <Stethoscope size={22} color={activeModalPearl.color} />
                <h2>{activeModalPearl.title}</h2>
              </div>
              <button className="medlingo-close-btn" onClick={() => setActiveModalPearl(null)}>
                ✕
              </button>
            </div>

            <div className="pearl-detail-body">
              <div className="pearl-detail-section">
                <strong>Semiología & Hallazgos:</strong>
                <p>{activeModalPearl.summary}</p>
              </div>

              <div className="pearl-detail-section highlight">
                <strong>Perla de Guardia MINSAL / EUNACOM:</strong>
                <p>{activeModalPearl.pearl}</p>
              </div>

              <div className="duo-mnemonic-ribbon">
                <Sparkles size={20} className="ribbon-sparkle" />
                <div className="ribbon-text-wrap">
                  <span className="ribbon-tag">REGLA NEMOTÉCNICA</span>
                  <p className="ribbon-rule">{activeModalPearl.mnemonic}</p>
                </div>
              </div>
            </div>

            <button 
              className="medlingo-action-btn primary full duo-big-btn"
              style={{ marginTop: '1.25rem' }}
              onClick={() => setActiveModalPearl(null)}
            >
              ENTENDIDO
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
