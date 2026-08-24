import React from "react";

/**
 * Guevara-Style Full-Screen Comparison Matrix / Table
 * Fills 100% of the 16:9 canvas with high contrast, large readable text,
 * color-coded status badges, and zero dead margins.
 */
export function GuevaraTable({
  classNumber = "CLASE 01",
  category = "CARDIOLOGÍA",
  title,
  subtitle,
  headers = [],
  rows = [],
  highlightColIndex = null,
  bottomNote
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
        marginBottom: 10
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
            <span style={{ background: "#e11d48", color: "#fff", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 900 }}>
              {classNumber}
            </span>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {category} · TABLA COMPARATIVA
            </span>
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: "#f8fafc", margin: 0, lineHeight: 1.15 }}>
            {title}
          </h2>
          {subtitle && <div style={{ fontSize: 15, color: "#94a3b8", marginTop: 2 }}>{subtitle}</div>}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>EUNACOM 2026</span>
          <img src="/logo.png" alt="EUNACOM" style={{ height: 26, width: "auto" }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
        </div>
      </div>

      {/* ── MASSIVE FULL-SCREEN TABLE ── */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        border: "2px solid #334155",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
      }}>
        <table style={{ width: "100%", height: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#1e293b", borderBottom: "2px solid #475569" }}>
              {headers.map((h, idx) => (
                <th
                  key={idx}
                  style={{
                    padding: "14px 16px",
                    textAlign: idx === 0 ? "left" : "center",
                    fontSize: 16,
                    fontWeight: 900,
                    color: idx === highlightColIndex ? "#38bdf8" : "#f1f5f9",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    borderRight: idx < headers.length - 1 ? "1px solid #334155" : "none"
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr
                key={rIdx}
                style={{
                  background: rIdx % 2 === 0 ? "#0f172a" : "#1e293b",
                  borderBottom: rIdx < rows.length - 1 ? "1px solid #334155" : "none"
                }}
              >
                {row.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    style={{
                      padding: "12px 16px",
                      textAlign: cIdx === 0 ? "left" : "center",
                      fontSize: cIdx === 0 ? 17 : 16,
                      fontWeight: cIdx === 0 ? 800 : (cIdx === highlightColIndex ? 800 : 500),
                      color: cIdx === highlightColIndex ? "#38bdf8" : (cIdx === 0 ? "#f8fafc" : "#cbd5e1"),
                      borderRight: cIdx < row.length - 1 ? "1px solid #334155" : "none",
                      lineHeight: 1.35
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── BOTTOM NOTE ── */}
      {bottomNote && (
        <div style={{
          background: "#1e293b",
          borderLeft: "4px solid #38bdf8",
          padding: "8px 16px",
          borderRadius: "0 8px 8px 0",
          fontSize: 14,
          fontWeight: 600,
          color: "#e2e8f0",
          marginTop: 8
        }}>
          💡 {bottomNote}
        </div>
      )}
    </div>
  );
}
