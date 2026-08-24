import React, { useEffect } from "react";
import { useDeck } from "../../deck/DeckContext";

/**
 * Massive Full-Bleed Algorithmic Decision Flowchart (Guevara & Board Review Style)
 * Supports progressive animated disclosure (clicks) so each decision branch
 * appears step-by-step as the narrator explains each diagnostic pathway.
 */
export function DecisionFlowchart({
  classNumber = "CLASE 01",
  category = "CARDIOLOGÍA",
  topic = "ANGINA CRÓNICA ESTABLE",
  subtopic = "ALGORITMO DIAGNÓSTICO",
  title = "Algoritmo Diagnóstico & Conducta Terapéutica",
  startNode,
  decisionNode,
  branches = [],
  bottomBanner,
  animated = true
}) {
  const { clicks = 0, registerMax, isStatic } = useDeck();

  // Register total click steps: 0 = start+question, 1..N = branches, N+1 = bottomBanner
  const totalSteps = branches.length + (bottomBanner ? 1 : 0);
  useEffect(() => {
    if (!isStatic && registerMax && animated) {
      registerMax(totalSteps);
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
        alignItems: "center",
        borderBottom: "2px solid #0f172a",
        paddingBottom: 10,
        marginBottom: 8
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            background: "#0f172a",
            color: "#fff",
            padding: "4px 12px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 900,
            letterSpacing: "0.05em"
          }}>
            {classNumber}
          </span>
          <span style={{ fontSize: 14, fontWeight: 900, color: "#e11d48", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {category} › {topic} {subtopic && `› ${subtopic}`}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
            Diagrama de Flujo Interactivo
          </span>
          <img
            src="/logo.png"
            alt="EUNACOM"
            style={{ height: 30, width: "auto", objectFit: "contain", borderRadius: 4 }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        </div>
      </div>

      {/* ── MAIN MASSIVE FLOWCHART CANVAS ── */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 10,
        margin: "4px 0"
      }}>
        {/* ROW 1: START NODE */}
        {startNode && (
          <div style={{
            background: startNode.bg || "#0f172a",
            color: startNode.color || "#ffffff",
            border: "2.5px solid #0f172a",
            borderRadius: 16,
            padding: "14px 24px",
            boxShadow: "4px 4px 0px rgba(15, 23, 42, 0.25)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            boxSizing: "border-box"
          }}>
            <div>
              <span style={{
                background: startNode.badgeBg || "#e11d48",
                color: "#fff",
                borderRadius: 9999,
                padding: "3px 12px",
                fontSize: 11,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.06em"
              }}>
                {startNode.badge || "PUNTO DE PARTIDA"}
              </span>
              <h3 style={{ fontSize: 24, fontWeight: 900, margin: "4px 0 0", fontFamily: "Bodoni Moda, Georgia, serif" }}>
                {startNode.title}
              </h3>
            </div>
            {startNode.subtitle && (
              <div style={{ fontSize: 16.5, fontWeight: 600, opacity: 0.95, maxWidth: 650, textAlign: "right", lineHeight: 1.35 }}>
                {startNode.subtitle}
              </div>
            )}
          </div>
        )}

        {/* ROW 2: DECISION QUESTION & DOWN ARROW */}
        {decisionNode && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16
          }}>
            <div style={{
              background: "#fef3c7",
              border: "2.5px solid #d97706",
              borderRadius: 14,
              padding: "8px 26px",
              boxShadow: "3px 3px 0px #d97706",
              display: "flex",
              alignItems: "center",
              gap: 10
            }}>
              <span style={{ fontSize: 20 }}>❓</span>
              <span style={{ fontSize: 19, fontWeight: 900, color: "#92400e" }}>
                {decisionNode}
              </span>
            </div>
          </div>
        )}

        {/* ROW 3: BRANCHES (Animated Reveal Click-by-Click) */}
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${branches.length}, 1fr)`,
          gap: 16,
          flex: 1,
          width: "100%",
          alignItems: "stretch"
        }}>
          {branches.map((b, idx) => {
            // Reveal branches progressively: Branch idx revealed when clicks >= idx + 1
            const isVisible = !animated || isStatic || clicks >= idx + 1;
            const isCurrent = animated && !isStatic && clicks === idx + 1;

            return (
              <div
                key={idx}
                style={{
                  background: isCurrent ? "#f8fafc" : (b.bg || "#ffffff"),
                  border: isCurrent
                    ? `3px solid ${b.isYes ? "#16a34a" : b.isNo ? "#dc2626" : "#0284c7"}`
                    : isVisible
                    ? `2.5px solid ${b.borderColor || (b.isYes ? "#16a34a" : b.isNo ? "#dc2626" : "#0f172a")}`
                    : "2px dashed #cbd5e1",
                  borderRadius: 18,
                  padding: "18px 22px",
                  boxShadow: isCurrent
                    ? `0 10px 24px rgba(0,0,0,0.15), 4px 4px 0px ${b.isYes ? "#16a34a" : b.isNo ? "#dc2626" : "#0284c7"}`
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
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{
                      background: b.pillBg || (b.isYes ? "#16a34a" : b.isNo ? "#dc2626" : "#0284c7"),
                      color: "#ffffff",
                      borderRadius: 9999,
                      padding: "5px 16px",
                      fontSize: 13,
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      boxShadow: isCurrent ? "0 0 10px rgba(0,0,0,0.2)" : "none"
                    }}>
                      {b.pillText || (b.isYes ? "✓ SÍ" : b.isNo ? "✗ NO" : b.label)}
                    </span>
                    {b.tag && (
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                        {b.tag}
                      </span>
                    )}
                  </div>

                  {/* Big Step Title */}
                  <div style={{ fontSize: 21, fontWeight: 900, color: "#0f172a", lineHeight: 1.25, marginBottom: 8 }}>
                    {b.title}
                  </div>

                  {/* Bullet Points */}
                  {b.points && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "8px 0" }}>
                      {b.points.map((pt, pIdx) => (
                        <div key={pIdx} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 16, color: "#1e293b", lineHeight: 1.35, fontWeight: 600 }}>
                          <span style={{ color: b.isYes ? "#16a34a" : (b.isNo ? "#dc2626" : "#0284c7"), fontWeight: 900 }}>•</span>
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Banner */}
                {b.action && (
                  <div style={{
                    background: b.actionBg || (b.isYes ? "#dcfce7" : b.isNo ? "#fee2e2" : "#f1f5f9"),
                    border: `1.5px solid ${b.isYes ? "#16a34a" : b.isNo ? "#dc2626" : "#0f172a"}`,
                    borderRadius: 12,
                    padding: "10px 14px",
                    marginTop: 10
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", color: b.isYes ? "#166534" : (b.isNo ? "#991b1b" : "#475569"), letterSpacing: "0.05em" }}>
                      ➔ Conducta EUNACOM:
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: "#0f172a", marginTop: 2 }}>
                      {b.action}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── BOTTOM BANNER (Appears on Final Step) ── */}
      {bottomBanner && (() => {
        const isBannerVisible = !animated || isStatic || clicks >= branches.length + 1;
        return (
          <div style={{
            background: bottomBanner.bg || "#fefce8",
            border: `2px solid ${bottomBanner.border || "#eab308"}`,
            borderRadius: 14,
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 4,
            opacity: isBannerVisible ? 1 : 0,
            transform: isBannerVisible ? "translateY(0)" : "translateY(8px)",
            transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
            pointerEvents: isBannerVisible ? "auto" : "none"
          }}>
            <span style={{ fontSize: 24 }}>{bottomBanner.icon || "💡"}</span>
            <div style={{ fontSize: 16, fontWeight: 700, color: bottomBanner.textColor || "#854d0e", lineHeight: 1.4 }}>
              <strong style={{ color: bottomBanner.strongColor || "#713f12", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                {bottomBanner.title || "Regla de Decisión EUNACOM"}:{" "}
              </strong>
              {bottomBanner.text}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
