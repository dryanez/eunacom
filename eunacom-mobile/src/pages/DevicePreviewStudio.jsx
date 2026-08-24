import React, { useState, useEffect, useRef } from 'react'
import { 
  Smartphone, Sparkles, RotateCcw, ExternalLink, 
  Wifi, Battery, Shield, CheckCircle2, ZoomIn, ZoomOut 
} from 'lucide-react'

export default function DevicePreviewStudio() {
  const [device, setDevice] = useState('iphone-16-pro')
  const [scale, setScale] = useState(0.82) // Optimal scale for 1080p / laptop monitors
  const [currentTime, setCurrentTime] = useState('')
  const iframeRef = useRef(null)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto-calculate scale on window resize to ensure phone NEVER touches window edges
  useEffect(() => {
    const handleResize = () => {
      const h = window.innerHeight
      if (h < 750) setScale(0.70)
      else if (h < 850) setScale(0.76)
      else if (h < 950) setScale(0.82)
      else if (h < 1100) setScale(0.90)
      else setScale(1.0)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const devices = {
    'iphone-16-pro': { name: 'iPhone 16 Pro', width: 393, height: 852, radius: 52, bezel: 12 },
    'pixel-8': { name: 'Pixel 8', width: 412, height: 860, radius: 44, bezel: 11 },
    'iphone-se': { name: 'iPhone SE', width: 375, height: 667, radius: 32, bezel: 14 }
  }

  const currentDev = devices[device]

  const reloadIframe = () => {
    if (iframeRef.current) {
      iframeRef.current.src = '/app/dashboard'
    }
  }

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      background: 'radial-gradient(circle at 50% 30%, #1e293b 0%, #0f172a 60%, #020617 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0.75rem',
      boxSizing: 'border-box',
      fontFamily: 'var(--font, -apple-system, sans-serif)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* ── Top Studio Toolbar ── */}
      <div style={{
        marginBottom: '0.75rem',
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '0.45rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        zIndex: 1000,
        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.6)',
        flexShrink: 0
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Smartphone size={18} color="#38bdf8" />
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white', letterSpacing: '-0.01em' }}>
            EUNACOM Mobile Studio
          </span>
          <span style={{
            fontSize: '0.65rem',
            fontWeight: 800,
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
            padding: '2px 6px',
            borderRadius: '6px'
          }}>
            Apple HIG
          </span>
        </div>

        {/* Device Switcher */}
        <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(30, 41, 59, 0.6)', padding: '3px', borderRadius: '10px' }}>
          {Object.entries(devices).map(([key, d]) => (
            <button
              key={key}
              onClick={() => setDevice(key)}
              style={{
                background: device === key ? '#3b82f6' : 'transparent',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.25rem 0.6rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
            >
              {d.name}
            </button>
          ))}
        </div>

        {/* Scale Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(30, 41, 59, 0.6)', padding: '2px 6px', borderRadius: '10px' }}>
          <button
            onClick={() => setScale(s => Math.max(0.6, s - 0.05))}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
            title="Reducir tamaño"
          >
            <ZoomOut size={14} />
          </button>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#e2e8f0', minWidth: '32px', textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale(s => Math.min(1.2, s + 0.05))}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
            title="Aumentar tamaño"
          >
            <ZoomIn size={14} />
          </button>
        </div>

        {/* Action: Reload */}
        <button
          onClick={reloadIframe}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            color: '#cbd5e1',
            border: 'none',
            borderRadius: '10px',
            padding: '0.3rem 0.6rem',
            fontSize: '0.72rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            cursor: 'pointer'
          }}
        >
          <RotateCcw size={13} /> Reiniciar
        </button>

        {/* Action: Open in new tab without frame */}
        <a
          href="/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: '#38bdf8',
            textDecoration: 'none',
            borderRadius: '10px',
            padding: '0.3rem 0.65rem',
            fontSize: '0.72rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}
        >
          <ExternalLink size={13} /> Abrir Pestaña Directa
        </a>
      </div>

      {/* ── Scaled Hardware Phone Container ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        width: '100%',
        overflow: 'hidden'
      }}>
        <div style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {/* Realistic Hardware Frame */}
          <div style={{
            width: `${currentDev.width + currentDev.bezel * 2}px`,
            height: `${currentDev.height + currentDev.bezel * 2}px`,
            borderRadius: `${currentDev.radius}px`,
            padding: `${currentDev.bezel}px`,
            background: 'linear-gradient(145deg, #334155, #1e293b, #0f172a)',
            boxShadow: `
              0 0 0 2px #475569,
              0 25px 60px -12px rgba(0, 0, 0, 0.85),
              0 0 80px -10px rgba(56, 189, 248, 0.2)
            `,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box'
          }}>
            {/* Hardware Side Buttons */}
            <div style={{ position: 'absolute', left: '-3px', top: '115px', width: '3px', height: '26px', background: '#475569', borderTopLeftRadius: '2px', borderBottomLeftRadius: '2px' }} />
            <div style={{ position: 'absolute', left: '-3px', top: '155px', width: '3px', height: '50px', background: '#475569', borderTopLeftRadius: '2px', borderBottomLeftRadius: '2px' }} />
            <div style={{ position: 'absolute', left: '-3px', top: '215px', width: '3px', height: '50px', background: '#475569', borderTopLeftRadius: '2px', borderBottomLeftRadius: '2px' }} />
            <div style={{ position: 'absolute', right: '-3px', top: '170px', width: '3px', height: '70px', background: '#475569', borderTopRightRadius: '2px', borderBottomRightRadius: '2px' }} />

            {/* Screen Area hosting Isolated Iframe */}
            <div style={{
              flex: 1,
              width: '100%',
              height: '100%',
              borderRadius: `${currentDev.radius - currentDev.bezel}px`,
              overflow: 'hidden',
              position: 'relative',
              background: '#0b1120',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* iOS Dynamic Island Bar */}
              {device === 'iphone-16-pro' && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 1.5rem',
                  zIndex: 9999,
                  pointerEvents: 'none',
                  color: 'white',
                  fontSize: '0.78rem',
                  fontWeight: 600
                }}>
                  <span>{currentTime || '9:41'}</span>

                  {/* Dynamic Island Pill */}
                  <div style={{
                    position: 'absolute',
                    top: '9px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '105px',
                    height: '28px',
                    background: '#000000',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '8px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.5)'
                  }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0f172a', border: '1px solid #1e293b' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Wifi size={13} />
                    <Battery size={15} />
                  </div>
                </div>
              )}

              {/* Isolated Mobile Application Iframe */}
              <iframe
                ref={iframeRef}
                src="/dashboard"
                title="EUNACOM Mobile App"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: `${currentDev.radius - currentDev.bezel}px`,
                  background: '#0b1120',
                  overflow: 'hidden'
                }}
              />

              {/* iOS Home Bar Indicator */}
              {device === 'iphone-16-pro' && (
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '130px',
                  height: '4px',
                  background: 'rgba(255, 255, 255, 0.4)',
                  borderRadius: '2px',
                  zIndex: 9999,
                  pointerEvents: 'none'
                }} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
