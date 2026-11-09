// Imagen de cada especialidad (public/img/especialidades/<slug>.jpg), un mismo estilo para todas.
const RULES = [
  ['cardiolog', 'cardiologia'],
  ['diabet', 'diabetes'],
  ['endocrin', 'endocrinologia'],
  ['gastro', 'gastroenterologia'],
  ['hemat', 'hematologia'],
  ['infecto', 'infectologia'], ['infeccios', 'infectologia'],
  ['nefro', 'nefrologia'],
  ['neuro', 'neurologia'], ['geriatr', 'neurologia'],
  ['respirat', 'respiratorio'], ['neumo', 'respiratorio'],
  ['reumato', 'reumatologia'],
  ['trauma', 'traumatologia'],
  ['urolog', 'urologia'],
  ['otorrino', 'otorrinolaringologia'],
  ['oftalmo', 'oftalmologia'],
  ['dermato', 'dermatologia'],
  ['psiquiat', 'psiquiatria'],
  ['pediatr', 'pediatria'],
  ['obstetricia y gine', 'ginecologia'],
  ['obstetric', 'obstetricia'],
  ['ginecolog', 'ginecologia'],
  ['salud publica', 'salud-publica'],
  ['cirug', 'cirugia'], ['anestes', 'cirugia'],
]

const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export function specialtyImage(name) {
  const n = norm(name)
  const hit = RULES.find(([k]) => n.includes(k))
  return hit ? `/img/especialidades/${hit[1]}.jpg` : null
}
