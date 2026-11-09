import { HeartPulse, Utensils, Wind, Baby, Flower2, FlaskConical, Stethoscope } from 'lucide-react'

// Iconos lucide por especialidad (reemplazan los emojis de los datos en la UI)
export const MODULE_ICONS = {
  cardiologia: HeartPulse,
  gastroenterologia: Utensils,
  respiratorio: Wind,
  pediatria: Baby,
  ginecologia: Flower2,
  nefrologia: FlaskConical
}

export const getModuleIcon = (id) => MODULE_ICONS[id] || Stethoscope
