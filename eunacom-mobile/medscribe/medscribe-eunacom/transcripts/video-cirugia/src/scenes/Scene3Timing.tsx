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

const TIMELINE = [
  {
    time: "Inmediata",
    cause: "Hipertermia maligna",
    detail: ">41 C, succinilcolina",
    color: "#ef4444",
    highlighted: false,
  },
  {
    time: "<24h",
    cause: "Atelectasia",
    detail: "MAS FRECUENTE",
    color: "#f97316",
    highlighted: true,
  },
  {
    time: ">48h",
    cause: "Infeccion herida operatoria",
    detail: "Buscar signos locales",
    color: "#8b5cf6",
    highlighted: false,
  },
];

export const Scene3Timing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerSpring = spring({ frame, fps, config: { damping: 200 }, delay: 5 });
  const headerY = interpolate(headerSpring, [0, 1], [30, 0]);

  const lineProgress = interpolate(frame, [20, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const glowPulse = Math.sin(frame * 0.08) * 0.3 + 0.7;

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
            Cronologia
          </div>
          <div
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 48,
              fontWeight: 800,
              color: THEME.text,
              textAlign: "center",
              lineHeight: 1.15,
            }}
          >
            Timing de la Fiebre
          </div>
        </div>

        {/* Timeline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 0,
            marginTop: 50,
            width: "100%",
            maxWidth: 900,
            position: "relative",
            paddingLeft: 40,
          }}
        >
          {/* Vertical line */}
          <div
            style={{
              position: "absolute",
              left: 18,
              top: 0,
              width: 4,
              height: `${lineProgress * 100}%`,
              background: THEME.gradientAccent,
              borderRadius: 2,
            }}
          />

          {TIMELINE.map((item, i) => {
            const itemSpring = spring({
              frame,
              fps,
              config: { damping: 200 },
              delay: 25 + i * 20,
            });
            const y = interpolate(itemSpring, [0, 1], [40, 0]);

            return (
              <div
                key={item.time}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 24,
                  opacity: itemSpring,
                  transform: `translateY(${y}px)`,
                  marginBottom: 40,
                  position: "relative",
                }}
              >
                {/* Dot */}
                <div
                  style={{
                    position: "absolute",
                    left: -34,
                    top: 16,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    backgroundColor: item.color,
                    border: `3px solid ${THEME.bg}`,
                    boxShadow: `0 0 12px ${item.color}60`,
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    padding: "22px 28px",
                    backgroundColor: item.highlighted
                      ? `${item.color}15`
                      : THEME.cardBg,
                    border: item.highlighted
                      ? `2px solid ${item.color}`
                      : `1px solid ${THEME.cardBorder}`,
                    borderRadius: 18,
                    width: "100%",
                    boxShadow: item.highlighted
                      ? `0 0 30px ${item.color}20`
                      : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div
                      style={{
                        fontFamily: FONT_FAMILY,
                        fontSize: 28,
                        fontWeight: 800,
                        color: item.color,
                        padding: "4px 16px",
                        backgroundColor: `${item.color}15`,
                        borderRadius: 8,
                      }}
                    >
                      {item.time}
                    </div>
                    <div
                      style={{
                        fontFamily: FONT_FAMILY,
                        fontSize: 32,
                        fontWeight: 600,
                        color: THEME.text,
                      }}
                    >
                      {item.cause}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: 24,
                      fontWeight: item.highlighted ? 700 : 400,
                      color: item.highlighted ? item.color : THEME.muted,
                      marginLeft: 4,
                    }}
                  >
                    {item.highlighted && (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 12px",
                          backgroundColor: `${item.color}20`,
                          borderRadius: 6,
                          marginRight: 8,
                          opacity: glowPulse,
                        }}
                      >
                        CLAVE
                      </span>
                    )}
                    {item.detail}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
