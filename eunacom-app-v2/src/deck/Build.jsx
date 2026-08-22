import React, { useEffect } from 'react';
import { useDeck } from './DeckContext';

export function Build({ at = 1, children }) {
  const { clicks, isStatic, registerMax } = useDeck();

  useEffect(() => {
    if (!isStatic && registerMax) {
      registerMax(at);
    }
  }, [at, isStatic, registerMax]);

  const visible = isStatic || clicks >= at;

  return (
    <div style={{
      opacity: visible ? 1 : 0.15,
      transform: visible ? 'translateY(0)' : 'translateY(8px)',
      transition: 'opacity 0.25s ease-out, transform 0.25s ease-out',
      filter: visible ? 'none' : 'blur(2px)',
      pointerEvents: visible ? 'auto' : 'none'
    }}>
      {children}
    </div>
  );
}
