/**
 * High-Converting, Responsive Email Templates for EUNACOM App
 * 
 * Styled with Chilean medical context, clean typography, responsive layout,
 * and RFC 8058 compliant unsubscribe links.
 */

const BASE_STYLES = `
  body {
    margin: 0;
    padding: 0;
    background-color: #f1f5f9;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    -webkit-font-smoothing: antialiased;
  }
  .wrapper {
    width: 100%;
    table-layout: fixed;
    background-color: #f1f5f9;
    padding: 32px 0 48px;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
  }
  .header {
    background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
    padding: 28px 32px;
    text-align: center;
  }
  .header-logo {
    display: inline-block;
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: #ffffff;
    text-decoration: none;
  }
  .header-badge {
    display: inline-block;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.25);
    color: #bfdbfe;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 3px 10px;
    border-radius: 20px;
    margin-top: 8px;
  }
  .content {
    padding: 36px 32px;
    line-height: 1.65;
    font-size: 15px;
    color: #334155;
  }
  .salutation {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 16px;
  }
  .card-highlight {
    background-color: #eff6ff;
    border-left: 4px solid #2563eb;
    border-radius: 6px;
    padding: 16px 20px;
    margin: 22px 0;
  }
  .card-warning {
    background-color: #fef2f2;
    border-left: 4px solid #dc2626;
    border-radius: 6px;
    padding: 16px 20px;
    margin: 22px 0;
  }
  .btn-primary {
    display: inline-block;
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    color: #ffffff !important;
    text-decoration: none;
    font-weight: 700;
    font-size: 16px;
    padding: 15px 32px;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    margin: 20px 0 10px;
  }
  .btn-urgency {
    display: inline-block;
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    color: #ffffff !important;
    text-decoration: none;
    font-weight: 700;
    font-size: 16px;
    padding: 15px 32px;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.35);
    margin: 20px 0 10px;
  }
  .price-tag {
    font-size: 28px;
    font-weight: 800;
    color: #0f172a;
  }
  .price-old {
    text-decoration: line-through;
    color: #94a3b8;
    font-size: 18px;
    margin-right: 8px;
  }
  .footer {
    padding: 24px 32px;
    background-color: #f8fafc;
    border-top: 1px solid #e2e8f0;
    font-size: 12px;
    color: #64748b;
    text-align: center;
    line-height: 1.5;
  }
  .footer a {
    color: #2563eb;
    text-decoration: underline;
  }
`;

/**
 * 1. Welcome Email (Immediate on Sign-Up)
 */
