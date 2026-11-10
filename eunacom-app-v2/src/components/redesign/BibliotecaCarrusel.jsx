import React from 'react'
import { ChevronRight } from 'lucide-react'
import { ALL_COVERS } from '../../config/covers'

// Tarjeta «Biblioteca» del Inicio: portadas grandes que pasan solas (todas, ~100 libros).
// La pista va duplicada para que el loop no tenga salto; se pausa al tocar o pasar el mouse.
export default function BibliotecaCarrusel({ onOpen }) {
  const seconds = ALL_COVERS.length * 2.2
  return (
    <button className="mn-card mn-bib" onClick={onOpen} aria-label={`Biblioteca: ${ALL_COVERS.length} libros`}>
      <div className="mn-row mn-between mn-bib-head">
        <span className="mn-bib-title">Biblioteca <small>{ALL_COVERS.length} libros</small></span>
        <span className="mn-bib-go">Ver todo <ChevronRight size={15} /></span>
      </div>
      <div className="mn-bib-view">
        <div className="mn-bib-track" style={{ animationDuration: `${seconds}s` }}>
          {[...ALL_COVERS, ...ALL_COVERS].map((src, i) => (
            <img key={i} src={src} alt="" loading={i < 8 ? 'eager' : 'lazy'} width="150" height="212" draggable="false" />
          ))}
        </div>
      </div>
    </button>
  )
}
