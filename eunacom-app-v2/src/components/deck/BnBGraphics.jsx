import React from "react";

/**
 * Boards & Beyond Style Medical Vector Graphics & Diagrams
 */

// 1. Coronary Vessel Cross-Section with Atheroma Plaque
export function VesselPlaqueGraphic({ occlusion = "75%", label = "Estenosis Fija ~75%", status = "Angina de Esfuerzo" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <svg width="340" height="150" viewBox="0 0 340 150" fill="none">
        {/* Outer Arterial Wall */}
        <path d="M 20 25 Q 170 15 320 25 L 320 125 Q 170 135 20 125 Z" fill="#fee2e2" stroke="#e11d48" strokeWidth="4" />
        
        {/* Lumen Flow Background */}
        <path d="M 25 35 Q 170 28 315 35 L 315 115 Q 170 122 25 115 Z" fill="#fff1f2" />

        {/* Atherosclerotic Plaque */}
        <path d="M 90 120 Q 170 48 250 120 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="3" />
        
        {/* Lipid core texture */}
        <circle cx="170" cy="100" r="14" fill="#fde047" />
        <circle cx="150" cy="106" r="8" fill="#fef08a" />
        <circle cx="190" cy="106" r="8" fill="#fef08a" />

        {/* Red Blood Cells Flowing */}
        <circle cx="50" cy="55" r="7" fill="#dc2626" />
        <circle cx="70" cy="75" r="7" fill="#dc2626" />
        <circle cx="45" cy="95" r="7" fill="#dc2626" />

        {/* Constricted Flow Arrow */}
        <path d="M 120 48 L 220 48 M 210 40 L 225 48 L 210 56" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

        {/* Text Labels */}
        <text x="170" cy="138" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#854d0e">Placa Aterosclerótica</text>
      </svg>

      <div style={{
        background: "#0f2942",
        color: "#ffffff",
        padding: "6px 18px",
        borderRadius: 9999,
        fontSize: 14,
        fontWeight: 800,
        letterSpacing: "0.04em",
        textTransform: "uppercase"
      }}>
        {label} · {status}
      </div>
    </div>
  );
}

// 2. O2 Supply vs Demand Balance Seesaw
export function OxygenBalanceGraphic({ supplyText = "↑ Oferta O2", demandText = "↓ Demanda O2" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <svg width="340" height="170" viewBox="0 0 340 170" fill="none">
        {/* Fulcrum Triangle */}
        <polygon points="170,95 150,145 190,145" fill="#0284c7" />
        
        {/* Seesaw Bar */}
        <line x1="30" y1="125" x2="310" y2="65" stroke="#0f2942" strokeWidth="8" strokeLinecap="round" />

        {/* Left Side (Supply) */}
        <circle cx="50" cy="120" r="24" fill="#dcfce7" stroke="#16a34a" strokeWidth="3" />
        <text x="50" y="126" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#166534">O₂</text>

        {/* Right Side (Demand) */}
        <circle cx="290" cy="70" r="24" fill="#fee2e2" stroke="#dc2626" strokeWidth="3" />
        <text x="290" y="76" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#991b1b">O₂</text>

        {/* Base ground line */}
        <line x1="20" y1="150" x2="320" y2="150" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
      </svg>

      <div style={{ display: "flex", gap: 16 }}>
        <span style={{ background: "#dcfce7", color: "#166534", border: "1.5px solid #16a34a", padding: "4px 14px", borderRadius: 8, fontSize: 13, fontWeight: 800 }}>
          {supplyText}
        </span>
        <span style={{ background: "#fee2e2", color: "#991b1b", border: "1.5px solid #dc2626", padding: "4px 14px", borderRadius: 8, fontSize: 13, fontWeight: 800 }}>
          {demandText}
        </span>
      </div>
    </div>
  );
}

