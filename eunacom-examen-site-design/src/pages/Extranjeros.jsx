// Generated from the design bundle by scripts/generate-pages.py.
// Edit the design or the generator, not this file by hand.
import React, { Fragment } from 'react';

export default function Extranjeros(v) {
  const { irContacto, vias } = v;
  return (<>

<div>
  <section style={{"background": "#0b5ea8"}}>
    <div style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "46px 36px"}}>
      <h1 style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "800", "fontSize": "clamp(30px,3.4vw,42px)", "lineHeight": "1.15", "color": "#fff", "margin": "0 0 8px"}}>Para médicos extranjeros
      </h1>
      <div style={{"fontSize": "14.5px", "color": "#bcdcf7"}}>Inicio · Para médicos extranjeros
      </div>
    </div>
  </section>
  <section style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "48px 36px 0"}}>
    <h2 style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "400", "fontSize": "28px", "color": "#08365f", "margin": "0 0 6px"}}>Resumen de 
      <span style={{"fontWeight": "800"}}>normas
      </span> para el ejercicio de la medicina en Chile
    </h2>
    <div style={{"width": "48px", "height": "3px", "background": "#0b5ea8", "marginBottom": "24px"}}>
    </div>
    <p style={{"fontSize": "16.5px", "lineHeight": "1.85", "color": "#5f6b76", "margin": "0 0 14px", "maxWidth": "80ch"}}>Para el ejercicio de la medicina en Chile se necesita el título de médico cirujano, el cual puede ser expedido por una universidad chilena, o bien por una extranjera, siempre y cuando esté debidamente revalidado. Además, para trabajar en el sistema público y acceder a ciertos cargos, se exige la aprobación del EUNACOM. Sin embargo, existe una serie de excepciones y de interpretaciones legales que vale la pena conocer.
    </p>
    <p style={{"fontSize": "16.5px", "lineHeight": "1.85", "color": "#5f6b76", "margin": "0 0 40px", "maxWidth": "80ch"}}>Son dos requisitos separados y se confunden con frecuencia: la revalidación habilita el título, el EUNACOM habilita el acceso al sistema público. Aprobar el EUNACOM no revalida un título extranjero.
    </p>
    <h3 style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "400", "fontSize": "26px", "color": "#08365f", "margin": "0 0 6px"}}>
      <span style={{"fontWeight": "800"}}>Revalidación
      </span> de título
    </h3>
    <div style={{"width": "48px", "height": "3px", "background": "#0b5ea8", "marginBottom": "14px"}}>
    </div>
    <p style={{"fontSize": "15.5px", "lineHeight": "1.8", "color": "#5f6b76", "margin": "0 0 26px", "maxWidth": "72ch"}}>Existen cuatro formas de revalidar el título de médico cirujano. Además, existe una forma adicional de trabajar como médico sin haber revalidado.
    </p>
    <div style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(320px,1fr))", "gap": "22px"}}>
      {(vias || []).map((v, _i) => (<Fragment key={_i}>
        <div style={{"background": "#fff", "border": "1px solid #dae8f4", "borderRadius": "5px", "padding": "26px", "boxShadow": "0 3px 14px rgba(8,54,95,.06)"}}>
          <div style={{"display": "flex", "alignItems": "center", "gap": "12px", "marginBottom": "12px"}}>
            <span style={{"width": "38px", "height": "38px", "borderRadius": "50%", "background": "#0b5ea8", "color": "#fff", "fontFamily": "'Montserrat',sans-serif", "fontWeight": "800", "fontSize": "15px", "display": "flex", "alignItems": "center", "justifyContent": "center", "flex": "none"}}>{v.num}
            </span>
            <span style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "17px", "lineHeight": "1.3", "color": "#08365f"}}>{v.titulo}
            </span>
          </div>
          <p style={{"fontSize": "15px", "lineHeight": "1.75", "color": "#5f6b76", "margin": "0"}}>{v.texto}
          </p>
        </div>
      </Fragment>))}
    </div>
  </section>
  <section style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "52px 36px 0"}}>
    <div style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(320px,1fr))", "gap": "48px", "alignItems": "start"}}>
      <div>
        <h3 style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "400", "fontSize": "24px", "color": "#08365f", "margin": "0 0 6px"}}>Lo que más 
          <span style={{"fontWeight": "800"}}>pesa
          </span> si te titulaste fuera
        </h3>
        <div style={{"width": "48px", "height": "3px", "background": "#0b5ea8", "marginBottom": "18px"}}>
        </div>
        <p style={{"fontSize": "15.5px", "lineHeight": "1.85", "color": "#5f6b76", "margin": "0 0 14px"}}>La brecha más grande en el EUNACOM no es clínica: es el funcionamiento del sistema chileno. Red asistencial y niveles de atención, garantías GES, notificación obligatoria, licencias médicas, certificación de defunción y medicina legal.
        </p>
        <p style={{"fontSize": "15.5px", "lineHeight": "1.85", "color": "#5f6b76", "margin": "0"}}>Son preguntas que un egresado chileno responde por costumbre y que un médico extranjero pierde por desconocimiento del contexto, no por falta de medicina. En nuestros cursos ese módulo va al principio, no al final.
        </p>
      </div>
      <div style={{"background": "#eef5fb", "border": "1px solid #dae8f4", "borderRadius": "5px", "padding": "30px"}}>
        <div style={{"fontFamily": "'Montserrat',sans-serif", "fontWeight": "700", "fontSize": "17px", "color": "#08365f", "marginBottom": "12px"}}>Antes de tomar decisiones
        </div>
        <p style={{"fontSize": "15px", "lineHeight": "1.8", "color": "#5f6b76", "margin": "0 0 20px"}}>Esta página es un resumen orientativo y no reemplaza asesoría legal. Si tu caso tiene particularidades —convenio bilateral, posgrado en curso, oferta laboral ya firmada— escríbenos antes de pagar cualquier curso o rendir exámenes.
        </p>
        <button onClick={irContacto} style={{"fontFamily": "'Montserrat',sans-serif", "fontSize": "12.5px", "fontWeight": "700", "letterSpacing": ".08em", "textTransform": "uppercase", "background": "#0b5ea8", "color": "#fff", "border": "none", "padding": "14px 24px", "borderRadius": "3px", "cursor": "pointer"}}>Consultar mi caso
        </button>
      </div>
    </div>
  </section>
</div>
  </>);
}
