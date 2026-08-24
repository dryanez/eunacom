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

const VIRUSES = [
  { name: "Rinovirus", highlight: true, color: "#ef4444" },
  { name: "VRS", highlight: false, color: "#f97316" },
  { name: "Parainfluenza", highlight: false, color: "#eab308" },
  { name: "COVID-19", highlight: false, color: "#22c55e" },
  { name: "Metaneumovirus", highlight: false, color: "#3b82f6" },
  { name: "Adenovirus", highlight: false, color: "#8b5cf6" },
];

export const Scene5Virus: React.FC = () => {
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
            Agentes Causales
          </div>
          <div
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 48,
              fontWeight: 800,
              color: THEME.text,
              textAlign: "center",
            }}
          >
            Etiologia
          </div>
        </div>

        {/* Virus tags */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginTop: 50,
            width: "100%",
            maxWidth: 900,
            alignItems: "center",
          }}
        >
          {VIRUSES.map((virus, i) => {
            const tagSpring = spring({
              frame,
              fps,
              config: { damping: 12, mass: 0.8, stiffness: 100 },
              delay: 15 + i * 10,
            });
            const scale = interpolate(tagSpring, [0, 1], [0.3, 1]);
            const y = interpolate(tagSpring, [0, 1], [40, 0]);

            return (
              <div
                key={virus.name}
                style={{
                  opacity: tagSpring,
                  transform: `scale(${scale}) translateY(${y}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  width: "100%",
                  padding: virus.highlight ? "24px 28px" : "18px 24px",
                  backgroundColor: virus.highlight
                    ? `${virus.color}15`
                    : `${virus.color}08`,
                  border: virus.highlight
                    ? `2px solid ${virus.color}`
                    : `1px solid ${virus.color}30`,
                  borderRadius: virus.highlight ? 20 : 14,
                  borderLeft: `4px solid ${virus.color}`,
                }}
              >
                {/* Virus icon */}
                <div
                  style={{
                    width: virus.highlight ? 56 : 44,
                    height: virus.highlight ? 56 : 44,
                    borderRadius: "50%",
                    backgroundColor: `${virus.color}20`,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width={virus.highlight ? 30 : 22}
                    height={virus.highlight ? 30 : 22}
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle cx="12" cy="12" r="6" stroke={virus.color} strokeWidth="1.5" />
                    <path d="M12 2v4M12 18v4M2 12h4M18 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" stroke={virus.color} strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span
                    style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: virus.highlight ? 34 : 28,
                      fontWeight: virus.highlight ? 800 : 400,
                      color: virus.highlight ? virus.color : THEME.text,
                    }}
                  >
                    {virus.name}
                  </span>
                  {virus.highlight && (
                    <span
                      style={{
                        fontFamily: FONT_FAMILY,
                        fontSize: 22,
                        fontWeight: 600,
                        color: virus.color,
                        opacity: 0.8,
                      }}
                    >
                      Mas frecuente
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
