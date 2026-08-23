// Gamification State Store for MedLingo EUNACOM
// Manages Hearts, Streaks, Gems, XP, Mentors, Daily Quests & Node Progression
// Supports LocalStorage (Offline instant cache) + Supabase Cloud Sync

import { supabase } from '../lib/supabase'

const STORAGE_KEY_PREFIX = 'medlingo_state_'
const HEART_REGEN_MINUTES = 30
export const MAX_HEARTS = 5

export const DEFAULT_STATE = {
  currentStreak: 1,
  longestStreak: 1,
  lastStudyDate: null,
  streakFrozen: false,
  streakFreezeTokens: 1, // 1 free starter streak freeze
  hearts: MAX_HEARTS,
  lastHeartLostTimestamp: null,
  xp: 0,
  gems: 150, // Starter gems
  activeMentorId: 'dr_house',
  completedNodes: {}, // { [nodeId]: { stars: 3, scorePercent: 100, completedAt: '...' } }
  openedChests: {},   // { [chestId]: true }
  dailyQuests: {
    date: null,
    lessonsCompleted: 0, // Target: 2
    perfectLessons: 0,   // Target: 1
    xpGainedToday: 0,    // Target: 50
    claimed: { q1: false, q2: false, q3: false }
  },
  inventory: {
    streakFreeze: 1,
    doubleXpActiveUntil: null
  }
}

// Get today's local date string: YYYY-MM-DD
export const getTodayDateString = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Calculate regenerated hearts based on elapsed time
export const computeRegeneratedHearts = (state) => {
  if (state.hearts >= MAX_HEARTS) return { hearts: MAX_HEARTS, lastHeartLostTimestamp: null }
  if (!state.lastHeartLostTimestamp) return { hearts: state.hearts, lastHeartLostTimestamp: null }

  const now = Date.now()
  const elapsedMs = now - state.lastHeartLostTimestamp
  const regenIntervalMs = HEART_REGEN_MINUTES * 60 * 1000
  const heartsGained = Math.floor(elapsedMs / regenIntervalMs)

  if (heartsGained <= 0) return { hearts: state.hearts, lastHeartLostTimestamp: state.lastHeartLostTimestamp }

  const newHearts = Math.min(MAX_HEARTS, state.hearts + heartsGained)
  const remainingTime = newHearts >= MAX_HEARTS ? null : state.lastHeartLostTimestamp + (heartsGained * regenIntervalMs)

  return {
    hearts: newHearts,
    lastHeartLostTimestamp: remainingTime
  }
}

// Get time remaining in seconds for next heart regeneration
export const getNextHeartCountdownSeconds = (state) => {
  if (state.hearts >= MAX_HEARTS || !state.lastHeartLostTimestamp) return 0
  const now = Date.now()
  const regenIntervalMs = HEART_REGEN_MINUTES * 60 * 1000
  const nextRegenTime = state.lastHeartLostTimestamp + regenIntervalMs
  const diffMs = nextRegenTime - now
  return Math.max(0, Math.floor(diffMs / 1000))
}

