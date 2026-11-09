import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation, Navigate } from 'react-router-dom'
import { BookOpen, GraduationCap, Clock, Lock, CheckCircle, PlayCircle, ArrowLeft, AlertCircle, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { createTest, genId, fetchLibroGordoLink, fetchLibroGordoQuestions } from '../lib/api'
import { EunacomLogo } from '../components/EunacomLogo'
import LoadingScreen from '../components/LoadingScreen'
import TestRunner from './TestRunner'
import '../components/redesign/midnight.css'
import '../components/redesign/clase.css'
import '../components/redesign/misc-pages.css'

// Libros Gordos online — modo bloqueado. Quien tiene el enlace /libro-gordo/<token> (comprado en la
// Academia Examen EUNACOM) solo puede hacer ese ensayo: sin menú ni navegación de la app. Salir lleva a
// /oferta. Acceso y tokens: api/_libro-gordo.js; crear/revocar enlaces: scripts/libro-gordo/links.mjs.

const ERRORS = {
    not_found: ['Enlace no válido', 'Este enlace de Libro Gordo no existe. Revisa que lo hayas copiado completo.'],
    revoked: ['Enlace desactivado', 'Este enlace ya no está activo. Si crees que es un error, escríbenos.'],
    claimed_by_other: ['Enlace asociado a otra cuenta', 'Este Libro Gordo ya se activó con otra cuenta. Inicia sesión con la cuenta con la que lo activaste.'],
    book_not_in_link: ['Libro no incluido', 'Este enlace no incluye ese Libro Gordo.'],
}

function LockedHeader({ onExit }) {
    return (
        <div className="mn-lg-head">
            <EunacomLogo size={28} textColor="#f1f5f9" />
            <button className="mn-lg-exit" onClick={onExit}>Salir</button>
        </div>
    )
}

function ModeButton({ tone, icon, title, badge, text, onClick, disabled }) {
    return (
        <button className={`mn-lg-mode${tone === 'amber' ? ' amber' : ''}`} onClick={onClick} disabled={disabled}>
            <span className="mn-lg-mode-ic">{icon}</span>
            <span className="mn-lg-mode-t">
                <b>{title} <span className="mn-lg-badge">{badge}</span></b>
                <span>{text}</span>
            </span>
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
            <div className="mn-lg">
                <LockedHeader onExit={exit} />
                <div className="mn-lg-wrap mn-lg-center">
                    <div className="mn-mp-bigic"><BookOpen size={30} /></div>
                    <h1>Tu Libro Gordo online</h1>
                    <p>
                        Responde las 90 preguntas en modo tutor o simulacro cronometrado. Crea tu cuenta gratis o inicia sesión para empezar: tus puntajes quedan guardados.
                    </p>
                    <div className="mn-lg-btns">
                        <button className="mn-cl-nb pri" onClick={() => login('register')}>Crear cuenta</button>
                        <button className="mn-cl-nb" onClick={() => login('login')}>Ya tengo cuenta</button>
                    </div>
                </div>
            </div>
        )
    }

    if (state.error) {
        const [title, text] = ERRORS[state.error] || ['No pudimos abrir tu Libro Gordo', 'Intenta de nuevo en unos minutos.']
        return (
            <div className="mn-lg">
                <LockedHeader onExit={exit} />
                <div className="mn-lg-wrap mn-lg-center">
                    <div className="mn-mp-bigic bad"><Lock size={30} /></div>
                    <h1>{title}</h1>
                    <p>{text}</p>
                    <div className="mn-lg-btns">
                        <button className="mn-cl-nb pri" onClick={exit}>Conoce EUNACOMapp</button>
                    </div>
                </div>
            </div>
        )
    }

    const multi = state.books.length > 1
    const attemptsFor = key => (state.attempts || []).filter(a => a.book === key)

    return (
        <div className="mn-lg">
            <LockedHeader onExit={exit} />
            <div className="mn-lg-wrap">
                {selectedBook && multi && (
                    <button className="mn-cl-back" onClick={() => setSelectedBook(null)}>
                        <ArrowLeft size={16} /> Otras especialidades
                    </button>
                )}
                <header className="mn-cl-hero">
                    <div className="mn-cl-eyebrow">Libro Gordo online</div>
                    <h1 className="mn-cl-title">{selectedBook && multi ? selectedBook.name : state.bookName}</h1>
                    <p className="mn-lg-sub">
                        {multi && !selectedBook ? 'Elige la especialidad que quieres rendir. Cada Libro Gordo tiene 90 preguntas.' : 'Elige cómo quieres rendirlo. Tus resultados quedan guardados en tu cuenta.'}
                    </p>
                </header>

                {multi && !selectedBook && (
                    <div className="mn-lg-books">
                        {state.books.map(b => {
                            const done = attemptsFor(b.key).find(a => a.status === 'completed')
                            return (
                                <button key={b.key} className="mn-lg-book" onClick={() => setSelectedBook(b)}>
                                    <span className="mn-lg-book-ic"><BookOpen size={18} /></span>
                                    <span className="mn-lg-book-t">
                                        <b>{b.name}</b>
                                        <small>
                                            {b.questions} preguntas
                                            {done && <em>· {done.score}%</em>}
                                        </small>
                                    </span>
                                    <ChevronRight size={18} />
                                </button>
                            )
                        })}
                    </div>
                )}

                {selectedBook && (
                    <>
                        <div className="mn-lg-modes">
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
                            <div className="mn-mp-card">
                                <div className="mn-mp-label">Tus intentos</div>
                                {attemptsFor(selectedBook.key).map(a => {
                                    const done = a.status === 'completed'
                                    return (
                                        <div key={a.id} className="mn-lg-att">
                                            <div className="mn-lg-att-l">
                                                {done ? <CheckCircle size={18} color="#34d399" style={{ flex: 'none' }} /> : <AlertCircle size={18} color="#fbbf24" style={{ flex: 'none' }} />}
                                                <div>
                                                    <b>{a.mode === 'exam' ? 'Simulacro' : 'Tutor'} · {done ? `${a.score}%` : 'en curso'}</b>
                                                    <small>{new Date(String(a.created_at).replace(' ', 'T') + 'Z').toLocaleDateString('es-CL')}</small>
                                                </div>
                                            </div>
                                            <button className="mn-lg-attbtn" onClick={() => openAttempt(selectedBook, a)}>
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
