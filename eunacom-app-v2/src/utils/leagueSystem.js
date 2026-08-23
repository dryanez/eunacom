// League & Cohort System for MedLingo EUNACOM
// Manages weekly ranks, promotion/demotion zones, and leaderboard cohorts

export const LEAGUE_TIERS = [
  {
    id: 'interno',
    name: 'Liga Interno (Bronce)',
    color: '#cd7f32',
    icon: '🥉',
    minXp: 0,
    badgeBg: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)',
    description: 'El inicio de la guardia. Avanza al top 5 para ascender a Residente.'
  },
  {
    id: 'residente',
    name: 'Liga Residente (Plata)',
    color: '#94a3b8',
    icon: '🥈',
    minXp: 150,
    badgeBg: 'linear-gradient(135deg, #64748b 0%, #334155 100%)',
    description: 'Médicos constantes en guardia. Top 5 ascienden a Becado.'
  },
  {
    id: 'becado',
    name: 'Liga Becado (Oro)',
    color: '#eab308',
    icon: '🥇',
    minXp: 400,
    badgeBg: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
    description: 'Especialistas en formación. Rendimiento clínico superior.'
  },
  {
    id: 'staff',
    name: 'Liga Staff (Zafiro)',
    color: '#38bdf8',
    icon: '💎',
    minXp: 800,
    badgeBg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    description: 'Médicos de planta. Dominio de guías MINSAL y algoritmos.'
  },
  {
    id: 'jefe_servicio',
    name: 'Liga Jefe de Servicio (Diamante)',
    color: '#a855f7',
    icon: '👑',
    minXp: 1500,
    badgeBg: 'linear-gradient(135deg, #9333ea 0%, #6b21a8 100%)',
    description: 'La élite médica. Los mejores puntajes del país.'
  },
  {
    id: 'maestro_eunacom',
    name: 'Maestro EUNACOM (Legendario)',
    color: '#f43f5e',
    icon: '🏆',
    minXp: 3000,
    badgeBg: 'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)',
    description: 'Distinción máxima garantizada en el Examen Nacional.'
  }
]

import { DOCTOR_CHARACTERS, getDoctorAvatar } from './doctorAvatars'

// Generate simulated weekly cohort competitors
export const getLeagueCohort = (userXp = 50, userLevel = 1, currentTierId = 'residente', userProfile = null) => {
  const sampleNames = [
    { name: 'Dra. Camila Soto', avatar_character: 'dr_yang', image: '/avatars/dr_yang.png', university: 'Universidad de Chile (UCH)', sede: 'Santiago (Norte)', country: 'Chile', xp: userXp + 45 },
    { name: 'Dr. Matías Valenzuela', avatar_character: 'dr_shepherd', image: '/avatars/dr_shepherd.png', university: 'Pontificia Universidad Católica de Chile (PUC)', sede: 'Santiago (Casa Central)', country: 'Chile', xp: userXp + 25 },
    { name: 'Dra. Fernanda Rojas', avatar_character: 'dr_grey', image: '/avatars/dr_grey.png', university: 'Universidad de Concepción (UdeC)', sede: 'Concepción', country: 'Chile', xp: userXp + 10 },
    { 
      name: userProfile?.first_name ? `Dr(a). ${userProfile.first_name} ${userProfile.last_name || ''}` : 'Tú (Médico Postulante)', 
      avatar_character: userProfile?.avatar_character || 'dr_house', 
      image: getDoctorAvatar(userProfile || { avatar_character: 'dr_house' }).image,
      university: userProfile?.university || 'Universidad de Chile (UCH)',
      sede: userProfile?.sede || 'Santiago',
      country: userProfile?.country || 'Chile',
      xp: userXp, 
      isUser: true 
    },
    { name: 'Dr. Carlos Mendoza', avatar_character: 'dr_murphy', image: '/avatars/dr_murphy.png', university: 'Universidad Central de Venezuela', sede: 'Caracas', country: 'Venezuela', xp: Math.max(10, userXp - 15) },
    { name: 'Dra. Valentina Castro', avatar_character: 'dr_strange', image: '/avatars/dr_strange.png', university: 'Universidad Andrés Bello (UNAB)', sede: 'Viña del Mar', country: 'Chile', xp: Math.max(5, userXp - 30) },
    { name: 'Dr. Andrés Ospina', avatar_character: 'dr_adams', image: '/avatars/dr_adams.png', university: 'Universidad de Antioquia', sede: 'Medellín', country: 'Colombia', xp: Math.max(0, userXp - 45) },
    { name: 'Dra. Javiera Silva', avatar_character: 'dr_cox', image: '/avatars/dr_cox.png', university: 'Universidad de Valparaíso (UV)', sede: 'Valparaíso', country: 'Chile', xp: Math.max(0, userXp - 60) }
  ]

  // Sort by XP descending
  const sorted = sampleNames.sort((a, b) => b.xp - a.xp)
  return sorted.map((player, idx) => {
    let zone = 'safe'
    if (idx < 3) zone = 'promotion' // Top 3 promote ⬆
    else if (idx >= sorted.length - 2) zone = 'demotion' // Bottom 2 demote ⬇

    return {
      ...player,
      avatarImage: player.image || getDoctorAvatar(player).image,
      rank: idx + 1,
      zone
    }
  })
}

// Get countdown to next Sunday 23:59:59
export const getWeeklyResetTimeLeft = () => {
  const now = new Date()
  const day = now.getDay() // 0 = Sunday
  const daysUntilSunday = (7 - day) % 7
  const nextSunday = new Date(now)
  nextSunday.setDate(now.getDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday))
  nextSunday.setHours(23, 59, 59, 999)

  const diffMs = nextSunday - now
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24

  return `${days}d ${remainingHours}h`
}
