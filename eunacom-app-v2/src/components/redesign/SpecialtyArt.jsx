import React from 'react'
import { specialtySlug } from '../../lib/specialtyImage'

// Ilustraciones a color de cada especialidad (mismo estilo que los Accesos rápidos del Inicio):
// órganos reconocibles, sin caja, con un brillo suave del color de la especialidad detrás. viewBox 0 0 64 64.
const W = '#f8fafc', BONE = 'stroke="#cbd5e1" stroke-width="1.5"'
const ART = {
  cardiologia: ['#ef4444', `
    <path d="M27 17V10c0-5 11-5 11 0v4" stroke="#f87171" stroke-width="5.5" fill="none"/>
    <path d="M38 13h8" stroke="#60a5fa" stroke-width="4.5"/>
    <path fill="#ef4444" d="M32 57C18 48 9 39 9 28c0-8 6-14 13-14 4 0 7 2 10 5 3-3 6-5 10-5 7 0 13 6 13 14 0 11-9 20-23 29Z"/>
    <path d="M31 25c5 5 6 13 3 23" stroke="#b91c1c" stroke-width="2.2" fill="none"/>
    <path d="M16 25c1-4 4-6 7-6" stroke="#fecaca" stroke-width="3" fill="none"/>`],
  neurologia: ['#ec4899', `
    <path fill="#f9a8d4" d="M20 46c-8-1-12-7-11-13-3-5 0-12 6-14 2-7 11-9 17-6 6-3 15 0 17 7 5 3 5 11 1 14 0 6-6 10-12 8l-1 7h-6v-7c-4 1-8 1-11-1Z"/>
    <g stroke="#db2777" stroke-width="2.2" fill="none"><path d="M18 26c4-2 7 0 6 5"/><path d="M32 17c2 4 7 4 9 8"/><path d="M19 37c5-3 10 0 15-2"/><path d="M31 27c0 4 4 5 7 4"/><path d="M42 36c2 2 5 2 6 0"/></g>
    <path d="M15 22c1-2 3-4 5-4" stroke="#fce7f3" stroke-width="2.5" fill="none"/>`],
  respiratorio: ['#f43f5e', `
    <path d="M32 5v19" stroke="#93c5fd" stroke-width="5"/><path d="M32 24l-7 6M32 24l7 6" stroke="#93c5fd" stroke-width="4" fill="none"/>
    <path fill="#fb7185" d="M27 17c-8 0-16 11-16 24 0 8 5 12 10 12 4 0 6-3 6-7Z"/>
    <path fill="#fb7185" d="M37 17c8 0 16 11 16 24 0 8-5 12-10 12-4 0-6-3-6-7Z"/>
    <g stroke="#e11d48" stroke-width="1.8" fill="none"><path d="M25 32l-6 6M25 38l-5 7"/><path d="M39 32l6 6M39 38l5 7"/></g>
    <path d="M15 34c1-5 3-9 6-12" stroke="#fecdd3" stroke-width="2.5" fill="none"/>`],
  gastroenterologia: ['#f97316', `
    <path d="M25 4c0 6 0 10-1 14" stroke="#fdba74" stroke-width="5" fill="none"/>
    <path fill="#fb923c" d="M24 16c-3 4-6 6-8 9-6 8-4 20 4 25 9 6 21 3 26-5 4-6 2-13-4-14-5-1-8 2-10 6-1-7 0-14-1-19Z"/>
    <path d="M47 42c3 4 6 7 10 7" stroke="#f97316" stroke-width="4.5" fill="none"/>
    <path d="M18 30c0-3 2-6 4-8" stroke="#fed7aa" stroke-width="2.5" fill="none"/>
    <path d="M23 40c4 3 10 4 15 1" stroke="#ea580c" stroke-width="2" fill="none"/>`],
  hematologia: ['#dc2626', `
    <path fill="#dc2626" d="M32 5S15 25 15 37c0 9 8 17 17 17s17-8 17-17C49 25 32 5 32 5Z"/>
    <ellipse cx="30" cy="38" rx="9" ry="6" fill="#fecaca"/><ellipse cx="30" cy="38" rx="4" ry="2.3" fill="#f87171"/>
    <path d="M21 33c0-4 2-8 5-12" stroke="#fca5a5" stroke-width="2.5" fill="none"/>`],
  infectologia: ['#22c55e', `
    <g stroke="#16a34a" stroke-width="3"><path d="M32 18V9M32 46v9M18 32H9M46 32h9M22 22l-6-6M42 42l6 6M42 22l6-6M22 42l-6 6"/></g>
    <g fill="#86efac"><circle cx="32" cy="8" r="3.4"/><circle cx="32" cy="56" r="3.4"/><circle cx="8" cy="32" r="3.4"/><circle cx="56" cy="32" r="3.4"/><circle cx="15" cy="15" r="3.4"/><circle cx="49" cy="49" r="3.4"/><circle cx="49" cy="15" r="3.4"/><circle cx="15" cy="49" r="3.4"/></g>
    <circle cx="32" cy="32" r="14" fill="#22c55e"/>
    <g fill="#15803d"><circle cx="27" cy="29" r="3"/><circle cx="37" cy="36" r="2.4"/><circle cx="36" cy="26" r="1.6"/></g>
    <path d="M23 27c1-3 3-5 6-6" stroke="#bbf7d0" stroke-width="2.2" fill="none"/>`],
  endocrinologia: ['#8b5cf6', `
    <path d="M32 4v56" stroke="#cbd5e1" stroke-width="6"/>
    <g stroke="#94a3b8" stroke-width="2"><path d="M28.5 10h7M28.5 17h7M28.5 47h7M28.5 54h7"/></g>
    <path fill="#8b5cf6" d="M30 21c-9-6-18 0-16 12 2 11 11 14 16 8Z"/><path fill="#8b5cf6" d="M34 21c9-6 18 0 16 12-2 11-11 14-16 8Z"/>
    <rect x="28" y="29" width="8" height="8" rx="2" fill="#7c3aed"/>
    <path d="M18 28c1-3 3-5 6-5M40 23c3 0 5 2 6 5" stroke="#c4b5fd" stroke-width="2.2" fill="none"/>`],
  diabetes: ['#0ea5e9', `
    <rect x="25" y="3" width="9" height="12" rx="1.5" fill="${W}" ${BONE}/>
    <rect x="13" y="12" width="33" height="45" rx="9" fill="#0ea5e9"/>
    <rect x="18" y="18" width="23" height="15" rx="3.5" fill="#e0f2fe"/>
    <text x="29.5" y="29.5" text-anchor="middle" font-size="10" font-weight="800" fill="#0369a1" font-family="Lexend,sans-serif">112</text>
    <circle cx="23" cy="44" r="3.5" fill="#bae6fd"/><circle cx="36" cy="44" r="3.5" fill="#bae6fd"/>
    <path fill="#ef4444" d="M53 34s-6 7-6 10.5a6 6 0 0 0 12 0C59 41 53 34 53 34Z"/>`],
  nefrologia: ['#e11d48', `
    <path d="M44 28h13" stroke="#ef4444" stroke-width="4.5"/><path d="M43 22l11-6" stroke="#3b82f6" stroke-width="4.5"/>
    <path d="M42 36c6 6 6 14 9 22" stroke="#fbbf24" stroke-width="3.5" fill="none"/>
    <path fill="#e11d48" d="M37 7C24 5 11 15 11 31s13 26 26 24c8-1 12-7 8-13-4-5-4-12 0-17 4-6 1-16-8-18Z"/>
    <path d="M42 25c-6 0-9 3-9 7s3 8 9 8" stroke="#fecdd3" stroke-width="3" fill="none"/>
    <path d="M17 27c1-6 4-10 9-12" stroke="#fda4af" stroke-width="2.5" fill="none"/>`],
  reumatologia: ['#f43f5e', `
    <circle cx="32" cy="34" r="15" fill="#fb7185" opacity=".45"/>
    <path fill="${W}" ${BONE} d="M26 4h12v19c5 2 6 9 0 10H26c-6-1-5-8 0-10Z"/>
    <path fill="${W}" ${BONE} d="M25 38h14c4 1 4 6 0 7l-1 15H26l-1-15c-4-1-4-6 0-7Z"/>
    <rect x="22" y="33.5" width="20" height="4" rx="2" fill="#60a5fa"/>
    <path d="M47 22l4-3M50 30h5M15 22l-4-3M14 30H9" stroke="#f43f5e" stroke-width="2.5"/>`],
  cirugia: ['#38bdf8', `
    <path fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5" d="M30 35L45 20c5-5 11-8 14-9-1 5-5 12-10 16l-9 9Z"/>
    <path d="M46 22c3-3 7-6 10-8" stroke="#fff" stroke-width="1.8" fill="none"/>
    <path d="M31 34L9 56" stroke="#475569" stroke-width="7.5"/>
    <path d="M18 47l3 3M14 51l3 3" stroke="#94a3b8" stroke-width="1.8"/>
    <path d="M6 20c3-3 6 3 9 0s6 3 9 0" stroke="#f43f5e" stroke-width="2" fill="none"/><path d="M8 17v6M14 17v6M20 17v6" stroke="#0ea5e9" stroke-width="1.8"/>`],
  traumatologia: ['#f59e0b', `
    <path fill="${W}" ${BONE} d="M21 26l18 18c-3 4 0 10 5 10 3 0 4-1 4-4 3 0 8-1 8-6 0-4-5-8-10-6L26 21c3-5 0-10-5-10-3 0-4 1-4 4-3 0-8 1-8 6 0 5 5 7 12 5Z"/>
    <path d="M28 32l4-1-1 4 4-1" stroke="#ef4444" stroke-width="2.6" fill="none"/>
    <path d="M14 18c1-1 2-2 4-2" stroke="#e2e8f0" stroke-width="2" fill="none"/>`],
  urologia: ['#f59e0b', `
    <ellipse cx="13" cy="15" rx="6" ry="9" fill="#e11d48"/><ellipse cx="51" cy="15" rx="6" ry="9" fill="#e11d48"/>
    <path d="M16 22c3 7 7 11 10 13M48 22c-3 7-7 11-10 13" stroke="#fbbf24" stroke-width="3" fill="none"/>
    <path fill="#fde68a" stroke="#f59e0b" stroke-width="2.5" d="M19 40c0-8 26-8 26 0 0 9-6 13-13 13s-13-4-13-13Z"/>
    <path d="M32 53v7" stroke="#f59e0b" stroke-width="3"/><path d="M24 41c1-2 3-3 5-3" stroke="#fff" stroke-width="2" fill="none"/>`],
  otorrinolaringologia: ['#f97316', `
    <path fill="#fdba74" d="M31 5c-12 0-21 9-21 21 0 6 2 10 4 13 2 4 2 8 4 12 3 6 8 9 13 8 5-1 8-5 7-10-1-3 0-5 2-8 5-5 11-10 11-19C51 13 43 5 31 5Z"/>
    <path d="M20 26c0-7 5-12 11-12s11 5 11 11c0 5-3 8-6 10" stroke="#ea580c" stroke-width="2.6" fill="none"/>
    <path d="M27 29c1-4 7-4 7 0 0 3-3 4-3 8" stroke="#ea580c" stroke-width="2.4" fill="none"/>
    <path d="M15 22c1-4 3-7 6-9" stroke="#fed7aa" stroke-width="2.4" fill="none"/>
    <path d="M54 24c2.5 3.5 2.5 8.5 0 12M59 19c5 6 5 16 0 22" stroke="#38bdf8" stroke-width="2.6" fill="none"/>`],
  oftalmologia: ['#0ea5e9', `
    <path fill="${W}" stroke="#94a3b8" stroke-width="2" d="M4 32c7-12 16-18 28-18s21 6 28 18c-7 12-16 18-28 18S11 44 4 32Z"/>
    <circle cx="32" cy="32" r="12" fill="#0ea5e9"/><circle cx="32" cy="32" r="7.5" fill="#0369a1"/>
    <circle cx="32" cy="32" r="4.5" fill="#0f172a"/><circle cx="36" cy="28" r="2.6" fill="#fff"/>
    <path d="M16 22l-3-5M24 17l-1-5M40 17l1-5M48 22l3-5" stroke="#475569" stroke-width="2"/>`],
  dermatologia: ['#f59e0b', `
    <path fill="#fde68a" d="M7 42h50v10a5 5 0 0 1-5 5H12a5 5 0 0 1-5-5Z"/>
    <rect x="7" y="28" width="50" height="14" fill="#fda4af"/>
    <path fill="#fcd9b8" d="M7 21c6-3 11 2 17 0s11 2 17 0 11 2 16 0v7H7Z"/>
    <path d="M7 36c10-3 20 3 30 0s14 2 20 0" stroke="#ef4444" stroke-width="2" fill="none"/>
    <path d="M26 46V25l-3-14" stroke="#78350f" stroke-width="2.2" fill="none"/><circle cx="26" cy="46" r="3.4" fill="#b45309"/>
    <circle cx="45" cy="21.5" r="2.8" fill="#78350f"/>`],
  psiquiatria: ['#8b5cf6', `
    <path fill="#a78bfa" d="M38 59v-8c8 0 11-5 11-11l5-3-5-9c0-11-8-20-19-20S10 16 10 27c0 8 4 13 8 16v16Z"/>
    <path d="M26 27c0-6 9-8 12-2s-4 10-8 7c-3-2-1-6 2-5" stroke="#f5f3ff" stroke-width="2.6" fill="none"/>
    <circle cx="44" cy="12" r="2.4" fill="#fbbf24"/><circle cx="51" cy="18" r="1.6" fill="#fbbf24"/>`],
  pediatria: ['#3b82f6', `
    <path fill="#60a5fa" d="M15 60c0-10 7-15 17-15s17 5 17 15Z"/>
    <circle cx="32" cy="29" r="16" fill="#fcd9b8"/>
    <path d="M31 13c-2-5 4-7 5-3" stroke="#92400e" stroke-width="2.2" fill="none"/>
    <circle cx="26" cy="28" r="2" fill="#1e293b"/><circle cx="38" cy="28" r="2" fill="#1e293b"/>
    <circle cx="22" cy="34" r="3" fill="#fda4af"/><circle cx="42" cy="34" r="3" fill="#fda4af"/>
    <path d="M28 35c2 3 6 3 8 0" stroke="#1e293b" stroke-width="2" fill="none"/>`],
  obstetricia: ['#ec4899', `
    <circle cx="32" cy="33" r="24" fill="#fce7f3" stroke="#f472b6" stroke-width="2.5"/>
    <path fill="#fcd9b8" d="M34 28c10 2 12 15 5 20-6 4-14 3-16-4-1-3 1-6 5-6"/>
    <circle cx="28" cy="22" r="8" fill="#fcd9b8"/>
    <path d="M34 42c5 3 10 2 14 7" stroke="#f472b6" stroke-width="2.2" fill="none"/>
    <circle cx="25.5" cy="22" r="1.2" fill="#9a3412"/>`],
  ginecologia: ['#ec4899', `
    <path d="M23 24c-5-6-12-6-15 0M41 24c5-6 12-6 15 0" stroke="#ec4899" stroke-width="3.2" fill="none"/>
    <ellipse cx="9" cy="31" rx="4.5" ry="5.5" fill="#f9a8d4" stroke="#ec4899" stroke-width="2"/><ellipse cx="55" cy="31" rx="4.5" ry="5.5" fill="#f9a8d4" stroke="#ec4899" stroke-width="2"/>
    <path fill="#f472b6" d="M22 23c0-7 20-7 20 0 0 12-3 17-6 20v13h-8V43c-3-3-6-8-6-20Z"/>
    <path d="M27 24c0 6 2 10 5 13 3-3 5-7 5-13" fill="#fbcfe8"/>
    <path d="M25 22c1-2 3-3 5-3" stroke="#fce7f3" stroke-width="2" fill="none"/>`],
  'salud-publica': ['#14b8a6', `
    <circle cx="14" cy="22" r="6" fill="#5eead4"/><path fill="#5eead4" d="M3 50c0-10 5-17 11-17s11 7 11 17Z"/>
    <circle cx="50" cy="22" r="6" fill="#5eead4"/><path fill="#5eead4" d="M39 50c0-10 5-17 11-17s11 7 11 17Z"/>
    <circle cx="32" cy="17" r="8" fill="#14b8a6"/><path fill="#14b8a6" d="M17 56c0-14 7-23 15-23s15 9 15 23Z"/>
    <path d="M32 40v10M27 45h10" stroke="#fff" stroke-width="3.2"/>`],
}

export const hasSpecialtyArt = name => Boolean(ART[specialtySlug(name)])

export default function SpecialtyArt({ name, size = 52 }) {
  const a = ART[specialtySlug(name)]
  if (!a) return null
  return (
    <span className="spa" style={{ width: size, height: size, '--sa': a[0] }} aria-hidden="true">
      <svg viewBox="0 0 64 64" width={size} height={size} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: a[1] }} />
    </span>
  )
}
