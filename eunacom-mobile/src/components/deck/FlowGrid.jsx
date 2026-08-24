import React from "react";

/**
 * FlowGrid Component: Massive horizontal connected flowchart with bold arrow connectors
 * Completely fills the widescreen 16:9 canvas from top to bottom with zero dead margin.
 */
export function FlowGrid({
  classNumber = "CLASE 01",
  category = "CARDIOLOGÍA",
  topic = "ANGINA CRÓNICA ESTABLE",
  subtopic = "SECUENCIA CLÍNICA",
  title,
  subtitle,
  steps = [],
  conclusion,
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
      {/* ── TOP HEADER ── */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        borderBottom: "3px solid #0f172a",
        paddingBottom: 10,
        marginBottom: 10
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
            <span style={{ background: "#0f172a", color: "#fff", padding: "4px 12px", borderRadius: 6, fontSize: 13, fontWeight: 900 }}>
              {classNumber}
            </span>
            <span style={{ fontSize: 14, fontWeight: 900, color: "#0284c7", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {category} › {topic} {subtopic && `› ${subtopic}`}
            </span>
          </div>
          <h2 style={{ fontFamily: "Bodoni Moda, Georgia, serif", fontSize: 44, fontWeight: 900, color: "#0f172a", margin: 0, lineHeight: 1.1 }}>
            {title}
          </h2>
          {subtitle && <p style={{ fontSize: 19, color: "#475569", marginTop: 4, marginBottom: 0, fontWeight: 600 }}>{subtitle}</p>}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
            EUNACOM 2026
          </span>
          <img
            src="/logo.png"
            alt="EUNACOM"
            style={{ height: 36, width: "auto", objectFit: "contain", borderRadius: 4 }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        </div>
      </div>

      {/* ── MAIN HORIZONTAL CONNECTED FLOW CANVAS (Fills whole middle screen) ── */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "stretch",
        justifyContent: "space-between",
        gap: 14,
        margin: "10px 0",
        width: "100%"
      }}>
        {steps.map((st, idx) => (
          <React.Fragment key={idx}>
            <div style={{
              flex: 1,
              background: st.bg || "#ffffff",
              border: `3.5px solid ${st.borderColor || "#0f172a"}`,
              borderRadius: 22,
              padding: "26px 24px",
              boxShadow: "7px 7px 0px #0f172a",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxSizing: "border-box"
            }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: st.badgeBg || "#0f172a",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: 18,
                    fontFamily: "monospace"
                  }}>
                    {idx + 1}
                  </span>
                  {st.tag && (
                    <span style={{
                      fontSize: 13,
                      fontWeight: 900,
                      color: st.tagColor || "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      background: "rgba(15, 23, 42, 0.06)",
                      padding: "4px 10px",
                      borderRadius: 6
                    }}>
                      {st.tag}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", lineHeight: 1.2, marginBottom: 10 }}>
                  {st.title}
                </div>

                <div style={{ fontSize: 17.5, color: "#334155", lineHeight: 1.45, fontWeight: 600 }}>
                  {st.desc}
                </div>
              </div>

              {st.footer && (
                <div style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: st.footerColor || "#0284c7",
                  borderTop: "2px solid #e2e8f0",
                  paddingTop: 10,
                  marginTop: 10
                }}>
                  ➔ {st.footer}
                </div>
              )}
            </div>

            {/* Huge Connecting Arrow between steps */}
            {idx < steps.length - 1 && (
              <div style={{
                fontSize: 40,
                fontWeight: 900,
                color: "#0f172a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                ➔
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ── CONCLUSION & PEARL FOOTERS ── */}
      {conclusion && (
        <div style={{
          background: "#f0fdf4",
          border: "3px solid #16a34a",
          borderRadius: 16,
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: pearl ? 6 : 0
        }}>
          <span style={{ fontSize: 26 }}>🎯</span>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#14532d" }}>
            {conclusion}
          </div>
        </div>
      )}

      {pearl && (
        <div style={{
          background: "#fefce8",
          border: "2.5px solid #eab308",
          borderRadius: 16,
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          gap: 14
        }}>
          <span style={{ fontSize: 26 }}>💡</span>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#854d0e", lineHeight: 1.4 }}>
            <strong style={{ color: "#713f12", textTransform: "uppercase" }}>Regla de Oro EUNACOM: </strong>
            {pearl}
          </div>
        </div>
      )}
    </div>
  );
}
