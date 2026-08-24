import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Video, Sparkles, Flame, User } from 'lucide-react'

const BottomNavigation = () => {
  const tabs = [
    {
      to: '/dashboard',
      label: 'Inicio',
      icon: Home,
      exact: true
    },
    {
      to: '/mis-clases',
      label: 'Clases',
      icon: Video,
      accentColor: '#818cf8'
    },
    {
      to: '/practica',
      label: 'Práctica',
      icon: Sparkles,
      accentColor: '#38bdf8'
    },
    {
      to: '/medlingo',
      label: 'MedLingo',
      icon: Flame,
      accentColor: '#f97316'
    },
    {
      to: '/settings',
      label: 'Perfil',
      icon: User,
      accentColor: '#10b981'
    }
  ]

  return (
    <nav className="mobile-bottom-bar" aria-label="Navegación Principal">
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `mobile-tab-item ${isActive ? 'mobile-tab-item--active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <div className="mobile-tab-icon-wrapper">
                  <Icon
                    size={22}
                    color={isActive ? (tab.accentColor || '#38bdf8') : '#94a3b8'}
                    strokeWidth={isActive ? 2.4 : 1.9}
                  />
                  {tab.label === 'MedLingo' && (
                    <span className="mobile-tab-dot-badge" />
                  )}
                </div>
                <span
                  className="mobile-tab-label"
                  style={{
                    color: isActive ? (tab.accentColor || '#38bdf8') : '#94a3b8',
                    fontWeight: isActive ? 700 : 500
                  }}
                >
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}

export default BottomNavigation
