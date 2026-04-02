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

const ScalpelIcon: React.FC<{ progress: number }> = ({ progress }) => {
  const dashLength = 600;
  const dashOffset = dashLength * (1 - progress);
  return (
    <svg width={140} height={140} viewBox="0 0 100 100">
      {/* Scalpel blade */}
      <path
        d="M50 15 L60 50 L50 55 L40 50 Z"
        fill="none"
        stroke={THEME.accent}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dashLength}
        strokeDashoffset={dashOffset}
      />
      {/* Handle */}
      <path
        d="M46 55 L54 55 L53 85 L47 85 Z"
        fill="none"
        stroke={THEME.accentLight}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dashLength}
        strokeDashoffset={dashOffset}
      />
      {/* Blade edge highlight */}
      <path
        d="M50 18 L58 48"
        fill="none"
        stroke={THEME.accent}
        strokeWidth={1}
        strokeLinecap="round"
        strokeDasharray={dashLength}
        strokeDashoffset={dashOffset}
        opacity={0.5}
      />
    </svg>
  );
};

export const Scene1Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const iconDraw = interpolate(frame, [0, 45], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const iconScale = spring({ frame, fps, config: { damping: 200 }, delay: 5 });

  const labelSpring = spring({ frame, fps, config: { damping: 200 }, delay: 15 });
  const labelY = interpolate(labelSpring, [0, 1], [20, 0]);

  const titleSpring = spring({ frame, fps, config: { damping: 200 }, delay: 25 });
  const titleY = interpolate(titleSpring, [0, 1], [50, 0]);

  const lineWidth = spring({ frame, fps, config: { damping: 200 }, delay: 35 });

  const subtitleSpring = spring({ frame, fps, config: { damping: 200 }, delay: 45 });
  const subtitleY = interpolate(subtitleSpring, [0, 1], [30, 0]);

  const tagSpring = spring({ frame, fps, config: { damping: 200 }, delay: 60 });

  const glowPulse = Math.sin(frame * 0.08) * 0.3 + 0.7;

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.bg }}>
      <Particles />
      <FaceZone />

      {/* Subtle radial glow behind content */}
      <div
        style={{
          position: "absolute",
          top: FACE_ZONE_HEIGHT + 100,
          left: "50%",
          transform: "translateX(-50%)",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(99,102,241,${0.08 * glowPulse}) 0%, transparent 70%)`,
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
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
        >
          <div
            style={{
              transform: `scale(${iconScale})`,
              filter: `drop-shadow(0 0 20px rgba(99,102,241,0.4))`,
            }}
          >
            <ScalpelIcon progress={iconDraw} />
          </div>

          {/* Label */}
          <div
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 24,
              fontWeight: 600,
              color: THEME.accent,
              letterSpacing: 5,
              textTransform: "uppercase",
              opacity: labelSpring,
              transform: `translateY(${labelY}px)`,
            }}
          >
            CIRUGIA
          </div>

          <div
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 68,
              fontWeight: 800,
              color: THEME.text,
              textAlign: "center",
              opacity: titleSpring,
              transform: `translateY(${titleY}px)`,
              lineHeight: 1.1,
              letterSpacing: -1,
            }}
          >
            Cirugia General
          </div>

          <div
            style={{
              width: `${lineWidth * 240}px`,
              height: 4,
              background: THEME.gradientAccent,
              borderRadius: 2,
            }}
          />

          <div
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 34,
              fontWeight: 400,
              color: THEME.muted,
              textAlign: "center",
              opacity: subtitleSpring,
              transform: `translateY(${subtitleY}px)`,
              lineHeight: 1.5,
              maxWidth: 800,
            }}
          >
            Clase 1: Complicaciones{"\n"}Postquirurgicas
          </div>

          <div
            style={{
              opacity: tagSpring,
              transform: `scale(${0.8 + tagSpring * 0.2})`,
              marginTop: 10,
              padding: "14px 40px",
              background: THEME.cardBg,
              border: `1.5px solid ${THEME.accent}`,
              borderRadius: 50,
            }}
          >
            <span
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: 28,
                fontWeight: 600,
                color: THEME.accentLight,
              }}
            >
              ~10 preguntas EUNACOM
            </span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
