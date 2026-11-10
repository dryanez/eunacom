import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home, PenLine, PlayCircle, BookOpen, Layers, Archive, Timer, RotateCcw,
  BarChart3, Clock, Flame, User, Menu,
} from 'lucide-react'
import './redesign/midnight.css'

// Midnight Pro (móvil): todas las páginas en la barra inferior, se desliza hacia el lado
// como antes. «Menú» abre el menú lateral completo.
const TABS = [
  { to: '/dashboard', icon: Home, label: 'Inicio' },
  { to: '/test', icon: PenLine, label: 'Preguntas' },
  { to: '/mis-clases', icon: PlayCircle, label: 'Clases' },
  { to: '/biblioteca', icon: BookOpen, label: 'Biblioteca' },
  { to: '/flashcards', icon: Layers, label: 'Flashcards' },
  { to: '/reconstructions', icon: Archive, label: 'Reconstr.' },
  { to: '/simulation', icon: Timer, label: 'Simulación' },
  { to: '/review', icon: RotateCcw, label: 'Errores' },
  { to: '/stats', icon: BarChart3, label: 'Stats' },
  { to: '/history', icon: Clock, label: 'Historial' },
  { to: '/medlingo', icon: Flame, label: 'MedLingo' },
  { to: '/settings', icon: User, label: 'Yo' },
]

const BottomNavigation = ({ onMenuToggle }) => (
  <nav className="bottom-nav mn-bottom">
    <button type="button" className="bottom-nav__link mn-bottom-menu" onClick={onMenuToggle}>
      <Menu size={22} />
      <span>Menú</span>
    </button>
    {TABS.map(({ to, icon: Icon, label }) => (
      <NavLink key={to} to={to} className={({ isActive }) => `bottom-nav__link ${isActive ? 'bottom-nav__link--active' : ''}`}>
        <Icon size={22} />
        <span>{label}</span>
      </NavLink>
    ))}
  </nav>
)

export default BottomNavigation
