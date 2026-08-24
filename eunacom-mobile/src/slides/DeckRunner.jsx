import React from "react";
import { useParams, Link } from "react-router-dom";
import Deck from "../deck/Deck";
import { Slide } from "../deck/Slide";
import { Cover } from "../components/deck/Cover";
import { Steps } from "../components/deck/Steps";
import { Table } from "../components/deck/Table";
import { Contrast } from "../components/deck/Contrast";
import { Bento } from "../components/deck/Bento";
import { QuestionSlide } from "../components/deck/QuestionSlide";
import Cardio01Deck from "./Cardio01Deck";
import Gastro01Deck from "./Gastro01Deck";
import decksData from "../data/studio/cardio_decks_data.json";

export default function DeckRunner() {
  const { classId = "cardio-01" } = useParams();

  if (classId === "gastro-01") {
    return <Gastro01Deck />;
  }

  if (classId === "cardio-01" || classId === "cardio-10") {
    return <Cardio01Deck />;
  }

  const deckInfo = decksData[classId];

  if (!deckInfo) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#141414",
        color: "#fff",
        gap: 16
      }}>
        <h2 style={{ fontSize: 28, fontWeight: 800 }}>Clase no encontrada ({classId})</h2>
        <p style={{ color: "#94a3b8" }}>Selecciona una clase valida del catalogo oficial de Cardiologia.</p>
        <Link
          to="/studio"
          style={{
            background: "#e11d48",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: 9999,
            textDecoration: "none",
            fontWeight: 700,
            fontSize: 14
          }}
        >
          Volver a Studio Hub
        </Link>
      </div>
    );
  }

  return (
    <Deck title={deckInfo.title}>
      {deckInfo.slides.map((s, idx) => {
        return (
          <Slide key={idx} nav={s.nav} notes={s.notes}>
            {s.type === "cover" && (
              <Cover
                kicker={s.kicker}
                badges={s.badges}
                title={s.title}
                subtitle={s.subtitle}
              />
            )}

            {s.type === "table" && (
              <Table
                title={s.title}
                subtitle={s.subtitle}
                headers={s.headers}
                rows={s.rows}
                highlightCol={s.highlightCol}
                pearl={s.pearl}
              />
            )}

            {s.type === "bento" && (
              <Bento
                title={s.title}
                subtitle={s.subtitle}
                tiles={s.tiles}
              />
            )}

            {s.type === "steps" && (
              <Steps
                title={s.title}
                subtitle={s.subtitle}
                items={s.items}
              />
            )}

            {s.type === "contrast" && (
              <Contrast
                title={s.title}
                leftTitle={s.leftTitle}
                leftItems={s.leftItems}
                rightTitle={s.rightTitle}
                rightItems={s.rightItems}
              />
            )}

            {s.type === "question" && (
              <QuestionSlide
                number={s.number}
                caseText={s.caseText}
                question={s.question}
                options={s.options}
                explanation={s.explanation}
              />
            )}
          </Slide>
        );
      })}
    </Deck>
  );
}