// Load gamification state from localStorage (and sync with remote if available)
export const loadGamificationState = (userId = 'guest') => {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`)
    let state = raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : { ...DEFAULT_STATE }

    // Regenerate hearts
    const regen = computeRegeneratedHearts(state)
    state.hearts = regen.hearts
    state.lastHeartLostTimestamp = regen.lastHeartLostTimestamp

    // Reset daily quests if new day
    const today = getTodayDateString()
    if (state.dailyQuests?.date !== today) {
      state.dailyQuests = {
        date: today,
        lessonsCompleted: 0,
        perfectLessons: 0,
        xpGainedToday: 0,
        claimed: { q1: false, q2: false, q3: false }
      }
    }

    return state
  } catch (err) {
    console.error('Error loading gamification state:', err)
    return { ...DEFAULT_STATE }
  }
}

// Save state to localStorage & asynchronously sync to Supabase Cloud
export const saveGamificationState = async (userId = 'guest', state) => {
  try {
    // 1. Instant local persistence for zero-latency UI
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(state))

    // 2. Cloud Sync if authenticated in Supabase
    if (userId && userId !== 'guest' && userId !== 'guest_user') {
      try {
        if (supabase) {
          // Attempt to update Supabase user metadata / profile
          supabase.auth.updateUser({
            data: {
              medlingo_xp: state.xp || 0,
              medlingo_streak: state.currentStreak || 1,
              medlingo_gems: state.gems || 0,
              medlingo_last_sync: new Date().toISOString()
            }
          }).catch(() => {})
        }
      } catch (cloudErr) {
        // Non-blocking sync error
        console.warn('MedLingo cloud background sync:', cloudErr)
      }
    }
  } catch (err) {
    console.error('Error saving gamification state:', err)
  }
}

// Deduct 1 heart on error
export const deductHeart = (state) => {
  if (state.hearts <= 0) return state

  const newHearts = Math.max(0, state.hearts - 1)
  const lastHeartLostTimestamp = state.lastHeartLostTimestamp || Date.now()

  return {
    ...state,
    hearts: newHearts,
    lastHeartLostTimestamp: newHearts < MAX_HEARTS ? lastHeartLostTimestamp : null
  }
}

// Refill hearts to max
export const refillHearts = (state) => {
  return {
    ...state,
    hearts: MAX_HEARTS,
    lastHeartLostTimestamp: null
  }
}

// Record lesson completion, update streak, XP, gems, daily quests & node status
export const recordLessonSuccess = (state, { nodeId, stars = 3, scorePercent = 100, xpEarned = 25, gemsEarned = 10 }) => {
  const today = getTodayDateString()
  let currentStreak = state.currentStreak || 1
  let longestStreak = state.longestStreak || 1
  let streakFrozen = state.streakFrozen || false

  // Streak logic
  if (state.lastStudyDate) {
    const lastDate = new Date(state.lastStudyDate)
    const todayDate = new Date(today)
    const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      // Consecutive day!
      currentStreak += 1
      if (currentStreak > longestStreak) longestStreak = currentStreak
      streakFrozen = false
    } else if (diffDays > 1) {
      // Missed a day
      if (state.streakFreezeTokens > 0) {
        // Used streak freeze!
        state.streakFreezeTokens -= 1
        streakFrozen = true
      } else {
        currentStreak = 1
      }
    }
  }

  // Check double XP
  const isDoubleXp = state.inventory?.doubleXpActiveUntil && Date.now() < state.inventory.doubleXpActiveUntil
  const finalXp = isDoubleXp ? xpEarned * 2 : xpEarned

  // Update completed nodes
  const prevNode = state.completedNodes?.[nodeId]
  const newStars = Math.max(prevNode?.stars || 0, stars)
  const newScore = Math.max(prevNode?.scorePercent || 0, scorePercent)

  const updatedCompletedNodes = {
    ...(state.completedNodes || {}),
    [nodeId]: {
      stars: newStars,
      scorePercent: newScore,
      completedAt: new Date().toISOString()
    }
  }

  // Update daily quests
  const dailyQuests = { ...(state.dailyQuests || {}) }
  dailyQuests.date = today
  dailyQuests.lessonsCompleted = (dailyQuests.lessonsCompleted || 0) + 1
  if (stars === 3) dailyQuests.perfectLessons = (dailyQuests.perfectLessons || 0) + 1
  dailyQuests.xpGainedToday = (dailyQuests.xpGainedToday || 0) + finalXp

  return {
    ...state,
    currentStreak,
    longestStreak,
    lastStudyDate: today,
    streakFrozen,
    xp: (state.xp || 0) + finalXp,
    gems: (state.gems || 0) + gemsEarned,
    completedNodes: updatedCompletedNodes,
    dailyQuests
  }
}

// Open chest reward
export const claimChestReward = (state, chestId, gemsReward = 50) => {
  return {
    ...state,
    gems: (state.gems || 0) + gemsReward,
    hearts: Math.min(MAX_HEARTS, state.hearts + 1),
    openedChests: {
      ...(state.openedChests || {}),
      [chestId]: true
    }
  }
}
