import React, { useState, useEffect } from 'react'
import { PieChart, FileText, Target, Activity, CreditCard, RotateCcw, Flame, Trophy, Medal, Crown, ChevronDown, Zap, TrendingUp, Layers, Download, X, Sparkles, Stethoscope, LogIn } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { fetchProgress, fetchLeaderboard } from '../lib/api'
import { XP_PER_CORRECT, XP_PER_INCORRECT, calculateLevelUp, getXPForLevel, getLevelTitle, getLevelProgress, formatXP } from '../utils/xpSystem'

const PERIODS = [
  { key: 'today', label: 'Hoy' },
  { key: 'week', label: 'Semana' },
  { key: 'all', label: 'General' },
]

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({ totalAnswered: 0, correctAnswers: 0, xp: 0, totalXP: 0, level: 1, streak: 0 })
  const [subStats, setSubStats] = useState({ reconstructions: { answered: 0, correct: 0, exams: 0 }, custom: { answered: 0, correct: 0, exams: 0 }, clases: { answered: 0, correct: 0, exams: 0 } })
  const [activeTab, setActiveTab] = useState('general') // general, clases, reconstructions, custom
  const [leaderboard, setLeaderboard] = useState([])
  const [lbPeriod, setLbPeriod] = useState('week')
  const [todayAnswers, setTodayAnswers] = useState(0)
  const [todayCorrect, setTodayCorrect] = useState(0)
  const [lbLoading, setLbLoading] = useState(true)
  const DAILY_GOAL = 50

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState(window.globalDeferredPrompt || null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isInstallClicked, setIsInstallClicked] = useState(() => localStorage.getItem('pwa_install_clicked') === 'true')
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('pwa_dismissed') === 'true')

  useEffect(() => {
    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(isIosDevice)

    // Check if already installed or running as standalone app / home shortcut
    const checkStandalone = () => {
      const isStand = 
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://') ||
        localStorage.getItem('pwa_installed') === 'true'
      return Boolean(isStand)
    }
    setIsStandalone(checkStandalone())

    const handleAppInstalled = () => {
      setIsStandalone(true)
      localStorage.setItem('pwa_installed', 'true')
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    const handlePromptReady = () => {
      setDeferredPrompt(window.globalDeferredPrompt)
    }

    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('pwa-prompt-ready', handlePromptReady)
    
    if (window.globalDeferredPrompt) {
      setDeferredPrompt(window.globalDeferredPrompt)
    }

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('pwa-prompt-ready', handlePromptReady)
    }
  }, [])

  const handleInstallClick = async () => {
    setIsInstallClicked(true)
    localStorage.setItem('pwa_install_clicked', 'true')
    // Mark as dismissed so the big banner window disappears completely after click
    setDismissed(true)
    localStorage.setItem('pwa_dismissed', 'true')

    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setIsStandalone(true)
        localStorage.setItem('pwa_installed', 'true')
      }
    } else if (isIOS) {
      alert("Para instalar en iPhone/iPad:\n1. Toca el ícono de Compartir (el cuadro con la flecha hacia arriba) en la parte inferior de Safari.\n2. Selecciona 'Agregar a Inicio'.")
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('pwa_dismissed', 'true')
  }

  useEffect(() => {
    if (user) fetchStats()
    loadLeaderboard('week')
  }, [user])

  const fetchStats = async () => {
    try {
      // Import fetchTests if it hasn't been imported
      const { fetchTests, fetchClaseProgress } = await import('../lib/api');
      const [userTests, userClasesProgress] = await Promise.all([
        fetchTests(user.id),
        fetchClaseProgress(user.id).catch(() => [])
      ]);
      
      let totalAnswered = 0
      let correctAnswers = 0
      let reconAnswered = 0
      let reconCorrect = 0
      let customAnswered = 0
      let customCorrect = 0
      let clasesAnswered = 0
      let clasesCorrect = 0
      
      let totalExams = 0
      let reconExams = 0
      let customExams = 0
      let clasesExams = 0

      // Calculate strictly from completed tests
      for (const t of userTests) {
          if (t.status === 'completed') {
              // Ensure we count the questions in the exam
              let numQuestions = t.total_questions || 0
              if (numQuestions === 0 && t.answers) {
                const ansObj = typeof t.answers === 'string' ? JSON.parse(t.answers) : t.answers;
                numQuestions = Object.keys(ansObj).length;
              }

              const pct = Math.min(t.score || 0, 100)
              const actualCorrect = Math.round((pct / 100) * numQuestions)
              const isRecon = typeof t.questions === 'string' && t.questions.includes('_q')
              
              totalAnswered += numQuestions
              correctAnswers += actualCorrect
              totalExams++
              
              if (isRecon) {
                  reconAnswered += numQuestions
                  reconCorrect += actualCorrect
                  reconExams++
              } else {
                  customAnswered += numQuestions
                  customCorrect += actualCorrect
                  customExams++
              }
          }
      }

      // Add clases quiz progress
      for (const cp of userClasesProgress) {
        if (cp.quiz_completed) {
          const numQuestions = cp.quiz_total || 0;
          const numCorrect = cp.quiz_correct || 0;
          
          if (numQuestions > 0) {
            clasesAnswered += numQuestions;
            clasesCorrect += numCorrect;
            clasesExams++;
            
            totalAnswered += numQuestions;
            correctAnswers += numCorrect;
            totalExams++;
          }
        }
      }

      const incorrectAnswers = totalAnswered - correctAnswers
      const totalXP = (correctAnswers * XP_PER_CORRECT) + (incorrectAnswers * XP_PER_INCORRECT)
      const { newLevel, remainingXP } = calculateLevelUp(totalXP, 1)

      setSubStats({
          reconstructions: { answered: reconAnswered, correct: reconCorrect, exams: reconExams },
          custom: { answered: customAnswered, correct: customCorrect, exams: customExams },
          clases: { answered: clasesAnswered, correct: clasesCorrect, exams: clasesExams }
      })

      setStats(prev => ({ ...prev, totalAnswered, correctAnswers, totalExams, xp: remainingXP, totalXP, level: newLevel }))
    } catch (e) { console.error('Dashboard stats error:', e) }
  }

  const loadLeaderboard = async (period) => {
    setLbPeriod(period)
    setLbLoading(true)
    try {
      const data = await fetchLeaderboard(period, user?.id || null)
      setLeaderboard(data.leaderboard || [])
      if (user) {
        setStats(prev => ({ ...prev, streak: data.streak || 0 }))
        setTodayAnswers(data.todayAnswers || 0)
        setTodayCorrect(data.todayCorrect || 0)
      }
    } catch (e) { console.error('Leaderboard error:', e) }
    setLbLoading(false)
  }

  const getActiveStats = () => {
      if (activeTab === 'clases') return subStats.clases
      if (activeTab === 'reconstructions') return subStats.reconstructions
      if (activeTab === 'custom') return subStats.custom
      return { answered: stats.totalAnswered, correct: stats.correctAnswers, exams: stats.totalExams }
  }

  const { answered: currentAnswered, correct: currentCorrect, exams: currentExams } = getActiveStats()
  const accuracy = currentAnswered > 0 ? Math.round((currentCorrect / currentAnswered) * 100) : 0
  const levelCapXP = getXPForLevel(stats.level + 1)
  const xpProgress = getLevelProgress(stats.xp, stats.level)
  const levelTitle = getLevelTitle(stats.level)
  const dailyPct = Math.min((todayAnswers / DAILY_GOAL) * 100, 100)

  // Find user's rank in leaderboard
  const myRank = leaderboard.findIndex(u => u.user_id === user?.id) + 1

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h1 className="page__title">Inicio</h1>
          <p className="page__subtitle">{user ? 'Tu progreso general' : 'La plataforma de estudio EUNACOM más completa de Chile'}</p>
        </div>
      </div>

      {/* ─── PWA INSTALL BANNER ─── */}
      {!isStandalone && !dismissed && (deferredPrompt || isIOS) && (
        isInstallClicked ? (
          <div style={{
            background: 'rgba(19,91,236,0.12)',
            border: '1px solid rgba(19,91,236,0.25)',
            borderRadius: 'var(--radius-full)',
            padding: '0.55rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--surface-200)' }}>
              <Download size={15} color="var(--primary-400)" />
              <span>Instalar App EUNACOM</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button onClick={handleInstallClick} style={{
                padding: '0.35rem 0.9rem',
                background: 'var(--gradient-primary)',
                color: '#fff',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}>
                Instalar App
              </button>
              <button onClick={handleDismiss} title="Cerrar" style={{ background: 'none', border: 'none', color: 'var(--surface-400)', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}>
                <X size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'linear-gradient(135deg, rgba(19,91,236,0.15) 0%, rgba(6,182,212,0.1) 100%)',
            border: '1px solid rgba(19,91,236,0.3)', borderRadius: 'var(--radius-xl)',
            padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap',
            position: 'relative'
          }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--surface-50)', margin: '0 0 0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Download size={18} color="var(--primary-400)" />
                Instala la App de Eunacom
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--surface-300)', margin: 0, lineHeight: 1.5 }}>
                No tienes que descargar la aplicación desde la App Store o Google Play. Instálala de forma segura y directa en tu {isIOS ? 'dispositivo' : 'computador o celular'} para tener un acceso directo y cargar todo más rápido.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button onClick={handleInstallClick} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1.5rem', background: 'var(--gradient-primary)', color: '#fff',
                borderRadius: 'var(--radius-full)', border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(19,91,236,0.4)', whiteSpace: 'nowrap'
              }}>
                Instalar App
              </button>
              <button onClick={handleDismiss} title="Cerrar" style={{ background: 'none', border: 'none', color: 'var(--surface-400)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
                <X size={18} />
              </button>
            </div>
          </div>
        )
      )}

      {/* ─── GUEST CTA ─── */}
      {!user && (
        <div style={{
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(19,31,60,0.95) 100%)',
          border: '1.5px solid rgba(56, 189, 248, 0.4)',
          borderRadius: '24px',
          padding: '2.25rem 1.75rem',
          marginBottom: '2rem',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(19, 91, 236, 0.3), 0 0 35px rgba(6, 182, 212, 0.2), inset 0 1px 1px rgba(255,255,255,0.15)',
          overflow: 'hidden',
        }}>
          {/* Subtle glowing ambient orb background */}
          <div style={{
            position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)',
            width: '240px', height: '140px',
            background: 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.25) 0%, rgba(19, 91, 236, 0.15) 50%, transparent 80%)',
            filter: 'blur(20px)', pointerEvents: 'none'
          }} />

          {/* Top Pill Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.35rem 0.9rem', borderRadius: '100px',
            background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)',
            color: '#38bdf8', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em',
            marginBottom: '1rem', textTransform: 'uppercase'
          }}>
            <Sparkles size={14} /> Acceso Gratuito Ilimitado
          </div>

          <h2 style={{
            fontSize: '1.45rem', fontWeight: 800, color: '#ffffff',
            margin: '0 0 0.6rem', letterSpacing: '-0.02em', lineHeight: 1.3
          }}>
            Únete gratis y prepara tu EUNACOM
          </h2>
          
          <p style={{
            fontSize: '0.92rem', color: '#94a3b8',
            marginBottom: '1.75rem', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto 1.75rem'
          }}>
            Más de 6.000 preguntas reales, exámenes completos, clases en video y ranking en tiempo real.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
            <a href="/register" style={{
              padding: '0.85rem 2rem',
              background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
              color: '#ffffff',
              borderRadius: '100px',
              fontWeight: 700,
              fontSize: '0.98rem',
              textDecoration: 'none',
              border: 'none',
              boxShadow: '0 8px 25px rgba(6, 182, 212, 0.4), 0 2px 4px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem'
            }}>
              <Stethoscope size={18} /> Crear cuenta gratis
            </a>
            
            <a href="/login" style={{
              padding: '0.85rem 2rem',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#f8fafc',
              borderRadius: '100px',
              fontWeight: 700,
              fontSize: '0.98rem',
              textDecoration: 'none',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              transition: 'background 0.2s ease',
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem'
            }}>
              <LogIn size={18} /> Iniciar sesión
            </a>
          </div>
        </div>
      )}

      {/* ─── XP + STREAK BAR (logged-in only) ─── */}
      {user && (
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', marginBottom: '1.5rem', background: 'var(--surface-700)', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--primary-300)', fontWeight: 600, marginBottom: '0.25rem' }}>
              <Zap size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Nivel {stats.level} · {levelTitle}
            </div>
            <div className="xp-labels">
              <span>{formatXP(Math.max(0, levelCapXP - stats.xp))} XP para subir</span>
              <span>{formatXP(stats.xp)}/{formatXP(levelCapXP)} XP</span>
            </div>
            <div className="xp-bar"><div className="xp-bar__fill" style={{ width: `${xpProgress}%` }} /></div>
            <div style={{ fontSize: '0.72rem', color: 'var(--surface-400)', marginTop: 4 }}>Total: {formatXP(stats.totalXP)} XP</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '1.5rem', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
            <Flame size={36} color={stats.streak > 0 ? 'var(--accent-amber)' : 'var(--surface-500)'} fill={stats.streak > 0 ? 'var(--accent-amber)' : 'none'} />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--surface-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Racha</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stats.streak > 0 ? 'var(--accent-amber)' : 'var(--surface-300)' }}>{stats.streak}<span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--surface-400)' }}> días</span></div>
            </div>
          </div>
        </div>
      )}

      {/* ─── QUICK ACTIONS ─── */}
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--surface-200)' }}>Accesos Rápidos</h3>
      <div className="action-grid" style={{ marginBottom: '1.5rem' }}>
        <a href="/mis-clases" className="action-card">
          <div className="action-card__icon" style={{ background: 'rgba(6,182,212,0.15)' }}><CreditCard size={24} color="var(--accent-teal)" /></div>
          <div className="action-card__label">Clases</div>
        </a>
        <a href="/test" className="action-card">
          <div className="action-card__icon" style={{ background: 'rgba(19,91,236,0.15)' }}><FileText size={24} color="var(--primary-400)" /></div>
          <div className="action-card__label">Exámenes</div>
        </a>
        <a href="/reconstructions" className="action-card">
          <div className="action-card__icon" style={{ background: 'rgba(16,185,129,0.15)' }}><Layers size={24} color="var(--accent-green)" /></div>
          <div className="action-card__label">Reconstrucciones</div>
        </a>
        {user?.email && btoa(user.email) === 'ZHIuZmVsaXBleWFuZXpAZ21haWwuY29t' && (
          <a href="/study-plan" className="action-card">
            <div className="action-card__icon" style={{ background: 'rgba(16,163,74,0.15)' }}><TrendingUp size={24} color="var(--accent-green)" /></div>
            <div className="action-card__label">Plan de Estudio</div>
          </a>
        )}
        <a href="/stats" className="action-card">
          <div className="action-card__icon" style={{ background: 'rgba(19,91,236,0.15)' }}><Activity size={24} color="var(--primary-400)" /></div>
          <div className="action-card__label">Estadísticas</div>
        </a>
      </div>

      {/* ─── STATS GRID (logged-in only) ─── */}
      {user && (
        <>
          <div className="stats-tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--surface-700)', overflowX: 'auto', flexWrap: 'nowrap', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', paddingBottom: '0.2rem' }}>
            <style>{`.stats-tabs::-webkit-scrollbar { display: none; }`}</style>
            {[
                { id: 'general', label: 'General' },
                { id: 'clases', label: 'Clases' },
                { id: 'reconstructions', label: 'Reconstrucciones' },
                { id: 'custom', label: 'Exámenes Práctica' },
            ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flexShrink: 0, whiteSpace: 'nowrap', padding: '0.6rem 1.1rem', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab===tab.id ? 'var(--primary-400)' : 'transparent'}`, color: activeTab===tab.id ? 'var(--primary-400)' : 'var(--surface-400)', fontWeight: activeTab===tab.id ? 700 : 500, cursor: 'pointer', fontSize: '0.88rem', marginBottom: '-1px', transition: 'all 0.15s' }}>
                  {tab.label}
                </button>
            ))}
          </div>
          <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
            {/* Accuracy */}
            <div className="stat-card">
              <div className="stat-card__label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <div style={{ padding: '0.4rem', background: 'var(--surface-600)', borderRadius: 'var(--radius)' }}><PieChart size={18} color="var(--primary-300)" /></div>
                Puntaje
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem 0' }}>
                <div className="donut-wrapper">
                  <svg viewBox="0 0 36 36" className="circular-chart">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--surface-600)" strokeWidth="3" />
                    <path strokeDasharray={`${accuracy}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={accuracy >= 70 ? 'var(--accent-green)' : accuracy >= 50 ? 'var(--accent-amber)' : 'var(--primary-400)'} strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  <div className="donut-center">
                    <div className="donut-value" style={{ fontSize: '1.1rem' }}>{accuracy}%</div>
                    <div className="donut-label">Correctas</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Total questions */}
            <div className="stat-card">
              <div className="stat-card__label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <div style={{ padding: '0.4rem', background: 'var(--surface-600)', borderRadius: 'var(--radius)' }}><FileText size={18} color="var(--primary-300)" /></div>
                Respondidas
              </div>
              <div style={{ padding: '0.75rem 0', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: 90 }}>
                <div className="stat-card__value">{currentAnswered.toLocaleString()}</div>
                <div className="stat-card__sub">{currentCorrect} correctas</div>
              </div>
            </div>

            {/* Exámenes */}
            <div className="stat-card">
              <div className="stat-card__label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <div style={{ padding: '0.4rem', background: 'var(--surface-600)', borderRadius: 'var(--radius)' }}><Activity size={18} color="var(--accent-teal)" /></div>
                Exámenes
              </div>
              <div style={{ padding: '0.75rem 0', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: 90 }}>
                <div className="stat-card__value">{currentExams || 0}</div>
                <div className="stat-card__sub">Completados</div>
              </div>
            </div>

          {/* Daily goal */}
          <div className="stat-card">
            <div className="stat-card__label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <div style={{ padding: '0.4rem', background: 'var(--surface-600)', borderRadius: 'var(--radius)' }}><Target size={18} color={dailyPct >= 100 ? 'var(--accent-green)' : 'var(--primary-300)'} /></div>
              Meta Diaria
            </div>
            <div style={{ padding: '0.75rem 0', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: 90 }}>
              <div className="stat-card__value" style={{ color: dailyPct >= 100 ? 'var(--accent-green)' : 'var(--surface-50)', WebkitTextFillColor: 'initial', background: 'none' }}>
                {todayAnswers}<span style={{ color: 'var(--surface-400)', fontSize: '1.5rem', fontWeight: 600 }}>/{DAILY_GOAL}</span>
              </div>
              <div style={{ margin: '0.5rem auto 0', width: '80%' }}>
                <div className="xp-bar" style={{ height: 6 }}>
                  <div className="xp-bar__fill" style={{ width: `${dailyPct}%`, background: dailyPct >= 100 ? 'var(--accent-green)' : 'var(--primary-400)' }} />
                </div>
              </div>
              {dailyPct >= 100 && <div style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 600, marginTop: 4 }}>✅ ¡Meta cumplida!</div>}
            </div>
          </div>
        </div>
        </>
      )}


      {/* ─── LEADERBOARD ─── */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={20} color="var(--accent-amber)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Leaderboard</h3>
            {myRank > 0 && <span style={{ fontSize: '0.78rem', color: 'var(--primary-300)', fontWeight: 600, background: 'rgba(19,91,236,0.1)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)' }}>Tú #{myRank}</span>}
          </div>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {PERIODS.map(p => (
              <button key={p.key} onClick={() => loadLeaderboard(p.key)} style={{
                padding: '0.3rem 0.65rem', borderRadius: 'var(--radius-full)', border: 'none',
                background: lbPeriod === p.key ? 'var(--primary-500)' : 'var(--surface-600)',
                color: lbPeriod === p.key ? '#fff' : 'var(--surface-300)',
                fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)',
              }}>{p.label}</button>
            ))}
          </div>
        </div>

        {lbLoading ? (
          <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--surface-400)', fontSize: '0.85rem' }}>Cargando...</div>
        ) : leaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--surface-400)', fontSize: '0.85rem' }}>
            Aún no hay actividad {lbPeriod === 'today' ? 'hoy' : lbPeriod === 'week' ? 'esta semana' : ''}. ¡Sé el primero!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {leaderboard.slice(0, 10).map((u, i) => {
              const isMe = u.user_id === user?.id
              const name = (u.first_name ? `${u.first_name} ${(u.last_name || '').charAt(0)}.` : u.email?.split('@')[0] || 'Anónimo')
              const rankIcon = i === 0 ? <Crown size={16} color="#FFD700" /> : i === 1 ? <Medal size={16} color="#C0C0C0" /> : i === 2 ? <Medal size={16} color="#CD7F32" /> : null
              const uLvl = calculateLevelUp(Number(u.xp || 0), 1).newLevel
              return (
                <div key={u.user_id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius)',
                  background: isMe ? 'rgba(19,91,236,0.08)' : i < 3 ? 'rgba(255,255,255,0.02)' : 'transparent',
                  border: isMe ? '1px solid rgba(19,91,236,0.2)' : '1px solid transparent',
                }}>
                  <div style={{ width: 28, textAlign: 'center', fontWeight: 800, fontSize: '0.85rem', color: i < 3 ? 'var(--accent-amber)' : 'var(--surface-400)' }}>
                    {rankIcon || (i + 1)}
                  </div>
                  <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-full)', background: isMe ? 'var(--primary-500)' : 'var(--surface-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: '#fff', flexShrink: 0 }}>
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: isMe ? 700 : 500, fontSize: '0.88rem', color: 'var(--surface-100)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {name} {isMe && <span style={{ fontSize: '0.72rem', color: 'var(--primary-300)' }}>(tú)</span>}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--surface-400)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ color: 'var(--primary-300)', fontWeight: 600 }}>Nvl {uLvl}</span>
                      <span>·</span>
                      <span style={{ fontStyle: 'italic' }}>{getLevelTitle(uLvl)}</span>
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Zap size={14} /> {Number(u.xp).toLocaleString()}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
