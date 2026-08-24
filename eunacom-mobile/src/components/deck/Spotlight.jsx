import React from "react";

/**
 * Spotlight / Big Point Slide Component (Guevara High-Yield Visual Style)
 * Fullscreen widescreen card with large readable typography, top brand logo,
 * cohesive class number breadcrumbs, and prominent EUNACOM Golden Pearl.
 */
export function Spotlight({
  classNumber = "CLASE 01",
  category = "CARDIOLOGÍA",
  topic = "ANGINA CRÓNICA ESTABLE",
  subtopic,
  badge = "CONCEPTO CLAVE",
  badgeBg = "#0284c7",
  badgeColor = "#ffffff",
  title,
  stat,
  statLabel,
  bullets = [],
  pearl,
  accentColor = "#e11d48"
}) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      width: "100%",
      justifyContent: "space-between",
      fontFamily: "system-ui, -apple-system, sans-serif",
      boxSizing: "border-box"
    }}>
      {/* Cohesive Header with Class Number & Brand Logo */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "2px solid #e2e8f0",
        paddingBottom: 14,
        marginBottom: 16
      }}>
        {/* Left Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          <span style={{ background: "#0f172a", color: "#fff", padding: "4px 10px", borderRadius: 6, fontSize: 12 }}>
            {classNumber}
          </span>
          <span style={{ color: "#64748b" }}>{category}</span>
          <span style={{ color: "#cbd5e1" }}>›</span>
          <span style={{ color: "#0f172a" }}>{topic}</span>
          {subtopic && (
            <>
              <span style={{ color: "#cbd5e1" }}>›</span>
              <span style={{ color: accentColor }}>{subtopic}</span>
            </>
          )}
        </div>

        {/* Right Logo & Perfil Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            EUNACOM 2026 · Perfil V3
          </span>
          <img
            src="/logo.png"
            alt="EUNACOM"
            style={{ height: 32, width: "auto", objectFit: "contain", borderRadius: 4 }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        </div>
      </div>

      {/* Main Full-Width High-Impact Content Card */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#ffffff",
        border: "3px solid #0f172a",
        borderRadius: 24,
        padding: "36px 44px",
        boxShadow: "8px 8px 0px #0f172a",
        boxSizing: "border-box"
      }}>
        {/* Top Badge & Big Stat Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{
            background: badgeBg,
            color: badgeColor,
            borderRadius: 9999,
            padding: "8px 20px",
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: "0.06em",
            textTransform: "uppercase"
          }}>
            {badge}
          </span>

          {stat && (
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontSize: 44, fontWeight: 900, color: accentColor, fontFamily: "monospace", lineHeight: 1 }}>
                {stat}
              </span>
              {statLabel && (
                <span style={{ fontSize: 15, fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>
                  {statLabel}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Big Punchy Title */}
        <h2 style={{
          fontFamily: "Bodoni Moda, Georgia, serif",
          fontSize: 44,
          fontWeight: 900,
          color: "#0f172a",
          margin: "10px 0 0",
          lineHeight: 1.15
        }}>
          {title}
        </h2>

        {/* Large, Scannable Bullets with Big Number Badges */}
        {bullets.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, margin: "14px 0" }}>
            {bullets.map((b, idx) => (
              <div key={idx} style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
                fontSize: 21,
                fontWeight: 600,
                color: "#1e293b",
                lineHeight: 1.45
              }}>
                <div style={{
                  minWidth: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: `${accentColor}18`,
                  color: accentColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: 900,
                  marginTop: 2
                }}>
                  {idx + 1}
                </div>
                <div style={{ flex: 1 }}>{typeof b === "string" ? b : b}</div>
              </div>
            ))}
          </div>
        )}

        {/* Prominent Golden Pearl Box */}
        {pearl && (
          <div style={{
            background: "#fefce8",
            border: "2px solid #eab308",
            borderRadius: 16,
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: "auto"
          }}>
            <span style={{ fontSize: 26 }}>💡</span>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#854d0e", lineHeight: 1.45 }}>
              <strong style={{ color: "#713f12", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                Regla de Oro EUNACOM:{" "}
              </strong>
              {pearl}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
