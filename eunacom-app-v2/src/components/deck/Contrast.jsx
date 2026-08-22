import React from "react";

export function Contrast({ title, leftTitle, leftItems = [], rightTitle, rightItems = [] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
      <h2 style={{ fontFamily: 'Bodoni Moda, Georgia, serif', fontSize: 40, fontWeight: 900, color: "#0f172a", margin: 0 }}>
        {title}
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Left Side */}
        <div style={{
          background: "#fff1f2",
          border: "2.5px solid #0f172a",
          borderRadius: 22,
          padding: 26,
          boxShadow: "4px 4px 0px #0f172a",
          display: "flex",
          flexDirection: "column",
          gap: 14
        }}>
          <div style={{
            background: "#e11d48",
            color: "#fff",
            borderRadius: 9999,
            padding: "6px 16px",
            fontSize: 13,
            fontWeight: 800,
            textTransform: "uppercase",
            alignSelf: "flex-start",
            border: "1.5px solid #0f172a"
          }}>
            {leftTitle}
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {leftItems.map((it, i) => (
              <li key={i} style={{ fontSize: 16, color: "#881337", lineHeight: 1.45, display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ color: "#e11d48", fontWeight: 800 }}>✕</span>
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Side */}
        <div style={{
          background: "#f0fdf4",
          border: "2.5px solid #0f172a",
          borderRadius: 22,
          padding: 26,
          boxShadow: "4px 4px 0px #0f172a",
          display: "flex",
          flexDirection: "column",
          gap: 14
        }}>
          <div style={{
            background: "#16a34a",
            color: "#fff",
            borderRadius: 9999,
            padding: "6px 16px",
            fontSize: 13,
            fontWeight: 800,
            textTransform: "uppercase",
            alignSelf: "flex-start",
            border: "1.5px solid #0f172a"
          }}>
            {rightTitle}
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {rightItems.map((it, i) => (
              <li key={i} style={{ fontSize: 16, color: "#14532d", lineHeight: 1.45, display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ color: "#16a34a", fontWeight: 800 }}>✓</span>
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ borderTop: "2px solid #e2e8f0", paddingTop: 12, fontSize: 14, color: "#64748b", fontWeight: 600 }}>
        Contraste de alto rendimiento para preguntas con distractores clásicos.
      </div>
    </div>
  );
}
