import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { FONT_FAMILY } from "../components/fonts";
import { THEME, SAFE, FACE_ZONE_HEIGHT } from "../components/theme";
import { Particles } from "../components/Particles";
import { FaceZone } from "../components/FaceZone";

const CARDS = [
  {
    icon: (
      <svg width={44} height={44} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#ef4444" strokeWidth="1.5" />
        <path d="M8 8l8 8M16 8l-8 8" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: "Examenes NO indicados",
    detail: "No se solicitan examenes de rutina en IRA no complicada",
    color: "#ef4444",
  },
  {
    icon: (
      <svg width={44} height={44} viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="16" height="16" rx="3" stroke="#f97316" strokeWidth="1.5" />
        <path d="M8 12h8M12 8v8" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Excepcion: Pandemia",
    detail: "PCR COVID-19 segun contexto epidemiologico",
    color: "#f97316",
  },
  {
    icon: (
      <svg width={44} height={44} viewBox="0 0 24 24" fill="none">
        <path d="M4 6h16M4 12h16M4 18h10" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="18" cy="18" r="3" stroke="#3b82f6" strokeWidth="1.5" />
      </svg>
    ),
    title: "Si hemograma",
    detail: "Esperar linfocitosis (etiologia viral)",
    color: "#3b82f6",
  },
];

export const Scene3Diagnostico: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerSpring = spring({ frame, fps, config: { damping: 200 }, delay: 5 });
  const headerY = interpolate(headerSpring, [0, 1], [30, 0]);

  const keyPointSpring = spring({ frame, fps, config: { damping: 200 }, delay: 15 });
  const keyPointScale = interpolate(keyPointSpring, [0, 1], [0.6, 1]);

  const glowPulse = Math.sin(frame * 0.06) * 0.3 + 0.7;

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.bg }}>
      <Particles />
      <FaceZone />

      {/* Glow behind key point */}
      <div
        style={{
          position: "absolute",
          top: FACE_ZONE_HEIGHT + 160,
          left: "50%",
          transform: "translateX(-50%)",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(34,197,94,${0.1 * glowPulse}) 0%, transparent 70%)`,
        }}
      />

      <AbsoluteFill
        style={{
          top: FACE_ZONE_HEIGHT,
          paddingLeft: SAFE.side,
          paddingRight: SAFE.side,
          paddingBottom: SAFE.bottom,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            opacity: headerSpring,
            transform: `translateY(${headerY}px)`,
          }}
        >
          <div
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 24,
              fontWeight: 600,
              color: THEME.accent,
              letterSpacing: 5,
              textTransform: "uppercase",
            }}
          >
            Enfoque
          </div>
          <div
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 46,
              fontWeight: 800,
              color: THEME.text,
              textAlign: "center",
              lineHeight: 1.15,
            }}
          >
            Diagnostico y{"\n"}Examenes
          </div>
        </div>

        {/* Key point circle */}
        <div
          style={{
            marginTop: 36,
            opacity: keyPointSpring,
            transform: `scale(${keyPointScale})`,
          }}
        >
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: "50%",
              border: `3px solid ${THEME.success}`,
              background: `radial-gradient(circle at 30% 30%, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 100%)`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              padding: 20,
              boxShadow: `0 0 40px rgba(34,197,94,0.15)`,
            }}
          >
            <div
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: 24,
                fontWeight: 800,
                color: THEME.success,
                textAlign: "center",
                lineHeight: 1.2,
              }}
            >
              Diagnostico
            </div>
            <div
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: 32,
                fontWeight: 800,
                color: THEME.success,
                textAlign: "center",
                lineHeight: 1.2,
                marginTop: 4,
              }}
            >
              CLINICO
            </div>
          </div>
        </div>

        {/* Cards */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginTop: 36,
            width: "100%",
            maxWidth: 900,
          }}
        >
          {CARDS.map((card, i) => {
            const cardSpring = spring({
              frame,
              fps,
              config: { damping: 200 },
              delay: 30 + i * 12,
            });
            const x = interpolate(cardSpring, [0, 1], [80, 0]);

            return (
              <div
                key={card.title}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  opacity: cardSpring,
                  transform: `translateX(${x}px)`,
                  padding: "22px 26px",
                  backgroundColor: `${card.color}08`,
                  border: `1px solid ${card.color}30`,
                  borderRadius: 18,
                  borderLeft: `4px solid ${card.color}`,
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 14,
                    backgroundColor: `${card.color}15`,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  {card.icon}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span
                    style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: 28,
                      fontWeight: 700,
                      color: card.color,
                    }}
                  >
                    {card.title}
                  </span>
                  <span
                    style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: 24,
                      fontWeight: 400,
                      color: THEME.muted,
                      lineHeight: 1.3,
                    }}
                  >
                    {card.detail}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
