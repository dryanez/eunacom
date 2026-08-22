import React from "react";

/**
 * DecisionTree Component for EUNACOM Clinical Algorithms (Sí / No Branching)
 * Renders full-width diagnostic / therapeutic flowcharts with clear visual hierarchy,
 * directional arrows, and color-coded conditional pathways.
 */
export function DecisionTree({
  classNumber = "CLASE 01",
  category = "CARDIOLOGÍA",
  topic = "ANGINA CRÓNICA ESTABLE",
  subtopic = "ALGORITMO DIAGNÓSTICO",
  title = "Algoritmo de Decisión Clínica",
  rootNode,
  branches = [],
  pearl
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
      {/* Top Breadcrumb & Logo Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "2px solid #e2e8f0",
        paddingBottom: 12,
        marginBottom: 12
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 800, textTransform: "uppercase" }}>
          <span style={{ background: "#0f172a", color: "#fff", padding: "4px 10px", borderRadius: 6, fontSize: 12 }}>
            {classNumber}
          </span>
          <span style={{ color: "#64748b" }}>{category}</span>
          <span style={{ color: "#cbd5e1" }}>›</span>
          <span style={{ color: "#0f172a" }}>{topic}</span>
          {subtopic && (
            <>
              <span style={{ color: "#cbd5e1" }}>›</span>
              <span style={{ color: "#e11d48" }}>{subtopic}</span>
            </>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
            Diagrama de Flujo Oficial
          </span>
          <img
            src="/logo.png"
            alt="EUNACOM"
            style={{ height: 30, width: "auto", objectFit: "contain", borderRadius: 4 }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        </div>
      </div>

      {/* Main Flowchart Canvas (Fills entire screen) */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
        margin: "6px 0"
      }}>
        {/* Level 1: Root Node */}
        {rootNode && (
          <div style={{
            background: rootNode.bg || "#0f172a",
            color: rootNode.color || "#ffffff",
            border: "3px solid #0f172a",
            borderRadius: 16,
            padding: "16px 36px",
            boxShadow: "6px 6px 0px rgba(15, 23, 42, 0.2)",
            textAlign: "center",
            maxWidth: 900
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.8, marginBottom: 4 }}>
              {rootNode.badge || "PUNTO DE PARTIDA CLÍNICO"}
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, fontFamily: "Bodoni Moda, Georgia, serif" }}>
              {rootNode.title}
            </div>
            {rootNode.subtitle && (
              <div style={{ fontSize: 16, opacity: 0.9, marginTop: 4, fontWeight: 500 }}>
                {rootNode.subtitle}
              </div>
            )}
          </div>
        )}

        {/* Down Arrow Connector */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#0f172a" }}>
          <span style={{ fontSize: 24, fontWeight: 900 }}>↓</span>
        </div>

        {/* Level 2: Decision Branches (Horizontal Grid with Sí / No) */}
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${branches.length}, 1fr)`,
          gap: 20,
          width: "100%",
          alignItems: "stretch"
        }}>
          {branches.map((b, idx) => (
            <div
              key={idx}
              style={{
                background: b.bg || "#ffffff",
                border: `3px solid ${b.borderColor || "#0f172a"}`,
                borderRadius: 20,
                padding: "20px 24px",
                boxShadow: "6px 6px 0px #0f172a",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 12,
                position: "relative"
              }}
            >
              {/* Branch Decision Pill (e.g. SÍ, NO, ECG NORMAL, BCRI) */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{
                  background: b.decisionBg || (b.isPositive ? "#16a34a" : "#dc2626"),
                  color: "#ffffff",
                  borderRadius: 9999,
                  padding: "5px 16px",
                  fontSize: 13,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em"
                }}>
                  {b.decisionLabel || (b.isPositive ? "✓ SÍ" : "✗ NO")}
                </span>

                {b.tag && (
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                    {b.tag}
                  </span>
                )}
              </div>

              {/* Branch Title & Description */}
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", lineHeight: 1.25, marginBottom: 8 }}>
                  {b.title}
                </div>
                {b.desc && (
                  <div style={{ fontSize: 16.5, color: "#334155", lineHeight: 1.45, fontWeight: 500 }}>
                    {b.desc}
                  </div>
                )}
              </div>

              {/* Action / Outcome Box at Bottom of Branch */}
              {b.action && (
                <div style={{
                  background: b.actionBg || "rgba(15, 23, 42, 0.05)",
                  borderLeft: `4px solid ${b.actionColor || "#0f172a"}`,
                  padding: "10px 14px",
                  borderRadius: "0 10px 10px 0",
                  marginTop: "auto"
                }}>
                  <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: b.actionColor || "#0f172a" }}>
                    ➔ Conducta EUNACOM:
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>
                    {b.action}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Prominent Golden Pearl at Bottom */}
      {pearl && (
        <div style={{
          background: "#fefce8",
          border: "2px solid #eab308",
          borderRadius: 14,
          padding: "14px 22px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginTop: 6
        }}>
          <span style={{ fontSize: 24 }}>💡</span>
          <div style={{ fontSize: 16.5, fontWeight: 700, color: "#854d0e", lineHeight: 1.4 }}>
            <strong style={{ color: "#713f12", textTransform: "uppercase" }}>Regla de Decisión EUNACOM: </strong>
            {pearl}
          </div>
        </div>
      )}
    </div>
  );
}