export function getWelcomeEmailHtml({ firstName = 'Colega', appUrl = 'https://www.eunacomapp.cl' }) {
  const name = firstName ? `Dr(a). ${firstName}` : 'Colega';
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡Bienvenido/a a EUNACOM App!</title>
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <a href="${appUrl}" class="header-logo">🩺 EUNACOM App</a>
        <div><span class="header-badge">Preparación Médica Oficial</span></div>
      </div>
      <div class="content">
        <div class="salutation">¡Hola ${name}! Te damos la bienvenida 👋</div>
        
        <p>Aprobar el EUNACOM no es una cuestión de memorizar miles de páginas al azar; es una cuestión de <strong>entrenamiento estratégico basado en la frecuencia real de preguntas</strong> y en el Perfil de Conocimientos oficial.</p>

        <p>Desde hoy tienes acceso a la plataforma más moderna de preparación médica en Chile. Tu cuenta ya está lista para acompañarte hasta el día de tu examen.</p>

        <div class="card-highlight">
          <strong style="color: #1d4ed8; font-size: 16px;">🚀 Tus primeros 3 pasos recomendados hoy:</strong>
          <ol style="margin: 10px 0 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;"><strong>Rinde tu Test Diagnóstico (10 preguntas):</strong> Conoce en 7 minutos tus fortalezas y debilidades clínicas iniciales.</li>
            <li style="margin-bottom: 8px;"><strong>Únete a la Comunidad Telegram (+4.000 médicos):</strong> Recibe casos diarios, discusiones clínicas y avisos oficiales de ASOFAMECH.</li>
            <li><strong>Revisa los Puntos Clave de Cardiología y Respiratorio:</strong> Los dos módulos que representan más del 23% del puntaje total del examen.</li>
          </ol>
        </div>

        <div style="text-align: center;">
          <a href="${appUrl}" class="btn-primary">Comenzar mi Primer Test Ahora →</a>
        </div>

        <p style="margin-top: 24px;">Si tienes cualquier duda con tu fecha de inscripción, proceso de homologación o uso de la plataforma, responde directamente a este correo.</p>

        <p style="margin-bottom: 0;">Mucho éxito en tu estudio,<br>
        <strong>Dr. Felipe Yáñez & Equipo EUNACOM App</strong><br>
        <span style="font-size: 13px; color: #64748b;">Santiago de Chile</span></p>
      </div>
      <div class="footer">
        <p>Recibes este correo porque creaste una cuenta en <a href="${appUrl}">eunacomapp.cl</a>.<br>
        EUNACOM App · Preparación Médica para Médicos Chilenos y Extranjeros.<br>
        <a href="${appUrl}">Gestionar preferencias</a></p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 2. Retention Discount Ladder (Día 7 = 30%, Día 14 = 40%, Día 21 = 50%)
 */
export function getDiscountEmailHtml({
  firstName = 'Colega',
  discountPercent = 30,
  priceOriginal = '$14.990 CLP',
  priceDiscounted = '$10.490 CLP',
  planTitle = '1 Mes de Acceso Total Premium',
  checkoutUrl = 'https://www.eunacomapp.cl/pricing',
  appUrl = 'https://www.eunacomapp.cl',
  questionsAnswered = 0
}) {
  const name = firstName ? `Dr(a). ${firstName}` : 'Colega';
  const isUrgent = discountPercent >= 50;

  let headerTitle = '';
  let mainAngle = '';
  let badgeText = '';

  if (discountPercent === 30) {
    badgeText = 'OFERTA SEMANA 1 · 30% DCTO';
    headerTitle = 'No dejes tu preparación a medias';
    mainAngle = `
      <p>Hace una semana comenzaste a practicar en <strong>EUNACOM App</strong>${questionsAnswered > 0 ? ` (ya llevas <strong>${questionsAnswered} preguntas</strong> resueltas)` : ''}.</p>
      <p>Los médicos que aprueban en su primer intento no esperan al último mes: <strong>entrenan con constancia resolviendo al menos 25 a 30 preguntas al día</strong> con explicaciones fundamentadas.</p>
      <p>Para apoyarte a dar el salto definitivo al banco completo sin restricciones, hemos activado un <strong>30% de descuento exclusivo</strong> en tu primer mes:</p>
    `;
  } else if (discountPercent === 40) {
    badgeText = 'OPORTUNIDAD SEMANA 2 · 40% DCTO';
    headerTitle = '¿Poco tiempo para estudiar? La estrategia de alto rendimiento';
    mainAngle = `
      <p>Sabemos lo exigente que es compatibilizar turnos, trabajo clínico o trámites con el estudio para el EUNACOM.</p>
      <p>Por eso, la app está diseñada para optimizar cada minuto libre: modo simulacro cronometrado, banco con más de 6.000 preguntas reales y algoritmos diagnósticos directos al grano.</p>
      <p>Queremos que tengas todas las herramientas de tu lado. Solo por esta semana, tienes un <strong>40% de descuento directo</strong>:</p>
    `;
  } else {
    // 50% Final
    badgeText = 'ÚLTIMA OPORTUNIDAD · 50% DCTO';
    headerTitle = '🚨 Tu mayor descuento disponible (Expira en 48 hrs)';
    mainAngle = `
      <p>Este es el descuento más alto que ofrecemos para postulantes al EUNACOM de este año.</p>
      <p>Tu preparación no puede quedar al azar. Asegura el acceso completo a todas las reconstrucciones de exámenes anteriores, clases interactivas y al banco de preguntas con un <strong>50% de descuento definitivo</strong>.</p>
      <p>Este enlace es personal y expira en las próximas 48 horas:</p>
    `;
  }

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headerTitle}</title>
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <a href="${appUrl}" class="header-logo">🩺 EUNACOM App</a>
        <div><span class="header-badge">${badgeText}</span></div>
      </div>
      <div class="content">
        <div class="salutation">Estimado/a ${name},</div>
        
        ${mainAngle}

        <div class="${isUrgent ? 'card-warning' : 'card-highlight'}" style="text-align: center;">
          <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: ${isUrgent ? '#dc2626' : '#2563eb'}; letter-spacing: 1px;">
            ${planTitle}
          </div>
          <div style="margin: 12px 0;">
            <span class="price-old">${priceOriginal}</span>
            <span class="price-tag" style="color: ${isUrgent ? '#dc2626' : '#1d4ed8'};">${priceDiscounted}</span>
          </div>
          <ul style="text-align: left; margin: 12px 0 0; padding-left: 20px; font-size: 14px; color: #475569;">
            <li>✅ <strong>+6.000 preguntas reales</strong> con justificación clínica.</li>
            <li>✅ <strong>Reconstrucciones completas</strong> de los últimos exámenes.</li>
            <li>✅ <strong>Simulacros oficiales</strong> con cronómetro idéntico a ASOFAMECH.</li>
            <li>✅ Tutor IA para resolver dudas diagnósticas 24/7.</li>
          </ul>
        </div>

        <div style="text-align: center;">
          <a href="${checkoutUrl}" class="${isUrgent ? 'btn-urgency' : 'btn-primary'}">
            Activar mi Acceso con ${discountPercent}% DCTO →
          </a>
        </div>

        <p style="text-align: center; font-size: 13px; color: #64748b; margin-top: 10px;">
          🔒 Pago 100% seguro con Webpay, MercadoPago o PayPal. Activación inmediata.
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;">

        <p style="font-size: 14px; margin-bottom: 0;">
          Recuerda: Cada pregunta que practicas hoy es un punto más cerca de tu habilitación médica en Chile.<br>
          <strong>Equipo EUNACOM App</strong>
        </p>
      </div>
      <div class="footer">
        <p>¿Preguntas sobre el plan? Escríbenos a <a href="mailto:equipo@eunacom.app">equipo@eunacom.app</a> o responde este correo.<br>
        <a href="${appUrl}">Gestionar notificaciones</a></p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 3. Daily "Joya del Día" Newsletter
 */
export function getDailyJoyaEmailHtml({
  topic = 'Fibrilación Auricular y Anticoagulación',
  specialty = 'Cardiología',
  clinicalVignette = '',
  pearlRule = '',
  questionText = '',
  questionOptions = [],
  correctOptionIndex = 0,
  deepLinkUrl = 'https://www.eunacomapp.cl',
  appUrl = 'https://www.eunacomapp.cl'
}) {
  const optionsHtml = questionOptions.length > 0 ? `
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <strong style="color: #0f172a; font-size: 14px;">Pregunta Rápida del Día:</strong>
      <p style="margin: 8px 0 12px; font-size: 14px; color: #334155;">${questionText}</p>
      <div style="font-size: 13px; color: #475569;">
        ${questionOptions.map((opt, i) => `
          <div style="padding: 6px 10px; margin-bottom: 4px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px;">
            <strong>${String.fromCharCode(65 + i)})</strong> ${opt}
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>💎 Joya EUNACOM: ${topic}</title>
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <a href="${appUrl}" class="header-logo">💎 Joya EUNACOM del Día</a>
        <div><span class="header-badge">${specialty} · Concepto de Alto Rendimiento</span></div>
      </div>
      <div class="content">
        <div style="font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 16px;">
          ${topic}
        </div>

        ${clinicalVignette ? `
        <div style="background: #f1f5f9; padding: 14px 18px; border-radius: 8px; font-style: italic; color: #334155; margin-bottom: 20px; border-left: 3px solid #64748b;">
          "${clinicalVignette}"
        </div>
        ` : ''}

        <div class="card-highlight">
          <strong style="color: #1d4ed8; font-size: 15px;">🎯 La Regla de Oro EUNACOM:</strong>
          <p style="margin: 8px 0 0; font-size: 14px; line-height: 1.6; color: #1e293b;">
            ${pearlRule}
          </p>
        </div>

        ${optionsHtml}

        <div style="text-align: center; margin: 24px 0;">
          <a href="${deepLinkUrl}" class="btn-primary">Ver Explicación y Responder en la App →</a>
        </div>

        <p style="font-size: 13px; color: #64748b; text-align: center; margin-top: 16px;">
          Cada día a las 08:00 AM un concepto clave para asegurar tu aprobación.
        </p>
      </div>
      <div class="footer">
        <p>Recibes la Joya EUNACOM por ser parte de <a href="${appUrl}">eunacomapp.cl</a>.<br>
        <a href="${appUrl}">Pausar envíos diarios</a></p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 4. Weekly Student Digest (Sunday 19:00 CLT)
 */
export function getWeeklyPerformanceDigestHtml({
  firstName = 'Colega',
  totalAnswers = 0,
  correctPercent = 0,
  rank = 'Top 25%',
  topSpecialty = 'Cardiología',
  appUrl = 'https://www.eunacomapp.cl'
}) {
  const name = firstName ? `Dr(a). ${firstName}` : 'Colega';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>📊 Tu Resumen Semanal EUNACOM</title>
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <a href="${appUrl}" class="header-logo">🩺 EUNACOM App</a>
        <div><span class="header-badge">Domingo de Rendimiento</span></div>
      </div>
      <div class="content">
        <div class="salutation">Hola ${name}, aquí está tu resumen de estudio 📈</div>
        
        <p>Revisar tus métricas semana a semana es la mejor forma de detectar brechas antes de rendir el examen oficial.</p>

        <div style="display: table; width: 100%; margin: 20px 0; border-collapse: separate; border-spacing: 8px;">
          <div style="display: table-cell; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; text-align: center; width: 33%;">
            <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Preguntas</div>
            <div style="font-size: 22px; font-weight: 800; color: #2563eb; margin-top: 4px;">${totalAnswers}</div>
          </div>
          <div style="display: table-cell; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; text-align: center; width: 33%;">
            <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">% Acierto</div>
            <div style="font-size: 22px; font-weight: 800; color: #16a34a; margin-top: 4px;">${correctPercent}%</div>
          </div>
          <div style="display: table-cell; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; text-align: center; width: 33%;">
            <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Posición</div>
            <div style="font-size: 22px; font-weight: 800; color: #8b5cf6; margin-top: 4px;">${rank}</div>
          </div>
        </div>

        <div class="card-highlight">
          <strong>💡 Recomendación para esta semana:</strong>
          <p style="margin: 6px 0 0; font-size: 14px;">
            Tu especialidad con mayor actividad reciente fue <strong>${topSpecialty}</strong>. Para balancear tu puntaje global, te sugerimos realizar un bloque de 15 preguntas de Cirugía o Pediatría.
          </p>
        </div>

        <div style="text-align: center;">
          <a href="${appUrl}" class="btn-primary">Continuar mi Entrenamiento →</a>
        </div>
      </div>
      <div class="footer">
        <p>EUNACOM App · Resumen semanal de rendimiento.<br>
        <a href="${appUrl}">Ajustar notificaciones</a></p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 5. Streak Freeze Warning (Trigger de Racha en Riesgo - 20:30 CLT)
 */
export function getStreakFreezeWarningEmailHtml({
  firstName = 'Colega',
  streakDays = 3,
  hoursRemaining = 3,
  quickQuestionsCount = 3,
  rescueUrl = 'https://www.eunacomapp.cl/dashboard?action=save_streak',
  appUrl = 'https://www.eunacomapp.cl'
}) {
  const name = firstName ? `Dr(a). ${firstName}` : 'Colega';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🔥 ¡Tu racha de ${streakDays} días se congelará pronto!</title>
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header" style="background: linear-gradient(135deg, #7c2d12 0%, #ea580c 50%, #b45309 100%);">
        <a href="${appUrl}" class="header-logo">🔥 EUNACOM App</a>
        <div><span class="header-badge" style="background: rgba(0,0,0,0.3); border-color: rgba(255,255,255,0.4); color: #fef08a;">⚠️ Racha en Riesgo</span></div>
      </div>
      <div class="content">
        <div class="salutation" style="color: #9a3412;">
          ¡Dr(a). ${name}, tu racha de ${streakDays} días seguidos está por congelarse! ⏳
        </div>
        
        <p>Llevas un récord impecable de <strong>${streakDays} días consecutivos</strong> preparándote para el EUNACOM, pero hoy aún no has registrado actividad en la plataforma.</p>

        <div class="card-warning" style="background: #fff7ed; border-left: 4px solid #f97316; padding: 18px 20px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 20px;">🔥</span>
            <strong style="color: #c2410c; font-size: 16px;">¡Tu récord se congelará en ${hoursRemaining} horas!</strong>
          </div>
          <p style="margin: 6px 0 0; font-size: 15px; color: #7c2d12; font-weight: 600; line-height: 1.5;">
            "Solo necesitas responder ${quickQuestionsCount} preguntas rápidas para mantener tu récord activo."
          </p>
        </div>

        <p style="margin-top: 18px;">
          No dejes que el cansancio del turno o la rutina rompan tu hábito. Resolver solo 3 preguntas te tomará <strong>menos de 2 minutos</strong> y protegerá tus estadísticas y multiplicadores de XP en la comunidad médica.
        </p>

        <div style="text-align: center; margin: 28px 0 16px;">
          <a href="${rescueUrl}" class="btn-urgency" style="background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); box-shadow: 0 4px 14px rgba(234, 88, 12, 0.4); font-size: 16px; padding: 16px 36px;">
            ⚡ Responder 3 Preguntas y Salvar mi Racha →
          </a>
        </div>

        <div style="background: #f8fafc; border-radius: 8px; padding: 14px 16px; margin: 20px 0; border: 1px dashed #cbd5e1; text-align: center; font-size: 13px; color: #64748b;">
          💡 <em>Dato clínico: Los postulantes que mantienen rachas activas de estudio diario obtienen en promedio <strong>+14% de puntaje final</strong> en el examen ASOFAMECH.</em>
        </div>

        <p style="font-size: 13px; color: #64748b; text-align: center; margin-top: 20px; margin-bottom: 0;">
          El enlace te llevará directo a tu mini-sesión de 3 preguntas de alta frecuencia.
        </p>
      </div>
      <div class="footer">
        <p>Recibes esta alerta porque tienes una racha de estudio activa en <a href="${appUrl}">eunacomapp.cl</a>.<br>
        <a href="${appUrl}">Gestionar notificaciones de racha</a></p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 6. MOTOR DE PUNTO CIEGO (Weakness Sniper / The Knowledge Gap)
 * Trigger: Cuando un usuario falla 3 preguntas seguidas de una misma subárea.
 * Asunto: 🩺 Notamos una duda en {specialty}: Aquí tienes el algoritmo en 1 minuto
 */
export function getWeaknessSniperEmailHtml({
  name = 'Doctor(a)',
  specialty = 'Cardiología',
  subtopic = 'Fibrilación Auricular y Antiarrítmicos',
  failCount = 3,
  algorithmTip = 'FA con inestabilidad hemodinámica (hipotensión, angor, shock) → Cardioversión Eléctrica sincronizada inmediata (100-200 J). FA estable → Control de frecuencia inicial (Metoprolol o Diltiazem) + Estratificación tromboembólica con CHA₂DS₂-VASc (anticoagular con DOACs si Score ≥ 2 en hombres o ≥ 3 en mujeres).',
  practiceUrl = 'https://www.eunacomapp.cl/test-creator?specialty=Cardiologia',
  appUrl = 'https://www.eunacomapp.cl'
}) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🩺 Notamos una duda en ${specialty}: Tu algoritmo de 1 minuto</title>
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header" style="background: linear-gradient(135deg, #065f46 0%, #047857 50%, #0f766e 100%);">
        <a href="${appUrl}" class="header-logo">🩺 EUNACOM App</a>
        <div><span class="header-badge" style="background: rgba(255,255,255,0.2); color: #a7f3d0;">🎯 Francotirador de Puntos Ciegos</span></div>
      </div>
      <div class="content">
        <div class="salutation">
          Dr(a). ${name}, notamos un patrón de duda en ${specialty} 🔍
        </div>
        
        <p>
          Analizando tus últimas sesiones en la app, detectamos que fallaste <strong>${failCount} preguntas recientes de ${subtopic}</strong>.
        </p>

        <p>
          En el EUNACOM oficial, este es un <strong>tema de alta rentabilidad</strong> (aparece en el 95% de las versiones del examen ASOFAMECH). No necesitas leer un capítulo entero de 40 páginas; necesitas tener grabado el <strong>algoritmo de decisión rápida</strong>:
        </p>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #10b981; border-radius: 8px; padding: 18px 20px; margin: 20px 0;">
          <div style="font-weight: 800; color: #065f46; font-size: 15px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
            <span>⚡ Regla de Oro EUNACOM en 60 Segundos:</span>
          </div>
          <p style="margin: 0; font-size: 14px; color: #166534; line-height: 1.6; font-family: 'Segoe UI', Roboto, sans-serif;">
            ${algorithmTip}
          </p>
        </div>

        <p style="margin-top: 18px;">
          Para fijar este concepto en tu memoria a largo plazo antes de tu próximo turno, te preparamos un bloque corto de <strong>5 preguntas seleccionadas</strong> exactamente sobre este punto:
        </p>

        <div style="text-align: center; margin: 28px 0 16px;">
          <a href="${practiceUrl}" class="btn-primary" style="background: linear-gradient(135deg, #059669 0%, #047857 100%); box-shadow: 0 4px 14px rgba(5,150,105,0.3); font-size: 15px; padding: 15px 32px;">
            🎯 Practicar 5 Preguntas de ${subtopic} →
          </a>
        </div>

        <div style="background: #f8fafc; border-radius: 8px; padding: 12px 16px; margin: 20px 0; font-size: 13px; color: #64748b; text-align: center;">
          🧠 <em>Estrategia de estudio activo: Corregir un punto ciego inmediatamente después del error aumenta la retención en un <strong>300%</strong> según la curva de Ebbinghaus.</em>
        </div>
      </div>
      <div class="footer">
        <p>Enviado por el Sistema de Diagnóstico Clínico Continuo de <a href="${appUrl}">eunacomapp.cl</a>.<br>
        <a href="${appUrl}">Preferencias de alertas académicas</a></p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 7. MOTOR DE RECUPERACIÓN DE CHECKOUT ABANDONADO
 * Trigger: 45 minutos después de hacer clic en pagar y no completar.
 * Asunto: Dr(a). {name}, ¿tuviste algún problema con tu pago en EUNACOM App?
 */
export function getCartAbandonmentEmailHtml({
  name = 'Doctor(a)',
  planName = 'Plan Pro Anual (12 Meses)',
  planPrice = '$89.990 CLP',
  checkoutUrl = 'https://www.eunacomapp.cl/oferta?discount=30',
  whatsappUrl = 'https://wa.me/56912345678?text=Hola%20Dr.%20Felipe%20tuve%20un%20problema%20con%20el%20pago%20en%20la%20app',
  appUrl = 'https://www.eunacomapp.cl'
}) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dr(a). ${name}, ¿tuviste algún problema con tu pago?</title>
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header" style="background: #0f172a;">
        <a href="${appUrl}" class="header-logo">EUNACOM App</a>
        <div><span class="header-badge" style="background: rgba(255,255,255,0.15); color: #cbd5e1;">Soporte Directo</span></div>
      </div>
      <div class="content">
        <div class="salutation">
          Hola Dr(a). ${name},
        </div>
        
        <p>
          Te escribe el <strong>Dr. Felipe Yáñez</strong>, director médico de EUNACOM App.
        </p>

        <p>
          Vi que hace unos momentos intentaste activar tu suscripción al <strong>${planName}</strong> (${planPrice}), pero la transacción no llegó a completarse con la pasarela de pago.
        </p>

        <div style="background: #fefce8; border: 1px solid #fef08a; border-left: 4px solid #eab308; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #854d0e; line-height: 1.6;">
            A veces los bancos chilenos o extranjeros bloquean temporalmente los cargos en línea con Webpay o MercadoPago por seguridad o límites de tarjeta. Si este fue tu caso, no te preocupes: <strong>tu cupón y tu precio especial siguen reservados por 24 horas</strong>.
          </p>
        </div>

        <p>
          ¿Prefieres pagar mediante <strong>Transferencia Bancaria directa</strong> (cuenta corriente en Chile), o necesitas que te asistamos personalmente?
        </p>

        <div style="text-align: center; margin: 28px 0 16px; display: flex; flex-direction: column; gap: 12px; align-items: center;">
          <a href="${checkoutUrl}" class="btn-primary" style="background: #2563eb; font-size: 15px; padding: 14px 28px; width: 80%; text-align: center; box-sizing: border-box;">
            💳 Reintentar Pago con Tarjeta en la App →
          </a>
          <a href="${whatsappUrl}" style="display: inline-block; background: #22c55e; color: #ffffff; text-decoration: none; font-weight: 700; border-radius: 8px; font-size: 14px; padding: 12px 24px; width: 80%; text-align: center; box-sizing: border-box;">
            💬 Hablar por WhatsApp con el Dr. Felipe →
          </a>
        </div>

        <p style="font-size: 13px; color: #64748b; margin-top: 24px; line-height: 1.5;">
          También puedes simplemente responder directamente a este correo contándome qué error te dio el sistema y te ayudo a solucionarlo en minutos.
        </p>

        <div style="margin-top: 28px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 14px; color: #475569;">
          <strong>Dr. Felipe Yáñez</strong><br>
          <span style="font-size: 12px; color: #94a3b8;">Médico Cirujano · Equipo Docente EUNACOM App</span>
        </div>
      </div>
      <div class="footer">
        <p>EUNACOM App · Santiago de Chile.<br>
        Si ya completaste tu pago, por favor desestima este mensaje.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 8. MOTOR DE CUENTA REGRESIVA EUNACOM (Countdown & Urgencia Real)
 * Trigger: A 30, 14 o 7 días del examen oficial ASOFAMECH.
 * Asunto: ⏳ Faltan {daysRemaining} días para el EUNACOM: Plan de Reconstrucciones Reales
 */
export function getExamCountdownEmailHtml({
  name = 'Doctor(a)',
  daysRemaining = 30,
  examMonth = 'Julio 2026',
  reconstructionsCount = 28,
  reconstructionsUrl = 'https://www.eunacomapp.cl/reconstrucciones',
  appUrl = 'https://www.eunacomapp.cl'
}) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>⏳ Faltan ${daysRemaining} días para el EUNACOM ${examMonth}</title>
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header" style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);">
        <a href="${appUrl}" class="header-logo">⏳ EUNACOM App</a>
        <div><span class="header-badge" style="background: rgba(255,255,255,0.2); color: #c7d2fe;">📅 Cuenta Regresiva Oficial</span></div>
      </div>
      <div class="content">
        <div class="salutation" style="color: #312e81;">
          Dr(a). ${name}, quedan exactamente ${daysRemaining} días para el examen 🎯
        </div>
        
        <p>
          El calendario oficial no se detiene: el <strong>EUNACOM de ${examMonth}</strong> está a la vuelta de la esquina. A partir de este momento, leer tratados extensos o memorizar fisiopatología profunda tiene un rendimiento decreciente.
        </p>

        <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-left: 4px solid #6366f1; border-radius: 8px; padding: 18px 20px; margin: 20px 0;">
          <div style="font-weight: 800; color: #3730a3; font-size: 15px; margin-bottom: 6px;">
            ⚡ La Regla del Último Mes según los Mejores Puntajes:
          </div>
          <p style="margin: 0; font-size: 14px; color: #4338ca; line-height: 1.6;">
            "El 70% de tu puntaje en el último mes se define entrenando con <strong>Reconstrucciones Reales de exámenes anteriores</strong>. Las preguntas no se repiten idénticas, pero los patrones diagnósticos y las trampas de ASOFAMECH sí."
          </p>
        </div>

        <p>
          En EUNACOM App tienes acceso a <strong>${reconstructionsCount} Reconstrucciones completas</strong> con explicaciones oficiales paso a paso, cronómetro de examen y cálculo de percentil nacional estimado.
        </p>

        <div style="text-align: center; margin: 28px 0 16px;">
          <a href="${reconstructionsUrl}" class="btn-primary" style="background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); box-shadow: 0 4px 14px rgba(79,70,229,0.3); font-size: 16px; padding: 15px 34px;">
            🏛️ Entrenar con Reconstrucciones Reales →
          </a>
        </div>

        <div style="background: #f8fafc; border-radius: 8px; padding: 14px 16px; margin: 20px 0; border: 1px dashed #cbd5e1; text-align: center; font-size: 13px; color: #64748b;">
          📊 <em>Dato estadístico: Rendir al menos 3 reconstrucciones completas cronometradas reduce la ansiedad de examen en un <strong>45%</strong> y evita quedarse sin tiempo en el cuadernillo B.</em>
        </div>
      </div>
      <div class="footer">
        <p>Planificador de examen oficial de <a href="${appUrl}">eunacomapp.cl</a>.<br>
        <a href="${appUrl}">Ver calendario de simulacros</a></p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}


