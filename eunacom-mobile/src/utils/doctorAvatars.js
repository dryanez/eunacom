import { DOCTOR_LEVEL_PROGRESSION, getDoctorForLevel, calculateLevelUp } from './xpSystem'

// 10 Doctor personas mapped directly to level progression (Levels 1 to 10)
export const DOCTOR_CHARACTERS = DOCTOR_LEVEL_PROGRESSION.map(doc => ({
  ...doc,
  shortSpec: doc.specialty ? doc.specialty.split('&')[0].trim() : doc.title
}))

export const getRandomDoctorAvatar = () => {
  const randomIndex = Math.floor(Math.random() * DOCTOR_CHARACTERS.length)
  return DOCTOR_CHARACTERS[randomIndex]
}

export const isDoctorUnlocked = (doctorId, userLevel = 1) => {
  const doc = DOCTOR_CHARACTERS.find(d => d.id === doctorId)
  if (!doc) return true
  return (doc.level || 1) <= userLevel
}

export const getDoctorAvatar = (userOrId, optionalLevel = null) => {
  if (!userOrId) return DOCTOR_CHARACTERS[0] // Dr. John Dorian (Level 1)

  // If a string doctor ID was passed directly (e.g. 'dr_murphy')
  if (typeof userOrId === 'string') {
    const direct = DOCTOR_CHARACTERS.find(d => d.id === userOrId)
    if (direct) return direct
  }

  // Determine user level
  let userLevel = optionalLevel || userOrId?.level || userOrId?.user_level
  if (!userLevel && (userOrId?.xp || userOrId?.total_xp || userOrId?.totalXP)) {
    const xp = Number(userOrId?.xp || userOrId?.total_xp || userOrId?.totalXP || 0)
    userLevel = calculateLevelUp(xp, 1).newLevel
  }
  if (!userLevel) userLevel = 1

  // If user explicitly chose a doctor character in settings
  const charId = userOrId?.avatar_character || userOrId?.selected_doctor
  if (charId) {
    const match = DOCTOR_CHARACTERS.find(d => d.id === charId)
    if (match) {
      // Check if unlocked for user's level (level <= userLevel)
      if ((match.level || 1) <= userLevel) {
        return match
      }
    }
  }

  // Default doctor is ALWAYS the doctor corresponding to user's level!
  return getDoctorForLevel(userLevel) || DOCTOR_CHARACTERS[0]
}
