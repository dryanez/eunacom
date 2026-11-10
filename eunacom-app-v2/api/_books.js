// Compras de libros (tienda en /biblioteca). Se monta dentro de /api/user-profiles (Vercel ya
// está en el límite de funciones). Tablas: book_orders (carro pagado con Webpay) y
// book_purchases (una fila por producto comprado; de aquí sale el acceso y el crédito de upgrade).
import { verifyPlayBook, acknowledgePlayPurchase } from './_play-billing.js'
import { PRODUCTS, APP_PLANS, LIBRARY_MIN_PLAN_MONTHS, LIBRARY_ITEMS, UPGRADE_CREDIT_DAYS, cartTotal, expandSkus, itemFiles, usdPrice } from './_tienda.js'

const ADMIN_EMAIL = 'dr.felipeyanez@gmail.com'

export async function ensureBookTables(db) {
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS book_purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      email TEXT,
      sku TEXT NOT NULL,
      amount INTEGER DEFAULT 0,
      method TEXT,
      ref TEXT,
      note TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      credited_at TEXT,
      credited_ref TEXT
    )`, args: []
  })
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS book_orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      skus TEXT NOT NULL,
      amount INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_ref TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      paid_at TEXT
    )`, args: []
  })
}

function planIncludesLibrary(profile) {
  if (!profile || Number(profile.is_premium) !== 1) return false
  if (profile.premium_until && new Date(profile.premium_until) <= new Date()) return false
  return Number(profile.plan_months || 0) >= LIBRARY_MIN_PLAN_MONTHS
}

// Lo pagado en libros en los últimos N días que aún no se descontó de un plan
export async function getUpgradeCredit(db, userId) {
  await ensureBookTables(db)
  const r = await db.execute({
    sql: `SELECT COALESCE(SUM(amount), 0) AS total, MIN(created_at) AS first FROM book_purchases
          WHERE user_id = ? AND credited_at IS NULL AND amount > 0
            AND datetime(created_at) >= datetime('now', ?)`,
    args: [userId, `-${UPGRADE_CREDIT_DAYS} days`]
  })
  const amount = Number(r.rows?.[0]?.total || 0)
  const first = r.rows?.[0]?.first
  const until = amount && first ? new Date(new Date(first.replace(' ', 'T') + 'Z').getTime() + UPGRADE_CREDIT_DAYS * 864e5).toISOString() : null
  return { amount, until }
}

export async function markCreditUsed(db, userId, ref) {
  await ensureBookTables(db)
  await db.execute({
    sql: `UPDATE book_purchases SET credited_at = datetime('now'), credited_ref = ?
          WHERE user_id = ? AND credited_at IS NULL AND amount > 0 AND datetime(created_at) >= datetime('now', ?)`,
    args: [ref, userId, `-${UPGRADE_CREDIT_DAYS} days`]
  })
}

async function ownedSkus(db, userId) {
  const r = await db.execute({ sql: `SELECT DISTINCT sku FROM book_purchases WHERE user_id = ?`, args: [userId] })
  return r.rows.map(x => x.sku)
}

export async function getUserBooks(db, userId) {
  await ensureBookTables(db)
  const [skus, profile, credit] = await Promise.all([
    ownedSkus(db, userId),
    db.execute({ sql: `SELECT is_premium, premium_until, plan_months FROM user_profiles WHERE id = ?`, args: [userId] })
      .then(r => r.rows?.[0] || null).catch(() => null),
    getUpgradeCredit(db, userId),
  ])
  return { skus, planLibrary: planIncludesLibrary(profile), planMonths: Number(profile?.plan_months || 0), credit }
}

