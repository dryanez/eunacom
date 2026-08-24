import React from 'react'
import { X, Heart, Shield, Zap, Sparkles, Check } from 'lucide-react'
import { MAX_HEARTS } from '../../utils/gamificationStore'
import { playTapSound, playChestOpenSound, playIncorrectSound } from '../../utils/medlingoAudio'

export default function MedLingoShopModal({
  state,
  onClose,
  onRefillHearts,
  onBuyStreakFreeze,
  onBuyDoubleXp
}) {
  const heartsCost = 100
  const freezeCost = 200
  const doubleXpCost = 150

  const canAffordHearts = (state.gems || 0) >= heartsCost && state.hearts < MAX_HEARTS
  const canAffordFreeze = (state.gems || 0) >= freezeCost
  const canAffordDoubleXp = (state.gems || 0) >= doubleXpCost

  return (
    <div className="medlingo-modal-overlay">
      <div className="medlingo-modal-container shop animate-scale-up">
        
        {/* Header */}
        <div className="medlingo-shop-header">
          <div className="shop-title-wrap">
            <Sparkles size={22} className="shop-gold-sparkle" />
            <h2>Tienda de Guardia</h2>
          </div>
          
          <div className="shop-header-right">
            <div className="shop-gems-balance">
              <Sparkles size={16} color="#ffc800" />
              <span>{state.gems || 0} Gemas</span>
            </div>
            <button 
              className="medlingo-close-btn"
              onClick={() => {
                playTapSound()
                onClose()
              }}
              title="Cerrar tienda"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Item Cards List */}
        <div className="medlingo-shop-items-list">
          
          {/* ── Item 1: Refill Hearts ── */}
          <div className="medlingo-shop-item-card">
            <div className="item-icon-box heart">
              <Heart size={32} className="heart-icon filled" />
            </div>
            <div className="item-details">
              <h3>Recargar Vidas (5/5)</h3>
              <p>Restaura instantáneamente tus 5 vidas para continuar estudiando en el sendero.</p>
              <div className="item-current-status">
                Vidas actuales: <strong className="status-highlight">{state.hearts}/{MAX_HEARTS}</strong>
              </div>
            </div>
            <button
              className={`medlingo-shop-buy-btn ${state.hearts >= MAX_HEARTS ? 'maxed' : ''}`}
              disabled={!canAffordHearts}
              onClick={() => {
                if (!canAffordHearts) {
                  playIncorrectSound()
                  return
                }
                playChestOpenSound()
                onRefillHearts(heartsCost)
              }}
            >
              {state.hearts >= MAX_HEARTS ? (
                <span>Al Máximo</span>
              ) : (
                <div className="buy-btn-content">
                  <Sparkles size={15} color="#ffc800" />
                  <span>{heartsCost} Gemas</span>
                </div>
              )}
            </button>
          </div>

          {/* ── Item 2: Streak Freeze ── */}
          <div className="medlingo-shop-item-card">
            <div className="item-icon-box freeze">
              <Shield size={32} />
            </div>
            <div className="item-details">
              <h3>Protector de Turno (Streak Freeze)</h3>
              <p>Protege tu racha de estudio durante 24 horas si estás en un turno médico extenuante.</p>
              <div className="item-current-status">
                En inventario: <strong className="status-highlight">{state.streakFreezeTokens || 0} protectores</strong>
              </div>
            </div>
            <button
              className="medlingo-shop-buy-btn"
              disabled={!canAffordFreeze}
              onClick={() => {
                if (!canAffordFreeze) {
                  playIncorrectSound()
                  return
                }
                playChestOpenSound()
                onBuyStreakFreeze(freezeCost)
              }}
            >
              <div className="buy-btn-content">
                <Sparkles size={15} color="#ffc800" />
                <span>{freezeCost} Gemas</span>
              </div>
            </button>
          </div>

          {/* ── Item 3: Double XP Potion ── */}
          <div className="medlingo-shop-item-card">
            <div className="item-icon-box potion">
              <Zap size={32} />
            </div>
            <div className="item-details">
              <h3>Poción de Guardia (Doble XP)</h3>
              <p>Duplica tus puntos de experiencia ganados durante los próximos 15 minutos de estudio.</p>
              <div className="item-current-status">
                {state.doubleXpActiveUntil && new Date(state.doubleXpActiveUntil) > new Date() ? (
                  <span className="status-active">¡Activa ahora! 🔥</span>
                ) : (
                  <span>Inactiva</span>
                )}
              </div>
            </div>
            <button
              className="medlingo-shop-buy-btn"
              disabled={!canAffordDoubleXp}
              onClick={() => {
                if (!canAffordDoubleXp) {
                  playIncorrectSound()
                  return
                }
                playChestOpenSound()
                onBuyDoubleXp(doubleXpCost)
              }}
            >
              <div className="buy-btn-content">
                <Sparkles size={15} color="#ffc800" />
                <span>{doubleXpCost} Gemas</span>
              </div>
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}
