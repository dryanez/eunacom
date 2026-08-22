import React from "react";

export function Cover({ kicker, title, subtitle, badges = [] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 10 }}>
          {badges.map((b, i) => (
            <span key={i} style={{
              background: b.bg || "#e0f2fe",
              color: b.color || "#0369a1",
              border: "1.5px solid " + (b.border || "#0284c7"),
              borderRadius: 9999,
              padding: "4px 14px",
              fontSize: 12,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.04em"
            }}>
              {b.label}
            </span>
          ))}
        </div>
        <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 13, color: "#64748b" }}>
          {kicker}
        </span>
      </div>

      <div style={{ margin: "auto 0" }}>
        <h1 style={{
          fontFamily: 'Bodoni Moda, Georgia, serif',
          fontSize: 64,
          fontWeight: 900,
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          color: "#0f172a",
          marginBottom: 16
        }}>
          {title}
        </h1>
        <p style={{ fontSize: 24, fontWeight: 500, color: "#475569", maxWidth: 1100, lineHeight: 1.4 }}>
          {subtitle}
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "2px solid #e2e8f0", paddingTop: 16, color: "#64748b", fontSize: 14, fontWeight: 600 }}>
        <span>ASOFAMECh Perfil V3 Oficial · Medicina Interna</span>
        <span>Avanza con Espacio / Flechas · Presiona "A" para Lápiz en Vivo</span>
      </div>
    </div>
  );
}
