import React from "react";

export function Steps({ classNumber = "CLASE 01", title, subtitle, items = [] }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      width: "100%",
      justifyContent: "space-between",
      boxSizing: "border-box"
    }}>
      {/* Header Row with Class Number & Logo */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        borderBottom: "2px solid #e2e8f0",
        paddingBottom: 14,
        marginBottom: 16
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ background: "#0f172a", color: "#fff", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 800 }}>
              {classNumber}
            </span>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#e11d48", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              ALGORITMO CLÍNICO PASO A PASO
            </span>
          </div>
          <h2 style={{ fontFamily: "Bodoni Moda, Georgia, serif", fontSize: 40, fontWeight: 900, color: "#0f172a", margin: 0, lineHeight: 1.15 }}>
            {title}
          </h2>
          {subtitle && <p style={{ fontSize: 18, color: "#475569", marginTop: 4, marginBottom: 0, fontWeight: 500 }}>{subtitle}</p>}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
            EUNACOM 2026
          </span>
          <img
            src="/logo.png"
            alt="EUNACOM"
            style={{ height: 32, width: "auto", objectFit: "contain", borderRadius: 4 }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        </div>
      </div>

      {/* Main Full-Width Steps Grid / List */}
      <div style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: items.length === 4 ? "repeat(2, 1fr)" : "1fr",
        gap: 18,
        alignContent: "center",
        margin: "10px 0"
      }}>
        {items.map((it, idx) => (
          <div
            key={idx}
            style={{
              background: "#ffffff",
              border: "2.5px solid #0f172a",
              borderRadius: 20,
              padding: "24px 28px",
              boxShadow: "6px 6px 0px #0f172a",
              display: "flex",
              alignItems: "flex-start",
              gap: 20
            }}
          >
            <div
              style={{
                minWidth: 44,
                height: 44,
                borderRadius: "50%",
                background: "#0f172a",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: 900,
                fontFamily: "monospace"
              }}
            >
              {it.num || (idx + 1)}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
              <div style={{ fontSize: 21, fontWeight: 800, color: "#0f172a", lineHeight: 1.25 }}>
                {it.title}
              </div>
              <div style={{ fontSize: 16.5, color: "#334155", lineHeight: 1.45, fontWeight: 500 }}>
                {it.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Branding */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "2px solid #e2e8f0", paddingTop: 14, color: "#64748b", fontSize: 13, fontWeight: 700 }}>
        <span>Dominio Clínico Obligatorio · Perfil V3 ASOFAMECh</span>
        <span>Avanza con Espacio / Flechas</span>
      </div>
    </div>
  );
}
