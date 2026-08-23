export const DOCTOR_CHARACTERS = [
  {
    id: 'dr_house',
    name: 'Dr. Gregory House',
    show: 'House M.D.',
    specialty: 'Diagnóstico & Nefrología',
    shortSpec: 'Diagnóstico',
    emoji: '🩺',
    image: '/avatars/dr_house.png',
    avatarBg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    quote: 'Todos mienten, pero la clínica no.'
  },
  {
    id: 'dr_yang',
    name: 'Dra. Cristina Yang',
    show: "Grey's Anatomy",
    specialty: 'Cirugía Cardiovascular',
    shortSpec: 'Cardiovascular',
    emoji: '❤️',
    image: '/avatars/dr_yang.png',
    avatarBg: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
    quote: 'Precisión y mente fría.'
  },
  {
    id: 'dr_murphy',
    name: 'Dr. Shaun Murphy',
    show: 'The Good Doctor',
    specialty: 'Cirugía Pediátrica',
    shortSpec: 'Pediatría',
    emoji: '🧩',
    image: '/avatars/dr_murphy.png',
    avatarBg: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    quote: 'Pensamiento lateral y detalle.'
  },
  {
    id: 'dr_shepherd',
    name: 'Dr. Derek Shepherd',
    show: "Grey's Anatomy",
    specialty: 'Neurocirugía',
    shortSpec: 'Neurocirugía',
    emoji: '⚡',
    image: '/avatars/dr_shepherd.png',
    avatarBg: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    quote: 'Un gran día para salvar vidas.'
  },
  {
    id: 'dr_grey',
    name: 'Dra. Meredith Grey',
    show: "Grey's Anatomy",
    specialty: 'Cirugía General',
    shortSpec: 'Cirugía General',
    emoji: '🩺',
    image: '/avatars/dr_grey.png',
    avatarBg: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
    quote: 'Resiliencia y criterio.'
  },
  {
    id: 'dr_cox',
    name: 'Dr. Perry Cox',
    show: 'Scrubs',
    specialty: 'Medicina Interna',
    shortSpec: 'Med. Interna',
    emoji: '🥼',
    image: '/avatars/dr_cox.png',
    avatarBg: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
    quote: 'Rigor clínico sin rodeos.'
  },
  {
    id: 'dr_dorian',
    name: 'Dr. John Dorian',
    show: 'Scrubs',
    specialty: 'Medicina Interna',
    shortSpec: 'Med. Interna',
    emoji: '🩺',
    image: '/avatars/dr_dorian.png',
    avatarBg: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
    quote: 'Empatía y escucha activa.'
  },
  {
    id: 'dr_strange',
    name: 'Dr. Stephen Strange',
    show: 'Marvel',
    specialty: 'Neurocirugía & Casos Complejos',
    shortSpec: 'Casos Complejos',
    emoji: '🔮',
    image: '/avatars/dr_strange.png',
    avatarBg: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    quote: 'Análisis multi-variable.'
  },
  {
    id: 'dr_adams',
    name: 'Dr. Patch Adams',
    show: 'Patch Adams',
    specialty: 'Medicina Familiar & Comunitaria',
    shortSpec: 'Med. Familiar',
    emoji: '🎈',
    image: '/avatars/dr_adams.png',
    avatarBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    quote: 'Vocación humana y trato digno.'
  },
  {
    id: 'dr_mccoy',
    name: 'Dr. Leonard McCoy',
    show: 'Star Trek',
    specialty: 'Urgencias & Triage',
    shortSpec: 'Urgencias',
    emoji: '🚀',
    image: '/avatars/dr_mccoy.png',
    avatarBg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    quote: 'Acción rápida en guardia.'
  }
]

export const getRandomDoctorAvatar = () => {
  const randomIndex = Math.floor(Math.random() * DOCTOR_CHARACTERS.length)
  return DOCTOR_CHARACTERS[randomIndex]
}

export const getDoctorAvatar = (userOrId) => {
  if (!userOrId) return DOCTOR_CHARACTERS[0]
  if (typeof userOrId === 'string') {
    const direct = DOCTOR_CHARACTERS.find(d => d.id === userOrId)
    if (direct) return direct
  }
  const charId = userOrId?.avatar_character
  if (charId) {
    const match = DOCTOR_CHARACTERS.find(d => d.id === charId)
    if (match) return match
  }
  // Deterministic avatar based on user seed
  const seed = String(userOrId?.user_id || userOrId?.id || userOrId?.email || userOrId?.first_name || userOrId || 'doctor')
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  const index = Math.abs(hash) % DOCTOR_CHARACTERS.length
  return DOCTOR_CHARACTERS[index]
}
