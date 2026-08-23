// XP, Doctor Avatar Evolution & Leveling System for EUNACOM Platform
// Maps 10 progressive doctor personas to student XP milestones with level-up events

export const XP_PER_CORRECT = 10
export const XP_PER_INCORRECT = 2
export const XP_PER_TEST = 50
export const XP_PERFECT_BONUS = 100

// ─── 10 DOCTOR EVOLUTION LEVELS ──────────────────────────────────────────────
export const DOCTOR_LEVEL_PROGRESSION = [
  {
    level: 1,
    id: 'dr_dorian',
    name: 'Dr. John Dorian (J.D.)',
    title: 'Médico Interno Novato',
    show: 'Scrubs',
    specialty: 'Medicina Interna & Propedéutica',
    image: '/avatars/dr_dorian.png',
    avatarBg: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
    emoji: '🩺',
    quote: 'Empatía, escucha activa y primer día de guardia.',
    minXp: 0,
    requiredXpForNext: 150,
    rewardGems: 50,
    badgeText: 'Nivel 1 · Interno'
  },
  {
    level: 2,
    id: 'dr_adams',
    name: 'Dr. Patch Adams',
    title: 'Médico Familiar & Humanista',
    show: 'Patch Adams',
    specialty: 'Medicina Familiar & Comunitaria',
    image: '/avatars/dr_adams.png',
    avatarBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    emoji: '🎈',
    quote: 'Tratar a la persona, no solo la enfermedad.',
    minXp: 150,
    requiredXpForNext: 350,
    rewardGems: 75,
    badgeText: 'Nivel 2 · Familiar'
  },
  {
    level: 3,
    id: 'dr_mccoy',
    name: 'Dr. Leonard McCoy',
    title: 'Oficial de Urgencias & Triage',
    show: 'Star Trek',
    specialty: 'Urgencias Médicas & Soporte Vital',
    image: '/avatars/dr_mccoy.png',
    avatarBg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    emoji: '🚀',
    quote: 'Decisión rápida en el box de reanimación.',
    minXp: 500,
    requiredXpForNext: 750,
    rewardGems: 100,
    badgeText: 'Nivel 3 · Urgencias'
  },
  {
    level: 4,
    id: 'dr_cox',
    name: 'Dr. Perry Cox',
    title: 'Médico Internista Tratante',
    show: 'Scrubs',
    specialty: 'Medicina Interna de Alta Complejidad',
    image: '/avatars/dr_cox.png',
    avatarBg: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
    emoji: '🥼',
    quote: 'Rigor clínico implacable: la semiología no perdona.',
    minXp: 1250,
    requiredXpForNext: 1200,
    rewardGems: 125,
    badgeText: 'Nivel 4 · Internista'
  },
  {
    level: 5,
    id: 'dr_murphy',
    name: 'Dr. Shaun Murphy',
    title: 'Cirujano Pediátrico Prodigio',
    show: 'The Good Doctor',
    specialty: 'Pediatría & Cirugía Infantil',
    image: '/avatars/dr_murphy.png',
    avatarBg: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    emoji: '🧩',
    quote: 'Visión espacial, memoria eidética y detalle anatómico.',
    minXp: 2450,
    requiredXpForNext: 1800,
    rewardGems: 150,
    badgeText: 'Nivel 5 · Pediatría'
  },
  {
    level: 6,
    id: 'dr_grey',
    name: 'Dra. Meredith Grey',
    title: 'Cirujana General & Jefa de Turno',
    show: "Grey's Anatomy",
    specialty: 'Cirugía General & Trauma',
    image: '/avatars/dr_grey.png',
    avatarBg: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
    emoji: '🩺',
    quote: 'Resiliencia, temple bajo presión y juicio quirúrgico.',
    minXp: 4250,
    requiredXpForNext: 2500,
    rewardGems: 175,
    badgeText: 'Nivel 6 · Cirujana'
  },
  {
    level: 7,
    id: 'dr_shepherd',
    name: 'Dr. Derek Shepherd',
    title: 'Jefe de Neurocirugía',
    show: "Grey's Anatomy",
    specialty: 'Neurocirugía & Casos Críticos',
    image: '/avatars/dr_shepherd.png',
    avatarBg: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    emoji: '⚡',
    quote: 'Es un hermoso día para salvar vidas.',
    minXp: 6750,
    requiredXpForNext: 3500,
    rewardGems: 200,
    badgeText: 'Nivel 7 · Neurocirugía'
  },
  {
    level: 8,
    id: 'dr_yang',
    name: 'Dra. Cristina Yang',
    title: 'Maestra en Cirugía Cardiovascular',
    show: "Grey's Anatomy",
    specialty: 'Cardiología & Hemodinámica',
    image: '/avatars/dr_yang.png',
    avatarBg: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
    emoji: '❤️',
    quote: 'Mente fría, pulso perfecto y excelencia absoluta.',
    minXp: 10250,
    requiredXpForNext: 5000,
    rewardGems: 250,
    badgeText: 'Nivel 8 · Cardiovascular'
  },
  {
    level: 9,
    id: 'dr_strange',
    name: 'Dr. Stephen Strange',
    title: 'Especialista en Casos Imposibles',
    show: 'Marvel Multiverse',
    specialty: 'Medicina Avanzada & Criterio Multivariable',
    image: '/avatars/dr_strange.png',
    avatarBg: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    emoji: '🔮',
    quote: 'Control de variables, anticipación y diagnóstico supremo.',
    minXp: 15250,
    requiredXpForNext: 7500,
    rewardGems: 300,
    badgeText: 'Nivel 9 · Maestro Clínico'
  },
  {
    level: 10,
    id: 'dr_house',
    name: 'Dr. Gregory House',
    title: 'Jefe Supremo de Diagnóstico EUNACOM',
    show: 'House M.D.',
    specialty: 'Infectología, Nefrología & Semiología Pura',
    image: '/avatars/dr_house.png',
    avatarBg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    emoji: '🩺',
    quote: 'Todos mienten, pero el EUNACOM no. Dominio absoluto.',
    minXp: 22750,
    requiredXpForNext: 10000,
    rewardGems: 500,
    badgeText: 'Nivel 10 · Leyenda EUNACOM'
  }
]

