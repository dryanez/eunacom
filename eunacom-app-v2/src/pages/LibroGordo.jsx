import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation, Navigate } from 'react-router-dom'
import { BookOpen, GraduationCap, Clock, Lock, CheckCircle, PlayCircle, ArrowLeft, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { createTest, genId, fetchLibroGordoLink, fetchLibroGordoQuestions } from '../lib/api'
import { EunacomLogo } from '../components/EunacomLogo'
import LoadingScreen from '../components/LoadingScreen'
import TestRunner from './TestRunner'

// Libros Gordos online — modo bloqueado. Quien tiene el enlace /libro-gordo/<token> (comprado en la
// Academia Examen EUNACOM) solo puede hacer ese ensayo: sin menú ni navegación de la app. Salir lleva a
// /oferta. Acceso y tokens: api/_libro-gordo.js; crear/revocar enlaces: scripts/libro-gordo/links.mjs.

const ERRORS = {
    not_found: ['Enlace no válido', 'Este enlace de Libro Gordo no existe. Revisa que lo hayas copiado completo.'],
    revoked: ['Enlace desactivado', 'Este enlace ya no está activo. Si crees que es un error, escríbenos.'],
    claimed_by_other: ['Enlace asociado a otra cuenta', 'Este Libro Gordo ya se activó con otra cuenta. Inicia sesión con la cuenta con la que lo activaste.'],
    book_not_in_link: ['Libro no incluido', 'Este enlace no incluye ese Libro Gordo.'],
}

const page = { minHeight: '100vh', background: 'var(--surface-900)', color: 'var(--surface-50)' }
const wrap = { maxWidth: 760, margin: '0 auto', padding: '1.25rem 1rem 3rem' }

function LockedHeader({ onExit }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.25rem', background: 'var(--surface-800)', borderBottom: '1px solid var(--surface-700)' }}>
            <EunacomLogo size={28} textColor="var(--surface-50)" />
            <button onClick={onExit} style={{ background: 'transparent', border: '1px solid var(--surface-600)', color: 'var(--surface-200)', borderRadius: 8, padding: '0.4rem 0.8rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                Salir
            </button>
        </div>
    )
}

function ModeButton({ tone, icon, title, badge, text, onClick, disabled }) {
    const c = tone === 'amber'
        ? { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.35)', hover: '#fbbf24', icon: '#fde68a', iconBg: 'rgba(245, 158, 11, 0.25)' }
        : { bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.35)', hover: '#818cf8', icon: '#a5b4fc', iconBg: 'rgba(99, 102, 241, 0.25)' }
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                display: 'flex', gap: '1rem', padding: '1.25rem', width: '100%',
                background: `linear-gradient(135deg, ${c.bg} 0%, rgba(15, 23, 42, 0.7) 100%)`,
                border: `1px solid ${c.border}`, borderRadius: 16, cursor: disabled ? 'wait' : 'pointer', textAlign: 'left',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = c.hover; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.transform = 'none' }}
        >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: c.iconBg, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.icon, flexShrink: 0 }}>
                {icon}
            </div>
            <div>
                <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '1rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {title} <span className={`promax-badge-pill promax-badge-${tone === 'amber' ? 'amber' : 'indigo'}`}>{badge}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.45 }}>{text}</div>
            </div>
        </button>
    )
}

const parseJson = (v, fallback) => {
    if (!v) return fallback
    try { return typeof v === 'string' ? JSON.parse(v) : v } catch { return fallback }
}

