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

const CORRECT_INDEX = 1; // B is correct

const OPTIONS = [
  { letter: "A", text: "Solicitar radiografia de torax y hemograma" },
  { letter: "B", text: "Indicar paracetamol y reposo, sin examenes" },
  { letter: "C", text: "Iniciar amoxicilina 500mg c/8h por 7 dias" },
  { letter: "D", text: "Solicitar PCR para COVID-19 y cultivo faringeo" },
];

const REVEAL_FRAME = 150;

export const Scene6Eunacom: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerSpring = spring({ frame, fps, config: { damping: 200 }, delay: 5 });
  const headerY = interpolate(headerSpring, [0, 1], [30, 0]);

  const questionSpring = spring({ frame, fps, config: { damping: 200 }, delay: 15 });
  const questionY = interpolate(questionSpring, [0, 1], [20, 0]);

  const isRevealed = frame >= REVEAL_FRAME;
  const revealSpring = spring({
    frame: Math.max(0, frame - REVEAL_FRAME),
    fps,
    config: { damping: 200 },
  });

  const ctaSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: 100,
  });

  const ctaFade = isRevealed
    ? interpolate(frame, [REVEAL_FRAME, REVEAL_FRAME + 15], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : ctaSpring;

  const pulse = Math.sin(frame * 0.1) * 0.4 + 0.6;

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
        {/* Badge */}
        <div
          style={{
            opacity: headerSpring,
            transform: `translateY(${headerY}px)`,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              padding: "8px 24px",
              background: "rgba(239,68,68,0.15)",
              border: "1.5px solid rgba(239,68,68,0.4)",
              borderRadius: 50,
            }}
          >
            <span
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: 22,
                fontWeight: 800,
                color: "#ef4444",
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              EUNACOM
            </span>
          </div>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: `rgba(99,102,241,${0.15 * pulse})`,
              border: `2px solid rgba(99,102,241,${0.5 * pulse})`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontFamily: FONT_FAMILY,
              fontSize: 26,
              fontWeight: 800,
              color: THEME.accent,
            }}
          >
            ?
          </div>
        </div>

        {/* Question */}
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: 30,
            fontWeight: 400,
            color: THEME.text,
            textAlign: "center",
            lineHeight: 1.45,
            maxWidth: 880,
            marginTop: 24,
            opacity: questionSpring,
            transform: `translateY(${questionY}px)`,
          }}
        >
          Paciente de 28 anos consulta por{" "}
          <span style={{ fontWeight: 700, color: THEME.accentLight }}>
            rinorrea, odinofagia y tos seca
          </span>{" "}
          de 2 dias de evolucion. Examen fisico: faringe eritematosa,
          temperatura 37.8 C.{" "}
          <span style={{ fontWeight: 700, color: THEME.accentLight }}>
            Examen pulmonar normal.
          </span>{" "}
          <span style={{ fontWeight: 700, color: THEME.accentLight }}>
            Cual es la conducta mas apropiada?
          </span>
        </div>

        {/* Options */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            marginTop: 36,
            width: "100%",
            maxWidth: 900,
          }}
        >
          {OPTIONS.map((opt, i) => {
            const optSpring = spring({
              frame,
              fps,
              config: { damping: 200 },
              delay: 30 + i * 8,
            });
            const x = interpolate(optSpring, [0, 1], [60, 0]);

            const isCorrect = i === CORRECT_INDEX;

            let bgColor = THEME.cardBg;
            let borderColor = THEME.cardBorder;
            let letterColor = THEME.accent;
            let textColor = THEME.text;
            let leftBorder = `4px solid ${THEME.cardBorder}`;

            if (isRevealed) {
              if (isCorrect) {
                bgColor = `rgba(34,197,94,${0.12 * revealSpring})`;
                borderColor = `rgba(34,197,94,${0.5 * revealSpring})`;
                letterColor = THEME.success;
                leftBorder = `4px solid ${THEME.success}`;
              } else {
                textColor = `rgba(255,255,255,${0.3 + 0.2 * (1 - revealSpring)})`;
                letterColor = `rgba(99,102,241,${0.3 + 0.2 * (1 - revealSpring)})`;
              }
            }

            return (
              <div
                key={opt.letter}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  opacity: optSpring,
                  transform: `translateX(${x}px)`,
                  padding: "18px 24px",
                  backgroundColor: bgColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: 16,
                  borderLeft: leftBorder,
                  transition: "none",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: isRevealed && isCorrect
                      ? THEME.gradientSuccess
                      : `${letterColor}20`,
                    border: `1.5px solid ${letterColor}`,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontFamily: FONT_FAMILY,
                    fontSize: 26,
                    fontWeight: 800,
                    color: isRevealed && isCorrect ? "#fff" : letterColor,
                    flexShrink: 0,
                  }}
                >
                  {isRevealed && isCorrect ? "\u2713" : opt.letter}
                </div>
                <div
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: 28,
                    fontWeight: isRevealed && isCorrect ? 600 : 400,
                    color: textColor,
                    lineHeight: 1.3,
                  }}
                >
                  {opt.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA before reveal */}
        {!isRevealed && (
          <div
            style={{
              marginTop: 36,
              opacity: ctaFade,
              transform: `scale(${0.9 + ctaSpring * 0.1})`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: 32,
                fontWeight: 700,
                color: THEME.text,
                textAlign: "center",
              }}
            >
              Cual eliges?
            </div>
            <div
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: 24,
                fontWeight: 400,
                color: THEME.muted,
              }}
            >
              Comenta tu respuesta
            </div>
          </div>
        )}

        {/* Explanation after reveal */}
        {isRevealed && (
          <div
            style={{
              marginTop: 28,
              opacity: revealSpring,
              transform: `translateY(${interpolate(revealSpring, [0, 1], [15, 0])}px)`,
              padding: "20px 28px",
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.3)",
              borderRadius: 16,
              maxWidth: 880,
            }}
          >
            <div
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: 26,
                fontWeight: 400,
                color: THEME.text,
                lineHeight: 1.4,
                textAlign: "center",
              }}
            >
              IRA con examen pulmonar normal = diagnostico clinico.{" "}
              <span style={{ color: THEME.success, fontWeight: 600 }}>
                Tratamiento 100% sintomatico
              </span>{" "}
              sin antibioticos ni examenes de rutina.
            </div>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
