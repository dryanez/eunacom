// Landing solo de la Reconstrucción EUNACOM Julio 2026 (destino del QR de los libros y de los correos del mes).
// Gratis con cualquier plan (→ /oferta) o suelta a $12.999 (→ /biblioteca?add=rec-JUL2026). Alianza EUNACOM App × AEE.
import '../styles/reconJulio2026.css'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageSeo } from '../lib/seo'
import { RECON_JUL2026, isReleased, fmtClp } from '../config/tienda'

const UTM = typeof window !== 'undefined' ? window.location.search : ''
const withUtm = (path) => path + (UTM ? (path.includes('?') ? '&' : '?') + UTM.slice(1) : '')
const SPECS = [['Pediatría', 26], ['Psiquiatría', 20], ['Obstetricia', 16], ['Ginecología', 14], ['Gastroenterología', 13], ['Neumología', 11], ['Cardiología', 10],
  ['Salud Pública', 8], ['Endocrinología', 7], ['Diabetes', 7], ['Traumatología', 7], ['Cirugía', 6], ['Urología', 6], ['Infectología', 6], ['Neurología', 5],
  ['Otorrino', 5], ['Reumatología', 3], ['Nefrología', 3], ['Hematología', 3], ['Dermatología', 2], ['Oftalmología', 2]]
const L = 'ABCDE'

function Sample() {
  const [q, setQ] = useState(null)
  const [pick, setPick] = useState(null)
  useEffect(() => { fetch('/data/reconstrucciones/eunacom-jul-2026.json').then(r => r.json()).then(d => setQ(d.questions[0])).catch(() => {}) }, [])
  if (!q) return null
  const ok = String(q.correctAnswer).toUpperCase()
  return (
    <div className="rj-q">
      <div className="rj-k">Pregunta 1 de 180 · EUNACOM julio 2026</div>
      <p className="rj-stem">{q.question}</p>
      <div className="rj-opts">
        {q.options.map((o, i) => {
          const id = L[i], cls = pick ? (id === ok ? 'ok' : id === pick ? 'bad' : '') : ''
          return <button key={id} disabled={!!pick} className={'rj-opt ' + cls} onClick={() => setPick(id)}><i>{id}</i><span>{o}</span></button>
        })}
      </div>
      {pick && <div className="rj-exp"><b>{pick === ok ? 'Correcto. ' : `La correcta es la ${ok}. `}</b>{q.explanation}</div>}
      {pick && <p className="rj-more">Quedan 179, cada una con su explicación.</p>}
    </div>
  )
}

