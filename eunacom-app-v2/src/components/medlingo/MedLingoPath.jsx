import React from 'react'
import { Check, Lock, Star, Gift, Crown, Zap, Activity, Heart, Stethoscope, Award, Flame, Gem, BookOpen } from 'lucide-react'
import { DOCTOR_CHARACTERS } from '../../utils/doctorAvatars'
import { playTapSound, playChestOpenSound } from '../../utils/medlingoAudio'

const NODE_ICONS = {
  stethoscope: Stethoscope,
  activity: Activity,
  heart: Heart,
  zap: Zap,
  gift: Gift,
  crown: Crown,
  award: Award,
  flame: Flame
}

// Deterministic snake X offset generator
const getNodeXOffset = (index) => {
  const pattern = [0, -55, -25, 45, 65, 15, -45, -65, -15, 55]
  return pattern[index % pattern.length]
}

export default function MedLingoPath({
  moduleData,
  state,
  onStartLesson,
  onOpenChest
}) {
  const activeMentor = DOCTOR_CHARACTERS.find(d => d.id === state.activeMentorId) || DOCTOR_CHARACTERS[1]

  // Flatten all nodes to determine unlocked status
  let previousNodeCompleted = true

  return (
    <div className="medlingo-path">
      {moduleData.units.map((unit, unitIdx) => {
        return (
          <section key={unit.id} className="medlingo-unit">
            {/* ── Unit Header Banner (Duolingo Style) ── */}
            <div
              className="medlingo-unit-banner"
              style={{ '--unit-accent': unit.color || moduleData.themeColor }}
            >
              <div className="medlingo-unit-banner__badge">
                <BookOpen size={19} />
              </div>
              <div className="medlingo-unit-banner__content">
                <div className="medlingo-unit-banner__title">{unit.title}</div>
                <div className="medlingo-unit-banner__desc">{unit.description}</div>
              </div>
              <Crown size={16} className="medlingo-unit-banner__crown" />
            </div>

            {/* ── Unit Path Nodes ── */}
            <div className="medlingo-nodes-track">
              {unit.nodes.map((node, nodeIdx) => {
                const nodeKey = node.id
                const completedData = state.completedNodes?.[nodeKey]
                const isCompleted = !!completedData && completedData.stars > 0
                const isChest = node.type === 'chest'
                const isChestOpened = isChest && !!state.openedChests?.[nodeKey]
                const isBoss = node.type === 'boss_round'

                // A node is unlocked if it's the very first node or previous node is completed
                const isUnlocked = previousNodeCompleted || isCompleted || (unitIdx === 0 && nodeIdx === 0)
                const isActive = isUnlocked && !isCompleted && !isChestOpened

                // Update previousNodeCompleted for the next iteration
                previousNodeCompleted = isCompleted || isChestOpened

                const xOffset = getNodeXOffset(nodeIdx)
                const IconComponent = NODE_ICONS[node.icon] || Stethoscope

                return (
                  <div
                    key={node.id}
                    className="medlingo-node-wrapper"
                    style={{ transform: `translateX(${xOffset}px)` }}
                  >
                    {/* Node Button */}
                    <button
                      className={`medlingo-node-btn ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${!isUnlocked ? 'locked' : ''} ${isBoss ? 'boss' : ''} ${isChest ? 'chest' : ''}`}
                      disabled={!isUnlocked}
                      onClick={() => {
                        if (!isUnlocked) return
                        playTapSound()
                        if (isChest) {
                          if (!isChestOpened) {
                            playChestOpenSound()
                            onOpenChest(node.id, node.gemsReward || 25)
                          }
                        } else {
                          onStartLesson(node, unit)
                        }
                      }}
                      title={node.title}
                    >
                      {/* Active Ring Animation */}
                      {isActive && <div className="medlingo-active-halo" />}

                      {isCompleted ? (
                        <Check size={30} strokeWidth={3} />
                      ) : !isUnlocked ? (
                        <Lock size={22} />
                      ) : isChest ? (
                        <Gift size={28} className={`medlingo-chest-icon ${!isChestOpened ? 'pulsing' : ''}`} />
                      ) : (
                        <IconComponent size={26} />
                      )}
                    </button>

                    {/* Star rating for completed nodes */}
                    {isCompleted && (
                      <div className="medlingo-node-stars">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            className={`star-icon ${s <= (completedData.stars || 0) ? 'filled' : 'empty'}`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Node title label below */}
                    <div className="medlingo-node-label">
                      <span className="medlingo-node-title">{node.title}</span>
                      {isBoss && <span className="medlingo-node-tag boss">CASO JEFE</span>}
                      {isChest && (
                        <span className="medlingo-node-tag chest">
                          {isChestOpened ? 'ABIERTO' : <>+{node.gemsReward || 25} <Gem size={11} /></>}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
