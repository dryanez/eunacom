// Generated from the design bundle by scripts/generate-pages.py.
// Edit the design or the generator, not this file by hand.
import React, { Fragment } from 'react';

export default function Layout(v) {
  const { correoContacto, irBlog, irContacto, irCursos, irExtranjeros, irFaq, irInicio, irMaterial, irNosotros, marca, sigla, telefono } = v;
  return (<>

<div style={{"background": "#fff", "minHeight": "100vh"}}>
  <div style={{"background": "#08365f", "color": "#b9d3ea"}}>
    <div style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "8px 36px", "display": "flex", "justifyContent": "space-between", "gap": "18px", "flexWrap": "wrap", "fontSize": "13px"}}>
      <span style={{"display": "flex", "gap": "20px", "flexWrap": "wrap"}}>
        <span>{telefono}
        </span>
        <span>{correoContacto}
        </span>
      </span>
      <span style={{"display": "flex", "gap": "14px"}}>
        <span>Instagram
        </span>
        <span>Facebook
        </span>
      </span>
    </div>
  </div>
  <header style={{"position": "sticky", "top": "0", "zIndex": "40", "background": "#fff", "borderBottom": "1px solid #e3ebf3", "boxShadow": "0 2px 10px rgba(8,54,95,.06)"}}>
    <div style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "14px 36px", "display": "flex", "alignItems": "center", "gap": "clamp(10px,1.5vw,24px)"}}>
      <button onClick={irInicio} style={{"background": "none", "border": "none", "padding": "0", "cursor": "pointer", "display": "flex", "alignItems": "center", "gap": "11px", "textAlign": "left", "flex": "none"}}>
        <span style={{"width": "44px", "height": "44px", "background": "#eef5fb", "border": "1px dashed #a9c7e4", "borderRadius": "3px", "display": "flex", "alignItems": "center", "justifyContent": "center", "fontFamily": "'Montserrat',sans-serif", "fontSize": "8px", "fontWeight": "700", "letterSpacing": ".06em", "textTransform": "uppercase", "color": "#89a9c6", "textAlign": "center", "lineHeight": "1.3", "flex": "none"}}>{sigla}
        </span>
        <span style={{"display": "flex", "flexDirection": "column", "lineHeight": "1.2"}}>
          <span style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "800", "fontSize": "17px", "color": "#08365f", "letterSpacing": "-.01em"}}>{marca}
          </span>
          <span style={{"fontFamily": "'Montserrat',sans-serif", "fontSize": "9.5px", "fontWeight": "600", "letterSpacing": ".11em", "textTransform": "uppercase", "color": "#8ba4bd"}}>Prueba para el ejercicio
            <br />de la Medicina en Chile
          </span>
        </span>
      </button>
      <nav style={{"display": "flex", "gap": "clamp(6px,1vw,18px)", "flex": "1", "flexWrap": "wrap", "justifyContent": "flex-end", "fontFamily": "'Montserrat',sans-serif"}}>
        <button onClick={irInicio} style={{"background": "none", "border": "none", "padding": "6px 0", "cursor": "pointer", "color": "#41556b", "fontSize": "13px", "fontWeight": "600", "whiteSpace": "nowrap"}} className="hv-0">Inicio
        </button>
        <button onClick={irNosotros} style={{"background": "none", "border": "none", "padding": "6px 0", "cursor": "pointer", "color": "#41556b", "fontSize": "13px", "fontWeight": "600", "whiteSpace": "nowrap"}} className="hv-1">Nosotros
        </button>
        <button onClick={irCursos} style={{"background": "none", "border": "none", "padding": "6px 0", "cursor": "pointer", "color": "#41556b", "fontSize": "13px", "fontWeight": "600", "whiteSpace": "nowrap"}} className="hv-2">Cursos y precios
        </button>
        <button onClick={irMaterial} style={{"background": "none", "border": "none", "padding": "6px 0", "cursor": "pointer", "color": "#41556b", "fontSize": "13px", "fontWeight": "600", "whiteSpace": "nowrap"}} className="hv-3">Material y pruebas gratis
        </button>
        <button onClick={irExtranjeros} style={{"background": "none", "border": "none", "padding": "6px 0", "cursor": "pointer", "color": "#41556b", "fontSize": "13px", "fontWeight": "600", "whiteSpace": "nowrap"}} className="hv-4">Para médicos extranjeros
        </button>
        <button onClick={irBlog} style={{"background": "none", "border": "none", "padding": "6px 0", "cursor": "pointer", "color": "#41556b", "fontSize": "13px", "fontWeight": "600", "whiteSpace": "nowrap"}} className="hv-5">Blog
        </button>
        <button onClick={irFaq} style={{"background": "none", "border": "none", "padding": "6px 0", "cursor": "pointer", "color": "#41556b", "fontSize": "13px", "fontWeight": "600", "whiteSpace": "nowrap"}} className="hv-6">Preguntas
        </button>
        <button onClick={irContacto} style={{"background": "none", "border": "none", "padding": "6px 0", "cursor": "pointer", "color": "#41556b", "fontSize": "13px", "fontWeight": "600", "whiteSpace": "nowrap"}} className="hv-7">Contacto
        </button>
      </nav>
    </div>
  </header>

