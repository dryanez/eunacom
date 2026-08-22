import React from "react";

export function Table({ title, subtitle, headers = [], rows = [], highlightCol, pearl }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
      <div>
        <h2 style={{ fontFamily: "Bodoni Moda, Georgia, serif", fontSize: 38, fontWeight: 900, color: "#0f172a", margin: 0 }}>
          {title}
        </h2>
        {subtitle && <p style={{ fontSize: 17, color: "#64748b", marginTop: 4 }}>{subtitle}</p>}
      </div>

      <div style={{
        border: "2.5px solid #0f172a",
        borderRadius: 18,
        overflow: "hidden",
        background: "#fff",
        boxShadow: "4px 4px 0px #0f172a"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "2px solid #0f172a" }}>
              {headers.map((h, i) => (
                <th key={i} style={{
                  padding: "12px 18px",
                  textAlign: "left",
                  fontSize: 12,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#0f172a",
                  borderRight: i < headers.length - 1 ? "1.5px solid #0f172a" : "none"
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
                      padding: "12px 18px",
                      color: "#1e293b",
                      lineHeight: 1.45,
                      borderRight: cIdx < row.cells.length - 1 ? "1.5px solid #e2e8f0" : "none",
                      fontWeight: cIdx === 0 && !isArray ? 700 : (cIdx === highlightCol ? 700 : 400),
                      background: cIdx === highlightCol ? "rgba(59, 130, 246, 0.05)" : "transparent",
                      verticalAlign: "middle"
                    }}>
                      {isArray ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {cell.map((item, itIdx) => (
                            <div key={itIdx} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 14.5 }}>
                              <span style={{ color: "#e11d48", fontWeight: 800, fontSize: 12, marginTop: 2 }}>●</span>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        cell
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pearl && (
        <div style={{ background: "#f0fdf4", border: "2px solid #0f172a", borderRadius: 16, padding: "12px 20px", fontSize: 15, fontWeight: 600, color: "#166534", boxShadow: "3px 3px 0px #0f172a" }}>
          💡 {pearl}
        </div>
      )}
    </div>
  );
}
