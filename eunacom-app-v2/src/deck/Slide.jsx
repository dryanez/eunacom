import React from 'react';

export function Slide({ center = false, full = false, nav, notes, children }) {
  return (
    <div
      className="bolt-slide"
      style={{
        width: '100%',
        height: '100%',
        padding: full ? 0 : '45px 65px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: center ? 'center' : 'space-between',
        alignItems: center ? 'center' : 'stretch',
        textAlign: center ? 'center' : 'left',
        background: '#FAF9F5',
        color: '#141414',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      {children}
    </div>
  );
}
