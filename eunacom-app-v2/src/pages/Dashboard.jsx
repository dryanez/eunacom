import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PieChart, FileText, Target, Activity, CreditCard, RotateCcw,
  Flame, Trophy, Medal, Crown, ChevronDown, Zap, TrendingUp,
  Layers, Download, X, Sparkles, Stethoscope, LogIn, ChevronRight,
  BookOpen, Building2, Globe, Users, ArrowUpRight, Filter,
  Video, ArrowRight, PlayCircle, ShieldCheck, Heart, Star
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { fetchProgress, fetchLeaderboard, fetchUserProfile, saveUserProfile } from '../lib/api'
import { XP_PER_CORRECT, XP_PER_INCORRECT, calculateLevelUp, getXPForLevel, getLevelTitle, getLevelProgress, formatXP, getDoctorForLevel } from '../utils/xpSystem'
import { TopicCard } from '../components/TopicCard'
import { TopicQuickModal } from '../components/TopicQuickModal'
import { UserInstitutionBadge, CHILEAN_UNIVERSITIES, COUNTRIES } from '../utils/universityAndCountry'
import { getDoctorAvatar, DOCTOR_CHARACTERS } from '../utils/doctorAvatars'
import LevelUpModal from '../components/LevelUpModal'
import '../styles/dashboardProMax.css'

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
  const [levelUpModalData, setLevelUpModalData] = useState(null)
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

      // Level up detection
      if (user?.id) {
        const lastLevelKey = `last_seen_level_${user.id}`
        const lastLevelRaw = localStorage.getItem(lastLevelKey)
        if (lastLevelRaw) {
          const lastLevel = parseInt(lastLevelRaw, 10)
          if (newLevel > lastLevel) {
            setLevelUpModalData({
              oldLevel: lastLevel,
              newLevel: newLevel
            })
          }
        }
        localStorage.setItem(lastLevelKey, String(newLevel))
      }
    } catch (e) { console.error('Dashboard stats error:', e) }
  }

  const handleEquipDoctor = async (doctorId) => {
    if (user?.id) {
      const updated = { ...(userProfile || {}), selected_doctor: doctorId }
      setUserProfile(updated)
      try {
        await saveUserProfile(updated)
      } catch (err) {
        console.error('Error equipping doctor:', err)
      }
    }
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
  const myRank = (Array.isArray(leaderboard) && user?.id)
    ? Math.max(0, leaderboard.findIndex(u => u?.user_id === user.id) + 1)
    : 0
  const activeDoctor = DOCTOR_CHARACTERS.find(d => d.id === (userProfile?.selected_doctor || 'dr_house')) || DOCTOR_CHARACTERS[0]

  return (
    <div className="dash-promax-wrapper">
      {/* Ambient Textured Lighting & Depth Glows */}
      <div className="dash-promax-ambient-bg">
        <div className="dash-ambient-glow-1" />
        <div className="dash-ambient-glow-2" />
        <div className="dash-ambient-glow-3" />
      </div>

      <div className="dash-content-layer" style={{ paddingBottom: '2.5rem' }}>
        {/* ─── PWA INSTALL BANNER (Subtle & Non-Intrusive) ─── */}
      {!isStandalone && !dismissed && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: '10px',
          padding: '0.5rem 0.9rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
            <Download size={15} color="#38bdf8" />
            <span>Instala <strong>EUNACOM App</strong> en tu dispositivo para un acceso directo rápido.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
            <button
              onClick={handleInstallClick}
              style={{
                padding: '0.3rem 0.75rem',
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              Instalar
            </button>
            <button
              onClick={handleDismiss}
              title="Cerrar"
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ─── GUEST HERO BANNER ─── */}
      {!user && (
        <div style={{
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '16px',
          padding: '2rem 1.75rem',
          marginBottom: '1.75rem',
          overflow: 'hidden',
        }}>
          <div style={{ maxWidth: '620px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.25rem 0.65rem',
              borderRadius: '6px',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              color: '#38bdf8',
              fontSize: '0.75rem',
              fontWeight: 600,
              marginBottom: '0.85rem',
            }}>
              <span>🩺 Preparación Médica EUNACOM 2026</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.5rem', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
              La plataforma médica estándar para rendir el EUNACOM
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
              Banco con +10.000 preguntas clínicas justificadas, +650 videoclases según perfil ASOFAMECH, reconstrucciones oficiales y simulacros cronometrados.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => openAuthModal('register')}
                style={{
                  padding: '0.7rem 1.4rem',
                  background: '#0284c7',
                  color: '#ffffff',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#0369a1' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#0284c7' }}
              >
                <span>Crear cuenta gratis</span>
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => openAuthModal('login')}
                style={{
                  padding: '0.7rem 1.4rem',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#f8fafc',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)' }}
              >
                <span>Iniciar sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── LOGGED IN USER GREETING & DOCTOR PROFILE ─── */}
      {user && (
        <div className="dash-header-greeting">
          <div className="dash-greeting-left">
            <div className="dash-user-avatar-frame">
              <img 
                src={activeDoctor.image || '/avatars/dr_house.png'} 
                alt={activeDoctor.name} 
                onError={(e) => { e.target.src = '/avatars/dr_house.png' }}
              />
            </div>
            <div className="dash-greeting-titles">
              <h1>
                Hola, {userProfile?.first_name ? `Dr(a). ${userProfile.first_name}` : 'Doctor'} 👋
              </h1>
              <p>
                {activeDoctor.name} · {activeDoctor.quote || 'Continúa tu preparación y revisa tus métricas de dominio'}
              </p>
            </div>
          </div>
          {userProfile && (userProfile.university || userProfile.country) && (
            <div className="dash-greeting-right">
              <UserInstitutionBadge user={userProfile} size={28} showLabel={true} />
            </div>
          )}
        </div>
      )}

      {/* ─── HERO BENTO: LEVEL, XP & RACHA WIDGET ─── */}
      {user && (
        <div className="dash-hero-level-bento">
          <div className="dash-level-progress-col">
            <div className="dash-level-top-row">
              <div className="dash-rank-badge">
                <Zap size={14} />
                <span>Nivel {stats.level} · {levelTitle}</span>
              </div>
              <div className="dash-xp-fraction">
                <strong>{formatXP(stats.xp)}</strong> / {formatXP(levelCapXP)} XP
              </div>
            </div>
            
            <div className="dash-progress-track">
              <div 
                className="dash-progress-fill" 
                style={{ width: `${Math.max(4, Math.min(100, xpProgress))}%` }} 
              />
            </div>

            <div className="dash-level-sub-meta">
              <span>{formatXP(Math.max(0, levelCapXP - stats.xp))} XP para el siguiente nivel</span>
              <span>Total acumulado: {formatXP(stats.totalXP || stats.xp)} XP</span>
            </div>
          </div>

          {/* Quick Streak Widget Linking Directly to MedLingo */}
          <a href="/medlingo" className="dash-streak-quick-widget" title="Toca para entrenar tu racha en MedLingo">
            <div className="dash-streak-flame-box">
              <Flame size={24} className="dash-flame-anim" />
            </div>
            <div className="dash-streak-data">
              <span className="dash-streak-lbl">Racha Activa</span>
              <span className="dash-streak-val">
                {stats.streak || 1} <span>{stats.streak === 1 ? 'día' : 'días'}</span>
              </span>
            </div>
            <ChevronRight size={18} color="#f97316" />
          </a>
        </div>
      )}

      {/* ─── UI/UX PRO MAX BENTO GRID (1st: MIS CLASES, 2nd: MEDLINGO) ─── */}
      <div className="dash-bento-section">
        <div className="dash-bento-section-header">
          <h2 className="dash-bento-section-title">
            <Sparkles size={18} color="#38bdf8" />
            <span>Módulos de Preparación EUNACOM</span>
          </h2>
        </div>

        <div className="dash-bento-grid">
          {/* 1. HERO BENTO #1: MIS CLASES (First & Prominent) */}
          <a href="/mis-clases" className="dash-bento-card bento-card-clases">
            <div className="dash-card-ambient-tint" />
            <div>
              <div className="dash-card-header">
                <div className="dash-card-icon-box">
                  <Video size={24} />
                </div>
                <span className="dash-card-badge">📺 Masterclasses HD</span>
              </div>
              <div className="dash-card-body">
                <h3 className="dash-card-title">Mis Clases Teóricas</h3>
                <p className="dash-card-desc">
                  +650 videoclases de alto rendimiento según perfil ASOFAMECH, resúmenes MINSAL, fisiopatología y algoritmos clínicos.
                </p>
              </div>
            </div>
            <div className="dash-card-footer">
              <span className="dash-card-tag">⚡ Módulos 1, 2 y 3</span>
              <span className="dash-card-action-link">
                <span>Ver Clases</span>
                <ArrowRight size={16} />
              </span>
            </div>
          </a>

          {/* 2. HERO BENTO #2: MEDLINGO EUNACOM (Second & Prominent) */}
          <a href="/medlingo" className="dash-bento-card bento-card-medlingo">
            <div className="dash-card-ambient-tint" />
            <div>
              <div className="dash-card-header">
                <div className="dash-card-icon-box">
                  <Flame size={24} className="dash-flame-anim" />
                </div>
                <span className="dash-card-badge">🦉 Modo Gamificado</span>
              </div>
              <div className="dash-card-body">
                <h3 className="dash-card-title">MedLingo EUNACOM</h3>
                <p className="dash-card-desc">
                  Aprende semiología y farmacología jugando con vidas, niveles, misiones diarias y torneos semanales de ligas médicas.
                </p>
              </div>
            </div>
            <div className="dash-card-footer">
              <span className="dash-card-tag">🔥 Racha & 6 Ligas</span>
              <span className="dash-card-action-link">
                <span>Entrenar Racha</span>
                <ArrowRight size={16} />
              </span>
            </div>
          </a>

          {/* 3. BENTO #3: BANCO DE PREGUNTAS & SIMULADOR */}
          <a href="/test" className="dash-bento-card bento-card-test">
            <div className="dash-card-ambient-tint" />
            <div>
              <div className="dash-card-header">
                <div className="dash-card-icon-box">
                  <FileText size={22} />
                </div>
                <span className="dash-card-badge">🎯 +10.000 Preguntas</span>
              </div>
              <div className="dash-card-body">
                <h3 className="dash-card-title">Banco & Simulacros</h3>
                <p className="dash-card-desc">
                  Preguntas clínicas con justificación instantánea, modo tutor AI y filtros personalizados por tema.
                </p>
              </div>
            </div>
            <div className="dash-card-footer">
              <span className="dash-card-tag">🩺 Modo Tutor & Examen</span>
              <span className="dash-card-action-link">
                <span>Iniciar Test</span>
                <ArrowRight size={16} />
              </span>
            </div>
          </a>

          {/* 4. BENTO #4: RECONSTRUCCIONES OFICIALES */}
          <a href="/reconstructions" className="dash-bento-card bento-card-reconstructions">
            <div className="dash-card-ambient-tint" />
            <div>
              <div className="dash-card-header">
                <div className="dash-card-icon-box">
                  <Layers size={22} />
                </div>
                <span className="dash-card-badge">🏛️ Oficiales 2020–2026</span>
              </div>
              <div className="dash-card-body">
                <h3 className="dash-card-title">Reconstrucciones</h3>
                <p className="dash-card-desc">
                  Exámenes oficiales ASOFAMECH completos con pautas oficiales corregidas y estadísticas históricas.
                </p>
              </div>
            </div>
            <div className="dash-card-footer">
              <span className="dash-card-tag">📋 Pruebas ST y SP</span>
              <span className="dash-card-action-link">
                <span>Resolver</span>
                <ArrowRight size={16} />
              </span>
            </div>
          </a>

          {/* 5. BENTO #5: ANALÍTICA & PLAN DE ESTUDIO */}
          <a href="/stats" className="dash-bento-card bento-card-plan">
            <div className="dash-card-ambient-tint" />
            <div>
              <div className="dash-card-header">
                <div className="dash-card-icon-box">
                  <Activity size={22} />
                </div>
                <span className="dash-card-badge">📊 Analítica EUNACOM</span>
              </div>
              <div className="dash-card-body">
                <h3 className="dash-card-title">Estadísticas & Métricas</h3>
                <p className="dash-card-desc">
                  Métricas de dominio, tasa de acierto por especialidad, análisis de debilidades y proyección de puntaje.
                </p>
              </div>
            </div>
            <div className="dash-card-footer">
              <span className="dash-card-tag">📈 Proyección en Vivo</span>
              <span className="dash-card-action-link">
                <span>Ver Reportes</span>
                <ArrowRight size={16} />
              </span>
            </div>
          </a>
        </div>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8'
            }}>
              <BookOpen size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', margin: 0, letterSpacing: '-0.01em' }}>
                Temas y Especialidades
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0' }}>
                Progreso curricular, videoclases y banco de preguntas por área
              </p>
            </div>
          </div>

          {/* Module Filter Segmented Control */}
          <div style={{
            display: 'inline-flex',
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '4px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            gap: '3px',
            overflowX: 'auto',
            maxWidth: '100%',
            scrollbarWidth: 'none',
          }}>
            {[
              { key: 'all', label: 'Todos' },
              { key: 'modulo-1', label: 'Medicina Interna' },
              { key: 'modulo-2', label: 'Cirugía & Especialidades' },
              { key: 'modulo-3', label: 'Pediatría & Gineco' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setTopicModuleFilter(f.key)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '7px',
                  border: 'none',
                  background: topicModuleFilter === f.key ? 'rgba(56, 189, 248, 0.16)' : 'transparent',
                  color: topicModuleFilter === f.key ? '#38bdf8' : '#94a3b8',
                  boxShadow: topicModuleFilter === f.key ? 'inset 0 0 0 1px rgba(56, 189, 248, 0.3)' : 'none',
                  fontSize: '0.78rem',
                  fontWeight: topicModuleFilter === f.key ? 600 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
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
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 15, 30, 0.98) 100%)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px' }}>
        
        {/* Header with Title & Period Selector */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 36, height: 36, background: 'rgba(234, 179, 8, 0.1)', borderRadius: '10px', border: '1px solid rgba(234, 179, 8, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={18} color="#eab308" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                Tabla de Clasificación
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                Rendimiento y actividad de la comunidad médica en preparación
              </p>
            </div>
            {myRank > 0 && lbView === 'doctors' && (
              <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600, background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '0.2rem 0.6rem', borderRadius: '6px', marginLeft: '0.25rem' }}>
                Tu puesto: #{myRank}
              </span>
            )}
          </div>

          {/* Period Selector */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', gap: '2px' }}>
            {PERIODS.map(p => (
              <button
                key={p.key}
                onClick={() => loadLeaderboard(p.key, filterUniversity, filterCountry)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: lbPeriod === p.key ? 'rgba(56, 189, 248, 0.16)' : 'transparent',
                  color: lbPeriod === p.key ? '#38bdf8' : '#94a3b8',
                  boxShadow: lbPeriod === p.key ? 'inset 0 0 0 1px rgba(56, 189, 248, 0.3)' : 'none',
                  fontSize: '0.75rem',
                  fontWeight: lbPeriod === p.key ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── SCOPE NAVIGATION TABS ─── */}
        <div style={{
          display: 'flex',
          gap: '0.4rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
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
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: 'none',
              background: lbView === 'doctors' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              color: lbView === 'doctors' ? '#f8fafc' : '#94a3b8',
              boxShadow: lbView === 'doctors' ? 'inset 0 0 0 1px rgba(255, 255, 255, 0.15)' : 'none',
              fontSize: '0.8rem',
              fontWeight: lbView === 'doctors' ? 600 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            <Users size={15} />
            <span>Médicos Postulantes</span>
          </button>

          <button
            onClick={() => setLbView('sedes')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: 'none',
              background: lbView === 'sedes' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              color: lbView === 'sedes' ? '#f8fafc' : '#94a3b8',
              boxShadow: lbView === 'sedes' ? 'inset 0 0 0 1px rgba(255, 255, 255, 0.15)' : 'none',
              fontSize: '0.8rem',
              fontWeight: lbView === 'sedes' ? 600 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            <Building2 size={15} />
            <span>Universidades y Sedes</span>
          </button>

          <button
            onClick={() => setLbView('countries')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: 'none',
              background: lbView === 'countries' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              color: lbView === 'countries' ? '#f8fafc' : '#94a3b8',
              boxShadow: lbView === 'countries' ? 'inset 0 0 0 1px rgba(255, 255, 255, 0.15)' : 'none',
              fontSize: '0.8rem',
              fontWeight: lbView === 'countries' ? 600 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            <Globe size={15} />
            <span>Países</span>
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
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '0.45rem 0.65rem',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.04)'
          }}>
            {/* Quick Filter Buttons */}
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={() => {
                  setFilterUniversity('')
                  setFilterCountry('')
                  loadLeaderboard(lbPeriod, '', '')
                }}
                style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: !filterUniversity && !filterCountry ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.05)',
                  color: !filterUniversity && !filterCountry ? '#38bdf8' : '#94a3b8',
                  boxShadow: !filterUniversity && !filterCountry ? 'inset 0 0 0 1px rgba(56, 189, 248, 0.3)' : 'none',
                  fontSize: '0.74rem',
                  fontWeight: 600,
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
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: filterUniversity === userProfile.university ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255,255,255,0.05)',
                    color: filterUniversity === userProfile.university ? '#c084fc' : '#94a3b8',
                    boxShadow: filterUniversity === userProfile.university ? 'inset 0 0 0 1px rgba(168, 85, 247, 0.3)' : 'none',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <UserInstitutionBadge user={userProfile} size={14} />
                  <span>Mi Sede ({userProfile.sede || 'Mi Universidad'})</span>
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
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: filterCountry === userProfile.country ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)',
                    color: filterCountry === userProfile.country ? '#34d399' : '#94a3b8',
                    boxShadow: filterCountry === userProfile.country ? 'inset 0 0 0 1px rgba(16, 185, 129, 0.3)' : 'none',
                    fontSize: '0.74rem',
                    fontWeight: 600,
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
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.74rem',
                  color: filterUniversity ? '#38bdf8' : '#94a3b8',
                  outline: 'none',
                  cursor: 'pointer',
                  maxWidth: '160px'
                }}
              >
                <option value="">Todas las Sedes</option>
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
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.74rem',
                  color: filterCountry ? '#34d399' : '#94a3b8',
                  outline: 'none',
                  cursor: 'pointer',
                  maxWidth: '140px'
                }}
              >
                <option value="">Todos los Países</option>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {leaderboard.slice(0, 20).map((u, i) => {
                const isMe = u.user_id === user?.id
                const rawFirst = (u.first_name || '').trim()
                const rawLast = (u.last_name || '').trim()
                const cleanName = rawFirst
                  ? `Dr(a). ${rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase()}${rawLast ? ` ${rawLast.charAt(0).toUpperCase()}.` : ''}`
                  : (u.email ? `Dr(a). ${u.email.split('@')[0]}` : 'Médico Postulante')
                const initial = rawFirst ? rawFirst.charAt(0).toUpperCase() : (u.email ? u.email.charAt(0).toUpperCase() : 'M')
                
                const avatarGradients = [
                  'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                  'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                  'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  'linear-gradient(135deg, #0d9488 0%, #115e59 100%)',
                  'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                ]
                const avatarBg = isMe
                  ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                  : avatarGradients[initial.charCodeAt(0) % avatarGradients.length]

                const rankColor = i === 0 ? '#fbbf24' : i === 1 ? '#cbd5e1' : i === 2 ? '#d97706' : '#64748b'
                const rankIcon = i === 0 ? <Crown size={17} color="#fbbf24" /> : i === 1 ? <Medal size={17} color="#cbd5e1" /> : i === 2 ? <Medal size={17} color="#d97706" /> : null
                const uLvl = calculateLevelUp(Number(u.xp || 0), 1).newLevel
                const correctPct = u.total_answers > 0 ? Math.round((u.correct / u.total_answers) * 100) : 0
                const institutionText = u.university ? (u.university.split('(')[0] || u.university) : (u.country || 'Chile')

                return (
                  <div
                    key={u.user_id || i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      background: isMe ? 'rgba(56, 189, 248, 0.08)' : i < 3 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                      border: isMe ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(255,255,255,0.04)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Rank Number / Medal */}
                    <div style={{ width: 28, textAlign: 'center', fontWeight: 700, fontSize: '0.88rem', color: rankColor, flexShrink: 0 }}>
                      {rankIcon || (i + 1)}
                    </div>

                    {/* Doctor Avatar with Character Image & Institution Logo Badge */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img
                        src={getDoctorAvatar(u).image}
                        alt={getDoctorAvatar(u).name}
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: isMe ? '2px solid #38bdf8' : '1.5px solid rgba(255, 255, 255, 0.15)',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                          background: 'rgba(30, 41, 59, 0.8)',
                          display: 'block'
                        }}
                      />
                      
                      {/* University Logo / Country Flag badge */}
                      <div style={{ position: 'absolute', bottom: -3, right: -4 }}>
                        <UserInstitutionBadge
                          user={u}
                          size={16}
                        />
                      </div>
                    </div>

                    {/* Doctor Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: isMe ? 700 : 600, fontSize: '0.88rem', color: isMe ? '#38bdf8' : '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {cleanName}
                        </span>
                        {isMe && (
                          <span style={{ fontSize: '0.68rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                            Tú
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap', marginTop: 2 }}>
                        <span style={{ color: '#38bdf8', fontWeight: 600 }}>Nvl {uLvl}</span>
                        <span>·</span>
                        <span style={{ color: '#cbd5e1' }}>{getLevelTitle(uLvl)}</span>
                        <span>·</span>
                        <span style={{ color: '#94a3b8' }}>
                          {institutionText}{u.sede ? ` · ${u.sede}` : ''}
                        </span>
                      </div>
                    </div>

                    {/* Stats & XP */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
                        <Zap size={13} color="#fbbf24" /> {Number(u.xp || 0).toLocaleString()} <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>XP</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 1 }}>
                        {u.total_answers || 0} pregs · {correctPct}% acierto
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {sedeLeaderboard.map((s, i) => {
                const rankColor = i === 0 ? '#fbbf24' : i === 1 ? '#cbd5e1' : i === 2 ? '#d97706' : '#64748b'
                const rankIcon = i === 0 ? <Crown size={17} color="#fbbf24" /> : i === 1 ? <Medal size={17} color="#cbd5e1" /> : i === 2 ? <Medal size={17} color="#d97706" /> : null

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
                      borderRadius: '10px',
                      background: i < 3 ? 'rgba(168, 85, 247, 0.05)' : 'rgba(255,255,255,0.01)',
                      border: i === 0 ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid rgba(255,255,255,0.04)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    title="Haz clic para ver los médicos de esta sede"
                  >
                    {/* Rank */}
                    <div style={{ width: 28, textAlign: 'center', fontWeight: 700, fontSize: '0.88rem', color: rankColor, flexShrink: 0 }}>
                      {rankIcon || (i + 1)}
                    </div>

                    {/* University Logo */}
                    <UserInstitutionBadge
                      user={{ university: s.university, sede: s.sede, country: s.country }}
                      size={34}
                    />

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.university}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#c084fc', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: 2 }}>
                        <span>📍 {s.sede}</span>
                        <span>·</span>
                        <span style={{ color: '#94a3b8' }}>👥 {s.total_doctors} médico{s.total_doctors > 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {/* XP & Action */}
                    <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
                          <Zap size={13} color="#fbbf24" /> {Number(s.xp || 0).toLocaleString()} <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>XP</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 1 }}>
                          {s.total_answers || 0} respuestas
                        </div>
                      </div>
                      <ArrowUpRight size={15} color="#38bdf8" />
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {countryLeaderboard.map((c, i) => {
                const rankColor = i === 0 ? '#fbbf24' : i === 1 ? '#cbd5e1' : i === 2 ? '#d97706' : '#64748b'
                const rankIcon = i === 0 ? <Crown size={17} color="#fbbf24" /> : i === 1 ? <Medal size={17} color="#cbd5e1" /> : i === 2 ? <Medal size={17} color="#d97706" /> : null

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
                      borderRadius: '10px',
                      background: i < 3 ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.01)',
                      border: i === 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.04)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    title="Haz clic para ver los médicos de este país"
                  >
                    {/* Rank */}
                    <div style={{ width: 28, textAlign: 'center', fontWeight: 700, fontSize: '0.88rem', color: rankColor, flexShrink: 0 }}>
                      {rankIcon || (i + 1)}
                    </div>

                    {/* Flag Badge */}
                    <UserInstitutionBadge
                      user={{ country: c.country }}
                      size={34}
                    />

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#f8fafc' }}>
                        {c.country}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#34d399', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: 2 }}>
                        <span>👥 {c.total_doctors} médico{c.total_doctors > 1 ? 's' : ''}</span>
                        <span>·</span>
                        <span style={{ color: '#94a3b8' }}>{c.total_answers || 0} casos</span>
                      </div>
                    </div>

                    {/* XP & Action */}
                    <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
                          <Zap size={13} color="#fbbf24" /> {Number(c.xp || 0).toLocaleString()} <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>XP</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 1 }}>
                          Puntaje Nacional
                        </div>
                      </div>
                      <ArrowUpRight size={15} color="#38bdf8" />
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>

      {/* ─── LEVEL UP CELEBRATION MODAL ─── */}
      {levelUpModalData && (
        <LevelUpModal
          isOpen={Boolean(levelUpModalData)}
          onClose={() => setLevelUpModalData(null)}
          oldLevel={levelUpModalData.oldLevel}
          newLevel={levelUpModalData.newLevel}
          onEquipDoctor={handleEquipDoctor}
        />
      )}

    </div>
  </div>
)
}

export default Dashboard

