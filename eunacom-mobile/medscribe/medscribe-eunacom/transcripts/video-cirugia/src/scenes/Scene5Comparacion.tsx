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

const LEFT_ITEMS = [
  { label: "Tardia", detail: "semanas-meses" },
  { label: "CON saco", detail: "peritoneo integro" },
  { label: "Cirugia electiva", detail: "programada" },
];

const RIGHT_ITEMS = [
  { label: "Aguda", detail: "dias postoperatorio" },
  { label: "SIN saco", detail: "contenido expuesto" },
  { label: "URGENCIA", detail: "quirurgica inmediata" },
];

export const Scene5Comparacion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerSpring = spring({ frame, fps, config: { damping: 200 }, delay: 5 });
  const headerY = interpolate(headerSpring, [0, 1], [30, 0]);

  const vsSpring = spring({ frame, fps, config: { damping: 200 }, delay: 30 });
  const vsScale = interpolate(vsSpring, [0, 1], [0.4, 1]);

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
            Comparacion
          </div>
          <div
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 44,
              fontWeight: 800,
              color: THEME.text,
              textAlign: "center",
              lineHeight: 1.15,
            }}
          >
            Eventracion vs{"\n"}Evisceracion
          </div>
        </div>

        {/* Side by side */}
        <div
          style={{
            display: "flex",
            gap: 20,
            marginTop: 40,
            width: "100%",
            maxWidth: 920,
          }}
        >
          {/* Left - Eventracion */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: 30,
                fontWeight: 800,
                color: "#f97316",
                textAlign: "center",
                opacity: spring({ frame, fps, config: { damping: 200 }, delay: 18 }),
                padding: "12px 0",
                background: "rgba(249,115,22,0.08)",
                border: "1px solid rgba(249,115,22,0.3)",
                borderRadius: 14,
              }}
            >
              Eventracion
            </div>
            {LEFT_ITEMS.map((item, i) => {
              const itemSpring = spring({
                frame,
                fps,
                config: { damping: 200 },
                delay: 30 + i * 12,
              });
              const x = interpolate(itemSpring, [0, 1], [-40, 0]);

              return (
                <div
                  key={item.label}
                  style={{
                    opacity: itemSpring,
                    transform: `translateX(${x}px)`,
                    padding: "16px 18px",
                    backgroundColor: "rgba(249,115,22,0.06)",
                    border: "1px solid rgba(249,115,22,0.2)",
                    borderRadius: 14,
                    borderLeft: "3px solid #f97316",
                  }}
                >
                  <div
                    style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: 26,
                      fontWeight: 700,
                      color: "#f97316",
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: 22,
                      fontWeight: 400,
                      color: THEME.muted,
                      marginTop: 4,
                    }}
                  >
                    {item.detail}
                  </div>
                </div>
              );
            })}
          </div>

          {/* VS circle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: vsSpring,
              transform: `scale(${vsScale})`,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: THEME.gradientAccent,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontFamily: FONT_FAMILY,
                fontSize: 22,
                fontWeight: 800,
                color: "#fff",
                boxShadow: `0 0 20px rgba(99,102,241,${0.3 * glowPulse})`,
              }}
            >
              VS
            </div>
          </div>

          {/* Right - Evisceracion */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: 30,
                fontWeight: 800,
                color: "#ef4444",
                textAlign: "center",
                opacity: spring({ frame, fps, config: { damping: 200 }, delay: 18 }),
                padding: "12px 0",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 14,
              }}
            >
              Evisceracion
            </div>
            {RIGHT_ITEMS.map((item, i) => {
              const itemSpring = spring({
                frame,
                fps,
                config: { damping: 200 },
                delay: 30 + i * 12,
              });
              const x = interpolate(itemSpring, [0, 1], [40, 0]);

              return (
                <div
                  key={item.label}
                  style={{
                    opacity: itemSpring,
                    transform: `translateX(${x}px)`,
                    padding: "16px 18px",
                    backgroundColor: "rgba(239,68,68,0.06)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: 14,
                    borderLeft: "3px solid #ef4444",
                  }}
                >
                  <div
                    style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: 26,
                      fontWeight: 700,
                      color: "#ef4444",
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: 22,
                      fontWeight: 400,
                      color: THEME.muted,
                      marginTop: 4,
                    }}
                  >
                    {item.detail}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
