// Generated from the design bundle by scripts/generate-pages.py.
// Edit the design or the generator, not this file by hand.
import React, { Fragment } from 'react';

export default function Faq(v) {
  const { faq, irContacto } = v;
  return (<>

<div>
  <section style={{"background": "#0b5ea8"}}>
    <div style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "46px 36px"}}>
      <h1 style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "800", "fontSize": "clamp(30px,3.4vw,42px)", "lineHeight": "1.15", "color": "#fff", "margin": "0 0 8px"}}>Preguntas frecuentes
      </h1>
      <div style={{"fontSize": "14.5px", "color": "#bcdcf7"}}>Inicio · Preguntas frecuentes
      </div>
    </div>
  </section>
  <section style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "48px 36px 0"}}>
    <div style={{"display": "grid", "gridTemplateColumns": "minmax(0,1fr) minmax(260px,320px)", "gap": "52px", "alignItems": "start"}}>
      <div style={{"border": "1px solid #dae8f4", "borderRadius": "5px", "overflow": "hidden", "boxShadow": "0 3px 14px rgba(8,54,95,.06)"}}>
        {(faq || []).map((f, _i) => (<Fragment key={_i}>
          <div style={{"borderBottom": "1px solid #e8f0f7"}}>
            <button onClick={f.toggle} style={f.estilo}>
              <span style={{"flex": "1", "textAlign": "left"}}>{f.q}
              </span>
              <span style={{"fontFamily": "'Montserrat',sans-serif", "fontSize": "20px", "color": "#0b5ea8", "flex": "none", "lineHeight": "1"}}>{f.icono}
              </span>
            </button>
            {f.abierta && (<>
              <div style={{"padding": "0 24px 20px", "fontSize": "15.5px", "lineHeight": "1.85", "color": "#5f6b76", "maxWidth": "76ch"}}>{f.a}
              </div>
            </>)}
          </div>
        </Fragment>))}
      </div>
      <div style={{"background": "#eef5fb", "border": "1px solid #dae8f4", "borderRadius": "5px", "padding": "28px", "position": "sticky", "top": "110px"}}>
        <div style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "18px", "color": "#08365f", "marginBottom": "12px"}}>¿Tu pregunta no está aquí?
        </div>
        <p style={{"fontSize": "15px", "lineHeight": "1.8", "color": "#5f6b76", "margin": "0 0 20px"}}>Escríbenos con tu fecha de examen y tu país de titulación. Respondemos por correo, normalmente el mismo día.
        </p>
        <button onClick={irContacto} style={{"width": "100%", "fontFamily": "'Montserrat',sans-serif", "fontSize": "12.5px", "fontWeight": "700", "letterSpacing": ".08em", "textTransform": "uppercase", "background": "#0b5ea8", "color": "#fff", "border": "none", "padding": "14px", "borderRadius": "3px", "cursor": "pointer"}}>Contáctanos
        </button>
      </div>
    </div>
  </section>
</div>
  </>);
}
