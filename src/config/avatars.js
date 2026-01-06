// Doctor avatar configuration for gamification system

export const DOCTOR_AVATARS = [
    {
        id: 'house',
        name: 'Dr. Gregory House',
        show: 'House M.D.',
        color: '#2563eb',
        emoji: '🩺'
    },
    {
        id: 'hawkeye',
        name: 'Hawkeye Pierce',
        show: 'MASH',
        color: '#059669',
        emoji: '⚕️'
    },
    {
        id: 'grey',
        name: 'Dr. Meredith Grey',
        show: "Grey's Anatomy",
        color: '#dc2626',
        emoji: '🏥'
    },
    {
        id: 'zoidberg',
        name: 'Dr. John Zoidberg',
        show: 'Futurama',
        color: '#ec4899',
        emoji: '🦞'
    },
    {
        id: 'ross',
        name: 'Dr. Doug Ross',
        show: 'ER',
        color: '#f59e0b',
        emoji: '👨‍⚕️'
    },
    {
        id: 'blackjack',
        name: 'Black Jack',
        show: 'Black Jack',
        color: '#1f2937',
        emoji: '🎴'
    },
    {
        id: 'cox',
        name: 'Dr. Perry Cox',
        show: 'Scrubs',
        color: '#06b6d4',
        emoji: '😎'
    },
    {
        id: 'mccoy',
        name: 'Dr. Leonard "Bones" McCoy',
        show: 'Star Trek',
        color: '#8b5cf6',
        emoji: '🖖'
    },
    {
        id: 'chopper',
        name: 'Tony Tony Chopper',
        show: 'One Piece',
        color: '#f97316',
        emoji: '🦌'
    },
    {
        id: 'murphy',
        name: 'Dr. Shaun Murphy',
        show: 'The Good Doctor',
        color: '#10b981',
        emoji: '🧩'
    },
    {
        id: 'yang',
        name: 'Dr. Cristina Yang',
        show: "Grey's Anatomy",
        color: '#6366f1',
        emoji: '💪'
    },
    {
        id: 'riviera',
        name: 'Dr. Nick Riviera',
        show: 'The Simpsons',
        color: '#eab308',
        emoji: '👋'
    },
    {
        id: 'greene',
        name: 'Dr. Mark Greene',
        show: 'ER',
        color: '#14b8a6',
        emoji: '🏃'
    },
    {
        id: 'dorian',
        name: 'Dr. J.D. Dorian',
        show: 'Scrubs',
        color: '#a855f7',
        emoji: '🎭'
    },
    {
        id: 'scully',
        name: 'Dr. Dana Scully',
        show: 'X-Files',
        color: '#ef4444',
        emoji: '🔬'
    }
]

// Get avatar by ID
export const getAvatar = (avatarId) => {
    return DOCTOR_AVATARS.find(avatar => avatar.id === avatarId) || DOCTOR_AVATARS[0]
}

// Get avatar URL (using emoji as temporary placeholder)
export const getAvatarUrl = (avatarId) => {
    const avatar = getAvatar(avatarId)
    // For now, return a data URL with the emoji
    // Later we can replace with actual images
    return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="48" fill="${avatar.color}" opacity="0.2"/>
      <circle cx="50" cy="50" r="45" fill="${avatar.color}" opacity="0.1"/>
      <text x="50" y="50" font-size="40" text-anchor="middle" dominant-baseline="central">${avatar.emoji}</text>
    </svg>
  `)}`
}

// Get random avatar for new users
export const getRandomAvatar = () => {
    const randomIndex = Math.floor(Math.random() * DOCTOR_AVATARS.length)
    return DOCTOR_AVATARS[randomIndex].id
}
