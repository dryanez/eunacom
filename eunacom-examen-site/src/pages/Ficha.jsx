// Generated from the design bundle by scripts/generate-pages.py.
// Edit the design or the generator, not this file by hand.
import React, { Fragment } from 'react';

export default function Ficha(v) {
  const { comprarFicha, ficha, irContacto, irCursos } = v;
  return (<>

<div>
  <section style={{"background": "#0b5ea8"}}>
    <div style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "44px 36px"}}>
      <div style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "12px", "letterSpacing": ".12em", "textTransform": "uppercase", "color": "#a9d3f5", "marginBottom": "12px"}}>{ficha.kicker}
      </div>
      <h1 style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "800", "fontSize": "clamp(28px,3.2vw,40px)", "lineHeight": "1.18", "color": "#fff", "margin": "0 0 10px", "maxWidth": "30ch"}}>{ficha.nombre}
      </h1>
      <button onClick={irCursos} style={{"background": "none", "border": "none", "padding": "0", "cursor": "pointer", "fontSize": "14px", "color": "#bcdcf7"}}>Inicio · Cursos y precios · esta ficha
      </button>
    </div>
  </section>
  <section style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "48px 36px 0"}}>
    <div style={{"display": "grid", "gridTemplateColumns": "minmax(0,1fr) minmax(260px,340px)", "gap": "52px", "alignItems": "start"}}>
      <div>
        <div style={{"fontSize": "17px", "lineHeight": "1.85", "color": "#5f6b76", "display": "flex", "flexDirection": "column", "gap": "16px", "marginBottom": "38px"}}>
          {(ficha.intro || []).map((p, _i) => (<Fragment key={_i}>
            <p style={{"margin": "0"}}>{p.t}
            </p>
          </Fragment>))}
        </div>
        <h2 style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "400", "fontSize": "26px", "color": "#08365f", "margin": "0 0 6px"}}>Qué 
          <span style={{"fontWeight": "800"}}>incluye
          </span>
        </h2>
        <div style={{"width": "48px", "height": "3px", "background": "#0b5ea8", "marginBottom": "22px"}}>
        </div>
        <div style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(280px,1fr))", "gap": "0 32px", "marginBottom": "40px"}}>
          {(ficha.incluye || []).map((i, _i) => (<Fragment key={_i}>
            <div style={{"display": "flex", "gap": "11px", "alignItems": "baseline", "padding": "11px 0", "borderBottom": "1px solid #e8f0f7"}}>
              <span style={{"color": "#0b5ea8", "fontSize": "12px"}}>▸
              </span>
              <span style={{"fontSize": "15px", "lineHeight": "1.6", "color": "#41556b"}}>{i.t}
              </span>
            </div>
          </Fragment>))}
        </div>
        <h2 style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "400", "fontSize": "26px", "color": "#08365f", "margin": "0 0 6px"}}>Cómo funciona la 
          <span style={{"fontWeight": "800"}}>modalidad
          </span>
        </h2>
        <div style={{"width": "48px", "height": "3px", "background": "#0b5ea8", "marginBottom": "22px"}}>
        </div>
        <div style={{"fontSize": "16px", "lineHeight": "1.85", "color": "#5f6b76", "display": "flex", "flexDirection": "column", "gap": "14px", "marginBottom": "26px"}}>
          {(ficha.comoFunciona || []).map((p, _i) => (<Fragment key={_i}>
            <p style={{"margin": "0"}}>{p.t}
            </p>
          </Fragment>))}
        </div>
        <div style={{"background": "#eef5fb", "borderLeft": "4px solid #0b5ea8", "padding": "22px 24px", "marginBottom": "40px"}}>
          <div style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "14px", "color": "#08365f", "marginBottom": "8px"}}>A quién le sirve
          </div>
          <p style={{"fontSize": "15px", "lineHeight": "1.75", "color": "#41556b", "margin": "0"}}>{ficha.paraQuien}
          </p>
        </div>
        <h2 style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "400", "fontSize": "26px", "color": "#08365f", "margin": "0 0 6px"}}>
          <span style={{"fontWeight": "800"}}>Temario
          </span> y calendario
        </h2>
        <div style={{"width": "48px", "height": "3px", "background": "#0b5ea8", "marginBottom": "12px"}}>
        </div>
        <p style={{"fontSize": "14.5px", "color": "#8195a7", "margin": "0 0 22px"}}>{ficha.temarioNota}
        </p>
        <div style={{"border": "1px solid #dae8f4", "borderRadius": "5px", "overflow": "hidden"}}>
          {(ficha.temario || []).map((t, _i) => (<Fragment key={_i}>
            <div style={{"display": "grid", "gridTemplateColumns": "minmax(110px,150px) minmax(0,1fr)", "gap": "20px", "padding": "15px 20px", "borderBottom": "1px solid #e8f0f7", "alignItems": "baseline"}}>
              <div style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "12.5px", "letterSpacing": ".05em", "textTransform": "uppercase", "color": "#0b5ea8"}}>{t.semana}
              </div>
              <div>
                <div style={{"fontSize": "15.5px", "color": "#2f3e4d", "marginBottom": "3px"}}>{t.tema}
                </div>
                <div style={{"fontSize": "13.5px", "lineHeight": "1.6", "color": "#8195a7"}}>{t.detalle}
                </div>
              </div>
            </div>
          </Fragment>))}
        </div>
      </div>
      <div style={{"display": "flex", "flexDirection": "column", "gap": "18px", "position": "sticky", "top": "110px"}}>
        <div style={{"border": "1px solid #dae8f4", "borderRadius": "5px", "overflow": "hidden", "boxShadow": "0 3px 14px rgba(8,54,95,.08)"}}>
          <div style={{"background": "#eef5fb", "borderBottom": "1px solid #dae8f4", "padding": "12px 22px", "fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "11.5px", "letterSpacing": ".1em", "textTransform": "uppercase", "color": "#0b5ea8"}}>Valor del curso
          </div>
          <div style={{"padding": "22px"}}>
            <div style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "800", "fontSize": "32px", "lineHeight": "1.1", "color": "#08365f"}}>{ficha.precioClp}
            </div>
            <div style={{"fontSize": "14px", "color": "#8195a7", "marginBottom": "16px"}}>{ficha.precioUsd}
            </div>
            <div style={{"fontSize": "13.5px", "lineHeight": "1.7", "color": "#5f6b76", "borderTop": "1px solid #e8f0f7", "paddingTop": "14px", "marginBottom": "18px"}}>{ficha.precioNota}
            </div>
            <button onClick={comprarFicha} style={{"width": "100%", "fontFamily": "'Montserrat',sans-serif", "fontSize": "13px", "fontWeight": "700", "letterSpacing": ".08em", "textTransform": "uppercase", "background": "#0b5ea8", "color": "#fff", "border": "none", "padding": "15px", "borderRadius": "3px", "cursor": "pointer", "marginBottom": "10px"}} className="hv-20">Matricularme ahora
            </button>
            <button onClick={irContacto} style={{"width": "100%", "fontFamily": "'Montserrat',sans-serif", "fontSize": "12.5px", "fontWeight": "700", "letterSpacing": ".08em", "textTransform": "uppercase", "background": "none", "color": "#0b5ea8", "border": "2px solid #0b5ea8", "padding": "12px", "borderRadius": "3px", "cursor": "pointer"}}>Tengo dudas
            </button>
          </div>
        </div>
        <div style={{"background": "#eef5fb", "border": "1px solid #dae8f4", "borderRadius": "5px", "padding": "20px 22px", "fontSize": "13.5px", "lineHeight": "1.75", "color": "#5f6b76"}}>
          <div style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "14px", "color": "#08365f", "marginBottom": "8px"}}>Datos del curso
          </div>
          <div style={{"display": "flex", "flexDirection": "column", "gap": "6px"}}>
            <span>
              <span style={{"color": "#8195a7"}}>Duración · 
              </span>{ficha.duracion}
            </span>
            <span>
              <span style={{"color": "#8195a7"}}>Inicio · 
              </span>{ficha.inicio}
            </span>
            <span>
              <span style={{"color": "#8195a7"}}>Término · 
              </span>{ficha.termino}
            </span>
            <span>
              <span style={{"color": "#8195a7"}}>Examen · 
              </span>{ficha.examen}
            </span>
            <span>
              <span style={{"color": "#8195a7"}}>Modalidad · 
              </span>{ficha.modalidad}
            </span>
            <span>
              <span style={{"color": "#8195a7"}}>Cupos · 
              </span>{ficha.cupos}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section style={{"marginTop": "60px", "background": "linear-gradient(105deg,#0a4c86 0%,#0b5ea8 60%,#1479c9 100%)"}}>
    <div style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "48px 36px", "display": "grid", "gridTemplateColumns": "minmax(0,1fr) minmax(240px,300px)", "gap": "48px", "alignItems": "center"}}>
      <div>
        <h2 style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "800", "fontSize": "28px", "lineHeight": "1.25", "color": "#fff", "margin": "0 0 10px", "maxWidth": "28ch"}}>{ficha.cierreTitulo}
        </h2>
        <p style={{"fontSize": "15.5px", "lineHeight": "1.75", "color": "#c8e0f7", "margin": "0", "maxWidth": "56ch"}}>{ficha.cierreTexto}
        </p>
      </div>
      <button onClick={comprarFicha} style={{"justifySelf": "start", "fontFamily": "'Montserrat',sans-serif", "fontSize": "13px", "fontWeight": "700", "letterSpacing": ".08em", "textTransform": "uppercase", "background": "#fff", "color": "#0b5ea8", "border": "none", "padding": "16px 30px", "borderRadius": "3px", "cursor": "pointer"}}>Matricularme ahora
      </button>
    </div>
  </section>
</div>
  </>);
}
