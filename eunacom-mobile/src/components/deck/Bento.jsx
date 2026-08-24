import React from "react";

export function Bento({ title, subtitle, tiles = [] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
      <div>
        <h2 style={{ fontFamily: "Bodoni Moda, Georgia, serif", fontSize: 38, fontWeight: 900, color: "#0f172a", margin: 0 }}>
          {title}
        </h2>
        {subtitle && <p style={{ fontSize: 17, color: "#64748b", marginTop: 4 }}>{subtitle}</p>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
        {tiles.map((t, i) => (
          <div key={i} style={{
            background: t.bg || "#ffffff",
            border: "2px solid #0f172a",
            borderRadius: 20,
            padding: "20px 22px",
            boxShadow: "4px 4px 0px #0f172a",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            gridColumn: t.colSpan ? "span " + t.colSpan : "span 1"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{
                background: t.pillBg || "#0f172a",
                color: t.pillColor || "#ffffff",
                borderRadius: 9999,
                padding: "4px 12px",
                fontSize: 11,
                fontWeight: 800,
                textTransform: "uppercase"
              }}>
                {t.tag}
              </span>
              {t.stat && (
                <span style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", fontFamily: "monospace" }}>
                  {t.stat}
                </span>
              )}
            </div>

            <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
              {t.title}
            </div>

            {t.bullets ? (
              <div style={{
                display: t.gridColumns ? "grid" : "flex",
                gridTemplateColumns: t.gridColumns ? "repeat(" + t.gridColumns + ", 1fr)" : "none",
                flexDirection: t.gridColumns ? "none" : "column",
                gap: 8
              }}>
                {t.bullets.map((b, bIdx) => (
                  <div key={bIdx} style={{
                    fontSize: 14.5,
                    color: "#1e293b",
                    lineHeight: 1.4,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    background: t.bulletBg || "transparent",
                    padding: t.bulletBg ? "6px 10px" : 0,
                    borderRadius: t.bulletBg ? 8 : 0,
                    border: t.bulletBg ? "1px solid rgba(15,23,42,0.08)" : "none"
                  }}>
                    <span style={{ color: "#e11d48", fontWeight: 800 }}>➔</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.45, margin: 0 }}>
                {t.desc}
              </p>
            )}
          </div>
        ))}
      </div>

      <div style={{ background: "#eff6ff", border: "2px solid #0f172a", borderRadius: 16, padding: "12px 20px", fontSize: 15, fontWeight: 600, color: "#1e40af", boxShadow: "3px 3px 0px #0f172a" }}>
        🎯 <strong>Conceptos de Dominio EUNACOM:</strong> Escaneo visual rápido de causas y factores desencadenantes.
      </div>
    </div>
  );
}
