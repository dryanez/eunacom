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

const COMPLICATIONS = [
  {
    name: "Seroma",
    treatment: "Drenaje aspirativo",
    color: "#22c55e",
    urgent: false,
  },
  {
    name: "Hematoma",
    treatment: "Drenaje quirurgico",
    color: "#22c55e",
    urgent: false,
  },
  {
    name: "Eventracion",
    treatment: "Cirugia electiva",
    color: "#f97316",
    urgent: false,
  },
  {
    name: "Evisceracion",
    treatment: "URGENCIA quirurgica",
    color: "#ef4444",
    urgent: true,
  },
  {
    name: "Dehiscencia",
    treatment: "Cirugia urgente",
    color: "#ef4444",
    urgent: true,
  },
];

export const Scene4Complicaciones: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerSpring = spring({ frame, fps, config: { damping: 200 }, delay: 5 });
  const headerY = interpolate(headerSpring, [0, 1], [30, 0]);

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
            Concepto Clave
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
            Complicaciones{"\n"}de la Herida
          </div>
        </div>

        {/* Cards */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            marginTop: 36,
            width: "100%",
            maxWidth: 920,
          }}
        >
          {COMPLICATIONS.map((comp, i) => {
            const cardSpring = spring({
              frame,
              fps,
              config: { damping: 200 },
              delay: 18 + i * 10,
            });
            const x = interpolate(cardSpring, [0, 1], [80, 0]);

            return (
              <div
                key={comp.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  opacity: cardSpring,
                  transform: `translateX(${x}px)`,
                  padding: "20px 24px",
                  backgroundColor: `${comp.color}08`,
                  border: `1px solid ${comp.color}30`,
                  borderRadius: 16,
                  borderLeft: `4px solid ${comp.color}`,
                }}
              >
                {/* Urgency indicator */}
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: comp.urgent
                      ? `linear-gradient(135deg, ${comp.color} 0%, ${comp.color}aa 100%)`
                      : `${comp.color}15`,
                    border: `1.5px solid ${comp.color}`,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  {comp.urgent ? (
                    <svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 13l4 4L19 7"
                        stroke={comp.color}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div
                    style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: 32,
                      fontWeight: 800,
                      color: comp.color,
                    }}
                  >
                    {comp.name}
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: 26,
                      fontWeight: comp.urgent ? 600 : 400,
                      color: comp.urgent ? comp.color : THEME.text,
                    }}
                  >
                    {comp.treatment}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 36,
            opacity: spring({ frame, fps, config: { damping: 200 }, delay: 75 }),
          }}
        >
          {[
            { label: "Conservador", color: "#22c55e" },
            { label: "Urgente", color: "#ef4444" },
          ].map((leg) => (
            <div
              key={leg.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 24px",
                background: `${leg.color}10`,
                border: `1.5px solid ${leg.color}40`,
                borderRadius: 50,
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  backgroundColor: leg.color,
                }}
              />
              <span
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: 24,
                  fontWeight: 600,
                  color: leg.color,
                }}
              >
                {leg.label}
              </span>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
