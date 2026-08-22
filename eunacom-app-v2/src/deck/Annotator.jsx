import React, { useRef, useEffect, useState } from 'react';

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#18181b', '#ffffff'];

export default function Annotator({ active, onClose }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ef4444');
  const [lineWidth, setLineWidth] = useState(4);
  const [isHighlighter, setIsHighlighter] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const startDrawing = (e) => {
    if (!active) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.clientX, e.clientY);
  };

  const draw = (e) => {
    if (!isDrawing || !active) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = color;
    ctx.lineWidth = isHighlighter ? 18 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = isHighlighter ? 0.35 : 1.0;
    ctx.lineTo(e.clientX, e.clientY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  if (!active) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 900, pointerEvents: active ? 'auto' : 'none' }}>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        style={{ width: '100vw', height: '100vh', cursor: 'crosshair', display: 'block' }}
      />

      {/* Floating Pen Toolbar */}
      <div style={{
        position: 'fixed',
        top: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#1e1e1e',
        color: '#fff',
        padding: '8px 16px',
        borderRadius: 9999,
        border: '2px solid rgba(255,255,255,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        zIndex: 1000
      }}>
        <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>
          Lápiz EUNACOM
        </span>

        {/* Color pickers */}
        <div style={{ display: 'flex', gap: 6 }}>
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: c,
                border: color === c ? '2.5px solid #fff' : '1px solid rgba(0,0,0,0.4)',
                cursor: 'pointer',
                transform: color === c ? 'scale(1.2)' : 'none',
                transition: 'all 0.15s'
              }}
            />
          ))}
        </div>

        {/* Highlighter toggle */}
        <button
          onClick={() => setIsHighlighter(!isHighlighter)}
          style={{
            background: isHighlighter ? '#f59e0b' : 'rgba(255,255,255,0.1)',
            color: isHighlighter ? '#000' : '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '4px 10px',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {isHighlighter ? 'Resaltador ON' : 'Resaltador'}
        </button>

        {/* Clear button */}
        <button
          onClick={clearCanvas}
          style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
        >
          Borrar Todo
        </button>

        <button
          onClick={onClose}
          style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
