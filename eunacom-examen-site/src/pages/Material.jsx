// Generated from the design bundle by scripts/generate-pages.py.
// Edit the design or the generator, not this file by hand.
import React, { Fragment } from 'react';

export default function Material(v) {
  const { irCursos, material } = v;
  return (<>

<div>
  <section style={{"background": "#0b5ea8"}}>
    <div style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "46px 36px"}}>
      <h1 style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "800", "fontSize": "clamp(30px,3.4vw,42px)", "lineHeight": "1.15", "color": "#fff", "margin": "0 0 8px"}}>Material y pruebas gratis
      </h1>
      <div style={{"fontSize": "14.5px", "color": "#bcdcf7"}}>Inicio · Material y pruebas gratis
      </div>
    </div>
  </section>
  <section style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "48px 36px 0"}}>
    <p style={{"fontSize": "16.5px", "lineHeight": "1.85", "color": "#5f6b76", "margin": "0 0 14px", "maxWidth": "78ch"}}>En esta sección encontrarás pruebas de las distintas especialidades que entran en el EUNACOM, excepto geriatría, que está contenida en las demás. Algunas pruebas tienen preguntas de más de un tema, por lo que estarán repetidas. Además, hay algunas preguntas obsoletas o con errores; en general están bien hechas y son muy útiles para aprender y mejorar tu puntaje.
    </p>
    <p style={{"fontSize": "16.5px", "lineHeight": "1.85", "color": "#5f6b76", "margin": "0 0 40px", "maxWidth": "78ch"}}>Las últimas pruebas de cada tema son las más actuales, por lo que recomiendo empezar por ellas. El último capítulo contiene pruebas más grandes, que agrupan un mayor número de contenidos y además incluyen ensayos y reconstrucciones del EUNACOM.
    </p>
    <div style={{"border": "1px solid #dae8f4", "borderRadius": "5px", "overflow": "hidden", "boxShadow": "0 3px 14px rgba(8,54,95,.06)"}}>
      <div style={{"background": "#eef5fb", "borderBottom": "1px solid #dae8f4", "display": "grid", "gridTemplateColumns": "minmax(150px,1.3fr) 90px minmax(150px,1fr) 130px", "gap": "24px", "padding": "13px 24px", "fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "11.5px", "letterSpacing": ".09em", "textTransform": "uppercase", "color": "#0b5ea8"}}>
        <span>Especialidad
        </span>
        <span>Pruebas
        </span>
        <span>Contenidos
        </span>
        <span style={{"textAlign": "right"}}>Descarga
        </span>
      </div>
      {(material || []).map((m, _i) => (<Fragment key={_i}>
        <div style={{"display": "grid", "gridTemplateColumns": "minmax(150px,1.3fr) 90px minmax(150px,1fr) 130px", "gap": "24px", "alignItems": "center", "padding": "15px 24px", "borderBottom": "1px solid #e8f0f7"}}>
          <div style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "600", "fontSize": "15.5px", "color": "#2f3e4d"}}>{m.tema}
          </div>
          <div style={{"fontSize": "13.5px", "color": "#8195a7"}}>{m.cantidad}
          </div>
          <div style={{"fontSize": "13.5px", "lineHeight": "1.6", "color": "#5f6b76"}}>{m.nota}
          </div>
          <a href="#" style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "12.5px", "letterSpacing": ".06em", "textTransform": "uppercase", "justifySelf": "end"}}>Descargar ↓
          </a>
        </div>
      </Fragment>))}
    </div>
  </section>
  <section style={{"marginTop": "56px", "background": "#eef5fb", "borderTop": "1px solid #dae8f4", "borderBottom": "1px solid #dae8f4"}}>
    <div style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "52px 36px", "display": "grid", "gridTemplateColumns": "minmax(0,1fr) minmax(240px,300px)", "gap": "48px", "alignItems": "center"}}>
      <div>
        <h2 style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "400", "fontSize": "28px", "color": "#08365f", "margin": "0 0 6px"}}>Las respuestas 
          <span style={{"fontWeight": "800"}}>comentadas
          </span> están en el banco
        </h2>
        <div style={{"width": "48px", "height": "3px", "background": "#0b5ea8", "marginBottom": "16px"}}>
        </div>
        <p style={{"fontSize": "16px", "lineHeight": "1.8", "color": "#5f6b76", "margin": "0", "maxWidth": "60ch"}}>Estas pruebas te sirven para medirte. Entender por qué cada distractor está mal es otra cosa: eso está en el banco de 4.000 preguntas comentadas, incluido en todos los cursos teóricos.
        </p>
      </div>
      <button onClick={irCursos} style={{"justifySelf": "start", "fontFamily": "'Montserrat',sans-serif", "fontSize": "12.5px", "fontWeight": "700", "letterSpacing": ".08em", "textTransform": "uppercase", "background": "#0b5ea8", "color": "#fff", "border": "none", "padding": "15px 26px", "borderRadius": "3px", "cursor": "pointer"}}>Ver cursos y precios
      </button>
    </div>
  </section>
</div>
  </>);
}
