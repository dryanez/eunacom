// EUNACOM simulacro blueprint: how many of the 180 questions come from each
// area, and which questionDB `topic` values belong to each area.
// Note: `category` in questionDB only holds 'Módulo 1/2/3'; the specialty is in `topic`.

export const SIMULATION_BLUEPRINT = [
    {
        name: 'Medicina Interna', qty: 54, percent: 30, color: '#38bdf8',
        topics: [
            'Medicina Interna', 'Cardiología', 'Endocrinología', 'Gastroenterología',
            'Nefrología', 'Neurología', 'Infectología', 'Hematología', 'Respiratorio',
            'Reumatología', 'Dermatología',
        ],
    },
    {
        name: 'Cirugía y Anestesia', qty: 27, percent: 15, color: '#34d399',
        topics: ['Cirugía y Anestesia', 'Traumatología', 'Urología', 'Otorrinolaringología', 'Oftalmología'],
    },
    {
        name: 'Pediatría', qty: 27, percent: 15, color: '#fbbf24',
        topics: ['Pediatría', 'Neonatología'],
    },
    {
        name: 'Ginecología y Obstetricia', qty: 27, percent: 15, color: '#c084fc',
        topics: ['Ginecología', 'Obstetricia'],
    },
    {
        name: 'Salud Pública y Psiquiatría', qty: 36, percent: 20, color: '#f87171',
        topics: ['Salud Pública', 'Psiquiatría'],
    },
    {
        name: 'Especialidades', qty: 9, percent: 5, color: '#94a3b8',
        topics: ['Especialidades'],
    },
]

// 'Pediatría y Ginecología' mixes both areas (roughly half each). Questions
// whose stem mentions a pediatric patient go to Pediatría, the rest to
// Ginecología y Obstetricia.
const MIXED_PEDS_GYN_TOPIC = 'Pediatría y Ginecología'
const PEDIATRIC_STEM = /\b(reci[eé]n nacid|lactante|preescolar|escolar|neonat|niñ[oa]s?\b|\d+\s*(d[ií]as|meses|semanas) de (vida|edad)|pediátric|prematur)/i

const AREA_BY_TOPIC = new Map(
    SIMULATION_BLUEPRINT.flatMap(area => area.topics.map(topic => [topic, area.name]))
)

// Returns the blueprint area name for a question, or null if it has none.
export function getSimulationArea(q) {
    if (!q?.topic) return null
    if (q.topic === MIXED_PEDS_GYN_TOPIC) {
        return PEDIATRIC_STEM.test(q.question || '') ? 'Pediatría' : 'Ginecología y Obstetricia'
    }
    return AREA_BY_TOPIC.get(q.topic) || null
}
