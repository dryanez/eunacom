import React, { useEffect } from "react";
import { useDeck } from "../../deck/DeckContext";

/**
 * FlowGrid Component: Clean, animated, step-by-step horizontal sequence
 * Uses progressive reveals (clicks) so each card & arrow animates smoothly
 * into view as the narrator discusses it, keeping the viewer fully engaged.
 */
export function FlowGrid({
  classNumber = "CLASE 01",
  category = "CARDIOLOGÍA",
  topic = "ANGINA CRÓNICA ESTABLE",
  subtopic = "SECUENCIA CLÍNICA",
  title,
  subtitle,
  steps = [],
  conclusion,
  pearl,
  animated = true
}) {
  const { clicks = 0, registerMax, isStatic } = useDeck();

  // Register the total number of click-steps for this slide
  const totalSteps = steps.length + (conclusion || pearl ? 1 : 0);
  useEffect(() => {
    if (!isStatic && registerMax && animated) {
      registerMax(totalSteps - 1);
    }
  }, [totalSteps, isStatic, registerMax, animated]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      width: "100%",
      justifyContent: "space-between",
      boxSizing: "border-box",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      {/* ── TOP HEADER ── */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        borderBottom: "2px solid #e2e8f0",
        paddingBottom: 10,
        marginBottom: 8
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
            <span style={{ background: "#0f172a", color: "#fff", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 900 }}>
              {classNumber}
            </span>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#0284c7", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {category} › {topic} {subtopic && `› ${subtopic}`}
            </span>
          </div>
          <h2 style={{ fontFamily: "Bodoni Moda, Georgia, serif", fontSize: 38, fontWeight: 900, color: "#0f172a", margin: 0, lineHeight: 1.15 }}>
            {title}
          </h2>
          {subtitle && <p style={{ fontSize: 17, color: "#475569", marginTop: 4, marginBottom: 0, fontWeight: 500 }}>{subtitle}</p>}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
            EUNACOM 2026
          </span>
          <img
            src="/logo.png"
            alt="EUNACOM"
            style={{ height: 30, width: "auto", objectFit: "contain", borderRadius: 4 }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        </div>
      </div>

      {/* ── MAIN HORIZONTAL FLOW WITH ANIMATED STEPS ── */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "stretch",
        justifyContent: "space-between",
        gap: 16,
        margin: "12px 0",
        width: "100%"
      }}>
        {steps.map((st, idx) => {
          // Visibility based on current click index
          const isVisible = !animated || isStatic || clicks >= idx;
          const isCurrent = animated && !isStatic && clicks === idx;

          return (
            <React.Fragment key={idx}>
              <div style={{
                flex: 1,
                background: isCurrent ? "#f8fafc" : "#ffffff",
                border: isCurrent
                  ? "3px solid #0284c7"
                  : isVisible
                  ? "2.5px solid #0f172a"
                  : "2px dashed #cbd5e1",
                borderRadius: 20,
                padding: "24px 22px",
                boxShadow: isCurrent
                  ? "0 12px 28px rgba(2, 132, 199, 0.2), 4px 4px 0px #0284c7"
                  : isVisible
                  ? "4px 4px 0px #0f172a"
                  : "none",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxSizing: "border-box",
                opacity: isVisible ? 1 : 0.25,
                transform: isVisible ? "translateY(0)" : "translateY(12px)",
                filter: isVisible ? "none" : "blur(1px)",
                transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
              }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: isCurrent ? "#0284c7" : "#0f172a",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: 17,
                      boxShadow: isCurrent ? "0 0 12px rgba(2, 132, 199, 0.5)" : "none"
                    }}>
                      {idx + 1}
                    </span>
                    {st.tag && (
                      <span style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: isCurrent ? "#0284c7" : "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        background: isCurrent ? "rgba(2, 132, 199, 0.1)" : "rgba(15, 23, 42, 0.05)",
                        padding: "4px 10px",
                        borderRadius: 6
                      }}>
                        {st.tag}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", lineHeight: 1.25, marginBottom: 8 }}>
                    {st.title}
                  </div>

                  <div style={{ fontSize: 16.5, color: "#334155", lineHeight: 1.45, fontWeight: 500 }}>
                    {st.desc}
                  </div>
                </div>

                {st.footer && (
                  <div style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: isCurrent ? "#0284c7" : "#475569",
                    borderTop: "1.5px solid #e2e8f0",
                    paddingTop: 8,
                    marginTop: 8
                  }}>
                    ➔ {st.footer}
                  </div>
                )}
              </div>

              {/* Connecting Arrow between steps */}
              {idx < steps.length - 1 && (
                <div style={{
                  fontSize: 32,
                  fontWeight: 900,
                  color: clicks > idx ? "#0284c7" : "#cbd5e1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  opacity: clicks > idx || isStatic ? 1 : 0.25,
                  transform: clicks > idx ? "scale(1.1)" : "scale(1)",
                  transition: "all 0.35s ease"
                }}>
                  ➔
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── CONCLUSION & PEARL FOOTERS (Appears on the final click) ── */}
      {(() => {
        const isFooterVisible = !animated || isStatic || clicks >= steps.length;
        return (
          <div style={{
            opacity: isFooterVisible ? 1 : 0,
            transform: isFooterVisible ? "translateY(0)" : "translateY(10px)",
            transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
            pointerEvents: isFooterVisible ? "auto" : "none"
          }}>
            {conclusion && (
              <div style={{
                background: "#f0fdf4",
                border: "2px solid #16a34a",
                borderRadius: 14,
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: pearl ? 6 : 0
              }}>
                <span style={{ fontSize: 22 }}>🎯</span>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#14532d" }}>
                  {conclusion}
                </div>
              </div>
            )}

            {pearl && (
              <div style={{
                background: "#fefce8",
                border: "2px solid #eab308",
                borderRadius: 14,
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                gap: 12
              }}>
                <span style={{ fontSize: 22 }}>💡</span>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#854d0e", lineHeight: 1.4 }}>
                  <strong style={{ color: "#713f12", textTransform: "uppercase" }}>Regla de Oro EUNACOM: </strong>
                  {pearl}
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
