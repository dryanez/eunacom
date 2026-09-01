// Generated from the design bundle by scripts/generate-pages.py.
// Edit the design or the generator, not this file by hand.
import React, { Fragment } from 'react';

export default function Contacto(v) {
  const { abierto, correo, correoContacto, correoEnviado, enviado, enviar, error, fecha, interes, nombre, nota, onCorreo, onFecha, onInteres, onNombre, onNota, onPais, pais, reset, telefono } = v;
  return (<>

<div>
  <section style={{"background": "#0b5ea8"}}>
    <div style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "46px 36px"}}>
      <h1 style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "800", "fontSize": "clamp(30px,3.4vw,42px)", "lineHeight": "1.15", "color": "#fff", "margin": "0 0 8px"}}>Contacto
      </h1>
      <div style={{"fontSize": "14.5px", "color": "#bcdcf7"}}>Inicio · Contacto
      </div>
    </div>
  </section>
  <section style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "48px 36px 0"}}>
    <div style={{"display": "grid", "gridTemplateColumns": "minmax(0,1fr) minmax(300px,440px)", "gap": "52px", "alignItems": "start"}}>
      <div>
        <h2 style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "400", "fontSize": "28px", "color": "#08365f", "margin": "0 0 6px"}}>¡Les deseamos 
          <span style={{"fontWeight": "800"}}>mucho éxito!
          </span>
        </h2>
        <div style={{"width": "48px", "height": "3px", "background": "#0b5ea8", "marginBottom": "22px"}}>
        </div>
        <p style={{"fontSize": "16.5px", "lineHeight": "1.85", "color": "#5f6b76", "margin": "0 0 34px", "maxWidth": "56ch"}}>Escríbenos con tu fecha de examen y tu país de titulación. Contestamos por correo, normalmente el mismo día, y la respuesta viene con la recomendación de curso, no con un catálogo.
        </p>
        <div style={{"display": "grid", "gridTemplateColumns": "1fr 1fr", "gap": "26px", "borderTop": "1px solid #dae8f4", "paddingTop": "28px"}}>
          <div>
            <div style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "12px", "letterSpacing": ".1em", "textTransform": "uppercase", "color": "#8195a7", "marginBottom": "8px"}}>Correo
            </div>
            <div style={{"fontSize": "15.5px", "color": "#2f3e4d"}}>{correoContacto}
            </div>
          </div>
          <div>
            <div style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "12px", "letterSpacing": ".1em", "textTransform": "uppercase", "color": "#8195a7", "marginBottom": "8px"}}>Teléfonos
            </div>
            <div style={{"fontSize": "15.5px", "color": "#2f3e4d"}}>{telefono}
            </div>
          </div>
          <div>
            <div style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "12px", "letterSpacing": ".1em", "textTransform": "uppercase", "color": "#8195a7", "marginBottom": "8px"}}>Horario
            </div>
            <div style={{"fontSize": "15.5px", "lineHeight": "1.6", "color": "#2f3e4d"}}>Lunes a viernes, 9 a 19 h
              <br />Sábado, 10 a 13 h
            </div>
          </div>
          <div>
            <div style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "12px", "letterSpacing": ".1em", "textTransform": "uppercase", "color": "#8195a7", "marginBottom": "8px"}}>Dónde
            </div>
            <div style={{"fontSize": "15.5px", "lineHeight": "1.6", "color": "#2f3e4d"}}>Santiago de Chile
              <br />Cursos 100% online
            </div>
          </div>
        </div>
      </div>
      <div style={{"border": "1px solid #dae8f4", "borderRadius": "5px", "overflow": "hidden", "boxShadow": "0 3px 14px rgba(8,54,95,.08)"}}>
        <div style={{"background": "#eef5fb", "borderBottom": "1px solid #dae8f4", "padding": "14px 24px", "fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "11.5px", "letterSpacing": ".1em", "textTransform": "uppercase", "color": "#0b5ea8"}}>Formulario de contacto
        </div>
        <div style={{"padding": "26px 24px"}}>
          {enviado && (<>
            <div style={{"display": "flex", "flexDirection": "column", "gap": "12px"}}>
              <div style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "19px", "color": "#08365f"}}>Consulta enviada
              </div>
              <p style={{"fontSize": "15px", "lineHeight": "1.75", "color": "#5f6b76", "margin": "0"}}>Te respondemos a 
                <strong>{correoEnviado}
                </strong>, normalmente el mismo día. Si no llega, revisa la carpeta de promociones.
              </p>
              <button onClick={reset} style={{"alignSelf": "flex-start", "background": "none", "border": "none", "padding": "0", "cursor": "pointer", "fontSize": "14px", "color": "#0b5ea8"}}>Enviar otra consulta
              </button>
            </div>
          </>)}
          {abierto && (<>
            <div style={{"display": "flex", "flexDirection": "column", "gap": "14px"}}>
              <label style={{"display": "flex", "flexDirection": "column", "gap": "6px"}}>
                <span style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "600", "fontSize": "12.5px", "color": "#41556b"}}>Nombre
                </span>
                <input value={nombre} onChange={onNombre} placeholder="Camila Rojas" style={{"fontSize": "15px", "padding": "12px 13px", "border": "1px solid #cfdeeb", "borderRadius": "3px", "outline": "none"}} className="fc-31" />
              </label>
              <label style={{"display": "flex", "flexDirection": "column", "gap": "6px"}}>
                <span style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "600", "fontSize": "12.5px", "color": "#41556b"}}>Correo
                </span>
                <input value={correo} onChange={onCorreo} placeholder="tu@correo.com" style={{"fontSize": "15px", "padding": "12px 13px", "border": "1px solid #cfdeeb", "borderRadius": "3px", "outline": "none"}} className="fc-32" />
              </label>
              <label style={{"display": "flex", "flexDirection": "column", "gap": "6px"}}>
                <span style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "600", "fontSize": "12.5px", "color": "#41556b"}}>Curso que te interesa
                </span>
                <select value={interes} onChange={onInteres} style={{"fontSize": "15px", "padding": "12px 13px", "border": "1px solid #cfdeeb", "borderRadius": "3px", "outline": "none"}}>
                  <option value="">Selecciona
                  </option>
                  <option value="Curso teórico anual">Curso teórico anual
                  </option>
                  <option value="Curso teórico 6 meses · julio">Curso teórico 6 meses · julio
                  </option>
                  <option value="Curso teórico 6 meses · diciembre">Curso teórico 6 meses · diciembre
                  </option>
                  <option value="Banco de preguntas">Banco de preguntas
                  </option>
                  <option value="Banco de preguntas">Banco de preguntas
                  </option>
                  <option value="Todavía no sé">Todavía no sé
                  </option>
                </select>
              </label>
              <div style={{"display": "grid", "gridTemplateColumns": "1fr 1fr", "gap": "12px"}}>
                <label style={{"display": "flex", "flexDirection": "column", "gap": "6px"}}>
                  <span style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "600", "fontSize": "12.5px", "color": "#41556b"}}>Cuándo rindes
                  </span>
                  <select value={fecha} onChange={onFecha} style={{"fontSize": "15px", "padding": "12px 13px", "border": "1px solid #cfdeeb", "borderRadius": "3px", "outline": "none"}}>
                    <option value="">Selecciona
                    </option>
                    <option value="Diciembre 2026">Diciembre 2026
                    </option>
                    <option value="Julio 2027">Julio 2027
                    </option>
                    <option value="Diciembre 2027">Diciembre 2027
                    </option>
                    <option value="Aún no lo decido">Aún no lo decido
                    </option>
                  </select>
                </label>
                <label style={{"display": "flex", "flexDirection": "column", "gap": "6px"}}>
                  <span style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "600", "fontSize": "12.5px", "color": "#41556b"}}>País de titulación
                  </span>
                  <select value={pais} onChange={onPais} style={{"fontSize": "15px", "padding": "12px 13px", "border": "1px solid #cfdeeb", "borderRadius": "3px", "outline": "none"}}>
                    <option value="">Selecciona
                    </option>
                    <option value="Chile">Chile
                    </option>
                    <option value="Otro país">Otro país
                    </option>
                  </select>
                </label>
              </div>
              <label style={{"display": "flex", "flexDirection": "column", "gap": "6px"}}>
                <span style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "600", "fontSize": "12.5px", "color": "#41556b"}}>Tu mensaje
                </span>
                <textarea value={nota} onChange={onNota} rows="4" placeholder="Es mi segundo intento, me titulé en Colombia…" style={{"fontSize": "15px", "padding": "12px 13px", "border": "1px solid #cfdeeb", "borderRadius": "3px", "outline": "none", "resize": "vertical"}} className="fc-33">
                </textarea>
              </label>
              {error && (<>
                <div style={{"background": "#fdeaea", "border": "1px solid #f3c2c2", "color": "#a52222", "fontSize": "13.5px", "padding": "11px 14px", "borderRadius": "3px"}}>{error}
                </div>
              </>)}
              <button onClick={enviar} style={{"fontFamily": "'Montserrat',sans-serif", "fontSize": "13px", "fontWeight": "700", "letterSpacing": ".08em", "textTransform": "uppercase", "background": "#0b5ea8", "color": "#fff", "border": "none", "padding": "15px", "borderRadius": "3px", "cursor": "pointer"}} className="hv-34">Enviar consulta
              </button>
            </div>
          </>)}
        </div>
      </div>
    </div>
  </section>
</div>
  </>);
}
