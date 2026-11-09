import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, PenLine, PlayCircle, BookOpen, User } from 'lucide-react'
import './redesign/midnight.css'

// Midnight Pro: 5 pestañas fijas. El resto (Reconstrucciones, Simulación, Stats, Historial…)
// está en Inicio y en el menú lateral.
const TABS = [
  { to: '/dashboard', icon: Home, label: 'Inicio' },
  { to: '/test', icon: PenLine, label: 'Preguntas' },
  { to: '/mis-clases', icon: PlayCircle, label: 'Clases' },
  { to: '/biblioteca', icon: BookOpen, label: 'Biblioteca' },
  { to: '/settings', icon: User, label: 'Yo' },
]

const BottomNavigation = () => (
  <nav className="bottom-nav mn-bottom">
    {TABS.map(({ to, icon: Icon, label }) => (
      <NavLink key={to} to={to} className={({ isActive }) => `bottom-nav__link ${isActive ? 'bottom-nav__link--active' : ''}`}>
        <Icon size={22} />
        <span>{label}</span>
      </NavLink>
    ))}
  </nav>
)

export default BottomNavigation
