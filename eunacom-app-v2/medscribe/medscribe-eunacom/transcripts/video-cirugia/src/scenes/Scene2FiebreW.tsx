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

const W_ITEMS = [
  {
    w: "Wind",
    meaning: "Atelectasia, Neumonia, TEP",
    color: "#3b82f6",
    icon: (
      <svg width={36} height={36} viewBox="0 0 24 24" fill="none">
        <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    w: "Water",
    meaning: "ITU",
    color: "#06b6d4",
    icon: (
      <svg width={36} height={36} viewBox="0 0 24 24" fill="none">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    w: "Wound",
    meaning: "Infeccion herida operatoria",
    color: "#ef4444",
    icon: (
      <svg width={36} height={36} viewBox="0 0 24 24" fill="none">
        <path d="M18 6L6 18M6 6l12 12" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="12" r="9" stroke="#ef4444" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    w: "Wonderful Drugs",
    meaning: "RAM, Hipertermia maligna",
    color: "#f97316",
    icon: (
      <svg width={36} height={36} viewBox="0 0 24 24" fill="none">
        <rect x="6" y="3" width="12" height="18" rx="6" stroke="#f97316" strokeWidth="1.5" />
        <line x1="6" y1="12" x2="18" y2="12" stroke="#f97316" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    w: "Veins",
    meaning: "TVP, TEP, Tromboflebitis",
    color: "#8b5cf6",
    icon: (
      <svg width={36} height={36} viewBox="0 0 24 24" fill="none">
        <path d="M12 3v18M8 7c0 3 4 3 4 6s-4 3-4 6M16 7c0 3-4 3-4 6s4 3 4 6" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export const Scene2FiebreW: React.FC = () => {
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
              color: "#ef4444",
              letterSpacing: 5,
              textTransform: "uppercase",
            }}
          >
            Memoriza esto
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
            Fiebre Postoperatoria
          </div>
          <div
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 26,
              fontWeight: 400,
              color: THEME.muted,
              textAlign: "center",
              marginTop: 4,
            }}
          >
            Las 5 W's
          </div>
        </div>

        {/* W Items */}
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
          {W_ITEMS.map((item, i) => {
            const itemSpring = spring({
              frame,
              fps,
              config: { damping: 200 },
              delay: 18 + i * 12,
            });
            const x = interpolate(itemSpring, [0, 1], [-60, 0]);

            return (
              <div
                key={item.w}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  opacity: itemSpring,
                  transform: `translateX(${x}px)`,
                  padding: "18px 22px",
                  backgroundColor: `${item.color}08`,
                  border: `1px solid ${item.color}30`,
                  borderRadius: 16,
                  borderLeft: `4px solid ${item.color}`,
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 14,
                    backgroundColor: `${item.color}15`,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div
                    style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: 32,
                      fontWeight: 800,
                      color: item.color,
                    }}
                  >
                    {item.w}
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: 26,
                      fontWeight: 400,
                      color: THEME.text,
                      lineHeight: 1.3,
                    }}
                  >
                    {item.meaning}
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
