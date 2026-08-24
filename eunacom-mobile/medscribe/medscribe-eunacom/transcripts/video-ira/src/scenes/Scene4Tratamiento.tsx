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

type DrugCardProps = {
  title: string;
  detail: string;
  color: string;
  animProgress: number;
};

const DrugCard: React.FC<DrugCardProps> = ({ title, detail, color, animProgress }) => {
  const y = interpolate(animProgress, [0, 1], [50, 0]);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        opacity: animProgress,
        transform: `translateY(${y}px)`,
        backgroundColor: `${color}08`,
        border: `1px solid ${color}30`,
        borderRadius: 18,
        borderLeft: `4px solid ${color}`,
        padding: "22px 26px",
        width: "100%",
        maxWidth: 900,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          backgroundColor: `${color}15`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <svg width={32} height={32} viewBox="0 0 24 24" fill="none">
          <rect x="6" y="3" width="12" height="18" rx="6" stroke={color} strokeWidth="1.5" />
          <rect x="6" y="12" width="12" height="9" rx="6" fill={color} opacity={0.25} />
          <line x1="6" y1="12" x2="18" y2="12" stroke={color} strokeWidth="1.5" />
        </svg>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: 30,
            fontWeight: 700,
            color,
          }}
        >
          {title}
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
          {detail}
        </span>
      </div>
    </div>
  );
};

export const Scene4Tratamiento: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerSpring = spring({ frame, fps, config: { damping: 200 }, delay: 5 });
  const headerY = interpolate(headerSpring, [0, 1], [30, 0]);

  const bigTextSpring = spring({ frame, fps, config: { damping: 200 }, delay: 15 });
  const bigTextScale = interpolate(bigTextSpring, [0, 1], [0.6, 1]);

  const card1 = spring({ frame, fps, config: { damping: 200 }, delay: 30 });
  const card2 = spring({ frame, fps, config: { damping: 200 }, delay: 40 });
  const card3 = spring({ frame, fps, config: { damping: 200 }, delay: 50 });

  const comboSpring = spring({ frame, fps, config: { damping: 200 }, delay: 65 });

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
            Farmacologia
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
            Tratamiento
          </div>
        </div>

        {/* Big text */}
        <div
          style={{
            marginTop: 28,
            opacity: bigTextSpring,
            transform: `scale(${bigTextScale})`,
            padding: "18px 44px",
            background: "rgba(34,197,94,0.1)",
            border: `2px solid rgba(34,197,94,0.4)`,
            borderRadius: 50,
          }}
        >
          <span
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 36,
              fontWeight: 800,
              color: THEME.success,
            }}
          >
            100% Sintomatico
          </span>
        </div>

        {/* Drug cards */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            marginTop: 32,
            width: "100%",
            alignItems: "center",
          }}
        >
          <DrugCard
            title="Paracetamol"
            detail="Analgesico y antipiretico de primera linea"
            color="#3b82f6"
            animProgress={card1}
          />
          <DrugCard
            title="AINEs"
            detail="Ibuprofeno / Naproxeno si dolor importante"
            color="#f97316"
            animProgress={card2}
          />
          <DrugCard
            title="Pseudoefedrina"
            detail="Descongestionante nasal oral"
            color="#8b5cf6"
            animProgress={card3}
          />
        </div>

        {/* Combined pills */}
        <div
          style={{
            marginTop: 32,
            display: "flex",
            gap: 20,
            opacity: comboSpring,
            transform: `translateY(${interpolate(comboSpring, [0, 1], [20, 0])}px)`,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              padding: "18px 32px",
              background: "rgba(99,102,241,0.1)",
              border: `1.5px solid rgba(99,102,241,0.4)`,
              borderRadius: 20,
            }}
          >
            <span
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: 22,
                fontWeight: 400,
                color: THEME.muted,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              Dia
            </span>
            <span
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: 28,
                fontWeight: 700,
                color: THEME.accentLight,
              }}
            >
              + Cafeina
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              padding: "18px 32px",
              background: "rgba(139,92,246,0.1)",
              border: `1.5px solid rgba(139,92,246,0.4)`,
              borderRadius: 20,
            }}
          >
            <span
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: 22,
                fontWeight: 400,
                color: THEME.muted,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              Noche
            </span>
            <span
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: 28,
                fontWeight: 700,
                color: "#a78bfa",
              }}
            >
              + Clorfenamina
            </span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
