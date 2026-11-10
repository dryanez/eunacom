import React, { useEffect, useState } from 'react'
import { ArrowRight, PlayCircle, Database, Library, Archive, Award, BookOpen } from 'lucide-react'
import './landing-hero.css'

// Portadas reales de la Biblioteca (public/tienda → public/landing/libros, 220 px webp).
const BOOKS = [
  'cov_01', 'gordo_cardiologia', 'repaso_pediatria', 'q_recons', 'perfil_neurologia', 'atlas_dermatologia',
  'cov_08', 'gordo_ginecologia', 'repaso_cardiologia', 'cov_05', 'atlas_pediatria', 'perfil_cirugia',
  'cov_13', 'gordo_neurologia', 'repaso_obstetricia', 'cov_03', 'atlas_cardiologia', 'perfil_pediatria',
  'cov_15', 'gordo_hematologia', 'repaso_saludpublica', 'cov_11', 'atlas_neurologia', 'cov_21',
].map(n => `/landing/libros/${n}.webp`)

const CHIPS = [
  { icon: Database, value: '+47.000', label: 'preguntas' },
  { icon: PlayCircle, value: '+650', label: 'clases en video' },
  { icon: Library, value: '~100', label: 'libros' },
  { icon: Archive, value: '16', label: 'reconstrucciones' },
  { icon: Award, value: 'Perfil V3', label: '2026' },
]

function useTick(ms, n) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setI(v => (v + 1) % n), ms)
    return () => clearInterval(t)
  }, [ms, n])
  return i
}

// Pila de libros: la portada de adelante sale deslizándose y entra la siguiente.
function BookStack() {
  const i = useTick(2200, BOOKS.length)
  const at = k => BOOKS[(i + k) % BOOKS.length]
  return (
    <div className="hh-books" aria-label="Biblioteca de ~100 libros">
      <img key={`b2-${i}`} className="hh-book hh-book-3" src={at(2)} alt="" loading="lazy" />
      <img key={`b1-${i}`} className="hh-book hh-book-2" src={at(1)} alt="" loading="lazy" />
      <img key={`b0-${i}`} className="hh-book hh-book-1" src={at(0)} alt="Portada de un libro de la Biblioteca" />
      <span className="hh-books-tag"><BookOpen size={13} /> ~100 libros</span>
    </div>
  )
}

export default function LandingHero({ navigate }) {
  return (
    <section className="hh-hero">
      <div className="ln-wrap hh-grid">
        <div className="hh-copy">
          <div className="hh-pill ln-in">
            <img src="/logo.png" alt="" width="20" height="15" />
            <span>Preparación EUNACOM 2026</span>
          </div>
          <h1 className="hh-h1 ln-in ln-d1">
            Curso y plataforma EUNACOM <span className="ln-grad">#1 en Chile</span>
          </h1>
          <p className="hh-lead ln-in ln-d2">
            El estándar de preparación médica en Chile para aprobar tu examen: curso on-demand con más de 650 clases en video (Perfil EUNACOM V3), reconstrucciones de exámenes oficiales, el banco #1 con +47.000 preguntas justificadas y plan adaptativo. Sin mensualidades abusivas.
          </p>
          <div className="hh-ctas ln-in ln-d3">
            <button type="button" className="ln-btn" onClick={() => navigate('/dashboard')}>
              Comenzar ahora <ArrowRight size={18} />
            </button>
            <a href="#planes" className="ln-btn-ghost">Planes desde $29.990</a>
          </div>
          <ul className="hh-chips ln-in ln-d4" aria-label="La plataforma en cifras">
            {CHIPS.map(({ icon: Icon, value, label }) => (
              <li key={label}><Icon size={14} /><b>{value}</b> {label}</li>
            ))}
          </ul>
        </div>

        <div className="hh-media">
          <div className="hh-glow" />
          <div className="hh-browser">
            <div className="hh-bar"><i /><i /><i /><span>Animaciones 3D de las clases</span></div>
            <video src="/landing/animaciones-loop.mp4" poster="/landing/animaciones-poster.jpg" autoPlay muted loop playsInline preload="metadata" aria-label="Animaciones 3D de las clases: aneurisma, crisis, Graves, hipertensión portal, Parkinson y TEP" />
            <div className="hh-live"><PlayCircle size={14} /> +650 clases en video</div>
          </div>
          <BookStack />
          <div className="hh-phone">
            <div className="hh-notch" />
            <div className="hh-screen"><img src="/landing/app-cardiologia.webp" alt="Pregunta de cardiología respondida en la app" /></div>
          </div>
        </div>
      </div>

      <div className="hh-shelf" aria-label="Portadas de la Biblioteca">
        <div className="hh-shelf-track">
          {[...BOOKS, ...BOOKS].map((src, k) => (
            <img key={k} src={src} alt="" loading="lazy" aria-hidden="true" />
          ))}
        </div>
      </div>
    </section>
  )
}
