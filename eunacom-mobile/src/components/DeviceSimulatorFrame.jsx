import React, { useState, useEffect } from 'react'
import { 
  Smartphone, RotateCcw, Sparkles, Moon, Sun, 
  Wifi, Battery, Maximize2, Shield, Info 
} from 'lucide-react'

export default function DeviceSimulatorFrame({ children, onOpenPaywall }) {
  const [device, setDevice] = useState('iphone-16-pro') // 'iphone-16-pro' | 'pixel-8' | 'iphone-se' | 'fullscreen'
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const deviceDimensions = {
    'iphone-16-pro': { width: '400px', height: '840px', radius: '50px', bezel: '12px' },
    'pixel-8': { width: '412px', height: '860px', radius: '40px', bezel: '10px' },
    'iphone-se': { width: '375px', height: '667px', radius: '30px', bezel: '14px' },
    'fullscreen': { width: '100%', height: '100%', radius: '0px', bezel: '0px' }
  }

  const currentDim = deviceDimensions[device]

  if (device === 'fullscreen') {
    return <>{children}</>
  }

  return (
    <div style={{
      minHeight: '100dvh',
      width: '100vw',
      background: 'radial-gradient(circle at 50% 30%, #1e293b 0%, #0f172a 60%, #020617 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem 1rem',
      boxSizing: 'border-box',
      fontFamily: 'var(--font, -apple-system, sans-serif)',
      overflow: 'hidden'
    }}>
      {/* Top Simulator Control Bar */}
      <div style={{
        marginBottom: '1rem',
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '0.45rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        zIndex: 1000,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Device Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Smartphone size={18} color="#38bdf8" />
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'white', letterSpacing: '-0.01em' }}>
            EUNACOM Mobile Studio
          </span>
        </div>

        {/* Device Switcher */}
        <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(30, 41, 59, 0.6)', padding: '2px', borderRadius: '10px' }}>
          <button
            onClick={() => setDevice('iphone-16-pro')}
            style={{
              background: device === 'iphone-16-pro' ? '#3b82f6' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.25rem 0.6rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            iPhone 16 Pro
          </button>
          <button
            onClick={() => setDevice('pixel-8')}
            style={{
              background: device === 'pixel-8' ? '#3b82f6' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.25rem 0.6rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Pixel 8
          </button>
          <button
            onClick={() => setDevice('fullscreen')}
            style={{
              background: device === 'fullscreen' ? '#3b82f6' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.25rem 0.6rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Pantalla Completa
          </button>
        </div>

        {/* Quick Action: Trigger Paywall from video */}
        {onOpenPaywall && (
          <button
            onClick={onOpenPaywall}
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.74rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)'
            }}
          >
            <Sparkles size={13} /> Probar Paywall
          </button>
        )}
      </div>

      {/* Realistic Phone Hardware Frame */}
      <div style={{
        width: currentDim.width,
        height: currentDim.height,
        maxHeight: 'calc(100dvh - 100px)',
        borderRadius: currentDim.radius,
        padding: currentDim.bezel,
        background: 'linear-gradient(145deg, #2d3748, #1a202c, #0f172a)',
        boxShadow: `
          0 0 0 2px #4a5568,
          0 25px 50px -12px rgba(0, 0, 0, 0.75),
          0 0 100px -20px rgba(56, 189, 248, 0.15)
        `,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Hardware Side Buttons */}
        <div style={{ position: 'absolute', left: '-3px', top: '115px', width: '3px', height: '26px', background: '#4a5568', borderTopLeftRadius: '2px', borderBottomLeftRadius: '2px' }} />
        <div style={{ position: 'absolute', left: '-3px', top: '155px', width: '3px', height: '50px', background: '#4a5568', borderTopLeftRadius: '2px', borderBottomLeftRadius: '2px' }} />
        <div style={{ position: 'absolute', left: '-3px', top: '215px', width: '3px', height: '50px', background: '#4a5568', borderTopLeftRadius: '2px', borderBottomLeftRadius: '2px' }} />
        <div style={{ position: 'absolute', right: '-3px', top: '170px', width: '3px', height: '70px', background: '#4a5568', borderTopRightRadius: '2px', borderBottomRightRadius: '2px' }} />

        {/* Screen Area */}
        <div style={{
          flex: 1,
          width: '100%',
          height: '100%',
          borderRadius: `calc(${currentDim.radius} - ${currentDim.bezel})`,
          overflow: 'hidden',
          position: 'relative',
          background: '#0b1120',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* iOS Dynamic Island & Status Bar */}
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
              {/* Clock */}
              <span>{currentTime || '9:41'}</span>

              {/* Dynamic Island pill */}
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
                {/* Camera lens dot */}
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0f172a', border: '1px solid #1e293b' }} />
              </div>

              {/* Status Icons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Wifi size={13} />
                <Battery size={15} />
              </div>
            </div>
          )}

          {/* Actual Application Content */}
          <div style={{ flex: 1, width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
            {children}
          </div>

          {/* iOS Home Indicator Bar */}
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
  )
}
