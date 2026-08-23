import React from 'react'

/**
 * High-quality medical illustrations rendered as vector SVGs
 * Styled with radiant gradients and subtle glow effects
 */
export const MedicalIllustration = ({ name, className = '', style = {} }) => {
  const norm = (name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  // Cardiología
  if (norm.includes('cardio') || norm.includes('corazon')) {
    return (
      <svg viewBox="0 0 160 120" className={className} style={{ width: '100%', height: '100%', ...style }} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cardioGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="vesselGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        {/* Soft background pulse */}
        <circle cx="95" cy="55" r="42" fill="url(#cardioGlow)" opacity="0.2" filter="blur(16px)" />
        {/* Aorta & Great Vessels */}
        <path d="M72 45 C70 25, 105 18, 110 38 C112 44, 106 50, 100 52" stroke="url(#vesselGrad)" strokeWidth="8" strokeLinecap="round" opacity="0.65" />
        <path d="M85 28 L85 14" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        <path d="M96 28 L99 15" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        <path d="M107 32 L114 20" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        {/* Heart Muscle Body */}
        <path d="M68 48 C55 35, 38 48, 52 70 C64 88, 92 105, 96 108 C100 105, 134 82, 138 62 C142 42, 118 35, 102 46 C92 53, 76 56, 68 48 Z" 
          fill="url(#cardioGlow)" stroke="#ef4444" strokeWidth="2.5" strokeLinejoin="round" />
        {/* Coronary Vessels */}
        <path d="M92 54 Q88 72 78 85 Q72 90 68 96" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        <path d="M87 68 Q98 75 105 84" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        {/* ECG Rhythm Wave */}
        <path d="M10 75 L38 75 L45 68 L50 82 L58 48 L65 92 L72 70 L78 78 L85 75 L150 75" 
          stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      </svg>
    )
  }

  // Neurología / Geriatría
  if (norm.includes('neuro') || norm.includes('geriatria') || norm.includes('cerebro')) {
    return (
      <svg viewBox="0 0 160 120" className={className} style={{ width: '100%', height: '100%', ...style }} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="neuroGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <circle cx="85" cy="55" r="45" fill="url(#neuroGlow)" opacity="0.25" filter="blur(16px)" />
        {/* Brain Silhouette & Gyri */}
        <path d="M85 30 C65 30, 48 42, 48 64 C48 82, 60 92, 75 96 C78 102, 85 106, 92 106 C105 106, 110 98, 114 94 C128 90, 138 78, 138 60 C138 40, 120 30, 98 30 C94 30, 89 30, 85 30 Z" 
          fill="url(#neuroGlow)" stroke="#c084fc" strokeWidth="2" />
        {/* Brain sulci convolutions */}
        <path d="M60 55 Q72 50 80 62 Q88 74 98 62 Q108 50 122 58" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
        <path d="M55 70 Q68 76 78 68 Q88 60 98 72 Q108 84 125 74" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
        <path d="M72 40 Q84 48 95 38" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
        <path d="M82 82 Q90 92 102 88" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
        {/* Synapse dots & glowing sparks */}
        <circle cx="45" cy="45" r="3" fill="#38bdf8" />
        <circle cx="128" cy="42" r="3" fill="#38bdf8" />
        <circle cx="135" cy="78" r="2.5" fill="#f43f5e" />
        <line x1="45" y1="45" x2="60" y2="55" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
        <line x1="128" y1="42" x2="115" y2="50" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
      </svg>
    )
  }

  // Respiratorio / Neumología
  if (norm.includes('respirat') || norm.includes('pulmon') || norm.includes('neumo')) {
    return (
      <svg viewBox="0 0 160 120" className={className} style={{ width: '100%', height: '100%', ...style }} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="respGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        <circle cx="85" cy="60" r="42" fill="url(#respGlow)" opacity="0.2" filter="blur(16px)" />
        {/* Trachea */}
        <path d="M85 22 L85 52" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
        <line x1="80" y1="30" x2="90" y2="30" stroke="#0284c7" strokeWidth="1.5" />
        <line x1="80" y1="36" x2="90" y2="36" stroke="#0284c7" strokeWidth="1.5" />
        <line x1="80" y1="42" x2="90" y2="42" stroke="#0284c7" strokeWidth="1.5" />
        {/* Bronchi split */}
        <path d="M85 52 Q72 58 64 68" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
        <path d="M85 52 Q98 58 106 68" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
        {/* Left Lung */}
        <path d="M64 54 C54 52, 42 62, 42 78 C42 96, 52 104, 68 104 C74 104, 76 96, 75 88 C74 72, 72 60, 64 54 Z" 
          fill="url(#respGlow)" stroke="#38bdf8" strokeWidth="2" />
        {/* Right Lung */}
        <path d="M106 54 C116 52, 128 62, 128 78 C128 96, 118 104, 102 104 C96 104, 94 96, 95 88 C96 72, 98 60, 106 54 Z" 
          fill="url(#respGlow)" stroke="#38bdf8" strokeWidth="2" />
        {/* Bronchial Tree branches */}
        <path d="M60 70 Q52 76 48 84" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        <path d="M62 76 Q62 88 58 95" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        <path d="M110 70 Q118 76 122 84" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        <path d="M108 76 Q108 88 112 95" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      </svg>
    )
  }

  // Gastroenterología
  if (norm.includes('gastro') || norm.includes('digest')) {
    return (
      <svg viewBox="0 0 160 120" className={className} style={{ width: '100%', height: '100%', ...style }} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gastroGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <circle cx="85" cy="60" r="42" fill="url(#gastroGlow)" opacity="0.2" filter="blur(16px)" />
        {/* Esophagus */}
        <path d="M78 20 L78 45" stroke="#4ade80" strokeWidth="5" strokeLinecap="round" />
        {/* Stomach body */}
        <path d="M78 45 C78 38, 98 36, 110 46 C124 58, 126 80, 108 94 C92 105, 68 100, 64 86 C60 72, 62 62, 78 52 Z" 
          fill="url(#gastroGlow)" stroke="#22c55e" strokeWidth="2.2" />
        {/* Rugae mucosal folds */}
        <path d="M82 56 Q94 62 98 74" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.65" />
        <path d="M74 68 Q86 76 90 88" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.65" />
        {/* Duodenum */}
        <path d="M64 86 C54 90, 52 102, 66 106 C78 110, 92 108, 98 104" stroke="#4ade80" strokeWidth="4.5" strokeLinecap="round" opacity="0.8" />
      </svg>
    )
  }

  // Hematología
  if (norm.includes('hemat') || norm.includes('sangre')) {
    return (
      <svg viewBox="0 0 160 120" className={className} style={{ width: '100%', height: '100%', ...style }} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="hemGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#991b1b" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <circle cx="85" cy="60" r="42" fill="url(#hemGlow)" opacity="0.25" filter="blur(16px)" />
        {/* Main Erythrocyte (biconcave disc) */}
        <ellipse cx="82" cy="60" rx="34" ry="24" fill="url(#hemGlow)" stroke="#f87171" strokeWidth="2.5" transform="rotate(-15 82 60)" />
        <ellipse cx="82" cy="60" rx="16" ry="10" fill="#7f1d1d" opacity="0.6" transform="rotate(-15 82 60)" />
        {/* Secondary Erythrocytes */}
        <ellipse cx="124" cy="42" rx="18" ry="12" fill="url(#hemGlow)" stroke="#f87171" strokeWidth="1.5" transform="rotate(25 124 42)" opacity="0.85" />
        <ellipse cx="124" cy="42" rx="8" ry="5" fill="#7f1d1d" opacity="0.6" transform="rotate(25 124 42)" />
        <ellipse cx="45" cy="80" rx="16" ry="11" fill="url(#hemGlow)" stroke="#f87171" strokeWidth="1.5" transform="rotate(-30 45 80)" opacity="0.75" />
        {/* White blood cell / Platelets */}
        <circle cx="122" cy="85" r="9" fill="#fecdd3" stroke="#f43f5e" strokeWidth="1.5" opacity="0.8" />
        <circle cx="50" cy="38" r="4" fill="#fb7185" />
        <circle cx="108" cy="98" r="3" fill="#fb7185" />
      </svg>
    )
  }

  // Nefrología
  if (norm.includes('nefro') || norm.includes('renal') || norm.includes('rinon')) {
    return (
      <svg viewBox="0 0 160 120" className={className} style={{ width: '100%', height: '100%', ...style }} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="nefroGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <circle cx="85" cy="60" r="42" fill="url(#nefroGlow)" opacity="0.2" filter="blur(16px)" />
        {/* Kidney Bean Shape */}
        <path d="M88 30 C62 30, 48 48, 48 70 C48 94, 66 104, 88 104 C108 104, 126 92, 126 70 C126 58, 116 58, 106 64 C96 70, 94 56, 102 46 C108 40, 102 30, 88 30 Z" 
          fill="url(#nefroGlow)" stroke="#22d3ee" strokeWidth="2.5" />
        {/* Renal Pelvis & Ureter */}
        <path d="M102 65 Q115 72 120 95 Q122 108 124 115" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
        <path d="M96 52 Q112 55 125 50" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
        <path d="M98 75 Q114 74 126 76" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
        {/* Medullary pyramids */}
        <path d="M64 50 Q76 56 68 66" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.65" />
        <path d="M62 72 Q75 74 66 84" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.65" />
      </svg>
    )
  }

  // Endocrinología / Diabetes
  if (norm.includes('endocrin') || norm.includes('diabet')) {
    return (
      <svg viewBox="0 0 160 120" className={className} style={{ width: '100%', height: '100%', ...style }} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="endoGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <circle cx="85" cy="60" r="42" fill="url(#endoGlow)" opacity="0.2" filter="blur(16px)" />
        {/* Thyroid Butterfly or Pancreas Outline */}
        <path d="M85 56 C78 40, 50 36, 46 54 C42 70, 55 86, 72 82 C78 80, 82 72, 85 68 C88 72, 92 80, 98 82 C115 86, 128 70, 124 54 C120 36, 92 40, 85 56 Z" 
          fill="url(#endoGlow)" stroke="#fbbf24" strokeWidth="2.5" />
        {/* Islets / Molecules & Glucose Rings */}
        <circle cx="65" cy="60" r="4" fill="#ffffff" opacity="0.8" />
        <circle cx="105" cy="60" r="4" fill="#ffffff" opacity="0.8" />
        <circle cx="85" cy="42" r="3" fill="#ffffff" opacity="0.7" />
        <path d="M28 42 L38 36 L48 42 L48 54 L38 60 L28 54 Z" stroke="#38bdf8" strokeWidth="1.5" opacity="0.65" />
        <path d="M122 82 L132 76 L142 82 L142 94 L132 100 L122 94 Z" stroke="#38bdf8" strokeWidth="1.5" opacity="0.65" />
      </svg>
    )
  }

  // Pediatría
  if (norm.includes('pediat') || norm.includes('nino') || norm.includes('bebe')) {
    return (
      <svg viewBox="0 0 160 120" className={className} style={{ width: '100%', height: '100%', ...style }} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="pedGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <circle cx="85" cy="60" r="42" fill="url(#pedGlow)" opacity="0.2" filter="blur(16px)" />
        {/* Baby Head & Cradle Silhouette */}
        <circle cx="85" cy="46" r="22" fill="url(#pedGlow)" stroke="#34d399" strokeWidth="2.5" />
        {/* Tuft of hair */}
        <path d="M85 24 Q88 16 94 20" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
        {/* Gentle smiling face */}
        <circle cx="78" cy="44" r="2.2" fill="#ffffff" />
        <circle cx="92" cy="44" r="2.2" fill="#ffffff" />
        <path d="M80 52 Q85 58 90 52" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        {/* Baby body wrapped */}
        <path d="M65 66 C56 74, 58 96, 75 102 C85 105, 98 104, 108 96 C115 88, 114 74, 105 66 Z" 
          fill="url(#pedGlow)" stroke="#34d399" strokeWidth="2" />
        {/* Pediatric Teddy / Stethoscope overlay */}
        <path d="M44 80 Q52 95 62 88" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
        <circle cx="42" cy="78" r="4" fill="#38bdf8" opacity="0.8" />
      </svg>
    )
  }

  // Ginecología y Obstetricia
  if (norm.includes('gineco') || norm.includes('obstetr') || norm.includes('parto')) {
    return (
      <svg viewBox="0 0 160 120" className={className} style={{ width: '100%', height: '100%', ...style }} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="ginGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#be185d" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <circle cx="85" cy="60" r="42" fill="url(#ginGlow)" opacity="0.2" filter="blur(16px)" />
        {/* Uterus & Ovaries / Maternal Contour */}
        <path d="M85 45 C70 42, 60 48, 52 42 C46 38, 38 42, 40 50 C44 58, 56 56, 68 56 C70 72, 74 88, 85 96 C96 88, 100 72, 102 56 C114 56, 126 58, 130 50 C132 42, 124 38, 118 42 C110 48, 100 42, 85 45 Z" 
          fill="url(#ginGlow)" stroke="#f472b6" strokeWidth="2.5" strokeLinejoin="round" />
        {/* Ovaries */}
        <ellipse cx="38" cy="46" rx="6" ry="5" fill="#fbcfe8" stroke="#ec4899" strokeWidth="1.5" />
        <ellipse cx="132" cy="46" rx="6" ry="5" fill="#fbcfe8" stroke="#ec4899" strokeWidth="1.5" />
        {/* Fetal ultrasound heart/life */}
        <circle cx="85" cy="72" r="8" fill="#ffffff" opacity="0.6" />
        <path d="M85 68 Q88 65 90 68 Q90 74 85 77 Q80 74 80 68 Q82 65 85 68 Z" fill="#ec4899" />
      </svg>
    )
  }

  // Cirugía General / Anestesia
  if (norm.includes('cirug') || norm.includes('quirofan') || norm.includes('anestes')) {
    return (
      <svg viewBox="0 0 160 120" className={className} style={{ width: '100%', height: '100%', ...style }} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cirGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#e11d48" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <circle cx="85" cy="60" r="42" fill="url(#cirGlow)" opacity="0.2" filter="blur(16px)" />
        {/* Crossed Scalpel & Surgical Forceps */}
        <g transform="rotate(-35 85 60)">
          {/* Scalpel */}
          <rect x="81" y="15" width="8" height="65" rx="3" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1.5" />
          <path d="M81 80 C81 80, 85 105, 89 105 C93 105, 89 80, 89 80 Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
        </g>
        <g transform="rotate(35 85 60)">
          {/* Clamp/Forceps */}
          <path d="M78 15 L78 70 Q78 85 70 95" stroke="#cbd5e1" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M92 15 L92 70 Q92 85 100 95" stroke="#cbd5e1" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="68" cy="98" r="6" stroke="#cbd5e1" strokeWidth="2.5" />
          <circle cx="102" cy="98" r="6" stroke="#cbd5e1" strokeWidth="2.5" />
        </g>
      </svg>
    )
  }

  // Traumatología
  if (norm.includes('trauma') || norm.includes('hueso') || norm.includes('ortoped')) {
    return (
      <svg viewBox="0 0 160 120" className={className} style={{ width: '100%', height: '100%', ...style }} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="traumaGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#c2410c" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <circle cx="85" cy="60" r="42" fill="url(#traumaGlow)" opacity="0.2" filter="blur(16px)" />
        {/* Anatomical Bone Structure */}
        <path d="M52 38 C44 32, 36 44, 46 52 C46 56, 42 62, 52 64 L110 64 C120 62, 116 56, 116 52 C126 44, 118 32, 110 38 L52 38 Z" 
          fill="url(#traumaGlow)" stroke="#fdba74" strokeWidth="2.5" transform="rotate(-30 85 60)" />
        {/* X-Ray Accent Grid */}
        <line x1="30" y1="30" x2="30" y2="90" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
        <line x1="140" y1="30" x2="140" y2="90" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
      </svg>
    )
  }

  // Infectología
  if (norm.includes('infect') || norm.includes('virus') || norm.includes('bacter')) {
    return (
      <svg viewBox="0 0 160 120" className={className} style={{ width: '100%', height: '100%', ...style }} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="infGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ea580c" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <circle cx="85" cy="60" r="42" fill="url(#infGlow)" opacity="0.2" filter="blur(16px)" />
        {/* Virus Capsid & Spikes */}
        <circle cx="85" cy="60" r="26" fill="url(#infGlow)" stroke="#fb923c" strokeWidth="2.5" />
        {/* Spikes */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <g key={i} transform={`rotate(${angle} 85 60)`}>
            <line x1="85" y1="34" x2="85" y2="22" stroke="#fdba74" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="85" cy="20" r="3" fill="#f43f5e" />
          </g>
        ))}
        {/* Internal Genetic Material RNA */}
        <path d="M72 54 Q85 48 80 62 Q75 74 95 66" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
      </svg>
    )
  }

  // Oftalmología
  if (norm.includes('oftalmo') || norm.includes('ojo') || norm.includes('vision')) {
    return (
      <svg viewBox="0 0 160 120" className={className} style={{ width: '100%', height: '100%', ...style }} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="oftGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0d9488" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <circle cx="85" cy="60" r="42" fill="url(#oftGlow)" opacity="0.2" filter="blur(16px)" />
        {/* Eye Outline */}
        <path d="M35 60 C55 35, 115 35, 135 60 C115 85, 55 85, 35 60 Z" 
          fill="url(#oftGlow)" stroke="#2dd4bf" strokeWidth="2.5" />
        {/* Iris & Pupil */}
        <circle cx="85" cy="60" r="16" fill="#0f766e" stroke="#5eead4" strokeWidth="2" />
        <circle cx="85" cy="60" r="8" fill="#042f2e" />
        <circle cx="82" cy="56" r="3" fill="#ffffff" opacity="0.85" />
      </svg>
    )
  }

  // Dermatología
  if (norm.includes('derma') || norm.includes('piel')) {
    return (
      <svg viewBox="0 0 160 120" className={className} style={{ width: '100%', height: '100%', ...style }} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="dermGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#e11d48" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <circle cx="85" cy="60" r="42" fill="url(#dermGlow)" opacity="0.2" filter="blur(16px)" />
        {/* Skin Epidermis / Dermis Layers */}
        <path d="M40 45 Q62 50 85 45 Q108 40 130 45 L130 85 Q108 80 85 85 Q62 90 40 85 Z" 
          fill="url(#dermGlow)" stroke="#fda4af" strokeWidth="2" />
        <path d="M40 58 Q62 63 85 58 Q108 53 130 58" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" strokeDasharray="3 3" />
        {/* Hair Follicle */}
        <path d="M85 30 L85 70" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="85" cy="72" r="4" fill="#fb7185" />
      </svg>
    )
  }

  // Psiquiatría
  if (norm.includes('psiqui') || norm.includes('mente') || norm.includes('salud mental')) {
    return (
      <svg viewBox="0 0 160 120" className={className} style={{ width: '100%', height: '100%', ...style }} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="psiGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <circle cx="85" cy="60" r="42" fill="url(#psiGlow)" opacity="0.2" filter="blur(16px)" />
        {/* Profile Mind Silhouette */}
        <path d="M65 95 L65 80 C60 76, 52 68, 52 54 C52 38, 66 26, 85 26 C104 26, 118 38, 118 54 C118 64, 112 72, 105 76 L105 95 Z" 
          fill="url(#psiGlow)" stroke="#a78bfa" strokeWidth="2.5" />
        {/* Radiating thought waves / Synapse inside */}
        <circle cx="85" cy="52" r="10" stroke="#38bdf8" strokeWidth="2" strokeDasharray="2 2" />
        <circle cx="85" cy="52" r="4" fill="#38bdf8" />
      </svg>
    )
  }

  // Otorrinolaringología
  if (norm.includes('otorrino') || norm.includes('oido') || norm.includes('nariz')) {
    return (
      <svg viewBox="0 0 160 120" className={className} style={{ width: '100%', height: '100%', ...style }} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="otoGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <circle cx="85" cy="60" r="42" fill="url(#otoGlow)" opacity="0.2" filter="blur(16px)" />
        {/* Ear Outline */}
        <path d="M75 28 C95 24, 112 36, 110 58 C108 76, 92 84, 90 96 C88 104, 76 102, 74 94 C72 84, 82 76, 82 66 C82 52, 70 46, 70 38 C70 32, 72 29, 75 28 Z" 
          fill="url(#otoGlow)" stroke="#c4b5fd" strokeWidth="2.5" />
        {/* Inner ear concha */}
        <path d="M85 44 C92 46, 94 56, 88 62" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
      </svg>
    )
  }

  // Reumatología
  if (norm.includes('reuma') || norm.includes('articulac')) {
    return (
      <svg viewBox="0 0 160 120" className={className} style={{ width: '100%', height: '100%', ...style }} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="reumaGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#db2777" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <circle cx="85" cy="60" r="42" fill="url(#reumaGlow)" opacity="0.2" filter="blur(16px)" />
        {/* Joint Articulation */}
        <path d="M60 30 C72 30, 80 40, 85 46 C90 40, 98 30, 110 30 L110 50 C102 54, 94 62, 85 64 C76 62, 68 54, 60 50 Z" 
          fill="url(#reumaGlow)" stroke="#f472b6" strokeWidth="2" />
        <path d="M60 90 C72 90, 80 80, 85 74 C90 80, 98 90, 110 90 L110 70 C102 66, 94 58, 85 56 C76 58, 68 66, 60 70 Z" 
          fill="url(#reumaGlow)" stroke="#f472b6" strokeWidth="2" />
        {/* Joint Inflammation Spark */}
        <circle cx="85" cy="60" r="6" fill="#f43f5e" opacity="0.8" />
      </svg>
    )
  }

  // Default / Basic Medicine / General
  return (
    <svg viewBox="0 0 160 120" className={className} style={{ width: '100%', height: '100%', ...style }} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="medGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <circle cx="85" cy="60" r="42" fill="url(#medGlow)" opacity="0.2" filter="blur(16px)" />
      {/* Stethoscope */}
      <path d="M60 30 L60 55 C60 75, 110 75, 110 55 L110 30" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
      <path d="M85 70 L85 92 Q85 104 100 102" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
      <circle cx="106" cy="100" r="10" fill="url(#medGlow)" stroke="#38bdf8" strokeWidth="2.5" />
      {/* Earpieces */}
      <circle cx="58" cy="28" r="4" fill="#cbd5e1" />
      <circle cx="112" cy="28" r="4" fill="#cbd5e1" />
    </svg>
  )
}
