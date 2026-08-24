import React from "react";

/**
 * Massive Full-Bleed Algorithmic Decision Flowchart (Guevara & Board Review Style)
 * Uses the entire 16:9 widescreen canvas to present multi-step branching algorithms
 * with bold visual connectors, clear Sí/No pathways, and giant readable typography.
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
  bottomBanner
}) {
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
        borderBottom: "3px solid #0f172a",
        paddingBottom: 10,
        marginBottom: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            background: "#0f172a",
            color: "#fff",
            padding: "5px 14px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 900,
            letterSpacing: "0.05em"
          }}>
            {classNumber}
          </span>
          <span style={{ fontSize: 15, fontWeight: 900, color: "#e11d48", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {category} › {topic} {subtopic && `› ${subtopic}`}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Diagrama Algorítmico EUNACOM
          </span>
          <img
            src="/logo.png"
            alt="EUNACOM"
            style={{ height: 34, width: "auto", objectFit: "contain", borderRadius: 4 }}
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
        gap: 12,
        margin: "4px 0"
      }}>
        {/* ROW 1: START NODE (Top Center / Full Width) */}
        {startNode && (
          <div style={{
            background: startNode.bg || "#0f172a",
            color: startNode.color || "#ffffff",
            border: "3.5px solid #0f172a",
            borderRadius: 18,
            padding: "16px 28px",
            boxShadow: "6px 6px 0px rgba(15, 23, 42, 0.25)",
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
                padding: "4px 14px",
                fontSize: 12,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.06em"
              }}>
                {startNode.badge || "PUNTO DE PARTIDA"}
              </span>
              <h3 style={{ fontSize: 26, fontWeight: 900, margin: "6px 0 0", fontFamily: "Bodoni Moda, Georgia, serif" }}>
                {startNode.title}
              </h3>
            </div>
            {startNode.subtitle && (
              <div style={{ fontSize: 18, fontWeight: 600, opacity: 0.95, maxWidth: 650, textAlign: "right", lineHeight: 1.35 }}>
                {startNode.subtitle}
              </div>
            )}
          </div>
        )}

        {/* ROW 2: DECISION QUESTION & BRANCHING ARROWS */}
        {decisionNode && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            margin: "2px 0"
          }}>
            <div style={{
              background: "#fef3c7",
              border: "3px solid #d97706",
              borderRadius: 16,
              padding: "10px 32px",
              boxShadow: "4px 4px 0px #d97706",
              display: "flex",
              alignItems: "center",
              gap: 12
            }}>
              <span style={{ fontSize: 24 }}>❓</span>
              <span style={{ fontSize: 21, fontWeight: 900, color: "#92400e" }}>
                {decisionNode}
              </span>
            </div>
          </div>
        )}

        {/* ROW 3: BRANCHES (Large Side-by-Side Cards with Big Connectors) */}
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${branches.length}, 1fr)`,
          gap: 18,
          flex: 1,
          width: "100%",
          alignItems: "stretch"
        }}>
          {branches.map((b, idx) => (
            <div
              key={idx}
              style={{
                background: b.bg || "#ffffff",
                border: `3.5px solid ${b.borderColor || (b.isYes ? "#16a34a" : b.isNo ? "#dc2626" : "#0f172a")}`,
                borderRadius: 20,
                padding: "22px 26px",
                boxShadow: "6px 6px 0px #0f172a",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxSizing: "border-box"
              }}
            >
              {/* Branch Decision Pill & Arrow */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{
                    background: b.pillBg || (b.isYes ? "#16a34a" : b.isNo ? "#dc2626" : "#0284c7"),
                    color: "#ffffff",
                    borderRadius: 9999,
                    padding: "6px 18px",
                    fontSize: 14,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    boxShadow: "2px 2px 0px rgba(0,0,0,0.2)"
                  }}>
                    {b.pillText || (b.isYes ? "✓ SÍ (Elegible)" : b.isNo ? "✗ NO (Contraindicado)" : b.label)}
                  </span>
                  {b.tag && (
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                      {b.tag}
                    </span>
                  )}
                </div>

                {/* Big Step Title */}
                <div style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", lineHeight: 1.2, marginBottom: 10 }}>
                  {b.title}
                </div>

                {/* Bullet Points / Details */}
                {b.points && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "10px 0" }}>
                    {b.points.map((pt, pIdx) => (
                      <div key={pIdx} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 17, color: "#1e293b", lineHeight: 1.4, fontWeight: 600 }}>
                        <span style={{ color: b.isYes ? "#16a34a" : (b.isNo ? "#dc2626" : "#0284c7"), fontWeight: 900 }}>•</span>
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action / Next Step Banner at Bottom of Branch */}
              {b.action && (
                <div style={{
                  background: b.actionBg || (b.isYes ? "#dcfce7" : b.isNo ? "#fee2e2" : "#f1f5f9"),
                  border: `2px solid ${b.isYes ? "#16a34a" : b.isNo ? "#dc2626" : "#0f172a"}`,
                  borderRadius: 14,
                  padding: "12px 18px",
                  marginTop: 12
                }}>
                  <div style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", color: b.isYes ? "#166534" : (b.isNo ? "#991b1b" : "#475569"), letterSpacing: "0.05em" }}>
                    ➔ Conducta EUNACOM:
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", marginTop: 2 }}>
                    {b.action}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM HIGH-YIELD BANNER ── */}
      {bottomBanner && (
        <div style={{
          background: bottomBanner.bg || "#fefce8",
          border: `2.5px solid ${bottomBanner.border || "#eab308"}`,
          borderRadius: 16,
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginTop: 6
        }}>
          <span style={{ fontSize: 26 }}>{bottomBanner.icon || "💡"}</span>
          <div style={{ fontSize: 17, fontWeight: 700, color: bottomBanner.textColor || "#854d0e", lineHeight: 1.4 }}>
            <strong style={{ color: bottomBanner.strongColor || "#713f12", textTransform: "uppercase", letterSpacing: "0.03em" }}>
              {bottomBanner.title || "Regla de Decisión EUNACOM"}:{" "}
            </strong>
            {bottomBanner.text}
          </div>
        </div>
      )}
    </div>
  );
}
