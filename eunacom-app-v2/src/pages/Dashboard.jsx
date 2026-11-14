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
import { fetchProgress, fetchLeaderboard, fetchUserProfile, saveUserProfile, fetchClases, fetchClaseProgress, fetchTests } from '../lib/api'
import { XP_PER_CORRECT, XP_PER_INCORRECT, XP_PER_CLASS, calculateLevelUp, getXPForLevel, getLevelTitle, getLevelProgress, formatXP, getDoctorForLevel } from '../utils/xpSystem'
import { TopicCard } from '../components/TopicCard'
import { TopicQuickModal } from '../components/TopicQuickModal'
import { UserInstitutionBadge, CHILEAN_UNIVERSITIES, COUNTRIES } from '../utils/universityAndCountry'
import { getDoctorAvatar, DOCTOR_CHARACTERS } from '../utils/doctorAvatars'
import LevelUpModal from '../components/LevelUpModal'
import StreakRiskBanner from '../components/StreakRiskBanner'
import StreakSaverModal from '../components/StreakSaverModal'
import InicioMidnight from '../components/redesign/InicioMidnight'
import RecJul2026Popup from '../components/RecJul2026Popup'
import SpecialtyIcon, { hasSpecialtyIcon } from '../components/redesign/SpecialtyIcon'
import '../styles/dashboardProMax.css'
import '../styles/tienda.css'
import { useSubscription } from '../contexts/SubscriptionContext'
import { PRODUCTS, TOMOS, EXTRAS, fmtClp, RECON_JUL2026 } from '../config/tienda'

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

// Tema del Inicio → especialidad de las clases nuevas (Mis clases V3)
const V3_KEYS = [['cardio', 'cardiologia'], ['gastro', 'gastroenterologia'], ['neumo', 'neumologia'], ['respir', 'neumologia'], ['nefro', 'nefrologia'],
  ['diabet', 'diabetes'], ['endocrin', 'endocrinologia'], ['hemato', 'hematologia'], ['infecto', 'infectologia'], ['reumato', 'reumatologia'],
  ['neuro', 'neurologia'], ['geriatr', 'neurologia'], ['cirug', 'cirugia'], ['trauma', 'traumatologia'], ['urolog', 'urologia'], ['otorrino', 'otorrino'],
  ['oftalmo', 'oftalmologia'], ['dermato', 'dermatologia'], ['psiquiat', 'psiquiatria'], ['pediatr', 'pediatria'], ['obstetr', 'obstetricia'],
  ['ginecol', 'ginecologia'], ['salud publica', 'saludpublica']]
const v3SpecKey = name => { const n = String(name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); return (V3_KEYS.find(([k]) => n.includes(k)) || [])[1] }

