// Alumnos antiguos que siguen viendo las clases del Dr. Guevara (/clases-guevara)
// además de los admins. Agregar emails en minúscula.
export const GUEVARA_EMAILS = [
  'danni_cz@hotmail.com',
]

export const canSeeGuevara = (user, isAdmin) =>
  !!isAdmin?.() || GUEVARA_EMAILS.includes(String(user?.email || '').trim().toLowerCase())
