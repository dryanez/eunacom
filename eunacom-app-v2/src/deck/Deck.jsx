import React, {
  Children,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo
} from "react";
import { DeckContext } from "./DeckContext";
import Annotator from "./Annotator";
import {
  IconLeft,
  IconRight,
  IconGrid,
  IconSidebar,
  IconPencil,
  IconExpand,
  IconShrink,
  IconPresent,
  IconClose
} from "./icons";

const fmt = (s) =>
  String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(Math.floor(s % 60)).padStart(2, "0");

export default function Deck({ children, title = "EUNACOM Masterclass", classId = "gastro-01" }) {
  const slides = useMemo(
    () => Children.toArray(children),
    [children]
  );
  const total = slides.length;

  const [slide, setSlide] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [curMax, setCurMax] = useState(0);
  const [railOpen, setRailOpen] = useState(false);
  const [gridOpen, setGridOpen] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [fs, setFs] = useState(false);
  const isExportMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('export') === 'true';
  const [uiHidden, setUiHidden] = useState(isExportMode);
  const [presenterOpen, setPresenterOpen] = useState(false);

  // Audio Sync State
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioTime, setAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioSpeed, setAudioSpeed] = useState(1);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(false);

  const audioRef = useRef(null);
  const maxMap = useRef({});
  const slideRef = useRef(slide);
  slideRef.current = slide;

  // Initialize audio element once
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setAudioTime(audio.currentTime);
      setAudioDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      setAudioPlaying(false);
      if (autoAdvance) {
        // Trigger next build click or advance slide
        next();
      }
    };

    const handleCanPlay = () => {
      setAudioAvailable(true);
      setAudioDuration(audio.duration || 0);
    };

    const handleError = () => {
      setAudioAvailable(false);
      setAudioPlaying(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
    };
  }, [autoAdvance]);

  // Load slide audio whenever slide or classId changes
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    const audioSrc = `/audio/${classId}/slide_${slide + 1}.mp3`;

    audio.src = audioSrc;
    audio.playbackRate = audioSpeed;
    audio.load();

    if (audioPlaying) {
      audio.play().catch(() => {
        setAudioPlaying(false);
      });
    }
  }, [slide, classId, audioSpeed]);

  const toggleAudioPlay = () => {
    if (!audioRef.current) return;
    if (audioPlaying) {
      audioRef.current.pause();
      setAudioPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setAudioPlaying(true);
      }).catch(() => {
        setAudioPlaying(false);
      });
    }
  };

  const changeSpeed = (rate) => {
    setAudioSpeed(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const registerMax = useCallback((at) => {
    maxMap.current[slideRef.current] = Math.max(maxMap.current[slideRef.current] || 0, at);
    setCurMax((c) => Math.max(c, at));
  }, []);

  const go = useCallback(
    (i) => {
      const n = Math.max(0, Math.min(total - 1, i));
      setSlide(n);
      setClicks(0);
      setCurMax(maxMap.current[n] || 0);
      setGridOpen(false);
      setRailOpen(false);
    },
    [total]
  );

  const next = useCallback(() => {
    if (clicks < curMax) {
      setClicks(clicks + 1);
      return;
    }
    if (slide < total - 1) {
      const n = slide + 1;
      setSlide(n);
      setClicks(0);
      setCurMax(maxMap.current[n] || 0);
    }
  }, [clicks, curMax, slide, total]);

  const prev = useCallback(() => {
    if (clicks > 0) {
      setClicks(clicks - 1);
      return;
    }
    if (slide > 0) {
      const n = slide - 1;
      setSlide(n);
      setClicks(maxMap.current[n] || 0);
      setCurMax(maxMap.current[n] || 0);
    }
  }, [clicks, slide]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setFs(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setFs(false);
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        next();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        prev();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      } else if (e.key === "a" || e.key === "A") {
        setDrawing((d) => !d);
      } else if (e.key === "g" || e.key === "G") {
        setGridOpen((g) => !g);
      } else if (e.key === "s" || e.key === "S") {
        setRailOpen((r) => !r);
      } else if (e.key === "p" || e.key === "P") {
        setPresenterOpen((p) => !p);
      } else if (e.key === "h" || e.key === "H") {
        setUiHidden((u) => !u);
      } else if (e.key === " ") {
        e.preventDefault();
        toggleAudioPlay();
      } else if (e.key === "Escape") {
        setGridOpen(false);
        setRailOpen(false);
        setPresenterOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev, toggleFullscreen]);

  // Elapsed timer
  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const currentNotes = slides[slide]?.props?.notes || "";

  return (
    <DeckContext.Provider value={{ clicks, curMax, registerMax }}>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "#FAF9F5",
          color: "#18181B",
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          overflow: "hidden",
          position: "relative",
          userSelect: drawing ? "none" : "auto"
        }}
      >
        {/* Drawing Annotator Canvas */}
        <Annotator active={drawing} />

        {/* Current Active Slide */}
        <div style={{ width: "100%", height: "100%" }}>
          {slides[slide]}
        </div>

        {/* ── SYNCED AUDIO PLAYER DOCK (ElevenLabs Narration) ── */}
        {!uiHidden && (
          <div
            style={{
              position: "fixed",
              top: 16,
              right: 20,
              background: "rgba(24, 24, 27, 0.88)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: 14,
              padding: "8px 16px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              zIndex: 700,
              color: "#fff",
              fontSize: 12
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: audioPlaying ? "#10b981" : audioAvailable ? "#38bdf8" : "#64748b",
                  boxShadow: audioPlaying ? "0 0 10px #10b981" : "none"
                }}
              />
              <span style={{ fontWeight: 700, letterSpacing: "0.02em", color: "#f8fafc" }}>
                {audioAvailable ? "🎙️ Audio Sincronizado" : "🎙️ Modo Guión"}
              </span>
            </div>

            <button
              onClick={toggleAudioPlay}
              style={{
                background: audioPlaying ? "#e11d48" : "#0284c7",
                border: "none",
                color: "#fff",
                padding: "6px 14px",
                borderRadius: 8,
                fontWeight: 800,
                fontSize: 12,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              {audioPlaying ? "⏸ Pausar" : "▶ Reproducir"}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8", fontFamily: "monospace" }}>
              <span>{fmt(audioTime)}</span>
              <span>/</span>
              <span>{fmt(audioDuration || 60)}</span>
            </div>

            {/* Speed Selector */}
            <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.06)", padding: 2, borderRadius: 6 }}>
              {[1, 1.25, 1.5, 2].map((rate) => (
                <button
                  key={rate}
                  onClick={() => changeSpeed(rate)}
                  style={{
                    background: audioSpeed === rate ? "rgba(255,255,255,0.2)" : "transparent",
                    border: "none",
                    color: audioSpeed === rate ? "#fff" : "#94a3b8",
                    padding: "2px 6px",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Auto-Advance Toggle */}
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", color: "#cbd5e1" }}>
              <input
                type="checkbox"
                checked={autoAdvance}
                onChange={(e) => setAutoAdvance(e.target.checked)}
                style={{ cursor: "pointer", accentColor: "#0284c7" }}
              />
              <span>Auto-Slide</span>
            </label>
          </div>
        )}

        {/* ── BOTTOM FLOATING GLASS CONTROL DOCK ── */}
        {!uiHidden && (
          <div
            style={{
              position: "fixed",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(24, 24, 27, 0.88)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: 9999,
              padding: "6px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
              zIndex: 700,
              color: "#fff"
            }}
          >
            {/* Slide Index Badge */}
            <button
              onClick={() => setRailOpen((r) => !r)}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "none",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: 9999,
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
              title="Abrir índice (S)"
            >
              <IconSidebar size={14} />
              <span>
                {slide + 1} / {total}
              </span>
            </button>

            <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.2)" }} />

            {/* Navigation Arrows */}
            <button
              onClick={prev}
              disabled={slide === 0 && clicks === 0}
              style={{
                background: "none",
                border: "none",
                color: slide === 0 && clicks === 0 ? "rgba(255,255,255,0.25)" : "#fff",
                cursor: slide === 0 && clicks === 0 ? "default" : "pointer",
                padding: 6,
                display: "flex",
                alignItems: "center"
              }}
              title="Anterior (←)"
            >
              <IconLeft size={18} />
            </button>

            <button
              onClick={next}
              disabled={slide === total - 1 && clicks === curMax}
              style={{
                background: "none",
                border: "none",
                color: slide === total - 1 && clicks === curMax ? "rgba(255,255,255,0.25)" : "#fff",
                cursor: slide === total - 1 && clicks === curMax ? "default" : "pointer",
                padding: 6,
                display: "flex",
                alignItems: "center"
              }}
              title="Siguiente (→)"
            >
              <IconRight size={18} />
            </button>

            <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.2)" }} />

            {/* Live Drawing Pen */}
            <button
              onClick={() => setDrawing((d) => !d)}
              style={{
                background: drawing ? "#e11d48" : "none",
                border: "none",
                color: "#fff",
                padding: 6,
                borderRadius: 8,
                cursor: "pointer",
                display: "flex",
                alignItems: "center"
              }}
              title="Lápiz / Marcador en vivo (A)"
            >
              <IconPencil size={16} />
            </button>

            {/* Presenter Teleprompter */}
            <button
              onClick={() => setPresenterOpen((p) => !p)}
              style={{
                background: presenterOpen ? "#0284c7" : "none",
                border: "none",
                color: "#fff",
                padding: 6,
                borderRadius: 8,
                cursor: "pointer",
                display: "flex",
                alignItems: "center"
              }}
              title="Teleprompter & Notas (P)"
            >
              <IconPresent size={16} />
            </button>

            {/* Grid Overview */}
            <button
              onClick={() => setGridOpen((g) => !g)}
              style={{
                background: gridOpen ? "#0284c7" : "none",
                border: "none",
                color: "#fff",
                padding: 6,
                borderRadius: 8,
                cursor: "pointer",
                display: "flex",
                alignItems: "center"
              }}
              title="Vista en Cuadrícula (G)"
            >
              <IconGrid size={16} />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                padding: 6,
                cursor: "pointer",
                display: "flex",
                alignItems: "center"
              }}
              title="Pantalla Completa (F)"
            >
              {fs ? <IconShrink size={16} /> : <IconExpand size={16} />}
            </button>
          </div>
        )}

        {/* Thumbnail Sidebar Rail */}
        {railOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              width: 280,
              background: "rgba(20, 20, 20, 0.95)",
              backdropFilter: "blur(20px)",
              borderRight: "1px solid rgba(255,255,255,0.15)",
              padding: "20px 16px",
              zIndex: 850,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              overflowY: "auto"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Índice de Slides
              </span>
              <button
                onClick={() => setRailOpen(false)}
                style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}
              >
                <IconClose size={16} />
              </button>
            </div>

            {slides.map((s, idx) => (
              <div
                key={idx}
                onClick={() => go(idx)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  cursor: "pointer",
                  background: slide === idx ? "rgba(56, 189, 248, 0.15)" : "rgba(255,255,255,0.04)",
                  border: slide === idx ? "1px solid #38bdf8" : "1px solid rgba(255,255,255,0.06)",
                  color: slide === idx ? "#fff" : "#94a3b8",
                  fontSize: 13,
                  fontWeight: 600
                }}
              >
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>Slide {idx + 1}</div>
                <div>{s.props?.nav || s.props?.title || ("Slide " + (idx + 1))}</div>
              </div>
            ))}
          </div>
        )}

        {/* Grid Overview Modal */}
        {gridOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(10, 10, 10, 0.95)",
              backdropFilter: "blur(24px)",
              zIndex: 950,
              padding: 40,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: 0 }}>
                Vista General de la Clase ({total} Slides)
              </h2>
              <button
                onClick={() => setGridOpen(false)}
                style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 9999, cursor: "pointer", fontWeight: 700 }}
              >
                Cerrar (Esc)
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {slides.map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => go(idx)}
                  style={{
                    aspectRatio: "16/9",
                    background: "#FAF9F5",
                    border: slide === idx ? "3px solid #38bdf8" : "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 12,
                    padding: 16,
                    cursor: "pointer",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transform: slide === idx ? "scale(1.02)" : "none",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                    position: "relative"
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#b91c1c" }}>
                    {idx + 1}. {s.props?.nav || ("Slide " + (idx + 1))}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>
                    {s.props?.notes ? s.props.notes.substring(0, 80) + "..." : "Slide de contenido clínico"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Synced Presenter Overlay Mode */}
        {presenterOpen && (
          <div
            style={{
              position: "fixed",
              bottom: 80,
              right: 32,
              width: 420,
              maxHeight: 400,
              background: "#1a1a1a",
              border: "2px solid rgba(255,255,255,0.2)",
              borderRadius: 16,
              boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
              padding: 20,
              zIndex: 850,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              color: "#fff"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#38bdf8", textTransform: "uppercase" }}>
                  Teleprompter & Notas de Grabación
                </span>
              </div>
              <button
                onClick={() => setPresenterOpen(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", fontSize: 14, lineHeight: 1.5, color: "#e2e8f0" }}>
              {currentNotes ? (
                currentNotes
              ) : (
                <span style={{ color: "#64748b" }}>No hay notas específicas para esta slide. Habla con naturalidad y guía al estudiante por la tabla.</span>
              )}
            </div>

            {slide < total - 1 && (
              <div style={{ background: "rgba(255,255,255,0.05)", padding: "8px 12px", borderRadius: 8, fontSize: 12, color: "#94a3b8" }}>
                <strong style={{ color: "#38bdf8" }}>Siguiente Slide:</strong> {slides[slide + 1]?.props?.nav || ("Slide " + (slide + 2))}
              </div>
            )}
          </div>
        )}
      </div>
    </DeckContext.Provider>
  );
}