async function insertPurchases(db, { userId, email, skus, method, ref, note, amounts }) {
  for (const sku of skus) {
    await db.execute({
      sql: `INSERT INTO book_purchases (user_id, email, sku, amount, method, ref, note) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [userId, email || null, sku, amounts?.[sku] ?? PRODUCTS[sku]?.price ?? 0, method, ref || null, note || null]
    })
  }
}

// Webhook de Mercado Pago aprobado para un carro de libros. Idempotente.
export async function fulfillBookOrder(db, orderId, paymentRef) {
  await ensureBookTables(db)
  const upd = await db.execute({
    sql: `UPDATE book_orders SET status = 'paid', paid_at = datetime('now'), payment_ref = ? WHERE id = ? AND status != 'paid'`,
    args: [paymentRef, orderId]
  })
  if (!upd.rowsAffected) return false
  const o = (await db.execute({ sql: `SELECT * FROM book_orders WHERE id = ?`, args: [orderId] })).rows[0]
  const email = (await db.execute({ sql: `SELECT email FROM user_profiles WHERE id = ?`, args: [o.user_id] }).catch(() => ({ rows: [] }))).rows?.[0]?.email
  await insertPurchases(db, { userId: o.user_id, email, skus: JSON.parse(o.skus), method: 'webpay', ref: paymentRef })
  return true
}

const isAdmin = email => String(email || '').trim().toLowerCase() === ADMIN_EMAIL

// Crea la orden del carro (sin lo que el usuario ya tiene). null si no queda nada que cobrar.
async function createBookOrder(db, userId, rawSkus) {
  const skus = [...new Set((rawSkus || []).filter(s => PRODUCTS[s]))]
  if (!userId || !skus.length) return { error: 'Carro vacío o inválido' }
  await ensureBookTables(db)
  const owned = new Set(await ownedSkus(db, userId))
  const toBuy = skus.filter(s => !owned.has(s))
  if (!toBuy.length) return { error: 'Ya tienes estos libros' }
  const amount = cartTotal(toBuy)
  const orderId = `bk_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
  await db.execute({
    sql: `INSERT INTO book_orders (id, user_id, skus, amount) VALUES (?, ?, ?, ?)`,
    args: [orderId, userId, JSON.stringify(toBuy), amount]
  })
  const title = toBuy.length === 1 ? `Libros EUNACOM - ${PRODUCTS[toBuy[0]].name}` : `Libros EUNACOM - ${toBuy.length} productos`
  const usd = toBuy.reduce((a, s) => a + usdPrice(PRODUCTS[s].price), 0).toFixed(2)
  return { orderId, toBuy, amount, usd, title }
}

// Lo que este usuario puede leer (comprado o incluido en su plan; admin todo)
async function readableItems(db, userId, extraAdminIds = []) {
  const { skus, planLibrary } = await getUserBooks(db, userId)
  const email = (await db.execute({ sql: `SELECT email FROM user_profiles WHERE id = ?`, args: [userId] }).catch(() => ({ rows: [] }))).rows?.[0]?.email
  if (planLibrary || isAdmin(email) || extraAdminIds.includes(userId)) return new Set(LIBRARY_ITEMS)
  return expandSkus(skus)
}

// Devuelve true si atendió la request. Opciones (las inyecta user-profiles.js o el dev server):
//   createPreference(db, { userId, title, amount, externalReference }) → init_point de Mercado Pago
//   paypalOrder({ userId, orderId, title, usd }) → approve_url de PayPal (USD; ahí también Apple Pay / Google Pay)
//   paypalCapture(paypalOrderId) → { status, customId, id }
//   signFile(path) → URL temporal del PDF (lector en línea)
export async function handleBooks(db, req, res, opts = {}) {
  const q = req.query || {}
  const b = req.body || {}

  if (req.method === 'GET' && q.action === 'books') {
    if (!q.userId) { res.status(400).json({ error: 'userId required' }); return true }
    res.json(await getUserBooks(db, q.userId))
    return true
  }

  if (req.method === 'GET' && q.action === 'book_purchases') {
    if (!isAdmin(q.adminEmail)) { res.status(403).json({ error: 'Unauthorized' }); return true }
    await ensureBookTables(db)
    const r = await db.execute({
      sql: `SELECT p.*, u.is_premium, u.plan_months, u.premium_until,
              CASE WHEN p.credited_at IS NULL AND p.amount > 0 AND datetime(p.created_at) >= datetime('now', ?) THEN 1 ELSE 0 END AS credit_open
            FROM book_purchases p LEFT JOIN user_profiles u ON u.id = p.user_id
            ORDER BY p.created_at DESC LIMIT 300`,
      args: [`-${UPGRADE_CREDIT_DAYS} days`]
    })
    res.json({ purchases: r.rows })
    return true
  }

  // Lector en línea: URL temporal del PDF solo si el usuario tiene el ítem
  if (req.method === 'GET' && q.action === 'book_read') {
    const files = itemFiles(q.item)
    const f = files[Number(q.file || 0)]
    if (!q.userId || !f) { res.status(400).json({ error: 'Libro no disponible' }); return true }
    const items = await readableItems(db, q.userId, opts.extraAdminIds)
    if (!items.has(q.item)) { res.status(403).json({ error: 'No tienes este libro' }); return true }
    if (!opts.signFile) { res.status(503).json({ error: 'Lector no configurado' }); return true }
    // Modo celular: el mismo libro en texto adaptable (JSON en libros/movil/…, solo manuales)
    const movil = q.mode === 'movil'
    if (movil && !/^01_Tomos\/.+\.pdf$/.test(f.file)) { res.status(404).json({ error: 'Este libro aún no tiene modo celular' }); return true }
    const url = await opts.signFile(movil ? `movil/${f.file.replace(/\.pdf$/, '.json')}` : f.file)
    if (!url) { res.status(500).json({ error: 'No se pudo abrir el libro' }); return true }
    res.json({ url, files: files.map(x => x.label) })
    return true
  }

  if (req.method !== 'POST') return false

  if (b.action === 'book_paypal_order') {
    const o = await createBookOrder(db, b.userId, b.skus)
    if (o.error) { res.status(400).json({ error: o.error }); return true }
    if (!opts.paypalOrder) { res.status(503).json({ error: 'PayPal no disponible' }); return true }
    const approve_url = await opts.paypalOrder({ userId: b.userId, orderId: o.orderId, title: o.title, usd: o.usd, db })
    if (!approve_url) { res.status(502).json({ error: 'Error creando la orden PayPal' }); return true }
    res.json({ approve_url, order_id: o.orderId, usd: o.usd })
    return true
  }

  if (b.action === 'book_paypal_capture') {
    if (!b.userId || !b.paypalOrderId || !opts.paypalCapture) { res.status(400).json({ error: 'Missing parameters' }); return true }
    const r = await opts.paypalCapture(b.paypalOrderId)
    const [orderUser, kind, orderId] = String(r?.customId || '').split('|')
    if (r?.status !== 'COMPLETED' || orderUser !== b.userId || kind !== 'books') {
      res.status(400).json({ error: 'Pago PayPal no completado', status: r?.status }); return true
    }
    await fulfillBookOrder(db, orderId, `paypal:${r.id}`)
    res.json({ success: true })
    return true
  }

  // Android app: one book/pack bought through Google Play (one-time product, stays owned)
  if (b.action === 'book_play_purchase') {
    const { userId, productId, purchaseToken } = b
    if (!userId || !productId || !purchaseToken) { res.status(400).json({ error: 'Missing parameters' }); return true }
    const v = await verifyPlayBook({ userId, productId, purchaseToken, products: PRODUCTS })
    if (!v.ok) { res.status(v.status).json({ error: v.error }); return true }
    await ensureBookTables(db)
    const ref = `play:${v.orderId}`
    const seen = await db.execute({ sql: `SELECT 1 FROM book_purchases WHERE ref = ? LIMIT 1`, args: [ref] })
    if (!seen.rows.length) {
      const email = (await db.execute({ sql: `SELECT email FROM user_profiles WHERE id = ?`, args: [userId] }).catch(() => ({ rows: [] }))).rows?.[0]?.email
      await insertPurchases(db, { userId, email, skus: [v.sku], method: 'play', ref })
    }
    if (!v.acknowledged) await acknowledgePlayPurchase({ productId, purchaseToken }).catch(e => console.error('[Play] acknowledge failed', e))
    res.json({ success: true, sku: v.sku, already_processed: !!seen.rows.length })
    return true
  }

  if (b.action === 'book_checkout') {
    const { userId } = b
    const o = await createBookOrder(db, userId, b.skus)
    if (o.error) { res.status(400).json({ error: o.error }); return true }
    const { orderId, amount, title } = o
    if (!opts.createPreference) { res.status(503).json({ error: 'Webpay no disponible' }); return true }
    const init_point = await opts.createPreference(db, { userId, title, amount, externalReference: `${userId}|books|${orderId}`, orderId })
    if (!init_point) { res.status(500).json({ error: 'Error creando el pago' }); return true }
    res.json({ init_point, order_id: orderId, amount })
    return true
  }

  // Admin: registrar una compra pagada por transferencia/PayPal (o regalo)
  if (b.action === 'book_grant') {
    if (!isAdmin(b.adminEmail)) { res.status(403).json({ error: 'Unauthorized' }); return true }
    const skus = (b.skus || []).filter(s => PRODUCTS[s])
    if (!skus.length) { res.status(400).json({ error: 'SKU inválido' }); return true }
    await ensureBookTables(db)
    let userId = b.userId, email = b.email
    if (!userId && email) {
      const u = await db.execute({ sql: `SELECT id, email FROM user_profiles WHERE LOWER(email) = LOWER(?) LIMIT 1`, args: [email.trim()] })
      userId = u.rows?.[0]?.id
    }
    if (!userId) { res.status(404).json({ error: 'Usuario no encontrado (debe tener cuenta en la app)' }); return true }
    const method = ['transferencia', 'paypal', 'regalo', 'webpay'].includes(b.method) ? b.method : 'transferencia'
    // amount opcional: total pagado → se reparte por producto; regalo = 0 (no genera crédito)
    const amounts = {}
    const paid = method === 'regalo' ? 0 : (b.amount != null && b.amount !== '' ? Number(b.amount) : cartTotal(skus))
    const list = cartTotal(skus) || 1
    skus.forEach(s => (amounts[s] = Math.round(paid * (PRODUCTS[s].price / list))))
    await insertPurchases(db, { userId, email, skus, method, ref: b.ref, note: b.note, amounts })
    res.json({ success: true, userId })
    return true
  }

  // Admin: marcar el crédito de upgrade como usado (p. ej. plan pagado por transferencia con descuento)
  if (b.action === 'book_credit_used') {
    if (!isAdmin(b.adminEmail)) { res.status(403).json({ error: 'Unauthorized' }); return true }
    await markCreditUsed(db, b.userId, b.ref || 'admin')
    res.json({ success: true })
    return true
  }

  return false
}

export const PLAN_BY_ID = Object.fromEntries(APP_PLANS.map(p => [p.id, p]))
