import React from "react";

/**
 * Guevara-Style Clinical Algorithm / Decision Tree Component
 * Spans 100% of the widescreen canvas (full-bleed) with connected decision nodes,
 * large Sí/No branches, bold arrows, high-contrast badges, and actionable clinical pathways.
 */
export function GuevaraAlgorithm({
  classNumber = "CLASE 01",
  category = "CARDIOLOGÍA",
  title = "Algoritmo Diagnóstico & Conducta Terapéutica",
  subtitle,
  rootNode,
  decisionQuestion,
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
      fontFamily: "system-ui, -apple-system, sans-serif",
      background: "#0f172a",
      color: "#ffffff",
      padding: "20px 30px"
    }}>
      {/* ── HEADER ── */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "2px solid #334155",
        paddingBottom: 8,
        marginBottom: 8
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ background: "#e11d48", color: "#fff", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 900 }}>
            {classNumber}
          </span>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {category} · {title}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>EUNACOM 2026</span>
          <img src="/logo.png" alt="EUNACOM" style={{ height: 26, width: "auto" }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
        </div>
      </div>

      {/* ── MAIN FULL-SCREEN ALGORITHM CANVAS ── */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 8,
        width: "100%"
      }}>
        {/* LEVEL 1: ROOT CLINICAL ENTRY */}
        {rootNode && (
          <div style={{
            background: rootNode.bg || "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
            border: "2px solid #38bdf8",
            borderRadius: 12,
            padding: "12px 24px",
            boxShadow: "0 4px 20px rgba(56, 189, 248, 0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <span style={{ background: "#0284c7", color: "#fff", padding: "2px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 900, textTransform: "uppercase" }}>
                {rootNode.badge || "EVALUACIÓN INICIAL"}
              </span>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#f8fafc", marginTop: 4 }}>
                {rootNode.title}
              </div>
            </div>
            {rootNode.desc && (
              <div style={{ fontSize: 15, color: "#cbd5e1", maxWidth: 600, textAlign: "right", fontWeight: 500 }}>
                {rootNode.desc}
              </div>
            )}
          </div>
        )}

        {/* CONNECTOR LINE & QUESTION DIAMOND */}
        {decisionQuestion && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: 3, height: 12, background: "#38bdf8" }} />
            <div style={{
              background: "#fbbf24",
              color: "#78350f",
              border: "2px solid #d97706",
              borderRadius: 10,
              padding: "6px 24px",
              fontSize: 17,
              fontWeight: 900,
              boxShadow: "0 4px 12px rgba(251, 191, 36, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: 8
            }}>
              <span>❓</span>
              <span>{decisionQuestion}</span>
            </div>
            <div style={{ width: 3, height: 12, background: "#38bdf8" }} />
          </div>
        )}

        {/* LEVEL 2: MULTI-BRANCH DECISION NODES */}
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${branches.length}, 1fr)`,
          gap: 12,
          flex: 1,
          alignItems: "stretch"
        }}>
          {branches.map((b, idx) => (
            <div
              key={idx}
              style={{
                background: b.bg || "#1e293b",
                border: `2px solid ${b.borderColor || (b.isYes ? "#22c55e" : b.isNo ? "#ef4444" : "#38bdf8")}`,
                borderRadius: 14,
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 6px 16px rgba(0,0,0,0.3)"
              }}
            >
              <div>
                {/* Branch Badge */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{
                    background: b.isYes ? "#16a34a" : b.isNo ? "#dc2626" : "#0284c7",
                    color: "#ffffff",
                    borderRadius: 9999,
                    padding: "3px 12px",
                    fontSize: 12,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em"
                  }}>
                    {b.decisionTag || (b.isYes ? "✓ SÍ" : b.isNo ? "✗ NO" : b.label)}
                  </span>
                  {b.tag && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>
                      {b.tag}
                    </span>
                  )}
                </div>

                {/* Branch Main Title */}
                <div style={{ fontSize: 18, fontWeight: 900, color: "#f8fafc", lineHeight: 1.25, marginBottom: 8 }}>
                  {b.title}
                </div>

                {/* Bullets */}
                {b.bullets && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {b.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 14, color: "#cbd5e1", lineHeight: 1.35 }}>
                        <span style={{ color: b.isYes ? "#4ade80" : b.isNo ? "#f87171" : "#38bdf8", fontWeight: 900 }}>•</span>
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Banner (Conducta EUNACOM) */}
              {b.action && (
                <div style={{
                  background: b.actionBg || (b.isYes ? "rgba(34, 197, 94, 0.15)" : b.isNo ? "rgba(239, 68, 68, 0.15)" : "rgba(56, 189, 248, 0.15)"),
                  border: `1.5px solid ${b.isYes ? "#22c55e" : b.isNo ? "#ef4444" : "#38bdf8"}`,
                  borderRadius: 10,
                  padding: "8px 12px",
                  marginTop: 10
                }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: b.isYes ? "#4ade80" : b.isNo ? "#f87171" : "#38bdf8", textTransform: "uppercase" }}>
                    ➔ Conducta EUNACOM:
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#ffffff", marginTop: 2 }}>
                    {b.action}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM GOLDEN RULE BANNER ── */}
      {bottomBanner && (
        <div style={{
          background: "linear-gradient(90deg, #78350f 0%, #451a03 100%)",
          border: "2px solid #f59e0b",
          borderRadius: 12,
          padding: "10px 18px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginTop: 8,
          boxShadow: "0 4px 14px rgba(245, 158, 11, 0.2)"
        }}>
          <span style={{ fontSize: 22 }}>💡</span>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: "#fef3c7", lineHeight: 1.35 }}>
            <strong style={{ color: "#fbbf24", textTransform: "uppercase" }}>Regla de Oro EUNACOM: </strong>
            {bottomBanner}
          </div>
        </div>
      )}
    </div>
  );
}
