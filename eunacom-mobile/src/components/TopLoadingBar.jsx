import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const TopLoadingBar = () => {
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Trigger loading animation on location change
    setLoading(true)
    setProgress(35)

    const timer1 = setTimeout(() => setProgress(75), 80)
    const timer2 = setTimeout(() => setProgress(100), 200)
    const timer3 = setTimeout(() => {
      setLoading(false)
      setProgress(0)
    }, 400)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [location.pathname, location.search])

  if (!loading && progress === 0) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '3px',
        zIndex: 99999,
        pointerEvents: 'none',
        background: 'transparent',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #135bec, #06b6d4, #10b981)',
          boxShadow: '0 0 10px rgba(19, 91, 236, 0.8), 0 0 5px rgba(6, 182, 212, 0.8)',
          transition: 'width 0.18s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease',
          opacity: loading ? 1 : 0,
        }}
      />
    </div>
  )
}

export default TopLoadingBar
