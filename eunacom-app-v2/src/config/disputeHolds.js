// Accesos pausados mientras PayPal resuelve un reclamo del usuario (pedido de Felipe, 17-nov-2026).
// Mientras el user_id esté aquí, los SKUs listados NO vienen gratis con su plan (sí si los compra sueltos).
// Para quitar la pausa: borrar la entrada y desplegar.
export const DISPUTE_HOLDS = {
  '661c6130-8873-46d9-997e-306e2b1bb582': { caseId: 'PP-R-QBZ-651632965', skus: ['rec-JUL2026'] },
}
export const heldSkus = (userId) => (userId && DISPUTE_HOLDS[userId]?.skus) || []
export const isHeld = (userId, sku) => heldSkus(userId).includes(sku)
