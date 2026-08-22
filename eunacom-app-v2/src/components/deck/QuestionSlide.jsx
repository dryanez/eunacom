import React, { useState } from "react";

export function QuestionSlide({ number, caseText, question, options = [], explanation }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (idx) => {
    setSelected(idx);
    setRevealed(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          background: "#fef08a",
          color: "#854d0e",
          border: "2px solid #0f172a",
          borderRadius: 9999,
          padding: "4px 16px",
          fontSize: 13,
          fontWeight: 800,
          textTransform: "uppercase",
          boxShadow: "2px 2px 0px #0f172a"
        }}>
          Caso Clínico {number} · Banco EUNACOM
        </span>
        <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "#64748b" }}>
          Haz clic en una opción para responder
        </span>
      </div>

      {/* Case Box */}
      <div style={{
        background: "#ffffff",
        border: "2.5px solid #0f172a",
        borderRadius: 20,
        padding: 22,
        boxShadow: "4px 4px 0px #0f172a",
        fontSize: 17,
        lineHeight: 1.5,
        color: "#0f172a"
      }}>
        {caseText}
        <div style={{ fontWeight: 800, marginTop: 12, color: "#1e3a8a", fontSize: 17.5 }}>
          {question}
        </div>
      </div>

      {/* Options List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {options.map((opt, idx) => {
          const isSelected = selected === idx;
          const isCorrect = opt.isCorrect;
          let bg = "#ffffff";
          let border = "#0f172a";
          let color = "#0f172a";

          if (revealed) {
            if (isCorrect) {
              bg = "#bbf7d0";
              border = "#16a34a";
              color = "#14532d";
            } else if (isSelected && !isCorrect) {
              bg = "#fecdd3";
              border = "#e11d48";
              color = "#881337";
            } else {
              bg = "#f8fafc";
              color = "#94a3b8";
            }
          }

          return (
            <div
              key={idx}
              onClick={() => handleSelect(idx)}
              style={{
                background: bg,
                border: "2px solid " + border,
                borderRadius: 9999,
                padding: "10px 20px",
                fontSize: 15.5,
                fontWeight: isCorrect && revealed ? 700 : 500,
                color: color,
                display: "flex",
                alignItems: "center",
                gap: 14,
                cursor: "pointer",
                boxShadow: isSelected ? "none" : "2px 2px 0px #0f172a",
                transform: isSelected ? "translate(2px, 2px)" : "none",
                transition: "all 0.15s ease"
              }}
            >
              <div style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: isCorrect && revealed ? "#16a34a" : "#0f172a",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 13,
                flexShrink: 0
              }}>
                {String.fromCharCode(65 + idx)}
              </div>
              <span style={{ textDecoration: revealed && !isCorrect ? "line-through" : "none" }}>
                {opt.text}
              </span>
            </div>
          );
        })}
      </div>

      {/* Explanation Box */}
      {revealed && (
        <div style={{
          background: "#ecfdf5",
          border: "2px solid #059669",
          borderRadius: 16,
          padding: "10px 18px",
          fontSize: 14.5,
          color: "#065f46",
          fontWeight: 600,
          boxShadow: "3px 3px 0px #059669"
        }}>
          💡 <strong>Justificación & Descarte:</strong> {explanation}
        </div>
      )}
    </div>
  );
}
