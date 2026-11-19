// Lector web · otros tipos de libro: Atlas (imagen primero), Repaso Final (tarjetas) y Perfil V3 (lista de códigos).
// LectorWeb importa este archivo solo; aquí se registran los tipos (lib/lector/content.js → registerKind).
// El contenido es el mismo JSON por link temporal que usan los Tomos (book_read&mode=movil → movil/<archivo>.json).
// Cada tipo trae una sola vista, que sirve en teléfono y en computador (columna centrada; el Atlas usa dos columnas).
import { fetchBookRead } from '../../../lib/api'
import { registerKind } from '../../../lib/lector/content'

// Igual que el cargador de los Tomos en content.js (ahí no está exportado).
async function loadMovil(user, item, fileIdx) {
  const { url } = await fetchBookRead(user.id, item, fileIdx, 'movil')
  const r = await fetch(url)
  if (!r.ok) throw Object.assign(new Error(String(r.status)), { status: r.status })
  return r.json()
}

registerKind({
  id: 'atlas',
  match: file => /^06_Atlas\/.+\.pdf$/.test(file),
  load: loadMovil,
  views: { mobile: () => import('./AtlasView.jsx') },
})
registerKind({
  id: 'repaso',
  match: file => /^05_Repaso_Final\/.+\.pdf$/.test(file),
  load: loadMovil,
  views: { mobile: () => import('./RepasoView.jsx') },
})
// Perfil V3: los 21 libros por especialidad, el Completo y «Preguntas de práctica» (variant: 'preguntas')
registerKind({
  id: 'perfil',
  match: file => /^04_Perfil_V3_Codigo_por_Codigo\/.+\.pdf$/.test(file),
  load: loadMovil,
  views: { mobile: () => import('./PerfilView.jsx') },
})
