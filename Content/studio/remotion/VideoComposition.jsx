import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const EunacomReelComposition = ({
  title = "SCACEST: La regla de los 120 minutos",
  specialty = "Cardiología",
  perfilV3Code = "1.01.2.002",
  activeHook = "El 80% de los médicos duda en esta pregunta del EUNACOM...",
  dialogueLines = [],
  ctaKeyword = "INFARTO",
  ctaLeadMagnet = "Mini-Simulacro de Cardiología (10 preguntas)"
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Animations
  const cardEntrance = spring({
    frame: frame - 15,
    fps,
    config: { damping: 12 }
  });

  const cardOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  // Calculate timer ticking down from 60
  const elapsedSeconds = Math.floor(frame / fps);
  const remainingSeconds = Math.max(0, 60 - elapsedSeconds);
  const formattedTimer = `00:${remainingSeconds.toString().padStart(2, '0')}`;

  // CTA Card entrance near the end (last 90 frames / 3 seconds)
  const ctaEntrance = spring({
    frame: frame - (durationInFrames - 90),
    fps,
    config: { damping: 10 }
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#020617', fontFamily: 'sans-serif' }}>
      
      {/* 1. TOP SAFE ZONE HEADER */}
      <div style={{
        position: 'absolute',
        top: 120,
        left: 48,
        right: 48,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 20
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(16px)',
          padding: '12px 24px',
          borderRadius: 9999,
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#ef4444' }} />
          <span style={{ color: '#ffffff', fontSize: 24, fontWeight: 800, letterSpacing: '0.05em' }}>
            EUNACOM APP
          </span>
          <span style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#38bdf8',
            backgroundColor: 'rgba(56,189,248,0.15)',
            padding: '4px 12px',
            borderRadius: 9999
          }}>
            {specialty}
          </span>
        </div>

        {/* 60s EXAM TIMER */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          backgroundColor: remainingSeconds < 15 ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.2)',
          backdropFilter: 'blur(16px)',
          padding: '12px 28px',
          borderRadius: 9999,
          border: `2px solid ${remainingSeconds < 15 ? '#ef4444' : '#f59e0b'}`,
          color: remainingSeconds < 15 ? '#fca5a5' : '#fbbf24',
          fontFamily: 'monospace',
          fontSize: 28,
          fontWeight: 900
        }}>
          <span>⏱️ {formattedTimer}</span>
        </div>
      </div>

      {/* 2. DYNAMIC QUESTION CARD OVERLAY (Appears at frame 30 to 180) */}
      {frame > 20 && frame < durationInFrames - 90 && (
        <div style={{
          position: 'absolute',
          top: 240,
          left: 48,
          right: 48,
          transform: `scale(${cardEntrance})`,
          opacity: cardOpacity,
          backgroundColor: 'rgba(15,23,42,0.92)',
          backdropFilter: 'blur(20px)',
          borderRadius: 32,
          padding: 36,
          border: '2px solid rgba(56,189,248,0.4)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
          zIndex: 15
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ color: '#38bdf8', fontSize: 20, fontWeight: 900, textTransform: 'uppercase' }}>
              Pregunta Fija · {perfilV3Code}
            </span>
            <span style={{ color: '#94a3b8', fontSize: 18, fontFamily: 'monospace' }}>
              Perfil V3 (2026)
            </span>
          </div>

          <p style={{ color: '#ffffff', fontSize: 30, fontWeight: 800, lineHeight: 1.3, marginBottom: 24 }}>
            {title}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: '16px 20px', borderRadius: 16, backgroundColor: 'rgba(30,41,59,0.8)', color: '#cbd5e1', fontSize: 22 }}>
              A) Tratamiento empírico inicial sin confirmación
            </div>
            <div style={{ padding: '16px 20px', borderRadius: 16, backgroundColor: 'rgba(56,189,248,0.2)', border: '2px solid #38bdf8', color: '#38bdf8', fontSize: 22, fontWeight: 800 }}>
              B) Algoritmo de reperfusión según tiempo de traslado
            </div>
          </div>
        </div>
      )}

      {/* 3. KINETIC HIGHLIGHTED SUBTITLES (Centered safe zone) */}
      <div style={{
        position: 'absolute',
        bottom: 240,
        left: 48,
        right: 48,
        display: 'flex',
        justifyContent: 'center',
        textAlign: 'center',
        zIndex: 25
      }}>
        <div style={{
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(16px)',
          padding: '24px 36px',
          borderRadius: 28,
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
        }}>
          <p style={{
            color: '#ffffff',
            fontSize: 42,
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            margin: 0
          }}>
            {frame < 90 ? (
              <span>
                {activeHook.split(' ').map((word, i) => (
                  <span key={i} style={{
                    color: i % 4 === 0 ? '#FFE600' : (i % 4 === 2 ? '#00E5FF' : '#ffffff'),
                    marginRight: 10
                  }}>
                    {word}
                  </span>
                ))}
              </span>
            ) : (
              <span>
                CONDUCTA INMEDIATA: <span style={{ color: '#00E5FF', textDecoration: 'underline' }}>ANGIOPLASTIA</span> EN &lt; <span style={{ color: '#FFE600' }}>120 MINUTOS</span>
              </span>
            )}
          </p>
        </div>
      </div>

      {/* 4. FINAL CTA POPUP (Last 3 seconds) */}
      {frame >= durationInFrames - 90 && (
        <div style={{
          position: 'absolute',
          top: 300,
          left: 48,
          right: 48,
          transform: `scale(${ctaEntrance})`,
          backgroundColor: 'rgba(15,23,42,0.95)',
          backdropFilter: 'blur(24px)',
          borderRadius: 36,
          padding: 48,
          border: '3px solid #00E5FF',
          boxShadow: '0 30px 60px rgba(0,229,255,0.2)',
          textAlign: 'center',
          zIndex: 30
        }}>
          <span style={{ color: '#00E5FF', fontSize: 24, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            ¿Aprobarías este caso en el examen?
          </span>
          <h3 style={{ color: '#ffffff', fontSize: 44, fontWeight: 900, margin: '20px 0' }}>
            {ctaLeadMagnet}
          </h3>
          <div style={{
            display: 'inline-block',
            backgroundColor: '#f59e0b',
            color: '#020617',
            fontSize: 32,
            fontWeight: 900,
            padding: '16px 36px',
            borderRadius: 9999,
            marginTop: 12
          }}>
            Comenta "{ctaKeyword}" o entra al link de la bio
          </div>
        </div>
      )}

    </AbsoluteFill>
  );
};