// 3. ECG ST-Depression Graphic (Infradesnivel Subendocárdico)
export function ECGDepressionGraphic() {
  return (
    <div style={{
      background: "#fff",
      border: "2px solid #0f2942",
      borderRadius: 16,
      padding: "16px 20px",
      boxShadow: "4px 4px 0px #0f2942",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8
    }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: "#dc2626", textTransform: "uppercase" }}>
        ECG: Infradesnivel del ST ≥ 1.0 mm (Isquemia)
      </div>
      <svg width="320" height="120" viewBox="0 0 320 120" fill="none">
        {/* ECG Grid lines */}
        <defs>
          <pattern id="ecgGrid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#fecdd3" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="320" height="120" fill="#fff5f5" />
        <rect width="320" height="120" fill="url(#ecgGrid)" />

        {/* Baseline dashed */}
        <line x1="0" y1="70" x2="320" y2="70" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1.5" />

        {/* ECG Wave with ST depression */}
        <path
          d="M 20 70 L 60 70 Q 75 60 90 70 L 100 70 L 108 85 L 120 15 L 132 95 L 140 85 L 180 85 Q 210 50 235 70 L 300 70"
          fill="none"
          stroke="#0f2942"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Measurement Marker ST depression */}
        <line x1="140" y1="70" x2="180" y2="70" stroke="#dc2626" strokeWidth="2" />
        <line x1="160" y1="70" x2="160" y2="85" stroke="#dc2626" strokeWidth="2" />
        <text x="190" y="92" fontSize="13" fontWeight="bold" fill="#dc2626">ST ↓ ≥ 1 mm</text>
        <text x="140" y="60" fontSize="11" fontWeight="bold" fill="#475569">Punto J</text>
      </svg>
      <div style={{ fontSize: 12.5, color: "#64748b", fontWeight: 600 }}>
        Morfología Horizontal / Descendente a 80 ms del Punto J
      </div>
    </div>
  );
}

// 4. ECG ST-Elevation Graphic (Prinzmetal / Vasoespasmo Transitorio)
export function ECGElevationGraphic() {
  return (
    <div style={{
      background: "#fff",
      border: "2px solid #0f2942",
      borderRadius: 16,
      padding: "16px 20px",
      boxShadow: "4px 4px 0px #0f2942",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8
    }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: "#dc2626", textTransform: "uppercase" }}>
        ECG: Supradesnivel ST Transitorio (Prinzmetal)
      </div>
      <svg width="320" height="120" viewBox="0 0 320 120" fill="none">
        <defs>
          <pattern id="ecgGrid2" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#fecdd3" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="320" height="120" fill="#fff5f5" />
        <rect width="320" height="120" fill="url(#ecgGrid2)" />

        {/* Baseline */}
        <line x1="0" y1="80" x2="320" y2="80" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1.5" />

        {/* ECG Wave with ST elevation */}
        <path
          d="M 20 80 L 60 80 Q 75 70 90 80 L 100 80 L 108 95 L 120 25 L 132 80 Q 155 45 185 45 Q 210 45 230 80 L 300 80"
          fill="none"
          stroke="#dc2626"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <text x="160" y="35" fontSize="13" fontWeight="bold" fill="#dc2626">ST ↑ Transitorio</text>
      </svg>
      <div style={{ fontSize: 12.5, color: "#166534", fontWeight: 700 }}>
        ✓ Cede 100% tras Nitroglicerina Sublingual
      </div>
    </div>
  );
}

// 5. Clean BnB Mini-Table
export function BnBMiniTable({ headers = [], rows = [] }) {
  return (
    <div style={{
      width: "100%",
      border: "2px solid #0f2942",
      borderRadius: 12,
      overflow: "hidden",
      boxShadow: "3px 3px 0px #0f2942"
    }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
        <thead>
          <tr style={{ background: "#0f2942", color: "#fff" }}>
            {headers.map((h, idx) => (
              <th key={idx} style={{ padding: "10px 14px", textAlign: "left", fontSize: 13, fontWeight: 800, textTransform: "uppercase" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={rIdx} style={{ background: rIdx % 2 === 0 ? "#ffffff" : "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              {row.map((cell, cIdx) => (
                <td key={cIdx} style={{ padding: "10px 14px", color: "#1e293b", fontWeight: cIdx === 0 ? 700 : 500 }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
