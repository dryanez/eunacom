// Generated from the design bundle by scripts/generate-pages.py.
// Edit the design or the generator, not this file by hand.
import React, { Fragment } from 'react';

export default function Blog(v) {
  const { categorias, posts } = v;
  return (<>

<div>
  <section style={{"background": "#0b5ea8"}}>
    <div style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "46px 36px"}}>
      <h1 style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "800", "fontSize": "clamp(30px,3.4vw,42px)", "lineHeight": "1.15", "color": "#fff", "margin": "0 0 8px"}}>Blog
      </h1>
      <div style={{"fontSize": "14.5px", "color": "#bcdcf7"}}>Inicio · Blog
      </div>
    </div>
  </section>
  <section style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "44px 36px 0"}}>
    <div style={{"display": "flex", "gap": "10px", "flexWrap": "wrap", "marginBottom": "34px"}}>
      {(categorias || []).map((c, _i) => (<Fragment key={_i}>
        <button onClick={c.filtrar} style={c.estilo}>{c.nombre}
        </button>
      </Fragment>))}
    </div>
    <div style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(280px,1fr))", "gap": "26px"}}>
      {(posts || []).map((a, _i) => (<Fragment key={_i}>
        <button onClick={a.abrir} style={{"textAlign": "left", "background": "#fff", "border": "1px solid #dae8f4", "borderRadius": "5px", "overflow": "hidden", "padding": "0", "cursor": "pointer", "display": "flex", "flexDirection": "column", "boxShadow": "0 3px 14px rgba(8,54,95,.06)"}} className="hv-29">
          <span style={{"height": "150px", "background": "#eef5fb", "borderBottom": "1px solid #dae8f4", "display": "flex", "alignItems": "center", "justifyContent": "center", "fontFamily": "'Montserrat',sans-serif", "fontSize": "10.5px", "fontWeight": "600", "letterSpacing": ".1em", "textTransform": "uppercase", "color": "#89a9c6"}}>placeholder imagen
          </span>
          <span style={{"padding": "22px 24px 24px", "display": "flex", "flexDirection": "column", "gap": "10px", "flex": "1"}}>
            <span style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "17.5px", "lineHeight": "1.35", "color": "#08365f"}}>{a.titulo}
            </span>
            <span style={{"display": "flex", "gap": "12px", "fontSize": "12.5px", "color": "#8195a7", "flexWrap": "wrap"}}>
              <span style={{"color": "#0b5ea8", "fontWeight": "600"}}>{a.categoria}
              </span>
              <span>{a.fecha}
              </span>
              <span>{a.lectura}
              </span>
            </span>
            <span style={{"fontSize": "14.5px", "lineHeight": "1.65", "color": "#5f6b76"}}>{a.bajada}
            </span>
          </span>
        </button>
      </Fragment>))}
    </div>
  </section>
</div>
  </>);
}
