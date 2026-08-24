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

const SIGNS = [
  { text: "Rinorrea", color: "#6366f1" },
  { text: "Disfonia", color: "#8b5cf6" },
  { text: "Odinofagia", color: "#a78bfa" },
  { text: "Tos", color: "#3b82f6" },
  { text: "Faringe eritematosa", color: "#14b8a6" },
  { text: "Fiebre", color: "#f97316" },
  { text: "Adenopatias", color: "#ec4899" },
];

export const Scene2Clinica: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerSpring = spring({ frame, fps, config: { damping: 200 }, delay: 5 });
  const headerY = interpolate(headerSpring, [0, 1], [30, 0]);

  const bottomSpring = spring({ frame, fps, config: { damping: 200 }, delay: 75 });

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.bg }}>
      <Particles />
      <FaceZone />
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
            Presentacion
          </div>
          <div
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 48,
              fontWeight: 800,
              color: THEME.text,
              textAlign: "center",
              lineHeight: 1.15,
              maxWidth: 860,
            }}
          >
            Clinica de la IRA
          </div>
        </div>

        {/* Cards */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginTop: 40,
            width: "100%",
            maxWidth: 900,
          }}
        >
          {SIGNS.map((sign, i) => {
            const cardSpring = spring({
              frame,
              fps,
              config: { damping: 200 },
              delay: 15 + i * 7,
            });
            const x = interpolate(cardSpring, [0, 1], [-60, 0]);

            return (
              <div
                key={sign.text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  opacity: cardSpring,
                  transform: `translateX(${x}px)`,
                  padding: "16px 24px",
                  backgroundColor: `${sign.color}08`,
                  border: `1px solid ${sign.color}30`,
                  borderRadius: 14,
                  borderLeft: `4px solid ${sign.color}`,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: `${sign.color}20`,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="4" fill={sign.color} opacity={0.6} />
                  </svg>
                </div>
                <div
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: 30,
                    fontWeight: 400,
                    color: THEME.text,
                  }}
                >
                  {sign.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Green highlight */}
        <div
          style={{
            marginTop: 36,
            opacity: bottomSpring,
            transform: `scale(${0.8 + bottomSpring * 0.2})`,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 36px",
            background: "rgba(34,197,94,0.1)",
            border: `1.5px solid rgba(34,197,94,0.4)`,
            borderRadius: 50,
          }}
        >
          <svg width={28} height={28} viewBox="0 0 24 24" fill="none">
            <path
              d="M5 13l4 4L19 7"
              stroke={THEME.success}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 28,
              fontWeight: 600,
              color: THEME.success,
            }}
          >
            Examen Pulmonar NORMAL
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
