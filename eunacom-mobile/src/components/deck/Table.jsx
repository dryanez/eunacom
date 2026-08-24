import React from "react";

export function Table({ classNumber = "CLASE 01", title, subtitle, headers = [], rows = [], highlightCol, pearl }) {
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
        marginBottom: 12
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ background: "#0f172a", color: "#fff", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 800 }}>
              {classNumber}
            </span>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#e11d48", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              TABLA CLÍNICA & MATRIZ LEGAL
            </span>
          </div>
          <h2 style={{ fontFamily: "Bodoni Moda, Georgia, serif", fontSize: 40, fontWeight: 900, color: "#0f172a", margin: 0, lineHeight: 1.15 }}>
            {title}
          </h2>
          {subtitle && <p style={{ fontSize: 18, color: "#475569", marginTop: 4, marginBottom: 0, fontWeight: 500 }}>{subtitle}</p>}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
            Perfil V3 Oficial
          </span>
          <img
            src="/logo.png"
            alt="EUNACOM"
            style={{ height: 32, width: "auto", objectFit: "contain", borderRadius: 4 }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        </div>
      </div>

      {/* Main Full-Width Table */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        margin: "8px 0"
      }}>
        <div style={{
          border: "3px solid #0f172a",
          borderRadius: 20,
          overflow: "hidden",
          background: "#fff",
          boxShadow: "6px 6px 0px #0f172a"
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 17 }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2.5px solid #0f172a" }}>
                {headers.map((h, i) => (
                  <th key={i} style={{
                    padding: "14px 20px",
                    textAlign: "left",
                    fontSize: 13,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "#0f172a",
                    borderRight: i < headers.length - 1 ? "2px solid #0f172a" : "none"
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => (
                <tr key={rIdx} style={{
                  background: row.highlight ? "#f0fdf4" : (rIdx % 2 === 0 ? "#ffffff" : "#fbfbfa"),
                  borderBottom: rIdx < rows.length - 1 ? "1.5px solid #e2e8f0" : "none"
                }}>
                  {row.cells.map((cell, cIdx) => {
                    const isArray = Array.isArray(cell);
                    return (
                      <td key={cIdx} style={{
                        padding: "14px 20px",
                        color: "#1e293b",
                        lineHeight: 1.45,
                        fontSize: 17,
                        borderRight: cIdx < row.cells.length - 1 ? "1.5px solid #e2e8f0" : "none",
                        fontWeight: cIdx === 0 && !isArray ? 800 : (cIdx === highlightCol ? 800 : 500),
                        background: cIdx === highlightCol ? "rgba(59, 130, 246, 0.06)" : "transparent",
                        verticalAlign: "middle"
                      }}>
                        {isArray ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {cell.map((item, itIdx) => (
                              <div key={itIdx} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 16 }}>
                                <span style={{ color: "#3b82f6", fontWeight: 800 }}>•</span>
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        ) : cell}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Golden Pearl Footer */}
      {pearl && (
        <div style={{
          background: "#fefce8",
          border: "2px solid #eab308",
          borderRadius: 14,
          padding: "14px 22px",
          display: "flex",
          alignItems: "center",
          gap: 12
        }}>
          <span style={{ fontSize: 24 }}>💡</span>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#854d0e", lineHeight: 1.4 }}>
            <strong style={{ color: "#713f12", textTransform: "uppercase", letterSpacing: "0.03em" }}>
              Regla de Oro EUNACOM:{" "}
            </strong>
            {pearl}
          </div>
        </div>
      )}
    </div>
  );
}
