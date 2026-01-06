// XP and leveling system utilities

// XP rewards
export const XP_PER_CORRECT = 10
export const XP_PER_INCORRECT = 2
export const XP_PER_TEST = 50
export const XP_PERFECT_BONUS = 100

// Calculate XP required for a specific level
// Formula: 100 * 1.5^(level-1)
export const getXPForLevel = (level) => {
    return Math.floor(100 * Math.pow(1.5, level - 1))
}

// Get level title based on current level
export const getLevelTitle = (level) => {
    if (level === 1) return 'Estudiante'
    if (level <= 5) return 'Interno'
    if (level <= 10) return 'Residente'
    if (level <= 15) return 'Especialista'
    if (level <= 20) return 'Médico Senior'
    return 'Profesor'
}

// Calculate level up progression
// Returns new level and remaining XP after level ups
export const calculateLevelUp = (currentXP, currentLevel) => {
    let xp = currentXP
    let level = currentLevel
    let xpForNextLevel = getXPForLevel(level + 1)

    while (xp >= xpForNextLevel) {
        xp -= xpForNextLevel
        level++
        xpForNextLevel = getXPForLevel(level + 1)
    }

    return {
        newLevel: level,
        remainingXP: xp,
        didLevelUp: level > currentLevel
    }
}

// Get progress percentage to next level
export const getLevelProgress = (currentXP, currentLevel) => {
    const xpForNextLevel = getXPForLevel(currentLevel + 1)
    return Math.min((currentXP / xpForNextLevel) * 100, 100)
}

// Format XP number with commas
export const formatXP = (xp) => {
    return xp.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
