import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PieChart, FileText, Target, Activity, CreditCard, RotateCcw,
  Flame, Trophy, Medal, Crown, ChevronDown, Zap, TrendingUp,
  Layers, Download, X, Sparkles, Stethoscope, LogIn, ChevronRight,
  BookOpen, Building2, Globe, Users, ArrowUpRight, Filter
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { fetchProgress, fetchLeaderboard, fetchUserProfile } from '../lib/api'
import { XP_PER_CORRECT, XP_PER_INCORRECT, calculateLevelUp, getXPForLevel, getLevelTitle, getLevelProgress, formatXP } from '../utils/xpSystem'
import { TopicCard } from '../components/TopicCard'
import { TopicQuickModal } from '../components/TopicQuickModal'
import { UserInstitutionBadge, CHILEAN_UNIVERSITIES, COUNTRIES } from '../utils/universityAndCountry'

const TOPIC_PRESETS = [
  // Módulo 1 · Medicina Interna
  { topic: 'Cardiología', specialty: 'Módulo 1', module: 'modulo-1', tag: 'Med. Interna' },
  { topic: 'Neurología y Geriatría', specialty: 'Módulo 1', module: 'modulo-1', tag: 'Med. Interna' },
  { topic: 'Respiratorio', specialty: 'Módulo 1', module: 'modulo-1', tag: 'Med. Interna' },
  { topic: 'Gastroenterología', specialty: 'Módulo 1', module: 'modulo-1', tag: 'Med. Interna' },
  { topic: 'Hematología', specialty: 'Módulo 1', module: 'modulo-1', tag: 'Med. Interna' },
  { topic: 'Infectología', specialty: 'Módulo 1', module: 'modulo-1', tag: 'Med. Interna' },
  { topic: 'Endocrinología', specialty: 'Módulo 1', module: 'modulo-1', tag: 'Med. Interna' },
  { topic: 'Diabetes', specialty: 'Módulo 1', module: 'modulo-1', tag: 'Med. Interna' },
  { topic: 'Nefrología', specialty: 'Módulo 1', module: 'modulo-1', tag: 'Med. Interna' },
  { topic: 'Reumatología', specialty: 'Módulo 1', module: 'modulo-1', tag: 'Med. Interna' },

  // Módulo 2 · Cirugía y Especialidades
  { topic: 'Cirugía General', specialty: 'Módulo 2', module: 'modulo-2', tag: 'Cirugía' },
  { topic: 'Traumatología', specialty: 'Módulo 2', module: 'modulo-2', tag: 'Especialidades' },
  { topic: 'Oftalmología', specialty: 'Módulo 2', module: 'modulo-2', tag: 'Especialidades' },
  { topic: 'Otorrinolaringología', specialty: 'Módulo 2', module: 'modulo-2', tag: 'Especialidades' },
  { topic: 'Dermatología', specialty: 'Módulo 2', module: 'modulo-2', tag: 'Especialidades' },
  { topic: 'Psiquiatría', specialty: 'Módulo 2', module: 'modulo-2', tag: 'Salud Mental' },
  { topic: 'Urología', specialty: 'Módulo 2', module: 'modulo-2', tag: 'Cirugía' },

  // Módulo 3 · Pediatría y Gineco-Obstetricia
  { topic: 'Pediatría', specialty: 'Módulo 3', module: 'modulo-3', tag: 'Materno-Infantil' },
  { topic: 'Obstetricia', specialty: 'Módulo 3', module: 'modulo-3', tag: 'Materno-Infantil' },
  { topic: 'Ginecología', specialty: 'Módulo 3', module: 'modulo-3', tag: 'Materno-Infantil' },
]

const PERIODS = [
  { key: 'today', label: 'Hoy' },
  { key: 'week', label: 'Semana' },
  { key: 'all', label: 'General' },
]

