import React from "react";

/**
 * Boards & Beyond (BnB) Style Slide Component
 * Ultra-clean, uncluttered, high-yield 2-column layout:
 * - Left side: 3-5 concise bullet points with bold red/blue keywords
 * - Right side: Clean medical illustration, ECG strip, anatomy graphic, or table
 * - Zero visual clutter, generous whitespace, crystal-clear readability
 */
export function BnBSlide({
  classNumber = "CLASE 01",
  specialty = "Cardiología",
  title,
  subtitle,
  bullets = [],
  rightContent,
  rightWidth = "45%",
  bottomCallout,
  footerNote
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
      background: "#ffffff",
      padding: "28px 48px"
    }}>
      {/* ── TOP HEADER (Boards & Beyond Style) ── */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        borderBottom: "2.5px solid #0f2942",
        paddingBottom: 10,
        marginBottom: 16
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#0284c7", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
            {classNumber} · {specialty}
          </div>
          <h1 style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 42,
            fontWeight: 700,
            color: "#0f2942",
            margin: 0,
            lineHeight: 1.15
          }}>
            {title}
          </h1>
          {subtitle && (
            <div style={{ fontSize: 18, color: "#64748b", marginTop: 4, fontWeight: 500 }}>
              {subtitle}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#0f2942", letterSpacing: "0.04em" }}>
            EUNACOM 2026
          </span>
          <img
            src="/logo.png"
            alt="EUNACOM"
            style={{ height: 32, width: "auto", objectFit: "contain" }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        </div>
      </div>

      {/* ── MAIN CONTENT (2-COLUMN SPLIT) ── */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 36,
        width: "100%",
        boxSizing: "border-box"
      }}>
        {/* LEFT COLUMN: Clean, High-Yield Bullet Points */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          justifyContent: "center"
        }}>
          {bullets.map((b, idx) => {
            const isMain = typeof b === "string" || !b.sub;
            const text = typeof b === "string" ? b : b.text;
            const subItems = b.sub || [];

            return (
              <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  fontSize: 22,
                  lineHeight: 1.4,
                  color: "#1e293b",
                  fontWeight: 500
                }}>
                  <span style={{ color: "#0284c7", fontSize: 24, lineHeight: 1, marginTop: 2 }}>•</span>
                  <div>{text}</div>
                </div>

                {subItems.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginLeft: 28 }}>
                    {subItems.map((sub, sIdx) => (
                      <div key={sIdx} style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        fontSize: 18.5,
                        lineHeight: 1.35,
                        color: "#475569",
                        fontWeight: 400
                      }}>
                        <span style={{ color: "#94a3b8", fontSize: 18 }}>–</span>
                        <div>{sub}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: Visual Illustration / ECG / Chart / Table */}
        {rightContent && (
          <div style={{
            width: rightWidth,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxSizing: "border-box"
          }}>
            {rightContent}
          </div>
        )}
      </div>

      {/* ── BOTTOM CALLOUT / FOOTER NOTE ── */}
      {bottomCallout && (
        <div style={{
          marginTop: 10,
          background: "#f8fafc",
          borderLeft: "4px solid #0284c7",
          padding: "10px 18px",
          borderRadius: "0 8px 8px 0",
          fontSize: 16,
          fontWeight: 600,
          color: "#0f2942"
        }}>
          {bottomCallout}
        </div>
      )}

      {footerNote && (
        <div style={{
          marginTop: 8,
          fontSize: 13,
          color: "#94a3b8",
          textAlign: "right",
          fontStyle: "italic"
        }}>
          {footerNote}
        </div>
      )}
    </div>
  );
}
