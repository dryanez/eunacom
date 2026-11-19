// Accesos pausados mientras PayPal resuelve un reclamo del usuario (pedido de Felipe, 17-nov-2026).
// skus: no vienen gratis con su plan (sí si los compra sueltos).
// blockApp: toda la app queda bloqueada (pantalla /acceso-pausado) hasta que pague payToUnlock.
// Para quitar la pausa: borrar la entrada y desplegar.
export const DISPUTE_HOLDS = {
  // 17-nov-2026: PayPal resolvió a nuestro favor → acceso devuelto; solo el aviso de karma al iniciar cada test
  '661c6130-8873-46d9-997e-306e2b1bb582': { caseId: 'PP-R-QBZ-651632965', skus: [], karma: true },
}
export const holdFor = (userId) => (userId && DISPUTE_HOLDS[userId]) || null
export const heldSkus = (userId) => holdFor(userId)?.skus || []
export const isHeld = (userId, sku) => heldSkus(userId).includes(sku)
// Rutas que siguen abiertas para poder pagar
export const HOLD_OPEN_PATHS = ['/acceso-pausado', '/biblioteca', '/login']
