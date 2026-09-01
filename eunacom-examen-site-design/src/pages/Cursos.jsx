// Generated from the design bundle by scripts/generate-pages.py.
// Edit the design or the generator, not this file by hand.
import React, { Fragment } from 'react';

export default function Cursos(v) {
  const { cursos, irContacto } = v;
  return (<>

<div>
  <section style={{"background": "#0b5ea8"}}>
    <div style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "46px 36px"}}>
      <h1 style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "800", "fontSize": "clamp(30px,3.4vw,42px)", "lineHeight": "1.15", "color": "#fff", "margin": "0 0 8px"}}>Cursos y precios
      </h1>
      <div style={{"fontSize": "14.5px", "color": "#bcdcf7"}}>Inicio · Cursos y precios
      </div>
    </div>
  </section>
  <section style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "52px 36px 0"}}>
    <div style={{"textAlign": "center", "maxWidth": "70ch", "margin": "0 auto 44px"}}>
      <h2 style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "400", "fontSize": "30px", "lineHeight": "1.25", "color": "#08365f", "margin": "0 0 6px"}}>¡Prepárate para el 
        <span style={{"fontWeight": "800"}}>EUNACOM
        </span>!
      </h2>
      <div style={{"width": "56px", "height": "3px", "background": "#0b5ea8", "margin": "0 auto 18px"}}>
      </div>
      <p style={{"fontSize": "16.5px", "lineHeight": "1.75", "color": "#5f6b76", "margin": "0"}}>Inscripciones abiertas. Cada curso tiene su ficha con calendario, temario, qué incluye y formas de pago. El pago se hace en línea con Webpay o por transferencia, y el acceso a la plataforma queda activo el mismo día.
      </p>
    </div>
    <div style={{"display": "flex", "flexDirection": "column", "gap": "24px"}}>
      {(cursos || []).map((c, _i) => (<Fragment key={_i}>
        <div style={{"background": "#fff", "border": "1px solid #dae8f4", "borderRadius": "5px", "overflow": "hidden", "boxShadow": "0 3px 14px rgba(8,54,95,.07)"}}>
          <div style={{"background": "#eef5fb", "borderBottom": "1px solid #dae8f4", "padding": "13px 30px", "display": "flex", "justifyContent": "space-between", "gap": "16px", "flexWrap": "wrap", "alignItems": "center"}}>
            <span style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "12px", "letterSpacing": ".1em", "textTransform": "uppercase", "color": "#0b5ea8"}}>{c.kicker}
            </span>
            <span style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "12px", "color": "#2f8f5b"}}>{c.estado}
            </span>
          </div>
          <div style={{"padding": "30px", "display": "grid", "gridTemplateColumns": "minmax(260px,1.5fr) minmax(180px,1fr) minmax(200px,240px)", "gap": "38px", "alignItems": "start"}}>
            <div>
              <h3 style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "24px", "lineHeight": "1.25", "color": "#08365f", "margin": "0 0 12px"}}>{c.nombre}
              </h3>
              <p style={{"fontSize": "15.5px", "lineHeight": "1.75", "color": "#5f6b76", "margin": "0"}}>{c.resumen}
              </p>
            </div>
            <div style={{"display": "flex", "flexDirection": "column", "gap": "8px", "fontSize": "14px", "color": "#41556b", "borderLeft": "1px solid #e8f0f7", "paddingLeft": "26px"}}>
              <div>
                <span style={{"color": "#8195a7"}}>Duración · 
                </span>{c.duracion}
              </div>
              <div>
                <span style={{"color": "#8195a7"}}>Inicio · 
                </span>{c.inicio}
              </div>
              <div>
                <span style={{"color": "#8195a7"}}>Término · 
                </span>{c.termino}
              </div>
              <div>
                <span style={{"color": "#8195a7"}}>Examen · 
                </span>{c.examen}
              </div>
              <div>
                <span style={{"color": "#8195a7"}}>Modalidad · 
                </span>{c.modalidad}
              </div>
            </div>
            <div style={{"display": "flex", "flexDirection": "column", "gap": "10px"}}>
              <div>
                <div style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "800", "fontSize": "25px", "lineHeight": "1.1", "color": "#08365f"}}>{c.precioClp}
                </div>
                <div style={{"fontSize": "13.5px", "color": "#8195a7"}}>{c.precioUsd}
                </div>
              </div>
              <button onClick={c.ver} style={{"fontFamily": "'Montserrat',sans-serif", "fontSize": "12.5px", "fontWeight": "700", "letterSpacing": ".08em", "textTransform": "uppercase", "background": "#0b5ea8", "color": "#fff", "border": "none", "padding": "13px", "borderRadius": "3px", "cursor": "pointer"}} className="hv-18">Más información aquí
              </button>
              <button onClick={c.comprar} style={{"fontFamily": "'Montserrat',sans-serif", "fontSize": "12px", "fontWeight": "700", "letterSpacing": ".08em", "textTransform": "uppercase", "background": "#0b5ea8", "color": "#fff", "border": "none", "padding": "12px", "borderRadius": "3px", "cursor": "pointer"}} className="hv-19">Matricularme
              </button>
            </div>
          </div>
        </div>
      </Fragment>))}
    </div>
  </section>
  <section style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "56px 36px 0"}}>
    <div style={{"background": "#eef5fb", "border": "1px solid #dae8f4", "borderRadius": "5px", "padding": "36px 34px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(280px,1fr))", "gap": "38px"}}>
      <div>
        <div style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "17px", "color": "#08365f", "marginBottom": "12px"}}>Formas de pago
        </div>
        <ul style={{"margin": "0", "paddingLeft": "18px", "fontSize": "14.5px", "lineHeight": "1.85", "color": "#5f6b76"}}>
          <li>Webpay: débito y crédito, con acceso a cuotas
          </li>
          <li>Transferencia o depósito bancario
          </li>
          <li>Dos pagos: 50% al matricularse y 50% a mitad de curso
          </li>
          <li>Transferencia internacional en dólares
          </li>
        </ul>
      </div>
      <div>
        <div style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "17px", "color": "#08365f", "marginBottom": "12px"}}>Pasos de inscripción
        </div>
        <ol style={{"margin": "0", "paddingLeft": "18px", "fontSize": "14.5px", "lineHeight": "1.85", "color": "#5f6b76"}}>
          <li>Elige el curso y presiona Matricularme
          </li>
          <li>Completa tus datos y elige forma de pago
          </li>
          <li>Paga en línea o sube el comprobante
          </li>
          <li>Recibes acceso y calendario el mismo día
          </li>
        </ol>
      </div>
      <div>
        <div style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "17px", "color": "#08365f", "marginBottom": "12px"}}>¿No sabes cuál te sirve?
        </div>
        <p style={{"fontSize": "14.5px", "lineHeight": "1.8", "color": "#5f6b76", "margin": "0 0 16px"}}>Escríbenos con tu fecha de examen y tu país de titulación. Te decimos qué curso te corresponde, incluso si la respuesta es ninguno todavía.
        </p>
        <button onClick={irContacto} style={{"fontFamily": "'Montserrat',sans-serif", "fontSize": "12px", "fontWeight": "700", "letterSpacing": ".08em", "textTransform": "uppercase", "background": "#0b5ea8", "color": "#fff", "border": "none", "padding": "12px 22px", "borderRadius": "3px", "cursor": "pointer"}}>Contáctanos aquí
        </button>
      </div>
    </div>
  </section>
</div>
  </>);
}
