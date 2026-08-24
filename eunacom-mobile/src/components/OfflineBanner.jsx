import React, { useState, useEffect } from 'react'
import { WifiOff } from 'lucide-react'

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div className="offline-banner">
      <WifiOff size={16} />
      Sin conexión a internet — Algunas funciones no estarán disponibles
    </div>
  )
}

export default OfflineBanner