const Dashboard = () => {
  const { user, openAuthModal } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ totalAnswered: 0, correctAnswers: 0, xp: 0, totalXP: 0, level: 1, streak: 0 })
  const [subStats, setSubStats] = useState({ reconstructions: { answered: 0, correct: 0, exams: 0 }, custom: { answered: 0, correct: 0, exams: 0 }, clases: { answered: 0, correct: 0, exams: 0 } })
  const [activeTab, setActiveTab] = useState('general') // general, clases, reconstructions, custom
  const [leaderboard, setLeaderboard] = useState([])
  const [sedeLeaderboard, setSedeLeaderboard] = useState([])
  const [countryLeaderboard, setCountryLeaderboard] = useState([])
  const [lbPeriod, setLbPeriod] = useState('all')
  const [lbView, setLbView] = useState('doctors') // 'doctors' | 'sedes' | 'countries'
  const [filterUniversity, setFilterUniversity] = useState('')
  const [filterCountry, setFilterCountry] = useState('')
  const [userProfile, setUserProfile] = useState(null)
  const [todayAnswers, setTodayAnswers] = useState(0)
  const [todayCorrect, setTodayCorrect] = useState(0)
  const [lbLoading, setLbLoading] = useState(true)
  const DAILY_GOAL = 50

  // MedSchool Topics State
  const [topicsList, setTopicsList] = useState([])
  const [topicModuleFilter, setTopicModuleFilter] = useState('all')
  const [selectedTopicForModal, setSelectedTopicForModal] = useState(null)
  const [topicsLoading, setTopicsLoading] = useState(true)

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

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt()
        const choice = await deferredPrompt.userChoice
        if (choice && choice.outcome === 'accepted') {
          setDeferredPrompt(null)
          setIsStandalone(true)
          localStorage.setItem('pwa_installed', 'true')
        }
      } catch (e) {
        console.error('PWA prompt error:', e)
      }
    } else if (isIOS) {
      alert("Para instalar en iPhone/iPad:\n1. Toca el ícono de Compartir (el cuadro con la flecha hacia arriba) en Safari.\n2. Selecciona 'Agregar a Inicio'.")
    } else {
      alert("Para instalar en tu dispositivo:\nBusca la opción 'Agregar a la pantalla de inicio' o 'Instalar aplicación' en el menú de tu navegador.")
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('pwa_dismissed', 'true')
  }

  useEffect(() => {
    if (user) fetchStats()
    loadLeaderboard('week')
    fetchTopicStats()
  }, [user])

  const fetchTopicStats = async () => {
    setTopicsLoading(true)
    try {
      const { fetchClases, fetchClaseProgress } = await import('../lib/api');
      const [allClases, userClasesProgress, pruebasIdx] = await Promise.all([
        fetchClases().catch(() => []),
        user ? fetchClaseProgress(user.id).catch(() => []) : Promise.resolve([]),
        fetch('/data/pruebas/index.json').then(r => r.json()).catch(() => ({}))
      ]);

      const progressMap = {}
      userClasesProgress.forEach(p => {
        progressMap[p.clase_id] = p
      })

      // Normalize string for matching
      const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

      // Compute topic list
      const enriched = TOPIC_PRESETS.map(preset => {
        const topicNorm = norm(preset.topic)
        // Find matching classes
        const matchingLessons = allClases.filter(c => {
          const subNorm = norm(c.subsystem)
          return subNorm === topicNorm || subNorm.includes(topicNorm) || topicNorm.includes(subNorm)
        })

        // Count completed classes
        const completedCount = matchingLessons.filter(l => {
          const p = progressMap[l.id]
          return p && (p.video_watched === 1 || p.quiz_completed === 1)
        }).length

        // Find question count from pruebas index
        let qCount = 0
        let correctCount = 0
        let wrongCount = 0

        // Look through pruebasIndex
        if (pruebasIdx && typeof pruebasIdx === 'object') {
          Object.entries(pruebasIdx).forEach(([modName, subs]) => {
            if (subs && typeof subs === 'object') {
              Object.entries(subs).forEach(([subName, subObj]) => {
                const sn = norm(subName)
                if (sn === topicNorm || sn.includes(topicNorm) || topicNorm.includes(sn)) {
                  if (subObj && Array.isArray(subObj.pruebas)) {
                    subObj.pruebas.forEach(pr => {
                      qCount += (pr.questionCount || 20)
                    })
                  }
                }
              })
            }
          })
        }

        // Sum quiz correct/wrong from userClasesProgress for this topic
        matchingLessons.forEach(l => {
          const p = progressMap[l.id]
          if (p && p.quiz_completed) {
            const tot = p.quiz_total || 5
            const corr = p.quiz_correct || Math.round(((p.quiz_score || 0) / 100) * tot)
            correctCount += corr
            wrongCount += Math.max(0, tot - corr)
          }
        })

        if (qCount === 0) qCount = matchingLessons.length * 15 || 120

        // Mastery calculation: combination of classes completed and quiz score
        let mastery = 0
        if (matchingLessons.length > 0) {
          const classPct = (completedCount / matchingLessons.length) * 50
          const quizPct = (correctCount + wrongCount) > 0 ? (correctCount / (correctCount + wrongCount)) * 50 : (completedCount > 0 ? 30 : 0)
          mastery = Math.min(100, Math.round(classPct + quizPct))
        }

        return {
          ...preset,
          lessons: matchingLessons,
          classesCount: matchingLessons.length,
          completedClasses: completedCount,
          questionsCount: qCount,
          correctCount,
          wrongCount,
          masteryPct: mastery,
          progressMap,
        }
      })

      setTopicsList(enriched)
    } catch (e) {
      console.error('Error fetching topic stats:', e)
    } finally {
      setTopicsLoading(false)
    }
  }

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

  useEffect(() => {
    if (user?.id) {
      fetchUserProfile(user.id).then(p => {
        if (p) setUserProfile(p)
      }).catch(() => {})
    }
  }, [user])

  const loadLeaderboard = async (period = lbPeriod, customUni = filterUniversity, customCountry = filterCountry) => {
    setLbPeriod(period)
    setLbLoading(true)
    try {
      const data = await fetchLeaderboard({
        period,
        userId: user?.id || null,
        university: customUni || null,
        country: customCountry || null
      })
      setLeaderboard(data.leaderboard || [])
      setSedeLeaderboard(data.sedeLeaderboard || [])
      setCountryLeaderboard(data.countryLeaderboard || [])
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
      {!isStandalone && !dismissed && (
        isInstallClicked ? (
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            borderRadius: '100px',
            padding: '0.45rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc' }}>
              <Download size={15} color="#38bdf8" />
              <span>Instalar App EUNACOM</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button onClick={handleInstallClick} style={{
                padding: '0.35rem 0.9rem',
                background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                color: '#fff',
                borderRadius: '100px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}>
                Instalar
              </button>
              <button onClick={handleDismiss} title="Cerrar" style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}>
                <X size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(19,31,60,0.95) 100%)',
            border: '1.5px solid rgba(56, 189, 248, 0.35)',
            borderRadius: '20px',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Download size={18} color="#38bdf8" />
                Instala la App de Eunacom
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                No tienes que descargar la aplicación desde App Store o Google Play. Instálala de forma directa en tu {isIOS ? 'dispositivo' : 'computador o celular'} para tener un acceso directo rápido.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button onClick={handleInstallClick} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                color: '#fff',
                borderRadius: '100px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)',
                whiteSpace: 'nowrap'
              }}>
                Instalar App
              </button>
              <button onClick={handleDismiss} title="Cerrar" style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
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
            <button
              onClick={() => openAuthModal('register')}
              style={{
                padding: '0.85rem 2rem',
                background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                color: '#ffffff',
                borderRadius: '100px',
                fontWeight: 700,
                fontSize: '0.98rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(6, 182, 212, 0.4), 0 2px 4px rgba(0,0,0,0.2)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                fontFamily: 'inherit',
              }}
            >
              <Stethoscope size={18} /> Crear cuenta gratis
            </button>
            
            <button
              onClick={() => openAuthModal('login')}
              style={{
                padding: '0.85rem 2rem',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#f8fafc',
                borderRadius: '100px',
                fontWeight: 700,
                fontSize: '0.98rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                fontFamily: 'inherit',
              }}
            >
              <LogIn size={18} /> Iniciar sesión
            </button>
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


      {/* ─── TEMAS Y CLASES EUNACOM (MEDSCHOOL TOPIC CARDS) ─── */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="#38bdf8" />
              Temas y Especialidades EUNACOM
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: 0 }}>
              Tarjetas interactivas con porcentaje de dominio, clases y acceso directo
            </p>
          </div>

          {/* Module Filter Pills */}
          <div style={{
            display: 'flex',
            gap: '0.35rem',
            background: 'var(--surface-800)',
            padding: '0.25rem',
            borderRadius: '100px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            overflowX: 'auto',
            maxWidth: '100%',
            scrollbarWidth: 'none',
          }}>
            {[
              { key: 'all', label: 'Todos' },
              { key: 'modulo-1', label: 'Módulo 1 · Med. Interna' },
              { key: 'modulo-2', label: 'Módulo 2 · Cirugía & Espec.' },
              { key: 'modulo-3', label: 'Módulo 3 · Pediatría & Gineco' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setTopicModuleFilter(f.key)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '100px',
                  border: 'none',
                  background: topicModuleFilter === f.key ? 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)' : 'transparent',
                  color: topicModuleFilter === f.key ? '#ffffff' : 'var(--surface-400)',
                  fontSize: '0.78rem',
                  fontWeight: topicModuleFilter === f.key ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Grid of MedSchool Topic Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}>
          {topicsList
            .filter(t => topicModuleFilter === 'all' || t.module === topicModuleFilter)
            .map((t, idx) => (
              <TopicCard
                key={t.topic || idx}
                topic={t.topic}
                specialty={t.specialty}
                tag={t.tag}
                questionsCount={t.questionsCount}
                classesCount={t.classesCount}
                completedClasses={t.completedClasses}
                correctCount={t.correctCount}
                wrongCount={t.wrongCount}
                masteryPct={t.masteryPct}
                onClick={() => setSelectedTopicForModal(t)}
                onDirectNavigate={() => {
                  navigate('/mis-clases', { state: { specialty: t.specialty, subsystem: t.topic } })
                }}
              />
            ))}
        </div>
      </div>

      {/* Pop-up Bigger Modal for Topics */}
      <TopicQuickModal
        isOpen={!!selectedTopicForModal}
        onClose={() => setSelectedTopicForModal(null)}
        topicData={selectedTopicForModal}
        onOpenClass={(claseId) => {
          const selectedTopic = selectedTopicForModal
          setSelectedTopicForModal(null)
          navigate('/mis-clases', { state: { specialty: selectedTopic?.specialty, subsystem: selectedTopic?.topic, openLesson: selectedTopic?.lessons?.find(l => l.id === claseId)?.lessonNumber } })
        }}
        onNavigateToSubsystem={(topicName, specialtyName) => {
          setSelectedTopicForModal(null)
          navigate('/mis-clases', { state: { specialty: specialtyName, subsystem: topicName } })
        }}
      />

      {/* ─── LEADERBOARD SECTION ─── */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 15, 30, 0.98) 100%)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '20px' }}>
        
        {/* Header with Title & Period Selector */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ padding: '0.45rem', background: 'rgba(234, 179, 8, 0.12)', borderRadius: '12px', border: '1px solid rgba(234, 179, 8, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={22} color="#eab308" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                Leaderboards & Ligas EUNACOM
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                Competencia médica inter-universitaria y global por sedes y países
              </p>
            </div>
            {myRank > 0 && lbView === 'doctors' && (
              <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700, background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '0.2rem 0.6rem', borderRadius: '100px', marginLeft: '0.25rem' }}>
                Tú #{myRank}
              </span>
            )}
          </div>

          {/* Period Selector Pills */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', padding: '3px', borderRadius: '100px', gap: '2px' }}>
            {PERIODS.map(p => (
              <button
                key={p.key}
                onClick={() => loadLeaderboard(p.key, filterUniversity, filterCountry)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '100px',
                  border: 'none',
                  background: lbPeriod === p.key ? 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)' : 'transparent',
                  color: lbPeriod === p.key ? '#fff' : 'var(--surface-300)',
                  fontSize: '0.76rem',
                  fontWeight: lbPeriod === p.key ? 700 : 500,
                  cursor: 'pointer',
                  fontFamily: 'var(--font)',
                  transition: 'all 0.15s ease'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── SCOPE NAVIGATION TABS (MÉDICOS | POR SEDE / UNIVERSIDAD | POR PAÍS) ─── */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: '0.75rem',
          marginBottom: '1rem',
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}>
          <button
            onClick={() => setLbView('doctors')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 0.9rem',
              borderRadius: '12px',
              border: lbView === 'doctors' ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
              background: lbView === 'doctors' ? 'rgba(56, 189, 248, 0.14)' : 'rgba(255,255,255,0.02)',
              color: lbView === 'doctors' ? '#38bdf8' : '#94a3b8',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            <Stethoscope size={16} />
            <span>Médicos Postulantes</span>
          </button>

          <button
            onClick={() => setLbView('sedes')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 0.9rem',
              borderRadius: '12px',
              border: lbView === 'sedes' ? '1.5px solid #a855f7' : '1px solid rgba(255,255,255,0.08)',
              background: lbView === 'sedes' ? 'rgba(168, 85, 247, 0.14)' : 'rgba(255,255,255,0.02)',
              color: lbView === 'sedes' ? '#c084fc' : '#94a3b8',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            <Building2 size={16} />
            <span>Por Sede / Universidad</span>
          </button>

          <button
            onClick={() => setLbView('countries')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 0.9rem',
              borderRadius: '12px',
              border: lbView === 'countries' ? '1.5px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
              background: lbView === 'countries' ? 'rgba(16, 185, 129, 0.14)' : 'rgba(255,255,255,0.02)',
              color: lbView === 'countries' ? '#34d399' : '#94a3b8',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            <Globe size={16} />
            <span>Por Países</span>
          </button>
        </div>

        {/* ─── FILTERS ROW (When in Médicos view) ─── */}
        {lbView === 'doctors' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '1rem',
            background: 'rgba(255,255,255,0.02)',
            padding: '0.5rem 0.75rem',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            {/* Quick Filter Buttons */}
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, marginRight: '0.2rem' }}>
                Filtrar:
              </span>
              <button
                onClick={() => {
                  setFilterUniversity('')
                  setFilterCountry('')
                  loadLeaderboard(lbPeriod, '', '')
                }}
                style={{
                  padding: '0.25rem 0.6rem',
                  borderRadius: '100px',
                  border: 'none',
                  background: !filterUniversity && !filterCountry ? '#38bdf8' : 'rgba(255,255,255,0.08)',
                  color: !filterUniversity && !filterCountry ? '#0f172a' : '#cbd5e1',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Todos
              </button>

              {userProfile?.university && (
                <button
                  onClick={() => {
                    const uni = userProfile.university
                    setFilterUniversity(uni)
                    setFilterCountry('')
                    loadLeaderboard(lbPeriod, uni, '')
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '100px',
                    border: 'none',
                    background: filterUniversity === userProfile.university ? '#a855f7' : 'rgba(255,255,255,0.08)',
                    color: filterUniversity === userProfile.university ? '#fff' : '#cbd5e1',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <UserInstitutionBadge user={userProfile} size={14} />
                  <span>Mi Sede ({userProfile.sede || 'Mi Uni'})</span>
                </button>
              )}

              {userProfile?.country && (
                <button
                  onClick={() => {
                    const c = userProfile.country
                    setFilterCountry(c)
                    setFilterUniversity('')
                    loadLeaderboard(lbPeriod, '', c)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '100px',
                    border: 'none',
                    background: filterCountry === userProfile.country ? '#10b981' : 'rgba(255,255,255,0.08)',
                    color: filterCountry === userProfile.country ? '#fff' : '#cbd5e1',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <span>{userProfile.country === 'Chile' ? '🇨🇱' : '🌐'}</span>
                  <span>Mi País ({userProfile.country})</span>
                </button>
              )}
            </div>

            {/* Dropdown Selectors */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                value={filterUniversity}
                onChange={(e) => {
                  const val = e.target.value
                  setFilterUniversity(val)
                  loadLeaderboard(lbPeriod, val, filterCountry)
                }}
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.74rem',
                  color: filterUniversity ? '#38bdf8' : '#94a3b8',
                  outline: 'none',
                  cursor: 'pointer',
                  maxWidth: '160px'
                }}
              >
                <option value="">🏛️ Todas las Sedes</option>
                {CHILEAN_UNIVERSITIES.map(u => (
                  <option key={u.id} value={u.name}>{u.shortName} ({u.country})</option>
                ))}
              </select>

              <select
                value={filterCountry}
                onChange={(e) => {
                  const val = e.target.value
                  setFilterCountry(val)
                  loadLeaderboard(lbPeriod, filterUniversity, val)
                }}
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.74rem',
                  color: filterCountry ? '#10b981' : '#94a3b8',
                  outline: 'none',
                  cursor: 'pointer',
                  maxWidth: '140px'
                }}
              >
                <option value="">🌐 Todos los Países</option>
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.name}>{c.flag} {c.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* ─── LEADERBOARD CONTENT ─── */}
        {lbLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--surface-400)', fontSize: '0.85rem' }}>
            <div className="spinner" style={{ margin: '0 auto 0.5rem', width: 24, height: 24 }} />
            Cargando clasificaciones...
          </div>
        ) : lbView === 'doctors' ? (
          /* 1. DOCTORS VIEW */
          leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--surface-400)', fontSize: '0.85rem' }}>
              Aún no hay actividad registrada {lbPeriod === 'today' ? 'hoy' : lbPeriod === 'week' ? 'esta semana' : ''} {filterUniversity ? `en ${filterUniversity}` : ''} {filterCountry ? `en ${filterCountry}` : ''}. ¡Sé el primero en responder casos!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {leaderboard.slice(0, 20).map((u, i) => {
                const isMe = u.user_id === user?.id
                const name = (u.first_name ? `Dr(a). ${u.first_name} ${(u.last_name || '').charAt(0)}.` : u.email?.split('@')[0] || 'Médico Anónimo')
                const rankIcon = i === 0 ? <Crown size={18} color="#FFD700" /> : i === 1 ? <Medal size={18} color="#C0C0C0" /> : i === 2 ? <Medal size={18} color="#CD7F32" /> : null
                const uLvl = calculateLevelUp(Number(u.xp || 0), 1).newLevel
                const correctPct = u.total_answers > 0 ? Math.round((u.correct / u.total_answers) * 100) : 0

                return (
                  <div
                    key={u.user_id || i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '12px',
                      background: isMe ? 'rgba(56, 189, 248, 0.1)' : i < 3 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                      border: isMe ? '1.5px solid rgba(56, 189, 248, 0.35)' : '1px solid rgba(255,255,255,0.04)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Rank Number / Medal */}
                    <div style={{ width: 28, textAlign: 'center', fontWeight: 800, fontSize: '0.9rem', color: i < 3 ? '#eab308' : 'var(--surface-400)', flexShrink: 0 }}>
                      {rankIcon || (i + 1)}
                    </div>

                    {/* Doctor Avatar with Institution Logo Badge */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: isMe ? 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)' : 'var(--surface-700)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        color: '#fff',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                      }}>
                        {name.charAt(0).toUpperCase()}
                      </div>
                      
                      {/* University Logo / Country Flag badge positioned on bottom-right of avatar */}
                      <div style={{ position: 'absolute', bottom: -3, right: -4 }}>
                        <UserInstitutionBadge
                          user={u}
                          size={18}
                        />
                      </div>
                    </div>

                    {/* Doctor Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: isMe ? 700 : 600, fontSize: '0.88rem', color: isMe ? '#38bdf8' : '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {name}
                        </span>
                        {isMe && (
                          <span style={{ fontSize: '0.68rem', color: '#0284c7', background: '#e0f2fe', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                            Tú
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap', marginTop: 1 }}>
                        <span style={{ color: '#38bdf8', fontWeight: 600 }}>Nvl {uLvl}</span>
                        <span>·</span>
                        <span style={{ fontStyle: 'italic' }}>{getLevelTitle(uLvl)}</span>
                        <span>·</span>
                        <span style={{ color: '#cbd5e1' }}>
                          {u.university ? (u.university.split('(')[0] || u.university) : (u.country || 'Chile')}
                          {u.sede ? ` (${u.sede})` : ''}
                        </span>
                      </div>
                    </div>

                    {/* Stats & XP */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
                        <Zap size={14} color="#eab308" /> {Number(u.xp || 0).toLocaleString()} <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>XP</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        {u.total_answers || 0} pregs · {correctPct}%
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        ) : lbView === 'sedes' ? (
          /* 2. SEDES & UNIVERSITIES VIEW */
          sedeLeaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--surface-400)', fontSize: '0.85rem' }}>
              Aún no hay actividad de sedes registradas {lbPeriod === 'today' ? 'hoy' : lbPeriod === 'week' ? 'esta semana' : ''}.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {sedeLeaderboard.map((s, i) => {
                const rankIcon = i === 0 ? <Crown size={18} color="#FFD700" /> : i === 1 ? <Medal size={18} color="#C0C0C0" /> : i === 2 ? <Medal size={18} color="#CD7F32" /> : null

                return (
                  <div
                    key={`${s.university}-${s.sede}-${i}`}
                    onClick={() => {
                      setFilterUniversity(s.university)
                      setLbView('doctors')
                      loadLeaderboard(lbPeriod, s.university, '')
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '14px',
                      background: i < 3 ? 'rgba(168, 85, 247, 0.07)' : 'rgba(255,255,255,0.02)',
                      border: i === 0 ? '1.5px solid rgba(234, 179, 8, 0.4)' : '1px solid rgba(255,255,255,0.06)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    title="Haz clic para ver los médicos de esta sede"
                  >
                    {/* Rank */}
                    <div style={{ width: 28, textAlign: 'center', fontWeight: 800, fontSize: '0.95rem', color: i < 3 ? '#eab308' : 'var(--surface-400)', flexShrink: 0 }}>
                      {rankIcon || (i + 1)}
                    </div>

                    {/* University Logo */}
                    <UserInstitutionBadge
                      user={{ university: s.university, sede: s.sede, country: s.country }}
                      size={36}
                    />

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.university}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#a855f7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 2 }}>
                        <span>📍 {s.sede}</span>
                        <span>·</span>
                        <span style={{ color: '#94a3b8' }}>👥 {s.total_doctors} médico{s.total_doctors > 1 ? 's' : ''} activo{s.total_doctors > 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {/* XP & Action */}
                    <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
                          <Zap size={15} color="#eab308" /> {Number(s.xp || 0).toLocaleString()} <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>XP</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {s.total_answers || 0} respuestas
                        </div>
                      </div>
                      <ArrowUpRight size={16} color="#38bdf8" />
                    </div>
                  </div>
                )
              })}
            </div>
          )
        ) : (
          /* 3. COUNTRIES VIEW */
          countryLeaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--surface-400)', fontSize: '0.85rem' }}>
              Aún no hay actividad de países registrada {lbPeriod === 'today' ? 'hoy' : lbPeriod === 'week' ? 'esta semana' : ''}.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {countryLeaderboard.map((c, i) => {
                const rankIcon = i === 0 ? <Crown size={18} color="#FFD700" /> : i === 1 ? <Medal size={18} color="#C0C0C0" /> : i === 2 ? <Medal size={18} color="#CD7F32" /> : null

                return (
                  <div
                    key={`${c.country}-${i}`}
                    onClick={() => {
                      setFilterCountry(c.country)
                      setLbView('doctors')
                      loadLeaderboard(lbPeriod, '', c.country)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '14px',
                      background: i < 3 ? 'rgba(16, 185, 129, 0.07)' : 'rgba(255,255,255,0.02)',
                      border: i === 0 ? '1.5px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255,255,255,0.06)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    title="Haz clic para ver los médicos de este país"
                  >
                    {/* Rank */}
                    <div style={{ width: 28, textAlign: 'center', fontWeight: 800, fontSize: '0.95rem', color: i < 3 ? '#eab308' : 'var(--surface-400)', flexShrink: 0 }}>
                      {rankIcon || (i + 1)}
                    </div>

                    {/* Flag Badge */}
                    <UserInstitutionBadge
                      user={{ country: c.country }}
                      size={36}
                    />

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>
                        {c.country}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 2 }}>
                        <span>👥 {c.total_doctors} médico{c.total_doctors > 1 ? 's' : ''} postulante{c.total_doctors > 1 ? 's' : ''}</span>
                        <span>·</span>
                        <span style={{ color: '#94a3b8' }}>{c.total_answers || 0} casos resueltos</span>
                      </div>
                    </div>

                    {/* XP & Action */}
                    <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
                          <Zap size={15} color="#eab308" /> {Number(c.xp || 0).toLocaleString()} <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>XP</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          Puntaje Nacional
                        </div>
                      </div>
                      <ArrowUpRight size={16} color="#38bdf8" />
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default Dashboard
