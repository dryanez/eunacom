// Contexto de la «Red de temas»: qué libro se está leyendo y cómo abrir otro desde la tarjeta de un término.
// Lo entrega LectorWeb a cada libro abierto (el de abajo y los que se abren encima desde una tarjeta).
//   here: { item, fileIdx }   openBook({ item, fileIdx, topicId, title })
import { createContext, useContext } from 'react'

export const LinksContext = createContext(null)
export const useLinks = () => useContext(LinksContext)
