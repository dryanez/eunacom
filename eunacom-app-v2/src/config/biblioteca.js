// Qué trae la Biblioteca EUNACOM (se muestra en el checkout web, /oferta y el paywall de Android)
import { TOMOS, EXTRAS } from './tienda';

export const LIB_COVERS = [TOMOS[0].cover, TOMOS[17].cover, EXTRAS[3].cover, EXTRAS[0].cover, EXTRAS[1].cover, EXTRAS[2].cover, EXTRAS[4].cover];
export const LIB_ITEMS = [
  { n: '21', t: 'Tomos AEE', d: 'Toda la teoría del Perfil V3, especialidad por especialidad, con algoritmos y tablas.' },
  { n: '2013–26', t: 'EUNACOM reconstruidos', d: 'Gran Libro de Reconstrucciones 2013–2026: los exámenes reales, pregunta por pregunta, con explicación.' },
  { n: '23', t: 'Libros Gordos', d: 'El Gran Libro Gordo + 22 libros de 90 preguntas por tema.' },
  { n: '21', t: 'Repaso Final', d: 'Un libro de repaso por especialidad: lo que más se pregunta, para la última semana.' },
  { n: '1.569', t: 'Códigos explicados', d: 'Perfil V3 código por código: qué te pueden preguntar de cada uno.' },
  { n: '1.144', t: 'Imágenes en 19 atlas', d: 'Un atlas comentado por especialidad: lo que hay que reconocer en cada foto.' },
];

// Carrusel grande de la biblioteca (planes): mezcla de tomos, repasos, libros gordos, atlas, reconstrucciones y código por código
const ESP = ['cardiologia', 'pediatria', 'cirugia', 'obstetricia', 'neurologia', 'infectologia', 'ginecologia', 'nefrologia']
const mix = []
ESP.forEach((e, i) => {
  mix.push(TOMOS[i * 2 % TOMOS.length].cover, `/tienda/repaso_${e}.jpg`, `/tienda/gordo_${e}.jpg`, `/tienda/atlas_${e}.jpg`)
  if (i % 2 === 0) mix.push(['/tienda/rec_JUL2025.jpg', '/tienda/rec_DIC2024.jpg', '/tienda/rec_JUL2024.jpg', '/tienda/rec_DIC2025.jpg'][i / 2])
  if (i === 3) mix.push(`/tienda/perfil_${e}.jpg`)
})
export const LIB_COVERS_ALL = [...new Set(mix)]

// Cuántos libros trae la biblioteca: 21 tomos + 21 Repaso Final + 23 Libros Gordos + 19 atlas + Gran Libro de Reconstrucciones + Perfil V3
export const LIB_BOOK_COUNT = 21 + 21 + 23 + 19 + 1 + 1