export default function ReconJulio2026() {
  usePageSeo({
    title: 'Reconstrucción EUNACOM Julio 2026 · 180 preguntas explicadas | EUNACOM App',
    description: 'Las 180 preguntas del EUNACOM de julio 2026 con la explicación de cada respuesta. Gratis con cualquier plan de EUNACOM App o suelta a $12.999.',
    canonical: 'https://www.eunacomapp.cl/reconstruccion-julio-2026',
  })
  useEffect(() => {
    window.scrollTo(0, 0)
    if (!document.getElementById('rj-font')) { const l = document.createElement('link'); l.id = 'rj-font'; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&display=swap'; document.head.appendChild(l) }
  }, [])
  const out = isReleased(RECON_JUL2026)
  const plans = withUtm('/oferta'), single = withUtm('/biblioteca?add=' + RECON_JUL2026.sku) + '#reconstruccion-julio-2026'
  const max = SPECS[0][1]

  return (
    <div className="rj">
      <header className="rj-top">
        <Link to="/" className="rj-duo" aria-label="EUNACOM App">
          <img src="/logo.png" alt="" width="30" height="30" /><span className="rj-app">eunacom<b>app</b></span>
          <span className="rj-x">×</span><img src="/aee-logo.svg" alt="Academia Examen EUNACOM" className="rj-aee" /><span className="rj-aee-t"><b>AEE</b><small>Academia Examen EUNACOM</small></span>
        </Link>
        <Link to="/login" className="rj-login">Entrar</Link>
      </header>

      <section className="rj-hero">
        <div>
          <div className="rj-k">{out ? 'Nueva · ya disponible' : 'Nueva · disponible desde el 16 de noviembre'}</div>
          <h1>Reconstrucción EUNACOM <span>Julio</span> <em>2026</em></h1>
          <p className="rj-lead">Las 180 preguntas del examen de julio 2026, reconstruidas por Mario Sánchez, con la explicación de cada respuesta. La última reconstrucción antes de tu examen.</p>
          <div className="rj-price">
            <div><span className="rj-free">Gratis</span><small>con cualquier plan de EUNACOM App</small></div>
            <div className="rj-or">o suelta a <b>{fmtClp(RECON_JUL2026.price)}</b></div>
          </div>
          <div className="rj-ctas">
            <Link className="rj-btn" to={plans}>Ver planes y llevármela gratis</Link>
            <Link className="rj-btn ghost" to={single}>Comprar solo la reconstrucción</Link>
          </div>
          {!out && <p className="rj-note">Si eliges tu plan hoy, la reconstrucción aparece sola en tu biblioteca el 16 de noviembre.</p>}
        </div>
        <img className="rj-cover" src={RECON_JUL2026.cover} alt="Portada Reconstrucción EUNACOM Julio 2026" />
      </section>

      <section className="rj-sec">
        <h2>Pruébala ahora</h2>
        <Sample />
      </section>

      <section className="rj-sec rj-grid2">
        <div>
          <h2>Qué trae</h2>
          <ul className="rj-list">
            <li><b>Las 180 preguntas</b> del EUNACOM de julio 2026, completas y con sus alternativas.</li>
            <li><b>La explicación de cada respuesta</b>, y por qué las otras alternativas no.</li>
            <li><b>Modo examen</b> cronometrado en la app, con tu puntaje y tus errores para repasar.</li>
            <li><b>El libro en PDF</b> en tu biblioteca, con solucionario aparte y el índice por código con link a cada clase.</li>
          </ul>
        </div>
        <div>
          <h2>Qué preguntaron</h2>
          <div className="rj-bars">
            {SPECS.map(([n, v]) => (
              <div key={n} className="rj-bar"><span>{n}</span><i style={{ width: `${100 * v / max}%` }} /><b>{v}</b></div>
            ))}
          </div>
        </div>
      </section>

      <section className="rj-sec rj-ally">
        <div className="rj-k">Una alianza para tu EUNACOM</div>
        <h2>EUNACOM App × Academia Examen EUNACOM</h2>
        <p>Los libros y las clases en video de Academia Examen EUNACOM ahora vienen dentro de EUNACOM App: estudias el tema en el libro, lo ves en video y lo practicas con preguntas reales en la misma app.</p>
        <div className="rj-stats">
          <div><b>+47.000</b><span>preguntas</span></div>
          <div><b>+650</b><span>clases en video</span></div>
          <div><b>18</b><span>reconstrucciones 2013–2026</span></div>
          <div><b>21</b><span>tomos del Perfil V3</span></div>
        </div>
      </section>

      <section className="rj-sec rj-faq">
        <h2>Preguntas frecuentes</h2>
        <details><summary>¿Ya tengo un plan. Tengo que hacer algo?</summary><p>No. La reconstrucción se agrega sola a tu biblioteca{out ? '' : ' el 16 de noviembre'}; la encuentras en Reconstrucciones y en Biblioteca.</p></details>
        <details><summary>¿Puedo comprar solo la reconstrucción?</summary><p>Sí, a {fmtClp(RECON_JUL2026.price)}{out ? '' : ' desde el 16 de noviembre'}. Si después tomas un plan, igual tienes todo lo demás.</p></details>
        <details><summary>¿Quién la reconstruyó?</summary><p>Mario Sánchez, que dio el examen en julio 2026. Nuestro equipo revisó cada pregunta y escribió las explicaciones.</p></details>
        <details><summary>¿Qué incluye un plan?</summary><p>Todas las preguntas, las clases en video, los simulacros, las 18 reconstrucciones y los libros de tu plan. Los ves en <Link to={plans}>la página de planes</Link>.</p></details>
      </section>

      <section className="rj-end">
        <h2>Llévatela gratis con tu plan</h2>
        <Link className="rj-btn" to={plans}>Ver planes</Link>
      </section>
    </div>
  )
}
