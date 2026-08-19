const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Merriweather:wght@400;700&display=swap');
        body { font-family: 'Inter', sans-serif; font-size: 8pt; line-height: 1.35; color: #0f172a; padding: 25px; background: #fff; }
        .topic-hdr { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 4px; margin-bottom: 12px; }
        .topic-hdr h2 { font-family: 'Merriweather', serif; font-size: 13pt; color: #1e3a8a; margin: 0; }
        .topic-hdr .num { font-size: 8pt; font-weight: 700; color: #2563eb; text-transform: uppercase; }
        .perfil-tag { background: #f1f5f9; border: 1px solid #cbd5e1; border-left: 3px solid #1e3a8a; padding: 3px 6px; font-size: 7.5pt; }
        
        /* STRICT TWO EQUAL COLUMNS (50% / 50%) */
        .two-cols { display: grid; grid-template-columns: 1fr 1fr; grid-gap: 0.25in; width: 100%; align-items: start; }
        .col-left { border-right: 1px solid #e2e8f0; padding-right: 0.12in; }
        .col-right { padding-left: 0.05in; }
        
        .box { border: 1px solid #cbd5e1; border-radius: 2px; padding: 6px 8px; margin-bottom: 8px; font-size: 8pt; }
        .box-title { font-weight: 700; font-size: 7.5pt; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px; }
        .box.high-yield { background: #f8fafc; border-left: 3px solid #1e3a8a; }
        .box.high-yield .box-title { color: #1e3a8a; }
        .box.vignette { background: #fffbeb; border-color: #fcd34d; border-left: 3px solid #d97706; }
        .box.vignette .box-title { color: #92400e; }
        .box.tip { background: #f0f9ff; border-color: #bae6fd; border-left: 3px solid #0284c7; }
        .box.tip .box-title { color: #0369a1; }
        .box.ges { background: #f0fdf4; border-color: #bbf7d0; border-left: 3px solid #16a34a; }
        .box.ges .box-title { color: #15803d; }
        
        .subhead { font-family: 'Merriweather', serif; font-size: 9pt; font-weight: 700; color: #1e3a8a; margin: 6px 0 3px 0; border-bottom: 1px solid #e2e8f0; }
        p.txt { font-size: 8pt; line-height: 1.35; margin-bottom: 6px; text-align: justify; }
        ul.lst { padding-left: 12px; margin-bottom: 6px; }
        ul.lst li { font-size: 8pt; margin-bottom: 2px; }
        
        table.tbl { width: 100%; border-collapse: collapse; margin: 6px 0; font-size: 7.5pt; border-top: 1.5px solid #1e3a8a; border-bottom: 1.5px solid #1e3a8a; }
        table.tbl th { background: #f1f5f9; color: #1e3a8a; padding: 4px; text-align: left; font-size: 7pt; text-transform: uppercase; }
        table.tbl td { padding: 4px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
        
        .q-box { background: #ffffff; border: 1px solid #94a3b8; padding: 6px; margin-bottom: 6px; border-radius: 2px; }
        .q-box .q-title { font-weight: 700; color: #2563eb; font-size: 7.5pt; text-transform: uppercase; }
        .q-box .q-text { font-size: 8pt; margin: 3px 0; }
        .q-box .q-ans { background: #f8fafc; border-top: 1px solid #e2e8f0; padding-top: 3px; margin-top: 3px; font-size: 7.5pt; color: #15803d; }
      </style>
    </head>
    <body>
      <div class="topic-hdr">
        <div>
          <div class="num">TEMA 1.1</div>
          <h2>Manejo de Urgencias en Arritmias</h2>
        </div>
        <div class="perfil-tag">
          <strong>PERFIL EUNACOM 1.01.2.009</strong><br>
          Dx: Específico &bull; Tx: Inicial &bull; Seg: Derivar
        </div>
      </div>

      <!-- TWO SIDE-BY-SIDE EQUAL COLUMNS (50% / 50%) -->
      <div class="two-cols">
        <!-- LEFT COLUMN (50% WIDTH) -->
        <div class="col-left">
          <div class="box high-yield">
            <div class="box-title">Aspectos Esenciales (High Yield)</div>
            <ul class="lst">
              <li><strong>Inestabilidad hemodinámica</strong> (hipotensión, choque, angina, edema pulmonar, síncope) &rarr; <strong>Cardioversión eléctrica sincronizada inmediata</strong>.</li>
              <li><strong>Bradiarritmias sintomáticas:</strong> Atropina 0.5-1 mg EV bolo inicial mientras se instala marcapaso.</li>
              <li><strong>QRS angosto (&lt;0.12s) estable:</strong> 1° Maniobras vagales, 2° Adenosina 6 mg EV bolo rápido.</li>
              <li><strong>QRS ancho (&ge;0.12s) en adulto:</strong> Tratar siempre como Taquicardia Ventricular (Amiodarona 150mg EV).</li>
            </ul>
          </div>

          <div class="subhead">Definición y Concepto Fundamental</div>
          <p class="txt">El manejo de urgencia en arritmias se centra en la determinación del estado de perfusión tisular y la presencia de inestabilidad hemodinámica antes que el diagnóstico electrocardiográfico específico.</p>

          <div class="subhead">Fisiopatología de la Inestabilidad</div>
          <p class="txt">Las taquiarritmias severas (&gt;150x') reducen drásticamente el tiempo de llenado diastólico del ventrículo izquierdo, disminuyendo el volumen sistólico y colapsando el gasto cardíaco y la perfusión coronaria.</p>

          <div class="box tip">
            <div class="box-title">EUNACOM TIP</div>
            <p>Si el paciente tiene arritmia + hipotensión o edema pulmonar &rarr; La respuesta correcta es Cardioversión Eléctrica. Nunca fármacos primero.</p>
          </div>

          <div class="box ges">
            <div class="box-title">MINSAL GES</div>
            <p>El traslado de arritmias inestables exige desfibrilador/monitor con parches conectados durante el transporte SAMU.</p>
          </div>
        </div>

        <!-- RIGHT COLUMN (50% WIDTH) -->
        <div class="col-right">
          <div class="box vignette">
            <div class="box-title">Caso Clínico Tipo EUNACOM</div>
            <p><em>"Mujer de 60 años con estenosis mitral severa presenta disnea de reposo y palpitaciones bruscas hace 2h. PA 82/40, FC 145x' irregular, crépitos difusos bibasales. ECG: FA rápida."</em></p>
            <p style="margin-top:4px;"><strong>Piensa en:</strong> FA rápida + Shock cardiogénico / Edema pulmonar agudo.</p>
            <p><strong>Conducta:</strong> Cardioversión eléctrica sincronizada inmediata.</p>
          </div>

          <div class="subhead">Criterios de Inestabilidad (4 Signos Cardinales)</div>
          <ul class="lst">
            <li><strong>Choque / Hipotensión:</strong> PAS &lt; 90 mmHg, PAM &lt; 65 mmHg o llenado capilar lento.</li>
            <li><strong>Alteración Mental Aguda:</strong> Somnolencia, confusión o síncope.</li>
            <li><strong>Angina Isquémica Activa:</strong> Dolor torácico opresivo.</li>
            <li><strong>Insuficiencia Cardíaca Aguda:</strong> Edema agudo de pulmón / crépitos difusos.</li>
          </ul>

          <table class="tbl">
            <caption>Fármacos de Urgencia</caption>
            <thead><tr><th>Fármaco</th><th>Indicación</th><th>Dosis</th></tr></thead>
            <tbody>
              <tr><td><strong>Adenosina</strong></td><td>TPSV QRS angosto</td><td>6 mg EV bolo rápido + 20ml SF</td></tr>
              <tr><td><strong>Amiodarona</strong></td><td>TV / FA inestable</td><td>150 mg EV en 10 min</td></tr>
              <tr><td><strong>Atropina</strong></td><td>Bradiarritmia / BAV</td><td>0.5 - 1 mg EV bolo</td></tr>
            </tbody>
          </table>

          <div class="q-box">
            <div class="q-title">Pregunta 11 EUNACOM</div>
            <div class="q-text">Mujer de 60 años con estenosis mitral severa, disnea brusca, PA 85/35, FC 140x', crépitos difusos. La conducta inicial es:</div>
            <div class="q-ans"><strong>Respuesta Correcta D:</strong> Cardioversión eléctrica inmediata por inestabilidad hemodinámica.</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(__dirname, 'pdf_layout_preview.png') });
  await browser.close();
  console.log('Saved pdf_layout_preview.png');
})();
