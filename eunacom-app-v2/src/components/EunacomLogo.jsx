import React from 'react'

export const EunacomLogoIcon = ({ size = 32, className = '' }) => {
  return (
    <img
      src="/logo.png"
      alt="eunacomapp"
      width={size}
      height={size}
      className={className}
      style={{
        objectFit: 'contain',
        flexShrink: 0,
        display: 'block',
        filter: 'drop-shadow(0 2px 6px rgba(37, 99, 235, 0.25))'
      }}
    />
  )
}

export const EunacomLogo = ({ size = 32, textColor = '#0f172a', accentColor = '#2563eb', showWordmark = true, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${Math.max(6, Math.round(size * 0.28))}px`,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      <EunacomLogoIcon size={size} />
      {showWordmark && (
        <span
          style={{
            fontSize: `${Math.round(size * 0.62)}px`,
            fontWeight: 800,
            color: textColor,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
          }}
        >
          eunacom<span style={{ color: accentColor }}>app</span>
        </span>
      )}
    </div>
  )
}

export default EunacomLogo
