// Generated from the design bundle by scripts/generate-pages.py.
// Edit the design or the generator, not this file by hand.
import React, { Fragment } from 'react';

export default function Checkout(v) {
  const { correo, correoContacto, correoEnviado, cvv, error, fecha, ficha, fono, irCursos, irInicio, metodo, metodos, mostrarTarjeta, mostrarTransferencia, noPagado, nombre, onCorreo, onCvv, onFecha, onFono, onNombre, onPais, onRut, onTarjeta, onVence, orden, pagado, pagar, pais, rut, tarjeta, textoBoton, transferencia, vence } = v;
  return (<>

    <div>
      <section style={{"background": "#08365f"}}>
        <div style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "44px 36px"}}>
          <h1 style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "800", "fontSize": "clamp(28px,3.2vw,38px)", "lineHeight": "1.18", "color": "#fff", "margin": "0 0 8px"}}>Matrícula y pago
          </h1>
          <div style={{"fontSize": "14.5px", "color": "#a9d3f5"}}>Inicio · Cursos y precios · Matrícula
          </div>
        </div>
      </section>
      {pagado && (<>
        <section style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "60px 36px 0"}}>
          <div style={{"maxWidth": "660px", "margin": "0 auto", "border": "1px solid #dae8f4", "borderRadius": "5px", "overflow": "hidden", "boxShadow": "0 3px 14px rgba(8,54,95,.08)"}}>
            <div style={{"background": "#eef5fb", "borderBottom": "1px solid #dae8f4", "padding": "28px", "textAlign": "center"}}>
              <div style={{"width": "56px", "height": "56px", "borderRadius": "50%", "background": "#2f8f5b", "display": "flex", "alignItems": "center", "justifyContent": "center", "margin": "0 auto 16px"}}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12l6 6L20 6" />
                </svg>
              </div>
              <h2 style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "800", "fontSize": "24px", "color": "#08365f", "margin": "0 0 8px"}}>Matrícula registrada
              </h2>
              <p style={{"fontSize": "15.5px", "lineHeight": "1.7", "color": "#5f6b76", "margin": "0"}}>Enviamos la confirmación y los pasos de acceso a 
                <strong>{correoEnviado}
                </strong>.
              </p>
            </div>
            <div style={{"padding": "26px 30px"}}>
              <div style={{"display": "flex", "justifyContent": "space-between", "gap": "16px", "padding": "11px 0", "borderBottom": "1px solid #e8f0f7", "fontSize": "14.5px"}}>
                <span style={{"color": "#8195a7"}}>Curso
                </span>
                <span style={{"color": "#2f3e4d", "textAlign": "right"}}>{ficha.nombre}
                </span>
              </div>
              <div style={{"display": "flex", "justifyContent": "space-between", "gap": "16px", "padding": "11px 0", "borderBottom": "1px solid #e8f0f7", "fontSize": "14.5px"}}>
                <span style={{"color": "#8195a7"}}>Forma de pago
                </span>
                <span style={{"color": "#2f3e4d"}}>{metodo}
                </span>
              </div>
              <div style={{"display": "flex", "justifyContent": "space-between", "gap": "16px", "padding": "11px 0", "borderBottom": "1px solid #e8f0f7", "fontSize": "14.5px"}}>
                <span style={{"color": "#8195a7"}}>Total
                </span>
                <span style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "color": "#08365f"}}>{ficha.precioClp}
                </span>
              </div>
              <div style={{"display": "flex", "justifyContent": "space-between", "gap": "16px", "padding": "11px 0", "fontSize": "14.5px"}}>
                <span style={{"color": "#8195a7"}}>Nº de orden
                </span>
                <span style={{"color": "#2f3e4d"}}>{orden}
                </span>
              </div>
              <button onClick={irInicio} style={{"width": "100%", "marginTop": "20px", "fontFamily": "'Montserrat',sans-serif", "fontSize": "12.5px", "fontWeight": "700", "letterSpacing": ".08em", "textTransform": "uppercase", "background": "#0b5ea8", "color": "#fff", "border": "none", "padding": "14px", "borderRadius": "3px", "cursor": "pointer"}}>Volver al inicio
              </button>
            </div>
          </div>
        </section>
      </>)}
      {noPagado && (<>
        <section style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "48px 36px 0"}}>
          <div style={{"display": "grid", "gridTemplateColumns": "minmax(0,1fr) minmax(280px,360px)", "gap": "44px", "alignItems": "start"}}>
            <div>
              <h2 style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "400", "fontSize": "24px", "color": "#08365f", "margin": "0 0 6px"}}>1 · Tus 
                <span style={{"fontWeight": "800"}}>datos
                </span>
              </h2>
              <div style={{"width": "48px", "height": "3px", "background": "#0b5ea8", "marginBottom": "24px"}}>
              </div>
              <div style={{"display": "grid", "gridTemplateColumns": "1fr 1fr", "gap": "16px", "marginBottom": "38px"}}>
                <label style={{"display": "flex", "flexDirection": "column", "gap": "6px"}}>
                  <span style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "600", "fontSize": "12.5px", "color": "#41556b"}}>Nombre completo
                  </span>
                  <input value={nombre} onChange={onNombre} placeholder="Camila Rojas Pérez" style={{"fontSize": "15px", "padding": "12px 13px", "border": "1px solid #cfdeeb", "borderRadius": "3px", "outline": "none"}} className="fc-21" />
                </label>
                <label style={{"display": "flex", "flexDirection": "column", "gap": "6px"}}>
                  <span style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "600", "fontSize": "12.5px", "color": "#41556b"}}>RUT o pasaporte
                  </span>
                  <input value={rut} onChange={onRut} placeholder="12.345.678-9" style={{"fontSize": "15px", "padding": "12px 13px", "border": "1px solid #cfdeeb", "borderRadius": "3px", "outline": "none"}} className="fc-22" />
                </label>
                <label style={{"display": "flex", "flexDirection": "column", "gap": "6px"}}>
                  <span style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "600", "fontSize": "12.5px", "color": "#41556b"}}>Correo electrónico
                  </span>
                  <input value={correo} onChange={onCorreo} placeholder="tu@correo.com" style={{"fontSize": "15px", "padding": "12px 13px", "border": "1px solid #cfdeeb", "borderRadius": "3px", "outline": "none"}} className="fc-23" />
                </label>
                <label style={{"display": "flex", "flexDirection": "column", "gap": "6px"}}>
                  <span style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "600", "fontSize": "12.5px", "color": "#41556b"}}>Teléfono
                  </span>
                  <input value={fono} onChange={onFono} placeholder="+56 9 1234 5678" style={{"fontSize": "15px", "padding": "12px 13px", "border": "1px solid #cfdeeb", "borderRadius": "3px", "outline": "none"}} className="fc-24" />
                </label>
                <label style={{"display": "flex", "flexDirection": "column", "gap": "6px"}}>
                  <span style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "600", "fontSize": "12.5px", "color": "#41556b"}}>País de titulación
                  </span>
                  <select value={pais} onChange={onPais} style={{"fontSize": "15px", "padding": "12px 13px", "border": "1px solid #cfdeeb", "borderRadius": "3px", "outline": "none"}}>
                    <option value="">Selecciona
                    </option>
                    <option value="Chile">Chile
                    </option>
                    <option value="Argentina">Argentina
                    </option>
                    <option value="Colombia">Colombia
                    </option>
                    <option value="Venezuela">Venezuela
                    </option>
                    <option value="Perú">Perú
                    </option>
                    <option value="Bolivia">Bolivia
                    </option>
                    <option value="Ecuador">Ecuador
                    </option>
                    <option value="Cuba">Cuba
                    </option>
                    <option value="Otro">Otro
                    </option>
                  </select>
                </label>
                <label style={{"display": "flex", "flexDirection": "column", "gap": "6px"}}>
                  <span style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "600", "fontSize": "12.5px", "color": "#41556b"}}>Convocatoria que rindes
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
                  </select>
                </label>
              </div>
              <h2 style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "400", "fontSize": "24px", "color": "#08365f", "margin": "0 0 6px"}}>2 · Forma de 
                <span style={{"fontWeight": "800"}}>pago
                </span>
              </h2>
              <div style={{"width": "48px", "height": "3px", "background": "#0b5ea8", "marginBottom": "24px"}}>
              </div>
              <div style={{"display": "flex", "flexDirection": "column", "gap": "12px", "marginBottom": "26px"}}>
                {(metodos || []).map((m, _i) => (<Fragment key={_i}>
                  <button onClick={m.elegir} style={m.estilo}>
                    <span style={m.radio}>
                    </span>
                    <span style={{"display": "flex", "flexDirection": "column", "gap": "4px", "textAlign": "left"}}>
                      <span style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "15px", "color": "#08365f"}}>{m.nombre}
                      </span>
                      <span style={{"fontSize": "13.5px", "lineHeight": "1.6", "color": "#5f6b76"}}>{m.detalle}
                      </span>
                    </span>
                  </button>
                </Fragment>))}
              </div>
              {mostrarTarjeta && (<>
                <div style={{"background": "#eef5fb", "border": "1px solid #dae8f4", "borderRadius": "4px", "padding": "24px", "marginBottom": "26px"}}>
                  <div style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "13px", "color": "#08365f", "marginBottom": "16px"}}>Datos de la tarjeta
                  </div>
                  <div style={{"display": "grid", "gridTemplateColumns": "minmax(160px,1fr) 100px 100px", "gap": "14px"}}>
                    <label style={{"display": "flex", "flexDirection": "column", "gap": "6px"}}>
                      <span style={{"fontSize": "12px", "color": "#5f6b76"}}>Número
                      </span>
                      <input value={tarjeta} onChange={onTarjeta} placeholder="4111 1111 1111 1111" style={{"fontSize": "15px", "padding": "11px 12px", "border": "1px solid #cfdeeb", "borderRadius": "3px", "outline": "none", "background": "#fff"}} className="fc-25" />
                    </label>
                    <label style={{"display": "flex", "flexDirection": "column", "gap": "6px"}}>
                      <span style={{"fontSize": "12px", "color": "#5f6b76"}}>Vence
                      </span>
                      <input value={vence} onChange={onVence} placeholder="12/29" style={{"fontSize": "15px", "padding": "11px 12px", "border": "1px solid #cfdeeb", "borderRadius": "3px", "outline": "none", "background": "#fff"}} className="fc-26" />
                    </label>
                    <label style={{"display": "flex", "flexDirection": "column", "gap": "6px"}}>
                      <span style={{"fontSize": "12px", "color": "#5f6b76"}}>CVV
                      </span>
                      <input value={cvv} onChange={onCvv} placeholder="123" style={{"fontSize": "15px", "padding": "11px 12px", "border": "1px solid #cfdeeb", "borderRadius": "3px", "outline": "none", "background": "#fff"}} className="fc-27" />
                    </label>
                  </div>
                  <div style={{"fontSize": "12.5px", "color": "#8195a7", "marginTop": "12px"}}>Prototipo: no se procesa ningún cobro real.
                  </div>
                </div>
              </>)}
              {mostrarTransferencia && (<>
                <div style={{"background": "#eef5fb", "border": "1px solid #dae8f4", "borderRadius": "4px", "padding": "24px", "marginBottom": "26px", "fontSize": "14.5px", "lineHeight": "1.85", "color": "#41556b"}}>
                  <div style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "13px", "color": "#08365f", "marginBottom": "12px"}}>Datos de transferencia
                  </div>
{transferencia.banco}{transferencia.titular && (<><br />{transferencia.titular}</>)}
                  <br />{correoContacto}

                  <div style={{"fontSize": "13px", "color": "#8195a7", "marginTop": "12px"}}>Envía el comprobante al correo indicando tu nombre y el curso. Confirmamos el cupo el mismo día hábil.
                  </div>
                </div>
              </>)}
              {error && (<>
                <div style={{"background": "#fdeaea", "border": "1px solid #f3c2c2", "color": "#a52222", "fontSize": "14px", "padding": "13px 16px", "borderRadius": "3px", "marginBottom": "20px"}}>{error}
                </div>
              </>)}
              <button onClick={pagar} style={{"fontFamily": "'Montserrat',sans-serif", "fontSize": "13.5px", "fontWeight": "700", "letterSpacing": ".08em", "textTransform": "uppercase", "background": "#0b5ea8", "color": "#fff", "border": "none", "padding": "17px 34px", "borderRadius": "3px", "cursor": "pointer"}} className="hv-28">{textoBoton}
              </button>
            </div>
            <div style={{"border": "1px solid #dae8f4", "borderRadius": "5px", "overflow": "hidden", "boxShadow": "0 3px 14px rgba(8,54,95,.08)", "position": "sticky", "top": "110px"}}>
              <div style={{"background": "#eef5fb", "borderBottom": "1px solid #dae8f4", "padding": "14px 22px", "fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "11.5px", "letterSpacing": ".1em", "textTransform": "uppercase", "color": "#0b5ea8"}}>Resumen de tu matrícula
              </div>
              <div style={{"padding": "22px"}}>
                <div style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "17px", "lineHeight": "1.35", "color": "#08365f", "marginBottom": "8px"}}>{ficha.nombre}
                </div>
                <div style={{"fontSize": "13.5px", "lineHeight": "1.7", "color": "#5f6b76", "marginBottom": "18px"}}>{ficha.duracion} · inicio {ficha.inicio}
                  <br />Examen {ficha.examen}
                </div>
                <div style={{"borderTop": "1px solid #e8f0f7", "paddingTop": "14px", "display": "flex", "flexDirection": "column", "gap": "9px", "fontSize": "14px"}}>
                  <div style={{"display": "flex", "justifyContent": "space-between", "gap": "12px"}}>
                    <span style={{"color": "#8195a7"}}>Valor del curso
                    </span>
                    <span style={{"color": "#2f3e4d"}}>{ficha.precioClp}
                    </span>
                  </div>
                  <div style={{"display": "flex", "justifyContent": "space-between", "gap": "12px"}}>
                    <span style={{"color": "#8195a7"}}>Matrícula
                    </span>
                    <span style={{"color": "#2f8f5b"}}>Sin costo
                    </span>
                  </div>
                  <div style={{"display": "flex", "justifyContent": "space-between", "gap": "12px", "borderTop": "1px solid #e8f0f7", "paddingTop": "12px"}}>
                    <span style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "color": "#08365f"}}>Total
                    </span>
                    <span style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "800", "fontSize": "19px", "color": "#08365f"}}>{ficha.precioClp}
                    </span>
                  </div>
                  <div style={{"fontSize": "13px", "color": "#8195a7"}}>{ficha.precioUsd}
                  </div>
                </div>
                <div style={{"borderTop": "1px solid #e8f0f7", "marginTop": "16px", "paddingTop": "14px", "fontSize": "13px", "lineHeight": "1.7", "color": "#5f6b76"}}>Acceso a la plataforma y calendario completo el mismo día del pago. Boleta electrónica incluida.
                </div>
                <button onClick={irCursos} style={{"width": "100%", "marginTop": "16px", "background": "none", "border": "none", "padding": "0", "cursor": "pointer", "fontSize": "13.5px", "color": "#0b5ea8", "textAlign": "left"}}>← Cambiar de curso
                </button>
              </div>
            </div>
          </div>
        </section>
      </>)}
    </div>
  </>);
}
