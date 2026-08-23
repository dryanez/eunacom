// Web Audio API sound synthesizer for MedLingo EUNACOM
// Ultra-lightweight: zero external MP3 downloads, zero latency, runs in all modern browsers.

let audioCtx = null

const getAudioContext = () => {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

// Play a cheerful chime on correct answer (Duolingo-style Major Chord arpeggio)
export const playCorrectSound = () => {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now + i * 0.07)

      gain.gain.setValueAtTime(0.001, now + i * 0.07)
      gain.gain.exponentialRampToValueAtTime(0.22, now + i * 0.07 + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 0.35)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + i * 0.07)
      osc.stop(now + i * 0.07 + 0.38)
    })
  } catch (err) {
    console.debug('Audio error:', err)
  }
}

// Play a soft low 'uh-oh' tone on incorrect answer (Duolingo style)
export const playIncorrectSound = () => {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const notes = [293.66, 246.94] // D4 -> B3 (minor descent)

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(freq, now + i * 0.14)

      gain.gain.setValueAtTime(0.001, now + i * 0.14)
      gain.gain.exponentialRampToValueAtTime(0.18, now + i * 0.14 + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.14 + 0.4)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + i * 0.14)
      osc.stop(now + i * 0.14 + 0.45)
    })
  } catch (err) {
    console.debug('Audio error:', err)
  }
}

// Play ascending combo tone (pitch rises with combo count)
export const playComboSound = (combo = 1) => {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const baseFreq = 440 * Math.pow(1.12, Math.min(combo, 8))

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(baseFreq, now)
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.18)

    gain.gain.setValueAtTime(0.01, now)
    gain.gain.exponentialRampToValueAtTime(0.25, now + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.35)
  } catch (err) {
    console.debug('Audio error:', err)
  }
}

// Play celebratory victory fanfare when completing a level
export const playLevelCompleteSound = () => {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const melody = [
      { f: 523.25, t: 0.0, d: 0.12 },
      { f: 659.25, t: 0.12, d: 0.12 },
      { f: 783.99, t: 0.24, d: 0.12 },
      { f: 1046.5, t: 0.38, d: 0.45 },
      { f: 880.0, t: 0.85, d: 0.15 },
      { f: 1046.5, t: 1.02, d: 0.6 }
    ]

    melody.forEach(({ f, t, d }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(f, now + t)

      gain.gain.setValueAtTime(0.001, now + t)
      gain.gain.exponentialRampToValueAtTime(0.24, now + t + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + t + d)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + t)
      osc.stop(now + t + d + 0.05)
    })
  } catch (err) {
    console.debug('Audio error:', err)
  }
}

// Play chest open / reward sound
export const playChestOpenSound = () => {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const notes = [392.0, 523.25, 659.25, 783.99, 1046.5, 1318.51]

    notes.forEach((f, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(f, now + i * 0.06)

      gain.gain.setValueAtTime(0.001, now + i * 0.06)
      gain.gain.exponentialRampToValueAtTime(0.2, now + i * 0.06 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.25)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + i * 0.06)
      osc.stop(now + i * 0.06 + 0.28)
    })
  } catch (err) {
    console.debug('Audio error:', err)
  }
}

// Play tap / click sound
export const playTapSound = () => {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, now)
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.04)

    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.05)
  } catch (err) {
    console.debug('Audio error:', err)
  }
}