const Dashboard = () => {
  const { user, openAuthModal } = useAuth()
  const { libraryIncluded, ownedBooks } = useSubscription()
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
  const [showStreakSaverModal, setShowStreakSaverModal] = useState(false)
  const [demoStep, setDemoStep] = useState(1)
  const DAILY_GOAL = 50

  // Check URL parameters for streak rescue deep-link (e.g. from email marketing)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('action') === 'save_streak' || params.get('streak_rescue') === 'true' || params.get('rescue') === 'true') {
        setShowStreakSaverModal(true)
      }
    }
  }, [])

  const handleStreakSaved = ({ streak, savedToday, answersCount }) => {
    setTodayAnswers(prev => prev + (answersCount || 3))
    setStats(prev => ({
      ...prev,
      streak: streak || (prev.streak + 1),
      xp: (prev.xp || 0) + 50,
      totalXP: (prev.totalXP || prev.xp || 0) + 50
    }))
  }

  const triggerDemoLevelUp = () => {
    const current = demoStep
    const next = current >= 10 ? 1 : current + 1
    setDemoStep(next)
    setLevelUpModalData({
      oldLevel: current,
      newLevel: next,
      earnedGems: 50 + next * 25
    })
  }

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
      const classesWatched = userClasesProgress.filter(cp => cp.video_watched).length
      const totalXP = (correctAnswers * XP_PER_CORRECT) + (incorrectAnswers * XP_PER_INCORRECT) + classesWatched * XP_PER_CLASS
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
  const activeDoctor = getDoctorAvatar(userProfile || user, stats.level)

  return (
    <div className="dash-promax-wrapper">
      {/* Ambient Textured Lighting & Depth Glows */}
      <div className="dash-promax-ambient-bg">
        <div className="dash-ambient-glow-1" />
        <div className="dash-ambient-glow-2" />
        <div className="dash-ambient-glow-3" />
      </div>

      <div className="dash-content-layer" style={{ paddingBottom: '2.5rem' }}>
      {/* ─── NUEVA: RECONSTRUCCIÓN JULIO 2026, arriba de todo ─── */}

      {/* ─── MIDNIGHT PRO: INICIO (rediseño nov-2026) ─── */}
      {(
        <InicioMidnight
          guest={!user}
          onAuth={mode => openAuthModal(mode)}
          name={!user ? 'Doctor(a)' : `Dr(a). ${String(userProfile?.first_name || user?.user_metadata?.full_name || 'Doctor').replace(/^\s*(dr\(a\)|dra?)\.?\s+/i, '')}`}
          streak={stats.streak}
          accuracy={accuracy}
          todayAnswers={todayAnswers}
          dailyGoal={DAILY_GOAL}
          answered={stats.totalAnswered}
          exams={stats.totalExams}
          level={stats.level}
          levelTitle={getLevelTitle(stats.level)}
          xp={stats.totalXP}
          levelPct={Math.round(getLevelProgress(stats.totalXP, stats.level) || 0)}
          avatar={activeDoctor?.image}
        />
      )}

      {/* ─── NUEVA: RECONSTRUCCIÓN JULIO 2026 ─── */}
      <RecJul2026Popup owned={!!user && !!ownedBooks?.has?.(RECON_JUL2026.sku)} />

      {/* ─── STREAK FREEZE WARNING BANNER (Trigger de Racha en Riesgo) ─── */}
      {stats.streak > 0 && todayAnswers === 0 && (
        <StreakRiskBanner
          streak={stats.streak}
          userFirstName={userProfile?.firstName || user?.email?.split('@')[0] || ''}
          hoursRemaining={3}
          onOpenStreakSaver={() => setShowStreakSaverModal(true)}
        />
      )}

      {/* ─── TEMAS Y ESPECIALIDADES (Midnight Pro) ─── */}
      <section className="mn-sec">
        <div className="mn-sec-head">
          <h2>Temas y especialidades</h2>
          <span className="mn-sub">Videoclases, preguntas y dominio por tema</span>
        </div>
        <div className="mn-chips">
          {[
            { key: 'all', label: 'Todos' },
            { key: 'modulo-1', label: 'Medicina Interna' },
            { key: 'modulo-2', label: 'Cirugía y especialidades' },
            { key: 'modulo-3', label: 'Materno-infantil' },
          ].map(f => (
            <button key={f.key} className={topicModuleFilter === f.key ? 'on' : ''} onClick={() => setTopicModuleFilter(f.key)}>{f.label}</button>
          ))}
        </div>
        <div className="mn-card mn-list mn-topics">
          {topicsList
            .filter(t => topicModuleFilter === 'all' || t.module === topicModuleFilter)
            .map((t, idx) => {
              const ab = (t.topic || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 3).toUpperCase()
              const tone = { 'modulo-1': 'blue', 'modulo-2': 'amber', 'modulo-3': 'pink' }[t.module] || 'blue'
              const pct = Math.round(t.masteryPct || 0)
              return (
                <button key={t.topic || idx} className="mn-li" onClick={() => { const k = v3SpecKey(t.topic); if (k) navigate(`/mis-clases/${k}`); else setSelectedTopicForModal(t) }}>
                  {hasSpecialtyIcon(t.topic)
                    ? <SpecialtyIcon name={t.topic} size={44} />
                    : <span className={`mn-ab mn-tone-${tone}`}>{ab}</span>}
                  <span className="mn-li-txt">
                    {t.topic}
                    <small>{(t.questionsCount || 0).toLocaleString('es-CL')} preguntas · {t.classesCount || 0} clases</small>
                    <span className="mn-bar"><b style={{ width: `${Math.max(2, pct)}%` }} /></span>
                  </span>
                  <span className="mn-pct">{pct}%</span>
                  <ChevronRight size={16} className="mn-li-go" />
                </button>
              )
            })}
        </div>
      </section>

      {/* Pop-up Bigger Modal for Topics */}
      <TopicQuickModal
        isOpen={!!selectedTopicForModal}
        onClose={() => setSelectedTopicForModal(null)}
        topicData={selectedTopicForModal}
        onOpenClass={(claseId) => {
          const selectedTopic = selectedTopicForModal
          setSelectedTopicForModal(null)
          navigate('/mis-clases', { state: { specialty: selectedTopic?.specialty, subsystem: selectedTopic?.topic, openClaseId: claseId, openLesson: selectedTopic?.lessons?.find(l => l.id === claseId)?.lessonNumber } })
        }}
        onNavigateToSubsystem={(topicName, specialtyName) => {
          setSelectedTopicForModal(null)
          navigate('/mis-clases', { state: { specialty: specialtyName, subsystem: topicName } })
        }}
      />

      {/* ─── TABLA DE CLASIFICACIÓN (Midnight Pro) ─── */}
      <section className="mn-sec mn-lb">
        <div className="mn-row mn-between mn-sec-head">
          <div>
            <h2>Tabla de clasificación</h2>
            <span className="mn-sub">La comunidad que se prepara contigo</span>
          </div>
          {myRank > 0 && lbView === 'doctors' && <span className="mn-pill mn-pill-sky">Tu puesto #{myRank}</span>}
        </div>

        <div className="mn-chips">
          {PERIODS.map(p => (
            <button key={p.key} className={lbPeriod === p.key ? 'on' : ''} onClick={() => loadLeaderboard(p.key, filterUniversity, filterCountry)}>{p.label}</button>
          ))}
          <span className="mn-chip-sep" />
          {[
            { key: 'doctors', label: 'Médicos', icon: Users },
            { key: 'sedes', label: 'Universidades', icon: Building2 },
            { key: 'countries', label: 'Países', icon: Globe },
          ].map(v => (
            <button key={v.key} className={lbView === v.key ? 'on' : ''} onClick={() => setLbView(v.key)}><v.icon size={13} /> {v.label}</button>
          ))}
        </div>

        {lbView === 'doctors' && (
          <div className="mn-lb-filters">
            <button className={!filterUniversity && !filterCountry ? 'on' : ''} onClick={() => { setFilterUniversity(''); setFilterCountry(''); loadLeaderboard(lbPeriod, '', '') }}>Todos</button>
            {userProfile?.university && (
              <button className={filterUniversity === userProfile.university ? 'on' : ''} onClick={() => { const uni = userProfile.university; setFilterUniversity(uni); setFilterCountry(''); loadLeaderboard(lbPeriod, uni, '') }}>Mi sede</button>
            )}
            {userProfile?.country && (
              <button className={filterCountry === userProfile.country ? 'on' : ''} onClick={() => { const c = userProfile.country; setFilterCountry(c); setFilterUniversity(''); loadLeaderboard(lbPeriod, '', c) }}>Mi país</button>
            )}
            <select value={filterUniversity} onChange={e => { const val = e.target.value; setFilterUniversity(val); loadLeaderboard(lbPeriod, val, filterCountry) }}>
              <option value="">Todas las sedes</option>
              {CHILEAN_UNIVERSITIES.map(u => <option key={u.id} value={u.name}>{u.shortName} ({u.country})</option>)}
            </select>
            <select value={filterCountry} onChange={e => { const val = e.target.value; setFilterCountry(val); loadLeaderboard(lbPeriod, filterUniversity, val) }}>
              <option value="">Todos los países</option>
              {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
            </select>
          </div>
        )}

        <div className="mn-card mn-list mn-lb-list">
          {(() => {
            const rankCell = i => i === 0 ? <Crown size={16} color="#fbbf24" /> : i === 1 ? <Medal size={16} color="#cbd5e1" /> : i === 2 ? <Medal size={16} color="#d97706" /> : <span>{i + 1}</span>
            const periodTxt = lbPeriod === 'today' ? 'hoy' : lbPeriod === 'week' ? 'esta semana' : ''
            if (lbLoading) return <div className="mn-lb-empty">Cargando clasificación…</div>

            if (lbView === 'doctors') {
              if (!leaderboard.length) return <div className="mn-lb-empty">Aún no hay actividad {periodTxt}{filterUniversity ? ` en ${filterUniversity}` : ''}{filterCountry ? ` en ${filterCountry}` : ''}. Responde preguntas y aparece aquí.</div>
              return leaderboard.slice(0, 20).map((u, i) => {
                const isMe = u.user_id === user?.id
                const rawFirst = (u.first_name || '').trim()
                const rawLast = (u.last_name || '').trim()
                const name = rawFirst
                  ? `Dr(a). ${rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase()}${rawLast ? ` ${rawLast.charAt(0).toUpperCase()}.` : ''}`
                  : (u.email ? `Dr(a). ${u.email.split('@')[0]}` : 'Médico postulante')
                const uLvl = calculateLevelUp(Number(u.xp || 0), 1).newLevel
                const pct = u.total_answers > 0 ? Math.round((u.correct / u.total_answers) * 100) : 0
                const inst = u.university ? (u.university.split('(')[0] || u.university).trim() : (u.country || 'Chile')
                const doc = getDoctorAvatar(u, uLvl)
                return (
                  <div key={u.user_id || i} className={`mn-lb-row${isMe ? ' me' : ''}`}>
                    <span className="mn-lb-rank">{rankCell(i)}</span>
                    <span className="mn-lb-av">
                      <img src={doc.image} alt="" />
                      <span className="mn-lb-badge"><UserInstitutionBadge user={u} size={14} /></span>
                    </span>
                    <span className="mn-lb-txt">
                      <b>{name}{isMe && <em>Tú</em>}</b>
                      <small>Nvl {uLvl} · {inst}</small>
                    </span>
                    <span className="mn-lb-xp">
                      <b><Zap size={12} />{Number(u.xp || 0).toLocaleString('es-CL')}</b>
                      <small>{u.total_answers || 0} preg · {pct}%</small>
                    </span>
                  </div>
                )
              })
            }

            const rows = lbView === 'sedes' ? sedeLeaderboard : countryLeaderboard
            if (!rows.length) return <div className="mn-lb-empty">Aún no hay actividad {lbView === 'sedes' ? 'de sedes' : 'de países'} {periodTxt}.</div>
            return rows.map((r, i) => {
              const isSede = lbView === 'sedes'
              const open = () => {
                if (isSede) { setFilterUniversity(r.university); setLbView('doctors'); loadLeaderboard(lbPeriod, r.university, '') }
                else { setFilterCountry(r.country); setLbView('doctors'); loadLeaderboard(lbPeriod, '', r.country) }
              }
              return (
                <button key={`${r.university || r.country}-${r.sede || ''}-${i}`} className="mn-lb-row" onClick={open}>
                  <span className="mn-lb-rank">{rankCell(i)}</span>
                  <span className="mn-lb-av mn-lb-inst"><UserInstitutionBadge user={isSede ? { university: r.university, sede: r.sede, country: r.country } : { country: r.country }} size={30} /></span>
                  <span className="mn-lb-txt">
                    <b>{isSede ? r.university : r.country}</b>
                    <small>{isSede ? `${r.sede} · ` : ''}{r.total_doctors} médico{r.total_doctors > 1 ? 's' : ''}</small>
                  </span>
                  <span className="mn-lb-xp">
                    <b><Zap size={12} />{Number(r.xp || 0).toLocaleString('es-CL')}</b>
                    <small>{(r.total_answers || 0).toLocaleString('es-CL')} resp.</small>
                  </span>
                </button>
              )
            })
          })()}
        </div>
      </section>

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

      {/* ─── QUICK 3-QUESTION STREAK SAVER MODAL ─── */}
      <StreakSaverModal
        isOpen={showStreakSaverModal}
        onClose={() => setShowStreakSaverModal(false)}
        userId={user?.id}
        userFirstName={userProfile?.firstName || user?.email?.split('@')[0] || 'Colega'}
        currentStreak={stats.streak || 3}
        onStreakSaved={handleStreakSaved}
      />

    </div>
  </div>
)
}

export default Dashboard

