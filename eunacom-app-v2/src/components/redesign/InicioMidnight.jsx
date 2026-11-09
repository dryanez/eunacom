import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Database, PlayCircle, BookOpen, Archive, ChevronRight, PenLine, Flame,
  Layers, Timer, RotateCcw, CalendarDays, Image as ImageIcon,
} from 'lucide-react'
import './midnight.css'

// Cifras reales (nov-2026): Turso eunacom_questions = 47.271; Biblioteca ≈ 100 libros
// (21 tomos, 21 Repaso Final, 19 Atlas, 23 Libros Gordos, 16 reconstrucciones + Gran Libro, Perfil V3).
const TILES = [
  { to: '/test', icon: Database, value: '47.000+', label: 'Banco de preguntas', tone: 'blue' },
  { to: '/mis-clases', icon: PlayCircle, value: '650+', label: 'Clases · 4 módulos', tone: 'green' },
  { to: '/biblioteca', icon: BookOpen, value: '~100 libros', label: 'Biblioteca', tone: 'amber' },
  { to: '/reconstructions', icon: Archive, value: '16 exámenes', label: 'Reconstrucciones', tone: 'violet' },
]

const MORE = [
  { to: '/flashcards', icon: Layers, title: 'Flashcards', sub: '21 mazos Anki AEE · por especialidad' },
  { to: '/simulation', icon: Timer, title: 'Simulación', sub: 'Examen completo con tiempo' },
  { to: '/review', icon: RotateCcw, title: 'Repasar errores', sub: 'Tus preguntas falladas, por tema' },
  { to: '/study-plan', icon: CalendarDays, title: 'Plan de estudio', sub: 'Lo que toca hoy hasta el examen' },
  { to: '/biblioteca?sec=atlas', icon: ImageIcon, title: '19 Atlas de imágenes', sub: '1.144 fotos comentadas' },
]

export default function InicioMidnight({ name, streak = 0, accuracy = 0, todayAnswers = 0, dailyGoal = 50 }) {
  const navigate = useNavigate()
  const go = to => () => navigate(to)
  const dailyPct = Math.min(100, Math.round((todayAnswers / dailyGoal) * 100))

  return (
    <section className="mn-inicio">
      <div className="mn-row mn-between">
        <div>
          <h1 className="mn-h1">Hola, {name || 'Doctor'}</h1>
          <p className="mn-sub">Continúa tu preparación para el EUNACOM</p>
        </div>
        {streak > 0 && (
          <span className="mn-streak"><Flame size={15} />{streak}</span>
        )}
      </div>

      <div className="mn-card">
        <div className="mn-sub">Tu dominio general</div>
        <div className="mn-row mn-between">
          <span className="mn-big">{accuracy}%</span>
          <span className="mn-sub">Hoy: {todayAnswers} / {dailyGoal} preguntas</span>
        </div>
        <div className="mn-bar"><b style={{ width: `${Math.max(3, dailyPct)}%` }} /></div>
      </div>

      <div className="mn-tiles">
        {TILES.map(t => (
          <button key={t.to} className={`mn-tile mn-tone-${t.tone}`} onClick={go(t.to)}>
            <ChevronRight size={16} className="mn-tile-go" />
            <span className="mn-tile-ic"><t.icon size={19} /></span>
            <b>{t.value}</b>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <button className="mn-btn" onClick={go('/test')}>
        <PenLine size={16} /> Crear test de preguntas
      </button>

      <div className="mn-card mn-list">
        {MORE.map(m => (
          <button key={m.to} className="mn-li" onClick={go(m.to)}>
            <span className="mn-ic"><m.icon size={18} /></span>
            <span className="mn-li-txt">{m.title}<small>{m.sub}</small></span>
            <ChevronRight size={16} className="mn-li-go" />
          </button>
        ))}
      </div>
    </section>
  )
}