export default function LibroGordo() {
    const { token } = useParams()
    const navigate = useNavigate()
    const { search } = useLocation()
    const { user, loading: authLoading, openAuthModal } = useAuth()
    const [state, setState] = useState({ loading: true })
    const [selectedBook, setSelectedBook] = useState(null)
    const [starting, setStarting] = useState(false)

    const exit = () => navigate('/oferta')

    useEffect(() => {
        if (authLoading) return
        if (!user) { setState({ loading: false, needsLogin: true }); return }
        try { sessionStorage.removeItem('eunacom_auth_return') } catch {}
        let cancelled = false
        setState({ loading: true })
        fetchLibroGordoLink(token, user.id).then(data => {
            if (cancelled) return
            setState({ loading: false, ...data })
            // ?libro= al volver de un ensayo del Gran Libro Gordo
            const wanted = new URLSearchParams(search).get('libro')
            setSelectedBook(data.books?.length === 1 ? data.books[0] : (data.books || []).find(b => b.key === wanted) || null)
        })
        return () => { cancelled = true }
    }, [token, user?.id, authLoading])

    const login = mode => {
        // Google vuelve a esta página en vez del dashboard (AuthContext.signInWithGoogle)
        try { sessionStorage.setItem('eunacom_auth_return', `/libro-gordo/${token}`) } catch {}
        openAuthModal(mode, 'Crea tu cuenta o inicia sesión para usar tu Libro Gordo online. Tus puntajes quedan guardados en tu cuenta.')
    }

    const runState = (book, questions, extra) => ({
        questions,
        locked: { token, book: book.key, bookName: book.name, returnTo: `/libro-gordo/${token}?libro=${book.key}` },
        ...extra,
    })

    const loadQuestions = async book => {
        const res = await fetchLibroGordoQuestions(book.key, user.id, token)
        if (res.error) { setState(s => ({ ...s, error: res.error })); return null }
        return res.data
    }

    const start = async (book, mode) => {
        setStarting(true)
        try {
            const questions = await loadQuestions(book)
            if (!questions?.length) return
            const testId = `lg-${book.key}-${genId()}`
            const timeLimitSeconds = mode === 'exam' ? questions.length * 60 : 0
            await createTest({ id: testId, userId: user.id, mode, timeLimitSeconds, totalQuestions: questions.length, questions: questions.map(q => q.id) })
            navigate(`/libro-gordo/${token}/examen`, { state: runState(book, questions, { testId, mode, isSimulation: mode === 'exam', timeLimitSeconds }) })
        } catch (e) {
            alert('Error: ' + (e.message || String(e)))
        } finally {
            setStarting(false)
        }
    }

    const openAttempt = async (book, attempt) => {
        setStarting(true)
        try {
            const questions = await loadQuestions(book)
            if (!questions?.length) return
            const done = attempt.status === 'completed'
            navigate(`/libro-gordo/${token}/examen`, {
                state: runState(book, questions, {
                    testId: attempt.id,
                    mode: attempt.mode,
                    isSimulation: attempt.mode === 'exam',
                    startFinished: done,
                    timeLimitSeconds: attempt.time_limit_seconds || 0,
                    timeLeftSeconds: attempt.time_left_seconds ?? undefined,
                    tutorState: parseJson(attempt.tutor_state, null),
                    savedIndex: attempt.current_question_index || 0,
                    savedAnswers: parseJson(attempt.answers, {}),
                })
            })
        } finally {
            setStarting(false)
        }
    }

    if (authLoading || state.loading || starting) return <LoadingScreen context="test" message={starting ? 'Preparando tu Libro Gordo...' : undefined} />

    if (state.needsLogin) {
        return (
            <div style={page}>
                <LockedHeader onExit={exit} />
                <div style={{ ...wrap, textAlign: 'center', paddingTop: '3rem' }}>
                    <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(56,189,248,0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                        <BookOpen size={30} color="#38bdf8" />
                    </div>
                    <h1 style={{ fontSize: '1.7rem', fontWeight: 900, margin: '0 0 0.5rem' }}>Tu Libro Gordo online</h1>
                    <p style={{ color: 'var(--surface-300)', maxWidth: 460, margin: '0 auto 1.75rem', lineHeight: 1.55 }}>
                        Responde las 90 preguntas en modo tutor o simulacro cronometrado. Crea tu cuenta gratis o inicia sesión para empezar: tus puntajes quedan guardados.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 340, margin: '0 auto' }}>
                        <button className="btn-primary btn-primary--full" onClick={() => login('register')} style={{ padding: '0.95rem', borderRadius: 12, fontWeight: 800 }}>Crear cuenta</button>
                        <button onClick={() => login('login')} style={{ padding: '0.95rem', borderRadius: 12, fontWeight: 700, background: 'transparent', border: '1px solid var(--surface-600)', color: 'var(--surface-100)', cursor: 'pointer' }}>Ya tengo cuenta</button>
                    </div>
                </div>
            </div>
        )
    }

    if (state.error) {
        const [title, text] = ERRORS[state.error] || ['No pudimos abrir tu Libro Gordo', 'Intenta de nuevo en unos minutos.']
        return (
            <div style={page}>
                <LockedHeader onExit={exit} />
                <div style={{ ...wrap, textAlign: 'center', paddingTop: '3rem' }}>
                    <Lock size={40} color="#f87171" style={{ marginBottom: '1rem' }} />
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0 0 0.5rem' }}>{title}</h1>
                    <p style={{ color: 'var(--surface-300)', maxWidth: 460, margin: '0 auto 1.75rem', lineHeight: 1.55 }}>{text}</p>
                    <button className="btn-primary" onClick={exit} style={{ padding: '0.9rem 1.5rem', borderRadius: 12, fontWeight: 800 }}>Conoce EUNACOMapp</button>
                </div>
            </div>
        )
    }

    const multi = state.books.length > 1
    const attemptsFor = key => (state.attempts || []).filter(a => a.book === key)

    return (
        <div style={page}>
            <LockedHeader onExit={exit} />
            <div style={wrap}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(245,158,11,0.15)', color: '#fbbf24', fontWeight: 800, fontSize: '0.75rem', padding: '4px 12px', borderRadius: 9999, marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                    <BookOpen size={13} /> LIBRO GORDO ONLINE
                </div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 0.35rem' }}>{selectedBook && multi ? selectedBook.name : state.bookName}</h1>
                <p style={{ color: 'var(--surface-300)', margin: '0 0 1.5rem' }}>
                    {multi && !selectedBook ? 'Elige la especialidad que quieres rendir. Cada Libro Gordo tiene 90 preguntas.' : 'Elige cómo quieres rendirlo. Tus resultados quedan guardados en tu cuenta.'}
                </p>

                {multi && !selectedBook && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '0.75rem' }}>
                        {state.books.map(b => {
                            const done = attemptsFor(b.key).find(a => a.status === 'completed')
                            return (
                                <button key={b.key} onClick={() => setSelectedBook(b)} className="card" style={{ textAlign: 'left', padding: '1rem', borderRadius: 14, cursor: 'pointer', border: '1px solid var(--surface-700)' }}>
                                    <div style={{ fontWeight: 800, color: 'var(--surface-50)', marginBottom: 4 }}>{b.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--surface-400)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {b.questions} preguntas
                                        {done && <span style={{ color: '#10b981', fontWeight: 700 }}>· {done.score}%</span>}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                )}

                {selectedBook && (
                    <>
                        {multi && (
                            <button onClick={() => setSelectedBook(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: 'var(--primary-400)', fontWeight: 700, cursor: 'pointer', padding: 0, marginBottom: '1rem' }}>
                                <ArrowLeft size={16} /> Otras especialidades
                            </button>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.75rem' }}>
                            <ModeButton
                                tone="indigo" icon={<GraduationCap size={22} />} title="Modo Tutor" badge="Recomendado" disabled={starting}
                                text="Sin límite de tiempo. Obtén pistas y explicaciones en tiempo real para aprender de tus errores al instante."
                                onClick={() => start(selectedBook, 'tutor')}
                            />
                            <ModeButton
                                tone="amber" icon={<Clock size={22} />} title="Modo Simulacro" badge="Cronometrado" disabled={starting}
                                text={`Igual que el EUNACOM. Tiempo calculado (${selectedBook.questions} minutos). Sin pistas hasta el final de la prueba.`}
                                onClick={() => start(selectedBook, 'exam')}
                            />
                        </div>

                        {attemptsFor(selectedBook.key).length > 0 && (
                            <div className="card" style={{ borderRadius: 16, padding: '1.1rem 1.25rem' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--surface-400)', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>TUS INTENTOS</div>
                                {attemptsFor(selectedBook.key).map(a => {
                                    const done = a.status === 'completed'
                                    return (
                                        <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '0.6rem 0', borderTop: '1px solid var(--surface-700)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                {done ? <CheckCircle size={18} color="#10b981" /> : <AlertCircle size={18} color="#fbbf24" />}
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                                                        {a.mode === 'exam' ? 'Simulacro' : 'Tutor'} · {done ? `${a.score}%` : 'en curso'}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--surface-400)' }}>{new Date(String(a.created_at).replace(' ', 'T') + 'Z').toLocaleDateString('es-CL')}</div>
                                                </div>
                                            </div>
                                            <button onClick={() => openAttempt(selectedBook, a)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.35)', color: '#38bdf8', borderRadius: 8, padding: '0.4rem 0.8rem', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                                                <PlayCircle size={15} /> {done ? 'Revisar' : 'Continuar'}
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

// /libro-gordo/:token/examen — el TestRunner sin el layout de la app. Sin estado (p. ej. al recargar) vuelve al inicio del enlace.
export function LibroGordoRunner() {
    const { token } = useParams()
    const location = useLocation()
    if (!location.state?.locked || !location.state?.questions?.length) return <Navigate to={`/libro-gordo/${token}`} replace />
    return <TestRunner />
}
