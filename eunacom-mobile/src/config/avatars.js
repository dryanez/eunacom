// Doctor avatar configuration for gamification system
import { DOCTOR_CHARACTERS } from '../utils/doctorAvatars'

export const DOCTOR_AVATARS = DOCTOR_CHARACTERS

// Get avatar by ID
export const getAvatar = (avatarId) => {
    return DOCTOR_CHARACTERS.find(avatar => avatar.id === avatarId) || DOCTOR_CHARACTERS[0]
}

// Get avatar URL
export const getAvatarUrl = (avatarId) => {
    const avatar = getAvatar(avatarId)
    return avatar.image || '/avatars/dr_house.png'
}

// Get random avatar for new users
export const getRandomAvatar = () => {
    const randomIndex = Math.floor(Math.random() * DOCTOR_CHARACTERS.length)
    return DOCTOR_CHARACTERS[randomIndex].id
}

