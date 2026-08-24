import React from 'react'
import { Map, BookMarked, Trophy, Target, User, Sparkles } from 'lucide-react'
import { playTapSound } from '../../utils/medlingoAudio'

export const MEDLINGO_TABS = [
  { id: 'sendero', label: 'Sendero', icon: Map, color: '#1cb0f6' },
  { id: 'coleccion', label: 'Colección', icon: BookMarked, color: '#a855f7' },
  { id: 'ligas', label: 'Ligas', icon: Trophy, color: '#eab308' },
  { id: 'misiones', label: 'Misiones', icon: Target, color: '#f97316' },
  { id: 'perfil', label: 'Perfil', icon: User, color: '#10b981' }
]

export default function MedLingoBottomNav({ activeTab, onSelectTab }) {
  return (
    <nav className="medlingo-bottom-nav">
      <div className="medlingo-bottom-nav__inner">
        {MEDLINGO_TABS.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              className={`medlingo-tab-btn ${isActive ? 'active' : ''}`}
              style={{
                '--tab-color': tab.color
              }}
              onClick={() => {
                playTapSound()
                onSelectTab(tab.id)
              }}
              title={tab.label}
            >
              <div className="tab-icon-wrapper">
                <Icon size={22} className="tab-icon" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="tab-label">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