{v.children}
<footer style={{"marginTop": "80px", "background": "#08365f", "color": "#a9c6de"}}>
    <div style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "52px 36px 26px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(200px,1fr))", "gap": "44px"}}>
      <div>
        <div style={{"display": "flex", "alignItems": "center", "gap": "11px", "marginBottom": "16px"}}>
          <span style={{"width": "44px", "height": "44px", "background": "rgba(255,255,255,.1)", "border": "1px dashed rgba(169,198,222,.55)", "borderRadius": "3px", "display": "flex", "alignItems": "center", "justifyContent": "center", "fontFamily": "'Montserrat',sans-serif", "fontSize": "8px", "fontWeight": "700", "letterSpacing": ".06em", "textTransform": "uppercase", "color": "#a9c6de", "textAlign": "center", "lineHeight": "1.3", "flex": "none"}}>logo
            <br />aquí
          </span>
          <span style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "800", "fontSize": "17px", "color": "#fff"}}>{marca}
          </span>
        </div>
        <p style={{"fontSize": "14px", "lineHeight": "1.75", "margin": "0 0 18px"}}>Prueba para el ejercicio de la Medicina en Chile. Preparación para el EUNACOM teórico y práctico.
        </p>
        <div style={{"display": "flex", "gap": "10px"}}>
          <span style={{"width": "34px", "height": "34px", "border": "1px solid rgba(169,198,222,.4)", "borderRadius": "50%", "display": "flex", "alignItems": "center", "justifyContent": "center", "fontSize": "12px", "color": "#c8e0f7"}}>ig
          </span>
          <span style={{"width": "34px", "height": "34px", "border": "1px solid rgba(169,198,222,.4)", "borderRadius": "50%", "display": "flex", "alignItems": "center", "justifyContent": "center", "fontSize": "12px", "color": "#c8e0f7"}}>fb
          </span>
        </div>
      </div>
      <div style={{"display": "flex", "flexDirection": "column", "gap": "9px"}}>
        <div style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "11.5px", "letterSpacing": ".1em", "textTransform": "uppercase", "color": "#6f93b5", "marginBottom": "4px"}}>Sitio
        </div>
        <button onClick={irInicio} style={{"textAlign": "left", "background": "none", "border": "none", "padding": "0", "cursor": "pointer", "color": "#a9c6de", "fontSize": "14px"}}>▸ Inicio
        </button>
        <button onClick={irNosotros} style={{"textAlign": "left", "background": "none", "border": "none", "padding": "0", "cursor": "pointer", "color": "#a9c6de", "fontSize": "14px"}}>▸ Nosotros
        </button>
        <button onClick={irCursos} style={{"textAlign": "left", "background": "none", "border": "none", "padding": "0", "cursor": "pointer", "color": "#a9c6de", "fontSize": "14px"}}>▸ Cursos y precios
        </button>
        <button onClick={irMaterial} style={{"textAlign": "left", "background": "none", "border": "none", "padding": "0", "cursor": "pointer", "color": "#a9c6de", "fontSize": "14px"}}>▸ Material y pruebas gratis
        </button>
      </div>
      <div style={{"display": "flex", "flexDirection": "column", "gap": "9px"}}>
        <div style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "11.5px", "letterSpacing": ".1em", "textTransform": "uppercase", "color": "#6f93b5", "marginBottom": "4px"}}>Recursos
        </div>
        <button onClick={irExtranjeros} style={{"textAlign": "left", "background": "none", "border": "none", "padding": "0", "cursor": "pointer", "color": "#a9c6de", "fontSize": "14px"}}>▸ Para médicos extranjeros
        </button>
        <button onClick={irBlog} style={{"textAlign": "left", "background": "none", "border": "none", "padding": "0", "cursor": "pointer", "color": "#a9c6de", "fontSize": "14px"}}>▸ Blog
        </button>
        <button onClick={irFaq} style={{"textAlign": "left", "background": "none", "border": "none", "padding": "0", "cursor": "pointer", "color": "#a9c6de", "fontSize": "14px"}}>▸ Preguntas frecuentes
        </button>
        <button onClick={irContacto} style={{"textAlign": "left", "background": "none", "border": "none", "padding": "0", "cursor": "pointer", "color": "#a9c6de", "fontSize": "14px"}}>▸ Contacto
        </button>
      </div>
      <div>
        <div style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "11.5px", "letterSpacing": ".1em", "textTransform": "uppercase", "color": "#6f93b5", "marginBottom": "14px"}}>Contacto
        </div>
        <div style={{"fontSize": "14px", "lineHeight": "1.9", "marginBottom": "18px"}}>Correo · {correoContacto}
          <br />Teléfonos · {telefono}
        </div>
        <button onClick={irCursos} style={{"fontFamily": "'Montserrat',sans-serif", "fontSize": "12px", "fontWeight": "700", "letterSpacing": ".08em", "textTransform": "uppercase", "background": "#fff", "color": "#08365f", "border": "none", "padding": "12px 20px", "borderRadius": "3px", "cursor": "pointer"}}>Asegura tu matrícula
        </button>
      </div>
    </div>
    <div style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "0 36px 36px"}}>
      <div style={{"borderTop": "1px solid rgba(169,198,222,.2)", "paddingTop": "20px", "display": "flex", "justifyContent": "space-between", "gap": "20px", "flexWrap": "wrap", "fontSize": "12.5px", "color": "#6f93b5"}}>
        <span>{marca} © 2026. Todos los derechos reservados.
        </span>
        <span>Programa independiente, no afiliado a ASOFAMECH.
        </span>
      </div>
    </div>
  </footer>
</div>
  </>);
}
