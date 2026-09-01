// Generated from the design bundle by scripts/generate-pages.py.
// Edit the design or the generator, not this file by hand.
import React, { Fragment } from 'react';

export default function Articulo(v) {
  const { autor, irBlog, irCursos, post, relacionados } = v;
  return (<>

<div>
  <section style={{"background": "#0b5ea8"}}>
    <div style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "44px 36px"}}>
      <div style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "12px", "letterSpacing": ".12em", "textTransform": "uppercase", "color": "#a9d3f5", "marginBottom": "12px"}}>{post.categoria}
      </div>
      <h1 style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "800", "fontSize": "clamp(27px,3vw,38px)", "lineHeight": "1.2", "color": "#fff", "margin": "0 0 10px", "maxWidth": "34ch"}}>{post.titulo}
      </h1>
      <div style={{"fontSize": "14px", "color": "#bcdcf7"}}>{post.fecha} · {post.lectura} · por {autor}
      </div>
    </div>
  </section>
  <section style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "44px 36px 0"}}>
    <div style={{"display": "grid", "gridTemplateColumns": "minmax(0,1fr) minmax(260px,320px)", "gap": "56px", "alignItems": "start"}}>
      <article style={{"maxWidth": "74ch"}}>
        <div style={{"height": "280px", "background": "#eef5fb", "border": "1px dashed #b6d2e8", "borderRadius": "4px", "display": "flex", "alignItems": "center", "justifyContent": "center", "fontFamily": "'Montserrat',sans-serif", "fontSize": "11px", "fontWeight": "600", "letterSpacing": ".1em", "textTransform": "uppercase", "color": "#89a9c6", "marginBottom": "32px"}}>placeholder imagen destacada
        </div>
        <p style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "600", "fontSize": "19px", "lineHeight": "1.6", "color": "#0b5ea8", "margin": "0 0 30px"}}>{post.bajada}
        </p>
        <div style={{"display": "flex", "flexDirection": "column", "gap": "32px"}}>
          {(post.secciones || []).map((s, _i) => (<Fragment key={_i}>
            <section>
              <h2 style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "23px", "lineHeight": "1.3", "color": "#08365f", "margin": "0 0 14px"}}>{s.h}
              </h2>
              <div style={{"display": "flex", "flexDirection": "column", "gap": "15px"}}>
                {(s.parrafos || []).map((p, _i) => (<Fragment key={_i}>
                  <p style={{"fontSize": "16.5px", "lineHeight": "1.85", "color": "#5f6b76", "margin": "0", "textWrap": "pretty"}}>{p.t}
                  </p>
                </Fragment>))}
              </div>
            </section>
          </Fragment>))}
        </div>
        <div style={{"borderTop": "1px solid #dae8f4", "marginTop": "38px", "paddingTop": "24px", "display": "flex", "justifyContent": "space-between", "gap": "20px", "flexWrap": "wrap", "alignItems": "center"}}>
          <button onClick={irBlog} style={{"background": "none", "border": "none", "padding": "0", "cursor": "pointer", "fontSize": "14.5px", "color": "#0b5ea8"}}>← Volver al blog
          </button>
          <span style={{"fontSize": "13.5px", "color": "#8195a7"}}>Publicado en {post.categoria}
          </span>
        </div>
      </article>
      <aside style={{"display": "flex", "flexDirection": "column", "gap": "26px", "position": "sticky", "top": "110px"}}>
        <div style={{"background": "#0b5ea8", "borderRadius": "5px", "padding": "26px 24px"}}>
          <div style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "800", "fontSize": "18px", "lineHeight": "1.35", "color": "#fff", "marginBottom": "10px"}}>¿Rindes el próximo EUNACOM?
          </div>
          <p style={{"fontSize": "14.5px", "lineHeight": "1.7", "color": "#c8e0f7", "margin": "0 0 18px"}}>Revisa las modalidades del curso teórico y elige la que calza con tu fecha.
          </p>
          <button onClick={irCursos} style={{"width": "100%", "fontFamily": "'Montserrat',sans-serif", "fontSize": "12.5px", "fontWeight": "700", "letterSpacing": ".08em", "textTransform": "uppercase", "background": "#fff", "color": "#0b5ea8", "border": "none", "padding": "13px", "borderRadius": "3px", "cursor": "pointer"}}>Cursos y precios
          </button>
        </div>
        <div style={{"border": "1px solid #dae8f4", "borderRadius": "5px", "overflow": "hidden"}}>
          <div style={{"background": "#eef5fb", "borderBottom": "1px solid #dae8f4", "padding": "13px 20px", "fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "11.5px", "letterSpacing": ".1em", "textTransform": "uppercase", "color": "#0b5ea8"}}>Sigue leyendo
          </div>
          {(relacionados || []).map((r, _i) => (<Fragment key={_i}>
            <button onClick={r.abrir} style={{"width": "100%", "textAlign": "left", "background": "none", "border": "none", "borderBottom": "1px solid #e8f0f7", "padding": "14px 20px", "cursor": "pointer", "fontFamily": "'Montserrat',sans-serif", "fontWeight": "600", "fontSize": "14.5px", "lineHeight": "1.4", "color": "#41556b"}} className="hv-30">{r.titulo}
            </button>
          </Fragment>))}
        </div>
      </aside>
    </div>
  </section>
</div>
  </>);
}
