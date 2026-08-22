import React from "react";

export function Cover({ classNumber = "CLASE 01", kicker, title, subtitle, badges = [] }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      width: "100%",
      justifyContent: "space-between",
      boxSizing: "border-box"
    }}>
      {/* Top Header Row with Badges & Logo */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {classNumber && (
            <span style={{
              background: "#0f172a",
              color: "#ffffff",
              borderRadius: 9999,
              padding: "6px 18px",
              fontSize: 13,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.06em"
            }}>
              {classNumber}
            </span>
          )}
          {badges.map((b, i) => (
            <span key={i} style={{
              background: b.bg || "#e0f2fe",
              color: b.color || "#0369a1",
              border: "1.5px solid " + (b.border || "#0284c7"),
              borderRadius: 9999,
              padding: "6px 16px",
              fontSize: 13,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.04em"
            }}>
              {b.label}
            </span>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 14, color: "#64748b" }}>
            {kicker}
          </span>
          <img
            src="/logo.png"
            alt="EUNACOM"
            style={{ height: 38, width: "auto", objectFit: "contain", borderRadius: 6 }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        </div>
      </div>

      {/* Center Big Title & Subtitle */}
      <div style={{ margin: "auto 0" }}>
        <h1 style={{
          fontFamily: "Bodoni Moda, Georgia, serif",
          fontSize: 72,
          fontWeight: 900,
          lineHeight: 1.08,
          letterSpacing: "-0.03em",
          color: "#0f172a",
          marginBottom: 20
        }}>
          {title}
        </h1>
        <p style={{
          fontSize: 26,
          fontWeight: 500,
          color: "#475569",
          maxWidth: 1300,
          lineHeight: 1.45
        }}>
          {subtitle}
        </p>
      </div>

      {/* Bottom Footer */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: "2px solid #e2e8f0",
        paddingTop: 18,
        color: "#64748b",
        fontSize: 15,
        fontWeight: 700
      }}>
        <span>ASOFAMECh Perfil V3 Oficial · Medicina Interna</span>
        <span>Avanza con Espacio / Flechas · Presiona "A" para Lápiz en Vivo</span>
      </div>
    </div>
  );
}
