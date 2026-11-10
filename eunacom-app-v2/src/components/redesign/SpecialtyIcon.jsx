import React from 'react'
import { specialtySlug } from '../../lib/specialtyImage'
import './specialty-icon.css'

// Iconos propios EUNACOM (dibujados a mano, estilo «Gradiente app», elegido 10-nov-2026).
// Dibujos en viewBox 0 0 48 48; class="f" = relleno suave.
const ART = {
  cardiologia: `<path class="f" d="M24 42C14 36 8 29 8 21c0-6 4-10 9-10 3 0 5 1.5 7 4 2-2.5 4-4 7-4 5 0 9 4 9 10 0 8-6 15-16 21Z"/><path d="M21 13V7.5c0-2.5 6-2.5 6 0V12"/><path d="M27 9h5"/><path d="M19 21c4 3 6 8 5 15"/><path d="M29 18c-1 4 0 7 3 9"/>`,
  neurologia: `<path class="f" d="M15 34c-6-1-8-6-7-10-2-4 1-10 6-11 2-5 9-6 13-4 5-2 12 1 13 7 4 3 3 10-1 12 0 5-5 8-10 6l-1 6h-4v-5c-3 1-7 1-9-1Z"/><path d="M16 18c3-1 5 1 4 4"/><path d="M26 14c2 3 6 3 7 6"/><path d="M17 28c4-2 8 0 12-2"/><path d="M24 20c0 3 3 4 5 3"/>`,
  respiratorio: `<path d="M24 5v15"/><path d="M24 20l-5 5M24 20l5 5"/><path class="f" d="M20 14c-6 0-12 8-12 18 0 6 4 8 8 8 3 0 4-2 4-5Z"/><path class="f" d="M28 14c6 0 12 8 12 18 0 6-4 8-8 8-3 0-4-2-4-5Z"/>`,
  gastroenterologia: `<path class="f" d="M20 6c0 6-2 8-4 10-6 5-6 16 0 21 6 5 16 4 21-2 4-5 3-11-2-12-4-1-6 2-8 5-1-6 0-12 1-16 1-3 0-6 0-6"/><path d="M37 35c1 3 3 5 5 5"/>`,
  hematologia: `<path class="f" d="M24 5S12 19 12 28c0 7 5 12 12 12s12-5 12-12C36 19 24 5 24 5Z"/><ellipse cx="22" cy="29" rx="5.5" ry="3.6"/><ellipse cx="22" cy="29" rx="2" ry="1"/>`,
  infectologia: `<circle class="f" cx="24" cy="24" r="10"/><path d="M24 14V8M24 34v6M14 24H8M34 24h6M17 17l-4-4M31 31l4 4M31 17l4-4M17 31l-4 4"/><circle class="dot" cx="24" cy="7" r="2"/><circle class="dot" cx="24" cy="41" r="2"/><circle class="dot" cx="7" cy="24" r="2"/><circle class="dot" cx="41" cy="24" r="2"/><circle class="dot" cx="12" cy="12" r="2"/><circle class="dot" cx="36" cy="36" r="2"/><circle class="dot" cx="36" cy="12" r="2"/><circle class="dot" cx="12" cy="36" r="2"/><circle cx="21" cy="22" r="2"/><circle cx="27" cy="27" r="1.6"/>`,
  endocrinologia: `<path d="M24 4v40"/><path d="M20 9h8M20 38h8M20 43h8"/><path class="f" d="M22 15c-6-4-12 0-11 9 1 8 7 10 11 6Z"/><path class="f" d="M26 15c6-4 12 0 11 9-1 8-7 10-11 6Z"/>`,
  diabetes: `<path class="f" d="M7 27c0-6 6-9 12-7 7 2 11-2 17-4 4-1 7 2 5 5-3 4-10 6-16 9-6 3-18 3-18-3Z"/><path d="M11 27c8 0 17-4 27-9"/><path class="f" d="M38 30s-4 5-4 7.5a4 4 0 0 0 8 0C42 35 38 30 38 30Z"/>`,
  nefrologia: `<path class="f" d="M30 8C20 6 11 13 11 24s9 18 19 16c6-1 8-6 5-10-3-3-3-9 0-12 3-4 1-9-5-10Z"/><path d="M34 22h8M33 18l7-4"/><path d="M34 27c4 4 4 10 6 15"/><path d="M17 24c0-4 2-7 5-8"/>`,
  reumatologia: `<path class="f" d="M17 4v12c-4 2-4 8 2 8h10c6 0 6-6 2-8V4"/><path class="f" d="M17 31c0-3 14-3 14 0l-2 13H19Z"/><path d="M15 27.5h18"/><circle cx="34" cy="20" r="2.6"/>`,
  cirugia: `<path class="f" d="M24 24l8-8c4-4 9-6 11-7-1 4-4 10-8 13l-6 6Z"/><path d="M24 24L7 41"/><path d="M27 21l4 4"/>`,
  traumatologia: `<path class="f" d="M15 19l14 14c-2 3 0 7 3 7 2 0 3-1 3-3 2 0 5-1 5-4 0-3-4-5-7-4L19 15c2-3 0-7-3-7-2 0-3 1-3 3-2 0-5 1-5 4 0 3 4 5 7 4Z"/><path d="M22 23l3-1-1 3 3-1"/>`,
  urologia: `<ellipse class="f" cx="11" cy="13" rx="4.5" ry="6.5"/><ellipse class="f" cx="37" cy="13" rx="4.5" ry="6.5"/><path d="M13 19c2 5 5 7 7 8M35 19c-2 5-5 7-7 8"/><path class="f" d="M15 31c0-6 18-6 18 0 0 6-4 9-9 9s-9-3-9-9Z"/><path d="M24 40v4"/>`,
  otorrinolaringologia: `<path class="f" d="M30 39c0-5 4-7 6-11 4-6 2-18-8-20-8-2-14 4-14 12 0 4 1 6 1 6"/><path d="M20 20c0-5 4-7 8-6 4 1 5 6 2 9-3 2-4 4-3 7"/><path d="M30 39c-2 4-8 4-10 0"/>`,
  oftalmologia: `<path class="f" d="M4 24c6-10 13-14 20-14s14 4 20 14c-6 10-13 14-20 14S10 34 4 24Z"/><circle cx="24" cy="24" r="8"/><circle class="dot" cx="24" cy="24" r="3.5"/><circle cx="27" cy="21" r=".6"/>`,
  dermatologia: `<path class="f" d="M6 15c4-2 8 2 12 0s8 2 12 0 8 2 12 0v25H6Z"/><path d="M6 23h36M6 33h36"/><path d="M19 15V7"/><path d="M19 23c-2 3 0 6 2 6"/><path d="M33 33c-3-3 2-5-1-8"/>`,
  psiquiatria: `<path d="M30 43v-6c6 0 8-4 8-8l4-2-4-7c0-8-6-14-14-14S10 12 10 20c0 6 3 10 6 12v11"/><path class="f" d="M20 19c0-5 7-6 9-2s-3 7-6 5c-2-1-1-4 1-4"/>`,
  pediatria: `<circle class="f" cx="24" cy="18" r="9"/><path d="M24 9c-2-2 1-4 2-2"/><path d="M20 21c2 2 6 2 8 0"/><circle class="dot" cx="20.5" cy="17" r="1.2"/><circle class="dot" cx="27.5" cy="17" r="1.2"/><path class="f" d="M13 42c0-8 5-12 11-12s11 4 11 12"/>`,
  obstetricia: `<circle cx="24" cy="25" r="16"/><circle class="f" cx="21" cy="18" r="5"/><path class="f" d="M25 21c6 2 7 10 2 13-4 2-9 1-10-4 0-2 1-3 3-3"/>`,
  ginecologia: `<path class="f" d="M18 18c0-5 12-5 12 0 0 8-2 12-4 14v8h-4v-8c-2-2-4-6-4-14Z"/><path d="M18 18c-4-4-8-4-10 0M30 18c4-4 8-4 10 0"/><circle cx="8" cy="23" r="3"/><circle cx="40" cy="23" r="3"/>`,
  'salud-publica': `<circle class="f" cx="24" cy="13" r="5"/><circle class="f" cx="12" cy="18" r="4"/><circle class="f" cx="36" cy="18" r="4"/><path d="M15 40c0-8 4-13 9-13s9 5 9 13"/><path d="M4 38c0-6 3-10 8-10M44 38c0-6-3-10-8-10"/>`,
}

const MODULE = {
  cirugia: 2, traumatologia: 2, urologia: 2, otorrinolaringologia: 2, oftalmologia: 2, dermatologia: 2, psiquiatria: 2,
  pediatria: 3, obstetricia: 3, ginecologia: 3,
  'salud-publica': 4,
}

export const hasSpecialtyIcon = name => Boolean(ART[specialtySlug(name)])

export default function SpecialtyIcon({ name, size = 44 }) {
  const slug = specialtySlug(name)
  if (!ART[slug]) return null
  return (
    <span className={`mn-spi mn-spi-m${MODULE[slug] || 1}`} style={{ width: size, height: size, borderRadius: Math.round(size * 0.3) }} aria-hidden="true">
      <svg viewBox="0 0 48 48" style={{ width: size * 0.64, height: size * 0.64 }} dangerouslySetInnerHTML={{ __html: ART[slug] }} />
    </span>
  )
}