// Get Doctor info corresponding to a level
export const getDoctorForLevel = (level = 1) => {
  const index = Math.max(0, Math.min(DOCTOR_LEVEL_PROGRESSION.length - 1, level - 1))
  return DOCTOR_LEVEL_PROGRESSION[index]
}

// Calculate XP required for a specific level
export const getXPForLevel = (level) => {
  if (level <= 0) return 0
  const doc = DOCTOR_LEVEL_PROGRESSION[level - 1]
  if (doc) return doc.requiredXpForNext
  // Beyond level 10: 10,000 + 2,500 for each prestige level
  return 10000 + (level - 10) * 2500
}

// Get level title based on current level
export const getLevelTitle = (level) => {
  const doc = DOCTOR_LEVEL_PROGRESSION[level - 1]
  if (doc) return doc.title
  return `Leyenda EUNACOM · Prestigio ${level - 10}`
}

// Calculate level up progression based on cumulative total XP
export const calculateLevelUp = (totalXP = 0, currentLevel = 1) => {
  let level = 1
  for (let i = 0; i < DOCTOR_LEVEL_PROGRESSION.length; i++) {
    const doc = DOCTOR_LEVEL_PROGRESSION[i]
    if (totalXP >= doc.minXp) {
      level = doc.level
    } else {
      break
    }
  }

  // Beyond level 10
  const maxDefined = DOCTOR_LEVEL_PROGRESSION[DOCTOR_LEVEL_PROGRESSION.length - 1]
  if (totalXP >= maxDefined.minXp + maxDefined.requiredXpForNext) {
    const excess = totalXP - (maxDefined.minXp + maxDefined.requiredXpForNext)
    const extraLevels = Math.floor(excess / 12500)
    level = 10 + extraLevels + 1
  }

  return {
    newLevel: level,
    didLevelUp: level > currentLevel,
    doctor: getDoctorForLevel(level)
  }
}

// Get progress percentage to next level
export const getLevelProgress = (currentXP = 0, currentLevel = 1) => {
  const doc = DOCTOR_LEVEL_PROGRESSION[currentLevel - 1]
  if (!doc) {
    // Prestige level
    const base = 22750 + (currentLevel - 10) * 12500
    const next = base + 12500
    const progress = Math.max(0, currentXP - base)
    return Math.min(100, (progress / 12500) * 100)
  }
  const currentLevelMinXp = doc.minXp
  const neededForNext = doc.requiredXpForNext
  const progressInLevel = Math.max(0, currentXP - currentLevelMinXp)
  return Math.min(100, Math.max(0, (progressInLevel / neededForNext) * 100))
}

// Format XP number with commas
export const formatXP = (xp = 0) => {
  return Number(xp || 0).toLocaleString()
}
