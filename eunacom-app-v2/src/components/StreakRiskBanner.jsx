import React from 'react'
import { Flame, Zap, ArrowRight, ShieldAlert, Clock } from 'lucide-react'
import '../styles/streakRisk.css'

export default function StreakRiskBanner({
  streak = 3,
  userFirstName = 'Colega',
  hoursRemaining = 3,
  onOpenStreakSaver
}) {
  const name = userFirstName ? `Dr(a). ${userFirstName}` : 'Colega'

  return (
    <div className="streak-risk-banner-card animate-pulse-subtle">
      <div className="streak-risk-ambient-glow" />
      
      <div className="streak-risk-content">
        <div className="streak-risk-flame-wrapper">
          <div className="streak-risk-flame-icon">
            <Flame size={28} className="flame-pulse-fast" />
          </div>
          <div className="streak-risk-time-badge">
            <Clock size={12} />
            <span>{hoursRemaining}h restantes</span>
          </div>
        </div>

        <div className="streak-risk-text-block">
          <div className="streak-risk-header-row">
            <span className="streak-risk-pill">
              <ShieldAlert size={13} />
              Racha en Riesgo
            </span>
            <span className="streak-risk-streak-count">
              🔥 Racha actual: <strong>{streak} {streak === 1 ? 'día' : 'días'}</strong>
            </span>
          </div>

          <h3 className="streak-risk-title">
            ¡{name}, tu racha de {streak} días se congelará pronto!
          </h3>

          <p className="streak-risk-quote">
            "Solo necesitas responder 3 preguntas rápidas para mantener tu récord activo."
          </p>
        </div>
      </div>

      <div className="streak-risk-action">
        <button
          onClick={onOpenStreakSaver}
          className="streak-risk-cta-btn"
          title="Responder 3 preguntas para salvar tu racha"
        >
          <Zap size={17} className="text-yellow-300" />
          <span>Salvar mi Racha (3 Preguntas)</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
