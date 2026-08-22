import React from "react";

export function Steps({ title, subtitle, items = [] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
      <div>
        <h2 style={{ fontFamily: 'Bodoni Moda, Georgia, serif', fontSize: 40, fontWeight: 900, color: "#0f172a", margin: 0 }}>
          {title}
        </h2>
        {subtitle && <p style={{ fontSize: 18, color: "#64748b", marginTop: 4 }}>{subtitle}</p>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(" + items.length + ", 1fr)", gap: 18, position: "relative" }}>
        {items.map((step, idx) => (
          <div key={idx} style={{
            background: "#ffffff",
            border: "2px solid #0f172a",
            borderRadius: 20,
            padding: 22,
            boxShadow: "4px 4px 0px #0f172a",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            position: "relative"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: step.badgeBg || "#0f172a",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 14
              }}>
                {idx + 1}
              </span>
              <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "#64748b" }}>
                {step.tag}
              </span>
            </div>

            <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
              {step.title}
            </div>

            <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.45, margin: 0 }}>
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      <div style={{ background: "#fef9c3", border: "2px solid #0f172a", borderRadius: 16, padding: "12px 20px", fontSize: 15, fontWeight: 600, color: "#713f12", boxShadow: "3px 3px 0px #0f172a" }}>
        📌 <strong>Regla de Algoritmo EUNACOM:</strong> Sigue siempre la secuencia protocolizada antes de pasar a la siguiente etapa terapéutica.
      </div>
    </div>
  );
}
