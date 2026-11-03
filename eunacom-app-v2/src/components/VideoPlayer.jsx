import React, { useRef, useState, useEffect, useCallback } from 'react'
import { Play, Pause, CheckCircle2, Volume2, VolumeX, Maximize2, AlertCircle } from 'lucide-react'

/* ────────────────────────────────────────────────────────────────
   VideoPlayer
   Props:
     src          – /api/video?... URL
     title        – displayed above player
     watched      – boolean (already watched before)
     onWatched    – () => void — called when 90%+ of video consumed
   ──────────────────────────────────────────────────────────────── */
export default function VideoPlayer({ src, title, watched: initialWatched, onWatched }) {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)      // 0–100
  const [currentTime, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [muted, setMuted] = useState(false)
  const [watched, setWatched] = useState(!!initialWatched)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  // Waiting for data after play or a jump (videos stream from R2): shows a spinner so people don't click again.
  const [buffering, setBuffering] = useState(false)
  const [scrubbing, setScrubbing] = useState(false)
  const [barHover, setBarHover] = useState(false)
  const playPendingRef = useRef(false)
  const watchedFiredRef = useRef(!!initialWatched)
  const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  useEffect(() => { setWatched(!!initialWatched); watchedFiredRef.current = !!initialWatched }, [initialWatched])

  const [errorDetails, setErrorDetails] = useState(null)

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    setCurrent(v.currentTime)
    const pct = (v.currentTime / v.duration) * 100
    setProgress(isNaN(pct) ? 0 : pct)
    // Fire onWatched at 90% completion
    if (!watchedFiredRef.current && pct >= 90) {
      watchedFiredRef.current = true
      setWatched(true)
      onWatched?.()
    }
  }, [onWatched])

  const handleEnded = useCallback(() => {
    setPlaying(false)
    if (!watchedFiredRef.current) {
      watchedFiredRef.current = true
      setWatched(true)
      onWatched?.()
    }
  }, [onWatched])

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    // A second click while play() is still starting used to pause the video right away (PostHog rage clicks on /mis-clases).
    if (playPendingRef.current) return
    if (v.paused) {
      playPendingRef.current = true
      setPlaying(true)
      setBuffering(v.readyState < 3)
      Promise.resolve(v.play())
        .catch(() => setPlaying(false))
        .finally(() => { playPendingRef.current = false })
    } else { v.pause(); setPlaying(false) }
  }

  // Seek to the pointer position on the bar; works for a click and while dragging.
  const seekTo = (clientX, bar) => {
    const v = videoRef.current
    const total = duration || v?.duration
    if (!v || !total || isNaN(total)) return
    const rect = bar.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    v.currentTime = pct * total
    setProgress(pct * 100)
    setCurrent(pct * total)
  }
  const onBarPointerDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId)
    setScrubbing(true)
    seekTo(e.clientX, e.currentTarget)
  }
  const onBarPointerMove = (e) => { if (scrubbing) seekTo(e.clientX, e.currentTarget) }
  const onBarPointerUp = (e) => {
    if (!scrubbing) return
    setScrubbing(false)
    e.currentTarget.releasePointerCapture?.(e.pointerId)
  }
  // Arrow keys move 10 s when the bar has focus.
  const onBarKeyDown = (e) => {
    const v = videoRef.current
    if (!v || !duration) return
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      v.currentTime = Math.max(0, Math.min(duration, v.currentTime + (e.key === 'ArrowRight' ? 10 : -10)))
    }
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  const openFullscreen = () => {
    const v = videoRef.current
    if (!v) return
    if (v.webkitEnterFullscreen) v.webkitEnterFullscreen() // iOS
    else if (v.requestFullscreen) v.requestFullscreen()
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen()
  }

  return (
    <div style={{
      borderRadius: 16,
      overflow: 'hidden',
      background: 'var(--surface-800)',
      border: '1px solid var(--border-color)',
      marginBottom: '1.5rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    }}>

      {/* Header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        padding: '0.85rem 1.2rem',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--surface-700)',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: watched ? 'rgba(16,185,129,0.15)' : 'rgba(19,91,236,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {watched
            ? <CheckCircle2 size={15} style={{ color: '#10b981' }} />
            : <Play size={15} style={{ color: 'var(--primary-500)' }} />
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {title}
          </div>
          <div style={{ fontSize: '0.7rem', color: watched ? '#10b981' : 'var(--text-tertiary)', fontWeight: 600 }}>
            {watched ? '✓ Clase vista · +50 XP obtenidos' : 'Ver el video completo para ganar 50 XP'}
          </div>
        </div>
        {watched && (
          <div style={{
            padding: '0.25rem 0.7rem', borderRadius: 20,
            background: 'rgba(16,185,129,0.12)', color: '#10b981',
            fontSize: '0.72rem', fontWeight: 700, border: '1px solid rgba(16,185,129,0.25)',
          }}>
            +50 XP
          </div>
        )}
      </div>

      {/* Video element */}
      <div style={{ position: 'relative', background: '#000', cursor: isMobile ? 'default' : 'pointer' }} onClick={isMobile ? undefined : togglePlay}>
        {loading && !error && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: '#000', gap: '0.75rem', zIndex: 2,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--primary-500)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem' }}>Cargando video...</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {error && (
          <div style={{
            height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: '0.75rem', background: '#0a0a0a', padding: '1rem',
          }}>
            <AlertCircle size={32} style={{ color: 'var(--danger-500)' }} />
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', maxWidth: 440, userSelect: 'text' }}>
              <strong>Video no disponible.</strong>
              <div style={{ marginTop: 8, fontSize: '0.75rem', fontFamily: 'monospace', color: '#ff5555', wordBreak: 'break-all' }}>
                Error: {errorDetails || 'Desconocido'}
              </div>
              <div style={{ marginTop: 8, fontSize: '0.7rem', color: '#666', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                URL: {src}
              </div>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          src={src}
          controls={isMobile}
          playsInline
          webkit-playsinline="true"
          style={{ width: '100%', display: error ? 'none' : 'block', maxHeight: 480, background: '#000' }}
          onLoadedMetadata={(e) => { setDuration(e.target.duration); setLoading(false) }}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onError={(e) => { 
            const mediaErr = e.target.error
            let errString = 'Unknown'
            if (mediaErr) {
              if (mediaErr.code === 1) errString = 'MEDIA_ERR_ABORTED'
              else if (mediaErr.code === 2) errString = 'MEDIA_ERR_NETWORK (Check CORS or network)'
              else if (mediaErr.code === 3) errString = 'MEDIA_ERR_DECODE (Corrupt file)'
              else if (mediaErr.code === 4) errString = 'MEDIA_ERR_SRC_NOT_SUPPORTED (404 Not Found or 403 Forbidden)'
              errString = `${errString} - ${mediaErr.message || ''}`
            }
            console.error('Video error:', errString)
            setErrorDetails(errString)
            setError(true)
            setLoading(false) 
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => { setPlaying(false); setBuffering(false) }}
          onWaiting={() => setBuffering(true)}
          onSeeking={() => setBuffering(true)}
          onSeeked={() => setBuffering(false)}
          onPlaying={() => setBuffering(false)}
          onCanPlay={() => { setLoading(false); setBuffering(false) }}
          preload="metadata"
        />

        {/* Buffering spinner after play or a jump — desktop only (mobile shows the native one) */}
        {!isMobile && buffering && !loading && !error && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none', background: 'rgba(0,0,0,0.25)',
          }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.85)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Play/Pause overlay — only when paused and no error, desktop only */}
        {!isMobile && !playing && !error && !loading && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.35)',
            transition: 'opacity 0.2s',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(19,91,236,0.9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 24px rgba(19,91,236,0.5)',
            }}>
              <Play size={28} fill="#fff" style={{ color: '#fff', marginLeft: 4 }} />
            </div>
          </div>
        )}
      </div>

      {/* Controls — desktop only, mobile uses native controls */}
      {!error && !isMobile && (
        <div style={{
          padding: '0.75rem 1.1rem',
          background: 'var(--surface-800)',
          display: 'flex', flexDirection: 'column', gap: '0.5rem',
        }}>
          {/* Progress bar: 20px tall hit area around the visible track; click or drag to jump, arrows ±10 s */}
          <div
            role="slider"
            tabIndex={0}
            aria-label="Posición del video"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration) || 0}
            aria-valuenow={Math.round(currentTime)}
            aria-valuetext={`${fmt(currentTime)} de ${fmt(duration)}`}
            onPointerDown={onBarPointerDown}
            onPointerMove={onBarPointerMove}
            onPointerUp={onBarPointerUp}
            onPointerCancel={onBarPointerUp}
            onPointerEnter={() => setBarHover(true)}
            onPointerLeave={() => setBarHover(false)}
            onKeyDown={onBarKeyDown}
            style={{
              height: 20, display: 'flex', alignItems: 'center', cursor: 'pointer',
              touchAction: 'none', userSelect: 'none', outlineOffset: 2,
            }}
          >
            <div style={{
              position: 'relative', width: '100%', height: barHover || scrubbing ? 10 : 6, borderRadius: 5,
              background: 'var(--surface-600)', transition: 'height 0.15s',
            }}>
              <div style={{
                height: '100%', borderRadius: 5,
                width: `${progress}%`,
                background: 'linear-gradient(90deg, var(--primary-500), #8b5cf6)',
                transition: scrubbing ? 'none' : 'width 0.25s linear',
              }} />
              {/* Handle shows where you are and that the bar can be dragged */}
              <div style={{
                position: 'absolute', top: '50%', left: `${progress}%`, width: 14, height: 14, borderRadius: '50%',
                transform: 'translate(-50%, -50%)', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                opacity: barHover || scrubbing ? 1 : 0, transition: 'opacity 0.15s',
              }} />
            </div>
          </div>

          {/* Buttons row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={togglePlay} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
              {playing ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button onClick={toggleMute} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center' }}>
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', flexShrink: 0 }}>
              {fmt(currentTime)} / {fmt(duration)}
            </span>
            <div style={{ flex: 1 }} />
            <button onClick={openFullscreen} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center' }}>
              <Maximize2 size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
