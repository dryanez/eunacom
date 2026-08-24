import React, { useState } from "react";

export function QuestionSlide({
  classNumber = "CLASE 01",
  questionNumber = 1,
  number,
  specialty = "Cardiología",
  code = "1.01.1.001",
  caseText,
  question,
  options = [],
  correctOptionId,
  explanation
}) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const activeNum = questionNumber || number || 1;

  const handleSelect = (idx) => {
    setSelected(idx);
    setRevealed(true);
  };

  const activeExplanation =
    explanation ||
    options.find((o, idx) => (o.isCorrect || o.id === correctOptionId || idx === selected))?.explanation ||
    "Revisa los conceptos fisiopatológicos y criterios clínicos de la clase para descartar distractores.";

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      width: "100%",
      justifyContent: "space-between",
      boxSizing: "border-box"
    }}>
      {/* Top Header Row with Class Number & Logo */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "2px solid #e2e8f0",
        paddingBottom: 12,
        marginBottom: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ background: "#0f172a", color: "#fff", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 800 }}>
            {classNumber}
          </span>
          <span style={{
            background: "#fef08a",
            color: "#854d0e",
            border: "1.5px solid #0f172a",
            borderRadius: 9999,
            padding: "4px 14px",
            fontSize: 12,
            fontWeight: 800,
            textTransform: "uppercase"
          }}>
            Caso Clínico #{activeNum} · {specialty} (Cód. {code})
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
            Haz clic para responder
          </span>
          <img
            src="/logo.png"
            alt="EUNACOM"
            style={{ height: 30, width: "auto", objectFit: "contain", borderRadius: 4 }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        </div>
      </div>

      {/* Clinical Vignette Box */}
      <div style={{
        background: "#ffffff",
        border: "2.5px solid #0f172a",
        borderRadius: 18,
        padding: "20px 24px",
        boxShadow: "5px 5px 0px #0f172a",
        fontSize: 18,
        lineHeight: 1.45,
        color: "#0f172a"
      }}>
        {caseText && <div style={{ marginBottom: 8 }}>{caseText}</div>}
        <div style={{ fontWeight: 800, color: "#1e3a8a", fontSize: 18.5, lineHeight: 1.4 }}>
          {question}
        </div>
      </div>

      {/* Options List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "6px 0" }}>
        {options.map((opt, idx) => {
          const isSelected = selected === idx;
          const isCorrect = opt.isCorrect || (correctOptionId && opt.id === correctOptionId);
          let bg = "#ffffff";
          let border = "#0f172a";
          let color = "#0f172a";

          if (revealed) {
            if (isCorrect) {
              bg = "#dcfce7";
              border = "#16a34a";
              color = "#14532d";
            } else if (isSelected && !isCorrect) {
              bg = "#fee2e2";
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
                borderRadius: 14,
                padding: "10px 18px",
                fontSize: 16.5,
                fontWeight: isCorrect && revealed ? 800 : (isSelected ? 700 : 500),
                color: color,
                display: "flex",
                alignItems: "center",
                gap: 14,
                cursor: "pointer",
                boxShadow: isSelected ? "none" : "3px 3px 0px #0f172a",
                transform: isSelected ? "translate(2px, 2px)" : "none",
                transition: "all 0.15s ease"
              }}
            >
              <div style={{
                minWidth: 30,
                height: 30,
                borderRadius: "50%",
                background: isCorrect && revealed ? "#16a34a" : (isSelected ? "#e11d48" : "#0f172a"),
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 14,
                flexShrink: 0
              }}>
                {opt.id || String.fromCharCode(65 + idx)}
              </div>
              <span style={{ textDecoration: revealed && !isCorrect ? "line-through" : "none", lineHeight: 1.35 }}>
                {opt.text}
              </span>
            </div>
          );
        })}
      </div>

      {/* Explanation Box (Appears on click) */}
      {revealed && (
        <div style={{
          background: "#ecfdf5",
          border: "2px solid #059669",
          borderRadius: 14,
          padding: "12px 20px",
          fontSize: 15.5,
          color: "#065f46",
          fontWeight: 700,
          boxShadow: "3px 3px 0px #059669",
          marginTop: 4
        }}>
          💡 <strong>Justificación Clínica EUNACOM:</strong> {activeExplanation}
        </div>
      )}
    </div>
  );
}
